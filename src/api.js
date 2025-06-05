const API_URL = 'http://localhost:5000/api'; // Backend runs on 5000, with /api prefix

export async function register(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getProfile(email) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export async function getDailySummary(date) {
  const res = await fetch(`${API_URL}/summary/daily?date=${date}`);
  return res.json();
}

export async function listTrucks() {
  const res = await fetch(`${API_URL}/trucks`);
  return res.json();
}

export async function listWasteTypes() {
  const res = await fetch(`${API_URL}/waste-types`);
  return res.json();
}

export async function addTruckEntry(data) {
  const res = await fetch(`${API_URL}/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateTruckEntry(id, data) {
  const res = await fetch(`${API_URL}/entry/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteTruckEntry(id) {
  const res = await fetch(`${API_URL}/entry/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function getTruckHistory(number) {
  const res = await fetch(`${API_URL}/truck/${number}/history`);
  return res.json();
}
