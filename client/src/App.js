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
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [productForm, setProductForm] = useState({ name: '', description: '', purchase_price: '', sell_price: '' });
  const [stockUpdate, setStockUpdate] = useState({ productId: '', quantity: '', type: 'IN', remarks: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetch(`${API_URL}/api/clients`).then(r => r.json()).then(setClients);
    fetch(`${API_URL}/api/mechanics`).then(r => r.json()).then(setMechanics);
    fetch(`${API_URL}/api/services`).then(r => r.json()).then(setServices);
    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm)
    });
    setShowModal(false);
    fetchAll();
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/inventory/update-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockUpdate)
    });
    setShowStockModal(false);
    setStockUpdate({ productId: '', quantity: '', type: 'IN', remarks: '' });
    fetchAll();
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="logo"><h2>V-TECH</h2></div>
        <ul>
          <li onClick={() => setActiveTab('clients')}>Clients</li>
          <li onClick={() => setActiveTab('mechanics')}>Mechanics</li>
          <li onClick={() => setActiveTab('services')}>Services</li>
          <li onClick={() => setActiveTab('inventory')}>Inventory (Stock)</li>
        </ul>
      </nav>

      <main className="main-content">
        {activeTab === 'inventory' && (
          <div className="tab-view">
            <div className="view-header">
              <h2>Product Registry & Stock</h2>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Register New Product</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr><th>Product Name</th><th>Stock</th><th>Buy Price</th><th>Sell Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td className={p.current_stock < 5 ? 'stock-low' : ''}>{p.current_stock} Qty</td>
                    <td>₹{p.purchase_price}</td>
                    <td>₹{p.sell_price}</td>
                    <td>
                      <button className="btn-edit" onClick={() => { 
                        setStockUpdate({...stockUpdate, productId: p._id}); 
                        setShowStockModal(true); 
                      }}>Update Stock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL: Register New Product */}
      {showModal && activeTab === 'inventory' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Register New Product</h3>
            <form onSubmit={handleSaveProduct}>
              <input placeholder="Name" onChange={e => setProductForm({...productForm, name: e.target.value})} required />
              <input placeholder="Buy Price" type="number" onChange={e => setProductForm({...productForm, purchase_price: e.target.value})} />
              <input placeholder="Sell Price" type="number" onChange={e => setProductForm({...productForm, sell_price: e.target.value})} />
              <textarea placeholder="Description" onChange={e => setProductForm({...productForm, description: e.target.value})}></textarea>
              <button type="submit" className="btn-save">Register</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Update Stock (In/Out) */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Stock (Purchase/Sale)</h3>
            <form onSubmit={handleUpdateStock}>
              <select onChange={e => setStockUpdate({...stockUpdate, type: e.target.value})}>
                <option value="IN">Stock IN (Purchase)</option>
                <option value="OUT">Stock OUT (Loss/Sale)</option>
              </select>
              <input placeholder="Quantity" type="number" onChange={e => setStockUpdate({...stockUpdate, quantity: e.target.value})} required />
              <input placeholder="Remarks (e.g. New Batch)" onChange={e => setStockUpdate({...stockUpdate, remarks: e.target.value})} />
              <button type="submit" className="btn-save">Update Now</button>
              <button type="button" onClick={() => setShowStockModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;