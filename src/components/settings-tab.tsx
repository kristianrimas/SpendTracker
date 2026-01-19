"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Preset, CATEGORIES, getCategoryById, Category, FundedFrom } from "@/types";
import { Plus, Pencil, Trash2, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTabProps = {
  presets: Preset[];
  onPresetsChange: (presets: Preset[]) => void;
};

export function SettingsTab({ presets, onPresetsChange }: SettingsTabProps) {
  const router = useRouter();
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [fundedFrom, setFundedFrom] = useState<FundedFrom>("income");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const resetForm = () => {
    setName("");
    setAmount("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setFundedFrom("income");
  };

  const openAddPreset = () => {
    resetForm();
    setEditingPreset(null);
    setIsAddingPreset(true);
  };

  const openEditPreset = (preset: Preset) => {
    const category = getCategoryById(preset.category_id);
    setName(preset.name);
    setAmount(preset.amount.toString());
    setSelectedCategory(category || null);
    setSelectedSubcategory(preset.subcategory || null);
    setFundedFrom(preset.funded_from || "income");
    setEditingPreset(preset);
    setIsAddingPreset(true);
  };

  const handleSavePreset = () => {
    if (!name || !amount || !selectedCategory) return;

    const preset: Preset = {
      id: editingPreset?.id || crypto.randomUUID(),
      name,
      amount: parseFloat(amount),
      category_id: selectedCategory.id,
      subcategory: selectedSubcategory || undefined,
      funded_from: selectedCategory.type === "expense" ? fundedFrom : undefined,
    };

    if (editingPreset) {
      // Update existing
      onPresetsChange(presets.map((p) => (p.id === editingPreset.id ? preset : p)));
    } else {
      // Add new
      onPresetsChange([...presets, preset]);
    }

    setIsAddingPreset(false);
    resetForm();
  };

  const handleDeletePreset = (id: string) => {
    onPresetsChange(presets.filter((p) => p.id !== id));
  };

  const fundedFromOptions: { value: FundedFrom; label: string; emoji: string }[] = [
    { value: "income", label: "This Month", emoji: "💵" },
    { value: "savings", label: "Savings", emoji: "💾" },
    { value: "emergency_fund", label: "EF", emoji: "🛡️" },
  ];

  return (
    <div className="space-y-6">
      {/* Presets Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Quick Presets</h2>
          <Button size="sm" variant="outline" onClick={openAddPreset}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {presets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No presets yet. Create one to quickly add recurring transactions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {presets.map((preset) => {
              const category = getCategoryById(preset.category_id);
              return (
                <Card key={preset.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category?.emoji || "📝"}</span>
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${preset.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          {preset.funded_from && preset.funded_from !== "income" && (
                            <span className="ml-1 text-amber-500">
                              (from {preset.funded_from === "savings" ? "Savings" : "EF"})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditPreset(preset)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-expense hover:text-expense"
                        onClick={() => handleDeletePreset(preset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Account</h2>
        <Card className="p-0">
          <CardContent className="p-0">
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors rounded-lg disabled:opacity-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          SpendTracker v0.1.0
        </p>
      </div>

      {/* Add/Edit Preset Sheet */}
      <Sheet open={isAddingPreset} onOpenChange={setIsAddingPreset}>
        <SheetContent
          side="top"
          className="rounded-b-2xl pt-[env(safe-area-inset-top,0px)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-4">
            <SheetTitle>{editingPreset ? "Edit Preset" : "New Preset"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 p-4 pb-6 overflow-y-auto max-h-[60vh]">
            {/* Preset Name */}
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Rent, Gym, Coffee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                autoFocus={false}
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="preset-amount">Amount</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-muted-foreground">$</span>
                <Input
                  id="preset-amount"
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <Label>Category</Label>
              <Button
                variant="outline"
                className="w-full justify-between mt-1"
                onClick={() => setCategorySheetOpen(true)}
              >
                {selectedCategory ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedCategory.emoji}</span>
                    <span>{selectedCategory.name}</span>
                    {selectedSubcategory && (
                      <span className="text-muted-foreground">• {selectedSubcategory}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select category</span>
                )}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Funded From - Only for expenses */}
            {selectedCategory?.type === "expense" && (
              <div>
                <Label>Funded From</Label>
                <div className="flex gap-2 mt-1">
                  {fundedFromOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={fundedFrom === option.value ? "default" : "outline"}
                      className={cn(
                        "flex-1 h-auto py-2",
                        fundedFrom === option.value &&
                          (option.value === "income"
                            ? "bg-zinc-700"
                            : option.value === "savings"
                            ? "bg-savings"
                            : "bg-amber-600")
                      )}
                      onClick={() => setFundedFrom(option.value)}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button
              className="w-full h-12"
              onClick={handleSavePreset}
              disabled={!name || !amount || !selectedCategory}
            >
              {editingPreset ? "Update Preset" : "Save Preset"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Category Selection Sheet */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="bottom" showDragHandle className="max-h-[70vh]">
          <SheetHeader className="px-4">
            <SheetTitle>Select Category</SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-4 overflow-y-auto">
            {["income", "expense", "savings"].map((type) => {
              const categories = CATEGORIES.filter((c) => c.type === type);
              const typeLabel = type === "income" ? "Income" : type === "expense" ? "Expenses" : "Savings";
              const typeColor = type === "income" ? "text-income" : type === "expense" ? "text-expense" : "text-savings";

              return (
                <div key={type}>
                  <p className={cn("text-sm font-medium mb-2", typeColor)}>{typeLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory?.id === category.id ? "default" : "outline"}
                        className="justify-start h-auto py-2"
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedSubcategory(null);
                          if (category.subcategories && category.subcategories.length > 0) {
                            // Keep sheet open for subcategory selection
                          } else {
                            setCategorySheetOpen(false);
                          }
                        }}
                      >
                        <span className="mr-2">{category.emoji}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>

                  {/* Subcategories */}
                  {selectedCategory?.type === type && selectedCategory.subcategories && (
                    <div className="mt-2 pl-4 border-l-2 border-zinc-700">
                      <p className="text-xs text-muted-foreground mb-2">Subcategory (optional)</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory.subcategories.map((sub) => (
                          <Button
                            key={sub}
                            size="sm"
                            variant={selectedSubcategory === sub ? "default" : "outline"}
                            onClick={() => {
                              setSelectedSubcategory(sub);
                              setCategorySheetOpen(false);
                            }}
                          >
                            {sub}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCategorySheetOpen(false);
                          }}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
