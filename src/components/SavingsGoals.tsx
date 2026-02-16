import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Plus, Calendar, Target } from 'lucide-react';
import type { SavingsGoal } from '../hooks/useFinanceData';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'current_amount'>) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ 
  goals, 
  onAddGoal 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    color: '#6366f1',
    icon: 'target'
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) return;
    onAddGoal({
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || undefined,
      color: newGoal.color,
      icon: newGoal.icon
    });
    setIsAdding(false);
    setNewGoal({ title: '', target_amount: '', deadline: '', color: '#6366f1', icon: 'target' });
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Flag size={20} color="var(--accent-secondary)" />
          Savings Goals
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ 
            background: 'rgba(168, 85, 247, 0.1)', 
            color: 'var(--accent-secondary)', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {goals.map((goal) => {
          const percent = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          return (
            <motion.div 
              key={goal.id} 
              className="glass-card" 
              style={{ padding: '1.25rem', borderLeft: `4px solid ${goal.color}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{goal.title}</h4>
                  {goal.deadline && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Calendar size={12} /> {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{percent.toFixed(0)}%</div>
                </div>
              </div>

              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  style={{ height: '100%', background: goal.color, boxShadow: `0 0 10px ${goal.color}40` }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>${goal.current_amount.toLocaleString()} saved</span>
                <span style={{ fontWeight: 600 }}>${goal.target_amount.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', background: 'transparent' }}>
            <Target size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Setting goals is the first step to financial freedom.</p>
          </div>
        )}
      </div>

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
                maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={24} color="var(--accent-secondary)" />
                New Savings Goal
              </h3>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="input-group">
                  <label>What are you saving for?</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Dream Vacation, New Car" 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Target ($)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="5000" 
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Deadline (Optional)</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Theme Color</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#ef4444'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setNewGoal({ ...newGoal, color: c })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: c,
                          border: newGoal.color === c ? '3px solid white' : 'none',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddGoal}>Create Goal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
