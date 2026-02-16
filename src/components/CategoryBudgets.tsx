import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, Edit2 } from 'lucide-react';
import type { Transaction, Budget } from '../hooks/useFinanceData';

interface CategoryBudgetsProps {
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateBudget: (category: string, amount: number) => void;
}

export const CategoryBudgets: React.FC<CategoryBudgetsProps> = ({ 
  transactions, 
  budgets, 
  onUpdateBudget 
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Calculate spending per category for current month
  const categorySpending = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  // Consolidate budgets and actual spending
  const budgetStatus = budgets.map(b => {
    const spent = categorySpending[b.category] || 0;
    const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return { ...b, spent, percent };
  }).sort((a, b) => b.percent - a.percent);

  const handleStartEdit = (b: Budget) => {
    setEditingCategory(b.category);
    setEditValue(b.amount.toString());
  };

  const handleSaveEdit = () => {
    if (editingCategory) {
      onUpdateBudget(editingCategory, parseFloat(editValue) || 0);
      setEditingCategory(null);
    }
  };

  return (
    <section className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Target size={20} color="var(--accent-primary)" />
          Monthly Budgets
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {budgetStatus.map((b) => (
          <div key={b.id} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>${b.spent.toLocaleString()}</span> / ${b.amount.toLocaleString()}
                </span>
                <button 
                  onClick={() => handleStartEdit(b)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(b.percent, 100)}%` }}
                style={{ 
                  height: '100%', 
                  background: b.percent > 100 ? 'var(--danger)' : b.percent > 85 ? '#f59e0b' : 'var(--success)',
                  boxShadow: `0 0 8px ${b.percent > 100 ? 'var(--danger)' : b.percent > 85 ? '#f59e0b' : 'var(--success)'}40`
                }}
              />
            </div>

            {b.percent > 100 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.4rem' }}>
                <AlertTriangle size={12} />
                Over budget by ${(b.spent - b.amount).toLocaleString()}
              </div>
            )}
          </div>
        ))}

        {budgetStatus.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>
            No budgets set. Use the Category setup to start tracking.
          </p>
        )}
      </div>

      <AnimatePresence>
        {editingCategory && (
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
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
              style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--card-border)',
                borderRadius: '24px',
                padding: '2rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <h3 style={{ marginBottom: '1.5rem' }}>Update {editingCategory} Budget</h3>
              <div className="input-group">
                <label>Monthly Limit ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingCategory(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit}>Save Budget</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
