import React, { useState } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/formatters';
import { SimulationResult } from '../../types';
import { Card, StatCard, Badge } from '../../components/ui';

export const SimulatorView: React.FC = () => {
  const { calculations, runSimulation, addTransaction, profile } = useFinance();

  const [itemName, setItemName] = useState<string>('Apple iPhone 16 Pro');
  const [itemCost, setItemCost] = useState<string>('79900');
  const [simulation, setSimulation] = useState<SimulationResult | null>(() => {
    return runSimulation('Apple iPhone 16 Pro', 79900);
  });
  const [purchaseRecorded, setPurchaseRecorded] = useState<boolean>(false);

  const handleSimulate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cost = parseFloat(itemCost);
    if (!itemName.trim() || !cost || cost <= 0) return;

    const result = runSimulation(itemName.trim(), cost);
    setSimulation(result);
    setPurchaseRecorded(false);
  };

  const handleConfirmPurchase = () => {
    if (!simulation) return;

    addTransaction({
      amount: simulation.cost,
      type: 'expense',
      category: 'Shopping',
      description: simulation.purchaseItem,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'Credit Card',
      notes: 'Recorded via SaveUp Financial Simulator after safety verification',
    });

    setPurchaseRecorded(true);
  };

  const presetSimulations = [
    { name: 'Sony WH-1000XM5 Headphones', cost: 24990 },
    { name: 'Weekend Goa Vacation', cost: 35000 },
    { name: 'Nike Jordan Sneakers', cost: 11495 },
    { name: 'Apple Watch Series 10', cost: 46900 },
    { name: 'Fine Dining Weekend', cost: 7500 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-[#caa052] text-xs font-bold uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" /> Pre-Purchase Pacing Engine
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          What-If Purchase Simulator
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Simulate the mathematical ripple effects of any purchase on your remaining daily allowance ceiling, upcoming reserved bills, and monthly savings before committing funds.
        </p>
      </Card>

      <Card className="p-6 space-y-4">
        <form onSubmit={handleSimulate} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Simulate Item / Experience *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. iPhone 16 Pro, PlayStation 5, Weekend Trip"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#caa052] transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={itemCost}
              onChange={e => setItemCost(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#caa052] transition"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 gold-pill-btn text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>Simulate Impact</span>
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Quick Scenarios:</span>
          {presetSimulations.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setItemName(preset.name);
                setItemCost(String(preset.cost));
                const res = runSimulation(preset.name, preset.cost);
                setSimulation(res);
                setPurchaseRecorded(false);
              }}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-[11px] transition cursor-pointer"
            >
              {preset.name} ({formatINR(preset.cost)})
            </button>
          ))}
        </div>
      </Card>

      {simulation && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              simulation.verdict === 'safe'
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : simulation.verdict === 'warning'
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  simulation.verdict === 'safe'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : simulation.verdict === 'warning'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {simulation.verdict === 'safe' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : simulation.verdict === 'warning' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      simulation.verdict === 'safe'
                        ? 'emerald'
                        : simulation.verdict === 'warning'
                        ? 'amber'
                        : 'rose'
                    }
                  >
                    {simulation.verdict === 'safe'
                      ? 'Safe to Purchase'
                      : simulation.verdict === 'warning'
                      ? 'Moderate Caution'
                      : 'High Risk • Budget Deficit'}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Simulation Outcome for: "{simulation.purchaseItem}" ({formatINR(simulation.cost)})
                </h3>
                <div className="mt-2 space-y-1">
                  {simulation.insights.map((ins, i) => (
                    <div key={i} className="text-xs text-slate-300">
                      {ins}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {purchaseRecorded ? (
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Recorded to Ledger!
                </div>
              ) : (
                <button
                  onClick={handleConfirmPurchase}
                  className="gold-pill-btn px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>Confirm & Record Expense</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Daily Allowance Impact"
              value={`→ ${formatINR(simulation.projectedDailyAllowance)}`}
              subtext={`Delta: ${formatINR(simulation.dailyAllowanceDelta)}/day for remaining ${calculations.daysRemaining} cycle days`}
              valueColor="text-rose-400"
            />
            <StatCard
              label="Remaining Spendable Pool"
              value={formatINR(simulation.projectedBalanceAfter)}
              subtext={`Current Pool: ${formatINR(simulation.currentBalance)}`}
            />
            <StatCard
              label="Monthly Savings Target"
              value={simulation.savingsTargetMet ? '100% Protected' : `Erodes ${formatINR(simulation.savingsImpactAmount)}`}
              subtext={`Monthly Target: ${formatINR(profile.monthlySavingsTarget)}`}
              valueColor={simulation.savingsTargetMet ? 'text-emerald-400' : 'text-rose-400'}
            />
            <StatCard
              label="Upcoming Bills Coverage"
              value={simulation.canAffordUpcomingBills ? 'Safe & Reserved' : 'At Risk!'}
              subtext={`Upcoming bills: ${formatINR(calculations.upcomingScheduledBills)}`}
              valueColor={simulation.canAffordUpcomingBills ? 'text-emerald-400' : 'text-rose-400'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
