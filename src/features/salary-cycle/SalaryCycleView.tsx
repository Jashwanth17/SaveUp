import React, { useState } from 'react';
import { 
  Calculator, 
  Sliders, 
  RotateCcw 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/formatters';
import { Card, Badge } from '../../components/ui';

interface SalaryCycleViewProps {
  onOpenSetup: () => void;
}

export const SalaryCycleView: React.FC<SalaryCycleViewProps> = ({ onOpenSetup }) => {
  const { profile, calculations, updateProfile } = useFinance();

  const [sandboxSalary, setSandboxSalary] = useState<number>(profile.monthlyInHandSalary);
  const [sandboxSavings, setSandboxSavings] = useState<number>(profile.monthlySavingsTarget);
  const [sandboxCycleDay, setSandboxCycleDay] = useState<number>(profile.salaryCreditDate);

  const fixedTotal = profile.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);

  const sandboxIncome = sandboxSalary + profile.additionalIncome;
  const sandboxSpendablePool = Math.max(0, sandboxIncome - fixedTotal - sandboxSavings);
  const sandboxDailyAllowance = Math.round(sandboxSpendablePool / 30);

  const applySandbox = () => {
    updateProfile({
      monthlyInHandSalary: sandboxSalary,
      monthlySavingsTarget: sandboxSavings,
      salaryCreditDate: sandboxCycleDay,
    });
  };

  const resetSandbox = () => {
    setSandboxSalary(profile.monthlyInHandSalary);
    setSandboxSavings(profile.monthlySavingsTarget);
    setSandboxCycleDay(profile.salaryCreditDate);
  };

  const actualBalance = calculations.totalIncome - calculations.actualSpentThisCycle;
  const plannedBalance = actualBalance - calculations.upcomingScheduledBills - calculations.savingsAllocation;
  const projectedBalance = Math.max(0, plannedBalance);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" /> Dynamic Budget Engine
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Salary Cycle & Spending Allowance Math
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SaveUp dynamically recalibrates your safe daily spending limit based on real cash commitments and remaining days.
          </p>
        </div>

        <button
          onClick={onOpenSetup}
          className="gold-outline-btn px-4 py-2 text-xs cursor-pointer"
        >
          Edit Base Setup
        </button>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>The SaveUp Formula</span>
          <Badge variant="gold">Live Recalculation</Badge>
        </h3>

        {/* 3 Step Formula: Green for Income, Red for Fixed bills, Green for Savings */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="p-4 bg-black/60 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">1. In-Hand Income</div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              +{formatINR(calculations.totalIncome)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Salary + Other Income</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500 font-bold text-xl">-</div>

          <div className="p-4 bg-black/60 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">2. Fixed Commitments</div>
            <div className="text-lg font-black text-rose-400 mt-1">
              -{formatINR(calculations.fixedCommitmentsTotal)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Rent, Bills, EMIs, WiFi</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500 font-bold text-xl">-</div>

          <div className="p-4 bg-black/60 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">3. Savings Target</div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              -{formatINR(calculations.savingsAllocation)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Allocated to Goals</div>
          </div>
        </div>

        {/* Spendable Pool in Gold */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-[#0d0f17] to-black rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              = Discretionary Spendable Pool
            </div>
            <div className="text-3xl font-black text-amber-300 mt-1">
              {formatINR(calculations.spendablePool)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Your safe spending pool for groceries, food, dining, transport, and personal shopping for this cycle.
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-white/10 rounded-xl text-center shrink-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Divided By Cycle Days</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">
              ÷ {calculations.daysInCycle} Total Days
            </div>
            <div className="text-xs font-black text-amber-400 mt-1 pt-1 border-t border-white/5">
              Baseline: ~{formatINR(Math.round(calculations.spendablePool / calculations.daysInCycle))}/day
            </div>
          </div>
        </div>

        <div className="p-5 bg-black/60 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase">
                Today's Dynamic Allowance Equation
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Remaining spendable budget ÷ Remaining days in salary cycle
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Current Pacing: </span>
              <span className="text-xl font-extrabold text-amber-300">
                {formatINR(calculations.dailyAllowanceToday)}
              </span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>

          <div className="p-3 bg-black/80 rounded-xl border border-white/5 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-center gap-2">
            <span className="text-amber-400 font-bold">
              {formatINR(calculations.remainingSpendableBudget)}
            </span>
            <span>(Remaining Spendable)</span>
            <span className="text-slate-500 font-bold">÷</span>
            <span className="text-amber-200 font-bold">
              {calculations.daysRemaining} days remaining
            </span>
            <span className="text-slate-500 font-bold">=</span>
            <span className="text-amber-300 font-black text-sm">
              {formatINR(calculations.dailyAllowanceToday)} / day
            </span>
          </div>
        </div>
      </Card>

      {/* Triple Position Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Actual Balance
            </span>
            <Badge variant="slate">In Bank Right Now</Badge>
          </div>
          <div className="text-3xl font-black text-white">{formatINR(actualBalance)}</div>
          <p className="text-xs text-slate-400">
            Total income credited minus actual payments processed so far.
          </p>
          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500">
            ⚠️ Does not account for upcoming unpaid bills or your savings goal. Do not treat this as spendable money!
          </div>
        </Card>

        <Card className="p-6 space-y-3 border-emerald-500/40 relative shadow-lg shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              2. Planned Balance
            </span>
            <Badge variant="emerald">Safe Money</Badge>
          </div>
          <div className="text-3xl font-black text-emerald-400">{formatINR(plannedBalance)}</div>
          <p className="text-xs text-slate-300">
            Actual balance minus {formatINR(calculations.upcomingScheduledBills)} upcoming reserved bills & {formatINR(calculations.savingsAllocation)} savings.
          </p>
          <div className="pt-3 border-t border-white/5 text-[11px] text-emerald-400 font-semibold">
            🛡️ SaveUp protects this pool so you never default on rent or miss your savings.
          </div>
        </Card>

        <Card className="p-6 space-y-3 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              3. Projected Balance
            </span>
            <Badge variant="gold">Month-End Forecast</Badge>
          </div>
          <div className="text-3xl font-black text-amber-300">{formatINR(projectedBalance)}</div>
          <p className="text-xs text-slate-400">
            Forecasted surplus if you stick to your daily allowance until next salary credit.
          </p>
          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400">
            🌱 Unspent daily allowances roll over to increase this month-end surplus.
          </div>
        </Card>
      </div>

      {/* Interactive Sandbox Slider Tool */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Interactive Salary Cycle Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust sliders to explore how a salary change, credit date, or higher savings target impacts your daily allowance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetSandbox}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={applySandbox}
              className="gold-pill-btn px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Apply to Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-black/60 rounded-2xl border border-white/10">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">In-Hand Salary</span>
              <span className="text-emerald-400 font-bold">{formatINR(sandboxSalary)}</span>
            </div>
            <input
              type="range"
              min={30000}
              max={300000}
              step={5000}
              value={sandboxSalary}
              onChange={e => setSandboxSalary(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹30K</span>
              <span>₹1.5L</span>
              <span>₹3.0L</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Monthly Savings Target</span>
              <span className="text-emerald-400 font-bold">{formatINR(sandboxSavings)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={100000}
              step={2000}
              value={sandboxSavings}
              onChange={e => setSandboxSavings(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹5K</span>
              <span>₹50K</span>
              <span>₹1L</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Salary Credit Date</span>
              <span className="text-amber-300 font-bold">{sandboxCycleDay}th of month</span>
            </div>
            <input
              type="range"
              min={1}
              max={31}
              step={1}
              value={sandboxCycleDay}
              onChange={e => setSandboxCycleDay(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1st (Standard)</span>
              <span>15th</span>
              <span>28th/31st</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-300">Simulated Discretionary Pool: </span>
            <span className="font-bold text-amber-300 text-sm">{formatINR(sandboxSpendablePool)}</span>
            <span className="text-slate-400 ml-2">(after {formatINR(fixedTotal)} fixed bills)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-200 font-bold">New Daily Allowance:</span>
            <span className="text-xl font-black text-amber-300">
              ~{formatINR(sandboxDailyAllowance)}/day
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
