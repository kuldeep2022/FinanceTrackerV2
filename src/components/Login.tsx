import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Github, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '20px', 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
        }}>
          <LogIn size={32} color="white" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Connect All Devices</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sync your finances across all your platforms</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div className="input-group">
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com" 
              style={{ paddingLeft: '3rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', padding: '1rem' }}
        >
          {loading ? 'Sending link...' : 'Send Magic Link'}
        </button>
      </form>

      {message && (
        <p style={{ 
          textAlign: 'center', 
          marginTop: '1rem', 
          fontSize: '0.9rem', 
          color: message.includes('Check') ? 'var(--success)' : 'var(--danger)',
          background: 'rgba(255,255,255,0.05)',
          padding: '0.8rem',
          borderRadius: '12px'
        }}>
          {message}
        </p>
      )}

      <div style={{ position: 'relative', margin: '2rem 0', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ position: 'relative', padding: '0 1rem', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR</span>
      </div>

      <button 
        className="btn btn-secondary" 
        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
        onClick={() => supabase.auth.signInWithOAuth({ 
          provider: 'github',
          options: {
            redirectTo: window.location.origin
          }
        })}
      >
        <Github size={20} /> Continue with GitHub
      </button>
    </div>
  );
};
