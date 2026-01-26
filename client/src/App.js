import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [mechForm, setMechForm] = useState({ name: '', contact: '', email: '', status: 1 });
  const [serviceForm, setServiceForm] = useState({ service: '', description: '', cost: '', status: 1 });
  const [productForm, setProductForm] = useState({ name: '', description: '', purchase_price: '', sell_price: '', quantity: 0, status: 1 });

  useEffect(() => {
    fetchClients();
    fetchMechanics();
    fetchServices();
    fetchProducts();
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

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  // --- SAVE HANDLER (Universal) ---
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
    } else if (type === 'inventory') {
      url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      body = productForm;
    }

    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    closeModal();
    // Refresh the correct list
    if (type === 'clients') fetchClients();
    else if (type === 'mechanics') fetchMechanics();
    else if (type === 'services') fetchServices();
    else if (type === 'inventory') fetchProducts();
  };

  const deleteItem = async (type, id) => {
    if (window.confirm(`Kya aap is ${type} ko delete karna chahte hain?`)) {
      const apiPath = type === 'inventory' ? 'products' : `${type}s`;
      await fetch(`${API_URL}/api/${apiPath}/${id}`, { method: 'DELETE' });
      
      if (type === 'client') fetchClients();
      else if (type === 'mechanic') fetchMechanics();
      else if (type === 'service') fetchServices();
      else if (type === 'inventory') fetchProducts();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setMechForm({ name: '', contact: '', email: '', status: 1 });
    setServiceForm({ service: '', description: '', cost: '', status: 1 });
    setProductForm({ name: '', description: '', purchase_price: '', sell_price: '', quantity: 0, status: 1 });
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
          <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>Inventory</li>
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
                    <td>{c.firstname}</td><td>{c.lastname}</td><td>{c.contact}</td><td>{c.address}</td>
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

        {/* INVENTORY VIEW */}
        {activeTab === 'inventory' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>Inventory / Spare Parts</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Spare Part</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Part Name</th><th>Description</th><th>Buy Price</th><th>Sell Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.description}</td>
                    <td>₹{p.purchase_price}</td>
                    <td>₹{p.sell_price}</td>
                    <td>
                      <span className={p.quantity < 5 ? 'stock-low' : 'stock-ok'}>
                        {p.quantity} Units
                      </span>
                    </td>
                    <td className="action-btns">
                      <button className="btn-edit" onClick={() => {setEditingId(p._id); setProductForm(p); setShowModal(true);}}>Edit</button>
                      <button className="btn-del" onClick={() => deleteItem('inventory', p._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Similar sections for Mechanics and Services... (keeping them as per previous update) */}
        {activeTab === 'mechanics' && (
           <div className="tab-view">
             <div className="view-header"><h2>Mechanics</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ New Mechanic</button></div>
             <table className="custom-table">
               <thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
               <tbody>
                 {mechanics.map(m => (
                   <tr key={m._id}>
                     <td>{m.name}</td><td>{m.contact}</td><td>{m.email}</td>
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

        {activeTab === 'services' && (
           <div className="tab-view">
             <div className="view-header"><h2>Service Rates</h2><button className="btn-primary" onClick={() => setShowModal(true)}>+ New Service</button></div>
             <table className="custom-table">
               <thead><tr><th>Service</th><th>Description</th><th>Cost</th><th>Actions</th></tr></thead>
               <tbody>
                 {services.map(s => (
                   <tr key={s._id}>
                     <td><strong>{s.service}</strong></td><td>{s.description}</td><td>₹{s.cost}</td>
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

        {activeTab === 'dashboard' && <h2>V-Tech Dashboard Overview</h2>}
      </main>

      {/* DYNAMIC MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit' : 'Add New'} {activeTab}</h3>
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
              {activeTab === 'inventory' && (
                <>
                  <input placeholder="Part Name (e.g. Battery iPhone 11)" value={productForm.name} onChange={(e)=>setProductForm({...productForm, name: e.target.value})} required />
                  <div className="form-row">
                    <input placeholder="Buy Price" type="number" value={productForm.purchase_price} onChange={(e)=>setProductForm({...productForm, purchase_price: e.target.value})} required />
                    <input placeholder="Sell Price" type="number" value={productForm.sell_price} onChange={(e)=>setProductForm({...productForm, sell_price: e.target.value})} required />
                  </div>
                  <input placeholder="Stock Quantity" type="number" value={productForm.quantity} onChange={(e)=>setProductForm({...productForm, quantity: e.target.value})} required />
                  <textarea placeholder="Part Description" value={productForm.description} onChange={(e)=>setProductForm({...productForm, description: e.target.value})}></textarea>
                </>
              )}
              {activeTab === 'mechanics' && (
                <>
                  <input placeholder="Full Name" value={mechForm.name} onChange={(e)=>setMechForm({...mechForm, name: e.target.value})} required />
                  <input placeholder="Contact" value={mechForm.contact} onChange={(e)=>setMechForm({...mechForm, contact: e.target.value})} required />
                  <input placeholder="Email" value={mechForm.email} onChange={(e)=>setMechForm({...mechForm, email: e.target.value})} />
                </>
              )}
              {activeTab === 'services' && (
                <>
                  <input placeholder="Service Name" value={serviceForm.service} onChange={(e)=>setServiceForm({...serviceForm, service: e.target.value})} required />
                  <input placeholder="Cost" type="number" value={serviceForm.cost} onChange={(e)=>setServiceForm({...serviceForm, cost: e.target.value})} required />
                  <textarea placeholder="Description" value={serviceForm.description} onChange={(e)=>setServiceForm({...serviceForm, description: e.target.value})}></textarea>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
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