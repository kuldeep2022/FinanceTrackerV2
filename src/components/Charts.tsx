import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../hooks/useFinanceData';
import { groupByDate, groupByCategory, groupByMonth, formatCurrency, formatMonth } from '../utils/chartHelpers';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';

interface ChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export const Charts: React.FC<ChartsProps> = ({ transactions }) => {
  const dailyData = groupByDate(transactions);
  const categoryData = groupByCategory(transactions);
  const monthlyData = groupByMonth(transactions);

  if (transactions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3>No Data Yet</h3>
        <p>Add some transactions to see your financial insights!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={28} />
        Financial Analytics
      </h2>

      {/* Monthly Income vs Expenses */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} />
          Income vs Expenses (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              stroke="var(--text-secondary)"
              fontSize={11}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              stroke="var(--text-secondary)"
              fontSize={11}
            />
            <Tooltip 
              formatter={(value: any) => formatCurrency(Number(value))}
              labelFormatter={(label: any) => formatMonth(String(label))}
              contentStyle={{ 
                background: 'var(--card-bg)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Balance Over Time */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Balance Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData.slice(-30)}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                stroke="var(--text-secondary)"
              />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ 
                  background: 'var(--card-bg)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#balanceGradient)" 
                name="Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={20} />
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.category} (${props.percentage.toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ 
                  background: 'var(--card-bg)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} />
          Daily Activity (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="var(--text-secondary)"
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              stroke="var(--text-secondary)"
            />
            <Tooltip 
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{ 
                  background: 'var(--card-bg)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories List */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Top Spending Categories</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {categoryData.slice(0, 5).map((cat, index) => (
            <div 
              key={cat.category}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px'
              }}
            >
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: COLORS[index % COLORS.length],
                  flexShrink: 0
                }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{cat.category}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {cat.percentage.toFixed(1)}% of total spending
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {formatCurrency(cat.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
