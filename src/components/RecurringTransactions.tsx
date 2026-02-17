import React, { useState } from 'react';
import type { RecurringTransaction } from '../hooks/useFinanceData';
import { Plus, Trash2, Calendar, Repeat, ArrowUpRight, ArrowDownRight, Clock, ToggleLeft, ToggleRight, X } from 'lucide-react';
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
  const [newCategory, setNewCategory] = useState('Subscription');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const categories = ['Subscription', 'Bills', 'Rent', 'Salary', 'Groceries', 'Entertainment', 'Transport', 'Other'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Repeat size={32} />
            </span>
            Scheduled Flows
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Automate your financial life with recurring cycles.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsAdding(true)}
          style={{ 
            borderRadius: '16px', 
            padding: '0.6rem 1.25rem',
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Plus size={20} />
          <span>Add Cycle</span>
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '2rem',
                borderRadius: '28px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Create Scheduled Flow</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setNewType('expense')}
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      borderRadius: '10px', 
                      border: 'none',
                      background: newType === 'expense' ? 'var(--danger)' : 'transparent',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewType('income')}
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      borderRadius: '10px', 
                      border: 'none',
                      background: newType === 'income' ? 'var(--success)' : 'transparent',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    Income
                  </button>
                </div>

                <div className="input-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Monthly Rent"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Amount ($)</label>
                    <input 
                      type="number" 
                      className="input-field"
                      value={newAmount} 
                      onChange={e => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select 
                      className="input-field"
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Frequency</label>
                    <select 
                      className="input-field"
                      value={newFrequency} 
                      onChange={e => setNewFrequency(e.target.value as any)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    >
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
                      className="input-field"
                      value={newStartDate} 
                      onChange={e => setNewStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', height: '3.5rem', borderRadius: '16px' }}>
                  Create Cycle
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {recurringItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '24px', 
            border: '1px dashed rgba(255,255,255,0.1)' 
          }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No automated cycles configured yet.</p>
          </div>
        ) : (
          recurringItems.map(item => (
            <motion.div 
              layout
              key={item.id}
              className="glass-card"
              style={{ 
                padding: '1.25rem', 
                opacity: item.is_active ? 1 : 0.5,
                transition: 'var(--transition)',
                border: item.is_active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '16px', 
                    background: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.type === 'income' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${item.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {item.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        color: 'var(--accent-primary)',
                        fontWeight: 600
                      }}>
                        {item.frequency.toUpperCase()}
                      </span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <Clock size={12} />
                      Next: {new Date(item.next_occurrence).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: 800, 
                      fontSize: '1.2rem',
                      color: item.type === 'income' ? 'var(--success)' : 'white' 
                    }}>
                      {item.type === 'income' ? '+' : ''}{Math.abs(item.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onToggle(item.id, !item.is_active)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: item.is_active ? 'var(--success)' : 'var(--text-secondary)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {item.is_active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                    
                    {deletingId === item.id ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => { onDelete(item.id); setDeletingId(null); }}
                          style={{ background: 'var(--danger)', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeletingId(item.id)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.05)', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: 'var(--danger)', 
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}
                        className="hover-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
