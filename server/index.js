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
  .then(() => console.log("V-Tech DB Connected with Auth"))
  .catch(err => console.error("Connection Error:", err));

// --- 1. SCHEMAS (Sare Ek Saath) ---

// नया: User Model (Login/Register के लिए)
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
  status: { type: Number, default: 1 }, // 1: Active, 0: Inactive
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

const JobSheet = mongoose.model('JobSheet', new mongoose.Schema({
  jobId: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic' },
  item_model: String,     // Naya
  fault: String,          // Naya
  status: {               // Naya
    type: String, 
    enum: ['Pending', 'Processing', 'Ready', 'Delivered'], 
    default: 'Pending' 
  },
  remarks: String,        // Naya
  total_amount: Number,
  date: { type: Date, default: Date.now }
}));

// --- 2. MIDDLEWARE ---

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" से token निकालना

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      msg: "Access Denied: No Token Provided" 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        msg: "Invalid Token" 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role (optional)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      msg: "Access Denied: Admin privileges required" 
    });
  }
};

// --- 3. AUTH ROUTES (नया Section) ---

// Register Route (पहला user बनाने के लिए)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        msg: "Email already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'staff' 
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      msg: "User registered successfully" 
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Server Error" 
    });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        msg: "Invalid Email" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        msg: "Invalid Password" 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name,
        email: user.email,
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Server Error" 
    });
  }
});

// Check Token Validity
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    msg: "Token is valid" 
  });
});

// --- 4. DATA ROUTES (Protected with Token) ---

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

app.post('/api/inventory/update-stock', authenticateToken, async (req, res) => {
  const { productId, quantity, type, remarks } = req.body;
  const log = new StockLog({ productId, quantity, type, remarks });
  await log.save();
  const product = await Product.findById(productId);
  if (type === 'IN') product.current_stock += parseInt(quantity);
  else product.current_stock -= parseInt(quantity);
  await product.save();
  res.json({ success: true, current_stock: product.current_stock });
});

// Job Sheets (Protected)
app.post('/api/jobsheets', authenticateToken, async (req, res) => {
  try {
    const { clientId, mechanicId, serviceId, productId, total_amount } = req.body;
    
    console.log("Received job data:", req.body);
    
    const job = new JobSheet({
      jobId: "JOB-" + Date.now(),
      client: clientId || null,
      mechanic: mechanicId || null,
      service: serviceId || null,
      product: productId || null,
      total_amount: total_amount || 0,
      status: 'Pending'
    });

    console.log("Saving job:", job);
    await job.save();
    
    // Inventory update logic
    if (productId) {
      const p = await Product.findById(productId);
      if (p) {
        p.current_stock -= 1;
        await p.save();
        await new StockLog({ 
          productId, 
          quantity: 1, 
          type: 'OUT', 
          remarks: `Used in ${job.jobId}` 
        }).save();
      }
    }
    
    res.json({ success: true, jobId: job.jobId });
  } catch (error) {
    console.error("Job save error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/jobsheets', authenticateToken, async (req, res) => {
  const jobs = await JobSheet.find().populate('client mechanic service product').sort({ date: -1 });
  res.json(jobs);
});

app.put('/api/jobsheets/:id', authenticateToken, async (req, res) => {
  await JobSheet.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

app.delete('/api/jobsheets/:id', authenticateToken, async (req, res) => {
  await JobSheet.findByIdAndDelete(req.params.id);
  res.json({ success: true });
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

// --- 5. ERROR HANDLING ---

// 404 Route
app.all('/*', (req, res) => {
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