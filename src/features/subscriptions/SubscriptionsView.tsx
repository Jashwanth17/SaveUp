import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  Pause, 
  Play, 
  X 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR, formatDate } from '../../utils/formatters';
import { PaymentMethod } from '../../types';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { Card, StatCard, Badge, CustomSelect } from '../../components/ui';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, toggleSubscriptionStatus, addSubscription, deleteSubscription } = useFinance();

  const [newSubModalOpen, setNewSubModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subFrequency, setSubFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [subBillingDate, setSubBillingDate] = useState('');
  const [subCategory, setSubCategory] = useState('Entertainment');
  const [subPaymentMethod, setSubPaymentMethod] = useState<PaymentMethod>('Credit Card');

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused');

  const monthlyBurn = activeSubs.reduce((sum, s) => {
    return sum + (s.frequency === 'monthly' ? s.amount : s.amount / 12);
  }, 0);

  const annualBurn = monthlyBurn * 12;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(subAmount);
    if (!subName.trim() || !amt || amt <= 0) return;

    addSubscription({
      name: subName.trim(),
      amount: amt,
      frequency: subFrequency,
      nextBillingDate: subBillingDate || new Date().toISOString().split('T')[0],
      category: subCategory,
      status: 'active',
      paymentMethod: subPaymentMethod,
    });

    setNewSubModalOpen(false);
    setSubName('');
    setSubAmount('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Repeat className="w-4 h-4" /> Recurring Burn Tracker
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Subscriptions & Recurring Commitments
          </h2>
          <p className="text-xs text-zinc-400">
            Audit digital subscriptions, recurring auto-debits, renewal schedules, and avoid unwanted leaks
          </p>
        </div>

        <button
          onClick={() => setNewSubModalOpen(true)}
          className="gold-pill-btn px-4 sm:px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Subscription</span>
        </button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Effective Monthly Burn"
          value={`-${formatINR(monthlyBurn)}`}
          subtext={`Across ${activeSubs.length} active recurring plans`}
          valueColor="text-rose-400"
        />
        <StatCard
          label="Projected Annual Outflow"
          value={`-${formatINR(annualBurn)}`}
          subtext="Annualized subscription cost"
          valueColor="text-rose-400"
        />
        <StatCard
          label="Paused Subscriptions"
          value={String(pausedSubs.length)}
          subtext="Temporarily inactive to safeguard allowance"
          valueColor="text-[#ecd095]"
        />
      </div>
      {subscriptions.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#caa052]/10 border border-[#caa052]/30 text-[#caa052] flex items-center justify-center mx-auto mb-3">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="text-base font-bold text-white">No active subscriptions tracked</div>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            SaveUp is 100% manual and private — zero bank connections required. Add recurring subscriptions (Netflix, Spotify, Cloud Storage, Gym) to monitor your annualized burn rate.
          </p>
          <button
            onClick={() => setNewSubModalOpen(true)}
            className="mt-4 gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
          >
            + Add First Subscription
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map(sub => (
          <Card
            key={sub.id}
            className={`p-5 transition space-y-4 ${
              sub.status === 'active'
                ? 'hover:border-[#caa052]/30'
                : 'opacity-50 bg-black/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-center text-zinc-300">
                  <CategoryIcon category={sub.category} className="w-5 h-5 text-[#caa052]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                  <div className="text-[11px] text-zinc-400">{sub.category} • {sub.paymentMethod}</div>
                </div>
              </div>

              <Badge variant={sub.status === 'active' ? 'emerald' : 'slate'}>
                {sub.status}
              </Badge>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Cost</span>
                <div className="font-black text-rose-400 text-base">
                  -{formatINR(sub.amount)}
                  <span className="text-[11px] font-normal text-zinc-400 ml-1">
                    /{sub.frequency === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Next Renewal</span>
                <div className="font-semibold text-zinc-300 mt-0.5">
                  {formatDate(sub.nextBillingDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toggleSubscriptionStatus(sub.id)}
                className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                {sub.status === 'active' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#ecd095]" />
                    <span>Pause Plan</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume Plan</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete subscription "${sub.name}"?`)) {
                    deleteSubscription(sub.id);
                  }
                }}
                className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    )}

      {newSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/[0.08] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Add Recurring Subscription</h3>
              <button
                onClick={() => setNewSubModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Service / Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disney+ Hotstar, Claude Pro, YouTube Premium"
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#caa052] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Billing Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={subAmount}
                    onChange={e => setSubAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white font-bold focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Frequency</label>
                  <CustomSelect
                    value={subFrequency}
                    onChange={val => setSubFrequency(val as 'monthly' | 'yearly')}
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Next Renewal Date</label>
                  <input
                    type="date"
                    value={subBillingDate}
                    onChange={e => setSubBillingDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#caa052] transition"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Payment Method</label>
                  <CustomSelect
                    value={subPaymentMethod}
                    onChange={val => setSubPaymentMethod(val as PaymentMethod)}
                    options={[
                      { value: 'Credit Card', label: 'Credit Card' },
                      { value: 'UPI', label: 'UPI AutoPay' },
                      { value: 'Debit Card', label: 'Debit Card' },
                      { value: 'Net Banking', label: 'Net Banking' },
                    ]}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewSubModalOpen(false)}
                  className="dark-pill-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-pill-btn px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
