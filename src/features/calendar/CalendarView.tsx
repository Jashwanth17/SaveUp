import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Receipt, 
  Trash2, 
  CalendarCheck, 
  X 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR, formatDate } from '../../utils/formatters';
import { Transaction, CategoryType } from '../../types';
import { getLastWorkingDayOfMonth } from '../../services/calculationEngine';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { Card, Badge, CustomSelect } from '../../components/ui';

type CalendarMode = 'month' | 'week';
type CalendarFilter = 'all' | 'income' | 'expenses' | 'bills' | 'savings' | 'subscriptions' | 'scheduled';

interface CalendarViewProps {
  onOpenAddTxWithDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddTxWithDate }) => {
  const { 
    transactions, 
    profile, 
    calculations, 
    subscriptions, 
    addTransaction,
    deleteTransaction,
    toggleFixedExpensePaid
  } = useFinance();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [futureTitle, setFutureTitle] = useState('');
  const [futureAmount, setFutureAmount] = useState('');
  const [futureDate, setFutureDate] = useState(selectedDate);
  const [futureCategory, setFutureCategory] = useState<CategoryType>('Utilities & Bills');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarEventsMap = useMemo(() => {
    const map = new Map<string, {
      incomeTotal: number;
      expenseTotal: number;
      transactions: Transaction[];
      scheduledBills: typeof profile.fixedExpenses;
      subscriptionsDue: typeof subscriptions;
      isSalaryDate: boolean;
    }>();

    const targetSalaryDay = profile.isLastWorkingDay
      ? getLastWorkingDayOfMonth(year, month)
      : profile.salaryCreditDate;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
      const isSalaryDate = day === targetSalaryDay;
      map.set(dateKey, {
        incomeTotal: 0,
        expenseTotal: 0,
        transactions: [],
        scheduledBills: [],
        subscriptionsDue: [],
        isSalaryDate,
      });
    }

    transactions.forEach(tx => {
      const entry = map.get(tx.date);
      if (entry) {
        if (!tx.isScheduled) {
          if (tx.type === 'income') entry.incomeTotal += tx.amount;
          else entry.expenseTotal += tx.amount;
        }
        entry.transactions.push(tx);
      }
    });

    profile.fixedExpenses.forEach(bill => {
      if (bill.dueDay <= daysInMonth) {
        const dateKey = `${year}-${pad(month + 1)}-${pad(bill.dueDay)}`;
        const entry = map.get(dateKey);
        if (entry) {
          entry.scheduledBills.push(bill);
        }
      }
    });

    subscriptions.forEach(sub => {
      if (sub.nextBillingDate.startsWith(`${year}-${pad(month + 1)}`)) {
        const entry = map.get(sub.nextBillingDate);
        if (entry) {
          entry.subscriptionsDue.push(sub);
        }
      }
    });

    return map;
  }, [year, month, daysInMonth, transactions, profile.fixedExpenses, profile.salaryCreditDate, subscriptions]);

  const selectedDayData = calendarEventsMap.get(selectedDate) || {
    incomeTotal: 0,
    expenseTotal: 0,
    transactions: [],
    scheduledBills: [],
    subscriptionsDue: [],
    isSalaryDate: false,
  };

  const filteredDayTransactions = selectedDayData.transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'expenses') return tx.type === 'expense' && !tx.isScheduled;
    if (filter === 'scheduled') return tx.isScheduled;
    if (filter === 'savings') return tx.category === 'Investment';
    if (filter === 'subscriptions') return tx.category === 'Subscriptions';
    return true;
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(futureAmount);
    if (!futureTitle || !amt || amt <= 0) return;

    addTransaction({
      amount: amt,
      type: 'expense',
      category: futureCategory,
      description: `Scheduled: ${futureTitle}`,
      date: futureDate,
      time: '09:00',
      paymentMethod: 'Net Banking',
      isScheduled: true,
      notes: 'Future scheduled commitment. Not deducted until marked paid.',
    });

    setScheduleModalOpen(false);
    setFutureTitle('');
    setFutureAmount('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Calendar Header with Controls */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-500/30 font-normal">
                Cycle Day {calculations.daysPassed}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive timeline of daily spending, salary credits & scheduled commitments
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-amber-300 transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-black/60 border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                calendarMode === 'month'
                  ? 'gold-pill-btn shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                calendarMode === 'week'
                  ? 'gold-pill-btn shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          <button
            onClick={() => {
              setFutureDate(selectedDate);
              setScheduleModalOpen(true);
            }}
            className="gold-outline-btn px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#caa052]" />
            <span>Schedule Bill</span>
          </button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-xs font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Events' },
          { id: 'income', label: 'Income & Salary' },
          { id: 'expenses', label: 'Daily Expenses' },
          { id: 'bills', label: 'Scheduled Bills' },
          { id: 'subscriptions', label: 'Subscriptions' },
          { id: 'savings', label: 'Savings Contributions' },
          { id: 'scheduled', label: 'Future Commitments' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as CalendarFilter)}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
              filter === item.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-black/60 text-slate-400 hover:bg-white/5 hover:text-white border border-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Calendar Grid & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          {calendarMode === 'month' ? (
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-24 bg-black/20 rounded-xl border border-transparent" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
                  const data = calendarEventsMap.get(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;
                  const isSalaryDate = data?.isSalaryDate;

                  const hasIncome = (data?.incomeTotal || 0) > 0;
                  const hasExpense = (data?.expenseTotal || 0) > 0;
                  const hasScheduled = (data?.scheduledBills.length || 0) > 0;
                  const hasSubs = (data?.subscriptionsDue.length || 0) > 0;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-24 p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer group relative ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : isToday
                          ? 'border-amber-400/60 bg-black/80 ring-1 ring-amber-400/40'
                          : 'border-white/5 bg-black/40 hover:border-amber-500/30 hover:bg-black/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday
                              ? 'bg-amber-400 text-black font-extrabold'
                              : isSelected
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {isSalaryDate && (
                          <Badge variant="gold" size="sm">PAY</Badge>
                        )}
                      </div>

                      <div className="mt-1 space-y-1">
                        {/* Income in Green */}
                        {hasIncome && (filter === 'all' || filter === 'income') && (
                          <div className="text-[10px] font-bold text-emerald-400 truncate">
                            +{formatINR(data?.incomeTotal || 0)}
                          </div>
                        )}

                        {/* Expense in Red */}
                        {hasExpense && (filter === 'all' || filter === 'expenses') && (
                          <div className="text-[10px] font-bold text-rose-400 truncate">
                            -{formatINR(data?.expenseTotal || 0)}
                          </div>
                        )}

                        {hasScheduled && (filter === 'all' || filter === 'bills' || filter === 'scheduled') && (
                          <div className="text-[9px] font-semibold text-rose-300 truncate bg-rose-500/10 border border-rose-500/20 rounded px-1">
                            {data?.scheduledBills.length} Bill{data?.scheduledBills.length! > 1 ? 's' : ''}
                          </div>
                        )}

                        {hasSubs && (filter === 'all' || filter === 'subscriptions') && (
                          <div className="text-[9px] font-semibold text-amber-300 truncate bg-amber-500/10 border border-amber-500/20 rounded px-1">
                            {data?.subscriptionsDue[0].name}
                          </div>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-1 right-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddTxWithDate(dateStr);
                          }}
                          className="p-1 rounded-md bg-amber-400 text-black font-bold hover:bg-amber-300 transition"
                          title="Add Expense for this date"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>7-Day Pacing & Weekly Budget Summary</span>
                <span className="text-amber-300 font-bold">Weekly Target: {formatINR(calculations.dailyAllowanceToday * 7)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const refDate = new Date(selectedDate);
                  refDate.setDate(refDate.getDate() - 3 + i);
                  const dateStr = refDate.toISOString().split('T')[0];
                  const data = calendarEventsMap.get(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between min-h-36 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-white/5 bg-black/40 hover:bg-black/80 hover:border-amber-500/30'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">
                          {refDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {refDate.getDate()}
                        </div>
                      </div>

                      <div className="my-2 space-y-1">
                        <div className="text-xs font-black text-rose-400">
                          -{formatINR(data?.expenseTotal || 0)}
                        </div>
                        {(data?.incomeTotal || 0) > 0 && (
                          <div className="text-[11px] font-bold text-emerald-400">
                            +{formatINR(data?.incomeTotal || 0)}
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1">
                        {data?.transactions.length || 0} txn{data?.transactions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Selected Date Details Panel */}
        <Card className="p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Selected Date Details
                </span>
                <h3 className="text-lg font-bold text-white">{formatDate(selectedDate)}</h3>
              </div>
              <button
                onClick={() => onOpenAddTxWithDate(selectedDate)}
                className="gold-pill-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="p-3 bg-black/60 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 font-medium">Day's Income</span>
                <div className="text-base font-bold text-emerald-400">
                  +{formatINR(selectedDayData.incomeTotal)}
                </div>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 font-medium">Day's Expenses</span>
                <div className="text-base font-bold text-rose-400">
                  -{formatINR(selectedDayData.expenseTotal)}
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-amber-500/20 mb-4 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-medium">Daily Allowance Reference:</span>
                <span className="font-bold text-amber-300">
                  {formatINR(calculations.dailyAllowanceToday)}/day
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedDayData.expenseTotal <= calculations.dailyAllowanceToday ? (
                  <span className="text-emerald-300">
                    ✅ Within daily allowance (Remaining: {formatINR(calculations.dailyAllowanceToday - selectedDayData.expenseTotal)})
                  </span>
                ) : (
                  <span className="text-rose-400">
                    ⚠️ Exceeded allowance by {formatINR(selectedDayData.expenseTotal - calculations.dailyAllowanceToday)}
                  </span>
                )}
              </div>
            </div>

            {selectedDayData.scheduledBills.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Scheduled Commitments ({selectedDayData.scheduledBills.length})
                </div>
                {selectedDayData.scheduledBills.map(bill => (
                  <div
                    key={bill.id}
                    className="p-2.5 bg-black/60 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{bill.name}</div>
                      <div className="text-[11px] text-slate-400">{bill.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400">-{formatINR(bill.amount)}</span>
                      <button
                        onClick={() => toggleFixedExpensePaid(bill.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                          bill.isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {bill.isPaid ? 'Paid' : 'Pay'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Transactions ({filteredDayTransactions.length})
              </div>

              {filteredDayTransactions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 bg-black/40 rounded-xl border border-white/5">
                  No recorded transactions for this date.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredDayTransactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-black border border-white/10 text-slate-400">
                          <CategoryIcon category={tx.category} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">{tx.description}</div>
                          <div className="text-[10px] text-slate-400">
                            {tx.time} • {tx.paymentMethod}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                        </span>
                        {tx.receiptUrl && (
                          <button
                            onClick={() => setSelectedReceiptTx(tx)}
                            className="p-1 text-slate-400 hover:text-amber-300 cursor-pointer"
                            title="Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 text-slate-600 hover:text-rose-400 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => {
                setFutureDate(selectedDate);
                setScheduleModalOpen(true);
              }}
              className="w-full py-2 bg-black/60 hover:bg-black text-amber-200 border border-amber-500/20 hover:border-amber-400/40 font-semibold text-xs rounded-xl transition text-center cursor-pointer"
            >
              + Schedule Future Commitment on this Date
            </button>
          </div>
        </Card>
      </div>

      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0d0f17] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white">Schedule Future Financial Commitment</h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Future commitments are shown on the calendar without deducting from today's liquid funds until they occur.
            </p>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Commitment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Insurance Renewal, Flight Booking, Quarterly Tax"
                  value={futureTitle}
                  onChange={e => setFutureTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expected Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={futureAmount}
                  onChange={e => setFutureAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={futureDate}
                    onChange={e => setFutureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <CustomSelect
                    value={futureCategory}
                    onChange={val => setFutureCategory(val as CategoryType)}
                    options={[
                      { value: 'Utilities & Bills', label: 'Utilities & Bills' },
                      { value: 'EMI & Loans', label: 'EMI & Loans' },
                      { value: 'Rent & Housing', label: 'Rent & Housing' },
                      { value: 'Health & Wellness', label: 'Health & Insurance' },
                      { value: 'Subscriptions', label: 'Subscriptions' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    showCategoryIcon={true}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="dark-pill-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Schedule on Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </div>
  );
};
