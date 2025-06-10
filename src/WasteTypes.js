import React, { useEffect, useState } from 'react';
import { listWasteTypes, listTrucks, getTruckHistory } from './api';

export default function WasteTypes() {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [wasteTotals, setWasteTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [showTotals, setShowTotals] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchWasteTypesWithTotals();
  }, []);

  useEffect(() => {
    if (filterDate) {
      fetchWasteTypesWithTotals();
    }
  }, [filterDate]);

  const fetchWasteTypesWithTotals = async () => {
    setLoading(true);
    const types = await listWasteTypes();
    setWasteTypes(types);

    // Calculate totals for each waste type
    const trucks = await listTrucks();
    const totals = {};
    let total = 0;
    
    for (const type of types) {
      totals[type.name] = 0;
    }

    for (const truck of trucks) {
      const res = await getTruckHistory(truck.truck_number);
      if (res.entries) {
        for (const entry of res.entries) {
          // Filter by date if specified
          if (filterDate && entry.timestamp && !entry.timestamp.startsWith(filterDate)) {
            continue;
          }
          
          if (entry.waste_breakdown) {
            for (const waste of entry.waste_breakdown) {
              if (totals[waste.type] !== undefined) {
                const weight = parseFloat(waste.weight) || 0;
                totals[waste.type] += weight;
                total += weight;
              }
            }
          }
        }
      }
    }

    setWasteTotals(totals);
    setGrandTotal(total);
    setLoading(false);
  };

  const wasteTypeColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        fontWeight: '700'
      }}>
        Waste Categories
      </h2>

      {/* Controls Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#475569',
            whiteSpace: 'nowrap'
          }}>
            Filter by Date:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{
              fontSize: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          />
        </div>

        <button
          onClick={() => setShowTotals(!showTotals)}
          style={{
            background: showTotals 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          📊 {showTotals ? 'Hide Totals' : 'Show Totals'}
        </button>

        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            🗑️ Clear Filter
          </button>
        )}
      </div>

      {/* Grand Total Display */}
      {showTotals && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '24px', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Total Waste Collected
          </h3>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {filterDate ? `Date: ${filterDate}` : 'All Time'}
          </div>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            marginTop: '8px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {grandTotal.toFixed(2)} kg
          </div>
        </div>
      )}
      
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          fontSize: '18px',
          color: '#4a5568'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading waste types and calculating totals...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          padding: '20px 0'
        }}>
          {wasteTypes.map((wt, index) => (
            <div
              key={wt.id}
              style={{
                background: wasteTypeColors[index % wasteTypeColors.length],
                borderRadius: '20px',
                padding: '32px 24px',
                color: '#ffffff',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🗂️
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                {wt.name}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                Total: {(wasteTotals[wt.name] || 0).toFixed(2)} kg
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8
              }}>
                Category ID: {wt.id}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && wasteTypes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', color: '#4a5568' }}>
            No waste types found
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
