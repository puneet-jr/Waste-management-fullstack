import React, { useState } from 'react';
import { register } from './api';
import { useNavigate } from 'react-router-dom';

export default function Register({ auth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form);
    if (res.message && !res.error) {
      // Auto-login after registration
      auth.login({ name: form.name, email: form.email });
      setMsg('Registration successful');
      navigate('/');
    } else {
      setMsg(res.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
      <div>{msg}</div>
    </form>
  );
}
