import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [repairs, setRepairs] = useState([]);
  
  // State for Clients
const [clients, setClients] = useState([]);
const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });

// Fetch Clients
const fetchClients = async () => {
  const res = await fetch(`${API_URL}/api/clients`);
  const data = await res.json();
  setClients(data);
};

// Add Client Handler
const handleClientSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch(`${API_URL}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientForm)
  });
  const data = await res.json();
  if(data.success) {
    alert("Client Added!");
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    fetchClients();
  } else {
    alert(data.message);
  }
};
  
  
  // Form State (SQL file ke names ke hisab se)
  const [formData, setFormData] = useState({
    customer_name: '',
    contact: '',
    device_model: '',
    problem: '',
    total_amount: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/repairs`);
      const data = await res.json();
      setRepairs(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tracking_code = "VTR-" + Math.floor(100000 + Math.random() * 900000); // Unique ID
    
    await fetch(`${API_URL}/api/repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, tracking_code })
    });
    
    setFormData({ customer_name: '', contact: '', device_model: '', problem: '', total_amount: '' });
    fetchData();
    alert("Repair Job Card Created! Tracking ID: " + tracking_code);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h2>V-Tech Admin Login</h2>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button className="btn-login" onClick={() => setIsLoggedIn(true)}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className="sidebar">
        <h3>V-TECH REPAIR</h3>
        <ul>
          <li className="active">Dashboard</li>
          <li>Mechanics</li>
          <li>Inventory</li>
          <li onClick={() => setIsLoggedIn(false)}>Logout</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h2>Repair Management Dashboard</h2>
        </header>

        {/* Entry Form */}
        <section className="form-section">
          <form className="repair-form" onSubmit={handleSubmit}>
            <h3>New Job Card</h3>
            <div className="form-grid">
              <input name="customer_name" placeholder="Customer Name" value={formData.customer_name} onChange={handleInputChange} required />
              <input name="contact" placeholder="Mobile Number" value={formData.contact} onChange={handleInputChange} required />
              <input name="device_model" placeholder="Device Model (e.g. iPhone 13)" value={formData.device_model} onChange={handleInputChange} required />
              <input name="total_amount" type="number" placeholder="Estimated Cost" value={formData.total_amount} onChange={handleInputChange} required />
              <textarea name="problem" placeholder="Describe the Problem" value={formData.problem} onChange={handleInputChange} required></textarea>
            </div>
            <button type="submit" className="btn-submit">Save Repair Entry</button>
          </form>
        </section>
		
		<section className="client-section">
  <div className="card">
    <h3>Add New Client</h3>
    <form onSubmit={handleClientSubmit} className="form-grid">
      <input placeholder="First Name" value={clientForm.firstname} onChange={(e)=>setClientForm({...clientForm, firstname: e.target.value})} required />
      <input placeholder="Last Name" value={clientForm.lastname} onChange={(e)=>setClientForm({...clientForm, lastname: e.target.value})} required />
      <input placeholder="Mobile Number" value={clientForm.contact} onChange={(e)=>setClientForm({...clientForm, contact: e.target.value})} required />
      <input placeholder="Address" value={clientForm.address} onChange={(e)=>setClientForm({...clientForm, address: e.target.value})} />
      <button type="submit" className="btn-save">Save Client</button>
    </form>
  </div>

  <div className="table-container">
    <h3>Registered Clients</h3>
    <table className="repair-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact</th>
          <th>Address</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {clients.map(c => (
          <tr key={c._id}>
            <td>{c.firstname} {c.lastname}</td>
            <td>{c.contact}</td>
            <td>{c.address}</td>
            <td><button className="btn-edit">Create Job Sheet</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

        {/* Transaction Table */}
        <section className="table-section">
          <h3>Recent Transactions</h3>
          <table className="repair-table">
            <thead>
              <tr>
                <th>Tracking Code</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.tracking_code}</strong></td>
                  <td>{r.customer_name}<br/><small>{r.contact}</small></td>
                  <td>{r.device_model}</td>
                  <td>{r.problem}</td>
                  <td><span className={`status s-${r.status}`}>Pending</span></td>
                  <td>₹{r.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;