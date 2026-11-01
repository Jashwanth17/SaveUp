import { Transaction } from '../types';

export const exportService = {
  exportTransactionsToCSV: (transactions: Transaction[], filename = 'SaveUp_Transactions'): void => {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Description', 'Amount', 'PaymentMethod', 'IsShared', 'Notes'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.time,
      tx.type,
      `"${tx.category}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.paymentMethod,
      tx.isShared ? 'Yes' : 'No',
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printReport: (): void => {
    window.print();
  },
};
