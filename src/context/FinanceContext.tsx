import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  FinancialProfile, 
  Category, 
  Transaction, 
  Subscription, 
  SavingsGoal, 
  SpendingChallenge, 
  FinancialInsight,
  DailyAllowanceCalculation,
  SimulationResult,
  FinancialHealthScore
} from '../types';
import { 
  initialProfile, 
  initialCategories, 
  initialTransactions, 
  initialSubscriptions, 
  initialSavingsGoals, 
  initialChallenges, 
  initialInsights 
} from '../data/mockData';
import { 
  calculateDailyAllowance, 
  calculateHealthScore, 
  simulatePurchase 
} from '../services/calculationEngine';
import { storageService } from '../services/storageService';

interface FinanceContextType {
  profile: FinancialProfile;
  setProfile: (profile: FinancialProfile) => void;
  updateProfile: (updates: Partial<FinancialProfile>) => void;
  categories: Category[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  challenges: SpendingChallenge[];
  insights: FinancialInsight[];
  calculations: DailyAllowanceCalculation;
  healthScore: FinancialHealthScore;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // Fixed Expense actions
  toggleFixedExpensePaid: (id: string) => void;
  addFixedExpense: (item: Omit<FinancialProfile['fixedExpenses'][0], 'id'>) => void;
  deleteFixedExpense: (id: string) => void;
  // Savings Goal actions
  depositToGoal: (goalId: string, amount: number) => void;
  withdrawFromGoal: (goalId: string, amount: number) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  // Subscription actions
  toggleSubscriptionStatus: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  // Simulator action
  runSimulation: (itemName: string, cost: number) => SimulationResult;
  // State reset for demo
  resetToDefaults: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<FinancialProfile>(() => 
    storageService.get('profile', initialProfile)
  );

  const [categories, setCategories] = useState<Category[]>(() => 
    storageService.get('categories', initialCategories)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    storageService.get('transactions', initialTransactions)
  );

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => 
    storageService.get('subscriptions', initialSubscriptions)
  );

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => 
    storageService.get('savingsGoals', initialSavingsGoals)
  );

  const [challenges, setChallenges] = useState<SpendingChallenge[]>(() => 
    storageService.get('challenges', initialChallenges)
  );

  const [insights, setInsights] = useState<FinancialInsight[]>(() => 
    storageService.get('insights', initialInsights)
  );

  const [theme, setTheme] = useState<'dark' | 'light'>(() => 
    storageService.get('theme', 'dark')
  );

  // Sync to storage
  useEffect(() => { storageService.set('profile', profile); }, [profile]);
  useEffect(() => { storageService.set('categories', categories); }, [categories]);
  useEffect(() => { storageService.set('transactions', transactions); }, [transactions]);
  useEffect(() => { storageService.set('subscriptions', subscriptions); }, [subscriptions]);
  useEffect(() => { storageService.set('savingsGoals', savingsGoals); }, [savingsGoals]);
  useEffect(() => { storageService.set('challenges', challenges); }, [challenges]);
  useEffect(() => { storageService.set('insights', insights); }, [insights]);
  useEffect(() => { 
    storageService.set('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateProfile = (updates: Partial<FinancialProfile>) => {
    setProfileState(prev => ({ ...prev, ...updates }));
  };

  const setProfile = (newProfile: FinancialProfile) => {
    setProfileState(newProfile);
  };

  // Calculations
  const calculations = useMemo(() => {
    return calculateDailyAllowance(profile, transactions);
  }, [profile, transactions]);

  const healthScore = useMemo(() => {
    return calculateHealthScore(profile, calculations);
  }, [profile, calculations]);

  // Transaction CRUD
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    const tx: Transaction = { ...newTx, id };
    setTransactions(prev => [tx, ...prev]);

    if (tx.type === 'expense') {
      setProfileState(prev => ({
        ...prev,
        fixedExpenses: prev.fixedExpenses.map(item => {
          if (item.category === tx.category && Math.abs(item.amount - tx.amount) < 50) {
            return { ...item, isPaid: true };
          }
          return item;
        }),
      }));
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Fixed Expense Actions
  const toggleFixedExpensePaid = (id: string) => {
    setProfileState(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(item => 
        item.id === id ? { ...item, isPaid: !item.isPaid } : item
      ),
    }));
  };

  const addFixedExpense = (item: Omit<FinancialProfile['fixedExpenses'][0], 'id'>) => {
    const id = `fix-${Date.now()}`;
    setProfileState(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, { ...item, id }],
    }));
  };

  const deleteFixedExpense = (id: string) => {
    setProfileState(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(item => item.id !== id),
    }));
  };

  // Savings Goal Actions
  const depositToGoal = (goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, currentAmount: goal.currentAmount + amount };
      }
      return goal;
    }));
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      addTransaction({
        amount,
        type: 'expense',
        category: 'Investment',
        description: `Deposit to Goal: ${goal.title}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'UPI',
        notes: `Savings contribution towards ${goal.title}`,
      });
    }
  };

  const withdrawFromGoal = (goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, currentAmount: Math.max(0, goal.currentAmount - amount) };
      }
      return goal;
    }));
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      addTransaction({
        amount,
        type: 'income',
        category: 'Investment',
        description: `Withdrawal from Goal: ${goal.title}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'UPI',
        notes: `Withdrawn from ${goal.title}`,
      });
    }
  };

  const addSavingsGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const id = `goal-${Date.now()}`;
    setSavingsGoals(prev => [...prev, { ...newGoal, id, currentAmount: 0 }]);
  };

  // Subscription Actions
  const toggleSubscriptionStatus = (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' } : sub
    ));
  };

  const addSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const id = `sub-${Date.now()}`;
    setSubscriptions(prev => [...prev, { ...newSub, id }]);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  // Pre-Purchase Simulator
  const runSimulation = (itemName: string, cost: number): SimulationResult => {
    return simulatePurchase(itemName, cost, calculations, profile);
  };

  const resetToDefaults = () => {
    setProfileState(initialProfile);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setSubscriptions(initialSubscriptions);
    setSavingsGoals(initialSavingsGoals);
    setChallenges(initialChallenges);
    setInsights(initialInsights);
    storageService.clearAll();
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        categories,
        transactions,
        subscriptions,
        savingsGoals,
        challenges,
        insights,
        calculations,
        healthScore,
        theme,
        toggleTheme,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleFixedExpensePaid,
        addFixedExpense,
        deleteFixedExpense,
        depositToGoal,
        withdrawFromGoal,
        addSavingsGoal,
        toggleSubscriptionStatus,
        addSubscription,
        deleteSubscription,
        runSimulation,
        resetToDefaults,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
