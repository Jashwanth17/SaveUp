import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Receipt, 
  Plus, 
  Users, 
  TrendingUp, 
  CreditCard 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { Transaction } from '../../types';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { ActiveTab } from '../../components/navigation/Sidebar';
import { Card, StatCard, ProgressBar, Badge } from '../../components/ui';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddTx: () => void;
  onOpenSetup: () => void;
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
    categories, 
    insights, 
    toggleFixedExpensePaid 
  } = useFinance();

  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const recentTransactions = transactions.slice(0, 5);

  const categorySpending = categories
    .map(cat => {
      const total = transactions
        .filter(tx => tx.type === 'expense' && tx.category === cat.name && !tx.isScheduled)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return {
        ...cat,
        spent: total,
        percent: cat.budgetLimit ? Math.min(100, Math.round((total / cat.budgetLimit) * 100)) : 0,
      };
    })
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const statusConfig = {
    healthy: {
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      text: 'On Track • Safe to Spend',
    },
    caution: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      text: 'Moderate Velocity',
    },
    critical: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      text: 'Budget Under Pressure',
    },
  }[calculations.status];

  const actualBalance = calculations.totalIncome - calculations.actualSpentThisCycle;
  const plannedBalance = actualBalance - calculations.upcomingScheduledBills - calculations.savingsAllocation;
  const projectedBalance = Math.max(0, plannedBalance);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero: Daily Spending Allowance & Live Gauge (Playerhub Gold & Obsidian) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Hero Card: Know What You Can Spend Today */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#101118] via-[#0c0d14] to-[#060609] border border-[#caa052]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black">
          {/* Subtle warm champagne gold ambient reflection */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#caa052]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caa052]/10 border border-[#caa052]/30 text-[#ecd095] text-[10px] font-bold tracking-widest uppercase mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#caa052] animate-pulse" />
                  <span>Cycle Day {calculations.daysPassed} • {calculations.daysRemaining} Days Remaining</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Know what you can spend today.
                </h1>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badge}`}>
                {statusConfig.text}
              </div>
            </div>

            {profile.monthlyInHandSalary === 0 && (
              <div className="p-4 bg-[#caa052]/10 border border-[#caa052]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <div className="font-bold text-[#ecd095] text-sm">Welcome to SaveUp — Set Up Your Salary Cycle</div>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    100% private & manual. Enter your monthly in-hand salary to calculate your safe daily limit.
                  </p>
                </div>
                <button
                  onClick={onOpenSetup}
                  className="gold-pill-btn px-4 py-2 text-xs font-extrabold shrink-0 cursor-pointer"
                >
                  Configure Setup →
                </button>
              </div>
            )}

            {/* Allowance Big Display in Champagne Gold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Safe Discretionary Ceiling</div>
                <div className="text-4xl sm:text-5xl font-black gold-text-gradient tracking-tight mt-1 flex items-baseline gap-2">
                  <span>{formatINR(calculations.dailyAllowanceToday)}</span>
                  <span className="text-sm font-semibold text-zinc-500">/day</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Recalibrated live from in-hand salary, reserved commitments, and savings targets.
                </p>

                {/* Sub breakdown: Red for spent, Green for remaining */}
                <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium">Spent Today:</span>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      -{formatINR(calculations.actualDailySpendToday)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium">Remaining Today:</span>
                    <div className={`text-sm font-bold mt-0.5 ${calculations.remainingTodayAllowance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {calculations.remainingTodayAllowance >= 0 ? '+' : ''}{formatINR(calculations.remainingTodayAllowance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Allowance Gauge */}
              <div className="p-5 bg-black/50 border border-white/[0.08] rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Daily Pacing Status</span>
                  <span className="text-[#ecd095] font-bold">{calculations.daysRemaining} days in cycle</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Allowance Consumption</span>
                    <span className="font-semibold text-white">
                      {calculations.dailyAllowanceToday > 0
                        ? `${Math.min(100, Math.round((calculations.actualDailySpendToday / calculations.dailyAllowanceToday) * 100))}%`
                        : '0%'}
                    </span>
                  </div>
                  <ProgressBar
                    percent={calculations.dailyAllowanceToday > 0 ? (calculations.actualDailySpendToday / calculations.dailyAllowanceToday) * 100 : 0}
                    height="h-2.5"
                    color={calculations.remainingTodayAllowance >= 0 ? '#10b981' : '#f43f5e'}
                  />
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span>Smoothed Surplus:</span>
                  <span className="font-semibold text-emerald-400">
                    +{formatINR(calculations.carryForwardAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAddTx}
                className="gold-pill-btn px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Today's Expense
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className="gold-outline-btn px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#caa052]" /> Simulate Purchase
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="dark-pill-btn px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Calendar Schedule
              </button>
            </div>
          </div>
        </div>



        {/* Triple Balance Card: Actual vs Planned vs Projected */}
        <Card className="p-6 flex flex-col justify-between shadow-lg space-y-4 border-amber-500/20">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Positions
              </h3>
              <button
                onClick={onOpenSetup}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
              >
                Configure
              </button>
            </div>

            {/* 1. Actual Balance */}
            <div className="p-3 bg-black/60 rounded-2xl border border-white/5 mb-2.5">
              <div className="text-[11px] text-slate-400 font-medium">Actual Bank Balance</div>
              <div className="text-xl font-black text-white mt-0.5">
                {formatINR(actualBalance)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Current liquid funds in bank account</div>
            </div>

            {/* 2. Planned Balance (Safe spendable in Green) */}
            <div className="p-3 bg-black/60 rounded-2xl border border-emerald-500/30 mb-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-bold">Planned Available Balance</span>
                <Badge variant="emerald">Safe</Badge>
              </div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {formatINR(plannedBalance)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                After reserving {formatINR(calculations.upcomingScheduledBills)} upcoming bills & {formatINR(calculations.savingsAllocation)} savings
              </div>
            </div>

            {/* 3. Projected Month-End in Gold */}
            <div className="p-3 bg-black/60 rounded-2xl border border-amber-500/20">
              <div className="text-[11px] text-slate-400 font-medium">Projected Month-End Savings</div>
              <div className="text-lg font-black text-amber-300 mt-0.5">
                {formatINR(profile.currentSavings + calculations.savingsAllocation)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Forecast if you stick to daily allowance</div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs flex items-center justify-between">
            <span className="text-slate-400">Next Salary Credit:</span>
            <span className="font-bold text-amber-300">
              {profile.isLastWorkingDay
                ? `Month's Last Working Day (${calculations.daysRemaining} days left)`
                : `${profile.salaryCreditDate}th of next month (${calculations.daysRemaining} days)`}
            </span>
          </div>
        </Card>
      </div>

      {/* 4 Summary Metric Cards: Green for Income/Savings, Red for Expenses/Bills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Income"
          value={`+${formatINR(calculations.totalIncome)}`}
          subtext={`Salary: ${formatINR(calculations.inHandSalary)} + Addl: ${formatINR(calculations.additionalIncome)}`}
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-400" />}
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Expenses Recorded"
          value={`-${formatINR(calculations.actualSpentThisCycle)}`}
          subtext="Discretionary spend so far"
          icon={<ArrowDownRight className="w-4 h-4 text-rose-400" />}
          valueColor="text-rose-400"
        />
        <StatCard
          label="Fixed Bills (Reserved)"
          value={`-${formatINR(calculations.fixedCommitmentsTotal)}`}
          subtext="Rent, EMIs, Utilities & WiFi"
          icon={<CreditCard className="w-4 h-4 text-rose-400" />}
          valueColor="text-rose-400"
        />
        <StatCard
          label="Monthly Savings Target"
          value={formatINR(calculations.savingsAllocation)}
          subtext={`Total Saved: ${formatINR(profile.currentSavings)}`}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          valueColor="text-emerald-400"
        />
      </div>

      {/* Middle Row: Upcoming Payments & Category Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Upcoming Scheduled Payments</h3>
              <p className="text-xs text-slate-400">Automatically reserved in your Planned Balance</p>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {profile.fixedExpenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                <p>No mandatory fixed commitments added yet.</p>
                <button
                  onClick={onOpenSetup}
                  className="mt-2 text-xs font-semibold text-[#ecd095] hover:underline cursor-pointer"
                >
                  + Add Rent, EMI, or Bills
                </button>
              </div>
            ) : (
              profile.fixedExpenses.slice(0, 4).map(bill => (
                <div
                  key={bill.id}
                  className="p-3 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black border border-white/10 text-slate-300">
                      <CategoryIcon category={bill.category} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{bill.name}</div>
                      <div className="text-slate-400 text-[11px]">
                        Due on {bill.dueDay}th of month {bill.autoDebit ? '• Auto-Debit' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400 text-sm">
                      -{formatINR(bill.amount)}
                    </span>
                    <button
                      onClick={() => toggleFixedExpensePaid(bill.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        bill.isPaid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-black/60 hover:bg-black text-slate-300 border-white/10'
                      }`}
                    >
                      {bill.isPaid ? 'Paid' : 'Mark Paid'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Category Spending vs Limits</h3>
              <p className="text-xs text-slate-400">Real-time consumption in current cycle</p>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>All Expenses</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {categorySpending.every(cat => cat.spent === 0) ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                <p>No expenses logged in this cycle yet.</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">All category allowances are 100% available.</p>
              </div>
            ) : (
              categorySpending.slice(0, 4).map(cat => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={cat.name} className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-400">-{formatINR(cat.spent)}</span>
                      {cat.budgetLimit && (
                        <span className="text-slate-500 ml-1">/ {formatINR(cat.budgetLimit)}</span>
                      )}
                    </div>
                  </div>
                  <ProgressBar percent={cat.percent} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Searchable history with receipt & split verification</p>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold">
                <th className="pb-3 pl-1">Description / Merchant</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#caa052]/10 border border-[#caa052]/30 text-[#caa052] flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white">No transactions recorded yet</div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      SaveUp is completely private and does not connect to external banks. Record your first daily expense or salary inflow manually.
                    </p>
                    <button
                      onClick={onOpenAddTx}
                      className="mt-4 gold-pill-btn px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      + Record First Transaction
                    </button>
                  </td>
                </tr>
              ) : (
                recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition">
                    <td className="py-3 pl-1">
                      <div className="font-bold text-white">{tx.description}</div>
                      {tx.isShared && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                          <Users className="w-3 h-3" /> Split with friends
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 text-slate-300 border border-white/5 text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{formatDate(tx.date)}</td>
                    <td className="py-3 text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-black text-sm ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {tx.receiptUrl ? (
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="p-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                          title="View Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </div>
  );
};
