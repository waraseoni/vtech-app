import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [mechForm, setMechForm] = useState({ name: '', contact: '', email: '', status: 1 });
  const [serviceForm, setServiceForm] = useState({ service: '', description: '', cost: '', status: 1 });

  useEffect(() => {
    fetchClients();
    fetchMechanics();
    fetchServices();
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

  const fetchServices = async () => {
    const res = await fetch(`${API_URL}/api/services`);
    const data = await res.json();
    setServices(data);
  };

  // --- SAVE HANDLERS ---
  const handleSave = async (e) => {
    e.preventDefault();
    let url = "";
    let body = {};
    let type = activeTab;

    if (type === 'clients') {
      url = editingId ? `${API_URL}/api/clients/${editingId}` : `${API_URL}/api/clients`;
      body = clientForm;
    } else if (type === 'mechanics') {
      url = editingId ? `${API_URL}/api/mechanics/${editingId}` : `${API_URL}/api/mechanics`;
      body = mechForm;
    } else if (type === 'services') {
      url = editingId ? `${API_URL}/api/services/${editingId}` : `${API_URL}/api/services`;
      body = serviceForm;
    }

    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    closeModal();
    if (type === 'clients') fetchClients();
    else if (type === 'mechanics') fetchMechanics();
    else if (type === 'services') fetchServices();
  };

  const deleteItem = async (type, id) => {
    if (window.confirm(`Kya aap is ${type} ko delete karna chahte hain?`)) {
      await fetch(`${API_URL}/api/${type}s/${id}`, { method: 'DELETE' });
      if (type === 'client') fetchClients();
      else if (type === 'mechanic') fetchMechanics();
      else fetchServices();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setMechForm({ name: '', contact: '', email: '', status: 1 });
    setServiceForm({ service: '', description: '', cost: '', status: 1 });
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="logo"><h2>V-TECH</h2><p>Admin Panel</p></div>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>Clients</li>
          <li className={activeTab === 'mechanics' ? 'active' : ''} onClick={() => setActiveTab('mechanics')}>Mechanics</li>
          <li className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Services</li>
          <li>Job Sheets</li>
        </ul>
      </nav>

      <main className="main-content">
        {/* CLIENTS VIEW */}
        {activeTab === 'clients' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>All Clients</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Client</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>First Name</th><th>Last Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c._id}>
                    <td>{c.firstname}</td>
                    <td>{c.lastname}</td>
                    <td>{c.contact}</td>
                    <td>{c.address}</td>
                    <td className="action-btns">
                      <button className="btn-edit" onClick={() => {setEditingId(c._id); setClientForm(c); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('client', c._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MECHANICS VIEW */}
        {activeTab === 'mechanics' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>All Mechanics</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Mechanic</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Full Name</th><th>Contact</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {mechanics.map(m => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.contact}</td>
                    <td>{m.email}</td>
                    <td><span className={m.status === 1 ? 'status-active' : 'status-inactive'}>{m.status === 1 ? 'Active' : 'Inactive'}</span></td>
                    <td className="action-btns">
                      <button className="btn-edit" onClick={() => {setEditingId(m._id); setMechForm(m); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('mechanic', m._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SERVICES VIEW */}
        {activeTab === 'services' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>Service Rates</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Service</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Service Name</th><th>Description</th><th>Cost</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s._id}>
                    <td><strong>{s.service}</strong></td>
                    <td>{s.description}</td>
                    <td>₹{s.cost}</td>
                    <td><span className={s.status === 1 ? 'status-active' : 'status-inactive'}>{s.status === 1 ? 'Active' : 'Inactive'}</span></td>
                    <td className="action-btns">
                      <button className="btn-edit" onClick={() => {setEditingId(s._id); setServiceForm(s); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('service', s._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'dashboard' && <h2>Welcome to V-Tech Dashboard</h2>}
      </main>

      {/* DYNAMIC MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit' : 'Add New'} {activeTab.slice(0,-1)}</h3>
            <form onSubmit={handleSave}>
              {activeTab === 'clients' && (
                <>
                  <div className="form-row">
                    <input placeholder="First Name" value={clientForm.firstname} onChange={(e)=>setClientForm({...clientForm, firstname: e.target.value})} required />
                    <input placeholder="Last Name" value={clientForm.lastname} onChange={(e)=>setClientForm({...clientForm, lastname: e.target.value})} required />
                  </div>
                  <input placeholder="Contact" value={clientForm.contact} onChange={(e)=>setClientForm({...clientForm, contact: e.target.value})} required />
                  <textarea placeholder="Address" value={clientForm.address} onChange={(e)=>setClientForm({...clientForm, address: e.target.value})}></textarea>
                </>
              )}
              {activeTab === 'mechanics' && (
                <>
                  <input placeholder="Full Name" value={mechForm.name} onChange={(e)=>setMechForm({...mechForm, name: e.target.value})} required />
                  <input placeholder="Contact" value={mechForm.contact} onChange={(e)=>setMechForm({...mechForm, contact: e.target.value})} required />
                  <input placeholder="Email" type="email" value={mechForm.email} onChange={(e)=>setMechForm({...mechForm, email: e.target.value})} />
                  <select value={mechForm.status} onChange={(e)=>setMechForm({...mechForm, status: parseInt(e.target.value)})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </>
              )}
              {activeTab === 'services' && (
                <>
                  <input placeholder="Service Name" value={serviceForm.service} onChange={(e)=>setServiceForm({...serviceForm, service: e.target.value})} required />
                  <input placeholder="Cost (₹)" type="number" value={serviceForm.cost} onChange={(e)=>setServiceForm({...serviceForm, cost: e.target.value})} required />
                  <textarea placeholder="Description" value={serviceForm.description} onChange={(e)=>setServiceForm({...serviceForm, description: e.target.value})}></textarea>
                  <select value={serviceForm.status} onChange={(e)=>setServiceForm({...serviceForm, status: parseInt(e.target.value)})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;