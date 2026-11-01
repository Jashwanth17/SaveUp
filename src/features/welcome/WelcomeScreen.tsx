import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onLogin,
}) => {
  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full bg-[#050507] text-zinc-100 flex flex-col justify-between selection:bg-[#caa052]/30 selection:text-[#fce8bd] overflow-hidden select-none touch-none">
      
      {/* Ambient Radial Champagne Gold Glows */}
      <div 
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] opacity-40 blur-[120px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(202, 160, 82, 0.45) 0%, rgba(170, 119, 34, 0.15) 55%, transparent 75%)'
        }}
      />
      <div 
        className="pointer-events-none absolute -bottom-32 right-1/4 w-[450px] h-[350px] opacity-25 blur-[120px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(202, 160, 82, 0.35) 0%, transparent 70%)'
        }}
      />

      {/* Subtle Background Luxury Grid Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex items-center justify-between relative z-20 flex-shrink-0">
        {/* Brand Monogram & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#caa052]/45 bg-gradient-to-br from-[#1e1910] via-[#0d0e14] to-[#050507] flex items-center justify-center relative shadow-lg shadow-[#caa052]/20">
            <span className="font-serif font-black text-sm text-[#ecd095]">S</span>
            <div className="absolute inset-0 rounded-full border border-[#caa052]/30" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none">
              SaveUp
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Right Header Login Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="dark-pill-btn px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold hover:border-[#caa052]/60 hover:text-white transition cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Centerpiece */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-4 relative z-20 min-h-0">
        <div className="w-full max-w-lg mx-auto text-center space-y-4 sm:space-y-6">
          
          {/* Hero Emblem & Logo */}
          <div className="space-y-3 flex flex-col items-center">
            {/* Double-Ring Luxury Gold Monogram Emblem */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#caa052]/35 via-[#f3cf8a]/25 to-[#caa052]/35 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-full border-2 border-[#caa052]/60 bg-gradient-to-br from-[#1e1910] via-[#0d0e14] to-[#050507] p-1 shadow-2xl shadow-black flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-[#caa052]/30 flex items-center justify-center bg-black/40">
                  <span className="font-serif font-black text-2xl sm:text-4xl gold-text-gradient tracking-tight">
                    S
                  </span>
                </div>
              </div>
            </div>

            {/* Brand Title */}
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                SaveUp
              </div>
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#caa052] to-transparent mx-auto mt-2" />
            </div>
          </div>

          {/* Tagline & Core Proposition */}
          <div className="space-y-2.5 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Know what you can <span className="gold-text-gradient">spend today.</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              A private salary-based finance engine that dynamically computes your safe daily spending ceiling from your real salary and fixed bills.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">100% Private</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#caa052]" />
              <span className="font-medium">No Bank Account Linking</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Daily Runway Math</span>
            </div>
          </div>

          {/* Primary Action Buttons: Get Started & Login */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto w-full">
            {/* Get Started Button */}
            <button
              onClick={onGetStarted}
              className="gold-pill-btn w-full sm:w-auto px-8 sm:px-9 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-[#caa052]/20 hover:shadow-[#caa052]/35 transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Login Button */}
            <button
              onClick={onLogin}
              className="gold-outline-btn w-full sm:w-auto px-7 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-[#caa052] transition"
            >
              <span>Login</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer (Fixed at Bottom, Compact) */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-white/[0.06] text-center text-xs text-zinc-500 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-1 flex-shrink-0">
        <div>
          © {new Date().getFullYear()} SaveUp. Every Rupee, Calculated.
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span>Private Ledger</span>
          <span>•</span>
          <span>Manual Entry Engine</span>
          <span>•</span>
          <span>Salary Intelligence</span>
        </div>
      </footer>

    </div>
  );
};
