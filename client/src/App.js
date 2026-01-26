import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Navigation ke liye
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false); // Add/Edit Popup ke liye
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await fetch(`${API_URL}/api/clients`);
    const data = await res.json();
    setClients(data);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/clients/${editingId}` : `${API_URL}/api/clients`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientForm)
    });

    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setShowModal(false);
    setEditingId(null);
    fetchClients();
  };

  const deleteClient = async (id) => {
    if (window.confirm("Kya aap is client ko delete karna chahte hain?")) {
      await fetch(`${API_URL}/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    }
  };

  const startEdit = (client) => {
    setEditingId(client._id);
    setClientForm(client);
    setShowModal(true);
  };

  return (
    <div className="app-layout">
      {/* LEFT NAVIGATION */}
      <nav className="sidebar">
        <div className="logo-section">
          <h2>V-TECH</h2>
          <p>Repair Management</p>
        </div>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <i className="icon">📊</i> Dashboard
          </li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
            <i className="icon">👤</i> Clients
          </li>
          <li><i className="icon">🛠️</i> Services</li>
          <li><i className="icon">📦</i> Inventory</li>
        </ul>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {activeTab === 'clients' && (
          <div className="client-container">
            <div className="content-header">
              <h2>Client Management</h2>
              <button className="btn-add" onClick={() => { setShowModal(true); setEditingId(null); }}>
                + Add New Client
              </button>
            </div>

            <div className="table-card">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.firstname} {c.lastname}</strong></td>
                      <td>{c.contact}</td>
                      <td>{c.address || 'N/A'}</td>
                      <td>{new Date(c.date_created).toLocaleDateString()}</td>
                      <td className="actions">
                        <button className="btn-edit-sm" onClick={() => startEdit(c)}>Edit</button>
                        <button className="btn-delete-sm" onClick={() => deleteClient(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL / POPUP FOR ADD/EDIT */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editingId ? "Edit Client" : "Add New Client"}</h3>
              <form onSubmit={handleSaveClient}>
                <div className="form-row">
                  <input placeholder="First Name" value={clientForm.firstname} onChange={(e)=>setClientForm({...clientForm, firstname: e.target.value})} required />
                  <input placeholder="Last Name" value={clientForm.lastname} onChange={(e)=>setClientForm({...clientForm, lastname: e.target.value})} required />
                </div>
                <input placeholder="Contact Number" value={clientForm.contact} onChange={(e)=>setClientForm({...clientForm, contact: e.target.value})} required />
                <textarea placeholder="Address" value={clientForm.address} onChange={(e)=>setClientForm({...clientForm, address: e.target.value})}></textarea>
                <div className="modal-btns">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-save-main">Save Client</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;