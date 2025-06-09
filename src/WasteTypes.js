import React, { useEffect, useState } from 'react';
import { listWasteTypes, listTrucks, getTruckHistory } from './api';

export default function WasteTypes() {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [wasteTotals, setWasteTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWasteTypesWithTotals();
  }, []);

  const fetchWasteTypesWithTotals = async () => {
    setLoading(true);
    const types = await listWasteTypes();
    setWasteTypes(types);

    // Calculate totals for each waste type
    const trucks = await listTrucks();
    const totals = {};
    
    for (const type of types) {
      totals[type.name] = 0;
    }

    for (const truck of trucks) {
      const res = await getTruckHistory(truck.truck_number);
      if (res.entries) {
        for (const entry of res.entries) {
          if (entry.waste_breakdown) {
            for (const waste of entry.waste_breakdown) {
              if (totals[waste.type] !== undefined) {
                totals[waste.type] += parseFloat(waste.weight) || 0;
              }
            }
          }
        }
      }
    }

    setWasteTotals(totals);
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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Waste Categories
      </h2>
      
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          fontSize: '18px',
          color: '#4a5568'
        }}>
          Loading waste types and calculating totals...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                Total: {wasteTotals[wt.name] || 0} kg
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
    </div>
  );
}
