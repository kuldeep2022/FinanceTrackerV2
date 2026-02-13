import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'debt';
  category: string;
  date: string;
  user_id?: string;
}

export interface Debt {
  id: string;
  label: string;
  total: number;
  paid: number;
  dueDate: string;
  isOverdue: boolean;
  user_id?: string;
}

export function useFinanceData() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('flux_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('flux_debts');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync with Cloud & Real-time
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { data: cloudTransactions, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      const { data: cloudDebts, error: dError } = await supabase
        .from('debts')
        .select('*');

      if (tError) console.error('Error fetching transactions:', tError);
      if (dError) console.error('Error fetching debts:', dError);

      if (cloudTransactions) setTransactions(cloudTransactions);
      if (cloudDebts) setDebts(cloudDebts);
      setLoading(false);
    };

    fetchData();

    // Set up Real-time subscriptions
    const transactionSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t));
        } else if (payload.eventType === 'DELETE') {
          setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const debtSubscription = supabase
      .channel('public:debts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDebts(prev => [payload.new as Debt, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setDebts(prev => prev.map(d => d.id === payload.new.id ? payload.new as Debt : d));
        } else if (payload.eventType === 'DELETE') {
          setDebts(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      transactionSubscription.unsubscribe();
      debtSubscription.unsubscribe();
    };
  }, [user]);

  // Persist locally as fallback
  useEffect(() => {
    localStorage.setItem('flux_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('flux_debts', JSON.stringify(debts));
  }, [debts]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, user_id: user?.id };
    
    // Optimistic local update (will be confirmed by real-time sync if cloud is active)
    if (!user) {
      const tempId = Math.random().toString(36).substr(2, 9);
      setTransactions(prev => [{ ...newTransaction, id: tempId } as Transaction, ...prev]);
    }

    if (user) {
      const { error } = await supabase.from('transactions').insert([newTransaction]);
      if (error) {
        alert('Cloud sync failed: ' + error.message);
        console.error('Error syncing transaction:', error);
      }
    }

    if (t.type === 'debt') {
       addDebt({
         label: t.title,
         total: Math.abs(t.amount),
         paid: 0,
         dueDate: t.date,
         isOverdue: false
       });
    }
  };

  const addDebt = async (d: Omit<Debt, 'id'>) => {
    const newDebt = { ...d, user_id: user?.id };
    
    if (!user) {
      const tempId = Math.random().toString(36).substr(2, 9);
      setDebts(prev => [{ ...newDebt, id: tempId } as Debt, ...prev]);
    }

    if (user) {
      const { error } = await supabase.from('debts').insert([newDebt]);
      if (error) console.error('Error syncing debt:', error);
    }
  };

  const payDebt = async (debtId: string, amount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const updatedPaid = debt.paid + amount;

    if (!user) {
      setDebts(prev => prev.map(d => d.id === debtId ? { ...d, paid: updatedPaid } : d));
    } else {
       const { error } = await supabase
        .from('debts')
        .update({ paid: updatedPaid })
        .eq('id', debtId);
      if (error) alert('Update failed: ' + error.message);
    }
    
    addTransaction({
      title: `Payment for ${debt.label}`,
      amount: -amount,
      type: 'expense',
      category: 'Debt Repayment',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const stats = {
    balance: transactions.reduce((acc, t) => acc + t.amount, 0),
    income: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    expenses: Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)),
    totalDebt: debts.reduce((acc, d) => acc + (d.total - d.paid), 0)
  };

  return { transactions, debts, addTransaction, addDebt, payDebt, stats, user, loading };
}
