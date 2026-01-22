"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CATEGORIES, Category, Transaction, FundedFrom, Preset, getCategoryById } from "@/types";
import { Check, ChevronRight, Zap } from "lucide-react";

type AddTransactionTabProps = {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "created_at" | "user_id">) => void;
  presets?: Preset[];
};

export function AddTransactionTab({ onAddTransaction, presets = [] }: AddTransactionTabProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [fundedFrom, setFundedFrom] = useState<FundedFrom>("income");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [subcategorySheetOpen, setSubcategorySheetOpen] = useState(false);

  const fundedFromOptions: { value: FundedFrom; label: string; emoji: string }[] = [
    { value: "income", label: "This Month", emoji: "💵" },
    { value: "savings", label: "Savings", emoji: "💾" },
    { value: "emergency_fund", label: "Emergency Fund", emoji: "🛡️" },
  ];

  const applyPreset = (preset: Preset) => {
    const category = getCategoryById(preset.category_id);
    setAmount(preset.amount.toString());
    setSelectedCategory(category || null);
    setSelectedSubcategory(preset.subcategory || null);
    setFundedFrom(preset.funded_from || "income");
    if (preset.note) setNote(preset.note);
  };

  const incomeCategories = CATEGORIES.filter((c) => c.type === "income");
  const expenseCategories = CATEGORIES.filter((c) => c.type === "expense");
  const savingsCategories = CATEGORIES.filter((c) => c.type === "savings");

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setFundedFrom("income"); // Reset funded from when changing category
    if (category.subcategories && category.subcategories.length > 0) {
      setSubcategorySheetOpen(true);
    }
  };

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;

    const transaction: Omit<Transaction, "id" | "created_at" | "user_id"> = {
      amount: parseFloat(amount),
      type: selectedCategory.type,
      category_id: selectedCategory.id,
      subcategory: selectedSubcategory || undefined,
      note: note || undefined,
      date,
      // Only include funded_from for expenses
      ...(selectedCategory.type === "expense" && { funded_from: fundedFrom }),
    };

    onAddTransaction(transaction);

    // Reset form
    setAmount("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setFundedFrom("income");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const isValid = amount && parseFloat(amount) > 0 && selectedCategory;

  return (
    <div className="space-y-6">
      {/* Amount Input - Large and Prominent */}
      <Card className="border-0 bg-secondary">
        <CardContent className="p-6">
          <Label htmlFor="amount" className="text-sm text-muted-foreground">
            Amount
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-4xl font-bold text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-4xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      {presets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Quick Add</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const category = getCategoryById(preset.category_id);
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="h-auto py-2 px-3 border-zinc-700 hover:bg-zinc-800"
                  onClick={() => applyPreset(preset)}
                >
                  <span className="mr-1.5">{category?.emoji || "📝"}</span>
                  <span className="text-sm">{preset.name}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ${preset.amount.toLocaleString()}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-4">
        {/* Income Categories */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Income</Label>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory?.id === category.id ? "default" : "outline"}
                className={`h-auto py-2 px-3 ${
                  selectedCategory?.id === category.id
                    ? "bg-income text-income-foreground hover:bg-income/90"
                    : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <span className="mr-1.5">{category.emoji}</span>
                {category.name}
                {selectedCategory?.id === category.id && <Check className="ml-1.5 h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Expenses</Label>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory?.id === category.id ? "default" : "outline"}
                className={`h-auto py-2 px-3 ${
                  selectedCategory?.id === category.id
                    ? "bg-expense text-expense-foreground hover:bg-expense/90"
                    : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <span className="mr-1.5">{category.emoji}</span>
                {category.name}
                {selectedCategory?.id === category.id && <Check className="ml-1.5 h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Savings Categories */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Savings</Label>
          <div className="flex flex-wrap gap-2">
            {savingsCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory?.id === category.id ? "default" : "outline"}
                className={`h-auto py-2 px-3 ${
                  selectedCategory?.id === category.id
                    ? "bg-savings text-savings-foreground hover:bg-savings/90"
                    : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <span className="mr-1.5">{category.emoji}</span>
                {category.name}
                {selectedCategory?.id === category.id && <Check className="ml-1.5 h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Subcategory Display */}
      {selectedCategory && selectedCategory.subcategories && (
        <Sheet open={subcategorySheetOpen} onOpenChange={setSubcategorySheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>
                {selectedSubcategory || `Select ${selectedCategory.name} type`}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[50vh]">
            <SheetHeader>
              <SheetTitle>
                {selectedCategory.emoji} {selectedCategory.name}
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 py-4">
              {selectedCategory.subcategories.map((sub) => (
                <Button
                  key={sub}
                  variant={selectedSubcategory === sub ? "default" : "ghost"}
                  className="justify-start h-12"
                  onClick={() => {
                    setSelectedSubcategory(sub);
                    setSubcategorySheetOpen(false);
                  }}
                >
                  {sub}
                  {selectedSubcategory === sub && <Check className="ml-auto h-4 w-4" />}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Funded From - Only for expenses */}
      {selectedCategory?.type === "expense" && (
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Funded From</Label>
          <div className="flex gap-2">
            {fundedFromOptions.map((option) => (
              <Button
                key={option.value}
                variant={fundedFrom === option.value ? "default" : "outline"}
                className={`flex-1 h-auto py-2.5 px-3 ${
                  fundedFrom === option.value
                    ? option.value === "income"
                      ? "bg-zinc-700 hover:bg-zinc-600"
                      : option.value === "savings"
                      ? "bg-savings hover:bg-savings/90"
                      : "bg-amber-600 hover:bg-amber-500"
                    : ""
                }`}
                onClick={() => setFundedFrom(option.value)}
              >
                <span className="mr-1.5">{option.emoji}</span>
                <span className="text-sm">{option.label}</span>
                {fundedFrom === option.value && <Check className="ml-1.5 h-3.5 w-3.5" />}
              </Button>
            ))}
          </div>
          {fundedFrom !== "income" && (
            <p className="text-xs text-amber-400 mt-2">
              This will deduct from your {fundedFrom === "savings" ? "Savings" : "Emergency Fund"} total
            </p>
          )}
        </div>
      )}

      {/* Note Input */}
      <div>
        <Label htmlFor="note" className="text-sm text-muted-foreground">
          Note (optional)
        </Label>
        <Input
          id="note"
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Date Input */}
      <div>
        <Label htmlFor="date" className="text-sm text-muted-foreground">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full h-14 text-lg font-semibold ${
          selectedCategory?.type === "income"
            ? "bg-income hover:bg-income/90"
            : selectedCategory?.type === "savings"
            ? "bg-savings hover:bg-savings/90"
            : selectedCategory?.type === "expense"
            ? "bg-expense hover:bg-expense/90"
            : ""
        }`}
      >
        {selectedCategory ? (
          <>
            Add {selectedCategory.emoji}{" "}
            {selectedCategory.type === "income" ? "Income" : selectedCategory.type === "savings" ? "Savings" : "Expense"}
          </>
        ) : (
          "Select a category"
        )}
      </Button>
    </div>
  );
}
