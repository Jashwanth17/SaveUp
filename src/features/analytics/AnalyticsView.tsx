import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Printer 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/formatters';
import { Card } from '../../components/ui';
import { exportService } from '../../services/exportService';

export const AnalyticsView: React.FC = () => {
  const { transactions, categories, profile, calculations } = useFinance();

  const dailyTrendData = React.useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      map.set(str, 0);
    }

    transactions.forEach(tx => {
      if (tx.type === 'expense' && !tx.isScheduled && map.has(tx.date)) {
        map.set(tx.date, (map.get(tx.date) || 0) + tx.amount);
      }
    });

    return Array.from(map.entries()).map(([dateStr, spend]) => {
      const [y, m, d] = dateStr.split('-');
      return {
        date: `${d}/${m}`,
        spend,
        allowance: calculations.dailyAllowanceToday,
      };
    });
  }, [transactions, calculations.dailyAllowanceToday]);

  const monthlyComparisonData = [
    { month: 'Jun', income: 135000, expense: 78000, savings: 32000 },
    { month: 'Jul', income: 135000, expense: 84000, savings: 28000 },
    { month: 'Aug', income: 140000, expense: 81000, savings: 34000 },
    { month: 'Sep', income: 135000, expense: 89000, savings: 25000 },
    { month: 'Oct', income: 145000, expense: 83000, savings: 35000 },
    { month: 'Nov (Current)', income: calculations.totalIncome, expense: calculations.actualSpentThisCycle + calculations.fixedCommitmentsTotal, savings: calculations.savingsAllocation },
  ];

  const categoryData = React.useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color: string }>();

    transactions.forEach(tx => {
      if (tx.type === 'expense' && !tx.isScheduled) {
        const catObj = categories.find(c => c.name === tx.category);
        const existing = map.get(tx.category) || {
          name: tx.category,
          amount: 0,
          color: catObj?.color || '#10b981',
        };
        existing.amount += tx.amount;
        map.set(tx.category, existing);
      }
    });

    return Array.from(map.values())
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const savingsProjectionData = [
    { month: 'Current', savings: profile.currentSavings },
    { month: '+1 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget },
    { month: '+2 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget * 2 },
    { month: '+3 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget * 3 },
    { month: '+4 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget * 4 },
    { month: '+5 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget * 5 },
    { month: '+6 Mo', savings: profile.currentSavings + profile.monthlySavingsTarget * 6 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Intelligence & Visualizations
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Analytics & Reports</h2>
          <p className="text-xs text-slate-400">
            Recharts-powered spending breakdowns, income pacing, and wealth projections
          </p>
        </div>

        <button
          onClick={exportService.printReport}
          className="gold-outline-btn px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#caa052]" />
          <span>Export PDF Report</span>
        </button>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Daily Spending Velocity vs Daily Allowance</h3>
            <p className="text-xs text-zinc-400">
              Gold line represents your calculated safe daily spending ceiling ({formatINR(calculations.dailyAllowanceToday)}/day)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-zinc-300">Actual Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#caa052]" />
              <span className="text-[#ecd095]">Daily Allowance</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c0d14', borderColor: 'rgba(202, 160, 82, 0.3)', borderRadius: '1rem', fontSize: '12px', color: '#fff' }}
                formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
              <Area
                type="step"
                dataKey="allowance"
                stroke="#caa052"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Inflow vs Outflows</h3>
            <p className="text-xs text-zinc-400">Past 6-month historical income & outflow ratio</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickFormatter={v => `₹${v / 1000}k`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c0d14', borderColor: 'rgba(202, 160, 82, 0.3)', borderRadius: '1rem', fontSize: '12px', color: '#fff' }}
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="income" name="Total Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses & Fixed Bills" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Savings Added" fill="#caa052" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Category-Wise Spending Breakdown</h3>
            <p className="text-xs text-slate-400">Current cycle distribution</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-500">No expenses recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Projected Savings & Net Worth Trajectory</h3>
          <p className="text-xs text-slate-400">
            Forecasted wealth accumulation assuming steady monthly savings target of {formatINR(profile.monthlySavingsTarget)}/mo
          </p>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsProjectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={v => `₹${v / 1000}k`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any) => [formatINR(Number(val)), 'Projected Net Savings']}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#savingsGrowthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
