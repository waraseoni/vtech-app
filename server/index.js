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

// --- SABSE AAKHIR MEIN LISTEN KAREIN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));