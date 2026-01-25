const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Mongoose ko add karein

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// 'vtechDB' aapke database ka naam hoga
mongoose.connect('mongodb://127.0.0.1:27017/vtechDB')
    .then(() => console.log("MongoDB se connection jud gaya hai! ✅"))
    .catch((err) => console.error("Database connection error: ", err));

// Ek simple Schema (Data ka structure)
const MessageSchema = new mongoose.Schema({
    text: String
});
const Message = mongoose.model('Message', MessageSchema);

app.get('/api/message', async (req, res) => {
    // findOne() ki jagah find() use karein taaki SARE messages milein
    const data = await Message.find(); 
    res.json(data); // Pura array bhejein
});

// Data save karne ke liye naya rasta (Route)
app.post('/api/save', async (req, res) => {
    try {
        const newMessage = new Message({ text: req.body.text });
        await newMessage.save();
        res.json({ success: true, message: "Data save ho gaya!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Server/index.js mein ye add karein
// Yeh naya hissa hai jo delete karega
app.delete('/api/message/:id', async (req, res) => {
    try {
        const result = await Message.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true, message: "Delete ho gaya!" });
        } else {
            res.status(404).json({ success: false, message: "Message nahi mila" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Data Edit (Update) karne ke liye rasta
app.put('/api/message/:id', async (req, res) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id, 
            { text: req.body.text }, 
            { new: true } // Isse humein naya wala data wapas milta hai
        );
        res.json({ success: true, updatedMessage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server chalu hai: http://localhost:${PORT}`);
});