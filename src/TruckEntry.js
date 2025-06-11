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

  const removeWasteRow = (entryIdx, wasteIdx) => {
    const copy = [...entries];
    copy[entryIdx].waste_distribution = copy[entryIdx].waste_distribution.filter((_, i) => i !== wasteIdx);
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
      padding: '20px',
      backgroundColor: '#F8FAFC',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1E293B',
          margin: '0 0 6px 0',
          letterSpacing: '-0.025em'
        }}>
          New Truck Entry
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#64748B',
          margin: 0,
          fontWeight: '400'
        }}>
          Record waste collection data for truck entries
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              position: 'relative',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Remove Button */}
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeTruckEntryRow(idx)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#DC2626'}
                onMouseLeave={e => e.target.style.backgroundColor = '#EF4444'}
              >
                Remove
              </button>
            )}

            {/* Entry Header */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1E293B',
                margin: '0 0 4px 0'
              }}>
                Truck Entry #{idx + 1}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#64748B',
                margin: 0
              }}>
                Enter truck identification and waste distribution details
              </p>
            </div>

            {/* Truck Number Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Truck Number *
              </label>
              <input
                placeholder="Enter truck number (e.g., TRK-001)"
                value={entry.truck_number}
                onChange={e => handleEntryChange(idx, 'truck_number', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            {/* Waste Distribution Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Waste Distribution
                </label>
                <button
                  type="button"
                  onClick={() => addWasteRow(idx)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#047857'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#059669'}
                >
                  + Add Waste Type
                </button>
              </div>

              {/* Waste Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(entry.waste_distribution || []).map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr auto',
                      gap: '8px',
                      alignItems: 'end',
                      padding: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#6B7280',
                        marginBottom: '3px'
                      }}>
                        Waste Type
                      </label>
                      <select
                        value={w.type}
                        onChange={e => handleWasteChange(idx, i, 'type', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          outline: 'none'
                        }}
                      >
                        <option value="">Select waste type</option>
                        {wasteTypes.map(wt => (
                          <option key={wt.id} value={wt.name}>{wt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#6B7280',
                        marginBottom: '3px'
                      }}>
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={w.weight}
                        onChange={e => handleWasteChange(idx, i, 'weight', e.target.value)}
                        required
                        min="0"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWasteRow(idx, i)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: 1,
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={e => e.target.style.backgroundColor = '#DC2626'}
                      onMouseLeave={e => e.target.style.backgroundColor = '#EF4444'}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {(!entry.waste_distribution || entry.waste_distribution.length === 0) && (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6B7280',
                    backgroundColor: '#F9FAFB',
                    border: '1px dashed #D1D5DB',
                    borderRadius: '6px'
                  }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      No waste types added yet. Click "Add Waste Type" to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Total Weight Display */}
            <div style={{
              padding: '12px',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '6px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#0C4A6E',
                marginBottom: '4px'
              }}>
                Total Weight (Auto-calculated)
              </label>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0369A1'
              }}>
                {entry.total_weight || 0} kg
              </div>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <button
            type="button"
            onClick={addTruckEntryRow}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#F9FAFB';
              e.target.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.borderColor = '#D1D5DB';
            }}
          >
            + Add Another Entry
          </button>

          <button
            type="submit"
            style={{
              padding: '10px 24px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#2563EB';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#3B82F6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }}
          >
            Submit All Entries
          </button>
        </div>

        {/* Status Message */}
        {msg && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: msg.includes('Error') ? '#FCA5A5' : '#86EFAC',
            backgroundColor: msg.includes('Error') ? '#FEF2F2' : '#F0FDF4',
            color: msg.includes('Error') ? '#DC2626' : '#059669',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
