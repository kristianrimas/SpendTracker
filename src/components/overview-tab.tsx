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
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Shield, Calendar, X } from "lucide-react";
import { Transaction, getCategoryById } from "@/types";

type OverviewTabProps = {
  transactions: Transaction[]; // All transactions
};

export function OverviewTab({ transactions }: OverviewTabProps) {
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
  const overview = monthTransactions.reduce(
    (acc, t) => {
      if (t.type === "income") {
        acc.totalIncome += t.amount;
      } else if (t.type === "savings") {
        acc.totalSaved += t.amount;
      } else {
        acc.totalExpenses += t.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, totalSaved: 0 }
  );

  const remaining = overview.totalIncome - overview.totalExpenses - overview.totalSaved;

  // Calculate cumulative savings and emergency fund (all-time)
  const cumulativeTotals = transactions.reduce(
    (acc, t) => {
      // Add deposits to savings
      if (t.type === "savings" && t.category_id === "savings") {
        acc.totalSavings += t.amount;
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
    { totalSavings: 0, totalEmergencyFund: 0 }
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
              ${overview.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              ${overview.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              ${overview.totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Totals - All Time */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-savings/30 bg-savings/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-savings mb-1">
              <PiggyBank className="h-4 w-4" />
              <span className="text-sm font-medium">Total Savings</span>
            </div>
            <p className="text-2xl font-bold text-savings">
              ${cumulativeTotals.totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
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
              ${cumulativeTotals.totalEmergencyFund.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All-time</p>
          </CardContent>
        </Card>
      </div>

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
                        ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                        {transaction.note && (
                          <p className="text-xs text-muted-foreground">{transaction.note}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.type === "income"
                          ? "text-income"
                          : transaction.type === "savings"
                          ? "text-savings"
                          : "text-expense"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
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
