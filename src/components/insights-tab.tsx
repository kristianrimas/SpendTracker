"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Transaction, CATEGORIES, getCategoryById, Category } from "@/types";
import {
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InsightsTabProps = {
  transactions: Transaction[];
};

type MonthOption = {
  value: string; // "all" or "YYYY-MM"
  label: string;
  year?: number;
  month?: number;
};

type CategorySummary = {
  category: Category;
  total: number;
  count: number;
  transactions: Transaction[];
};

export function InsightsTab({ transactions }: InsightsTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategorySummary | null>(null);

  // Generate available months from transactions
  const monthOptions = useMemo(() => {
    const months = new Map<string, MonthOption>();

    // Add "All Time" option
    months.set("all", { value: "all", label: "All Time" });

    // Extract unique months from transactions
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      if (!months.has(key)) {
        const label = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        months.set(key, { value: key, label, year, month });
      }
    });

    // Sort by date descending (newest first), keeping "all" at top
    return Array.from(months.values()).sort((a, b) => {
      if (a.value === "all") return -1;
      if (b.value === "all") return 1;
      return b.value.localeCompare(a.value);
    });
  }, [transactions]);

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "all") return transactions;

    const [year, month] = selectedMonth.split("-").map(Number);
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }, [transactions, selectedMonth]);

  // Calculate totals for the selected period
  const periodTotals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") {
          acc.income += t.amount;
        } else if (t.type === "expense") {
          acc.expenses += t.amount;
        } else if (t.type === "savings") {
          acc.savings += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, savings: 0 }
    );
  }, [filteredTransactions]);

  // Calculate cumulative savings (all-time, accounting for withdrawals)
  const cumulativeSavings = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "savings" && t.category_id === "savings") {
          acc.savings += t.amount;
        }
        if (t.type === "savings" && t.category_id === "emergency_fund") {
          acc.emergencyFund += t.amount;
        }
        if (t.type === "expense" && t.funded_from === "savings") {
          acc.savings -= t.amount;
        }
        if (t.type === "expense" && t.funded_from === "emergency_fund") {
          acc.emergencyFund -= t.amount;
        }
        return acc;
      },
      { savings: 0, emergencyFund: 0 }
    );
  }, [transactions]);

  // Category breakdown for selected period
  const categorySummaries = useMemo(() => {
    const summaryMap = new Map<string, CategorySummary>();

    filteredTransactions.forEach((t) => {
      const category = getCategoryById(t.category_id);
      if (!category) return;

      if (!summaryMap.has(t.category_id)) {
        summaryMap.set(t.category_id, {
          category,
          total: 0,
          count: 0,
          transactions: [],
        });
      }

      const summary = summaryMap.get(t.category_id)!;
      summary.total += t.amount;
      summary.count += 1;
      summary.transactions.push(t);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // Group by type
  const incomeCategories = categorySummaries.filter((s) => s.category.type === "income");
  const expenseCategories = categorySummaries.filter((s) => s.category.type === "expense");
  const savingsCategories = categorySummaries.filter((s) => s.category.type === "savings");

  const selectedMonthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || "All Time";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderCategoryList = (
    summaries: CategorySummary[],
    colorClass: string,
    bgClass: string
  ) => {
    const maxValue = summaries[0]?.total || 1;

    return (
      <div className="space-y-3">
        {summaries.map((summary) => {
          const percentage = (summary.total / maxValue) * 100;
          return (
            <div
              key={summary.category.id}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(summary)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{summary.category.emoji}</span>
                  <span className="font-medium">{summary.category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({summary.count})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${colorClass}`}>
                    ${summary.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${bgClass} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Month Picker */}
        <Button
          variant="outline"
          className="w-full justify-between h-12 border-zinc-700"
          onClick={() => setMonthPickerOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{selectedMonthLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Period Summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-0 bg-income/10">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-income mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-sm font-bold text-income">
                ${periodTotals.income.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-expense/10">
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-4 w-4 text-expense mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-sm font-bold text-expense">
                ${periodTotals.expenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-savings/10">
            <CardContent className="p-3 text-center">
              <PiggyBank className="h-4 w-4 text-savings mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Saved</p>
              <p className="text-sm font-bold text-savings">
                ${periodTotals.savings.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cumulative Totals (All-Time) */}
        <Card className="border border-zinc-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Cumulative Totals (All-Time)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p className="text-lg font-bold text-savings">
                  ${cumulativeSavings.savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emergency Fund</p>
                <p className="text-lg font-bold text-amber-500">
                  ${cumulativeSavings.emergencyFund.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-center">
                No transactions for this period.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Income */}
            {incomeCategories.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
                    <span className="text-income font-semibold">
                      ${periodTotals.income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {renderCategoryList(incomeCategories, "text-income", "bg-income")}
                </CardContent>
              </Card>
            )}

            {/* Expenses */}
            {expenseCategories.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
                    <span className="text-expense font-semibold">
                      ${periodTotals.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {renderCategoryList(expenseCategories, "text-expense", "bg-expense")}
                </CardContent>
              </Card>
            )}

            {/* Savings */}
            {savingsCategories.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
                    <span className="text-savings font-semibold">
                      ${periodTotals.savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {renderCategoryList(savingsCategories, "text-savings", "bg-savings")}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Month Picker Sheet */}
      <Sheet open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
        <SheetContent side="bottom" showDragHandle className="max-h-[50vh]">
          <VisuallyHidden>
            <SheetTitle>Select Month</SheetTitle>
          </VisuallyHidden>
          <div className="px-4 pb-4">
            <h3 className="font-semibold mb-3">Select Period</h3>
            <div className="space-y-1 max-h-[35vh] overflow-y-auto">
              {monthOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedMonth === option.value ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11",
                    selectedMonth === option.value && "bg-zinc-700"
                  )}
                  onClick={() => {
                    setSelectedMonth(option.value);
                    setMonthPickerOpen(false);
                  }}
                >
                  {option.value === "all" && (
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Category Detail Sheet */}
      <Sheet open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <SheetContent
          side="bottom"
          showDragHandle
          className="max-h-[60vh] min-h-[200px]"
        >
          <VisuallyHidden>
            <SheetTitle>
              {selectedCategory?.category.name || "Category"} Details
            </SheetTitle>
          </VisuallyHidden>

          {selectedCategory && (
            <div className="flex flex-col h-full px-4 pb-4">
              {/* Header */}
              <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCategory.category.emoji}</span>
                  <span className="text-lg font-semibold">{selectedCategory.category.name}</span>
                </div>
                <span
                  className={`text-xl font-bold ${
                    selectedCategory.category.type === "income"
                      ? "text-income"
                      : selectedCategory.category.type === "savings"
                      ? "text-savings"
                      : "text-expense"
                  }`}
                >
                  ${selectedCategory.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Transaction list */}
              <div className="flex-1 overflow-y-auto mt-2 -mx-1 px-1">
                {selectedCategory.transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-medium text-sm truncate">
                          {t.subcategory || t.note || "Transaction"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(t.date)}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-sm flex-shrink-0 ${
                          selectedCategory.category.type === "income"
                            ? "text-income"
                            : selectedCategory.category.type === "savings"
                            ? "text-savings"
                            : "text-expense"
                        }`}
                      >
                        ${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
