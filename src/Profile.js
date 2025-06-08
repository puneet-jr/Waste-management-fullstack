import React, { useState } from 'react';
import { getProfile } from './api';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchProfile = async e => {
    e.preventDefault();
    const res = await getProfile(email);
    if (res.error) {
      setMsg(res.error);
      setProfile(null);
    } else {
      setProfile(res);
      setMsg('');
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={fetchProfile}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Get Profile</button>
      </form>
      {msg && <div style={{ color: 'red' }}>{msg}</div>}
      {profile && (
        <div>
          <div>ID: {profile.id}</div>
          <div>Name: {profile.name}</div>
          <div>Email: {profile.email}</div>
          <div>Phone: {profile.phone}</div>
        </div>
      )}
    </div>
  );
}
