import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login check karne ke liye
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editId, setEditId] = useState(null);

  // Data fetch karne ka function
  const fetchData = () => {
    fetch(`${API_URL}/api/message`)
      .then(res => res.json())
      .then(json => setMessages(json))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // Login handler (Abhi ke liye sirf button click par login ho jayega)
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  // --- Agar Login NAHI hai toh ye dikhega (Landing Page) ---
  if (!isLoggedIn) {
    return (
      <div className="landing-page">
        <nav className="navbar">
          <div className="logo">V-Tech Repair</div>
          <button className="login-nav-btn" onClick={handleLogin}>Login</button>
        </nav>
        
        <header className="hero-section">
          <h1>Modern Repair Shop Management</h1>
          <p>Apne repair business ko digital banayein. Mobile, Laptop aur Gadgets ka hisab-kitab ab ek hi jagah.</p>
          <button className="get-started-btn" onClick={handleLogin}>Get Started Free</button>
        </header>

        <section className="features">
          <div className="feature-card"><h3>Job Cards</h3><p>Naye repairs ki entry karein.</p></div>
          <div className="feature-card"><h3>Inventory</h3><p>Parts ka stock check karein.</p></div>
          <div className="feature-card"><h3>Invoicing</h3><p>Turant bill banayein.</p></div>
        </section>
      </div>
    );
  }

  // --- Agar Login HAI toh ye dikhega (Dashboard) ---
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>V-Tech</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>Repairs List</li>
          <li>Inventory</li>
          <li onClick={handleLogout} className="logout-item">Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="dash-header">
          <h2>Welcome, Vikram!</h2>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </header>

        {/* Aapka purana Logic yahan hai */}
        <div className="dash-card">
          <div className="input-group">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Naya Repair Note likhein..."
            />
            <button className="btn-save" onClick={() => {/* handleSave logic */}}>Save</button>
          </div>
          <ul className="message-list">
            {messages.map((m) => (
              <li key={m._id} className="message-item">{m.text}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;