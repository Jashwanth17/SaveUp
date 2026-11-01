import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { ActiveTab } from './components/navigation/Sidebar';
import { Navbar } from './components/navigation/Navbar';
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
import { useFinance } from './hooks/useFinance';

const MainApp: React.FC = () => {
  const { profile } = useFinance();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [addTxModalOpen, setAddTxModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(!profile.isSetupCompleted);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  const handleOpenAddTxWithDate = (date: string) => {
    setPrefilledDate(date);
    setAddTxModalOpen(true);
  };

  const handleOpenAddTxStandard = () => {
    setPrefilledDate(undefined);
    setAddTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col antialiased selection:bg-[#caa052]/30 selection:text-[#fce8bd] relative">
      {/* Subtle Warm Gold Ambient Glow at Top */}
      <div 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(202, 160, 82, 0.22), transparent 70%)'
        }}
      />

      {/* Floating Dark Pill Header (Playerhub Style) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetup={() => setSetupModalOpen(true)}
        onOpenAddTx={handleOpenAddTxStandard}
      />

      {/* Main Content View Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto relative z-10">
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
