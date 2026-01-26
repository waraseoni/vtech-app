const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'aapka_mongodb_url_yahan')
  .then(() => console.log("Repair DB Connected"))
  .catch(err => console.log(err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: Number, default: 2 }
});
const User = mongoose.model('User', UserSchema);

const ClientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  contact: { type: String, unique: true },
  address: String,
  date_created: { type: Date, default: Date.now }
});
const Client = mongoose.model('Client', ClientSchema);

const TransactionSchema = new mongoose.Schema({
  tracking_code: String,
  customer_name: String,
  contact: String,
  device_model: String,
  problem: String,
  total_amount: Number,
  status: { type: Number, default: 0 },
  date_created: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- ROUTES ---

// Client Routes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ firstname: 1 });
    res.json(clients);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.json({ success: true, client: newClient });
  } catch (err) { res.status(400).json({ success: false, message: "Contact already exists!" }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put('/api/clients/:id', async (req, res) => {
  await Client.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

// Repair Routes
app.post('/api/repairs', async (req, res) => {
  const newRepair = new Transaction(req.body);
  await newRepair.save();
  res.json({ success: true });
});

app.get('/api/repairs', async (req, res) => {
  const list = await Transaction.find().sort({ date_created: -1 });
  res.json(list);
});

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'vtech_secret', { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false });
  }
});

// --- SABSE AAKHIR MEIN LISTEN KAREIN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));