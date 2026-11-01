import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Download 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR, formatDate } from '../../utils/formatters';
import { Transaction, PaymentMethod } from '../../types';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { Card, StatCard, Badge, CustomSelect } from '../../components/ui';
import { exportService } from '../../services/exportService';

interface ExpensesViewProps {
  onOpenAddTx: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddTx }) => {
  const { transactions, categories, deleteTransaction, updateTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      const matchesPayment = selectedPaymentMethod === 'all' || tx.paymentMethod === selectedPaymentMethod;

      let matchesType = true;
      if (selectedType === 'expense') matchesType = tx.type === 'expense' && !tx.isScheduled;
      else if (selectedType === 'income') matchesType = tx.type === 'income';
      else if (selectedType === 'shared') matchesType = !!tx.isShared;

      let matchesDate = true;
      if (startDate && tx.date < startDate) matchesDate = false;
      if (endDate && tx.date > endDate) matchesDate = false;

      return matchesSearch && matchesCategory && matchesPayment && matchesType && matchesDate;
    });
  }, [transactions, searchQuery, selectedCategory, selectedPaymentMethod, selectedType, startDate, endDate]);

  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense' && !tx.isScheduled)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const largestExpense = Math.max(
    0,
    ...filteredTransactions.filter(tx => tx.type === 'expense' && !tx.isScheduled).map(tx => tx.amount)
  );

  const pendingSplitReceivables = transactions
    .filter(tx => tx.isShared && tx.splitDetails)
    .reduce((acc, tx) => {
      const unpaid = tx.splitDetails?.filter(m => m.name !== 'Me' && !m.paid) || [];
      return acc + unpaid.reduce((s, m) => s + m.amount, 0);
    }, 0);

  const handleToggleSplitPaid = (txId: string, memberIdx: number) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || !tx.splitDetails) return;

    const updatedSplits = tx.splitDetails.map((m, i) => 
      i === memberIdx ? { ...m, paid: !m.paid } : m
    );

    updateTransaction(txId, { splitDetails: updatedSplits });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTransaction(editingTx.id, editingTx);
    setEditingTx(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Expense Management & Transactions</h2>
          <p className="text-xs text-slate-400">
            Log, categorize, split with friends, and attach receipts to every transaction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportService.exportTransactionsToCSV(filteredTransactions)}
            className="gold-outline-btn px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#caa052]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTx}
            className="gold-pill-btn px-4 sm:px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </Card>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Filtered Expenses"
          value={`-${formatINR(totalExpense)}`}
          subtext={`${filteredTransactions.filter(t => t.type === 'expense').length} entries`}
          valueColor="text-rose-400"
        />
        <StatCard
          label="Filtered Income"
          value={`+${formatINR(totalIncome)}`}
          subtext={`${filteredTransactions.filter(t => t.type === 'income').length} entries`}
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Largest Single Expense"
          value={`-${formatINR(largestExpense)}`}
          subtext="In filtered set"
          valueColor="text-rose-400"
        />
        <StatCard
          label="Pending Friend Splits"
          value={`+${formatINR(pendingSplitReceivables)}`}
          subtext="Owed back to you via UPI"
          valueColor="text-amber-400"
          icon={<Users className="w-3.5 h-3.5 text-amber-400" />}
        />
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, merchant, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <CustomSelect
              value={selectedCategory}
              onChange={val => setSelectedCategory(val)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(c => ({
                  value: c.name,
                  label: c.name,
                  category: c.name,
                  color: c.color,
                })),
              ]}
              showCategoryIcon={true}
            />
          </div>

          <div>
            <CustomSelect
              value={selectedPaymentMethod}
              onChange={val => setSelectedPaymentMethod(val)}
              options={[
                { value: 'all', label: 'All Payment Methods' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'Debit Card', label: 'Debit Card' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Net Banking', label: 'Net Banking' },
              ]}
            />
          </div>

          <div>
            <CustomSelect
              value={selectedType}
              onChange={val => setSelectedType(val)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'expense', label: 'Expenses Only' },
                { value: 'income', label: 'Income Only' },
                { value: 'shared', label: 'Split With Friends' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
            />
            {(startDate || endDate || searchQuery || selectedCategory !== 'all' || selectedPaymentMethod !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPaymentMethod('all');
                  setSelectedType('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-amber-400 hover:underline ml-2 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div>
            Showing <span className="font-bold text-amber-300">{filteredTransactions.length}</span> of {transactions.length} records
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-black/80 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction / Merchant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{tx.description}</div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tx.notes}</div>
                      )}

                      {tx.isShared && tx.splitDetails && (
                        <div className="mt-2 p-2 bg-black/60 rounded-xl border border-amber-500/30 text-[11px] space-y-1">
                          <div className="font-semibold text-amber-300 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Split Among {tx.splitDetails.length} Friends:
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tx.splitDetails.map((m, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleToggleSplitPaid(tx.id, idx)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 transition cursor-pointer ${
                                  m.paid
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                }`}
                                title="Click to toggle paid status"
                              >
                                <span>{m.name}: {formatINR(m.amount)}</span>
                                <span className="text-[9px] font-extrabold uppercase">
                                  {m.paid ? '✓' : 'Pending'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/5 text-slate-200 text-xs">
                        <CategoryIcon category={tx.category} className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tx.category}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{formatDate(tx.date)}</div>
                      <div className="text-[10px] text-slate-500">{tx.time}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Amount in Green for Income, Red for Expense */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`font-black text-sm ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.receiptUrl ? (
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                          title="View Uploaded Receipt"
                        >
                          <CategoryIcon iconName="Receipt" className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.description}"?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0d0f17] border border-amber-500/30 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Edit Transaction</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={editingTx.amount}
                  onChange={e => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <CustomSelect
                    value={editingTx.category}
                    onChange={val => setEditingTx({ ...editingTx, category: val })}
                    options={categories.map(c => ({
                      value: c.name,
                      label: c.name,
                      category: c.name,
                      color: c.color,
                    }))}
                    showCategoryIcon={true}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Payment Method</label>
                  <CustomSelect
                    value={editingTx.paymentMethod}
                    onChange={val => setEditingTx({ ...editingTx, paymentMethod: val as PaymentMethod })}
                    options={[
                      { value: 'UPI', label: 'UPI' },
                      { value: 'Credit Card', label: 'Credit Card' },
                      { value: 'Debit Card', label: 'Debit Card' },
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Net Banking', label: 'Net Banking' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 bg-black/60 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Save Changes
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
