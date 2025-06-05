import React, { useEffect, useState } from 'react';
import { listTrucks, getTruckHistory } from './api';
import { useNavigate } from 'react-router-dom';

export default function Trucks() {
  const [truckEntries, setTruckEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all trucks and their histories
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const trucks = await listTrucks();
      let allEntries = [];
      for (const t of trucks) {
        const res = await getTruckHistory(t.truck_number);
        if (res.entries && res.entries.length > 0) {
          // For each entry, add truck_number and fetch waste breakdown if needed
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
    }
    fetchAll();
  }, []);

  // Optionally, fetch waste breakdown for each entry
  // For now, assume waste_distribution is not available directly; you may need to extend your API to provide it.
  // Here, we'll just show total_weight and truck_number.

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
      }}>
        <h2 style={{ margin: 0 }}>Truck Entries</h2>
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
            boxShadow: '0 2px 8px #0001'
          }}
        >
          Add Truck Entry
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px #0001'
          }}>
            <thead>
              <tr style={{ background: '#e3eaf2' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Truck Number</th>
                <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Total Weight</th>
                <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Timestamp</th>
                <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Waste Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {truckEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>No entries found.</td>
                </tr>
              ) : (
                truckEntries.map((entry, idx) => (
                  <tr key={entry.id || idx}>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>{entry.truck_number}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>{entry.total_weight} kg</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>{entry.timestamp}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>
                      {entry.waste_breakdown && entry.waste_breakdown.length > 0
                        ? entry.waste_breakdown.map(w => `${w.type}: ${w.weight}kg`).join(', ')
                        : 'N/A'}
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
