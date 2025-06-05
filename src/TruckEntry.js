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
    setEntries(copy);
  };

  const addWasteRow = (entryIdx) => {
    const copy = [...entries];
    copy[entryIdx].waste_distribution = [
      ...(copy[entryIdx].waste_distribution || []),
      { type: '', weight: '' }
    ];
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
    <form onSubmit={handleSubmit}>
      <h2>Add Truck Entries</h2>
      {entries.map((entry, idx) => (
        <div key={idx} style={{
          border: '1px solid #bcd',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          background: '#f8fafc',
          position: 'relative'
        }}>
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => removeTruckEntryRow(idx)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '2px 10px',
                cursor: 'pointer'
              }}
              title="Remove this entry"
            >X</button>
          )}
          <input
            placeholder="Truck Number"
            value={entry.truck_number}
            onChange={e => handleEntryChange(idx, 'truck_number', e.target.value)}
            required
            style={{ marginBottom: 8, width: '100%' }}
          />
          <input
            placeholder="Total Weight"
            type="number"
            value={entry.total_weight}
            onChange={e => handleEntryChange(idx, 'total_weight', e.target.value)}
            required
            style={{ marginBottom: 8, width: '100%' }}
          />
          <button type="button" onClick={() => addWasteRow(idx)} style={{ marginBottom: 8 }}>
            Add Waste Type
          </button>
          {(entry.waste_distribution || []).map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select
                value={w.type}
                onChange={e => handleWasteChange(idx, i, 'type', e.target.value)}
                required
                style={{ flex: 1 }}
              >
                <option value="">Select Waste Type</option>
                {wasteTypes.map(wt => <option key={wt.id} value={wt.name}>{wt.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Weight"
                value={w.weight}
                onChange={e => handleWasteChange(idx, i, 'weight', e.target.value)}
                required
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addTruckEntryRow} style={{
        marginBottom: 16,
        background: '#3949ab',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 24px',
        fontSize: 16,
        cursor: 'pointer'
      }}>
        Add Another Truck Entry
      </button>
      <button type="submit" style={{
        background: '#1a237e',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '14px 0',
        fontSize: 18,
        fontWeight: 600,
        width: 200
      }}>
        Submit All
      </button>
      <div style={{ marginTop: 16 }}>{msg}</div>
    </form>
  );
}
