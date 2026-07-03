const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATA_FILE = path.join(__dirname, 'data.json');
let pool = null;
let connected = false;
let productTable = null;
let userTable = null;

async function tryConnect() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'promofinder',
      waitForConnections: true,
      connectionLimit: 10
    });
    await pool.query('SELECT 1');
    productTable = await tableExists('products') ? 'products' : (await tableExists('produtos') ? 'produtos' : null);
    userTable = await tableExists('users') ? 'users' : (await tableExists('usuarios') ? 'usuarios' : null);
    connected = true;
    console.log('MySQL conectado. Produtos:', productTable || 'JSON', '| Usuários:', userTable || 'JSON');
  } catch (err) {
    connected = false;
    console.log('MySQL indisponível. Usando BACKEND/data.json. Motivo:', err.message);
  }
}
tryConnect();

async function tableExists(name) {
  const [rows] = await pool.query('SHOW TABLES LIKE ?', [name]);
  return rows.length > 0;
}
function isConnected() { return connected; }
async function testConnection() { try { if (!connected || !pool) return false; await pool.query('SELECT 1'); return true; } catch { connected = false; return false; } }
function normalizeData(data) { const products = data.products || data.produtos || []; const users = data.users || data.usuarios || []; return { products, users }; }
function readData() { try { return normalizeData(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); } catch { return { products: [], users: [] }; } }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(normalizeData(data), null, 2), 'utf8'); }
function parseSpecs(value) { if (!value) return []; if (Array.isArray(value)) return value; try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch { return String(value).split('\n').map(s => s.trim()).filter(Boolean); } }
function mapProduct(p) { return { id: p.id, title: p.title ?? p.nome ?? '', brand: p.brand ?? p.marca ?? '', price: Number(p.price ?? p.preco ?? 0), oldPrice: p.oldPrice ?? p.preco_antigo ?? null, image: p.image ?? p.imagem ?? '', description: p.description ?? p.descricao ?? '', link: p.link ?? p.link_externo ?? '', specs: parseSpecs(p.specs) }; }

async function getProducts() {
  if (connected && productTable === 'products') {
    const [rows] = await pool.query('SELECT id,title,brand,price,oldPrice,image,description,specs FROM products ORDER BY id DESC');
    return rows.map(mapProduct);
  }
  if (connected && productTable === 'produtos') {
    const [rows] = await pool.query('SELECT id,nome,descricao,preco,imagem,link_externo FROM produtos ORDER BY id DESC');
    return rows.map(mapProduct);
  }
  return readData().products.map(mapProduct).sort((a,b)=>Number(b.id)-Number(a.id));
}
async function addProduct(product) {
  const clean = mapProduct({ ...product, id: undefined });
  if (connected && productTable === 'products') {
    const [r] = await pool.query('INSERT INTO products (title,brand,price,oldPrice,image,description,specs) VALUES (?,?,?,?,?,?,?)', [clean.title, clean.brand, clean.price, clean.oldPrice, clean.image, clean.description, JSON.stringify(clean.specs)]);
    return { ...clean, id: r.insertId };
  }
  if (connected && productTable === 'produtos') {
    const [r] = await pool.query('INSERT INTO produtos (nome,descricao,preco,imagem,link_externo) VALUES (?,?,?,?,?)', [clean.title, clean.description, clean.price, clean.image, clean.link]);
    return { ...clean, id: r.insertId };
  }
  const data = readData(); const novo = { ...clean, id: Date.now() }; data.products.push(novo); writeData(data); return novo;
}
async function updateProduct(id, product) {
  const clean = mapProduct({ ...product, id: Number(id) });
  if (connected && productTable === 'products') {
    const [r] = await pool.query('UPDATE products SET title=?,brand=?,price=?,oldPrice=?,image=?,description=?,specs=? WHERE id=?', [clean.title, clean.brand, clean.price, clean.oldPrice, clean.image, clean.description, JSON.stringify(clean.specs), id]);
    if (!r.affectedRows) throw new Error('Produto não encontrado.'); return clean;
  }
  if (connected && productTable === 'produtos') {
    const [r] = await pool.query('UPDATE produtos SET nome=?,descricao=?,preco=?,imagem=?,link_externo=? WHERE id=?', [clean.title, clean.description, clean.price, clean.image, clean.link, id]);
    if (!r.affectedRows) throw new Error('Produto não encontrado.'); return clean;
  }
  const data = readData(); const idx = data.products.findIndex(p => String(p.id) === String(id)); if (idx < 0) throw new Error('Produto não encontrado.'); data.products[idx] = clean; writeData(data); return clean;
}
async function deleteProduct(id) {
  if (connected && productTable) { await pool.query(`DELETE FROM ${productTable} WHERE id=?`, [id]); return { id: Number(id) }; }
  const data = readData(); data.products = data.products.filter(p => String(p.id) !== String(id)); writeData(data); return { id: Number(id) };
}
async function getUsers() {
  if (connected && userTable === 'users') { const [rows] = await pool.query('SELECT id,name,email,senha FROM users ORDER BY id DESC'); return rows.map(u => ({ ...u, nome: u.name, tipo: String(u.email).toLowerCase() === 'admin@promofinder.local' ? 'admin' : 'cliente' })); }
  if (connected && userTable === 'usuarios') { const [rows] = await pool.query('SELECT id,nome,email,senha,tipo FROM usuarios ORDER BY id DESC'); return rows.map(u => ({ ...u, name: u.nome, tipo: u.tipo || 'cliente' })); }
  return readData().users.map(u => ({ ...u, name: u.name || u.nome, nome: u.nome || u.name }));
}
async function addUser(user) {
  const clean = { name: user.name || user.nome || '', nome: user.nome || user.name || '', email: user.email || '', senha: user.senha || '', tipo: user.tipo || 'cliente' };
  if (connected && userTable === 'users') { const [r] = await pool.query('INSERT INTO users (name,email,senha) VALUES (?,?,?)', [clean.name, clean.email, clean.senha]); return { ...clean, id: r.insertId }; }
  if (connected && userTable === 'usuarios') { const [r] = await pool.query('INSERT INTO usuarios (nome,email,senha,tipo) VALUES (?,?,?,?)', [clean.name, clean.email, clean.senha, clean.tipo]); return { ...clean, id: r.insertId }; }
  const data = readData(); const novo = { ...clean, id: Date.now() }; data.users.push(novo); writeData(data); return novo;
}
module.exports = { isConnected, testConnection, getProducts, addProduct, updateProduct, deleteProduct, getUsers, addUser };
