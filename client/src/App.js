import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [mechForm, setMechForm] = useState({ name: '', contact: '', email: '', status: 1 });
  const [serviceForm, setServiceForm] = useState({ service: '', description: '', cost: '', status: 1 });
  const [productForm, setProductForm] = useState({ name: '', description: '', purchase_price: '', sell_price: '' });
  const [stockUpdate, setStockUpdate] = useState({ productId: '', quantity: '', type: 'IN', remarks: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetch(`${API_URL}/api/clients`).then(res => res.json()).then(setClients).catch(err => console.log(err));
    fetch(`${API_URL}/api/mechanics`).then(res => res.json()).then(setMechanics).catch(err => console.log(err));
    fetch(`${API_URL}/api/services`).then(res => res.json()).then(setServices).catch(err => console.log(err));
    fetch(`${API_URL}/api/products`).then(res => res.json()).then(setProducts).catch(err => console.log(err));
  };

  // --- UNIVERSAL SAVE HANDLER ---
  const handleSave = async (e) => {
    e.preventDefault();
    let url = "";
    let body = {};

    if (activeTab === 'clients') {
      url = editingId ? `${API_URL}/api/clients/${editingId}` : `${API_URL}/api/clients`;
      body = clientForm;
    } else if (activeTab === 'mechanics') {
      url = editingId ? `${API_URL}/api/mechanics/${editingId}` : `${API_URL}/api/mechanics`;
      body = mechForm;
    } else if (activeTab === 'services') {
      url = editingId ? `${API_URL}/api/services/${editingId}` : `${API_URL}/api/services`;
      body = serviceForm;
    } else if (activeTab === 'inventory') {
      url = `${API_URL}/api/products`;
      body = productForm;
    }

    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    closeModal();
    fetchAllData();
  };

  // --- STOCK UPDATE HANDLER ---
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/inventory/update-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockUpdate)
    });
    setShowStockModal(false);
    setStockUpdate({ productId: '', quantity: '', type: 'IN', remarks: '' });
    fetchAllData();
  };

  const deleteItem = async (type, id) => {
    if (window.confirm(`Kya aap ise delete karna chahte hain?`)) {
      const path = type === 'inventory' ? 'products' : `${type}s`;
      await fetch(`${API_URL}/api/${path}/${id}`, { method: 'DELETE' });
      fetchAllData();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setMechForm({ name: '', contact: '', email: '', status: 1 });
    setServiceForm({ service: '', description: '', cost: '', status: 1 });
    setProductForm({ name: '', description: '', purchase_price: '', sell_price: '' });
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="logo"><h2>V-TECH</h2><p>Admin Panel</p></div>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>Clients</li>
          <li className={activeTab === 'mechanics' ? 'active' : ''} onClick={() => setActiveTab('mechanics')}>Mechanics</li>
          <li className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Services</li>
          <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>Inventory</li>
          <li>Job Sheets</li>
        </ul>
      </nav>

      <main className="main-content">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="card"><h3>{clients.length}</h3><p>Total Clients</p></div>
            <div className="card"><h3>{products.length}</h3><p>Products Registered</p></div>
            <div className="card"><h3>{mechanics.filter(m => m.status === 1).length}</h3><p>Active Mechanics</p></div>
          </div>
        )}

        {/* CLIENTS VIEW */}
        {activeTab === 'clients' && (
          <div className="tab-view">
            <div className="view-header"><h2>Clients</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ New Client</button></div>
            <table className="custom-table">
              <thead><tr><th>First Name</th><th>Last Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr></thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c._id}><td>{c.firstname}</td><td>{c.lastname}</td><td>{c.contact}</td><td>{c.address}</td>
                  <td><button className="btn-edit" onClick={() => {setEditingId(c._id); setClientForm(c); setShowModal(true);}}>Edit</button>
                  <button className="btn-del" onClick={() => deleteItem('client', c._id)}>Del</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MECHANICS VIEW */}
        {activeTab === 'mechanics' && (
          <div className="tab-view">
            <div className="view-header"><h2>Mechanics</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ New Mechanic</button></div>
            <table className="custom-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {mechanics.map(m => (
                  <tr key={m._id}><td>{m.name}</td><td>{m.contact}</td><td>{m.status === 1 ? 'Active' : 'Inactive'}</td>
                  <td><button className="btn-edit" onClick={() => {setEditingId(m._id); setMechForm(m); setShowModal(true);}}>Edit</button>
                  <button className="btn-del" onClick={() => deleteItem('mechanic', m._id)}>Del</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SERVICES VIEW */}
        {activeTab === 'services' && (
          <div className="tab-view">
            <div className="view-header"><h2>Services</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ New Service</button></div>
            <table className="custom-table">
              <thead><tr><th>Service</th><th>Cost</th><th>Actions</th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s._id}><td>{s.service}</td><td>₹{s.cost}</td>
                  <td><button className="btn-edit" onClick={() => {setEditingId(s._id); setServiceForm(s); setShowModal(true);}}>Edit</button>
                  <button className="btn-del" onClick={() => deleteItem('service', s._id)}>Del</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVENTORY VIEW */}
        {activeTab === 'inventory' && (
          <div className="tab-view">
            <div className="view-header"><h2>Inventory</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ Register Product</button></div>
            <table className="custom-table">
              <thead><tr><th>Product Name</th><th>Stock</th><th>Buy Price</th><th>Sell Price</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td style={{color: p.current_stock < 5 ? 'red' : 'inherit'}}>{p.current_stock} Qty</td>
                    <td>₹{p.purchase_price}</td><td>₹{p.sell_price}</td>
                    <td><button className="btn-edit" onClick={() => { setStockUpdate({...stockUpdate, productId: p._id}); setShowStockModal(true); }}>Stock In/Out</button>
                    <button className="btn-del" onClick={() => deleteItem('inventory', p._id)}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DYNAMIC MODAL (For Registry) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit' : 'Add New'} {activeTab}</h3>
            <form onSubmit={handleSave}>
              {activeTab === 'clients' && (
                <>
                  <input placeholder="First Name" value={clientForm.firstname} onChange={e => setClientForm({...clientForm, firstname: e.target.value})} required />
                  <input placeholder="Last Name" value={clientForm.lastname} onChange={e => setClientForm({...clientForm, lastname: e.target.value})} required />
                  <input placeholder="Contact" value={clientForm.contact} onChange={e => setClientForm({...clientForm, contact: e.target.value})} required />
                  <textarea placeholder="Address" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} />
                </>
              )}
              {activeTab === 'mechanics' && (
                <>
                  <input placeholder="Full Name" value={mechForm.name} onChange={e => setMechForm({...mechForm, name: e.target.value})} required />
                  <input placeholder="Contact" value={mechForm.contact} onChange={e => setMechForm({...mechForm, contact: e.target.value})} required />
                  <select value={mechForm.status} onChange={e => setMechForm({...mechForm, status: parseInt(e.target.value)})}>
                    <option value={1}>Active</option><option value={0}>Inactive</option>
                  </select>
                </>
              )}
              {activeTab === 'services' && (
                <>
                  <input placeholder="Service Name" value={serviceForm.service} onChange={e => setServiceForm({...serviceForm, service: e.target.value})} required />
                  <input placeholder="Cost" type="number" value={serviceForm.cost} onChange={e => setServiceForm({...serviceForm, cost: e.target.value})} required />
                </>
              )}
              {activeTab === 'inventory' && (
                <>
                  <input placeholder="Product Name" onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  <input placeholder="Purchase Price" type="number" onChange={e => setProductForm({...productForm, purchase_price: e.target.value})} />
                  <input placeholder="Selling Price" type="number" onChange={e => setProductForm({...productForm, sell_price: e.target.value})} />
                  <textarea placeholder="Description" onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </>
              )}
              <button type="submit" className="btn-save">Save</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* STOCK UPDATE MODAL */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Stock Level</h3>
            <form onSubmit={handleUpdateStock}>
              <select onChange={e => setStockUpdate({...stockUpdate, type: e.target.value})}>
                <option value="IN">Stock IN (Purchase)</option>
                <option value="OUT">Stock OUT (Loss/Sale)</option>
              </select>
              <input placeholder="Quantity" type="number" onChange={e => setStockUpdate({...stockUpdate, quantity: e.target.value})} required />
              <input placeholder="Remarks" onChange={e => setStockUpdate({...stockUpdate, remarks: e.target.value})} />
              <button type="submit" className="btn-save">Update</button>
              <button type="button" onClick={() => setShowStockModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;