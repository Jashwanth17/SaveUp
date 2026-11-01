import React, { useState } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { FixedExpense } from '../../types';
import { formatINR } from '../../utils/formatters';
import { CustomSelect } from '../../components/ui';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  const { profile, setProfile, categories } = useFinance();

  const [salary, setSalary] = useState<number>(profile.monthlyInHandSalary);
  const [ctc, setCtc] = useState<number>(profile.annualCtc || 0);
  const [salaryDate, setSalaryDate] = useState<number>(profile.salaryCreditDate || 1);
  const [otherIncome, setOtherIncome] = useState<number>(profile.additionalIncome || 0);
  const [savingsTarget, setSavingsTarget] = useState<number>(profile.monthlySavingsTarget);
  const [currentSavings, setCurrentSavings] = useState<number>(profile.currentSavings);
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<number>(profile.emergencyFundMonthsTarget || 6);
  const [carryForward, setCarryForward] = useState<boolean>(profile.carryForwardDailySavings ?? true);

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(profile.fixedExpenses);

  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState(categories[0]?.name || 'Rent & Housing');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDueDay, setNewExpenseDueDay] = useState(5);

  if (!isOpen) return null;

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
    });
    onClose();
  };

  const totalFixed = fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const spendablePool = Math.max(0, salary + otherIncome - totalFixed - savingsTarget);
  const estimatedDaily = Math.round(spendablePool / 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c0d14] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#caa052]/10 border border-[#caa052]/30 flex items-center justify-center text-[#caa052]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Financial Setup & Salary Cycle</h2>
              <p className="text-xs text-zinc-400">Configure salary parameters, fixed obligations & savings targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black/60 px-6 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-zinc-400">Total Inflow: </span>
            <span className="font-bold text-emerald-400">+{formatINR(salary + otherIncome)}</span>
          </div>
          <div>
            <span className="text-zinc-400">Fixed Obligations: </span>
            <span className="font-bold text-rose-400">-{formatINR(totalFixed)}</span>
          </div>
          <div>
            <span className="text-zinc-400">Savings Target: </span>
            <span className="font-bold text-[#ecd095]">-{formatINR(savingsTarget)}</span>
          </div>
          <div className="bg-[#caa052]/10 border border-[#caa052]/30 px-3 py-1 rounded-full">
            <span className="text-zinc-300 font-medium">Estimated Ceiling: </span>
            <span className="font-extrabold text-[#ecd095]">~{formatINR(estimatedDaily)}/day</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-gold-scrollbar space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              1. Income & Salary Cycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly In-Hand Salary (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={e => setSalary(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#caa052] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Salary Credit Date (Day of Month) *
                </label>
                <CustomSelect
                  value={salaryDate}
                  onChange={val => setSalaryDate(Number(val) || 1)}
                  options={Array.from({ length: 31 }, (_, i) => i + 1).map(day => ({
                    value: day,
                    label: `${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month ${day === 1 ? '(Standard 1st)' : day === 25 ? '(25th Corporate)' : ''}`
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Annual CTC (Optional)
                </label>
                <input
                  type="number"
                  value={ctc || ''}
                  onChange={e => setCtc(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1800000"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Additional Regular Income (₹/month)
                </label>
                <input
                  type="number"
                  value={otherIncome || ''}
                  onChange={e => setOtherIncome(parseFloat(e.target.value) || 0)}
                  placeholder="Freelance, dividends, advisory"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                2. Fixed Commitments & Bills ({fixedExpenses.length})
              </h3>
              <span className="text-xs text-rose-400 font-semibold">
                Total: {formatINR(totalFixed)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              SaveUp automatically reserves these amounts from your salary so you can never accidentally overspend them.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fixedExpenses.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.category} • Due: {item.dueDay}th)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400">{formatINR(item.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFixedExpense(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-slate-300">Add New Commitment</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Expense Name (e.g. Rent)"
                  value={newExpenseName}
                  onChange={e => setNewExpenseName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
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
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Due Day"
                    value={newExpenseDueDay}
                    onChange={e => setNewExpenseDueDay(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFixedExpense}
                    className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Savings Targets & Emergency Fund
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly Savings Target (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={savingsTarget}
                  onChange={e => setSavingsTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Accumulated Savings (₹)
                </label>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={e => setCurrentSavings(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Emergency Fund Runway Goal
                </label>
                <CustomSelect
                  value={emergencyTargetMonths}
                  onChange={val => setEmergencyTargetMonths(Number(val) || 6)}
                  options={[
                    { value: 3, label: '3 Months of Essential Expenses' },
                    { value: 6, label: '6 Months of Essential Expenses (Recommended)' },
                    { value: 9, label: '9 Months of Essential Expenses' },
                    { value: 12, label: '12 Months of Essential Expenses' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Daily Surplus Carry-Forward</div>
                  <div className="text-[11px] text-slate-400">Roll unspent daily allowance to next day</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCarryForward(!carryForward)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    carryForward ? 'bg-[#caa052]' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      carryForward ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="dark-pill-btn px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-pill-btn px-6 py-2.5 text-xs font-bold cursor-pointer"
            >
              Save Configuration & Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
