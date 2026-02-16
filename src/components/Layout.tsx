import React from 'react';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Plus, User, Cloud, BarChart3, Clock, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  user?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick, user }) => {
  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Flux Finance
            </h1>
            {user && <Cloud size={16} color="var(--success)" />}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user ? `Syncing for ${user.email.split('@')[0]}` : 'Local Mode • Sign in to sync'}
          </p>
        </div>
        <button 
          className="btn btn-primary btn-icon" 
          style={{ borderRadius: '16px' }}
          onClick={onAddClick}
        >
          <Plus size={24} />
        </button>
      </header>

      <main style={{ paddingBottom: '100px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '400px',
        height: '70px',
        background: 'rgba(23, 27, 41, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 1rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 1000
      }}>
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={24} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')} 
          icon={<ArrowLeftRight size={24} />} 
          label="Activity" 
        />
        <NavButton 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
          icon={<BarChart3 size={24} />} 
          label="Analytics" 
        />
        <NavButton 
          active={activeTab === 'scheduled'} 
          onClick={() => setActiveTab('scheduled')} 
          icon={<Clock size={24} />} 
          label="Scheduled" 
        />
        <NavButton 
          active={activeTab === 'import'} 
          onClick={() => setActiveTab('import')} 
          icon={<Upload size={24} />} 
          label="Import" 
        />
        <NavButton 
          active={activeTab === 'debts'} 
          onClick={() => setActiveTab('debts')} 
          icon={<CreditCard size={24} />} 
          label="Debts" 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<User size={24} />} 
          label="Profile" 
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
      transition: 'var(--transition)',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '12px'
    }}
  >
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.div>
    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        style={{
          position: 'absolute',
          bottom: '8px',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'var(--accent-primary)'
        }}
      />
    )}
  </button>
);
