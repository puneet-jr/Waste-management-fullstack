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
    <div style={{ 
      padding: '20px',
      backgroundColor: '#F8FAFC',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#0F172A',
            margin: '0 0 6px 0',
            letterSpacing: '-0.025em',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            Truck Entry Management
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#475569',
            margin: 0,
            fontWeight: '500'
          }}>
            Monitor and manage all truck waste collection entries
          </p>
        </div>

        <button
          onClick={() => navigate('/truck-entry')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#2563EB';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#3B82F6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <span>+</span> Add Entry
        </button>
      </div>

      {/* Filters and Actions Panel */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#1E293B',
              minWidth: 'fit-content'
            }}>
              Filter by Date:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={downloading}
              style={{
                padding: '8px 16px',
                backgroundColor: downloading ? '#9CA3AF' : '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: downloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={e => {
                if (!downloading) {
                  e.target.style.backgroundColor = '#047857';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={e => {
                if (!downloading) {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {downloading ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid #FFFFFF',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Downloading...
                </>
              ) : (
                <>↓ Export Data</>
              )}
            </button>
            
            {showDownloadOptions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                zIndex: 10,
                minWidth: '160px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={handleDownloadExcel}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1E293B',
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                >
                  📊 Excel Format
                </button>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1E293B',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                >
                  📄 PDF Format
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {msg && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '6px',
          border: '1px solid',
          borderColor: msg.includes('Error') ? '#FCA5A5' : '#86EFAC',
          backgroundColor: msg.includes('Error') ? '#FEF2F2' : '#F0FDF4',
          color: msg.includes('Error') ? '#DC2626' : '#059669',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {msg}
        </div>
      )}

      {/* Main Data Table */}
      {loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #E2E8F0',
            borderTop: '3px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px auto'
          }}></div>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: 0,
            fontWeight: '500'
          }}>
            Loading truck entries...
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    Truck Number
                  </th>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    Total Weight
                  </th>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    Timestamp
                  </th>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    Waste Breakdown
                  </th>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '40px 16px',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <div style={{ marginBottom: '12px', fontSize: '32px' }}>📋</div>
                      No entries found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, idx) => (
                    <tr
                      key={entry.id || idx}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0F172A'
                      }}>
                        {entry.truck_number}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#1E293B'
                      }}>
                        {editingEntry === entry.id ? (
                          <input
                            type="number"
                            value={editForm.total_weight}
                            onChange={e => setEditForm({...editForm, total_weight: e.target.value})}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #D1D5DB',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '500',
                              width: '80px'
                            }}
                          />
                        ) : (
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: '#DBEAFE',
                            color: '#1D4ED8',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                          }}>
                            {entry.total_weight} kg
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: '#64748B',
                        fontWeight: '500'
                      }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: '#1E293B'
                      }}>
                        {editingEntry === entry.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {editForm.waste_distribution.map((w, i) => (
                              <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <select
                                  value={w.type}
                                  onChange={e => handleWasteChange(i, 'type', e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '4px 6px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500'
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
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                />
                                <button
                                  onClick={() => removeWasteRow(i)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: '#EF4444',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={addWasteRow}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {entry.waste_breakdown && entry.waste_breakdown.length > 0
                              ? entry.waste_breakdown.map((w, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      padding: '2px 6px',
                                      backgroundColor: '#F3F4F6',
                                      color: '#1E293B',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      fontWeight: '500',
                                      border: '1px solid #E5E7EB'
                                    }}
                                  >
                                    {w.type}: {w.weight}kg
                                  </span>
                                ))
                              : <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '400', fontStyle: 'italic' }}>No breakdown</span>}
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        {editingEntry === entry.id ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              onClick={saveEdit}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#6B7280',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(entry)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#3B82F6',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#2563EB'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#3B82F6'}
                          >
                            Edit
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
