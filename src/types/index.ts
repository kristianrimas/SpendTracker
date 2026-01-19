export type TransactionType = "income" | "expense" | "savings";

// Where the money comes from when spending
export type FundedFrom = "income" | "savings" | "emergency_fund";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  type: TransactionType;
  subcategories?: string[];
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  subcategory?: string;
  note?: string;
  date: string;
  created_at: string;
  user_id: string;
  // For expenses: where is the money coming from?
  funded_from?: FundedFrom;
};

export type MonthlyOverview = {
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  remaining: number;
};

// Preset for quick transaction entry
export type Preset = {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  subcategory?: string;
  note?: string;
  funded_from?: FundedFrom;
};

// Core categories with emojis for fast recognition
export const CATEGORIES: Category[] = [
  // Income
  { id: "salary", name: "Salary", emoji: "💰", type: "income", subcategories: ["Primary", "Bonus", "Commission"] },
  { id: "side-income", name: "Side Income", emoji: "💼", type: "income", subcategories: ["Freelance", "Other"] },

  // Fixed Bills
  { id: "fixed-bills", name: "Fixed Bills", emoji: "🏠", type: "expense", subcategories: ["Rent/Mortgage", "Utilities", "Internet/Mobile", "Insurance", "Subscriptions"] },

  // Variable Expenses
  { id: "food", name: "Food", emoji: "🍽️", type: "expense", subcategories: ["Groceries", "Eating Out", "Coffee/Snacks"] },
  { id: "transport", name: "Transport", emoji: "🚗", type: "expense", subcategories: ["Fuel", "Public Transport", "Parking/Tolls", "Maintenance"] },
  { id: "living", name: "Living", emoji: "🧾", type: "expense", subcategories: ["Phone", "Clothing", "Grooming", "Personal Care"] },
  { id: "lifestyle", name: "Lifestyle", emoji: "🎉", type: "expense", subcategories: ["Entertainment", "Hobbies", "Games", "Events"] },
  { id: "travel", name: "Travel", emoji: "✈️", type: "expense", subcategories: ["Flights", "Accommodation", "Activities"] },
  { id: "health", name: "Health", emoji: "🏥", type: "expense", subcategories: ["Doctor", "Medication", "Gym/Fitness", "Therapy"] },
  { id: "debt", name: "Debt", emoji: "💳", type: "expense", subcategories: ["Credit Card", "Personal Loans", "Student Loans"] },

  // Savings (treated as outflow, not leftover)
  { id: "savings", name: "Savings", emoji: "💾", type: "savings", subcategories: ["General", "Investments", "Retirement"] },
  { id: "emergency_fund", name: "Emergency Fund", emoji: "🛡️", type: "savings" },
];

// Helper to get category by id
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// Helper to get categories by type
export const getCategoriesByType = (type: TransactionType): Category[] => {
  return CATEGORIES.filter((cat) => cat.type === type);
};
