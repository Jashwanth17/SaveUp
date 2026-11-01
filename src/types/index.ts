export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking';

export type TransactionType = 'expense' | 'income';

export type CategoryType = 
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Rent & Housing'
  | 'Groceries & Food'
  | 'Dining & Cafes'
  | 'Utilities & Bills'
  | 'Transport & Fuel'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Wellness'
  | 'Education'
  | 'EMI & Loans'
  | 'Subscriptions'
  | 'Personal Care'
  | 'Other';

export interface Category {
  id: string;
  name: CategoryType | string;
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface SplitMember {
  name: string;
  amount: number;
  paid: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  isShared?: boolean;
  splitDetails?: SplitMember[];
  isScheduled?: boolean;
  notes?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number; // 1-31
  isPaid: boolean;
  autoDebit?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  status: 'active' | 'paused';
  paymentMethod: PaymentMethod;
  icon?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'Emergency' | 'Travel' | 'Gadget' | 'Investment' | 'Vehicle' | 'General';
  icon: string;
  color: string;
}

export interface FinancialProfile {
  monthlyInHandSalary: number;
  annualCtc?: number;
  salaryCreditDate: number; // Day of month e.g. 1, 5, 25, 28
  additionalIncome: number;
  fixedExpenses: FixedExpense[];
  monthlySavingsTarget: number;
  currentSavings: number;
  emergencyFundMonthsTarget: number;
  carryForwardDailySavings: boolean;
  isSetupCompleted?: boolean;
}

export interface DailyAllowanceCalculation {
  cycleStartDate: string;
  cycleEndDate: string;
  daysInCycle: number;
  daysPassed: number;
  daysRemaining: number;
  inHandSalary: number;
  additionalIncome: number;
  totalIncome: number;
  fixedCommitmentsTotal: number;
  savingsAllocation: number;
  spendablePool: number;
  actualSpentThisCycle: number;
  upcomingScheduledBills: number;
  remainingSpendableBudget: number;
  dailyAllowanceToday: number;
  actualDailySpendToday: number;
  remainingTodayAllowance: number;
  carryForwardAmount: number;
  overspendingDeficit: number;
  status: 'healthy' | 'caution' | 'critical';
}

export interface SimulationResult {
  purchaseItem: string;
  cost: number;
  currentBalance: number;
  projectedBalanceAfter: number;
  currentDailyAllowance: number;
  projectedDailyAllowance: number;
  dailyAllowanceDelta: number;
  savingsImpactAmount: number;
  savingsTargetMet: boolean;
  canAffordUpcomingBills: boolean;
  verdict: 'safe' | 'warning' | 'critical';
  insights: string[];
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  tier: 'Needs Attention' | 'Fair' | 'Good' | 'Excellent';
  factors: {
    label: string;
    score: number;
    weight: string;
    status: 'good' | 'warning' | 'alert';
    explanation: string;
  }[];
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'tip' | 'success' | 'info';
  title: string;
  description: string;
  actionText?: string;
  date: string;
}

export interface SpendingChallenge {
  id: string;
  title: string;
  description: string;
  targetSpend: number;
  currentSpend: number;
  daysTotal: number;
  daysCompleted: number;
  rewardPoints: number;
  active: boolean;
  category?: string;
}
