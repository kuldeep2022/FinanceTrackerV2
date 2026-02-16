import type { Transaction, Debt } from '../hooks/useFinanceData';

export const calculateStats = (transactions: Transaction[], debts: Debt[]) => {
  return {
    balance: transactions.reduce((acc, t) => acc + t.amount, 0),
    income: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    expenses: Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)),
    totalDebt: debts.reduce((acc, d) => acc + (d.total - d.paid), 0)
  };
};

export const calculateCategorySpending = (transactions: Transaction[], month: string) => {
  return transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
};
