const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./db');
const app = express();
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name || user.nome,
    nome: user.nome || user.name,
    email: user.email,
    tipo: user.tipo || (String(user.email).toLowerCase() === 'admin@promofinder.local' ? 'admin' : 'cliente')
  };
}

app.get('/api/health', async (req, res) => {
  res.json({ ok: true, mysqlAvailable: db.isConnected(), dbConnected: await db.testConnection() });
});

app.get('/api/products', async (req, res) => {
  try { res.json(await db.getProducts()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar produtos.' }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = (await db.getProducts()).find(p => String(p.id) === String(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(product);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar produto.' }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = normalizeProductBody(req.body);
    if (!product.title || product.price === null) return res.status(400).json({ error: 'Título e preço são obrigatórios.' });
    res.status(201).json(await db.addProduct(product));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao criar produto.' }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = normalizeProductBody(req.body);
    if (!product.title || product.price === null) return res.status(400).json({ error: 'Título e preço são obrigatórios.' });
    res.json(await db.updateProduct(req.params.id, product));
  } catch (err) { console.error(err); res.status(500).json({ error: err.message || 'Erro ao atualizar produto.' }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try { res.json(await db.deleteProduct(req.params.id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao excluir produto.' }); }
});

app.get('/api/users', async (req, res) => {
  try { res.json((await db.getUsers()).map(publicUser)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar usuários.' }); }
});

app.post(['/api/users', '/promofinder/usuarios'], async (req, res) => {
  const name = cleanText(req.body.name || req.body.nome || '');
  const email = cleanText(req.body.email || '').toLowerCase();
  const senha = req.body.senha || req.body.password || '';
  if (!name || !email || !senha) return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });

  try {
    const exists = (await db.getUsers()).some(u => String(u.email).toLowerCase() === email);
    if (exists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    const saved = await db.addUser({ name, nome: name, email, senha, tipo: 'cliente' });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: publicUser(saved) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao cadastrar usuário.' }); }
});

app.post(['/api/login', '/promofinder/login'], async (req, res) => {
  const email = cleanText(req.body.email || '').toLowerCase();
  const senha = req.body.senha || req.body.password || '';
  if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });

  try {
    const user = (await db.getUsers()).find(u => String(u.email).toLowerCase() === email);
    if (!user || String(user.senha) !== String(senha)) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    res.json({ message: 'Login realizado com sucesso!', user: publicUser(user) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao fazer login.' }); }
});

function normalizeProductBody(body) {
  const priceRaw = body.price ?? body.preco;
  const oldRaw = body.oldPrice ?? body.preco_antigo;
  return {
    title: cleanText(body.title || body.nome || ''),
    brand: cleanText(body.brand || body.marca || ''),
    price: priceRaw === '' || priceRaw === undefined || priceRaw === null ? null : Number(priceRaw),
    oldPrice: oldRaw === '' || oldRaw === undefined || oldRaw === null ? null : Number(oldRaw),
    image: cleanText(body.image || body.imagem || ''),
    description: cleanText(body.description || body.descricao || ''),
    link: cleanText(body.link || body.link_externo || ''),
    specs: Array.isArray(body.specs) ? body.specs : String(body.specs || '').split('\n').map(s => s.trim()).filter(Boolean)
  };
}

app.use(express.static(ROOT));
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
