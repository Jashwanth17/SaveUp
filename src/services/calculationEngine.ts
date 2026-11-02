import { 
  FinancialProfile, 
  Transaction, 
  DailyAllowanceCalculation, 
  SimulationResult, 
  FinancialHealthScore 
} from '../types';

/**
 * Pure calculation engine for salary cycles, dynamic daily allowances,
 * pre-purchase simulations, and financial health scores.
 */

export function getLastWorkingDayOfMonth(year: number, monthIndex: number): number {
  const lastDayDate = new Date(year, monthIndex + 1, 0);
  let dayOfWeek = lastDayDate.getDay(); // 0 = Sun, 6 = Sat
  let date = lastDayDate.getDate();

  if (dayOfWeek === 0) {
    date -= 2; // Sunday -> Friday
  } else if (dayOfWeek === 6) {
    date -= 1; // Saturday -> Friday
  }
  return date;
}

export const calculateDailyAllowance = (
  profile: FinancialProfile,
  transactions: Transaction[]
): DailyAllowanceCalculation => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  let cycleStart: Date;
  let cycleEnd: Date;

  if (profile.isLastWorkingDay) {
    const curLWD = getLastWorkingDayOfMonth(currentYear, currentMonth);
    const prevLWD = getLastWorkingDayOfMonth(currentYear, currentMonth - 1);
    const nextLWD = getLastWorkingDayOfMonth(currentYear, currentMonth + 1);

    if (todayDate >= curLWD) {
      cycleStart = new Date(currentYear, currentMonth, curLWD);
      cycleEnd = new Date(currentYear, currentMonth + 1, nextLWD - 1);
    } else {
      cycleStart = new Date(currentYear, currentMonth - 1, prevLWD);
      cycleEnd = new Date(currentYear, currentMonth, curLWD - 1);
    }
  } else {
    const salaryCreditDay = profile.salaryCreditDate || 1;

    if (todayDate >= salaryCreditDay) {
      cycleStart = new Date(currentYear, currentMonth, salaryCreditDay);
      cycleEnd = new Date(currentYear, currentMonth + 1, salaryCreditDay - 1);
      if (salaryCreditDay === 1) {
        cycleEnd = new Date(currentYear, currentMonth + 1, 0);
      }
    } else {
      cycleStart = new Date(currentYear, currentMonth - 1, salaryCreditDay);
      cycleEnd = new Date(currentYear, currentMonth, salaryCreditDay - 1);
    }
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysInCycle = Math.round((cycleEnd.getTime() - cycleStart.getTime()) / msPerDay) + 1;
  const diffFromStart = Math.floor((now.getTime() - cycleStart.getTime()) / msPerDay);
  const daysPassed = Math.max(1, Math.min(daysInCycle, diffFromStart + 1));
  const daysRemaining = Math.max(1, daysInCycle - daysPassed + 1);

  const pad = (n: number) => String(n).padStart(2, '0');
  const startStr = `${cycleStart.getFullYear()}-${pad(cycleStart.getMonth() + 1)}-${pad(cycleStart.getDate())}`;
  const endStr = `${cycleEnd.getFullYear()}-${pad(cycleEnd.getMonth() + 1)}-${pad(cycleEnd.getDate())}`;
  const todayStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(todayDate)}`;

  const fixedCommitmentsTotal = profile.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const inHandSalary = profile.monthlyInHandSalary;
  const additionalIncome = profile.additionalIncome;
  const totalIncome = inHandSalary + additionalIncome;
  const savingsAllocation = profile.monthlySavingsTarget;

  // Formula: Available spending budget = In-hand salary + additional income - fixed expenses - savings allocation
  const initialSpendablePool = Math.max(0, totalIncome - fixedCommitmentsTotal - savingsAllocation);

  const cycleExpenses = transactions.filter(tx => {
    return tx.type === 'expense' && tx.date >= startStr && tx.date <= endStr && !tx.isScheduled;
  });

  const actualSpentThisCycle = cycleExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  const todayExpenses = cycleExpenses.filter(tx => tx.date === todayStr);
  const actualDailySpendToday = todayExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  const upcomingScheduledBills = profile.fixedExpenses
    .filter(item => !item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);

  const remainingSpendableBudget = Math.max(0, initialSpendablePool - actualSpentThisCycle);
  const dailyAllowanceToday = Math.round(remainingSpendableBudget / daysRemaining);
  const remainingTodayAllowance = dailyAllowanceToday - actualDailySpendToday;
  const baselineDailyAllowance = Math.round(initialSpendablePool / daysInCycle);

  const expectedSpendSoFar = baselineDailyAllowance * (daysPassed - 1);
  const actualSpendBeforeToday = actualSpentThisCycle - actualDailySpendToday;

  let carryForwardAmount = 0;
  let overspendingDeficit = 0;

  if (expectedSpendSoFar > actualSpendBeforeToday) {
    carryForwardAmount = expectedSpendSoFar - actualSpendBeforeToday;
  } else {
    overspendingDeficit = actualSpendBeforeToday - expectedSpendSoFar;
  }

  let status: 'healthy' | 'caution' | 'critical' = 'healthy';
  if (remainingTodayAllowance < 0 || dailyAllowanceToday < baselineDailyAllowance * 0.5) {
    status = 'critical';
  } else if (dailyAllowanceToday < baselineDailyAllowance * 0.8) {
    status = 'caution';
  }

  return {
    cycleStartDate: startStr,
    cycleEndDate: endStr,
    daysInCycle,
    daysPassed,
    daysRemaining,
    inHandSalary,
    additionalIncome,
    totalIncome,
    fixedCommitmentsTotal,
    savingsAllocation,
    spendablePool: initialSpendablePool,
    actualSpentThisCycle,
    upcomingScheduledBills,
    remainingSpendableBudget,
    dailyAllowanceToday,
    actualDailySpendToday,
    remainingTodayAllowance,
    carryForwardAmount,
    overspendingDeficit,
    status,
  };
};

export const calculateHealthScore = (
  profile: FinancialProfile,
  calculations: DailyAllowanceCalculation
): FinancialHealthScore => {
  const totalIncome = profile.monthlyInHandSalary + profile.additionalIncome;
  const savingsRatio = totalIncome > 0 ? (profile.monthlySavingsTarget / totalIncome) * 100 : 20;
  const savingsScore = Math.min(100, Math.round((savingsRatio / 25) * 100));

  const fixedTotal = profile.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const fixedRatio = totalIncome > 0 ? (fixedTotal / totalIncome) * 100 : 50;
  const fixedScore = fixedRatio <= 40 ? 100 : fixedRatio <= 50 ? 80 : fixedRatio <= 60 ? 60 : 40;

  const pacingScore = calculations.status === 'healthy' ? 95 : calculations.status === 'caution' ? 70 : 45;

  const monthlyEssential = fixedTotal + (calculations.spendablePool / 2);
  const targetFund = monthlyEssential * (profile.emergencyFundMonthsTarget || 6);
  const fundRatio = targetFund > 0 ? (profile.currentSavings / targetFund) * 100 : 100;
  const emergencyScore = Math.min(100, Math.round(fundRatio));

  const compositeScore = Math.round(
    savingsScore * 0.25 +
    fixedScore * 0.25 +
    pacingScore * 0.30 +
    emergencyScore * 0.20
  );

  let tier: 'Needs Attention' | 'Fair' | 'Good' | 'Excellent' = 'Good';
  if (compositeScore >= 85) tier = 'Excellent';
  else if (compositeScore >= 70) tier = 'Good';
  else if (compositeScore >= 50) tier = 'Fair';
  else tier = 'Needs Attention';

  return {
    score: compositeScore,
    tier,
    factors: [
      {
        label: 'Savings Rate Target',
        score: savingsScore,
        weight: '25%',
        status: savingsRatio >= 20 ? 'good' : savingsRatio >= 10 ? 'warning' : 'alert',
        explanation: `Saving ${savingsRatio.toFixed(1)}% of total monthly income (Benchmark: 20%+).`,
      },
      {
        label: 'Fixed Cost Burden',
        score: fixedScore,
        weight: '25%',
        status: fixedRatio <= 50 ? 'good' : 'warning',
        explanation: `Fixed commitments consume ${fixedRatio.toFixed(1)}% of total income (Benchmark: <50%).`,
      },
      {
        label: 'Daily Spending Discipline',
        score: pacingScore,
        weight: '30%',
        status: calculations.status === 'healthy' ? 'good' : calculations.status === 'caution' ? 'warning' : 'alert',
        explanation: calculations.status === 'healthy' ? 'Spending velocity is safely under the daily ceiling.' : 'Spending velocity is straining your daily allowance.',
      },
      {
        label: 'Emergency Fund Runway',
        score: emergencyScore,
        weight: '20%',
        status: emergencyScore >= 75 ? 'good' : emergencyScore >= 40 ? 'warning' : 'alert',
        explanation: `Current savings cover ${(profile.currentSavings / (monthlyEssential || 1)).toFixed(1)} months of essential living expenses.`,
      },
    ],
  };
};

export const simulatePurchase = (
  itemName: string,
  cost: number,
  calculations: DailyAllowanceCalculation,
  profile: FinancialProfile
): SimulationResult => {
  const currentBalance = calculations.remainingSpendableBudget;
  const projectedBalanceAfter = currentBalance - cost;
  const daysRemaining = calculations.daysRemaining;

  const currentDailyAllowance = calculations.dailyAllowanceToday;
  const projectedDailyAllowance = Math.max(0, Math.round(projectedBalanceAfter / daysRemaining));
  const dailyAllowanceDelta = projectedDailyAllowance - currentDailyAllowance;

  const upcomingBills = calculations.upcomingScheduledBills;
  const canAffordUpcomingBills = projectedBalanceAfter >= 0;

  let savingsImpactAmount = 0;
  let savingsTargetMet = true;
  if (projectedBalanceAfter < 0) {
    savingsImpactAmount = Math.abs(projectedBalanceAfter);
    savingsTargetMet = false;
  }

  let verdict: 'safe' | 'warning' | 'critical' = 'safe';
  const insights: string[] = [];

  if (projectedBalanceAfter < 0) {
    verdict = 'critical';
    insights.push(`🚨 Exceeds your remaining discretionary budget by ₹${Math.abs(projectedBalanceAfter).toLocaleString('en-IN')}.`);
    insights.push(`⚠️ This purchase will erode your monthly savings target by ₹${savingsImpactAmount.toLocaleString('en-IN')}.`);
  } else if (projectedDailyAllowance < currentDailyAllowance * 0.5) {
    verdict = 'warning';
    insights.push(`⚠️ Daily allowance drops from ₹${currentDailyAllowance.toLocaleString('en-IN')}/day to ₹${projectedDailyAllowance.toLocaleString('en-IN')}/day.`);
    insights.push(`💡 Requires tightening discretionary lifestyle expenses for the next ${daysRemaining} days.`);
  } else {
    verdict = 'safe';
    insights.push(`✅ Safe purchase! You still maintain a comfortable allowance of ₹${projectedDailyAllowance.toLocaleString('en-IN')}/day.`);
    insights.push(`🛡️ Upcoming fixed commitments (₹${upcomingBills.toLocaleString('en-IN')}) and savings target remain 100% protected.`);
  }

  return {
    purchaseItem: itemName,
    cost,
    currentBalance,
    projectedBalanceAfter,
    currentDailyAllowance,
    projectedDailyAllowance,
    dailyAllowanceDelta,
    savingsImpactAmount,
    savingsTargetMet,
    canAffordUpcomingBills,
    verdict,
    insights,
  };
};
