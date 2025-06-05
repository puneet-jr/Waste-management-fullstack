import React, { useState } from 'react';
import { register } from './api';

export default function AddUser() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form);
    setMsg(res.message || res.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New User</h2>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Add User</button>
      <div>{msg}</div>
    </form>
  );
}
