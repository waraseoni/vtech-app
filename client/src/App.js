import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState('clients'); // Navigation State
  const [clients, setClients] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [mechForm, setMechForm] = useState({ name: '', contact: '', email: '', status: 1 });

  useEffect(() => {
    fetchClients();
    fetchMechanics();
  }, []);

  // --- API CALLS ---
  const fetchClients = async () => {
    const res = await fetch(`${API_URL}/api/clients`);
    const data = await res.json();
    setClients(data);
  };

  const fetchMechanics = async () => {
    const res = await fetch(`${API_URL}/api/mechanics`);
    const data = await res.json();
    setMechanics(data);
  };

  // --- SAVE HANDLERS ---
  const handleSaveClient = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/clients/${editingId}` : `${API_URL}/api/clients`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientForm)
    });
    closeModal();
    fetchClients();
  };

  const handleSaveMech = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/mechanics/${editingId}` : `${API_URL}/api/mechanics`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mechForm)
    });
    closeModal();
    fetchMechanics();
  };

  // --- DELETE HANDLERS ---
  const deleteItem = async (type, id) => {
    if (window.confirm(`Kya aap is ${type} ko delete karna chahte hain?`)) {
      await fetch(`${API_URL}/api/${type}s/${id}`, { method: 'DELETE' });
      type === 'client' ? fetchClients() : fetchMechanics();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setMechForm({ name: '', contact: '', email: '', status: 1 });
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR NAVIGATION */}
      <nav className="sidebar">
        <div className="logo">
          <h2>V-TECH</h2>
          <p>Repair Shop Panel</p>
        </div>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>Clients</li>
          <li className={activeTab === 'mechanics' ? 'active' : ''} onClick={() => setActiveTab('mechanics')}>Mechanics</li>
          <li>Job Sheets</li>
          <li>Inventory</li>
        </ul>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>Client Management</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c._id}>
                    <td>{c.firstname} {c.lastname}</td>
                    <td>{c.contact}</td>
                    <td>{c.address || 'N/A'}</td>
                    <td>
                      <button className="btn-edit" onClick={() => {setEditingId(c._id); setClientForm(c); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('client', c._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MECHANICS TAB */}
        {activeTab === 'mechanics' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>Mechanic List</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Mechanic</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Name</th><th>Contact</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {mechanics.map(m => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.contact}</td>
                    <td>{m.email}</td>
                    <td><span className={m.status === 1 ? 'status-active' : 'status-inactive'}>{m.status === 1 ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn-edit" onClick={() => {setEditingId(m._id); setMechForm(m); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('mechanic', m._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'dashboard' && <h2>Welcome to Dashboard</h2>}
      </main>

      {/* DYNAMIC MODAL FOR BOTH TABS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit' : 'Add New'} {activeTab === 'clients' ? 'Client' : 'Mechanic'}</h3>
            <form onSubmit={activeTab === 'clients' ? handleSaveClient : handleSaveMech}>
              {activeTab === 'clients' ? (
                <>
                  <input placeholder="First Name" value={clientForm.firstname} onChange={(e)=>setClientForm({...clientForm, firstname: e.target.value})} required />
                  <input placeholder="Last Name" value={clientForm.lastname} onChange={(e)=>setClientForm({...clientForm, lastname: e.target.value})} required />
                  <input placeholder="Contact" value={clientForm.contact} onChange={(e)=>setClientForm({...clientForm, contact: e.target.value})} required />
                  <textarea placeholder="Address" value={clientForm.address} onChange={(e)=>setClientForm({...clientForm, address: e.target.value})}></textarea>
                </>
              ) : (
                <>
                  <input placeholder="Full Name" value={mechForm.name} onChange={(e)=>setMechForm({...mechForm, name: e.target.value})} required />
                  <input placeholder="Contact" value={mechForm.contact} onChange={(e)=>setMechForm({...mechForm, contact: e.target.value})} required />
                  <input placeholder="Email" type="email" value={mechForm.email} onChange={(e)=>setMechForm({...mechForm, email: e.target.value})} required />
                  <select value={mechForm.status} onChange={(e)=>setMechForm({...mechForm, status: parseInt(e.target.value)})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </>
              )}
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Save Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;