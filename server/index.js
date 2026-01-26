const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'aapka_mongodb_url_yahan')
  .then(() => console.log("Repair DB Connected"))
  .catch(err => console.log(err));

// --- SCHEMAS ---
const ClientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  contact: { type: String, unique: true },
  address: String,
  date_created: { type: Date, default: Date.now }
});
const Client = mongoose.model('Client', ClientSchema);

// --- ROUTES (Hamesha listen se upar honi chahiye) ---

// GET All Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ firstname: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New Client
app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.json({ success: true, client: newClient });
  } catch (err) {
    res.status(400).json({ success: false, message: "Contact number already exists!" });
  }
});

// DELETE Client
app.delete('/api/clients/:id', async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// UPDATE Client
app.put('/api/clients/:id', async (req, res) => {
  await Client.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

// --- MECHANIC SCHEMA ---
const MechanicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  email: String,
  status: { type: Number, default: 1 }, // 1: Active, 0: Inactive
  date_created: { type: Date, default: Date.now }
});
const Mechanic = mongoose.model('Mechanic', MechanicSchema);

// --- MECHANIC ROUTES ---

// Get All Mechanics
app.get('/api/mechanics', async (req, res) => {
  try {
    const list = await Mechanic.find().sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json(err); }
});

// Add New Mechanic
app.post('/api/mechanics', async (req, res) => {
  const newMech = new Mechanic(req.body);
  await newMech.save();
  res.json({ success: true });
});

// Delete Mechanic
app.delete('/api/mechanics/:id', async (req, res) => {
  await Mechanic.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- SERVICE SCHEMA ---
const ServiceSchema = new mongoose.Schema({
  service: { type: String, required: true },
  description: String,
  cost: { type: Number, required: true },
  status: { type: Number, default: 1 }, // 1: Active, 0: Inactive
  date_created: { type: Date, default: Date.now }
});
const Service = mongoose.model('Service', ServiceSchema);

// --- SERVICE ROUTES ---

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ service: 1 });
    res.json(services);
  } catch (err) { res.status(500).json(err); }
});

// Add new service
app.post('/api/services', async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.json({ success: true });
  } catch (err) { res.status(400).json(err); }
});

// Delete service
app.delete('/api/services/:id', async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- PRODUCT / INVENTORY SCHEMA ---
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  purchase_price: Number, // Jis price pe aapne kharida
  sell_price: Number,     // Jis price pe aap customer ko denge
  quantity: { type: Number, default: 0 }, // Current Stock
  status: { type: Number, default: 1 },
  date_created: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// --- PRODUCT ROUTES ---

// Get All Products
app.get('/api/products', async (req, res) => {
  const list = await Product.find().sort({ name: 1 });
  res.json(list);
});

// Add/Update Product
app.post('/api/products', async (req, res) => {
  const newProd = new Product(req.body);
  await newProd.save();
  res.json({ success: true });
});

app.put('/api/products/:id', async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 1. Product Registry (Fixing existing schema)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  purchase_price: Number, 
  sell_price: Number,
  current_stock: { type: Number, default: 0 } // Ye automatically update hoga
});
const Product = mongoose.model('Product', ProductSchema);

// 2. Stock Movement Log (Naya Schema)
const StockLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['IN', 'OUT'] }, // IN = Purchase, OUT = Sale/JobSheet
  quantity: Number,
  remarks: String, // e.g., "New stock arrived" or "Used in Job #101"
  date: { type: Date, default: Date.now }
});
const StockLog = mongoose.model('StockLog', StockLogSchema);

// --- ROUTES ---

// Stock Update API (Jab aap naya stock kharidte hain)
app.post('/api/inventory/update-stock', async (req, res) => {
  const { productId, quantity, type, remarks } = req.body;
  
  // 1. Log create karein
  const log = new StockLog({ productId, quantity, type, remarks });
  await log.save();

  // 2. Main Product table mein stock update karein
  const product = await Product.findById(productId);
  if (type === 'IN') product.current_stock += parseInt(quantity);
  else product.current_stock -= parseInt(quantity);
  
  await product.save();
  res.json({ success: true, current_stock: product.current_stock });
});

// --- SABSE AAKHIR MEIN LISTEN KAREIN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));