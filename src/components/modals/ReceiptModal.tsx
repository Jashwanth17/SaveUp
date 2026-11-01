import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Transaction } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction || !transaction.receiptUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-black/40">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Receipt Document</h3>
            <p className="text-xs text-zinc-400">{transaction.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4 bg-black/50 flex flex-col items-center justify-center">
          <div className="relative max-h-80 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black flex items-center justify-center">
            <img
              src={transaction.receiptUrl}
              alt="Transaction Receipt"
              className="object-contain max-h-80 w-full rounded-lg"
            />
          </div>

          {/* Details Pill */}
          <div className="w-full mt-4 p-3 bg-black/60 rounded-xl border border-white/[0.06] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Billed:</span>
              <span className="font-bold text-rose-400">-{formatINR(transaction.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Date & Time:</span>
              <span className="text-zinc-200">{formatDate(transaction.date)} at {transaction.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Payment:</span>
              <span className="text-zinc-200">{transaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] flex justify-end gap-2 bg-black/40">
          <a
            href={transaction.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="gold-pill-btn px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
          </a>
        </div>
      </div>
    </div>
  );
};
