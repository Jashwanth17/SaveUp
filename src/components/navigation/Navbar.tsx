import React, { useState } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ArrowRight,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { ActiveTab } from './Sidebar';
import { formatINR } from '../../utils/formatters';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSetup: () => void;
  onOpenAddTx: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetup,
  onOpenAddTx,
}) => {
  const { theme, toggleTheme, calculations, profile, resetToDefaults } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const upcomingBills = profile.fixedExpenses.filter(e => !e.isPaid);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'expenses', label: 'Transactions' },
    { id: 'salary-cycle', label: 'Salary Cycle' },
    { id: 'savings', label: 'Savings' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'health-insights', label: 'Health' },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 sticky top-0 z-40 pointer-events-none">
      {/* Floating Dark Pill Header (Exact Playerhub Reference Design) */}
      <header className="pointer-events-auto max-w-7xl mx-auto floating-pill-header rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl shadow-black/90">
        {/* Brand & Monogram */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Elegant Circular Gold Monogram */}
            <div className="w-8 h-8 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20">
              <span className="font-serif font-black text-xs text-[#ecd095] group-hover:text-white transition">
                S
              </span>
              <div className="absolute inset-0 rounded-full border border-[#caa052]/20 group-hover:border-[#caa052]/60 transition" />
            </div>

            <div>
              <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>SaveUp</span>
                <span className="text-[10px] text-[#caa052] font-semibold">™</span>
              </div>
              <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
                Every Rupee, Calculated.
              </p>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${
                  isActive
                    ? 'text-[#fce8bd] bg-[#caa052]/15 font-bold border border-[#caa052]/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Gold Pill CTA */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-8 h-8 rounded-full border border-white/8 hover:border-white/20 bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer relative"
              title="Payment Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {upcomingBills.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f43f5e] rounded-full ring-2 ring-black" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#0d0e14] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Upcoming Commitments ({upcomingBills.length})
                  </h4>
                  <span className="text-[10px] text-[#caa052] font-semibold">Auto-Reserved</span>
                </div>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {upcomingBills.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      All monthly fixed bills are paid!
                    </div>
                  ) : (
                    upcomingBills.map(bill => (
                      <div
                        key={bill.id}
                        className="p-2.5 bg-black/60 rounded-xl border border-white/5 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{bill.name}</div>
                          <div className="text-[11px] text-slate-500">Due {bill.dueDay}th of month</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#f43f5e]">-{formatINR(bill.amount)}</div>
                          <span className="text-[9px] text-[#caa052] font-medium">Pending</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Exact Circular icon button in reference image) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-white/8 hover:border-white/20 bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Settings / Salary Setup */}
          <button
            onClick={onOpenSetup}
            className="hidden sm:flex px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition cursor-pointer"
          >
            Setup
          </button>

          {/* Champagne Gold Pill Button (Matches "Let's Talk →") */}
          <button
            onClick={onOpenAddTx}
            className="gold-pill-btn px-4 sm:px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>Record Expense</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden max-w-7xl mx-auto mt-2 p-3 bg-[#0d0e14] border border-white/10 rounded-2xl shadow-2xl grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-150">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-medium text-left transition cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenSetup();
              setMobileMenuOpen(false);
            }}
            className="col-span-2 p-2.5 rounded-xl text-xs font-medium text-left bg-black/60 text-[#caa052] border border-[#caa052]/20"
          >
            ⚙️ Salary & Financial Setup
          </button>
        </div>
      )}
    </div>
  );
};
