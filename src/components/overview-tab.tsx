"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Shield, Calendar, X, CreditCard, AlertTriangle } from "lucide-react";
import { Transaction, MonthStatus, getCategoryById, CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/currency";

type OverviewTabProps = {
  transactions: Transaction[]; // All transactions
  monthStatuses: MonthStatus[]; // Month processing statuses
  totalDebt: number; // All-time debt
  onCloseMonth: (month: string, remaining: number) => void;
  currency: CurrencyCode;
};

export function OverviewTab({ transactions, monthStatuses, totalDebt, onCloseMonth, currency }: OverviewTabProps) {
  // Default to current month
  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  // Get available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    // Always include current month even if no transactions
    months.add(getCurrentMonthKey());
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Calculate overview from filtered transactions
  const overview = useMemo(() => {
    const result = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSaved: 0, // All savings for display
      manualSaved: 0, // Manual savings only
      autoSaved: 0, // Auto-saved at month end
      debtPayments: 0, // Debt payments
    };

    monthTransactions.forEach((t) => {
      if (t.type === "income") {
        result.totalIncome += t.amount;
      } else if (t.type === "savings") {
        result.totalSaved += t.amount;
        // Check if auto-saved (either by is_auto flag or savings_type)
        if (t.is_auto || t.savings_type === "auto") {
          result.autoSaved += t.amount;
        } else {
          result.manualSaved += t.amount;
        }
      } else if (t.type === "debt_payment") {
        result.debtPayments += t.amount;
      } else if (t.type === "expense") {
        result.totalExpenses += t.amount;
      }
    });

    return result;
  }, [monthTransactions]);

  // New formula: Manual savings don't affect Remaining
  // Remaining = Income - Expenses - Debt Payments - Auto Savings
  const remaining = overview.totalIncome - overview.totalExpenses - overview.debtPayments - overview.autoSaved;

  // Check if selected month is processed
  const isMonthProcessed = useMemo(() => {
    const status = monthStatuses.find(ms => ms.month === selectedMonth);
    return status?.processed_at !== null && status?.processed_at !== undefined;
  }, [monthStatuses, selectedMonth]);

  // Calculate cumulative savings and emergency fund (all-time)
  const cumulativeTotals = transactions.reduce(
    (acc, t) => {
      // Add deposits to savings
      if (t.type === "savings" && t.category_id === "savings") {
        acc.totalSavings += t.amount;
        // Track by subcategory
        const sub = t.subcategory || "General";
        acc.savingsBySubcategory[sub] = (acc.savingsBySubcategory[sub] || 0) + t.amount;
      }
      // Add deposits to emergency fund
      if (t.type === "savings" && t.category_id === "emergency_fund") {
        acc.totalEmergencyFund += t.amount;
      }
      // Subtract withdrawals from savings
      if (t.type === "expense" && t.funded_from === "savings") {
        acc.totalSavings -= t.amount;
      }
      // Subtract withdrawals from emergency fund
      if (t.type === "expense" && t.funded_from === "emergency_fund") {
        acc.totalEmergencyFund -= t.amount;
      }
      return acc;
    },
    { totalSavings: 0, totalEmergencyFund: 0, savingsBySubcategory: {} as Record<string, number> }
  );

  // Calculate spending by category for visualization
  const expensesByCategory = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category_id] = (acc[t.category_id] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedExpenses = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxExpense = sortedExpenses[0]?.[1] || 1;

  // Recent transactions (last 5 for selected month)
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedMonth !== getCurrentMonthKey() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedMonth(getCurrentMonthKey())}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Monthly Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-income-muted border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-income mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-2xl font-bold text-income">
              {formatCurrency(overview.totalIncome, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-expense-muted border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-expense mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Spent</span>
            </div>
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(overview.totalExpenses, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-savings-muted border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-savings mb-1">
              <PiggyBank className="h-4 w-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
            <p className="text-2xl font-bold text-savings">
              {formatCurrency(overview.totalSaved, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-secondary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">Remaining</span>
            </div>
            <p className={`text-2xl font-bold ${remaining >= 0 ? "text-foreground" : "text-expense"}`}>
              {formatCurrency(remaining, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Close Month Banner - Only for unprocessed past months */}
      {selectedMonth < getCurrentMonthKey() && !isMonthProcessed && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Month not closed</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {remaining >= 0
                    ? `${formatCurrency(remaining, currency)} will be auto-saved`
                    : `${formatCurrency(Math.abs(remaining), currency)} will become debt`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white ml-3 flex-shrink-0"
                onClick={() => onCloseMonth(selectedMonth, remaining)}
              >
                Close Month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cumulative Totals - All Time */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-savings/30 bg-savings/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-savings mb-1">
              <PiggyBank className="h-4 w-4" />
              <span className="text-sm font-medium">Total Savings</span>
            </div>
            <p className="text-2xl font-bold text-savings">
              {formatCurrency(cumulativeTotals.totalSavings, currency)}
            </p>
            {Object.entries(cumulativeTotals.savingsBySubcategory).filter(([, amt]) => amt > 0).length > 0 && (
              <div className="mt-2 space-y-0.5">
                {Object.entries(cumulativeTotals.savingsBySubcategory)
                  .filter(([, amt]) => amt > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sub, amt]) => (
                    <div key={sub} className="flex justify-between text-xs text-muted-foreground">
                      <span>{sub}</span>
                      <span>{formatCurrency(amt, currency)}</span>
                    </div>
                  ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">All-time</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Emergency Fund</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">
              {formatCurrency(cumulativeTotals.totalEmergencyFund, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Total Debt Card - Only shown if debt > 0 */}
      {totalDebt > 0 && (
        <Card className="border border-expense/30 bg-expense/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-expense mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Total Debt</span>
            </div>
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(totalDebt, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Carried over from past months</p>
          </CardContent>
        </Card>
      )}

      {/* Top Spending Categories */}
      {sortedExpenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Spending</h3>
            <div className="space-y-3">
              {sortedExpenses.map(([categoryId, amount]) => {
                const category = getCategoryById(categoryId);
                if (!category) return null;
                const percentage = (amount / maxExpense) * 100;
                return (
                  <div key={categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </span>
                      <span className="font-medium">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-expense rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No transactions yet. Add your first one!
            </p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => {
                const category = getCategoryById(transaction.category_id);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category?.emoji || "📝"}</span>
                      <div>
                        <p className="text-sm font-medium">{category?.name || "Unknown"}</p>
                        {(transaction.subcategory || transaction.note) && (
                          <p className="text-xs text-muted-foreground">
                            {[transaction.subcategory, transaction.note].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {transaction.is_auto && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Auto</span>
                      )}
                      <span
                        className={`font-medium ${
                          transaction.type === "income"
                            ? "text-income"
                            : transaction.type === "savings"
                            ? "text-savings"
                            : transaction.type === "debt_payment"
                            ? "text-amber-500"
                            : "text-expense"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
