"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Transaction, CATEGORIES, getCategoryById, Category } from "@/types";
import { ChevronRight } from "lucide-react";

type CategoriesTabProps = {
  transactions: Transaction[];
};

type CategorySummary = {
  category: Category;
  total: number;
  count: number;
  transactions: Transaction[];
};

export function CategoriesTab({ transactions }: CategoriesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategorySummary | null>(null);

  // Calculate totals by category
  const categorySummaries = useMemo(() => {
    const summaryMap = new Map<string, CategorySummary>();

    // Initialize all categories
    CATEGORIES.forEach((cat) => {
      summaryMap.set(cat.id, {
        category: cat,
        total: 0,
        count: 0,
        transactions: [],
      });
    });

    // Aggregate transactions
    transactions.forEach((t) => {
      const summary = summaryMap.get(t.category_id);
      if (summary) {
        summary.total += t.amount;
        summary.count += 1;
        summary.transactions.push(t);
      }
    });

    // Convert to array and sort by total (descending)
    return Array.from(summaryMap.values())
      .filter((s) => s.count > 0)
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Group by type
  const incomeCategories = categorySummaries.filter((s) => s.category.type === "income");
  const expenseCategories = categorySummaries.filter((s) => s.category.type === "expense");
  const savingsCategories = categorySummaries.filter((s) => s.category.type === "savings");

  const maxIncome = incomeCategories[0]?.total || 1;
  const maxExpense = expenseCategories[0]?.total || 1;
  const maxSavings = savingsCategories[0]?.total || 1;

  const totalIncome = incomeCategories.reduce((sum, s) => sum + s.total, 0);
  const totalExpense = expenseCategories.reduce((sum, s) => sum + s.total, 0);
  const totalSavings = savingsCategories.reduce((sum, s) => sum + s.total, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">
            No transactions yet. Add some to see your spending by category!
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderCategoryList = (
    summaries: CategorySummary[],
    maxValue: number,
    colorClass: string,
    bgClass: string
  ) => (
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

  return (
    <>
      <div className="space-y-6">
        {/* Income Section */}
        {incomeCategories.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
                <span className="text-income font-semibold">
                  ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {renderCategoryList(incomeCategories, maxIncome, "text-income", "bg-income")}
            </CardContent>
          </Card>
        )}

        {/* Expenses Section */}
        {expenseCategories.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
                <span className="text-expense font-semibold">
                  ${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {renderCategoryList(expenseCategories, maxExpense, "text-expense", "bg-expense")}
            </CardContent>
          </Card>
        )}

        {/* Savings Section */}
        {savingsCategories.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
                <span className="text-savings font-semibold">
                  ${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {renderCategoryList(savingsCategories, maxSavings, "text-savings", "bg-savings")}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Detail Sheet */}
      <Sheet open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <SheetContent
          side="bottom"
          showDragHandle
          className="max-h-[60vh] min-h-[200px]"
        >
          {/* Visually hidden title for accessibility */}
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
