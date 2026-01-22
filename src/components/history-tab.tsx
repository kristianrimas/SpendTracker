"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction, CATEGORIES, getCategoryById } from "@/types";
import { Trash2, Filter, X, Calendar } from "lucide-react";

type HistoryTabProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
};

export function HistoryTab({ transactions, onDeleteTransaction }: HistoryTabProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Get available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse(); // Most recent first
  }, [transactions]);

  // Format month for display (e.g., "2025-01" -> "January 2025")
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by month
    if (filterMonth !== "all") {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthKey === filterMonth;
      });
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category_id === filterCategory);
    }

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: Record<string, Transaction[]> = {};
    sorted.forEach((t) => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    return groups;
  }, [transactions, filterCategory, filterMonth]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    setSwipedId(null);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">
            No transactions yet. Add your first one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-2">
        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterMonth !== "all" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterMonth("all")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterCategory !== "all" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterCategory("all")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Groups */}
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
        const dayTotal = dayTransactions.reduce((sum, t) => {
          if (t.type === "income") return sum + t.amount;
          // debt_payment, savings, and expenses all subtract from the total
          return sum - t.amount;
        }, 0);

        return (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center justify-between py-2 px-1">
              <span className="text-sm font-medium text-muted-foreground">
                {formatDate(date)}
              </span>
              <span
                className={`text-sm font-medium ${
                  dayTotal >= 0 ? "text-income" : "text-expense"
                }`}
              >
                {dayTotal >= 0 ? "+" : ""}${dayTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Transactions */}
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {dayTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.category_id);
                  const isSwipedOpen = swipedId === transaction.id;

                  return (
                    <div
                      key={transaction.id}
                      className="relative overflow-hidden"
                    >
                      {/* Delete Button (behind) */}
                      <div
                        className={`absolute inset-y-0 right-0 flex items-center bg-destructive transition-all duration-200 ${
                          isSwipedOpen ? "w-20" : "w-0"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-full h-full text-white hover:bg-destructive/90"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Transaction Row */}
                      <div
                        className={`flex items-center justify-between p-4 bg-card transition-transform duration-200 cursor-pointer ${
                          isSwipedOpen ? "-translate-x-20" : "translate-x-0"
                        }`}
                        onClick={() =>
                          setSwipedId(isSwipedOpen ? null : transaction.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category?.emoji || "📝"}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{category?.name || "Unknown"}</p>
                              {transaction.is_auto && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Auto</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {transaction.subcategory && (
                                <span>{transaction.subcategory}</span>
                              )}
                              {transaction.note && (
                                <>
                                  {transaction.subcategory && <span>•</span>}
                                  <span className="truncate max-w-[150px]">
                                    {transaction.note}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-income"
                              : transaction.type === "savings"
                              ? "text-savings"
                              : transaction.type === "debt_payment"
                              ? "text-amber-500"
                              : "text-expense"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {Object.keys(groupedTransactions).length === 0 && (
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">
              No transactions match your filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
