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
      category: type === 'income' ? 'Income' : type === 'debt' ? 'Debt' : 'General',
      date
    });
    
    setAmount('');
    setTitle('');
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
              backdropFilter: 'blur(4px)',
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
              padding: '2rem',
              zIndex: 1200,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add Entry</h2>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '16px' }}>
              {(['expense', 'income', 'debt'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: type === t ? 'var(--accent-primary)' : 'transparent',
                    color: type === t ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="input-group">
                <label>Amount</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00" 
                    style={{ paddingLeft: '2.5rem', fontSize: '1.5rem', fontWeight: 700 }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Rent, Coffee, Bonus..." 
                    style={{ paddingLeft: '2.5rem' }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="date" 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }} 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1.2rem', marginTop: '1rem', fontSize: '1.1rem' }}
                onClick={handleSubmit}
              >
                <Plus size={20} /> Add {type}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
