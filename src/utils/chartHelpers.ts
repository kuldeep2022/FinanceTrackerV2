import type { Transaction } from '../hooks/useFinanceData';

export interface DailyData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// Group transactions by date
export function groupByDate(transactions: Transaction[]): DailyData[] {
  const grouped = transactions.reduce((acc, t) => {
    const date = t.date;
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0, balance: 0 };
    }
    
    if (t.type === 'income') {
      acc[date].income += t.amount;
    } else if (t.type === 'expense') {
      acc[date].expenses += Math.abs(t.amount);
    }
    
    return acc;
  }, {} as Record<string, DailyData>);

  // Calculate running balance
  const sorted = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  let runningBalance = 0;
  
  sorted.forEach(day => {
    runningBalance += day.income - day.expenses;
    day.balance = runningBalance;
  });

  return sorted;
}

// Group expenses by category
export function groupByCategory(transactions: Transaction[]): CategoryData[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const grouped = expenses.reduce((acc, t) => {
    const category = t.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Group by month
export function groupByMonth(transactions: Transaction[]): MonthlyData[] {
  const grouped = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0, net: 0 };
    }
    
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else if (t.type === 'expense') {
      acc[month].expenses += Math.abs(t.amount);
    }
    
    return acc;
  }, {} as Record<string, MonthlyData>);

  return Object.values(grouped)
    .map(m => ({ ...m, net: m.income - m.expenses }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Format month for display
export function formatMonth(month: string): string {
  const date = new Date(month + '-01');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
