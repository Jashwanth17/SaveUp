import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Target, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { Card, ProgressBar, Badge } from '../../components/ui';

export const HealthInsightsView: React.FC = () => {
  const { healthScore, insights, challenges } = useFinance();

  const getTierVariant = (tier: string) => {
    switch (tier) {
      case 'Excellent': return 'emerald';
      case 'Good': return 'gold';
      case 'Fair': return 'amber';
      default: return 'rose';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-[#caa052] text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Capital Adequacy & Pacing Audit
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Financial Health Score & Algorithmic Signals
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Deterministic health index computed from actual savings velocity, fixed commitment debt ratio, daily discretionary pacing, and emergency cash runway.
        </p>
      </Card>

      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#12141e] via-[#0c0d14] to-[#060609] border border-[#caa052]/30 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#caa052] transition-all duration-1000"
                strokeDasharray={`${healthScore.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{healthScore.score}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Badge variant={getTierVariant(healthScore.tier) as any}>
                {healthScore.tier} Tier
              </Badge>
              <span className="text-xs text-zinc-400">Live Cycle Score</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5">
              Your financial foundation is robust and well-hedged.
            </h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
              Fixed commitments remain within safe parameters (&lt;50% of income), maintaining consistent savings allocations while respecting daily allowance ceilings.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Score Breakdown Factors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthScore.factors.map((factor, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">{factor.label}</span>
                  <span className="text-[10px] text-zinc-500 ml-2">Weight: {factor.weight}</span>
                </div>
                <Badge
                  variant={factor.status === 'good' ? 'emerald' : factor.status === 'warning' ? 'amber' : 'rose'}
                >
                  {factor.score}/100
                </Badge>
              </div>

              <ProgressBar 
                percent={factor.score} 
                color={factor.status === 'good' ? '#10b981' : factor.status === 'warning' ? '#caa052' : '#f43f5e'} 
              />
              <p className="text-xs text-zinc-400">{factor.explanation}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#caa052]" />
            <span>Algorithmic Pacing Signals</span>
          </h3>
          <span className="text-xs text-zinc-500">Derived from ledger transactions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map(ins => (
            <Card key={ins.id} className="p-5 space-y-2 flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  ins.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : ins.type === 'warning'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-[#caa052]/10 text-[#ecd095] border border-[#caa052]/20'
                }`}
              >
                {ins.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : ins.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{ins.title}</h4>
                  <span className="text-[10px] text-zinc-500">{ins.date}</span>
                </div>
                <p className="text-xs text-zinc-300 mt-1">{ins.description}</p>
                {ins.actionText && (
                  <div className="mt-2 text-xs font-semibold text-[#caa052] hover:text-[#f5d78e] cursor-pointer flex items-center gap-1">
                    <span>{ins.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#caa052]" />
            <span>Active Financial Milestones</span>
          </h3>
          <span className="text-xs text-[#ecd095] font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-[#caa052] text-[#caa052]" /> Pacing Streaks & Discipline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map(chal => {
            const percent = Math.min(100, Math.round((chal.daysCompleted / chal.daysTotal) * 100));

            return (
              <Card key={chal.id} className="p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{chal.title}</span>
                    <Badge variant="gold">+{chal.rewardPoints} Pts</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {chal.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Progress: {chal.daysCompleted}/{chal.daysTotal} Days</span>
                    <span className="font-bold text-[#caa052]">{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} color="#caa052" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
