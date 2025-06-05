import React, { useEffect, useState } from 'react';
import { listWasteTypes } from './api';

export default function WasteTypes() {
  const [wasteTypes, setWasteTypes] = useState([]);

  useEffect(() => {
    listWasteTypes().then(setWasteTypes);
  }, []);

  return (
    <div>
      <h2>Waste Types</h2>
      <ul>
        {wasteTypes.map(wt => (
          <li key={wt.id}>{wt.name}</li>
        ))}
      </ul>
    </div>
  );
}
