import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { RELEASES, CURRENT_VERSION } from '../data/whatsNewData';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const latestRelease = RELEASES[0];

  const handleClose = () => {
    localStorage.setItem('flux_whats_new_version', CURRENT_VERSION);
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
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000
            }}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '24px',
              padding: '2rem',
              zIndex: 2100,
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--accent-primary)', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}>
                  <Sparkles size={12} />
                  WHAT'S NEW V{latestRelease.version}
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{latestRelease.title}</h2>
              </div>
              <button 
                onClick={handleClose} 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {latestRelease.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--accent-primary)'
                  }}>
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 600, fontSize: '1rem' }}>{feature.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleClose}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '16px', 
                fontSize: '1rem', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Start Exploring <ArrowRight size={20} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
