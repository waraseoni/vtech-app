import React, { useState } from 'react';
import axios from 'axios'; // npm install axios karein agar nahi hai

const API_URL = "https://vtech-app.onrender.com";

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const token = res.data.token;
      
      // Token ko browser mein save karein
      localStorage.setItem('vtech_token', token);
      localStorage.setItem('vtech_user', JSON.stringify(res.data.user));
      
      // App.js ko batayein ki login ho gaya hai
      setToken(token);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Check credentials.");
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7fe' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#1a202c' }}>V-TECH Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input 
            type="email" 
            className="form-control" 
            placeholder="admin@vtech.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" className="btn-save-main" style={{ width: '100%' }}>Login</button>
      </form>
    </div>
  );
}

export default Login;