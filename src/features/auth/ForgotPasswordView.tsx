import React, { useState } from 'react';
import { User, Lock, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordViewProps {
  onNavigateToLogin: (prefilledUsername?: string) => void;
  onNavigateToWelcome: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateToLogin,
  onNavigateToWelcome,
}) => {
  const [username, setUsername] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [errors, setErrors] = useState<{ username?: string; recoveryPin?: string; newPassword?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!username.trim() && !recoveryPin.trim()) {
      newErrors.general = 'Please enter either your Username or your 4-digit Recovery PIN.';
    }

    if (recoveryPin.trim() && !/^\d{4}$/.test(recoveryPin.trim())) {
      newErrors.recoveryPin = 'Recovery PIN must be exactly 4 digits.';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Please enter a new password.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = authService.resetPasswordWithUsernameOrPin(username, recoveryPin, newPassword);

    if (!result.success) {
      setErrors({ general: result.error || 'Failed to verify account. Please check your username or recovery PIN.' });
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onNavigateToLogin(username.trim());
    }, 1200);
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
          className="text-sm font-semibold text-zinc-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 relative z-20 min-h-0">
        <div className="w-full max-w-md bg-[#0c0d14]/95 border border-[#caa052]/40 rounded-3xl shadow-2xl shadow-black p-6 sm:p-7 space-y-4">
          
          {/* Card Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-sm text-zinc-400">
              Verify your identity using your username or 4-digit PIN
            </p>
          </div>

          {/* Prominent Warning Notice */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-amber-200/90 leading-snug">
            <AlertTriangle className="w-4 h-4 text-[#caa052] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-100 font-bold block mb-0.5">Important:</strong>
              If you forgot both your username and recovery PIN, you cannot recover your account.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Password reset successful! Redirecting to login...</span>
            </div>
          )}

          {/* Error Banner */}
          {errors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleReset} className="space-y-3.5">
            {/* Option 1: Username */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">
                Username <span className="text-zinc-500 font-normal text-xs">(Option 1)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your registered username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm ${
                    errors.username ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username}</p>}
            </div>

            {/* Visual OR Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0c0d14] px-3 text-xs font-extrabold text-[#caa052] tracking-widest uppercase">
                OR
              </span>
            </div>

            {/* Option 2: Recovery PIN */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">
                Recovery PIN <span className="text-zinc-500 font-normal text-xs">(Option 2 • 4 Digits)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={recoveryPin}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setRecoveryPin(digits);
                    if (errors.recoveryPin) setErrors(prev => ({ ...prev, recoveryPin: undefined }));
                    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
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
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#07080e] border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none transition text-sm ${
                    errors.newPassword ? 'border-rose-500' : 'border-white/[0.1] focus:border-[#caa052]'
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
              {errors.newPassword && <p className="text-xs text-rose-400 mt-1">{errors.newPassword}</p>}
            </div>

            {/* Reset Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={success}
                className="gold-pill-btn w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#caa052]/20 disabled:opacity-70"
              >
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Back to Login link */}
          <div className="pt-2 border-t border-white/[0.08] text-center text-xs sm:text-sm text-zinc-400">
            <button
              onClick={() => onNavigateToLogin()}
              className="text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
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
