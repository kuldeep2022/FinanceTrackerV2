import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, ArrowRight, Settings2 } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { autoCategorize } from '../utils/categorization';
import type { Transaction } from '../hooks/useFinanceData';

interface CSVImportProps {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  existingTransactions: Transaction[];
}

interface Mapping {
  date: string;
  title: string;
  amount: string;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImport, existingTransactions }) => {
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({ date: '', title: '', amount: '' });
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [flipSigns, setFlipSigns] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          // Try to auto-detect mapping
          const detect = (keywords: string[]) => 
            results.meta.fields?.find(h => keywords.some(k => h.toLowerCase().includes(k))) || '';
          
          setMapping({
            date: detect(['date', 'time', 'day']),
            title: detect(['description', 'title', 'memo', 'name', 'payee']),
            amount: detect(['amount', 'price', 'total', 'value', 'charge'])
          });
        }
        setStep('map');
      }
    });
  };

  const handleProcessMapping = () => {
    if (!mapping.date || !mapping.title || !mapping.amount) {
      alert('Please map all required fields.');
      return;
    }

    const processed = csvData.map(row => {
      const title = row[mapping.title] || 'Untitled';
      let amountStr = String(row[mapping.amount]).replace(/[$,]/g, '').trim();
      
      // Handle parenthetical negatives like (15.00)
      if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
        amountStr = '-' + amountStr.substring(1, amountStr.length - 1);
      }
      
      let amount = parseFloat(amountStr);
      if (flipSigns) amount = -amount;
      const dateRaw = row[mapping.date];
      
      // Basic date cleaning
      let date = new Date().toISOString().split('T')[0];
      try {
        const d = new Date(dateRaw);
        if (!isNaN(d.getTime())) {
          date = d.toISOString().split('T')[0];
        }
      } catch (e) {}

      // Duplicate Check
      const isDuplicate = existingTransactions.some(t => 
        t.date === date && 
        t.amount === amount && 
        t.title.toLowerCase().includes(title.toLowerCase().substring(0, 5))
      );

      return {
        title,
        amount,
        date,
        type: amount > 0 ? 'income' : 'expense',
        category: autoCategorize(title),
        selected: !isDuplicate,
        isDuplicate
      };
    });

    setPendingTransactions(processed);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsImporting(true);
    const toImport = pendingTransactions
      .filter(t => t.selected)
      .map(({ selected, isDuplicate, ...t }) => t);
    
    try {
      await onImport(toImport);
      setStep('upload');
      setCsvData([]);
      alert(`Imported ${toImport.length} transactions successfully!`);
    } catch (e: any) {
      alert('Import failed: ' + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelection = (index: number) => {
    setPendingTransactions(prev => prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t));
  };

  const updateTransaction = (index: number, updates: Partial<any>) => {
    setPendingTransactions(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
          <FileText size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Statement Import</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Smart import for bank CSVs</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: '3rem 1.5rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}
          >
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
            />
            <Upload size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.2rem' }}>Drop your CSV statement</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Supports Chase, Amex, and Capital One</p>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </button>
          </motion.div>
        )}

        {step === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ padding: '2rem' }}
          >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings2 size={20} />
              Map CSV Columns
            </h3>
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {(Object.keys(mapping) as Array<keyof Mapping>).map(key => (
                <div key={key} className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ textTransform: 'capitalize' }}>{key} Column</label>
                  <select 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                    value={mapping[key]} 
                    onChange={e => setMapping(prev => ({ ...prev, [key]: e.target.value }))}
                  >
                    <option value="">Select Column...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={flipSigns} 
                  onChange={e => setFlipSigns(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <span style={{ display: 'block', fontWeight: 600 }}>Flip Transaction Signs</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Use this if expenses are shown as positive and income as negative (common for Credit Cards)
                  </span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep('upload')}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, minWidth: '200px' }} onClick={handleProcessMapping}>
                Review Transactions <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Review {pendingTransactions.length} Items</h3>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('map')}>Back</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  disabled={isImporting || !pendingTransactions.some(t => t.selected)}
                  onClick={handleImport}
                >
                  {isImporting ? 'Importing...' : `Import ${pendingTransactions.filter(t => t.selected).length}`}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {pendingTransactions.map((t, i) => (
                <div 
                  key={i} 
                  className="glass-card" 
                  style={{ 
                    padding: '1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    opacity: t.selected ? 1 : 0.5,
                    borderLeft: t.isDuplicate ? '4px solid var(--danger)' : t.selected ? '4px solid var(--success)' : '4px solid transparent'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={t.selected} 
                    onChange={() => toggleSelection(i)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <input 
                        type="text" 
                        value={t.title} 
                        onChange={e => updateTransaction(i, { title: e.target.value })}
                        style={{ background: 'none', border: 'none', borderBottom: '1px solid transparent', padding: 0, fontWeight: 600, width: '70%', color: 'white' }}
                        className="hover-border"
                      />
                      <span style={{ fontWeight: 700, color: t.amount > 0 ? 'var(--success)' : 'white' }}>
                        {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{t.date}</span>
                      <select 
                        value={t.category} 
                        onChange={e => updateTransaction(i, { category: e.target.value })}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: 0, fontSize: ' inherit' }}
                      >
                        <option value="General">General</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Income">Income</option>
                        <option value="Utilities">Utilities</option>
                      </select>
                      {t.isDuplicate && (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertCircle size={14} /> Potential Duplicate
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
