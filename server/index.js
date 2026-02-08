const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: ["https://vtech-app.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "VTECH_SUPER_SECRET_2026";

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vtech')
  .then(() => console.log("✅ V-Tech DB Connected Successfully"))
  .catch(err => console.error("❌ Connection Error:", err));

// --- SCHEMAS ---

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  date_created: { type: Date, default: Date.now }
}));

const Client = mongoose.model('Client', new mongoose.Schema({
  firstname: String,
  lastname: String,
  contact: { type: String, unique: true },
  address: String,
  date_created: { type: Date, default: Date.now }
}));

const Mechanic = mongoose.model('Mechanic', new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  email: String,
  status: { type: Number, default: 1 },
  date_created: { type: Date, default: Date.now }
}));

const Service = mongoose.model('Service', new mongoose.Schema({
  service: { type: String, required: true },
  description: String,
  cost: { type: Number, required: true },
  status: { type: Number, default: 1 },
  date_created: { type: Date, default: Date.now }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  purchase_price: Number,
  sell_price: Number,
  current_stock: { type: Number, default: 0 },
  date_created: { type: Date, default: Date.now }
}));

const StockLog = mongoose.model('StockLog', new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['IN', 'OUT'] },
  quantity: Number,
  remarks: String,
  date: { type: Date, default: Date.now }
}));

// --- UPDATED JOBSHEET SCHEMA ---
const jobSheetSchema = new mongoose.Schema({
  jobId: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },
  
  // Naye Fields
  item_model: { type: String, required: true }, 
  fault: { type: String, required: true },
  
  // Link to Service and Product (Optional)
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  
  status: { type: String, enum: ['Pending', 'Processing', 'Ready', 'Delivered'], default: 'Pending' },
  remarks: String,
  total_amount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const JobSheet = mongoose.model('JobSheet', jobSheetSchema);

// --- MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, msg: "No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, msg: "Invalid Token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else return res.status(403).json({ success: false, msg: "Admin Access Required" });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, msg: "Email exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword, role: role || 'staff' });
    await user.save();
    res.json({ success: true, msg: "User registered" });
  } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: "Wrong Password" });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Check Token Validity
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    msg: "Token is valid" 
  });
});

// Get current user profile (Protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: "User not found" 
      });
    }
    res.json({ 
      success: true, 
      user 
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Server Error" 
    });
  }
});

// Update user profile (Protected)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      user: updatedUser,
      msg: "Profile updated successfully" 
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Server Error" 
    });
  }
});

// Get all users (Admin only)
app.get('/api/auth/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ date_created: -1 });
    res.json({ 
      success: true, 
      users 
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Server Error" 
    });
  }
});

// --- DATA ROUTES ---

// Clients (Protected)
app.get('/api/clients', authenticateToken, async (req, res) => {
  res.json(await Client.find().sort({ firstname: 1 }));
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try { 
    const n = new Client(req.body); 
    await n.save(); 
    res.json({ success: true }); 
  }
  catch (e) { 
    res.status(400).json({ message: "Contact already exists" }); 
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => { 
  await Client.findByIdAndDelete(req.params.id); 
  res.json({ success: true }); 
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => { 
  await Client.findByIdAndUpdate(req.params.id, req.body); 
  res.json({ success: true }); 
});

// Mechanics (Protected)
app.get('/api/mechanics', authenticateToken, async (req, res) => {
  res.json(await Mechanic.find().sort({ name: 1 }));
});

app.post('/api/mechanics', authenticateToken, async (req, res) => { 
  const m = new Mechanic(req.body); 
  await m.save(); 
  res.json({ success: true }); 
});

app.delete('/api/mechanics/:id', authenticateToken, async (req, res) => { 
  await Mechanic.findByIdAndDelete(req.params.id); 
  res.json({ success: true }); 
});

app.put('/api/mechanics/:id', authenticateToken, async (req, res) => { 
  await Mechanic.findByIdAndUpdate(req.params.id, req.body); 
  res.json({ success: true }); 
});

// Services (Protected)
app.get('/api/services', authenticateToken, async (req, res) => {
  res.json(await Service.find().sort({ service: 1 }));
});

app.post('/api/services', authenticateToken, async (req, res) => { 
  const s = new Service(req.body); 
  await s.save(); 
  res.json({ success: true }); 
});

app.delete('/api/services/:id', authenticateToken, async (req, res) => { 
  await Service.findByIdAndDelete(req.params.id); 
  res.json({ success: true }); 
});

app.put('/api/services/:id', authenticateToken, async (req, res) => { 
  await Service.findByIdAndUpdate(req.params.id, req.body); 
  res.json({ success: true }); 
});

// Inventory & Stock (Protected)
app.get('/api/products', authenticateToken, async (req, res) => {
  res.json(await Product.find().sort({ name: 1 }));
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try { 
    const p = new Product(req.body); 
    await p.save(); 
    res.json({ success: true }); 
  }
  catch (e) { 
    res.status(400).json({ message: "Product already exists" }); 
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => { 
  await Product.findByIdAndDelete(req.params.id); 
  res.json({ success: true }); 
});

app.post('/api/inventory/update-stock', authenticateToken, async (req, res) => {
  const { productId, quantity, type, remarks } = req.body;
  const product = await Product.findById(productId);
  if (type === 'IN') product.current_stock += parseInt(quantity);
  else product.current_stock -= parseInt(quantity);
  await product.save();
  await new StockLog({ productId, quantity, type, remarks }).save();
  res.json({ success: true });
});

// --- JOB SHEETS ROUTES (Fixed) ---

app.get('/api/jobsheets', authenticateToken, async (req, res) => {
  try {
    const jobs = await JobSheet.find()
      .populate('client')
      .populate('mechanic')
      .populate('service')
      .populate('product')
      .sort({ date: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ msg: "Error fetching jobs" }); }
});

app.post('/api/jobsheets', authenticateToken, async (req, res) => {
  try {
    // Frontend se naya data structure receive karein
    const { client, mechanic, item_model, fault, service, product, status, remarks, total_amount } = req.body;

    if (!client || !mechanic || !item_model || !fault) {
      return res.status(400).json({ success: false, msg: "Please fill all required fields (Client, Mechanic, Model, Fault)" });
    }

    const jobId = 'JOB-' + Math.floor(10000 + Math.random() * 90000); // 5 digit random ID

    const newJob = new JobSheet({
      jobId,
      client,
      mechanic,
      item_model,
      fault,
      service: service || null, // Agar select nahi kiya to null
      product: product || null, // Agar select nahi kiya to null
      status: status || 'Pending',
      remarks,
      total_amount
    });

    await newJob.save();

    // Response bhejne se pehle populate karein taaki frontend par turant naam dikh jaye
    const populatedJob = await JobSheet.findById(newJob._id)
      .populate('client').populate('mechanic').populate('service').populate('product');

    res.status(201).json({ success: true, msg: "Job Created Successfully", job: populatedJob });
  } catch (err) {
    console.error("Job Save Error:", err);
    res.status(400).json({ success: false, msg: "Save Failed", error: err.message });
  }
});

app.put('/api/jobsheets/:id', authenticateToken, async (req, res) => {
  try {
    const updatedJob = await JobSheet.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('client').populate('mechanic').populate('service').populate('product');
    res.json({ success: true, msg: "Job Updated", job: updatedJob });
  } catch (err) { res.status(400).json({ success: false, msg: "Update Failed" }); }
});

app.delete('/api/jobsheets/:id', authenticateToken, async (req, res) => {
  await JobSheet.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Job Deleted" });
});

// Test Route (Public - for checking server status)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'V-Tech API is running!',
    version: '1.0.0',
    features: ['Auth System', 'Clients', 'Mechanics', 'Services', 'Inventory', 'Job Sheets'],
    note: 'All data routes require authentication token'
  });
});

// --- 5. ERROR HANDLING ---

// 404 Route
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    msg: "Route Not Found" 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ V-Tech Server with Auth running on port ${PORT}`));