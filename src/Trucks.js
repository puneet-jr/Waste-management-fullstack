import React, { useEffect, useState } from 'react';
import { listTrucks, getTruckHistory, updateTruckEntry, listWasteTypes } from './api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Trucks() {
  const [truckEntries, setTruckEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ total_weight: '', waste_distribution: [] });
  const [wasteTypes, setWasteTypes] = useState([]);
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

  // Download as Excel for the selected date or all
  const handleDownloadExcel = async () => {
    setDownloading(true);
    setMsg('');
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
    setMsg('Excel downloaded!');
    setDownloading(false);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16
      }}>
        <h2 style={{ margin: 0, flex: 1 }}>Truck Entries</h2>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{
            fontSize: 16,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #bcd'
          }}
        />
        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={downloading}
          style={{
            background: '#388e3c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0001'
          }}
        >
          {downloading
            ? 'Downloading...'
            : filterDate
              ? 'Download for Date'
              : 'Download All as Excel'}
        </button>
        <button
          onClick={() => navigate('/truck-entry')}
          style={{
            background: '#3949ab',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0001',
            marginLeft: 16
          }}
        >
          Add Truck Entry
        </button>
      </div>
      {msg && <div style={{ color: downloading ? '#388e3c' : '#d32f2f', marginBottom: 12 }}>{msg}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <th style={{ 
                  padding: '20px 24px', 
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 14
                }}>Truck Number</th>
                <th style={{ 
                  padding: '20px 24px', 
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 14
                }}>Total Weight</th>
                <th style={{ 
                  padding: '20px 24px', 
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 14,
                  minWidth: '180px'
                }}>Timestamp</th>
                <th style={{ 
                  padding: '20px 24px', 
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 14
                }}>Waste Breakdown</th>
                <th style={{ 
                  padding: '20px 24px', 
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 14
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ 
                    textAlign: 'center', 
                    padding: '48px 24px',
                    fontSize: 16,
                    color: '#64748b'
                  }}>No entries found.</td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <tr key={entry.id || idx} style={{
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      fontWeight: 500
                    }}>{entry.truck_number}</td>
                    <td style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      fontWeight: 500
                    }}>
                      {editingEntry === entry.id ? (
                        <input
                          type="number"
                          value={editForm.total_weight}
                          onChange={e => setEditForm({...editForm, total_weight: e.target.value})}
                          style={{ 
                            width: '100px', // Adjusted width for total weight
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #ced4da',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box',
                            height: '40px'
                          }}
                        />
                      ) : (
                        `${entry.total_weight} kg`
                      )}
                    </td>
                    <td style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      fontWeight: 500,
                      minWidth: '180px',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: '1.6'
                    }}>
                      {editingEntry === entry.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {editForm.waste_distribution.map((w, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 0 /* Override default mb */ }}>
                              <select
                                value={w.type}
                                onChange={e => handleWasteChange(i, 'type', e.target.value)}
                                style={{ 
                                  flex: 1, 
                                  height: '40px',
                                  padding: '0 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #ced4da',
                                  backgroundColor: '#fff',
                                  boxSizing: 'border-box'
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
                                  height: '40px',
                                  padding: '0 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #ced4da',
                                  backgroundColor: '#fff',
                                  textAlign: 'center',
                                  boxSizing: 'border-box'
                                }}
                                placeholder="Weight"
                              />
                              <button
                                type="button"
                                onClick={() => removeWasteRow(i)}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  background: '#ef4444', 
                                  color: '#fff', 
                                  border: 'none', 
                                  borderRadius: '8px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                  padding: 0
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
                              borderRadius: '8px', 
                              padding: '10px 16px', 
                              fontSize: '14px',
                              cursor: 'pointer',
                              alignSelf: 'flex-start'
                            }}
                          >
                            + Add Waste
                          </button>
                        </div>
                      ) : (
                        entry.waste_breakdown && entry.waste_breakdown.length > 0
                          ? entry.waste_breakdown.map(w => `${w.type}: ${w.weight}kg`).join(', ')
                          : 'N/A'
                      )}
                    </td>
                    <td style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      fontWeight: 500
                    }}>
                      {editingEntry === entry.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button
                            onClick={saveEdit}
                            style={{ 
                              background: '#10b981', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '8px', 
                              padding: '10px 16px', 
                              fontSize: '14px',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ 
                              background: '#6b7280', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '8px', 
                              padding: '10px 16px', 
                              fontSize: '14px',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(entry)}
                          style={{ 
                            background: '#3b82f6', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', // Rounded edit button
                            padding: '10px 16px', // Consistent padding
                            fontSize: '14px',    // Consistent font size
                            cursor: 'pointer'
                          }}
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
      )}
    </div>
  );
}
