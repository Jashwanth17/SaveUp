import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Wallet, CalendarDays, PiggyBank } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { FixedExpense } from '../../types';
import { formatINR } from '../../utils/formatters';
import { CustomSelect } from '../../components/ui';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  const { profile, setProfile, categories, loadSampleData } = useFinance();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Salary & Pay Cycle
  const [salary, setSalary] = useState<number>(profile.monthlyInHandSalary || 0);
  const [ctc, setCtc] = useState<number>(profile.annualCtc || 0);
  const [salaryDate, setSalaryDate] = useState<number>(profile.salaryCreditDate || 1);
  const [otherIncome, setOtherIncome] = useState<number>(profile.additionalIncome || 0);

  // Step 2: Fixed Commitments
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(profile.fixedExpenses || []);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState(categories[0]?.name || 'Rent & Housing');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDueDay, setNewExpenseDueDay] = useState(5);

  // Step 3: Savings Target & Emergency Fund
  const [savingsTarget, setSavingsTarget] = useState<number>(profile.monthlySavingsTarget || 0);
  const [currentSavings, setCurrentSavings] = useState<number>(profile.currentSavings || 0);
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<number>(profile.emergencyFundMonthsTarget || 6);
  const [carryForward, setCarryForward] = useState<boolean>(profile.carryForwardDailySavings ?? true);

  if (!isOpen) return null;

  const totalFixed = fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalInflow = salary + otherIncome;
  const spendablePool = Math.max(0, totalInflow - totalFixed - savingsTarget);
  const estimatedDaily = Math.round(spendablePool / 30);

  const handleAddFixedExpense = () => {
    const amt = parseFloat(newExpenseAmount);
    if (!newExpenseName.trim() || !amt || amt <= 0) return;

    const newExpense: FixedExpense = {
      id: `fix-${Date.now()}`,
      name: newExpenseName.trim(),
      category: newExpenseCategory,
      amount: amt,
      dueDay: newExpenseDueDay,
      isPaid: false,
    };

    setFixedExpenses([...fixedExpenses, newExpense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpenseDueDay(5);
  };

  const handleRemoveFixedExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
  };

  const handleApplyPresetSavings = (percentage: number) => {
    const calculated = Math.round((salary * percentage) / 100);
    setSavingsTarget(calculated);
  };

  const handleCompleteSetup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfile({
      ...profile,
      monthlyInHandSalary: salary,
      annualCtc: ctc > 0 ? ctc : undefined,
      salaryCreditDate: salaryDate,
      additionalIncome: otherIncome,
      fixedExpenses,
      monthlySavingsTarget: savingsTarget,
      currentSavings,
      emergencyFundMonthsTarget: emergencyTargetMonths,
      carryForwardDailySavings: carryForward,
      isSetupCompleted: true,
    });
    onClose();
  };

  const handleLoadDemo = () => {
    loadSampleData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c0d14] border border-[#caa052]/35 rounded-3xl shadow-2xl shadow-black overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20">
              <span className="font-serif font-black text-xs text-[#ecd095]">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Financial Profile Setup</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#caa052]/10 text-[#ecd095] border border-[#caa052]/30">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-zinc-400">Configure your personal salary cycle and daily spending ceiling</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Callout Banner */}
        <div className="px-6 py-2.5 bg-[#caa052]/5 border-b border-[#caa052]/15 flex items-center gap-2.5 text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-[#caa052] shrink-0" />
          <span>
            <strong className="text-zinc-100 font-semibold">100% Private & Device-Local:</strong> No bank accounts linked. You manually control and maintain every rupee.
          </span>
        </div>

        {/* 3 Step Interactive Indicator */}
        <div className="px-6 py-3 border-b border-white/[0.06] bg-black/30 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 transition cursor-pointer ${
              step === 1 ? 'text-[#fce8bd] font-bold' : step > 1 ? 'text-zinc-300' : 'text-zinc-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 1 ? 'bg-[#caa052] text-black' : step > 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-zinc-400'
            }`}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span className="hidden sm:inline">1. Salary & Payday</span>
          </button>

          <div className={`h-[1px] flex-1 mx-3 ${step >= 2 ? 'bg-[#caa052]/40' : 'bg-white/10'}`} />

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 transition cursor-pointer ${
              step === 2 ? 'text-[#fce8bd] font-bold' : step > 2 ? 'text-zinc-300' : 'text-zinc-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 2 ? 'bg-[#caa052] text-black' : step > 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-zinc-400'
            }`}>
              {step > 2 ? '✓' : '2'}
            </span>
            <span className="hidden sm:inline">2. Fixed Commitments</span>
          </button>

          <div className={`h-[1px] flex-1 mx-3 ${step === 3 ? 'bg-[#caa052]/40' : 'bg-white/10'}`} />

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 transition cursor-pointer ${
              step === 3 ? 'text-[#fce8bd] font-bold' : 'text-zinc-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 3 ? 'bg-[#caa052] text-black' : 'bg-white/10 text-zinc-400'
            }`}>
              3
            </span>
            <span className="hidden sm:inline">3. Savings & Allowance</span>
          </button>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-6 overflow-y-auto custom-gold-scrollbar flex-1 space-y-6">
          
          {/* STEP 1: Salary & Payday Cycle */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#caa052] uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Step 1: Your Income & Salary Cycle
                </div>
                <h3 className="text-lg font-bold text-white">How much do you bring home each month?</h3>
                <p className="text-xs text-zinc-400">
                  SaveUp calculates your exact daily spending runway based on this in-hand credit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Monthly In-Hand Salary (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 75000"
                      value={salary || ''}
                      onChange={e => setSalary(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-3 bg-black/60 border border-white/[0.1] rounded-xl text-base font-bold text-white focus:outline-none focus:border-[#caa052] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Salary Credit Date (Day of Month) *
                  </label>
                  <CustomSelect
                    value={salaryDate}
                    onChange={val => setSalaryDate(Number(val) || 1)}
                    options={Array.from({ length: 31 }, (_, i) => i + 1).map(day => ({
                      value: day,
                      label: `${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month ${day === 1 ? '(1st of month)' : day === 25 ? '(25th Corporate)' : ''}`
                    }))}
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Your 30-day budget cycle starts on this day.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Additional Regular Income (₹/month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={otherIncome || ''}
                    onChange={e => setOtherIncome(parseFloat(e.target.value) || 0)}
                    placeholder="Freelance, dividends, rental"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#caa052] transition"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Leave empty or 0 if only salary.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Annual CTC (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ctc || ''}
                    onChange={e => setCtc(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1200000"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/[0.1] rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Fixed Commitments */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#caa052] uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Step 2: Fixed Commitments & Mandatory Bills
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">What must be paid from your salary?</h3>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    Total: {formatINR(totalFixed)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  SaveUp reserves this money upfront so you never accidentally spend rent or loan payments.
                </p>
              </div>

              {/* Added commitments list */}
              <div className="space-y-2">
                {fixedExpenses.length === 0 ? (
                  <div className="p-4 bg-black/40 border border-white/[0.06] rounded-2xl text-center text-xs text-zinc-400">
                    No fixed commitments added yet. Add items like Rent, Loan EMI, Wi-Fi, or Society fees below.
                  </div>
                ) : (
                  fixedExpenses.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-black/50 border border-white/[0.08] rounded-xl text-xs hover:border-[#caa052]/30 transition"
                    >
                      <div>
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-zinc-400 ml-2">({item.category} • Due: {item.dueDay}th)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-rose-400">{formatINR(item.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFixedExpense(item.id)}
                          className="text-zinc-400 hover:text-rose-400 p-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add commitment form */}
              <div className="p-4 bg-black/60 border border-white/[0.08] rounded-2xl space-y-3">
                <div className="text-xs font-bold text-zinc-200">Add Mandatory Obligation</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="Name (e.g. Rent, HDFC EMI)"
                    value={newExpenseName}
                    onChange={e => setNewExpenseName(e.target.value)}
                    className="px-3 py-2 bg-black/80 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#caa052]"
                  />
                  <CustomSelect
                    value={newExpenseCategory}
                    onChange={val => setNewExpenseCategory(String(val))}
                    options={categories.map(c => ({
                      value: c.name,
                      label: c.name,
                      icon: c.icon,
                      color: c.color
                    }))}
                    showCategoryIcon={true}
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={newExpenseAmount}
                    onChange={e => setNewExpenseAmount(e.target.value)}
                    className="px-3 py-2 bg-black/80 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#caa052]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Due Day"
                      value={newExpenseDueDay}
                      onChange={e => setNewExpenseDueDay(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 bg-black/80 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#caa052]"
                    />
                    <button
                      type="button"
                      onClick={handleAddFixedExpense}
                      className="flex-1 gold-pill-btn px-3 py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Savings Target & Allowance Preview */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#caa052] uppercase tracking-wider flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4" /> Step 3: Monthly Savings Target & Allowance Preview
                </div>
                <h3 className="text-lg font-bold text-white">How much do you want to save every month?</h3>
                <p className="text-xs text-zinc-400">
                  SaveUp moves your savings aside first, then divides whatever is left by the days in the cycle.
                </p>
              </div>

              {/* Savings target input & quick presets */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Monthly Savings Target (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={savingsTarget || ''}
                    onChange={e => setSavingsTarget(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3.5 py-3 bg-black/60 border border-white/[0.1] rounded-xl text-base font-bold text-[#ecd095] focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>

                {salary > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-zinc-400">Quick presets:</span>
                    {[10, 20, 30, 40].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleApplyPresetSavings(pct)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#caa052]/10 border border-white/10 hover:border-[#caa052]/30 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        {pct}% ({formatINR((salary * pct) / 100)})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Fund Target & Carry-Forward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Current Savings Reserve (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentSavings || ''}
                    onChange={e => setCurrentSavings(parseFloat(e.target.value) || 0)}
                    placeholder="Total existing bank savings"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Emergency Fund Goal
                  </label>
                  <CustomSelect
                    value={emergencyTargetMonths}
                    onChange={val => setEmergencyTargetMonths(Number(val) || 6)}
                    options={[
                      { value: 3, label: '3 Months Buffer' },
                      { value: 6, label: '6 Months Buffer (Recommended)' },
                      { value: 9, label: '9 Months Buffer' },
                      { value: 12, label: '12 Months Buffer' },
                    ]}
                  />
                </div>
              </div>

              {/* Live Math Breakdown Box */}
              <div className="p-4 bg-gradient-to-br from-[#1c1810] via-[#0e0f17] to-[#07080c] border border-[#caa052]/40 rounded-2xl space-y-3 shadow-xl">
                <div className="text-xs font-extrabold text-[#ecd095] uppercase tracking-wider flex items-center justify-between">
                  <span>Your Live Spending Formula</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Calculated in Real-Time</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400">Total Inflow</span>
                    <div className="font-extrabold text-emerald-400 text-sm mt-0.5">+{formatINR(totalInflow)}</div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400">Fixed Commitments</span>
                    <div className="font-extrabold text-rose-400 text-sm mt-0.5">-{formatINR(totalFixed)}</div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400">Savings Target</span>
                    <div className="font-extrabold text-[#ecd095] text-sm mt-0.5">-{formatINR(savingsTarget)}</div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400">Spendable Pool</span>
                    <div className="font-extrabold text-white text-sm mt-0.5">={formatINR(spendablePool)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Your Safe Daily Spending Limit</div>
                    <div className="text-[11px] text-zinc-400">Spend within this ceiling every day to safely save {formatINR(savingsTarget)}</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black gold-text-gradient">
                    ~{formatINR(estimatedDaily)}/day
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={handleLoadDemo}
              className="text-xs text-zinc-400 hover:text-[#ecd095] underline cursor-pointer transition"
            >
              Want a preview? Explore with sample data
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="dark-pill-btn px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && salary <= 0}
                onClick={() => setStep((step + 1) as any)}
                className={`gold-pill-btn px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  step === 1 && salary <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteSetup}
                className="gold-pill-btn px-6 py-2.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Complete Setup & Launch Dashboard</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
