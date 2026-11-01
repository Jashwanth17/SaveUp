import { 
  FinancialProfile, 
  Category, 
  Transaction, 
  Subscription, 
  SavingsGoal, 
  SpendingChallenge, 
  FinancialInsight 
} from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Rent & Housing', icon: 'Home', color: '#6366f1', budgetLimit: 32000 },
  { id: 'cat-2', name: 'Groceries & Food', icon: 'ShoppingBag', color: '#10b981', budgetLimit: 15000 },
  { id: 'cat-3', name: 'Dining & Cafes', icon: 'Utensils', color: '#f59e0b', budgetLimit: 8000 },
  { id: 'cat-4', name: 'Transport & Fuel', icon: 'Car', color: '#06b6d4', budgetLimit: 6000 },
  { id: 'cat-5', name: 'Utilities & Bills', icon: 'Zap', color: '#ec4899', budgetLimit: 6000 },
  { id: 'cat-6', name: 'EMI & Loans', icon: 'Landmark', color: '#8b5cf6', budgetLimit: 15000 },
  { id: 'cat-7', name: 'Subscriptions', icon: 'PlaySquare', color: '#f43f5e', budgetLimit: 4000 },
  { id: 'cat-8', name: 'Shopping', icon: 'ShoppingBag', color: '#14b8a6', budgetLimit: 10000 },
  { id: 'cat-9', name: 'Health & Wellness', icon: 'HeartPulse', color: '#ef4444', budgetLimit: 5000 },
  { id: 'cat-10', name: 'Entertainment', icon: 'Film', color: '#a855f7', budgetLimit: 4000 },
  { id: 'cat-11', name: 'Personal Care', icon: 'Smile', color: '#3b82f6', budgetLimit: 3000 },
  { id: 'cat-12', name: 'Salary', icon: 'Wallet', color: '#10b981' },
  { id: 'cat-13', name: 'Freelance', icon: 'Laptop', color: '#3b82f6' },
  { id: 'cat-14', name: 'Investment', icon: 'TrendingUp', color: '#059669' },
  { id: 'cat-15', name: 'Other', icon: 'MoreHorizontal', color: '#64748b', budgetLimit: 5000 },
];

export const defaultCleanProfile: FinancialProfile = {
  monthlyInHandSalary: 0,
  annualCtc: 0,
  salaryCreditDate: 1, // 1st of every month
  additionalIncome: 0,
  fixedExpenses: [],
  monthlySavingsTarget: 0,
  currentSavings: 0,
  emergencyFundMonthsTarget: 6,
  carryForwardDailySavings: true,
  isSetupCompleted: false,
};

export const sampleDemoProfile: FinancialProfile = {
  monthlyInHandSalary: 120000,
  annualCtc: 1800000,
  salaryCreditDate: 1, // 1st of every month
  additionalIncome: 15000, // Freelance consulting
  fixedExpenses: [
    { id: 'fix-1', name: 'Apartment Rent', category: 'Rent & Housing', amount: 30000, dueDay: 5, isPaid: false, autoDebit: true },
    { id: 'fix-2', name: 'Society Maintenance', category: 'Rent & Housing', amount: 3500, dueDay: 7, isPaid: false, autoDebit: true },
    { id: 'fix-3', name: 'Electricity & Water Bill', category: 'Utilities & Bills', amount: 3200, dueDay: 10, isPaid: false },
    { id: 'fix-4', name: 'Airtel Fiber Broadband', category: 'Utilities & Bills', amount: 1499, dueDay: 12, isPaid: false, autoDebit: true },
    { id: 'fix-5', name: 'Car Loan EMI (HDFC)', category: 'EMI & Loans', amount: 14500, dueDay: 15, isPaid: false, autoDebit: true },
    { id: 'fix-6', name: 'Health Insurance Premium', category: 'Health & Wellness', amount: 2500, dueDay: 20, isPaid: false },
    { id: 'fix-7', name: 'Cook & Housekeeping', category: 'Personal Care', amount: 8000, dueDay: 7, isPaid: false },
  ],
  monthlySavingsTarget: 25000,
  currentSavings: 480000,
  emergencyFundMonthsTarget: 6,
  carryForwardDailySavings: true,
  isSetupCompleted: true,
};

export const initialProfile = defaultCleanProfile;

// Generate relative dates based on current year & month
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const pad = (d: number) => String(d).padStart(2, '0');

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    amount: 120000,
    type: 'income',
    category: 'Salary',
    description: 'Monthly In-hand Salary Credit (TechCorp)',
    date: `${year}-${month}-${pad(1)}`,
    time: '09:00',
    paymentMethod: 'Net Banking',
    notes: 'Salary credited directly to primary savings account',
  },
  {
    id: 'tx-2',
    amount: 15000,
    type: 'income',
    category: 'Freelance',
    description: 'UI/UX Design Advisory Milestone',
    date: `${year}-${month}-${pad(2)}`,
    time: '14:30',
    paymentMethod: 'UPI',
    notes: 'Client payout received for design consultation',
  },
  {
    id: 'tx-3',
    amount: 2450,
    type: 'expense',
    category: 'Groceries & Food',
    description: 'Nature Basket Organic Groceries',
    date: `${year}-${month}-${pad(1)}`,
    time: '18:45',
    paymentMethod: 'Credit Card',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4c019ffae9?auto=format&fit=crop&w=600&q=80',
    notes: 'Weekly pantry stock',
  },
  {
    id: 'tx-4',
    amount: 850,
    type: 'expense',
    category: 'Dining & Cafes',
    description: 'Third Wave Coffee & Avocado Toast',
    date: `${year}-${month}-${pad(1)}`,
    time: '11:15',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx-5',
    amount: 1650,
    type: 'expense',
    category: 'Transport & Fuel',
    description: 'Shell Petrol Pump Fuel Tank Top-up',
    date: `${year}-${month}-${pad(2)}`,
    time: '08:30',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'tx-6',
    amount: 3200,
    type: 'expense',
    category: 'Dining & Cafes',
    description: 'Weekend Italian Dinner with Friends',
    date: `${year}-${month}-${pad(2)}`,
    time: '20:30',
    paymentMethod: 'Credit Card',
    isShared: true,
    splitDetails: [
      { name: 'Me', amount: 800, paid: true },
      { name: 'Rohan Sharma', amount: 800, paid: true },
      { name: 'Priya Mehta', amount: 800, paid: false },
      { name: 'Aditya Rao', amount: 800, paid: false },
    ],
    receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    notes: 'Split bill among 4. Waiting for Priya & Aditya UPI payments.',
  },
  {
    id: 'tx-7',
    amount: 649,
    type: 'expense',
    category: 'Subscriptions',
    description: 'Netflix 4K Ultra HD Plan',
    date: `${year}-${month}-${pad(3)}`,
    time: '10:00',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-8',
    amount: 1299,
    type: 'expense',
    category: 'Shopping',
    description: 'Uniqlo Airism Cotton Crew Tee',
    date: `${year}-${month}-${pad(3)}`,
    time: '16:20',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx-9',
    amount: 450,
    type: 'expense',
    category: 'Health & Wellness',
    description: 'Apollo Pharmacy Multivitamins',
    date: `${year}-${month}-${pad(4)}`,
    time: '19:10',
    paymentMethod: 'UPI',
  },
];

export const initialSubscriptions: Subscription[] = [
  { id: 'sub-1', name: 'Netflix Premium 4K', amount: 649, frequency: 'monthly', nextBillingDate: `${year}-${month}-03`, category: 'Entertainment', status: 'active', paymentMethod: 'Credit Card', icon: 'PlaySquare' },
  { id: 'sub-2', name: 'Spotify Family Plan', amount: 179, frequency: 'monthly', nextBillingDate: `${year}-${month}-14`, category: 'Entertainment', status: 'active', paymentMethod: 'UPI', icon: 'Music' },
  { id: 'sub-3', name: 'GitHub Copilot Pro', amount: 830, frequency: 'monthly', nextBillingDate: `${year}-${month}-22`, category: 'Education', status: 'active', paymentMethod: 'Credit Card', icon: 'Code' },
  { id: 'sub-4', name: 'Google One 2TB Cloud', amount: 650, frequency: 'monthly', nextBillingDate: `${year}-${month}-18`, category: 'Utilities & Bills', status: 'active', paymentMethod: 'Debit Card', icon: 'Cloud' },
  { id: 'sub-5', name: 'Cult.fit Gym & Sports', amount: 15000, frequency: 'yearly', nextBillingDate: `${year}-12-15`, category: 'Health & Wellness', status: 'active', paymentMethod: 'Credit Card', icon: 'Dumbbell' },
  { id: 'sub-6', name: 'Amazon Prime Yearly', amount: 1499, frequency: 'yearly', nextBillingDate: `${year}-09-10`, category: 'Shopping', status: 'active', paymentMethod: 'Credit Card', icon: 'Package' },
];

export const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Rainy Day Fund',
    targetAmount: 400000,
    currentAmount: 320000,
    deadline: `${year}-12-31`,
    category: 'Emergency',
    icon: 'ShieldCheck',
    color: '#10b981',
  },
  {
    id: 'goal-2',
    title: 'Japan Autumn Foliage Trip',
    targetAmount: 250000,
    currentAmount: 165000,
    deadline: `${year}-10-15`,
    category: 'Travel',
    icon: 'Plane',
    color: '#3b82f6',
  },
  {
    id: 'goal-3',
    title: 'MacBook Pro M3 Max Studio',
    targetAmount: 180000,
    currentAmount: 140000,
    deadline: `${year}-06-30`,
    category: 'Gadget',
    icon: 'Laptop',
    color: '#a855f7',
  },
  {
    id: 'goal-4',
    title: 'EV Car Down Payment',
    targetAmount: 500000,
    currentAmount: 210000,
    deadline: `${year + 1}-03-31`,
    category: 'Vehicle',
    icon: 'Car',
    color: '#f59e0b',
  },
];

export const initialInsights: FinancialInsight[] = [
  {
    id: 'ins-1',
    type: 'success',
    title: 'Healthy Daily Allowance Pacing',
    description: 'You have stayed within your safe daily spending allowance for 4 consecutive days.',
    date: 'Today',
  },
  {
    id: 'ins-2',
    type: 'warning',
    title: 'Upcoming Rent Payment (₹30,000)',
    description: 'Rent is due on the 5th. SaveUp has already reserved ₹30,000 in your Planned Balance.',
    actionText: 'View Scheduled Payments',
    date: '2 days left',
  },
  {
    id: 'ins-3',
    type: 'tip',
    title: 'Dining Out Trend Alert',
    description: 'Weekend dining expenses are trending 18% higher than your target category budget.',
    actionText: 'Adjust Category Limit',
    date: 'Yesterday',
  },
  {
    id: 'ins-4',
    type: 'info',
    title: 'Savings Milestone in Sight',
    description: 'You are just ₹15,000 away from achieving your MacBook Pro M3 Max savings goal!',
    actionText: 'Deposit Savings',
    date: '3 days ago',
  },
];

export const initialChallenges: SpendingChallenge[] = [
  {
    id: 'chal-1',
    title: 'Zero Delivery Weekend',
    description: 'Cook all meals at home on Saturday & Sunday to save ₹2,000 on delivery surge fees.',
    targetSpend: 0,
    currentSpend: 0,
    daysTotal: 2,
    daysCompleted: 1,
    rewardPoints: 250,
    active: true,
    category: 'Dining & Cafes',
  },
  {
    id: 'chal-2',
    title: 'Coffee Machine Mastery',
    description: 'Make your morning coffee at home for 7 continuous days.',
    targetSpend: 350,
    currentSpend: 150,
    daysTotal: 7,
    daysCompleted: 4,
    rewardPoints: 300,
    active: true,
    category: 'Dining & Cafes',
  },
  {
    id: 'chal-3',
    title: 'Impulse Shopping Shield',
    description: 'Wait 48 hours before purchasing any non-essential item over ₹1,500.',
    targetSpend: 0,
    currentSpend: 0,
    daysTotal: 14,
    daysCompleted: 11,
    rewardPoints: 500,
    active: true,
    category: 'Shopping',
  },
];

export const sampleDemoTransactions = initialTransactions;
export const sampleDemoSubscriptions = initialSubscriptions;
export const sampleDemoSavingsGoals = initialSavingsGoals;
export const sampleDemoInsights = initialInsights;
export const sampleDemoChallenges = initialChallenges;
