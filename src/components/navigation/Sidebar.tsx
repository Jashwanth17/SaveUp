import React, { useState } from 'react';
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
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

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
  onSignOut?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetup,
  onSignOut,
  mobileOpen: externalMobileOpen,
  setMobileOpen: externalSetMobileOpen,
}) => {
  const { loadSampleData, clearToCleanSlate, isDemoMode } = useFinance();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const mobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setMobileOpen = externalSetMobileOpen || setInternalMobileOpen;

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

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
      
      {/* Top Section: Brand + CTA + Navigation */}
      <div className="space-y-5">
        
        {/* Brand & Monogram */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Elegant Circular Gold Monogram */}
            <div className="w-9 h-9 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20 flex-shrink-0">
              <span className="font-serif font-black text-sm text-[#ecd095]">S</span>
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight leading-none">
                SaveUp
              </div>
              <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
                Smart Salary Ledger
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#caa052]/20 text-[#ecd095] border border-[#caa052]/40 font-bold shadow-sm shadow-[#caa052]/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#caa052]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-[#caa052] text-black' : 'bg-white/10 text-zinc-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Utilities & Sign Out */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2 flex-shrink-0">
        
        {/* Demo Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            if (isDemoMode) {
              clearToCleanSlate();
            } else {
              loadSampleData();
            }
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#caa052]" />
            <span>Demo Data</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            isDemoMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-zinc-400'
          }`}>
            {isDemoMode ? 'Active' : 'Load'}
          </span>
        </button>

        {/* Settings / Setup */}
        <button
          type="button"
          onClick={() => {
            onOpenSetup();
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Salary & Setup</span>
        </button>

        {/* Sign Out */}
        {onSignOut && (
          <button
            type="button"
            onClick={() => {
              onSignOut();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-[#090a12] border-r border-[#caa052]/30 z-50 transform transition-transform duration-300 shadow-2xl ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-[#080910] border-r border-white/[0.08] flex-col shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
};
