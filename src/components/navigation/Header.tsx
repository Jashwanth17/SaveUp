import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  Settings, 
  Sparkles, 
  Bell, 
  Menu,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { ActiveTab } from './Sidebar';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenSetup: () => void;
  onSignOut: () => void;
  onOpenMobileMenu?: () => void;
}

const tabInfo: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Daily Allowance & Cash Flow' },
  calendar: { title: 'Calendar Schedule', subtitle: 'Pacing & Daily Safe Spend' },
  expenses: { title: 'Transactions', subtitle: 'Ledger & Expenses' },
  'salary-cycle': { title: 'Salary Cycle', subtitle: 'Commitments & Fixed Bills' },
  savings: { title: 'Savings & Goals', subtitle: 'Vaults & Progress' },
  simulator: { title: 'Simulator', subtitle: 'What-If Affordability Check' },
  subscriptions: { title: 'Subscriptions', subtitle: 'Recurring Bills & Services' },
  analytics: { title: 'Analytics', subtitle: 'Category Breakdown & Trends' },
  'health-insights': { title: 'Health Insights', subtitle: 'Financial Health Score' }
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSetup,
  onSignOut,
  onOpenMobileMenu
}) => {
  const { profile, calculations, isDemoMode, loadSampleData, clearToCleanSlate } = useFinance();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTab = tabInfo[activeTab] || { title: 'Dashboard', subtitle: 'Overview' };
  const userInitial = (profile.userName?.trim()?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-20 w-full bg-[#07080f]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu Trigger + Dynamic Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                {currentTab.title}
              </h1>
              {calculations.status === 'healthy' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  On Track
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block truncate mt-0.5">
              {currentTab.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Notification Bell + User Profile Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="p-2 sm:p-2.5 text-zinc-400 hover:text-white rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#caa052]" />
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0c0d18] border border-white/[0.12] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-extrabold text-white tracking-wide uppercase">Notifications</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">1 New Alert</span>
                </div>
                <div className="py-3 space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Daily Pacing Safe</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        You have {formatCurrency(calculations.remainingTodayAllowance, profile.currency)} available for discretionary spending today.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#caa052]/40 transition cursor-pointer group"
              aria-label="User Profile Menu"
            >
              {/* Avatar Circle with Gold Border */}
              <div className="w-8 h-8 rounded-full border border-[#caa052]/60 bg-gradient-to-br from-[#caa052]/30 via-[#1f1a10] to-[#0d0b06] flex items-center justify-center text-xs font-bold text-[#ecd095] shadow-inner shrink-0 group-hover:scale-105 transition">
                {userInitial}
              </div>

              {/* Username & Status indicator */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate max-w-[110px] leading-tight">
                  {profile.userName || 'Member'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              {/* Chevron Down */}
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200 ${
                profileOpen ? 'rotate-180 text-[#caa052]' : ''
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c0d18] border border-white/[0.12] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                
                {/* User Header Summary */}
                <div className="p-4 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[#caa052]/50 bg-gradient-to-br from-[#caa052]/40 to-[#0d0b06] flex items-center justify-center text-sm font-extrabold text-[#ecd095] shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {profile.userName || 'Member'}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate capitalize">
                        {profile.salaryFrequency || 'Monthly'} • {profile.currency || 'INR'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stat Pill */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Monthly In-Hand:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(profile.monthlyInHandSalary, profile.currency)}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  
                  {/* Salary & Setup Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSetup();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Salary & Setup</span>
                  </button>

                  {/* Demo Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isDemoMode) {
                        clearToCleanSlate();
                      } else {
                        loadSampleData();
                      }
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#caa052]" />
                      <span>Demo Mode Data</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDemoMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-zinc-400'
                    }`}>
                      {isDemoMode ? 'Active' : 'Load'}
                    </span>
                  </button>
                </div>

                {/* Divider & Sign Out */}
                <div className="p-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
