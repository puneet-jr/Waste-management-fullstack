import React, { useState } from 'react';
import { getDailySummary } from './api';

export default function Dashboard() {
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      if (!date) {
        setError('Please select a date.');
        setLoading(false);
        return;
      }
      const res = await getDailySummary(date);
      if (res.error) {
        setError(res.error);
        setSummary(null);
      } else {
        setSummary(res);
      }
    } catch (err) {
      setError('Failed to fetch summary');
      setSummary(null);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 32, color: '#1a237e', marginBottom: 24 }}>Daily Summary</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            fontSize: 18,
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #bcd',
            marginRight: 8
          }}
        />
        <button
          onClick={fetchSummary}
          disabled={loading}
          style={{
            background: '#1a237e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Get Summary'}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {summary && summary.breakdown && summary.breakdown.length > 0 ? (
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
            Total Weight: {summary.total_weight} kg
          </div>
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
                  <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Waste Type</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Total Weight</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #bcd' }}>Trucks</th>
                </tr>
              </thead>
              <tbody>
                {summary.breakdown.map((b, i) => (
                  <tr key={i}>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>{b.waste_type}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>{b.total_weight} kg</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e3eaf2' }}>
                      {b.truck_numbers && b.truck_numbers.length > 0
                        ? b.truck_numbers.join(', ')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !error && <div>No summary loaded yet.</div>
      )}
    </div>
  );
}
