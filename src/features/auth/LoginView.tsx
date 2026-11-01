import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useFinance } from '../../hooks/useFinance';

interface LoginViewProps {
  initialUsername?: string;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
  onNavigateToWelcome: () => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  initialUsername = '',
  onNavigateToSignUp,
  onNavigateToForgot,
  onNavigateToWelcome,
  onLoginSuccess,
}) => {
  const { updateProfile } = useFinance();

  const [username, setUsername] = useState(() => {
    return initialUsername || localStorage.getItem('saveup_user_name') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!username.trim()) newErrors.username = 'Please enter your username.';
    if (!password) newErrors.password = 'Please enter your password.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.login(username, password);

      if (!result.success) {
        setIsLoading(false);
        setErrors({ general: result.error || 'Invalid credentials.' });
        return;
      }

      updateProfile({
        userName: result.account?.username || username.trim(),
      });

      setIsLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    }, 500);
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
          onClick={onNavigateToSignUp}
          className="text-sm font-semibold text-zinc-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/5 cursor-pointer"
        >
          Sign Up
        </button>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 relative z-20 min-h-0">
        <div className="w-full max-w-md bg-[#0c0d14]/95 border border-[#caa052]/40 rounded-3xl shadow-2xl shadow-black p-6 sm:p-7 space-y-4">
          
          {/* Card Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Login to SaveUp
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your username and password to access your ledger
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Signed in! Loading dashboard...</span>
            </div>
          )}

          {/* Error Banner */}
          {errors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your username"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-xs sm:text-sm text-[#caa052] hover:text-[#f3cf8a] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || success}
                className="gold-pill-btn w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#caa052]/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Don't have an account link */}
          <div className="pt-2 border-t border-white/[0.08] text-center text-xs sm:text-sm text-zinc-400">
            <span>Don't have an account? </span>
            <button
              onClick={onNavigateToSignUp}
              className="text-[#ecd095] font-bold hover:underline cursor-pointer ml-1"
            >
              Sign Up
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 border-t border-white/[0.06] text-center text-xs text-zinc-500 relative z-20 flex-shrink-0">
        © {new Date().getFullYear()} SaveUp. Personal Finance Ledger.
      </footer>

    </div>
  );
};
