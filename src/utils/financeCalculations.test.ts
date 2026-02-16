import { describe, it, expect } from 'vitest';
import { calculateStats, calculateCategorySpending } from './financeCalculations';
import type { Transaction, Debt } from '../hooks/useFinanceData';

describe('financeCalculations', () => {
  const mockTransactions: Transaction[] = [
    { id: '1', title: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2026-02-01' },
    { id: '2', title: 'Rent', amount: -1500, type: 'expense', category: 'Housing', date: '2026-02-02' },
    { id: '3', title: 'Groceries', amount: -200, type: 'expense', category: 'Food', date: '2026-02-05' },
    { id: '4', title: 'Freelance', amount: 500, type: 'income', category: 'Freelance', date: '2026-02-10' },
  ];

  const mockDebts: Debt[] = [
    { id: '1', label: 'Credit Card', total: 1000, paid: 200, dueDate: '2026-03-01', isOverdue: false },
  ];

  it('calculates stats correctly', () => {
    const stats = calculateStats(mockTransactions, mockDebts);
    expect(stats.balance).toBe(3800);
    expect(stats.income).toBe(5500);
    expect(stats.expenses).toBe(1700);
    expect(stats.totalDebt).toBe(800);
  });

  it('calculates category spending correctly', () => {
    const spending = calculateCategorySpending(mockTransactions, '2026-02');
    expect(spending['Housing']).toBe(1500);
    expect(spending['Food']).toBe(200);
    expect(spending['Salary']).toBeUndefined(); // Income should be ignored
  });

  it('filters by month correctly', () => {
    const transactionsWithDifferentMonths: Transaction[] = [
      ...mockTransactions,
      { id: '5', title: 'Future Rent', amount: -1500, type: 'expense', category: 'Housing', date: '2026-03-01' },
    ];
    const spending = calculateCategorySpending(transactionsWithDifferentMonths, '2026-02');
    expect(spending['Housing']).toBe(1500); // Should only count February
  });
});
