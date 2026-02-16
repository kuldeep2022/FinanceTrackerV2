import { Search, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import type { Transaction } from '../hooks/useFinanceData';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete, onClearAll }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Transactions</h2>
        {transactions.length > 0 && (
          <button 
            className="btn btn-danger" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            onClick={onClearAll}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="input-group" style={{ position: 'relative', marginBottom: 0 }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search transactions..." 
          style={{ paddingLeft: '3rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>All</button>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap', opacity: 0.6 }}>Income</button>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap', opacity: 0.6 }}>Expenses</button>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap', opacity: 0.6 }}>Subscriptions</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map(t => (
            <div key={t.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: t.amount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {t.amount > 0 ? <ArrowUpRight size={20} color="var(--success)" /> : <ArrowDownLeft size={20} color="var(--danger)" />}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.category} • {t.date}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700, color: t.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                </span>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this transaction?')) {
                      onDelete(t.id);
                    }
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No transactions yet</p>}
        </div>
      </div>
    </div>
  );
};
