const API_URL = 'http://localhost:5000/api';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    return { error: 'Could not connect to backend. Is it running?' };
  }
}

export async function register(data) {
  return safeFetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function login(data) {
  return safeFetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function getProfile(email) {
  return safeFetch(`${API_URL}/auth/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
}

export async function getDailySummary(date) {
  return safeFetch(`${API_URL}/summary/daily?date=${date}`);
}

export async function listTrucks() {
  return safeFetch(`${API_URL}/trucks`);
}

export async function listWasteTypes() {
  return safeFetch(`${API_URL}/waste-types`);
}

export async function addTruckEntry(data) {
  return safeFetch(`${API_URL}/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateTruckEntry(id, data) {
  return safeFetch(`${API_URL}/entry/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteTruckEntry(id) {
  return safeFetch(`${API_URL}/entry/${id}`, {
    method: 'DELETE'
  });
}

export async function getTruckHistory(number) {
  return safeFetch(`${API_URL}/truck/${number}/history`);
}
