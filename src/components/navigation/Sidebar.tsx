import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ReceiptText, 
  Calculator, 
  PiggyBank, 
  SlidersHorizontal, 
  Repeat, 
  BarChart3, 
  ShieldCheck, 
  Settings
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/formatters';

export type ActiveTab = 
  | 'dashboard'
  | 'calendar'
  | 'expenses'
  | 'salary-cycle'
  | 'savings'
  | 'simulator'
  | 'subscriptions'
  | 'analytics'
  | 'health-insights';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSetup: () => void;
  onOpenAddTx: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetup,
  onOpenAddTx,
}) => {
  const { calculations, healthScore } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar Schedule', icon: CalendarDays },
    { id: 'expenses', label: 'Transactions & Splits', icon: ReceiptText },
    { id: 'salary-cycle', label: 'Salary Cycle & Budget', icon: Calculator },
    { id: 'savings', label: 'Savings & Goals', icon: PiggyBank },
    { id: 'simulator', label: 'Purchase Simulator', icon: SlidersHorizontal, badge: 'What-If' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'analytics', label: 'Financial Analytics', icon: BarChart3 },
    { id: 'health-insights', label: 'Health & Insights', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#050507] border-r border-white/[0.08] flex flex-col justify-between hidden lg:flex shrink-0 min-h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20">
              <span className="font-serif font-black text-xs text-[#ecd095]">S</span>
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>SaveUp</span>
              </div>
              <p className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
                Every Rupee, Calculated.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Daily Allowance Mini Widget (Gold & Black) */}
        <div className="mx-4 my-4 p-4 bg-[#0c0d14] border border-[#caa052]/30 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#caa052]/10 rounded-full blur-xl group-hover:bg-[#caa052]/15 transition" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
            <span>Today's Allowance</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#caa052]/10 text-[#ecd095] font-bold border border-[#caa052]/30">
              {calculations.daysRemaining}d left
            </span>
          </div>
          <div className="text-2xl font-black gold-text-gradient tracking-tight flex items-baseline gap-1">
            <span>{formatINR(calculations.dailyAllowanceToday)}</span>
            <span className="text-xs font-normal text-zinc-400">/day</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/[0.06]">
            <span>Cycle Spendable:</span>
            <span className="font-bold text-emerald-400">
              +{formatINR(calculations.remainingSpendableBudget)}
            </span>
          </div>
        </div>

        {/* Quick Action Button (Gold Luxury) */}
        <div className="px-4 mb-2">
          <button
            onClick={onOpenAddTx}
            className="w-full py-2.5 px-3 gold-pill-btn text-xs font-bold cursor-pointer"
          >
            <span>+ Record Transaction</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35 font-bold shadow-sm shadow-amber-500/5'
                    : 'text-slate-400 hover:text-amber-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-amber-400 text-black'
                        : 'bg-black/60 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Settings */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Financial Health Mini Bar */}
        <div 
          onClick={() => setActiveTab('health-insights')}
          className="p-2.5 bg-black/40 hover:bg-black/70 border border-white/5 hover:border-amber-500/30 rounded-xl cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Health Score
            </span>
            <span className="font-bold text-amber-300">{healthScore.score}/100</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore.score}%` }}
            />
          </div>
        </div>

        {/* Setup / Settings Button */}
        <button
          onClick={onOpenSetup}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Salary & Setup</span>
          </div>
          <span className="text-[10px] text-slate-500">Edit</span>
        </button>
      </div>
    </aside>
  );
};
