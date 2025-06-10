import React, { useState, useEffect } from 'react';
import { addTruckEntry, listWasteTypes } from './api';

export default function TruckEntry() {
  const [entries, setEntries] = useState([
    { truck_number: '', total_weight: '', waste_distribution: [] }
  ]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    listWasteTypes().then(setWasteTypes);
  }, []);

  // Helper to recalculate total_weight for an entry
  const recalcTotalWeight = (waste_distribution) =>
    waste_distribution.reduce((sum, w) => sum + (parseFloat(w.weight) || 0), 0);

  const handleEntryChange = (idx, field, value) => {
    const copy = [...entries];
    copy[idx][field] = value;
    setEntries(copy);
  };

  const handleWasteChange = (entryIdx, wasteIdx, field, value) => {
    const copy = [...entries];
    const wasteArr = copy[entryIdx].waste_distribution || [];
    wasteArr[wasteIdx] = { ...wasteArr[wasteIdx], [field]: value };
    copy[entryIdx].waste_distribution = wasteArr;
    // Auto-calculate total_weight
    copy[entryIdx].total_weight = recalcTotalWeight(wasteArr);
    setEntries(copy);
  };

  const addWasteRow = (entryIdx) => {
    const copy = [...entries];
    copy[entryIdx].waste_distribution = [
      ...(copy[entryIdx].waste_distribution || []),
      { type: '', weight: '' }
    ];
    // Auto-calculate total_weight
    copy[entryIdx].total_weight = recalcTotalWeight(copy[entryIdx].waste_distribution);
    setEntries(copy);
  };

  const addTruckEntryRow = () => {
    setEntries([
      ...entries,
      { truck_number: '', total_weight: '', waste_distribution: [] }
    ]);
  };

  const removeTruckEntryRow = (idx) => {
    if (entries.length === 1) return;
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    let allOk = true;
    for (const entry of entries) {
      const res = await addTruckEntry(entry);
      if (res.error) {
        setMsg(`Error: ${res.error}`);
        allOk = false;
        break;
      }
    }
    if (allOk) {
      setMsg('All entries recorded successfully');
      setEntries([{ truck_number: '', total_weight: '', waste_distribution: [] }]);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f8fafc', 
      minHeight: '100vh',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ 
          marginBottom: 32,
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Add Truck Entries
        </h2>
        
        {entries.map((entry, idx) => (
          <div key={idx} style={{
            border: '2px solid #e2e8f0',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            background: '#fff',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeTruckEntryRow(idx)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
                }}
                title="Remove this entry"
              >
                ✕ Remove
              </button>
            )}
            
            <input
              placeholder="Truck Number"
              value={entry.truck_number}
              onChange={e => handleEntryChange(idx, 'truck_number', e.target.value)}
              required
              style={{ 
                marginBottom: 16, 
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => addWasteRow(idx)}
                style={{
                  marginBottom: 16,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                ➕ Add Waste Type
              </button>
              
              {(entry.waste_distribution || []).map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <select
                    value={w.type}
                    onChange={e => handleWasteChange(idx, i, 'type', e.target.value)}
                    required
                    style={{ 
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select Waste Type</option>
                    {wasteTypes.map(wt => <option key={wt.id} value={wt.name}>{wt.name}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={w.weight}
                    onChange={e => handleWasteChange(idx, i, 'weight', e.target.value)}
                    required
                    style={{ 
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                    min="0"
                  />
                </div>
              ))}
            </div>
            
            <input
              placeholder="Total Weight (Auto-calculated)"
              type="number"
              value={entry.total_weight}
              readOnly
              style={{ 
                marginBottom: 16, 
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #f3f4f6',
                background: '#f8fafc', 
                color: '#374151',
                fontSize: '16px',
                fontWeight: '600'
              }}
            />
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={addTruckEntryRow} 
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            🚛 Add Another Truck Entry
          </button>
          
          <button 
            type="submit" 
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            📤 Submit All Entries
          </button>
        </div>
        
        {msg && (
          <div style={{ 
            marginTop: 24,
            color: msg.includes('Error') ? '#dc2626' : '#059669', 
            padding: '16px 20px',
            background: msg.includes('Error') ? '#fef2f2' : '#f0fdf4',
            border: `2px solid ${msg.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
