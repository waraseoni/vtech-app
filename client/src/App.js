import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = "http://localhost:5000";

// Login Component (Inline)
const Login = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.success) {
          localStorage.setItem('vtech_token', response.data.token);
          localStorage.setItem('vtech_user', JSON.stringify(response.data.user));
          setToken(response.data.token);
          setUser(response.data.user);
        }
      } else {
        // Register
        const response = await axios.post(`${API_URL}/api/auth/register`, formData);
        if (response.data.success) {
          alert('Registration successful! Please login.');
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>V-TECH WORKSHOP</h2>
          <p>{isLogin ? 'Login to continue' : 'Create new account'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  // Auth States
  const [token, setToken] = useState(localStorage.getItem('vtech_token'));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('vtech_user');
    return userData ? JSON.parse(userData) : null;
  });

  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data States
  const [clients, setClients] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [clientForm, setClientForm] = useState({ firstname: '', lastname: '', contact: '', address: '' });
  const [mechForm, setMechForm] = useState({ name: '', contact: '', email: '', status: 1 });
  const [serviceForm, setServiceForm] = useState({ service: '', description: '', cost: '', status: 1 });
  const [productForm, setProductForm] = useState({ name: '', description: '', purchase_price: '', sell_price: '' });
  const [stockUpdate, setStockUpdate] = useState({ productId: '', quantity: '', type: 'IN', remarks: '' });
  
  // Updated Job Form with new fields
  const [jobForm, setJobForm] = useState({ 
    client: '', 
    mechanic: '', 
    item_model: '', 
    fault: '', 
    status: 'Pending', 
    remarks: '', 
    total_amount: 0 
  });

  // Axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const fetchAllData = () => {
    axiosInstance.get('/api/clients')
      .then(res => setClients(res.data))
      .catch(err => console.log(err));

    axiosInstance.get('/api/mechanics')
      .then(res => setMechanics(res.data))
      .catch(err => console.log(err));

    axiosInstance.get('/api/services')
      .then(res => setServices(res.data))
      .catch(err => console.log(err));

    axiosInstance.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));

    axiosInstance.get('/api/jobsheets')
      .then(res => setJobs(res.data))
      .catch(err => console.log(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('vtech_token');
    localStorage.removeItem('vtech_user');
    setToken(null);
    setUser(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let url = "";
    let body = {};
    let method = editingId ? 'put' : 'post';

    try {
      if (activeTab === 'clients') {
        url = editingId ? `/api/clients/${editingId}` : `/api/clients`;
        body = clientForm;
      } else if (activeTab === 'mechanics') {
        url = editingId ? `/api/mechanics/${editingId}` : `/api/mechanics`;
        body = mechForm;
      } else if (activeTab === 'services') {
        url = editingId ? `/api/services/${editingId}` : `/api/services`;
        body = serviceForm;
      } else if (activeTab === 'inventory') {
        url = `/api/products`;
        body = productForm;
        method = 'post';
      } else if (activeTab === 'jobsheets') {
        if (editingId) {
          // Edit existing job
          url = `/api/jobsheets/${editingId}`;
          body = jobForm;
          method = 'put';
        } else {
          // Create new job
          url = `/api/jobsheets`;
          // Backend को ये नए fields भेज रहे हैं
          body = {
            clientId: jobForm.client,
            mechanicId: jobForm.mechanic,
            item_model: jobForm.item_model,
            fault: jobForm.fault,
            status: jobForm.status,
            remarks: jobForm.remarks,
            total_amount: jobForm.total_amount
          };
          method = 'post';
        }
      }

      await axiosInstance[method](url, body);
      closeModal();
      fetchAllData();
    } catch (error) {
      console.error('Save error:', error);
      alert(error.response?.data?.message || 'Save failed!');
    }
  };

  const handlePrint = (job) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Job Sheet - ${job.jobId}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .invoice-box { border: 1px solid #eee; padding: 30px; max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-size: 20px; margin-top: 20px; font-weight: bold; }
            .section { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div><h1>V-TECH WORKSHOP</h1><p>Device Repair Specialists</p></div>
              <div><p><strong>Job ID:</strong> ${job.jobId}</p><p><strong>Date:</strong> ${new Date(job.date).toLocaleDateString()}</p></div>
            </div>
            
            <div class="section">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${job.client?.firstname} ${job.client?.lastname}</p>
              <p><strong>Contact:</strong> ${job.client?.contact}</p>
              <p><strong>Address:</strong> ${job.client?.address}</p>
            </div>

            <div class="section">
              <h3>Device Details</h3>
              <p><strong>Device/Model:</strong> ${job.item_model || 'Not specified'}</p>
              <p><strong>Fault Reported:</strong> ${job.fault || 'Not specified'}</p>
              <p><strong>Assigned Mechanic:</strong> ${job.mechanic?.name || 'Not assigned'}</p>
            </div>

            <div class="section">
              <h3>Service Details</h3>
              <table>
                <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                <tbody>
                  ${job.service ? `<tr><td>Service: ${job.service.service}</td><td>₹${job.service.cost}</td></tr>` : ''}
                  ${job.product ? `<tr><td>Product: ${job.product.name}</td><td>Included</td></tr>` : ''}
                  ${job.remarks ? `<tr><td><strong>Remarks:</strong> ${job.remarks}</td><td></td></tr>` : ''}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>Job Status</h3>
              <p><strong>Status:</strong> <span style="color: ${job.status === 'Delivered' ? 'green' : job.status === 'Processing' ? 'orange' : 'red'}">${job.status}</span></p>
              <p><strong>Job Date:</strong> ${new Date(job.date).toLocaleDateString()}</p>
            </div>

            <div class="total">Grand Total: ₹${job.total_amount}</div>
            
            <div style="margin-top: 50px; border-top: 1px solid #333; padding-top: 20px;">
              <p><strong>Customer Signature:</strong> _________________________</p>
              <p><strong>Mechanic Signature:</strong> _________________________</p>
              <p style="text-align: center; margin-top: 30px;">Thank you for choosing V-TECH!</p>
              <p style="text-align: center; font-size: 12px; color: #666;">This is a computer generated invoice</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/inventory/update-stock', stockUpdate);
      setShowStockModal(false);
      setStockUpdate({ productId: '', quantity: '', type: 'IN', remarks: '' });
      fetchAllData();
    } catch (error) {
      console.error('Stock update error:', error);
    }
  };

  const deleteItem = async (type, id) => {
    if (window.confirm(`क्या आप इसे डिलीट करना चाहते हैं?`)) {
      let path = '';
      if (type === 'inventory') {
        path = 'products';
      } else if (type === 'job') {
        path = 'jobsheets';
      } else {
        path = `${type}s`;
      }
      
      try {
        await axiosInstance.delete(`/api/${path}/${id}`);
        fetchAllData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setClientForm({ firstname: '', lastname: '', contact: '', address: '' });
    setMechForm({ name: '', contact: '', email: '', status: 1 });
    setServiceForm({ service: '', description: '', cost: '', status: 1 });
    setProductForm({ name: '', description: '', purchase_price: '', sell_price: '' });
    setJobForm({ 
      client: '', 
      mechanic: '', 
      item_model: '', 
      fault: '', 
      status: 'Pending', 
      remarks: '', 
      total_amount: 0 
    });
  };

  // If no token, show login page
  if (!token) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  return (
    <div className="app-layout">
      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
        <div className="mobile-logo">V-TECH</div>
        <div className="user-info-mobile">
          <span>{user?.name}</span>
          <button className="logout-btn-mobile" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <h2>V-TECH</h2>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
          <div className="user-info">
            <p>Welcome, <strong>{user?.name}</strong></p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Staff'}</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => handleTabChange('dashboard')}>
            <span className="icon">📊</span> Dashboard
          </li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => handleTabChange('clients')}>
            <span className="icon">👥</span> Clients
          </li>
          <li className={activeTab === 'mechanics' ? 'active' : ''} onClick={() => handleTabChange('mechanics')}>
            <span className="icon">🔧</span> Mechanics
          </li>
          <li className={activeTab === 'services' ? 'active' : ''} onClick={() => handleTabChange('services')}>
            <span className="icon">🛠️</span> Services
          </li>
          <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => handleTabChange('inventory')}>
            <span className="icon">📦</span> Inventory
          </li>
          <li className={activeTab === 'jobsheets' ? 'active' : ''} onClick={() => handleTabChange('jobsheets')}>
            <span className="icon">📄</span> Job Sheets
          </li>
        </ul>
      </nav>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="main-content">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="card">
              <h3>{clients.length}</h3>
              <p>Total Clients</p>
            </div>
            <div className="card">
              <h3>{products.length}</h3>
              <p>Products</p>
            </div>
            <div className="card">
              <h3>{mechanics.filter(m => m.status === 1).length}</h3>
              <p>Active Staff</p>
            </div>
            <div className="card">
              <h3>{jobs.length}</h3>
              <p>Total Jobs</p>
            </div>
            <div className="card">
              <h3>{services.length}</h3>
              <p>Services</p>
            </div>
            <div className="card">
              <h3>₹{jobs.reduce((sum, job) => sum + (parseFloat(job.total_amount) || 0), 0)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        )}

        {/* TABLES AREA */}
        <div className="table-responsive">
          {activeTab === 'clients' && (
            <div className="tab-view">
              <div className="view-header">
                <h2>Clients</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ New</button>
              </div>
              <table className="custom-table">
                <thead><tr><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr></thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c._id}>
                      <td>{c.firstname} {c.lastname}</td>
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

          {activeTab === 'mechanics' && (
            <div className="tab-view">
              <div className="view-header">
                <h2>Mechanics</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ New</button>
              </div>
              <table className="custom-table">
                <thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {mechanics.map(m => (
                    <tr key={m._id}>
                      <td>{m.name}</td>
                      <td>{m.contact}</td>
                      <td><span className={`status-${m.status === 1 ? 'active' : 'inactive'}`}>{m.status === 1 ? 'Active' : 'Inactive'}</span></td>
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
              <div className="view-header">
                <h2>Services</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ New</button>
              </div>
              <table className="custom-table">
                <thead><tr><th>Service</th><th>Description</th><th>Cost</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s._id}>
                      <td>{s.service}</td>
                      <td>{s.description}</td>
                      <td>₹{s.cost}</td>
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

          {activeTab === 'inventory' && (
            <div className="tab-view">
              <div className="view-header">
                <h2>Inventory</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Register</button>
              </div>
              <table className="custom-table">
                <thead><tr><th>Part Name</th><th>Stock</th><th>Buy/Sell</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{color: p.current_stock < 5 ? 'red' : 'green', fontWeight:'bold'}}>{p.current_stock}</td>
                      <td>₹{p.purchase_price}/₹{p.sell_price}</td>
                      <td className="action-btns">
                        <button className="btn-edit" onClick={() => { setStockUpdate({...stockUpdate, productId: p._id}); setShowStockModal(true); }}>Stock</button>
                        <button className="btn-del" onClick={() => deleteItem('inventory', p._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'jobsheets' && (
            <div className="tab-view">
              <div className="view-header">
                <h2>Repair Jobs</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Job</button>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Client</th>
                    <th>Device Model</th>
                    <th>Fault</th>
                    <th>Mechanic</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j._id}>
                      <td>{j.jobId}</td>
                      <td>{j.client?.firstname} {j.client?.lastname}</td>
                      <td>{j.item_model || 'N/A'}</td>
                      <td>{j.fault || 'N/A'}</td>
                      <td>{j.mechanic?.name}</td>
                      <td>₹{j.total_amount}</td>
                      <td><span className={`status-${j.status?.toLowerCase()}`}>{j.status}</span></td>
                      <td className="action-btns">
                        <button className="btn-edit" onClick={() => {setEditingId(j._id); setJobForm(j); setShowModal(true);}}>Edit</button>
                        <button className="btn-print" onClick={() => handlePrint(j)}>Print</button>
                        <button className="btn-del" onClick={() => deleteItem('job', j._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit' : 'Add New'} {activeTab}</h3>
            <form onSubmit={handleSave}>
              {activeTab === 'clients' && (
                <div className="form-group">
                  <input placeholder="First Name" value={clientForm.firstname} onChange={e => setClientForm({...clientForm, firstname: e.target.value})} required />
                  <input placeholder="Last Name" value={clientForm.lastname} onChange={e => setClientForm({...clientForm, lastname: e.target.value})} required />
                  <input placeholder="Contact" value={clientForm.contact} onChange={e => setClientForm({...clientForm, contact: e.target.value})} required />
                  <textarea placeholder="Address" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} />
                </div>
              )}

              {activeTab === 'mechanics' && (
                <div className="form-group">
                  <input placeholder="Full Name" value={mechForm.name} onChange={e => setMechForm({...mechForm, name: e.target.value})} required />
                  <input placeholder="Contact" value={mechForm.contact} onChange={e => setMechForm({...mechForm, contact: e.target.value})} required />
                  <input placeholder="Email" value={mechForm.email} onChange={e => setMechForm({...mechForm, email: e.target.value})} />
                  <select value={mechForm.status} onChange={e => setMechForm({...mechForm, status: parseInt(e.target.value)})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="form-group">
                  <input placeholder="Service Name" value={serviceForm.service} onChange={e => setServiceForm({...serviceForm, service: e.target.value})} required />
                  <input placeholder="Cost" type="number" value={serviceForm.cost} onChange={e => setServiceForm({...serviceForm, cost: e.target.value})} required />
                  <textarea placeholder="Description" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="form-group">
                  <input placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  <input placeholder="Buy Price" type="number" value={productForm.purchase_price} onChange={e => setProductForm({...productForm, purchase_price: e.target.value})} />
                  <input placeholder="Sell Price" type="number" value={productForm.sell_price} onChange={e => setProductForm({...productForm, sell_price: e.target.value})} />
                  <textarea placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>
              )}

              {/* Updated Job Sheet Form with new fields */}
              {activeTab === 'jobsheets' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Client</label>
                    <select value={jobForm.client} onChange={e => setJobForm({...jobForm, client: e.target.value})} required>
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.firstname} {c.lastname}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Device / Item Model</label>
                    <input 
                      type="text" 
                      placeholder="e.g. iPhone 13 / HP Laptop" 
                      value={jobForm.item_model} 
                      onChange={e => setJobForm({...jobForm, item_model: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Fault Reported</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Screen Broken" 
                      value={jobForm.fault} 
                      onChange={e => setJobForm({...jobForm, fault: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Assign Mechanic</label>
                    <select value={jobForm.mechanic} onChange={e => setJobForm({...jobForm, mechanic: e.target.value})} required>
                      <option value="">-- Choose Mechanic --</option>
                      {mechanics.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Estimated Amount</label>
                    <input 
                      type="number" 
                      value={jobForm.total_amount} 
                      onChange={e => setJobForm({...jobForm, total_amount: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Remarks</label>
                    <textarea 
                      value={jobForm.remarks} 
                      onChange={e => setJobForm({...jobForm, remarks: e.target.value})} 
                      placeholder="Any extra details..."
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="modal-btns">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK UPDATE MODAL */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Stock</h3>
            <form onSubmit={handleUpdateStock}>
              <select value={stockUpdate.type} onChange={e => setStockUpdate({...stockUpdate, type: e.target.value})}>
                <option value="IN">Stock IN (Purchase)</option>
                <option value="OUT">Stock OUT (Loss/Sale)</option>
              </select>
              <input placeholder="Quantity" type="number" value={stockUpdate.quantity} onChange={e => setStockUpdate({...stockUpdate, quantity: e.target.value})} required />
              <input placeholder="Remarks" value={stockUpdate.remarks} onChange={e => setStockUpdate({...stockUpdate, remarks: e.target.value})} />
              <div className="modal-btns">
                <button type="submit" className="btn-save">Update</button>
                <button type="button" className="btn-cancel" onClick={() => setShowStockModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;