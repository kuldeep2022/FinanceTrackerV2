import { useState } from 'react';
import { X, DollarSign, Tag, Calendar, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transaction } from '../hooks/useFinanceData';

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<'income' | 'expense' | 'debt'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [category, setCategory] = useState('General');

  const categories = {
    expense: ['General', 'Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Housing', 'Subscription', 'Other'],
    income: ['Salary', 'Bonus', 'Investment', 'Dividend', 'Gift', 'Other'],
    debt: ['Credit Card', 'Loan', 'Mortgage', 'Student Loan', 'Other']
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    
    if (!title || title.trim().length < 2) {
      alert('Please enter a description (min 2 characters).');
      return;
    }
    
    onAdd({
      title: title.trim(),
      amount: type === 'income' ? numAmount : -numAmount,
      type,
      category: type === 'debt' ? 'Debt' : category,
      date
    });
    
    setAmount('');
    setTitle('');
    setCategory('General');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              zIndex: 1100
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--bg-color)',
              borderTop: '1px solid var(--card-border)',
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              padding: '2rem 1.5rem',
              zIndex: 1200,
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 -20px 40px -10px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Create Entry</h2>
              <button 
                onClick={onClose} 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--text-primary)', 
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '18px' }}>
              {(['expense', 'income', 'debt'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setCategory(categories[t][0]);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: '14px',
                    border: 'none',
                    background: type === t ? 'var(--accent-primary)' : 'transparent',
                    color: type === t ? 'white' : 'var(--text-secondary)',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-group">
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00" 
                    style={{ 
                      paddingLeft: '3rem', 
                      fontSize: '1.75rem', 
                      fontWeight: 800,
                      height: '4.5rem',
                      borderRadius: '18px'
                    }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Description</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Where did it go?" 
                    style={{ 
                      paddingLeft: '3rem',
                      height: '3.5rem',
                      borderRadius: '14px'
                    }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                  <select 
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ 
                      height: '3.5rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      appearance: 'none',
                      paddingLeft: '1.25rem'
                    }}
                  >
                    {categories[type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="date" 
                      className="input-field" 
                      style={{ 
                        paddingLeft: '3rem',
                        height: '3.5rem',
                        borderRadius: '14px'
                      }} 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '1.25rem', 
                  marginTop: '1.5rem', 
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  height: '4rem',
                  borderRadius: '18px',
                  boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                }}
                onClick={handleSubmit}
              >
                <Plus size={22} /> Confirm {type}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
