import { TrendingUp, TrendingDown, Wallet, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateFinancialHealth } from '../utils/financialHealth';
import type { Transaction } from '../hooks/useFinanceData';

interface DashboardProps {
  stats: {
    balance: number;
    income: number;
    expenses: number;
    totalDebt: number;
  };
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, transactions }) => {
  const health = calculateFinancialHealth(stats.income, stats.expenses, stats.totalDebt, stats.balance);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <motion.div 
        className="glass-card"
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Balance</span>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>${stats.balance.toLocaleString()}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center', 
            color: 'white', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            background: health.color, 
            padding: '0.5rem 1rem', 
            borderRadius: '99px',
            boxShadow: `0 4px 12px ${health.color}40`
          }}>
            <TrendingUp size={16} />
            <span>Financial Health: {health.status}</span>
          </div>
          
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <Info size={14} style={{ opacity: 0.7 }} />
            {health.insight}
          </p>
        </div>
      </motion.div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <StatCard 
          label="Income" 
          value={`$${stats.income.toLocaleString()}`} 
          icon={<TrendingUp size={20} color="var(--success)" />} 
          color="var(--success)" 
        />
        <StatCard 
          label="Expenses" 
          value={`$${stats.expenses.toLocaleString()}`} 
          icon={<TrendingDown size={20} color="var(--danger)" />} 
          color="var(--danger)" 
        />
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Recent Activity</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>See all</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.slice(0, 3).map(t => (
            <ActivityItem 
              key={t.id}
              title={t.title} 
              category={t.category} 
              amount={`${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()}`} 
              date={t.date} 
              isNegative={t.amount < 0} 
            />
          ))}
          {transactions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No recent activity</p>}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ background: `${color}15`, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{value}</span>
  </div>
);

const ActivityItem = ({ title, category, amount, date, isNegative }: { title: string, category: string, amount: string, date: string, isNegative?: boolean }) => (
  <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Wallet size={20} color="var(--text-secondary)" />
      </div>
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{category} • {date}</span>
      </div>
    </div>
    <span style={{ fontWeight: 700, color: isNegative ? 'var(--danger)' : 'var(--success)' }}>{amount}</span>
  </div>
);
