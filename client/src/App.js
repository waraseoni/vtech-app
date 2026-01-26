import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = "https://vtech-app.onrender.com"; // Yahan apna Render wala link dalein

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const fetchData = () => {
    fetch('http://localhost:5000/api/message')
      .then(res => res.json())
      .then(json => setMessages(json))
      .catch(err => console.log(err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!inputText) return;
    await fetch('http://localhost:5000/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });
    setInputText("");
    fetchData();
  };

  // --- 1. YEH NAYA FUNCTION JODEIN ---
  const deleteMessage = async (id) => {
    if (window.confirm("Kya aap ise delete karna chahte hain?")) {
      await fetch(`http://localhost:5000/api/message/${id}`, {
        method: 'DELETE',
      });
      fetchData(); // Delete ke baad list refresh karein
    }
  };
  
  // Function ke andar upar states mein ise jodein:
const [editId, setEditId] = useState(null); 

// Edit mode chalu karne ke liye
const startEdit = (message) => {
    setEditId(message._id);
    setInputText(message.text); // Purana text box mein bhar jayega
};

// Edit kiya hua data save karne ke liye (Naya Function)
const handleUpdate = async () => {
    await fetch(`http://localhost:5000/api/message/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
    });
    setEditId(null);
    setInputText("");
    fetchData();
};

  return (
  <div className="container">
    <h1>V-Tech Dashboard</h1>
    
    <div className="input-group">
      <input 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Yahan apna message likhein..."
      />
      
      {editId ? (
        <button className="btn-update" onClick={handleUpdate}>Update</button>
      ) : (
        <button className="btn-save" onClick={handleSave}>Save</button>
      )}
    </div>

    <hr />

    <h3>Pichle Messages:</h3>
    <ul className="message-list">
      {messages.map((m) => (
        <li key={m._id} className="message-item">
          <span className="text-content">{m.text}</span>
          <div className="action-buttons">
            <button className="btn-edit" onClick={() => startEdit(m)}>Edit</button>
            <button className="btn-delete" onClick={() => deleteMessage(m._id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
}

export default App;