import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar, ActiveTab } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { DashboardView } from './features/dashboard/DashboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { ExpensesView } from './features/expenses/ExpensesView';
import { SalaryCycleView } from './features/salary-cycle/SalaryCycleView';
import { SavingsView } from './features/savings/SavingsView';
import { SimulatorView } from './features/simulator/SimulatorView';
import { SubscriptionsView } from './features/subscriptions/SubscriptionsView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { HealthInsightsView } from './features/insights/HealthInsightsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { SetupModal } from './features/setup/SetupModal';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { SignUpView } from './features/auth/SignUpView';
import { LoginView } from './features/auth/LoginView';
import { ForgotPasswordView } from './features/auth/ForgotPasswordView';
import { OnboardingView } from './features/onboarding/OnboardingView';
import { useFinance } from './hooks/useFinance';

type AppScreen = 'welcome' | 'signup' | 'login' | 'forgot' | 'onboarding' | 'app';

const MainApp: React.FC = () => {
  const { profile } = useFinance();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [loginUsernamePrefill, setLoginUsernamePrefill] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addTxModalOpen, setAddTxModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  const handleOpenAddTxWithDate = (date: string) => {
    setPrefilledDate(date);
    setAddTxModalOpen(true);
  };

  const handleOpenAddTxStandard = () => {
    setPrefilledDate(undefined);
    setAddTxModalOpen(true);
  };

  // Screen 1 – Welcome Landing
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setCurrentScreen('signup')}
        onLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // Screen 2 – Sign Up
  if (currentScreen === 'signup') {
    return (
      <SignUpView
        onNavigateToLogin={(prefill) => {
          if (prefill) setLoginUsernamePrefill(prefill);
          setCurrentScreen('login');
        }}
        onNavigateToWelcome={() => setCurrentScreen('welcome')}
      />
    );
  }

  // Screen 3 – Login
  if (currentScreen === 'login') {
    return (
      <LoginView
        initialUsername={loginUsernamePrefill}
        onNavigateToSignUp={() => setCurrentScreen('signup')}
        onNavigateToForgot={() => setCurrentScreen('forgot')}
        onNavigateToWelcome={() => setCurrentScreen('welcome')}
        onLoginSuccess={() => {
          if (!profile.isSetupCompleted) {
            setCurrentScreen('onboarding');
          } else {
            setCurrentScreen('app');
          }
        }}
      />
    );
  }

  // Forgot Password (with Recovery PIN)
  if (currentScreen === 'forgot') {
    return (
      <ForgotPasswordView
        onNavigateToLogin={(prefill) => {
          if (prefill) setLoginUsernamePrefill(prefill);
          setCurrentScreen('login');
        }}
        onNavigateToWelcome={() => setCurrentScreen('welcome')}
      />
    );
  }

  // Unified Single Onboarding Screen (Big Box with Scrollable Content)
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingView
        onComplete={() => setCurrentScreen('app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col lg:flex-row antialiased selection:bg-[#caa052]/30 selection:text-[#fce8bd] relative">
      {/* Subtle Warm Gold Ambient Glow at Top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(202, 160, 82, 0.22), transparent 70%)'
        }}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetup={() => setSetupModalOpen(true)}
        onSignOut={() => setCurrentScreen('welcome')}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden relative z-10">
        {/* Top Header with Profile Icon, Username, Notifications & Sign Out */}
        <Header
          activeTab={activeTab}
          onOpenSetup={() => setSetupModalOpen(true)}
          onSignOut={() => setCurrentScreen('welcome')}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable Main Content View Container */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto lg:overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenAddTx={handleOpenAddTxStandard}
            onOpenSetup={() => setSetupModalOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            onOpenAddTxWithDate={handleOpenAddTxWithDate}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            onOpenAddTx={handleOpenAddTxStandard}
          />
        )}

        {activeTab === 'salary-cycle' && (
          <SalaryCycleView
            onOpenSetup={() => setSetupModalOpen(true)}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsView />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'health-insights' && (
          <HealthInsightsView />
        )}
      </main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={addTxModalOpen}
        onClose={() => {
          setAddTxModalOpen(false);
          setPrefilledDate(undefined);
        }}
        initialDate={prefilledDate}
      />

      <SetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}

export default App;
