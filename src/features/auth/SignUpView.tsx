import React, { useState } from 'react';
import { User, Lock, KeyRound, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

interface SignUpViewProps {
  onNavigateToLogin: (prefilledUsername?: string) => void;
  onNavigateToWelcome: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onNavigateToLogin,
  onNavigateToWelcome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [errors, setErrors] = useState<{ username?: string; password?: string; recoveryPin?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!username.trim()) newErrors.username = 'Please enter a username.';
    if (!password) newErrors.password = 'Please enter a password.';
    if (!recoveryPin.trim()) {
      newErrors.recoveryPin = 'Please create a 4-digit recovery PIN.';
    } else if (!/^\d{4}$/.test(recoveryPin.trim())) {
      newErrors.recoveryPin = 'Recovery PIN must be exactly 4 digits (0-9).';
    }

    if (username.trim() && authService.isUsernameTaken(username.trim())) {
      newErrors.username = 'Username is already taken. Please choose another.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = authService.createAccount(username, password, recoveryPin);
    if (!result.success) {
      setErrors({ general: result.error || 'Failed to create account.' });
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onNavigateToLogin(username.trim());
    }, 1000);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full bg-[#050507] text-zinc-100 flex flex-col justify-between selection:bg-[#caa052]/30 selection:text-[#fce8bd] overflow-hidden select-none">
      
      {/* Background ambient lighting */}
      <div 
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-35 blur-[120px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(202, 160, 82, 0.45) 0%, rgba(170, 119, 34, 0.15) 50%, transparent 70%)'
        }}
      />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between relative z-20 flex-shrink-0">
        <button 
          onClick={onNavigateToWelcome}
          className="flex items-center gap-2.5 cursor-pointer group text-left"
        >
          <div className="w-9 h-9 rounded-full border border-[#caa052]/40 bg-gradient-to-br from-[#1c170e] to-[#0a0804] flex items-center justify-center relative shadow-sm shadow-[#caa052]/20">
            <span className="font-serif font-black text-sm text-[#ecd095] group-hover:text-white transition">S</span>
          </div>
          <div>
            <div className="text-lg font-extrabold text-white tracking-tight leading-none">SaveUp</div>
            <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">Personal Finance</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateToLogin()}
          className="text-sm font-semibold text-zinc-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/5 cursor-pointer"
        >
          Login
        </button>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 relative z-20 min-h-0">
        <div className="w-full max-w-md bg-[#0c0d14]/95 border border-[#caa052]/40 rounded-3xl shadow-2xl shadow-black p-6 sm:p-7 space-y-4">
          
          {/* Card Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create SaveUp Account
            </h1>
            <p className="text-sm text-zinc-400">
              Set up your username, password, and 4-digit PIN
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Account created! Redirecting to login...</span>
            </div>
          )}

          {/* Error Banner */}
          {errors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm ${
                    errors.username ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm ${
                    errors.password ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
            </div>

            {/* Recovery PIN */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">
                Recovery PIN <span className="text-zinc-500 font-normal text-xs">(4 Digits)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  value={recoveryPin}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setRecoveryPin(digits);
                    if (errors.recoveryPin) setErrors(prev => ({ ...prev, recoveryPin: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none tracking-widest transition text-sm sm:text-base font-mono ${
                    errors.recoveryPin ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.recoveryPin && <p className="text-xs text-rose-400 mt-1">{errors.recoveryPin}</p>}
              <p className="text-[11px] text-zinc-400 mt-1">
                Choose a 4-digit PIN to reset your password if ever forgotten.
              </p>
            </div>

            {/* Continue to Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={success}
                className="gold-pill-btn w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#caa052]/20"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Already have an account link */}
          <div className="pt-2 border-t border-white/[0.08] text-center text-xs sm:text-sm text-zinc-400">
            <span>Already have an account? </span>
            <button
              onClick={() => onNavigateToLogin()}
              className="text-[#ecd095] font-bold hover:underline cursor-pointer ml-1"
            >
              Login
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 border-t border-white/[0.06] text-center text-xs text-zinc-500 relative z-20 flex-shrink-0">
        © SaveUp • Smart Personal Finance Ledger. All rights reserved.
      </footer>

    </div>
  );
};
