"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { OverviewTab } from "@/components/overview-tab";
import { AddTransactionTab } from "@/components/add-transaction-tab";
import { HistoryTab } from "@/components/history-tab";
import { InsightsTab } from "@/components/insights-tab";
import { SettingsTab } from "@/components/settings-tab";
import { Transaction, Preset, MonthStatus, getCategoryById, CurrencyCode, DEFAULT_CURRENCY } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Tab = "overview" | "add" | "history" | "insights" | "settings";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [monthStatuses, setMonthStatuses] = useState<MonthStatus[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const supabase = createClient();

  // Load user and data on mount
  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoaded(true);
        return;
      }
      setUserId(user.id);

      // Load currency preference from user metadata
      const userCurrency = user.user_metadata?.currency as CurrencyCode | undefined;
      if (userCurrency) {
        setCurrency(userCurrency);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("st_transactions")
        .select("*")
        .order("date", { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        toast.error("Failed to load transactions");
      } else {
        setTransactions(transactionsData || []);
      }

      // Fetch presets
      const { data: presetsData, error: presetsError } = await supabase
        .from("st_presets")
        .select("*")
        .order("created_at", { ascending: false });

      if (presetsError) {
        console.error("Error fetching presets:", presetsError);
      } else {
        setPresets(presetsData || []);
      }

      // Fetch month statuses
      const { data: monthStatusesData, error: monthStatusesError } = await supabase
        .from("st_month_status")
        .select("*")
        .order("month", { ascending: false });

      if (monthStatusesError) {
        console.error("Error fetching month statuses:", monthStatusesError);
      } else {
        setMonthStatuses(monthStatusesData || []);
      }

      setIsLoaded(true);
    };

    loadData();
  }, [supabase]);

  const handleAddTransaction = useCallback(async (
    newTransaction: Omit<Transaction, "id" | "created_at" | "user_id">
  ) => {
    if (!userId) return;

    // Optimistically add to local state
    const tempId = crypto.randomUUID();
    const optimisticTransaction: Transaction = {
      ...newTransaction,
      id: tempId,
      created_at: new Date().toISOString(),
      user_id: userId,
    };
    setTransactions((prev) => [optimisticTransaction, ...prev]);
    setActiveTab("overview");

    // Show toast
    const category = getCategoryById(newTransaction.category_id);
    const amountFormatted = formatCurrency(newTransaction.amount, currency);
    toast.success(`${category?.emoji || ""} ${amountFormatted} added`, {
      description: category?.name || "Transaction recorded",
    });

    // Save to Supabase
    const { data, error } = await supabase
      .from("st_transactions")
      .insert({
        user_id: userId,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category_id: newTransaction.category_id,
        subcategory: newTransaction.subcategory,
        note: newTransaction.note,
        date: newTransaction.date,
        funded_from: newTransaction.funded_from,
        is_auto: newTransaction.is_auto,
        savings_type: newTransaction.savings_type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction");
      // Rollback
      setTransactions((prev) => prev.filter((t) => t.id !== tempId));
    } else if (data) {
      // Replace temp with real data
      setTransactions((prev) =>
        prev.map((t) => (t.id === tempId ? data : t))
      );
    }
  }, [userId, supabase]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    const category = transaction ? getCategoryById(transaction.category_id) : null;

    // Optimistically remove
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted", {
      description: category ? `${category.emoji} ${category.name}` : "Removed from history",
    });

    // Delete from Supabase
    const { error } = await supabase
      .from("st_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
      // Rollback
      if (transaction) {
        setTransactions((prev) => [...prev, transaction]);
      }
    }
  }, [transactions, supabase]);

  const handlePresetsChange = useCallback(async (newPresets: Preset[]) => {
    if (!userId) return;

    const oldPresets = presets;
    setPresets(newPresets);

    // Determine what changed
    const oldIds = new Set(oldPresets.map((p) => p.id));
    const newIds = new Set(newPresets.map((p) => p.id));

    // Find added/updated presets
    for (const preset of newPresets) {
      if (!oldIds.has(preset.id)) {
        // New preset
        const { error } = await supabase
          .from("st_presets")
          .insert({
            id: preset.id,
            user_id: userId,
            name: preset.name,
            amount: preset.amount,
            category_id: preset.category_id,
            subcategory: preset.subcategory,
            note: preset.note,
            funded_from: preset.funded_from,
          });

        if (error) {
          console.error("Error adding preset:", error);
          toast.error("Failed to save preset");
          setPresets(oldPresets);
          return;
        }
      } else {
        // Check if updated
        const oldPreset = oldPresets.find((p) => p.id === preset.id);
        if (oldPreset && JSON.stringify(oldPreset) !== JSON.stringify(preset)) {
          const { error } = await supabase
            .from("st_presets")
            .update({
              name: preset.name,
              amount: preset.amount,
              category_id: preset.category_id,
              subcategory: preset.subcategory,
              note: preset.note,
              funded_from: preset.funded_from,
            })
            .eq("id", preset.id);

          if (error) {
            console.error("Error updating preset:", error);
            toast.error("Failed to update preset");
            setPresets(oldPresets);
            return;
          }
        }
      }
    }

    // Find deleted presets
    for (const oldPreset of oldPresets) {
      if (!newIds.has(oldPreset.id)) {
        const { error } = await supabase
          .from("st_presets")
          .delete()
          .eq("id", oldPreset.id);

        if (error) {
          console.error("Error deleting preset:", error);
          toast.error("Failed to delete preset");
          setPresets(oldPresets);
          return;
        }
      }
    }
  }, [userId, presets, supabase]);

  const handleCurrencyChange = useCallback(async (newCurrency: CurrencyCode) => {
    const oldCurrency = currency;
    setCurrency(newCurrency); // Optimistic update

    const { error } = await supabase.auth.updateUser({
      data: { currency: newCurrency },
    });

    if (error) {
      console.error("Error updating currency:", error);
      toast.error("Failed to update currency");
      setCurrency(oldCurrency); // Rollback
    }
  }, [currency, supabase]);

  // Calculate total debt (all-time)
  const totalDebt = useMemo(() => {
    const debtFromMonthStatuses = monthStatuses.reduce((sum, ms) => sum + (ms.debt_amount || 0), 0);
    const debtPayments = transactions
      .filter(t => t.type === "debt_payment")
      .reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, debtFromMonthStatuses - debtPayments);
  }, [monthStatuses, transactions]);

  // Helper to get last day of a month
  const getLastDayOfMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  };

  // Helper to format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleCloseMonth = useCallback(async (month: string, remaining: number) => {
    if (!userId) return;

    try {
      if (remaining > 0) {
        // Create auto-savings transaction
        const autoSavingsTransaction = {
          user_id: userId,
          amount: remaining,
          type: "savings" as const,
          category_id: "savings",
          subcategory: "Auto-Saved",
          note: `Auto-saved from ${formatMonth(month)}`,
          date: getLastDayOfMonth(month),
          is_auto: true,
          savings_type: "auto" as const,
        };

        const { data: newTransaction, error: transactionError } = await supabase
          .from("st_transactions")
          .insert(autoSavingsTransaction)
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Update local transactions state
        if (newTransaction) {
          setTransactions(prev => [newTransaction, ...prev]);
        }

        // Create/update month status
        const { error: statusError } = await supabase
          .from("st_month_status")
          .upsert({
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: remaining,
            debt_amount: 0,
          }, { onConflict: "user_id,month" });

        if (statusError) throw statusError;

        // Update local month statuses
        setMonthStatuses(prev => {
          const existing = prev.find(ms => ms.month === month);
          if (existing) {
            return prev.map(ms => ms.month === month
              ? { ...ms, processed_at: new Date().toISOString(), auto_amount: remaining, debt_amount: 0 }
              : ms
            );
          }
          return [...prev, {
            id: crypto.randomUUID(),
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: remaining,
            debt_amount: 0,
          }];
        });

        toast.success(`${formatMonth(month)} closed`, {
          description: `${formatCurrency(remaining, currency)} auto-saved`,
        });
      } else if (remaining < 0) {
        // Record debt in month_status
        const debtAmount = Math.abs(remaining);

        const { error: statusError } = await supabase
          .from("st_month_status")
          .upsert({
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: 0,
            debt_amount: debtAmount,
          }, { onConflict: "user_id,month" });

        if (statusError) throw statusError;

        // Update local month statuses
        setMonthStatuses(prev => {
          const existing = prev.find(ms => ms.month === month);
          if (existing) {
            return prev.map(ms => ms.month === month
              ? { ...ms, processed_at: new Date().toISOString(), auto_amount: 0, debt_amount: debtAmount }
              : ms
            );
          }
          return [...prev, {
            id: crypto.randomUUID(),
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: 0,
            debt_amount: debtAmount,
          }];
        });

        toast.success(`${formatMonth(month)} closed`, {
          description: `${formatCurrency(debtAmount, currency)} added to debt`,
        });
      } else {
        // Remaining is exactly 0 - just mark as processed
        const { error: statusError } = await supabase
          .from("st_month_status")
          .upsert({
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: 0,
            debt_amount: 0,
          }, { onConflict: "user_id,month" });

        if (statusError) throw statusError;

        setMonthStatuses(prev => {
          const existing = prev.find(ms => ms.month === month);
          if (existing) {
            return prev.map(ms => ms.month === month
              ? { ...ms, processed_at: new Date().toISOString(), auto_amount: 0, debt_amount: 0 }
              : ms
            );
          }
          return [...prev, {
            id: crypto.randomUUID(),
            user_id: userId,
            month,
            processed_at: new Date().toISOString(),
            auto_amount: 0,
            debt_amount: 0,
          }];
        });

        toast.success(`${formatMonth(month)} closed`);
      }
    } catch (error) {
      console.error("Error closing month:", error);
      toast.error("Failed to close month");
    }
  }, [userId, supabase]);

  // Don't render until we've loaded
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-400 rounded-full animate-spin" />
          <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />

      {/* Main Content Container */}
      <div
        className={cn(
          "max-w-lg mx-auto",
          "px-4 pt-2 pb-24",
          "min-h-[calc(100vh-60px)]"
        )}
      >
        {/* Tab Content with fade transition */}
        <div className="relative">
          {activeTab === "overview" && (
            <div className="animate-in fade-in duration-200">
              <OverviewTab
                transactions={transactions}
                monthStatuses={monthStatuses}
                totalDebt={totalDebt}
                onCloseMonth={handleCloseMonth}
                currency={currency}
              />
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in duration-200">
              <AddTransactionTab
                onAddTransaction={handleAddTransaction}
                presets={presets}
                totalDebt={totalDebt}
                currency={currency}
              />
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-in fade-in duration-200">
              <HistoryTab
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                currency={currency}
              />
            </div>
          )}

          {activeTab === "insights" && (
            <div className="animate-in fade-in duration-200">
              <InsightsTab transactions={transactions} currency={currency} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-200">
              <SettingsTab presets={presets} onPresetsChange={handlePresetsChange} currency={currency} onCurrencyChange={handleCurrencyChange} />
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
