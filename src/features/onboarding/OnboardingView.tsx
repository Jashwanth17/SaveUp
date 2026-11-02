import React, { useState, useRef, useEffect } from 'react';
import { Globe, Coins, Calendar, DollarSign, ArrowRight, CheckCircle2, Clock, ChevronDown, ChevronUp, Check, Briefcase, X } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { getLastWorkingDayOfMonth } from '../../services/calculationEngine';

interface OnboardingViewProps {
  onComplete: () => void;
  onClose?: () => void;
  isEditing?: boolean;
}

const COUNTRIES = [
  { code: 'IN', flag: '🇮🇳', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'US', flag: '🇺🇸', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'EU', flag: '🇪🇺', name: 'European Union', currency: 'EUR', symbol: '€' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', currency: 'SGD', symbol: 'S$' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
];

const WEEKDAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 7, name: 'Sunday', short: 'Sun' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ 
  onComplete,
  onClose,
  isEditing = false
}) => {
  const { profile, updateProfile } = useFinance();

  // Country & Currency
  const [country, setCountry] = useState(profile.country || 'India');
  const [currency, setCurrency] = useState(profile.currency || 'INR');
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol || '₹');

  // Custom Dropdown Open States
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Salary fields
  const [salary, setSalary] = useState<string>(
    profile.monthlyInHandSalary ? String(profile.monthlyInHandSalary) : ''
  );
  const [ctc, setCtc] = useState<string>(
    profile.annualCtc ? String(profile.annualCtc) : ''
  );
  
  // Frequency: Monthly, Bi-Weekly, Weekly, Daily
  const [frequency, setFrequency] = useState<'monthly' | 'bi-weekly' | 'weekly' | 'daily'>(
    profile.salaryFrequency || 'monthly'
  );

  // Credit dates
  const now = new Date();
  const thisMonthLWD = getLastWorkingDayOfMonth(now.getFullYear(), now.getMonth());

  const [creditDate, setCreditDate] = useState<number>(profile.salaryCreditDate || 1);
  const [isLastWorkingDay, setIsLastWorkingDay] = useState<boolean>(profile.isLastWorkingDay || false);
  const [creditWeekday, setCreditWeekday] = useState<number>(profile.salaryCreditWeekday || 5); // Default Friday

  const [salaryError, setSalaryError] = useState('');

  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
    const found = COUNTRIES.find(c => c.name === countryName);
    if (found) {
      setCurrency(found.currency);
      setCurrencySymbol(found.symbol);
    }
  };

  const handleCurrencyChange = (currCode: string) => {
    setCurrency(currCode);
    const found = CURRENCIES.find(c => c.code === currCode);
    if (found) {
      setCurrencySymbol(found.symbol);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSalary = parseFloat(salary);
    if (!parsedSalary || parsedSalary <= 0) {
      setSalaryError('Please enter your in-hand earnings.');
      return;
    }

    setSalaryError('');

    updateProfile({
      country,
      currency,
      currencySymbol,
      monthlyInHandSalary: parsedSalary,
      annualCtc: ctc ? parseFloat(ctc) : undefined,
      salaryCreditDate: isLastWorkingDay ? thisMonthLWD : creditDate,
      isLastWorkingDay,
      salaryFrequency: frequency,
      salaryCreditWeekday: creditWeekday,
      preferredFinancialMonth: 'salary-cycle',
      isSetupCompleted: true,
    });

    onComplete();
  };

  // Helper label based on frequency
  const getSalaryLabel = () => {
    switch (frequency) {
      case 'daily':
        return 'Daily In-Hand Earnings';
      case 'weekly':
        return 'Weekly In-Hand Payout';
      case 'bi-weekly':
        return 'Bi-Weekly In-Hand Payout';
      case 'monthly':
      default:
        return 'Monthly In-Hand Salary';
    }
  };

  const getSalaryPlaceholder = () => {
    switch (frequency) {
      case 'daily':
        return 'e.g. 2500';
      case 'weekly':
        return 'e.g. 18000';
      case 'bi-weekly':
        return 'e.g. 35000';
      case 'monthly':
      default:
        return 'e.g. 75000';
    }
  };

  const selectedWeekdayName = WEEKDAYS.find(w => w.id === creditWeekday)?.name || 'Friday';
  const selectedCountry = COUNTRIES.find(c => c.name === country) || COUNTRIES[0];
  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className={isEditing ? "contents" : "fixed inset-0 h-[100dvh] max-h-[100dvh] w-full bg-[#050507] text-zinc-100 flex flex-col justify-between selection:bg-[#caa052]/30 selection:text-[#fce8bd] overflow-hidden select-none"}>
      
      {/* Background ambient gold lighting */}
      {!isEditing && (
        <div 
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] opacity-35 blur-[140px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(202, 160, 82, 0.45) 0%, rgba(170, 119, 34, 0.15) 50%, transparent 70%)'
          }}
        />
      )}

      {/* Header */}
      {!isEditing && (
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between relative z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20">
              <span className="font-serif font-black text-sm text-[#ecd095]">S</span>
            </div>
            <div>
              <div className="text-lg font-extrabold text-white tracking-tight leading-none">SaveUp</div>
              <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">Smart Salary Ledger</p>
            </div>
          </div>
        </header>
      )}

      {/* Main Big Box Container */}
      <main className={isEditing ? "w-full" : "flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-1 relative z-20 min-h-0 w-full"}>
        <div className={`w-full max-w-5xl bg-[#0b0c13] border border-[#caa052]/35 rounded-3xl shadow-2xl shadow-black p-5 sm:p-7 flex flex-col ${isEditing ? 'max-h-[85vh]' : 'max-h-[calc(100dvh-125px)]'} backdrop-blur-xl`}>
          
          {/* Box Header */}
          <div className="pb-3 border-b border-white/[0.08] flex-shrink-0 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {isEditing ? 'Change Salary & Pay Cycle' : 'Set Up Your Financial Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {isEditing 
                  ? 'Update your in-hand salary, pay frequency, or credit date. All calculations update live.'
                  : <>Welcome, <span className="text-[#ecd095] font-bold">@{profile.userName || 'Member'}</span>. Configure your earnings to calculate your daily spend runway.</>
                }
              </p>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] transition cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form with Scrollable Inner Box */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 mt-4">
            
            {/* Scrollable Inside Content */}
            <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 custom-gold-scrollbar space-y-5">
              
              {/* Section 1: Region & Currency */}
              <div className="space-y-3 relative z-30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Globe className="w-3.5 h-3.5 text-[#caa052]" />
                  <span>Region & Currency</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Custom Country Dropdown */}
                  <div className="relative" ref={countryRef}>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Country</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCountryDropdownOpen(!countryDropdownOpen);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                        countryDropdownOpen
                          ? 'border-[#caa052] ring-2 ring-[#caa052]/25 bg-[#0d0f1a]'
                          : 'border-white/[0.1] hover:border-white/25 hover:bg-[#0a0c14]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{selectedCountry.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-white leading-tight">{selectedCountry.name}</div>
                          <div className="text-[10px] text-zinc-500 font-medium">{selectedCountry.currency} ({selectedCountry.symbol})</div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#caa052] transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Country Popover Menu */}
                    {countryDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#090a12]/98 border border-[#caa052]/40 rounded-2xl shadow-2xl shadow-black p-2 max-h-56 overflow-y-auto custom-gold-scrollbar backdrop-blur-2xl animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 gap-1">
                          {COUNTRIES.map(c => {
                            const isSelected = c.name === country;
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  handleCountryChange(c.name);
                                  setCountryDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#caa052]/25 to-transparent border border-[#caa052]/40 text-white font-bold'
                                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl leading-none">{c.flag}</span>
                                  <div>
                                    <div className="text-sm font-semibold text-white">{c.name}</div>
                                    <div className="text-[10px] text-zinc-500">{c.currency} ({c.symbol})</div>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-[#caa052]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Currency Dropdown */}
                  <div className="relative" ref={currencyRef}>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Currency</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrencyDropdownOpen(!currencyDropdownOpen);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                        currencyDropdownOpen
                          ? 'border-[#caa052] ring-2 ring-[#caa052]/25 bg-[#0d0f1a]'
                          : 'border-white/[0.1] hover:border-white/25 hover:bg-[#0a0c14]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#caa052]/30 to-[#caa052]/10 border border-[#caa052]/40 flex items-center justify-center text-xs font-black text-[#ecd095]">
                          {selectedCurrency.symbol}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white leading-tight">{selectedCurrency.code} ({selectedCurrency.symbol})</div>
                          <div className="text-[10px] text-zinc-500 font-medium">{selectedCurrency.name}</div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#caa052] transition-transform duration-200 ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Currency Popover Menu */}
                    {currencyDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#090a12]/98 border border-[#caa052]/40 rounded-2xl shadow-2xl shadow-black p-2 max-h-56 overflow-y-auto custom-gold-scrollbar backdrop-blur-2xl animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 gap-1">
                          {CURRENCIES.map(curr => {
                            const isSelected = curr.code === currency;
                            return (
                              <button
                                key={curr.code}
                                type="button"
                                onClick={() => {
                                  handleCurrencyChange(curr.code);
                                  setCurrencyDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#caa052]/25 to-transparent border border-[#caa052]/40 text-white font-bold'
                                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#caa052]/30 to-[#caa052]/10 border border-[#caa052]/40 flex items-center justify-center text-xs font-black text-[#ecd095]">
                                    {curr.symbol}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-white">{curr.code} ({curr.symbol})</div>
                                    <div className="text-[10px] text-zinc-500">{curr.name}</div>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-[#caa052]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Salary & Compensation */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5 text-[#caa052]" />
                  <span>Salary & Earnings</span>
                </div>

                {/* Salary Frequency Selector: Monthly, Bi-Weekly, Weekly, Daily */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Salary Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['monthly', 'bi-weekly', 'weekly', 'daily'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold capitalize transition cursor-pointer border ${
                          frequency === freq
                            ? 'bg-[#caa052]/20 border-[#caa052] text-[#ecd095] font-bold shadow-sm'
                            : 'bg-[#07080e] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {freq === 'bi-weekly' ? 'Bi-Weekly' : freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  {/* Dynamic in-hand salary */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      {getSalaryLabel()} <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#caa052]">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        required
                        placeholder={getSalaryPlaceholder()}
                        value={salary}
                        onChange={e => {
                          setSalary(e.target.value);
                          if (salaryError) setSalaryError('');
                        }}
                        className={`w-full pl-9 pr-12 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm sm:text-base font-semibold no-spinner ${
                          salaryError ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
                        }`}
                      />

                      {/* Theme-Related Up & Down Stepper Controls */}
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center border border-white/[0.12] rounded-lg bg-[#0e101b] overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            const step = frequency === 'daily' ? 100 : frequency === 'weekly' ? 500 : 1000;
                            const current = parseFloat(salary) || 0;
                            setSalary(String(current + step));
                            if (salaryError) setSalaryError('');
                          }}
                          className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                          title="Increase amount"
                        >
                          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <div className="w-full h-px bg-white/[0.1]" />
                        <button
                          type="button"
                          onClick={() => {
                            const step = frequency === 'daily' ? 100 : frequency === 'weekly' ? 500 : 1000;
                            const current = parseFloat(salary) || 0;
                            setSalary(String(Math.max(0, current - step)));
                            if (salaryError) setSalaryError('');
                          }}
                          className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                          title="Decrease amount"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Amount Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(frequency === 'daily' ? [500, 1000, 2000] : frequency === 'weekly' ? [5000, 10000, 15000] : [20000, 30000, 50000, 100000]).map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSalary(String(val));
                            if (salaryError) setSalaryError('');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-[#caa052]/20 border border-white/[0.06] hover:border-[#caa052]/40 text-[10px] font-bold text-zinc-300 hover:text-[#ecd095] transition"
                        >
                          +{currencySymbol}{val.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                    {salaryError && <p className="text-xs text-rose-400 mt-1">{salaryError}</p>}
                  </div>

                  {/* Annual CTC (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Annual CTC
                      </label>
                      <span className="text-[11px] text-zinc-500 font-medium">Optional</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 1200000"
                        value={ctc}
                        onChange={e => setCtc(e.target.value)}
                        className="w-full pl-9 pr-12 py-2.5 sm:py-3 bg-[#07080e] border border-white/[0.1] focus:border-[#caa052] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm no-spinner"
                      />

                      {/* Theme-Related Up & Down Stepper Controls for CTC */}
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center border border-white/[0.12] rounded-lg bg-[#0e101b] overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(ctc) || 0;
                            setCtc(String(current + 50000));
                          }}
                          className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                          title="Increase CTC"
                        >
                          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <div className="w-full h-px bg-white/[0.1]" />
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(ctc) || 0;
                            setCtc(String(Math.max(0, current - 50000)));
                          }}
                          className="px-1.5 py-0.5 hover:bg-[#caa052]/25 text-zinc-400 hover:text-[#ecd095] transition cursor-pointer"
                          title="Decrease CTC"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Salary Credit Schedule (Dynamic based on Frequency) */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                
                {/* 1. MONTHLY: 1-31 Calendar Grid */}
                {frequency === 'monthly' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-[#caa052]" />
                        <span>Salary Credit Date</span>
                      </div>
                      <span className="text-xs font-bold text-[#ecd095] bg-[#caa052]/10 border border-[#caa052]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        {isLastWorkingDay ? (
                          <>
                            <Briefcase className="w-3.5 h-3.5 text-[#caa052]" />
                            <span>Month's Last Working Day (Day {thisMonthLWD} this month)</span>
                          </>
                        ) : (
                          <span>Day {creditDate}{getOrdinal(creditDate)} of every month</span>
                        )}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-[#07080e] border border-white/[0.08] rounded-2xl space-y-3">
                      {/* Popular Payday chips */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-zinc-500 font-semibold text-xs">Popular Paydays:</span>
                        {[1, 5, 25, 28, 30].map(pDay => (
                          <button
                            key={pDay}
                            type="button"
                            onClick={() => {
                              setCreditDate(pDay);
                              setIsLastWorkingDay(false);
                            }}
                            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                              !isLastWorkingDay && creditDate === pDay
                                ? 'bg-[#caa052] text-black border-[#caa052] font-black shadow-sm'
                                : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:border-[#caa052]/40 hover:text-white'
                            }`}
                          >
                            {pDay}{getOrdinal(pDay)}
                          </button>
                        ))}

                        {/* Month's Last Working Day */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsLastWorkingDay(true);
                            setCreditDate(thisMonthLWD);
                          }}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            isLastWorkingDay
                              ? 'bg-gradient-to-r from-[#caa052] to-[#b3883b] text-black border-[#caa052] shadow-md shadow-[#caa052]/20 font-black'
                              : 'bg-gradient-to-r from-[#caa052]/15 to-transparent text-[#ecd095] border-[#caa052]/40 hover:border-[#caa052]/70 hover:bg-[#caa052]/25'
                          }`}
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Month's Last Working Day</span>
                        </button>
                      </div>

                      {/* Day-of-Week headers */}
                      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-zinc-500 pt-1 border-t border-white/[0.06]">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>

                      {/* 1-31 Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                          const isSelected = isLastWorkingDay ? day === thisMonthLWD : creditDate === day;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setCreditDate(day);
                                setIsLastWorkingDay(false);
                              }}
                              className={`h-8 sm:h-9 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center relative ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#caa052] to-[#b3883b] text-black font-black shadow-md shadow-[#caa052]/30 scale-105 ring-2 ring-[#caa052]/50'
                                  : 'text-zinc-300 hover:text-white hover:bg-white/10 bg-white/[0.03] border border-white/[0.04]'
                              }`}
                            >
                              <span>{day}</span>
                              {isLastWorkingDay && day === thisMonthLWD && (
                                <span className="absolute -top-1 -right-1 text-[9px]">💼</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanatory Note */}
                      <div className="pt-1.5 border-t border-white/[0.06] text-[11px]">
                        {isLastWorkingDay ? (
                          <div className="flex items-center gap-2 text-[#ecd095]">
                            <Briefcase className="w-3.5 h-3.5 text-[#caa052] flex-shrink-0" />
                            <span>
                              If the month ends on a Saturday or Sunday, salary automatically credits on Friday (Day {thisMonthLWD} this month).
                            </span>
                          </div>
                        ) : (
                          <p className="text-zinc-500">
                            Your monthly budget runway recalculates on Day {creditDate}{getOrdinal(creditDate)} of every month.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. WEEKLY: Weekday Selector (Mon to Sun) */}
                {frequency === 'weekly' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-[#caa052]" />
                        <span>Weekly Payday</span>
                      </div>
                      <span className="text-xs font-bold text-[#ecd095] bg-[#caa052]/10 border border-[#caa052]/30 px-3 py-1 rounded-full">
                        Every {selectedWeekdayName}
                      </span>
                    </div>

                    <div className="p-4 bg-[#07080e] border border-white/[0.08] rounded-2xl space-y-3">
                      <p className="text-xs text-zinc-400">
                        Select the weekday your weekly pay is credited:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                        {WEEKDAYS.map(w => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setCreditWeekday(w.id)}
                            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                              creditWeekday === w.id
                                ? 'bg-gradient-to-r from-[#caa052] to-[#b3883b] text-black font-black border-[#caa052] shadow-md shadow-[#caa052]/20'
                                : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white hover:border-[#caa052]/40'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider opacity-80">{w.short}</span>
                            <span>{w.name}</span>
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-zinc-500">
                        Your weekly budget resets every 7 days on <strong className="text-zinc-300">{selectedWeekdayName}</strong> morning.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. BI-WEEKLY: 14-Day Cycle on Weekday */}
                {frequency === 'bi-weekly' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-[#caa052]" />
                        <span>Bi-Weekly Payday</span>
                      </div>
                      <span className="text-xs font-bold text-[#ecd095] bg-[#caa052]/10 border border-[#caa052]/30 px-3 py-1 rounded-full">
                        Every Alternate {selectedWeekdayName}
                      </span>
                    </div>

                    <div className="p-4 bg-[#07080e] border border-white/[0.08] rounded-2xl space-y-3">
                      <p className="text-xs text-zinc-400">
                        Select the day of the week your 14-day paycheck lands:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                        {WEEKDAYS.map(w => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setCreditWeekday(w.id)}
                            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                              creditWeekday === w.id
                                ? 'bg-gradient-to-r from-[#caa052] to-[#b3883b] text-black font-black border-[#caa052] shadow-md shadow-[#caa052]/20'
                                : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white hover:border-[#caa052]/40'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider opacity-80">{w.short}</span>
                            <span>{w.name}</span>
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-zinc-500">
                        Your spend runway paces your expenses across each 14-day cycle ending every other <strong className="text-zinc-300">{selectedWeekdayName}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. DAILY: 24-Hour Continuous Cycle */}
                {frequency === 'daily' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-[#caa052]" />
                        <span>Daily Payout Model</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Continuous Daily Cycle</span>
                      </span>
                    </div>

                    <div className="p-4 bg-[#07080e] border border-[#caa052]/25 rounded-2xl flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#caa052]/10 border border-[#caa052]/30 flex items-center justify-center text-[#ecd095] flex-shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Daily Earnings Active
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          Your earnings credit every 24 hours. SaveUp calculates your real-time daily budget and automatically refreshes your safe spend allowance each day at midnight.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Fixed Action Footer at bottom of Big Box */}
            <div className="pt-3 mt-2 border-t border-white/[0.08] flex-shrink-0 flex items-center gap-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 sm:py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs sm:text-sm font-bold text-zinc-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="gold-pill-btn flex-1 py-3 sm:py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-[#caa052]/20 hover:scale-[1.005] transition"
              >
                <span>{isEditing ? 'Save Salary Changes' : 'Save & Launch Dashboard'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </form>

        </div>
      </main>

      {/* Footer without awkward line collision */}
      {!isEditing && (
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 pb-3 text-center text-xs text-zinc-500 relative z-20 flex-shrink-0">
          © SaveUp • Smart Personal Finance Ledger. All rights reserved.
        </footer>
      )}

    </div>
  );
};

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
