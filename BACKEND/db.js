/*
  Módulo de acesso a dados opcional.
  - Se variáveis de ambiente para MySQL estiverem configuradas, usa MySQL via mysql2/promise.
  - Caso contrário, faz fallback para leitura/escrita em BACKEND/data.json.

  Exports:
  - isConnected(): boolean
  - getProducts(): Promise<array>
  - getUsers(): Promise<array>
  - addUser({name,email}): Promise<object>
*/

const fs = require('fs');
const path = require('path');
let pool = null;
let connected = false;

const DATA_FILE = path.join(__dirname, 'data.json');

function readData(){
  try{ return JSON.parse(fs.readFileSync(DATA_FILE)); }
  catch(e){ return { products: [], users: [] }; }
}

// tenta configurar MySQL a partir de variáveis de ambiente
function tryConnect(){
  if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE){
    try{
      const mysql = require('mysql2/promise');
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      connected = true;
      console.log('DB: MySQL pool configured');
    }catch(e){
      console.warn('DB: mysql2 not available or connection failed, using JSON fallback');
      connected = false;
    }
  }
}

tryConnect();

async function getProducts(){
  if (connected && pool){
    const [rows] = await pool.query('SELECT id, title, price, oldPrice, image, brand FROM products');
    return rows;
  }
  const data = readData();
  return data.products || [];
}

async function addProduct({title, brand, price, oldPrice, image}){
  if (connected && pool){
    const [result] = await pool.query('INSERT INTO products (title,brand,price,oldPrice,image) VALUES (?,?,?,?,?)', [title,brand,price||0,oldPrice||null,image||null]);
    return { id: result.insertId, title, brand, price, oldPrice, image };
  }
  const data = readData();
  const products = data.products || [];
  const newProduct = { id: products.length+1, title, brand, price, oldPrice, image };
  products.push(newProduct);
  data.products = products;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return newProduct;
}

async function updateProduct(id, {title, brand, price, oldPrice, image}){
  if (connected && pool){
    await pool.query('UPDATE products SET title=?, brand=?, price=?, oldPrice=?, image=? WHERE id=?', [title,brand,price||0,oldPrice||null,image||null,id]);
    return { id, title, brand, price, oldPrice, image };
  }
  const data = readData();
  const products = data.products || [];
  const idx = products.findIndex(p => Number(p.id) === Number(id));
  if (idx === -1) throw new Error('Produto não encontrado');
  products[idx] = { id: Number(id), title, brand, price, oldPrice, image };
  data.products = products;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return products[idx];
}

async function deleteProduct(id){
  if (connected && pool){
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    return { id };
  }
  const data = readData();
  const products = data.products || [];
  const idx = products.findIndex(p => Number(p.id) === Number(id));
  if (idx === -1) throw new Error('Produto não encontrado');
  products.splice(idx,1);
  data.products = products;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return { id };
}

async function getUsers(){
  if (connected && pool){
    const [rows] = await pool.query('SELECT id, name, email FROM users');
    return rows;
  }
  const data = readData();
  return data.users || [];
}

async function addUser({name, email}){
  if (connected && pool){
    const [result] = await pool.query('INSERT INTO users (name,email) VALUES (?,?)', [name,email]);
    return { id: result.insertId, name, email };
  }
  const data = readData();
  const users = data.users || [];
  const newUser = { id: users.length+1, name, email };
  users.push(newUser);
  data.users = users;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return newUser;
}

module.exports = {
  isConnected: () => connected,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  addUser
};
