import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  ShieldCheck, 
  Flame, 
  X,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../hooks/useFinance';
import { formatINR, formatDate } from '../../utils/formatters';
import { SavingsGoal } from '../../types';
import { Card, StatCard, ProgressBar, Badge, CustomSelect } from '../../components/ui';

export const SavingsView: React.FC = () => {
  const { 
    savingsGoals, 
    profile, 
    depositToGoal, 
    withdrawFromGoal, 
    addSavingsGoal 
  } = useFinance();

  const [activeGoalModal, setActiveGoalModal] = useState<{ goal: SavingsGoal; mode: 'deposit' | 'withdraw' } | null>(null);
  const [modalAmount, setModalAmount] = useState<string>('');
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newCategory, setNewCategory] = useState<SavingsGoal['category']>('General');

  const totalInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const fixedTotal = profile.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlyEssential = fixedTotal + 20000;
  const emergencyRunwayMonths = (profile.currentSavings / (monthlyEssential || 1)).toFixed(1);
  const targetEmergencyFund = monthlyEssential * (profile.emergencyFundMonthsTarget || 6);
  const emergencyFundPercent = Math.min(100, Math.round((profile.currentSavings / targetEmergencyFund) * 100));

  const handleDepositWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalModal) return;

    const amt = parseFloat(modalAmount);
    if (!amt || amt <= 0) return;

    if (activeGoalModal.mode === 'deposit') {
      depositToGoal(activeGoalModal.goal.id, amt);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      withdrawFromGoal(activeGoalModal.goal.id, amt);
    }

    setActiveGoalModal(null);
    setModalAmount('');
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(newTarget);
    if (!newTitle.trim() || !targetAmt || targetAmt <= 0) return;

    const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addSavingsGoal({
      title: newTitle.trim(),
      targetAmount: targetAmt,
      deadline: newDeadline || `${new Date().getFullYear() + 1}-12-31`,
      category: newCategory,
      icon: 'Target',
      color: randomColor,
    });

    setNewGoalModalOpen(false);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PiggyBank className="w-4 h-4" /> Goal-Based Wealth Building
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Savings & Wealth Goals</h2>
          <p className="text-xs text-slate-400">
            Automate monthly allocations, safeguard your emergency fund, and track milestone deadlines
          </p>
        </div>

        <button
          onClick={() => setNewGoalModalOpen(true)}
          className="gold-pill-btn px-4 sm:px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Goal</span>
        </button>
      </Card>

      {/* Emergency Fund Runway Hero Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#12141d] via-[#0c0d14] to-[#060609] border border-[#caa052]/30 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caa052]/10 border border-[#caa052]/30 text-[#ecd095] text-[10px] font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#caa052]" />
              <span>Capital Defense Runway</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {emergencyRunwayMonths} Months of Essential Living Buffer
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Based on your fixed monthly commitments of {formatINR(fixedTotal)} plus essential groceries.
              Your liquid reserve of {formatINR(profile.currentSavings)} guarantees financial safety and resilience.
            </p>
          </div>

          <div className="p-5 bg-black/60 rounded-2xl border border-white/[0.08] text-center shrink-0 w-full md:w-64 space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-400">Target: {profile.emergencyFundMonthsTarget || 6} Months</span>
              <span className="text-emerald-400 font-bold">{emergencyFundPercent}% Ready</span>
            </div>
            <ProgressBar percent={emergencyFundPercent} height="h-2.5" color="#10b981" />
            <div className="text-[11px] text-zinc-400 pt-1">
              Safety Target: {formatINR(targetEmergencyFund)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Accumulated Savings"
          value={formatINR(profile.currentSavings)}
          subtext={`${formatINR(totalInGoals)} allocated across ${savingsGoals.length} active goals`}
        />
        <StatCard
          label="Monthly Savings Target"
          value={formatINR(profile.monthlySavingsTarget)}
          subtext="Automatically deducted from discretionary spending"
          valueColor="text-emerald-400"
        />
        <Card className="p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Savings Streak</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">14 Days</div>
            <div className="text-[11px] text-slate-400 mt-1">Under daily allowance every day! 🔥</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg">
            ⚡
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Savings Goals ({savingsGoals.length})</h3>
          <span className="text-xs text-slate-400">Click deposit to add savings directly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savingsGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <Card key={goal.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}40` }}
                    >
                      <Target className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{goal.title}</h4>
                      <div className="text-xs text-slate-400">
                        {goal.category} • Target Date: {formatDate(goal.deadline)}
                      </div>
                    </div>
                  </div>

                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                  >
                    {percent}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{formatINR(goal.currentAmount)}</span>
                    <span className="text-slate-400">Target: {formatINR(goal.targetAmount)}</span>
                  </div>
                  <ProgressBar percent={percent} color={goal.color} height="h-2.5" />
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Remaining: {formatINR(remaining)}</span>
                    {percent >= 100 && <span className="text-emerald-400 font-bold">Goal Completed! 🎉</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveGoalModal({ goal, mode: 'withdraw' })}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setActiveGoalModal({ goal, mode: 'deposit' })}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Deposit</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {activeGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {activeGoalModal.mode === 'deposit' ? 'Deposit to Goal' : 'Withdraw from Goal'}
              </h3>
              <button
                onClick={() => setActiveGoalModal(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              {activeGoalModal.goal.title} • Current balance: {formatINR(activeGoalModal.goal.currentAmount)}
            </p>

            <form onSubmit={handleDepositWithdrawSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={modalAmount}
                  onChange={e => setModalAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-lg font-bold text-white focus:outline-none focus:border-[#caa052] transition"
                />
              </div>

              <div className="flex gap-2">
                {[1000, 5000, 10000, 25000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setModalAmount(String(amt))}
                    className="flex-1 py-1.5 text-[11px] bg-black/60 hover:bg-black/90 border border-white/[0.08] hover:border-[#caa052]/30 text-zinc-300 rounded-lg font-medium cursor-pointer transition"
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveGoalModal(null)}
                  className="dark-pill-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  {activeGoalModal.mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/[0.08] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Create New Savings Goal</h3>
              <button
                onClick={() => setNewGoalModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japan Autumn Foliage Trip, Sony A7IV Camera"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#caa052] transition"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Target Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white font-bold focus:outline-none focus:border-[#caa052] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Category</label>
                  <CustomSelect
                    value={newCategory}
                    onChange={val => setNewCategory(val as any)}
                    options={[
                      { value: 'General', label: 'General' },
                      { value: 'Travel', label: 'Travel' },
                      { value: 'Gadget', label: 'Gadget & Tech' },
                      { value: 'Emergency', label: 'Emergency' },
                      { value: 'Vehicle', label: 'Vehicle' },
                      { value: 'Investment', label: 'Investment' }
                    ]}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewGoalModalOpen(false)}
                  className="dark-pill-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
