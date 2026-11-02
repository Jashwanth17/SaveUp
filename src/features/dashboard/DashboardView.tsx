import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Home, 
  Utensils, 
  Car, 
  Coffee, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Receipt, 
  Check, 
  Trash2, 
  Zap, 
  Sparkles, 
  ArrowRight,
  CreditCard,
  Calendar,
  X
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { Transaction, PaymentMethod } from '../../types';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { ActiveTab } from '../../components/navigation/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddTx: () => void;
  onOpenSetup: () => void;
}

const MONTHLY_OPTIONS = [
  { id: 'Rent', label: 'Rent', icon: '🏠', desc: 'House / Room Rent' },
  { id: 'Subscriptions', label: 'Subscriptions', icon: '📱', desc: 'Netflix, Spotify, Prime, WiFi' },
  { id: 'EB Bill', label: 'EB Bill', icon: '⚡', desc: 'Electricity & Power' },
  { id: 'EMI', label: 'EMI', icon: '💳', desc: 'Loan, Bike, Car, Phone' },
  { id: 'Other', label: 'Other', icon: '➕', desc: 'Custom Monthly Spend' },
] as const;

type MonthlyOptionId = typeof MONTHLY_OPTIONS[number]['id'];

const DAILY_OPTIONS = [
  { id: 'Transport', label: 'Transport', icon: '🚗', desc: 'Auto, Bus, Metro, Petrol' },
  { id: 'Food', label: 'Food', icon: '🍛', desc: 'Meals, Groceries, Dining' },
  { id: 'Snacks', label: 'Snacks', icon: '☕', desc: 'Chai, Coffee, Bakery' },
  { id: 'Others', label: 'Others', icon: '🛍️', desc: 'Custom Daily Spend' },
] as const;

type DailyOptionId = typeof DAILY_OPTIONS[number]['id'];

const FILTER_OPTIONS = [
  { id: 'All', label: 'All Payments' },
  { id: 'Unpaid', label: '⏳ To Pay (Pending)' },
  { id: 'Paid', label: '✓ Already Paid' },
  { id: 'Rent', label: '🏠 Rent' },
  { id: 'Subscriptions', label: '📱 Subscriptions' },
  { id: 'EB Bill', label: '⚡ EB Bill' },
  { id: 'EMI', label: '💳 EMI' },
  { id: 'Other', label: '➕ Other' },
];

const INCOME_REASONS = [
  { id: 'Friend Repaid', label: '🤝 Friend Repaid' },
  { id: 'Bonus', label: '🎉 Bonus' },
  { id: 'Freelance', label: '💻 Freelance' },
  { id: 'Cash Gift', label: '🎁 Cash Gift' },
  { id: 'Refund', label: '🔄 Refund' },
  { id: 'Other Inflow', label: '✨ Other' },
] as const;

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddTx,
  onOpenSetup,
}) => {
  const { 
    calculations, 
    profile, 
    transactions, 
    toggleFixedExpensePaid,
    addFixedExpense,
    deleteFixedExpense,
    addTransaction,
    deleteTransaction
  } = useFinance();

  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-between / Extra money (one-time income modal)
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeReason, setIncomeReason] = useState<string>('Friend Repaid');
  const [incomeDescription, setIncomeDescription] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Balance calculations
  const totalSalary = profile.monthlyInHandSalary || 0;
  const regularAdditionalIncome = profile.additionalIncome || 0;

  // Extra income transactions received during this cycle (freelance, bonus, cash gifts, friend repayments)
  const extraIncomeTotal = (transactions || [])
    .filter(tx => tx.type === 'income' && !tx.isScheduled)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalInflow = totalSalary + regularAdditionalIncome + extraIncomeTotal;
  
  // Fixed monthly commitments (Rent, EB bill, EMI, etc.)
  const fixedBills = profile.fixedExpenses || [];
  const totalFixedBills = fixedBills.reduce((sum, f) => sum + f.amount, 0);
  const paidFixedBills = fixedBills.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0);
  const pendingFixedBills = totalFixedBills - paidFixedBills;

  // Daily expenses from passbook / transactions
  const dailySpentTotal = calculations.actualSpentThisCycle || 0;

  // Total money spent so far = Daily expenses + Paid monthly bills
  const moneySpentTotal = dailySpentTotal + paidFixedBills;

  // Live in-hand balance: What you actually have right now
  const actualBalance = Math.max(0, totalInflow - moneySpentTotal);

  // ----------------------------------------------------
  // MONTHLY EXPENSES (Rent, Subscriptions, EB Bill, EMI, Other)
  // ----------------------------------------------------
  const [monthlyType, setMonthlyType] = useState<MonthlyOptionId>('Rent');
  const [customMonthlyName, setCustomMonthlyName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [monthlyDueDay, setMonthlyDueDay] = useState<number>(5);
  const [monthlyFilter, setMonthlyFilter] = useState<string>('All');

  const [monthlyTypeDropdownOpen, setMonthlyTypeDropdownOpen] = useState(false);
  const [monthlyDueDayDropdownOpen, setMonthlyDueDayDropdownOpen] = useState(false);
  const [monthlyFilterDropdownOpen, setMonthlyFilterDropdownOpen] = useState(false);
  const [dailyCategoryDropdownOpen, setDailyCategoryDropdownOpen] = useState(false);

  const monthlyTypeRef = useRef<HTMLDivElement>(null);
  const monthlyDueDayRef = useRef<HTMLDivElement>(null);
  const monthlyFilterRef = useRef<HTMLDivElement>(null);
  const dailyCategoryRef = useRef<HTMLDivElement>(null);

  // Click outside listener for all custom popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthlyTypeRef.current && !monthlyTypeRef.current.contains(e.target as Node)) {
        setMonthlyTypeDropdownOpen(false);
      }
      if (monthlyDueDayRef.current && !monthlyDueDayRef.current.contains(e.target as Node)) {
        setMonthlyDueDayDropdownOpen(false);
      }
      if (monthlyFilterRef.current && !monthlyFilterRef.current.contains(e.target as Node)) {
        setMonthlyFilterDropdownOpen(false);
      }
      if (dailyCategoryRef.current && !dailyCategoryRef.current.contains(e.target as Node)) {
        setDailyCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMonthlyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(monthlyAmount);
    if (!num || num <= 0) return;

    let finalName = monthlyType as string;
    let categoryName = 'Rent & Housing';

    if (monthlyType === 'Rent') {
      finalName = 'House Rent';
      categoryName = 'Rent & Housing';
    } else if (monthlyType === 'Subscriptions') {
      finalName = customMonthlyName.trim() || 'Monthly Subscription';
      categoryName = 'Subscriptions';
    } else if (monthlyType === 'EB Bill') {
      finalName = 'EB Electricity Bill';
      categoryName = 'Utilities & Bills';
    } else if (monthlyType === 'EMI') {
      finalName = customMonthlyName.trim() ? `${customMonthlyName.trim()} EMI` : 'Loan / EMI';
      categoryName = 'EMI & Loans';
    } else {
      finalName = customMonthlyName.trim() || 'Monthly Expense';
      categoryName = 'Other';
    }

    addFixedExpense({
      name: finalName,
      category: categoryName,
      amount: num,
      dueDay: monthlyDueDay,
      isPaid: false,
    });

    setMonthlyAmount('');
    setCustomMonthlyName('');
    showToast(`✓ Saved ${finalName} (${formatCurrency(num, profile.currency)}, due on ${monthlyDueDay}${getOrdinal(monthlyDueDay)})`);
  };

  // ----------------------------------------------------
  // DAILY EXPENSES (Transport, Food, Snacks, Others)
  // ----------------------------------------------------
  const [dailyCategory, setDailyCategory] = useState<DailyOptionId>('Food');
  const [customDailyName, setCustomDailyName] = useState('');
  const [dailyAmount, setDailyAmount] = useState('');

  const handleAddDailyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(dailyAmount);
    if (!num || num <= 0) return;

    let categoryString = 'Groceries & Food';
    let defaultDesc = 'Food / Meal';

    if (dailyCategory === 'Transport') {
      categoryString = 'Transport & Fuel';
      defaultDesc = customDailyName.trim() || 'Auto / Bus / Travel';
    } else if (dailyCategory === 'Food') {
      categoryString = 'Groceries & Food';
      defaultDesc = customDailyName.trim() || 'Lunch / Dinner / Groceries';
    } else if (dailyCategory === 'Snacks') {
      categoryString = 'Dining & Cafes';
      defaultDesc = customDailyName.trim() || 'Tea / Coffee / Snacks';
    } else {
      categoryString = 'Other';
      defaultDesc = customDailyName.trim() || 'Daily Spend';
    }

    addTransaction({
      amount: num,
      type: 'expense',
      category: categoryString,
      description: defaultDesc,
      date: todayStr,
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'UPI' as PaymentMethod,
    });

    setDailyAmount('');
    setCustomDailyName('');
    showToast(`✓ Deducted ${formatCurrency(num, profile.currency)} for ${defaultDesc}!`);
  };

  // Add in-between / one-time extra money directly to Live Balance
  const handleAddInBetweenIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(incomeAmount);
    if (!num || num <= 0) return;
    const finalDesc = incomeDescription.trim() || incomeReason || 'In-Between Money';

    addTransaction({
      amount: num,
      type: 'income',
      category: 'Income',
      description: finalDesc,
      date: todayStr,
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'UPI' as PaymentMethod,
    });

    setIncomeAmount('');
    setIncomeDescription('');
    setIsIncomeModalOpen(false);
    showToast(`✓ Added ${formatCurrency(num, profile.currency)} to your Live Balance!`);
  };



  // Filtered bills
  const filteredBills = fixedBills.filter(b => {
    if (monthlyFilter === 'All') return true;
    if (monthlyFilter === 'Unpaid') return !b.isPaid;
    if (monthlyFilter === 'Paid') return b.isPaid;
    if (monthlyFilter === 'Rent') return b.category.includes('Rent') || b.name.toLowerCase().includes('rent');
    if (monthlyFilter === 'Subscriptions') return b.category.includes('Subscrip') || b.name.toLowerCase().includes('subscrip');
    if (monthlyFilter === 'EB Bill') return b.name.toLowerCase().includes('eb') || b.name.toLowerCase().includes('electr');
    if (monthlyFilter === 'EMI') return b.category.includes('EMI') || b.name.toLowerCase().includes('emi');
    if (monthlyFilter === 'Other') return b.category.includes('Other') || (!b.name.toLowerCase().includes('rent') && !b.name.toLowerCase().includes('eb') && !b.category.includes('Subscrip') && !b.category.includes('EMI'));
    return true;
  });

  const selectedMonthlyOption = MONTHLY_OPTIONS.find(o => o.id === monthlyType) || MONTHLY_OPTIONS[0];
  const selectedDailyOption = DAILY_OPTIONS.find(o => o.id === dailyCategory) || DAILY_OPTIONS[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161726] border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP SECTION: MONEY IN HAND (LEFT) vs TOTAL SALARY (RIGHT) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* LEFT SIDE: HOW MUCH THEY ACTUALLY HAVE (CASH IN HAND) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c120e] via-[#080d0a] to-[#040705] border-2 border-emerald-500/50 p-6 sm:p-7 shadow-2xl shadow-black/80 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                How Much You Actually Have
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#caa052] to-[#dfba6f] hover:from-[#dfba6f] hover:to-[#ecd095] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#caa052]/30 transition hover:scale-105 active:scale-95"
                  title="Add in-between money (bonus, freelance, friend repayment, gift)"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Extra Money</span>
                </button>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white/[0.08] text-zinc-200 border border-white/[0.15]">
                  Live Balance
                </span>
              </div>
            </div>

            <div className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-2.5">
              {formatCurrency(actualBalance, profile.currency)}
            </div>

            <p className="text-xs text-zinc-300 font-medium mt-1.5">
              Available to spend right now after all recorded expenses and payments.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.12] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-bold">Total Spent so far:</span>
              <div className="text-right">
                <span className="text-rose-400 font-black">-{formatCurrency(moneySpentTotal, profile.currency)}</span>
                {paidFixedBills > 0 && (
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    ({formatCurrency(paidFixedBills, profile.currency)} bills + {formatCurrency(dailySpentTotal, profile.currency)} daily)
                  </span>
                )}
              </div>
            </div>
            {extraIncomeTotal > 0 && (
              <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08]">
                <span className="text-zinc-200 font-bold">Extra In-Between Money Added:</span>
                <span className="text-emerald-400 font-black text-sm">+{formatCurrency(extraIncomeTotal, profile.currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: TOTAL SALARY */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16140e] via-[#0f0e08] to-[#080703] border border-[#caa052]/40 p-6 sm:p-7 shadow-2xl shadow-black/80 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#caa052]/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#ecd095] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#caa052]" />
                Total Monthly Salary
              </span>
              <button
                type="button"
                onClick={onOpenSetup}
                className="text-[11px] font-bold text-[#caa052] hover:text-[#ecd095] underline cursor-pointer"
              >
                Change Salary
              </button>
            </div>

            <div className="text-3xl sm:text-5xl font-black gold-text-gradient tracking-tight mt-2">
              {formatCurrency(totalSalary, profile.currency)}
            </div>

            <p className="text-xs text-zinc-400 mt-1.5">
              Fixed monthly in-hand income credited each salary cycle.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Days Left in Month:</span>
            <span className="text-zinc-200 font-bold">{calculations.daysRemaining} Days remaining</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DAILY EXPENSES (THEMED DROPDOWN: TRANSPORT, FOOD, SNACKS, OTHERS) */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0c14] border border-white/[0.1] shadow-xl space-y-5">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Daily Expenses (Transport, Food, Snacks, Others)
              </h2>
              <p className="text-xs text-zinc-400">
                Log everyday spends easily — automatically deducted from your Money in Hand.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Total Daily Spent: {formatCurrency(dailySpentTotal, profile.currency)}
            </span>
          </div>
        </div>

        {/* Daily Expense Entry Form with Themed Dropdown and Themed Stepper */}
        <form onSubmit={handleAddDailyExpense} className="p-4 rounded-2xl bg-[#121320] border border-white/[0.08] space-y-3">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enter Daily Expense Amount</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            
            {/* 1. Themed Dropdown for Daily Category */}
            <div className="sm:col-span-4 relative" ref={dailyCategoryRef}>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Choose Daily Category
              </label>

              <button
                type="button"
                onClick={() => setDailyCategoryDropdownOpen(!dailyCategoryDropdownOpen)}
                className={`w-full h-11 px-3.5 bg-[#181a2e] border rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                  dailyCategoryDropdownOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/25 bg-[#1c1f36]'
                    : 'border-white/[0.12] hover:border-white/25 hover:bg-[#1a1c32]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{selectedDailyOption.icon}</span>
                  <span className="text-xs font-bold text-white truncate">{selectedDailyOption.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 shrink-0 ${dailyCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Themed Daily Popover */}
              {dailyCategoryDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0c0e1a]/98 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-black p-1.5 max-h-60 overflow-y-auto custom-gold-scrollbar backdrop-blur-2xl animate-in fade-in zoom-in-95">
                  <div className="space-y-1">
                    {DAILY_OPTIONS.map(opt => {
                      const isSelected = dailyCategory === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setDailyCategory(opt.id);
                            setDailyCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500/25 to-transparent border border-emerald-500/40 text-white font-bold'
                              : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{opt.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white leading-tight truncate">{opt.label}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Custom Item / Note */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Note / Item (Optional)
              </label>
              <input
                type="text"
                placeholder={
                  dailyCategory === 'Transport' ? 'e.g. Auto, Metro' :
                  dailyCategory === 'Food' ? 'e.g. Lunch, Rice' :
                  dailyCategory === 'Snacks' ? 'e.g. Tea & biscuit' : 'e.g. Medicine, Haircut'
                }
                value={customDailyName}
                onChange={(e) => setCustomDailyName(e.target.value)}
                className="w-full h-11 bg-[#181a2e] border border-white/[0.12] focus:border-emerald-500 rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            {/* 3. Daily Amount Input with Theme-Related Up & Down Stepper */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0"
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(e.target.value)}
                  className="w-full h-11 bg-[#181a2e] border border-white/[0.12] focus:border-emerald-500 rounded-xl pl-7 pr-11 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />

                {/* Theme-Related Up & Down Stepper Controls */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center border border-white/[0.12] rounded-lg bg-[#0e101b] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(dailyAmount) || 0;
                      setDailyAmount(String(current + 50));
                    }}
                    className="px-1.5 py-0.5 hover:bg-emerald-500/25 text-zinc-400 hover:text-emerald-300 transition cursor-pointer"
                    title="Increase ₹50"
                  >
                    <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <div className="w-full h-px bg-white/[0.1]" />
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(dailyAmount) || 0;
                      setDailyAmount(String(Math.max(0, current - 50)));
                    }}
                    className="px-1.5 py-0.5 hover:bg-emerald-500/25 text-zinc-400 hover:text-emerald-300 transition cursor-pointer"
                    title="Decrease ₹50"
                  >
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Deduct Spend Button */}
            <div className="sm:col-span-2">
              <label className="hidden sm:block text-[11px] font-bold opacity-0 mb-1 select-none pointer-events-none leading-4">&nbsp;</label>
              <button
                type="submit"
                className="w-full h-11 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Deduct Spend</span>
              </button>
            </div>

          </div>
        </form>

      </div>

      {/* ======================================================== */}
      {/* MONTHLY EXPENSES (THEMED DROPDOWN: RENT, SUBSCRIPTIONS, EB BILL, EMI, OTHER) */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0c14] border border-white/[0.1] shadow-xl space-y-5">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Monthly Expenses (Rent, EB Bill, Subscriptions, EMI)
              </h2>
              <p className="text-xs text-zinc-400">
                Mandatory fixed payments reserved from your salary each month.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Total Bills: {formatCurrency(totalFixedBills, profile.currency)}
            </span>
          </div>
        </div>

        {/* Form with Matched Theme Dropdown and Themed Stepper */}
        <form onSubmit={handleAddMonthlyExpense} className="p-4 rounded-2xl bg-[#121320] border border-white/[0.08] space-y-3">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#caa052]" />
            <span>Record Monthly Payment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            
            {/* 1. Custom Theme Popover Dropdown for Payment Type */}
            <div className={(monthlyType === 'Subscriptions' || monthlyType === 'EMI' || monthlyType === 'Other') ? 'sm:col-span-3 relative' : 'sm:col-span-3 relative'} ref={monthlyTypeRef}>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Choose Payment Type
              </label>
              
              <button
                type="button"
                onClick={() => setMonthlyTypeDropdownOpen(!monthlyTypeDropdownOpen)}
                className={`w-full h-11 px-3.5 bg-[#181a2e] border rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                  monthlyTypeDropdownOpen
                    ? 'border-[#caa052] ring-2 ring-[#caa052]/25 bg-[#1c1f36]'
                    : 'border-white/[0.12] hover:border-white/25 hover:bg-[#1a1c32]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{selectedMonthlyOption.icon}</span>
                  <span className="text-xs font-bold text-white truncate">{selectedMonthlyOption.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#caa052] transition-transform duration-200 shrink-0 ${monthlyTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Themed Popover Menu */}
              {monthlyTypeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0c0e1a]/98 border border-[#caa052]/40 rounded-2xl shadow-2xl shadow-black p-1.5 max-h-60 overflow-y-auto custom-gold-scrollbar backdrop-blur-2xl animate-in fade-in zoom-in-95">
                  <div className="space-y-1">
                    {MONTHLY_OPTIONS.map(opt => {
                      const isSelected = monthlyType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setMonthlyType(opt.id);
                            setMonthlyTypeDropdownOpen(false);
                            if (opt.id === 'Rent') setMonthlyDueDay(5);
                            else if (opt.id === 'EB Bill') setMonthlyDueDay(15);
                            else if (opt.id === 'EMI') setMonthlyDueDay(10);
                            else if (opt.id === 'Subscriptions') setMonthlyDueDay(5);
                          }}
                          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#caa052]/25 to-transparent border border-[#caa052]/40 text-white font-bold'
                              : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{opt.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white leading-tight truncate">{opt.label}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#caa052] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Custom Name Input (If Subscriptions, EMI or Other) */}
            {(monthlyType === 'Subscriptions' || monthlyType === 'EMI' || monthlyType === 'Other') && (
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                  Payment Name
                </label>
                <input
                  type="text"
                  placeholder={monthlyType === 'Subscriptions' ? 'e.g. Netflix, Prime' : monthlyType === 'EMI' ? 'e.g. Bike EMI, Phone' : 'e.g. Maid, Gym, Water'}
                  value={customMonthlyName}
                  onChange={(e) => setCustomMonthlyName(e.target.value)}
                  className="w-full h-11 bg-[#181a2e] border border-white/[0.12] focus:border-[#caa052] rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
              </div>
            )}

            {/* 3. Due Date / Pay on Date */}
            <div className={(monthlyType === 'Subscriptions' || monthlyType === 'EMI' || monthlyType === 'Other') ? 'sm:col-span-2 relative' : 'sm:col-span-3 relative'} ref={monthlyDueDayRef}>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Pay On Date (Day)
              </label>
              
              <button
                type="button"
                onClick={() => setMonthlyDueDayDropdownOpen(!monthlyDueDayDropdownOpen)}
                className={`w-full h-11 px-3 bg-[#181a2e] border rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                  monthlyDueDayDropdownOpen
                    ? 'border-[#caa052] ring-2 ring-[#caa052]/25 bg-[#1c1f36]'
                    : 'border-white/[0.12] hover:border-white/25 hover:bg-[#1a1c32]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-[#caa052] shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    {monthlyDueDay}{getOrdinal(monthlyDueDay)} of month
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#caa052] transition-transform duration-200 shrink-0 ${monthlyDueDayDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Themed Day Picker Popover */}
              {monthlyDueDayDropdownOpen && (
                <div className="absolute left-0 right-0 sm:w-64 top-full mt-2 z-50 bg-[#0c0e1a]/98 border border-[#caa052]/40 rounded-2xl shadow-2xl shadow-black p-3 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/[0.08]">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Pay On Date
                    </span>
                    <span className="text-xs font-black text-[#ecd095]">
                      Day {monthlyDueDay}{getOrdinal(monthlyDueDay)}
                    </span>
                  </div>

                  {/* Common Popular Due Dates */}
                  <div className="text-[10px] font-semibold text-zinc-400 mb-1.5">Common Pay Days:</div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                    {[1, 5, 10, 15, 20, 25, 28, 30].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setMonthlyDueDay(day);
                          setMonthlyDueDayDropdownOpen(false);
                        }}
                        className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          monthlyDueDay === day
                            ? 'bg-[#caa052] text-black font-black'
                            : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1]'
                        }`}
                      >
                        {day}{getOrdinal(day)}
                      </button>
                    ))}
                  </div>

                  {/* 1 - 31 Grid */}
                  <div className="text-[10px] font-semibold text-zinc-400 mb-1 pt-1.5 border-t border-white/[0.06]">
                    Or Pick Any Day (1 - 31):
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setMonthlyDueDay(day);
                          setMonthlyDueDayDropdownOpen(false);
                        }}
                        className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                          monthlyDueDay === day
                            ? 'bg-[#caa052] text-black font-black ring-1 ring-[#caa052]'
                            : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Amount Input with Theme-Related Up & Down Stepper Controls */}
            <div className={(monthlyType === 'Subscriptions' || monthlyType === 'EMI' || monthlyType === 'Other') ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 leading-4">
                Monthly Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#caa052]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 10000"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="w-full h-11 bg-[#181a2e] border border-white/[0.12] focus:border-[#caa052] rounded-xl pl-7 pr-11 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />

                {/* Theme-Related Up & Down Stepper Controls */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center border border-white/[0.12] rounded-lg bg-[#0e101b] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(monthlyAmount) || 0;
                      setMonthlyAmount(String(current + 500));
                    }}
                    className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                    title="Increase ₹500"
                  >
                    <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <div className="w-full h-px bg-white/[0.1]" />
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(monthlyAmount) || 0;
                      setMonthlyAmount(String(Math.max(0, current - 500)));
                    }}
                    className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                    title="Decrease ₹500"
                  >
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Save Payment Button */}
            <div className={(monthlyType === 'Subscriptions' || monthlyType === 'EMI' || monthlyType === 'Other') ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="hidden sm:block text-[11px] font-bold opacity-0 mb-1 select-none pointer-events-none leading-4">&nbsp;</label>
              <button
                type="submit"
                className="gold-pill-btn w-full h-11 px-4 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save Payment</span>
              </button>
            </div>

          </div>
        </form>

        {/* Bills Filter Themed Dropdown & Cards */}
        <div className="space-y-4 pt-2">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Your Monthly Payments
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-white/[0.08] text-[#ecd095] border border-white/[0.08]">
                {filteredBills.length}
              </span>
            </div>

            {/* Themed Filter Dropdown */}
            <div className="flex items-center gap-2 relative" ref={monthlyFilterRef}>
              <span className="text-[11px] text-zinc-400 font-semibold">Filter:</span>
              <button
                type="button"
                onClick={() => setMonthlyFilterDropdownOpen(!monthlyFilterDropdownOpen)}
                className="bg-[#141524] border border-white/[0.1] hover:border-[#caa052]/40 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-200 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{FILTER_OPTIONS.find(f => f.id === monthlyFilter)?.label || 'All Payments'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#caa052] transition-transform ${monthlyFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {monthlyFilterDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#0c0e1a]/98 border border-[#caa052]/40 rounded-2xl shadow-2xl p-1.5 w-48 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                  {FILTER_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setMonthlyFilter(f.id);
                        setMonthlyFilterDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        monthlyFilter === f.id ? 'bg-[#caa052]/20 text-[#ecd095]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{f.label}</span>
                      {monthlyFilter === f.id && <Check className="w-3.5 h-3.5 text-[#caa052]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Budget Summary Metrics (When at least 1 bill exists) */}
          {fixedBills.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#131525] border border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Monthly Fixed Bills</span>
                <div className="text-base sm:text-lg font-black text-white mt-0.5">
                  {formatCurrency(totalFixedBills, profile.currency)}
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold">{fixedBills.length} payments configured</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Paid So Far</span>
                <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
                  {formatCurrency(paidFixedBills, profile.currency)}
                </div>
                <span className="text-[10px] text-emerald-400/70 font-semibold">{fixedBills.filter(b => b.isPaid).length} payments cleared</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Remaining To Pay</span>
                <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                  {formatCurrency(pendingFixedBills, profile.currency)}
                </div>
                <span className="text-[10px] text-amber-400/70 font-semibold">{fixedBills.filter(b => !b.isPaid).length} payments pending</span>
              </div>
            </div>
          )}

          {/* Payments List or Spacious Empty State */}
          {filteredBills.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-[#121320] border border-white/[0.08] text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#caa052]/10 border border-[#caa052]/30 flex items-center justify-center mx-auto text-[#caa052] shadow-lg shadow-[#caa052]/10">
                <Home className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {monthlyFilter === 'All' 
                    ? 'No Monthly Payments Added Yet' 
                    : `No Payments Found Under "${monthlyFilter}"`}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Add your monthly commitments (House Rent, Electricity EB bill, Subscriptions, or EMIs) above so they are safeguarded from your daily spending balance.
                </p>
              </div>

              {monthlyFilter === 'All' && (
                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs text-zinc-500 font-semibold">Quick Prefill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyType('Rent');
                      setMonthlyAmount('10000');
                      setMonthlyDueDay(5);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#caa052]/20 border border-white/[0.1] hover:border-[#caa052]/40 text-xs font-bold text-zinc-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🏠 House Rent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyType('EB Bill');
                      setMonthlyAmount('1500');
                      setMonthlyDueDay(15);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#caa052]/20 border border-white/[0.1] hover:border-[#caa052]/40 text-xs font-bold text-zinc-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ EB Bill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyType('Subscriptions');
                      setCustomMonthlyName('Netflix & WiFi');
                      setMonthlyAmount('999');
                      setMonthlyDueDay(10);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#caa052]/20 border border-white/[0.1] hover:border-[#caa052]/40 text-xs font-bold text-zinc-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📱 Subscriptions</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBills.map(bill => {
                const isRent = bill.name.toLowerCase().includes('rent');
                const isEB = bill.name.toLowerCase().includes('eb') || bill.name.toLowerCase().includes('electr');
                const isSub = bill.category.includes('Subscrip');
                const isEMI = bill.category.includes('EMI');
                const icon = isRent ? '🏠' : isEB ? '⚡' : isSub ? '📱' : isEMI ? '💳' : '📄';
                const dueDay = bill.dueDay || 5;

                return (
                  <div
                    key={bill.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      bill.isPaid
                        ? 'bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/10'
                        : 'bg-[#131524] border-white/[0.08] hover:border-[#caa052]/40 hover:bg-[#16182a] shadow-lg'
                    }`}
                  >
                    {/* Left: Big Icon + Name + Category */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                        bill.isPaid 
                          ? 'bg-emerald-500/15 border-emerald-500/30' 
                          : 'bg-[#1c1f36] border-white/[0.1]'
                      }`}>
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white truncate">{bill.name}</h4>
                          {bill.isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                              PAID
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                              TO PAY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">
                          {bill.category} • Scheduled Monthly Payment
                        </p>
                      </div>
                    </div>

                    {/* Middle: Scheduled Due Date */}
                    <div className="flex items-center gap-2 shrink-0 sm:px-4 py-1.5 sm:py-0 border-y sm:border-y-0 sm:border-x border-white/[0.06]">
                      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#caa052]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                          Payment Schedule
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-[#ecd095]">
                          Give on Day {dueDay}{getOrdinal(dueDay)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                          Monthly Amount
                        </div>
                        <div className="text-base sm:text-xl font-black text-white">
                          {formatCurrency(bill.amount, profile.currency)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            toggleFixedExpensePaid(bill.id);
                            if (!bill.isPaid) {
                              showToast(`✓ Marked ${bill.name} as Paid (-${formatCurrency(bill.amount, profile.currency)} deducted from Live Balance)`);
                            } else {
                              showToast(`↺ Restored ${bill.name} to Unpaid (+${formatCurrency(bill.amount, profile.currency)} returned to Live Balance)`);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            bill.isPaid 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                              : 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{bill.isPaid ? 'Paid' : 'Mark as Paid'}</span>
                        </button>

                        {!bill.isPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteFixedExpense(bill.id);
                              showToast(`Removed ${bill.name}`);
                            }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 transition cursor-pointer"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>



      {/* Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* In-Between Money (One-Time Inflow) Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0d0f1b] border-2 border-[#caa052]/50 p-6 sm:p-7 shadow-2xl shadow-black relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-white/[0.1]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#caa052]/20 border border-[#caa052]/40 flex items-center justify-center text-[#ecd095]">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Add In-Between Money
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 font-medium mt-1">
                  One-time extra cash (bonus, freelance, friend repayment, gift) added directly to your Live Balance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomeModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddInBetweenIncome} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-200 mb-1.5">
                  Amount Received (₹) *
                </label>
                <div className="relative rounded-xl overflow-hidden border border-white/[0.18] focus-within:border-[#caa052] bg-[#161828]">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-[#caa052]">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    autoFocus
                    placeholder="0"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-full h-12 bg-transparent pl-9 pr-4 text-xl font-black text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[500, 1000, 2000, 5000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIncomeAmount(String(val))}
                      className="px-3 py-1.5 rounded-lg bg-[#1f2238] hover:bg-[#caa052] hover:text-black border border-white/[0.15] hover:border-[#caa052] text-xs font-extrabold text-zinc-200 transition cursor-pointer"
                    >
                      +{formatCurrency(val, profile.currency)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source / Reason Chips */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-200 mb-1.5">
                  Where did this money come from?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCOME_REASONS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setIncomeReason(r.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs transition cursor-pointer text-left border ${
                        incomeReason === r.id
                          ? 'bg-[#caa052] text-black border-2 border-[#caa052] font-black shadow-md shadow-[#caa052]/20'
                          : 'bg-[#161828] text-zinc-200 border-white/[0.12] hover:bg-[#20233b] hover:border-white/25 font-bold'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-200 mb-1.5">
                  Note / Person Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul returned dinner money / Diwali bonus"
                  value={incomeDescription}
                  onChange={(e) => setIncomeDescription(e.target.value)}
                  className="w-full h-11 bg-[#161828] border border-white/[0.15] focus:border-[#caa052] rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#caa052] via-[#dfba6f] to-[#caa052] hover:from-[#dfba6f] hover:to-[#ecd095] text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#caa052]/30 transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add to Live Balance Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
