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

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_occurrence: string;
  is_active: boolean;
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

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem('flux_recurring');
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

      const { data: cloudRecurring, error: rError } = await supabase
        .from('recurring_transactions')
        .select('*');

      if (tError) console.error('Error fetching transactions:', tError);
      if (dError) console.error('Error fetching debts:', dError);
      if (rError) console.error('Error fetching recurring:', rError);

      if (cloudTransactions) setTransactions(cloudTransactions);
      if (cloudDebts) setDebts(cloudDebts);
      if (cloudRecurring) setRecurringTransactions(cloudRecurring);
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

    const recurringSubscription = supabase
      .channel('public:recurring_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_transactions', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRecurringTransactions(prev => [payload.new as RecurringTransaction, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setRecurringTransactions(prev => prev.map(r => r.id === payload.new.id ? payload.new as RecurringTransaction : r));
        } else if (payload.eventType === 'DELETE') {
          setRecurringTransactions(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      transactionSubscription.unsubscribe();
      debtSubscription.unsubscribe();
      recurringSubscription.unsubscribe();
    };
  }, [user]);

  // Persist locally as fallback
  useEffect(() => {
    localStorage.setItem('flux_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('flux_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('flux_recurring', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction = { ...t, id: tempId, user_id: user?.id };
    
    // Optimistic update - immediately show in UI
    setTransactions(prev => [newTransaction as Transaction, ...prev]);

    if (user) {
      // Sync to cloud
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...t, user_id: user.id }])
        .select()
        .single();
      
      if (error) {
        // Rollback on error
        setTransactions(prev => prev.filter(tr => tr.id !== tempId));
        alert('Failed to save transaction: ' + error.message);
        console.error('Error syncing transaction:', error);
        return;
      }
      
      // Replace temp ID with real ID from database
      if (data) {
        setTransactions(prev => prev.map(tr => tr.id === tempId ? data as Transaction : tr));
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

  const bulkAddTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    const tempTransactions = newTransactions.map(t => ({
      ...t,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user?.id
    }));

    // Optimistic update
    setTransactions(prev => [...tempTransactions as Transaction[], ...prev]);

    if (user) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransactions.map(t => ({ ...t, user_id: user.id })))
        .select();

      if (error) {
        // Rollback
        const tempIds = tempTransactions.map(t => t.id);
        setTransactions(prev => prev.filter(t => !tempIds.includes(t.id)));
        alert('Bulk import failed: ' + error.message);
        return;
      }

      if (data) {
        const tempIds = tempTransactions.map(t => t.id);
        setTransactions(prev => [
          ...data as Transaction[],
          ...prev.filter(t => !tempIds.includes(t.id))
        ]);
      }
    }
  };

  const addRecurring = async (r: Omit<RecurringTransaction, 'id' | 'next_occurrence' | 'is_active'>) => {
    const next_occurrence = r.start_date;
    const newRecurring = { ...r, next_occurrence, is_active: true, user_id: user?.id };
    
    if (!user) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setRecurringTransactions(prev => [{ ...newRecurring, id: tempId } as RecurringTransaction, ...prev]);
    } else {
      const { error } = await supabase.from('recurring_transactions').insert([newRecurring]);
      if (error) alert('Failed to add recurring: ' + error.message);
    }
  };

  const toggleRecurring = async (id: string, is_active: boolean) => {
    if (!user) {
      setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, is_active } : r));
    } else {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active })
        .eq('id', id);
      if (error) alert('Update failed: ' + error.message);
    }
  };

  const deleteRecurring = async (id: string) => {
    if (!user) {
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    } else {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
      if (error) alert('Delete failed: ' + error.message);
    }
  };

  // Automation: Process Recurring Transactions
  useEffect(() => {
    const processRecurring = async () => {
      if (loading || !recurringTransactions.length) return;

      const today = new Date().toISOString().split('T')[0];
      const itemsToProcess = recurringTransactions.filter(r => r.is_active && r.next_occurrence <= today);

      for (const item of itemsToProcess) {
        let currentOccurrence = item.next_occurrence;
        
        // Generate transactions for each missed period
        while (currentOccurrence <= today) {
          // Add the transaction
          await addTransaction({
            title: item.title,
            amount: item.amount,
            type: item.type as any,
            category: item.category,
            date: currentOccurrence
          });

          // Calculate next occurrence
          const date = new Date(currentOccurrence);
          if (item.frequency === 'daily') date.setDate(date.getDate() + 1);
          else if (item.frequency === 'weekly') date.setDate(date.getDate() + 7);
          else if (item.frequency === 'monthly') date.setMonth(date.getMonth() + 1);
          else if (item.frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
          
          currentOccurrence = date.toISOString().split('T')[0];
        }

        // Update the recurring record with the new next_occurrence
        if (!user) {
          setRecurringTransactions(prev => prev.map(r => r.id === item.id ? { ...r, next_occurrence: currentOccurrence } : r));
        } else {
          await supabase
            .from('recurring_transactions')
            .update({ next_occurrence: currentOccurrence })
            .eq('id', item.id);
        }
      }
    };

    processRecurring();
  }, [loading, user]); // Run when load finishes or user changes

  const addDebt = async (d: Omit<Debt, 'id'>) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDebt = { ...d, id: tempId, user_id: user?.id };
    
    // Optimistic update
    setDebts(prev => [newDebt as Debt, ...prev]);

    if (user) {
      const { data, error } = await supabase
        .from('debts')
        .insert([{ ...d, user_id: user.id }])
        .select()
        .single();
      
      if (error) {
        setDebts(prev => prev.filter(debt => debt.id !== tempId));
        console.error('Error syncing debt:', error);
        return;
      }
      
      if (data) {
        setDebts(prev => prev.map(debt => debt.id === tempId ? data as Debt : debt));
      }
    }
  };

  const payDebt = async (debtId: string, amount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const updatedPaid = debt.paid + amount;

    // Optimistic update
    setDebts(prev => prev.map(d => d.id === debtId ? { ...d, paid: updatedPaid } : d));

    if (user) {
       const { error } = await supabase
        .from('debts')
        .update({ paid: updatedPaid })
        .eq('id', debtId);
      
      if (error) {
        // Rollback on error
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, paid: debt.paid } : d));
        alert('Update failed: ' + error.message);
        return;
      }
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

  return { 
    transactions, 
    debts, 
    recurringTransactions,
    addTransaction, 
    bulkAddTransactions,
    addDebt, 
    payDebt, 
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    stats, 
    user, 
    loading 
  };
}
