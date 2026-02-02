const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vtech')
  .then(() => console.log("V-Tech DB Connected"))
  .catch(err => console.error("Connection Error:", err));

// --- 1. SCHEMAS (Sare Ek Saath) ---

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
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  total_amount: Number,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
}));

// --- 2. ROUTES ---

// Clients
app.get('/api/clients', async (req, res) => res.json(await Client.find().sort({ firstname: 1 })));
app.post('/api/clients', async (req, res) => {
  try { const n = new Client(req.body); await n.save(); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: "Contact already exists" }); }
});
app.delete('/api/clients/:id', async (req, res) => { await Client.findByIdAndDelete(req.params.id); res.json({ success: true }); });
app.put('/api/clients/:id', async (req, res) => { await Client.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); });

// Mechanics
app.get('/api/mechanics', async (req, res) => res.json(await Mechanic.find().sort({ name: 1 })));
app.post('/api/mechanics', async (req, res) => { const m = new Mechanic(req.body); await m.save(); res.json({ success: true }); });
app.delete('/api/mechanics/:id', async (req, res) => { await Mechanic.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Services
app.get('/api/services', async (req, res) => res.json(await Service.find().sort({ service: 1 })));
app.post('/api/services', async (req, res) => { const s = new Service(req.body); await s.save(); res.json({ success: true }); });
app.delete('/api/services/:id', async (req, res) => { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Inventory & Stock
app.get('/api/products', async (req, res) => res.json(await Product.find().sort({ name: 1 })));
app.post('/api/products', async (req, res) => {
  try { const p = new Product(req.body); await p.save(); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: "Product already exists" }); }
});

app.post('/api/inventory/update-stock', async (req, res) => {
  const { productId, quantity, type, remarks } = req.body;
  const log = new StockLog({ productId, quantity, type, remarks });
  await log.save();
  const product = await Product.findById(productId);
  if (type === 'IN') product.current_stock += parseInt(quantity);
  else product.current_stock -= parseInt(quantity);
  await product.save();
  res.json({ success: true, current_stock: product.current_stock });
});

// Job Sheets (New Integration)
app.post('/api/jobsheets', async (req, res) => {
  const { clientId, mechanicId, serviceId, productId, total_amount } = req.body;
  const job = new JobSheet({
    jobId: "JOB-" + Date.now(),
    client: clientId, mechanic: mechanicId, service: serviceId, product: productId, total_amount
  });
  await job.save();
  
  if (productId) {
    const p = await Product.findById(productId);
    p.current_stock -= 1;
    await p.save();
    await new StockLog({ productId, quantity: 1, type: 'OUT', remarks: `Used in ${job.jobId}` }).save();
  }
  res.json({ success: true });
});

app.get('/api/jobsheets', async (req, res) => {
  const jobs = await JobSheet.find().populate('client mechanic service product').sort({ date: -1 });
  res.json(jobs);
});

// --- LISTEN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));