import React, { useState } from 'react';
import { X, Upload, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { PaymentMethod, TransactionType, SplitMember } from '../../types';
import { CustomSelect, SelectOption } from '../ui';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialType = 'expense',
}) => {
  const { categories, addTransaction } = useFinance();

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[1]?.name || 'Groceries & Food');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(initialDate || today);
  const [time, setTime] = useState<string>(currentTime);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  const [isShared, setIsShared] = useState<boolean>(false);
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>([
    { name: 'Me', amount: 0, paid: true },
    { name: 'Friend 1', amount: 0, paid: false },
  ]);

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = parseFloat(val) || 0;
    if (isShared && splitMembers.length > 0) {
      const perPerson = Math.round((num / splitMembers.length) * 100) / 100;
      setSplitMembers(prev => prev.map(m => ({ ...m, amount: perPerson })));
    }
  };

  const handleAddMember = () => {
    const newMembers = [...splitMembers, { name: `Friend ${splitMembers.length}`, amount: 0, paid: false }];
    const num = parseFloat(amount) || 0;
    const perPerson = Math.round((num / newMembers.length) * 100) / 100;
    setSplitMembers(newMembers.map(m => ({ ...m, amount: perPerson })));
  };

  const handleRemoveMember = (idx: number) => {
    if (splitMembers.length <= 2) return;
    const newMembers = splitMembers.filter((_, i) => i !== idx);
    const num = parseFloat(amount) || 0;
    const perPerson = Math.round((num / newMembers.length) * 100) / 100;
    setSplitMembers(newMembers.map(m => ({ ...m, amount: perPerson })));
  };

  const handleMemberNameChange = (idx: number, name: string) => {
    setSplitMembers(prev => prev.map((m, i) => (i === idx ? { ...m, name } : m)));
  };

  const handleMemberPaidToggle = (idx: number) => {
    setSplitMembers(prev => prev.map((m, i) => (i === idx ? { ...m, paid: !m.paid } : m)));
  };

  const handleSimulateReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      setReceiptUrl(fakeUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    addTransaction({
      amount: num,
      type,
      category,
      description: description.trim() || `${category} payment`,
      date,
      time,
      paymentMethod,
      notes: notes.trim() || undefined,
      receiptUrl: receiptUrl || undefined,
      isShared,
      splitDetails: isShared ? splitMembers : undefined,
    });

    onClose();
    setAmount('');
    setDescription('');
    setNotes('');
    setReceiptUrl('');
    setIsShared(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d0f17] border border-amber-500/35 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
          <div>
            <h2 className="text-xl font-bold text-white">Record Transaction</h2>
            <p className="text-xs text-amber-200/60">Updates your daily allowance and balances in real time</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-gold-scrollbar space-y-5">
          {/* Transaction Type Selector: Red for Expense, Green for Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/80 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💸 Expense (Red)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💰 Income (Green)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#caa052]">₹</span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl text-2xl font-bold placeholder-slate-600 focus:outline-none focus:border-[#caa052] ${
                  type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              />
            </div>
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category *
              </label>
              <CustomSelect
                value={category}
                onChange={val => setCategory(val)}
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Method *
              </label>
              <CustomSelect
                value={paymentMethod}
                onChange={val => setPaymentMethod(val as PaymentMethod)}
                options={[
                  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Debit Card', label: 'Debit Card' },
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Net Banking', label: 'Net Banking' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Merchant *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Swiggy Gourmet, Shell Petrol, Reliance Fresh"
              className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Receipt Upload & Split Options */}
          <div className="p-4 bg-black/60 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">Split with Friends?</span>
              </div>
              <button
                type="button"
                onClick={() => setIsShared(!isShared)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isShared ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                    isShared ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isShared && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Each member owes ₹{((parseFloat(amount) || 0) / (splitMembers.length || 1)).toFixed(0)}</span>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Friend
                  </button>
                </div>
                {splitMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={e => handleMemberNameChange(idx, e.target.value)}
                      placeholder="Name"
                      className="flex-1 px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-white"
                    />
                    <span className="text-xs font-semibold text-slate-300 w-20 text-right">
                      ₹{member.amount.toFixed(0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMemberPaidToggle(idx)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition cursor-pointer ${
                        member.paid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {member.paid ? 'Paid' : 'Unpaid'}
                    </button>
                    {idx >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Receipt Upload */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Attach Bill / Receipt (Optional)
              </label>
              {receiptUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300">Receipt attached successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptUrl('')}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-xl cursor-pointer bg-black/40 transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">Click to upload receipt photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulateReceiptUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 gold-pill-btn text-sm font-bold cursor-pointer"
            >
              {type === 'expense' ? 'Record Expense & Recalculate' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
