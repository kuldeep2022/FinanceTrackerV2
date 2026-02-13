import { MinusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Debt } from '../hooks/useFinanceData';

interface DebtsProps {
  debts: Debt[];
  onPay: (debtId: string, amount: number) => void;
}

export const Debts: React.FC<DebtsProps> = ({ debts, onPay }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Debt</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>
            ${debts.reduce((acc, d) => acc + (d.total - d.paid), 0).toLocaleString()}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Count</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{debts.length} Active</h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Debts</h3>
        {debts.map(debt => (
          <DebtItem key={debt.id} debt={debt} onPay={onPay} />
        ))}
        {debts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No active debts</p>}
      </div>
    </div>
  );
};

const DebtItem = ({ debt, onPay }: { debt: Debt, onPay: (id: string, amount: number) => void }) => {
  const { label, total, paid, dueDate, isOverdue, id } = debt;
  const progress = (paid / total) * 100;
  
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{label}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {isOverdue && <AlertCircle size={14} />}
            <span>{isOverdue ? 'Overdue' : 'Due date'}: {dueDate}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>${(total - paid).toLocaleString()}</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>remaining</p>
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ fontWeight: 600 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: '100%', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
          onClick={() => {
            const amount = prompt(`How much would you like to pay towards ${label}?`);
            if (amount) onPay(id, parseFloat(amount));
          }}
        >
          <MinusCircle size={16} /> Pay Towards Debt
        </button>
      </div>
    </div>
  );
};
