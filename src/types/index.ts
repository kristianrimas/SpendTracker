export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  subcategories?: string[];
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  subcategory?: string;
  description?: string;
  date: string;
  created_at: string;
  user_id: string;
};

export type MonthlyOverview = {
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  remaining: number;
};

// Core categories from planning doc
export const CATEGORIES: Category[] = [
  // Income
  { id: "salary", name: "Salary", icon: "Briefcase", type: "income", subcategories: ["Primary", "Bonus", "Commission"] },
  { id: "side-income", name: "Side Income", icon: "Laptop", type: "income", subcategories: ["Freelance", "Other"] },

  // Expenses
  { id: "fixed-bills", name: "Fixed Bills", icon: "Home", type: "expense", subcategories: ["Rent/Mortgage", "Utilities", "Internet/Mobile", "Insurance", "Subscriptions"] },
  { id: "food", name: "Food", icon: "Utensils", type: "expense", subcategories: ["Groceries", "Eating Out", "Coffee/Snacks"] },
  { id: "transport", name: "Transport", icon: "Car", type: "expense", subcategories: ["Fuel", "Public Transport", "Car Loan", "Parking/Tolls", "Maintenance"] },
  { id: "living", name: "Living/Personal", icon: "User", type: "expense", subcategories: ["Phone", "Clothing", "Grooming", "Personal Care"] },
  { id: "lifestyle", name: "Lifestyle", icon: "Gamepad2", type: "expense", subcategories: ["Entertainment", "Hobbies", "Games", "Events"] },
  { id: "travel", name: "Travel", icon: "Plane", type: "expense", subcategories: ["Flights", "Accommodation", "Activities"] },
  { id: "health", name: "Health", icon: "Heart", type: "expense", subcategories: ["Doctor", "Medication", "Gym/Fitness", "Therapy"] },
  { id: "debt", name: "Debt & Obligations", icon: "CreditCard", type: "expense", subcategories: ["Credit Card", "Personal Loans", "Student Loans"] },
  { id: "savings", name: "Savings & Investing", icon: "PiggyBank", type: "expense", subcategories: ["Emergency Fund", "Savings", "Investments", "Retirement"] },
];
