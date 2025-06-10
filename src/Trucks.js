import React, { useEffect, useState } from 'react';
import { listTrucks, getTruckHistory, updateTruckEntry, listWasteTypes } from './api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Trucks() {
  const [truckEntries, setTruckEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ total_weight: '', waste_distribution: [] });
  const [wasteTypes, setWasteTypes] = useState([]);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
    listWasteTypes().then(setWasteTypes);
    // eslint-disable-next-line
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const trucks = await listTrucks();
    let allEntries = [];
    for (const t of trucks) {
      const res = await getTruckHistory(t.truck_number);
      if (res.entries && res.entries.length > 0) {
        for (const entry of res.entries) {
          allEntries.push({
            ...entry,
            truck_number: t.truck_number
          });
        }
      }
    }
    setTruckEntries(allEntries);
    setLoading(false);
  };

  const startEdit = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      total_weight: entry.total_weight,
      waste_distribution: entry.waste_breakdown || []
    });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditForm({ total_weight: '', waste_distribution: [] });
  };

  const handleWasteChange = (idx, field, value) => {
    const copy = [...editForm.waste_distribution];
    copy[idx] = { ...copy[idx], [field]: value };
    setEditForm({ ...editForm, waste_distribution: copy });
  };

  const addWasteRow = () => {
    setEditForm({
      ...editForm,
      waste_distribution: [...editForm.waste_distribution, { type: '', weight: '' }]
    });
  };

  const removeWasteRow = (idx) => {
    const copy = editForm.waste_distribution.filter((_, i) => i !== idx);
    setEditForm({ ...editForm, waste_distribution: copy });
  };

  const saveEdit = async () => {
    const res = await updateTruckEntry(editingEntry, editForm);
    if (res.error) {
      setMsg(`Error: ${res.error}`);
    } else {
      setMsg('Entry updated successfully');
      fetchEntries();
      cancelEdit();
    }
  };

  // Filter entries by date (YYYY-MM-DD)
  const filteredEntries = filterDate
    ? truckEntries.filter(e => e.timestamp && e.timestamp.startsWith(filterDate))
    : truckEntries;

  // Download as Excel
  const handleDownloadExcel = async () => {
    setDownloading(true);
    setMsg('');
    setShowDownloadOptions(false);
    // Prepare rows for Excel
    let allRows = [];
    for (const entry of filteredEntries) {
      if (entry.waste_breakdown && entry.waste_breakdown.length > 0) {
        for (const w of entry.waste_breakdown) {
          allRows.push({
            'Truck Number': entry.truck_number,
            'Timestamp': entry.timestamp,
            'Total Weight': entry.total_weight,
            'Waste Type': w.type,
            'Waste Weight': w.weight
          });
        }
      } else {
        allRows.push({
          'Truck Number': entry.truck_number,
          'Timestamp': entry.timestamp,
          'Total Weight': entry.total_weight,
          'Waste Type': '',
          'Waste Weight': ''
        });
      }
    }
    if (allRows.length === 0) {
      setMsg('No entries found for the selected date.');
      setDownloading(false);
      return;
    }
    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Truck Entries');
    const filename = filterDate
      ? `truck_entries_${filterDate}.xlsx`
      : 'truck_entries_all.xlsx';
    XLSX.writeFile(wb, filename);
    setMsg('Excel file downloaded successfully!');
    setDownloading(false);
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    setDownloading(true);
    setMsg('');
    setShowDownloadOptions(false);
    
    let allRows = [];
    for (const entry of filteredEntries) {
      if (entry.waste_breakdown && entry.waste_breakdown.length > 0) {
        for (const w of entry.waste_breakdown) {
          allRows.push([
            entry.truck_number,
            entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A',
            `${entry.total_weight} kg`,
            w.type,
            `${w.weight} kg`
          ]);
        }
      } else {
        allRows.push([
          entry.truck_number,
          entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A',
          `${entry.total_weight} kg`,
          '',
          ''
        ]);
      }
    }

    if (allRows.length === 0) {
      setMsg('No entries found for the selected date.');
      setDownloading(false);
      return;
    }

    const doc = new jsPDF();
    const title = filterDate ? `Truck Entries - ${filterDate}` : 'All Truck Entries';
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    doc.autoTable({
      head: [['Truck Number', 'Timestamp', 'Total Weight', 'Waste Type', 'Waste Weight']],
      body: allRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [103, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const filename = filterDate
      ? `truck_entries_${filterDate}.pdf`
      : 'truck_entries_all.pdf';
    doc.save(filename);
    setMsg('PDF file downloaded successfully!');
    setDownloading(false);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 32,
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <h2 style={{ 
          margin: 0, 
          flex: 1, 
          fontSize: 28, 
          fontWeight: 700, 
          color: '#1e293b',
          minWidth: '200px'
        }}>Truck Entries</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#475569',
            whiteSpace: 'nowrap'
          }}>
            Date:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{
              fontSize: 14,
              padding: '10px 12px',
              borderRadius: 10,
              border: '2px solid #e2e8f0',
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={downloading}
            style={{
              background: downloading 
                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              if (!downloading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!downloading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            {downloading ? (
              <>
                <span style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid #fff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></span>
                Downloading...
              </>
            ) : (
              <>
                📥 Download
              </>
            )}
          </button>
          
          {showDownloadOptions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              minWidth: 200,
              overflow: 'hidden'
            }}>
              <button
                onClick={handleDownloadExcel}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#374151',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={e => e.target.style.background = '#f8fafc'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                📊 Excel Format
              </button>
              <button
                onClick={handleDownloadPDF}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#374151',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={e => e.target.style.background = '#f8fafc'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                📄 PDF Format
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/truck-entry')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.3s ease'
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
          ➕ Add Entry
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showDownloadOptions && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => setShowDownloadOptions(false)}
        />
      )}

      {msg && (
        <div style={{ 
          color: msg.includes('Error') ? '#dc2626' : '#059669', 
          marginBottom: 20,
          padding: '12px 16px',
          background: msg.includes('Error') ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${msg.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '64px 24px',
          fontSize: 16,
          color: '#64748b'
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading entries...
        </div>
      ) : (
        <div style={{ 
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <th style={{ 
                    padding: '20px 24px', 
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 12,
                    textAlign: 'left'
                  }}>Truck Number</th>
                  <th style={{ 
                    padding: '20px 24px', 
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 12,
                    textAlign: 'left'
                  }}>Total Weight</th>
                  <th style={{ 
                    padding: '20px 24px', 
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 12,
                    minWidth: '180px',
                    textAlign: 'left'
                  }}>Timestamp</th>
                  <th style={{ 
                    padding: '20px 24px', 
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 12,
                    textAlign: 'left'
                  }}>Waste Breakdown</th>
                  <th style={{ 
                    padding: '20px 24px', 
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 12,
                    textAlign: 'center'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      textAlign: 'center', 
                      padding: '64px 24px',
                      fontSize: 16,
                      color: '#64748b',
                      background: '#f8fafc'
                    }}>
                      <div style={{ marginBottom: 12 }}>📋</div>
                      No entries found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, idx) => (
                    <tr key={entry.id || idx} style={{
                      transition: 'background-color 0.2s ease',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ 
                        padding: '20px 24px', 
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1e293b'
                      }}>{entry.truck_number}</td>
                      <td style={{ 
                        padding: '20px 24px', 
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        {editingEntry === entry.id ? (
                          <input
                            type="number"
                            value={editForm.total_weight}
                            onChange={e => setEditForm({...editForm, total_weight: e.target.value})}
                            style={{ 
                              width: '100px',
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              border: '1px solid #d1d5db',
                              backgroundColor: '#fff',
                              fontSize: 14
                            }}
                          />
                        ) : (
                          <span style={{
                            background: '#f0f9ff',
                            color: '#0369a1',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600
                          }}>
                            {entry.total_weight} kg
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#6b7280',
                        minWidth: '180px'
                      }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#374151',
                        lineHeight: '1.6'
                      }}>
                        {editingEntry === entry.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {editForm.waste_distribution.map((w, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select
                                  value={w.type}
                                  onChange={e => handleWasteChange(i, 'type', e.target.value)}
                                  style={{ 
                                    flex: 1, 
                                    height: '36px',
                                    padding: '0 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: '#fff',
                                    fontSize: 13
                                  }}
                                >
                                  <option value="">Select Type</option>
                                  {wasteTypes.map(wt => <option key={wt.id} value={wt.name}>{wt.name}</option>)}
                                </select>
                                <input
                                  type="number"
                                  value={w.weight}
                                  onChange={e => handleWasteChange(i, 'weight', e.target.value)}
                                  style={{ 
                                    width: '70px', 
                                    height: '36px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: '#fff',
                                    textAlign: 'center',
                                    fontSize: 13
                                  }}
                                  placeholder="kg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeWasteRow(i)}
                                  style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    background: '#ef4444', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addWasteRow}
                              style={{ 
                                background: '#10b981', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '6px', 
                                padding: '8px 12px', 
                                fontSize: '12px',
                                cursor: 'pointer',
                                alignSelf: 'flex-start'
                              }}
                            >
                              + Add Waste
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {entry.waste_breakdown && entry.waste_breakdown.length > 0
                              ? entry.waste_breakdown.map((w, i) => (
                                  <span key={i} style={{
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    border: '1px solid #e5e7eb'
                                  }}>
                                    {w.type}: {w.weight}kg
                                  </span>
                                ))
                              : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No breakdown</span>}
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        textAlign: 'center'
                      }}>
                        {editingEntry === entry.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={saveEdit}
                              style={{ 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                padding: '8px 16px', 
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              ✓ 
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ 
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                padding: '8px 16px', 
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                boxShadow: '0 2px 6px rgba(107, 114, 128, 0.3)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 6px rgba(107, 114, 128, 0.3)';
                              }}
                            >
                              ✕ 
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(entry)}
                            style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={e => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)';
                            }}
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
