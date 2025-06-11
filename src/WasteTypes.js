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
    <div style={{ 
      padding: '32px',
      backgroundColor: '#F8FAFC',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1E293B',
          margin: '0 0 8px 0',
          letterSpacing: '-0.025em',
          textAlign: 'center'
        }}>
          Waste Categories
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#64748B',
          margin: 0,
          fontWeight: '400',
          textAlign: 'center'
        }}>
          Monitor waste type distribution and totals
        </p>
      </div>

      {/* Compact Controls Section */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
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
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#1E293B',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = '#3B82F6'}
            onBlur={e => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowTotals(!showTotals)}
            style={{
              background: showTotals 
                ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            📊 {showTotals ? 'Hide Totals' : 'Show Totals'}
          </button>

          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              style={{
                background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Grand Total Display */}
      {showTotals && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #3B82F6',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '700',
            color: '#1E293B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Total Waste Collected
          </h3>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#64748B',
            marginBottom: '8px'
          }}>
            {filterDate ? `Date: ${filterDate}` : 'All Time'}
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '800',
            color: '#3B82F6'
          }}>
            {grandTotal.toFixed(2)} kg
          </div>
        </div>
      )}
      
      {loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '64px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #E2E8F0', 
            borderTop: '3px solid #3B82F6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{
            fontSize: '16px',
            color: '#64748B',
            margin: 0,
            fontWeight: '600'
          }}>
            Loading waste types and calculating totals...
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {wasteTypes.map((wt, index) => (
            <div
              key={wt.id}
              style={{
                background: wasteTypeColors[index % wasteTypeColors.length],
                borderRadius: '16px',
                padding: '24px 20px',
                color: '#ffffff',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{
                fontSize: '36px',
                marginBottom: '12px'
              }}>
                🗂️
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                {wt.name}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '6px 12px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                Total: {(wasteTotals[wt.name] || 0).toFixed(2)} kg
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                ID: {wt.id}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && wasteTypes.length === 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '64px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', color: '#64748B', fontWeight: '600' }}>
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
