const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// carregar .env localizado em BACKEND/.env (se existir)
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(__dirname, 'data.json');

// servir arquivos estáticos do projeto (front-end)
app.use(express.static(ROOT));

function readData(){
  try{
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  }catch(e){
    return { products: [], users: [] };
  }
}

app.get('/api/products', async (req,res) => {
  // tenta buscar do MySQL caso configurado, senão fallback para JSON
  if (db.isConnected()){
    try{
      const rows = await db.getProducts();
      return res.json(rows);
    }catch(e){ console.error('DB products error', e); }
  }
  const data = readData();
  res.json(data.products || []);
});

app.get('/api/users', async (req,res) => {
  if (db.isConnected()){
    try{
      const rows = await db.getUsers();
      return res.json(rows);
    }catch(e){ console.error('DB users error', e); }
  }
  const data = readData();
  res.json(data.users || []);
});

// endpoint para criar usuário (usa DB se disponível)
app.post('/api/users', async (req,res) => {
  const payload = { name: req.body.name || 'User', email: req.body.email || '' };
  if (db.isConnected()){
    try{
      const created = await db.addUser(payload);
      return res.status(201).json(created);
    }catch(e){ console.error('DB add user error', e); }
  }

  // fallback para JSON file
  const data = readData();
  const users = data.users || [];
  const newUser = { id: users.length+1, name: payload.name, email: payload.email };
  users.push(newUser);
  data.users = users;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json(newUser);
});

// CRUD para produtos
app.post('/api/products', async (req,res) => {
  try{
    const payload = req.body || {};
    const created = await db.addProduct(payload);
    return res.status(201).json(created);
  }catch(e){ console.error(e); res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', async (req,res) => {
  try{
    const id = req.params.id;
    const payload = req.body || {};
    const updated = await db.updateProduct(id, payload);
    return res.json(updated);
  }catch(e){ console.error(e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req,res) => {
  try{
    const id = req.params.id;
    const deleted = await db.deleteProduct(id);
    return res.json(deleted);
  }catch(e){ console.error(e); res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
