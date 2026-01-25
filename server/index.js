const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. Database Connection Logic (Local aur Cloud dono ke liye)
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vtechDB';

mongoose.connect(dbURI)
    .then(() => console.log("Database se connection jud gaya hai! ✅"))
    .catch((err) => console.error("Database connection error: ", err));

// 2. Schema aur Model
const MessageSchema = new mongoose.Schema({
    text: String
});
const Message = mongoose.model('Message', MessageSchema);

// 3. API Routes
// GET: Saare messages dikhane ke liye
app.get('/api/message', async (req, res) => {
    try {
        const data = await Message.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Naya message save karne ke liye
app.post('/api/save', async (req, res) => {
    try {
        const newMessage = new Message({ text: req.body.text });
        await newMessage.save();
        res.json({ success: true, message: "Data save ho gaya!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT: Purana message edit karne ke liye
app.put('/api/message/:id', async (req, res) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id, 
            { text: req.body.text }, 
            { new: true }
        );
        res.json({ success: true, updatedMessage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Message hatane ke liye
app.delete('/api/message/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Delete ho gaya!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Port Configuration (Render ke liye zaroori)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server chalu hai: http://localhost:${PORT}`);
});