import React, { useEffect, useState } from 'react';
import './App.css';

// Dhyan dein: Yahan apne backend ka URL check kar lein (Render wala)
const API_URL = "https://vtech-app.onrender.com"; 

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editId, setEditId] = useState(null); 

  // 1. Data Fetch karne ke liye
  const fetchData = () => {
    fetch(`${API_URL}/api/message`)
      .then(res => res.json())
      .then(json => setMessages(json))
      .catch(err => console.log("Fetch error:", err));
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // 2. Naya Message Save karne ke liye
  const handleSave = async () => {
    if (!inputText) return;
    try {
      // SAHI KIYA GAYA: Yahan Backticks (`) ka use kiya hai
      await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      setInputText("");
      fetchData();
    } catch (err) {
      console.log("Save error:", err);
    }
  };

  // 3. Message Delete karne ke liye
  const deleteMessage = async (id) => {
    if (window.confirm("Kya aap ise delete karna chahte hain?")) {
      try {
        await fetch(`${API_URL}/api/message/${id}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (err) {
        console.log("Delete error:", err);
      }
    }
  };

  // 4. Edit mode chalu karne ke liye
  const startEdit = (message) => {
    setEditId(message._id);
    setInputText(message.text);
  };

  // 5. Update karne ke liye
  const handleUpdate = async () => {
    try {
      await fetch(`${API_URL}/api/message/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      setEditId(null);
      setInputText("");
      fetchData();
    } catch (err) {
      console.log("Update error:", err);
    }
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