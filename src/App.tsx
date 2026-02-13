import { useState } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Transactions } from './components/Transactions'
import { Debts } from './components/Debts'
import { AddTransaction } from './components/AddTransaction'
import { Login } from './components/Login'
import { Charts } from './components/Charts'
import { useFinanceData } from './hooks/useFinanceData'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { transactions, debts, addTransaction, payDebt, stats, user, loading } = useFinanceData()

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-color)',
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Syncing secure data...</p>
      </div>
    )
  }

  const renderContent = () => {
    if (activeTab === 'profile' && !user) {
      return <Login />
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} transactions={transactions} />
      case 'transactions':
        return <Transactions transactions={transactions} />
      case 'analytics':
        return <Charts transactions={transactions} />
      case 'debts':
        return <Debts debts={debts} onPay={payDebt} />
      case 'profile':
        return (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid var(--accent-primary)'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.email?.[0].toUpperCase()}</span>
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>{user.email.split('@')[0]}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>{user.email}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <button className="btn btn-secondary" style={{ width: '100%' }}>Security Settings</button>
               <button className="btn btn-secondary" style={{ width: '100%' }}>Export Data (CSV)</button>
               <button 
                className="btn btn-danger" 
                style={{ width: '100%', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                onClick={() => import('./lib/supabase').then(m => m.supabase.auth.signOut())}
              >
                Sign Out
              </button>
            </div>
          </div>
        )
      default:
        return <Dashboard stats={stats} transactions={transactions} />
    }
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
        user={user}
      >
        {renderContent()}
      </Layout>
      <AddTransaction 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdd={addTransaction}
      />
    </>
  )
}

export default App
