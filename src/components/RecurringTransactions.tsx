import React, { useState } from 'react';
import type { RecurringTransaction } from '../hooks/useFinanceData';
import { Plus, Trash2, Calendar, Repeat, ArrowUpRight, ArrowDownRight, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecurringTransactionsProps {
  recurringItems: RecurringTransaction[];
  onAdd: (item: Omit<RecurringTransaction, 'id' | 'next_occurrence' | 'is_active'>) => void;
  onToggle: (id: string, is_active: boolean) => void;
  onDelete: (id: string) => void;
}

export const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({ 
  recurringItems, onAdd, onToggle, onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const newCategory = 'General';
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    onAdd({
      title: newTitle,
      amount: newType === 'expense' ? -Math.abs(Number(newAmount)) : Math.abs(Number(newAmount)),
      type: newType,
      category: newCategory,
      frequency: newFrequency,
      start_date: newStartDate
    });

    setNewTitle('');
    setNewAmount('');
    setIsAdding(false);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Repeat size={28} />
          Scheduled Flows
        </h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsAdding(true)}
          style={{ padding: '0.5rem 1rem' }}
        >
          <Plus size={20} />
          Add New
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card"
            style={{ marginBottom: '2rem', padding: '1.5rem' }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Rent, Salary"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Amount</label>
                  <input 
                    type="number" 
                    value={newAmount} 
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label>Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as any)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Frequency</label>
                  <select value={newFrequency} onChange={e => setNewFrequency(e.target.value as any)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Start From</label>
                  <input 
                    type="date" 
                    value={newStartDate} 
                    onChange={e => setNewStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Schedule</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {recurringItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem' }} />
            <p>No recurring cycles set up yet.</p>
          </div>
        ) : (
          recurringItems.map(item => (
            <motion.div 
              layout
              key={item.id}
              className="glass-card"
              style={{ padding: '1.25rem', opacity: item.is_active ? 1 : 0.6 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.type === 'income' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {item.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{item.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={12} />
                      Every {item.frequency} • Next: {item.next_occurrence}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      color: item.type === 'income' ? 'var(--success)' : 'white' 
                    }}>
                      {item.type === 'income' ? '+' : ''}{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onToggle(item.id, !item.is_active)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.is_active ? 'var(--success)' : 'var(--text-secondary)' }}
                  >
                    {item.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  
                  <button 
                    onClick={() => onDelete(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', opacity: 0.5 }}
                    className="hover-opacity"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
