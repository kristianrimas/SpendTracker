"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Plus,
  History,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet
} from "lucide-react";

export default function HomePage() {
  // Placeholder data
  const overview = {
    totalIncome: 0,
    totalExpenses: 0,
    totalSaved: 0,
    remaining: 0,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <h1 className="text-xl font-bold">SpendTracker</h1>
        <p className="text-sm text-muted-foreground">January 2026</p>
      </header>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab Content */}
        <div className="p-4 pb-20">
          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* Monthly Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-500">
                    ${overview.totalIncome.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-500">
                    ${overview.totalExpenses.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-blue-500" />
                    Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-500">
                    ${overview.totalSaved.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${overview.remaining.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No transactions yet. Add your first one!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Transaction form coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Your transaction history will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Category management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <TabsList className="fixed bottom-0 left-0 right-0 h-16 grid grid-cols-4 rounded-none border-t bg-background">
          <TabsTrigger value="overview" className="flex flex-col gap-1 data-[state=active]:bg-transparent">
            <Home className="h-5 w-5" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex flex-col gap-1 data-[state=active]:bg-transparent">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col gap-1 data-[state=active]:bg-transparent">
            <History className="h-5 w-5" />
            <span className="text-xs">History</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex flex-col gap-1 data-[state=active]:bg-transparent">
            <FolderOpen className="h-5 w-5" />
            <span className="text-xs">Categories</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </main>
  );
}
