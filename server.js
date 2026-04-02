const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Veritabanı bağlantısı
const db = new Database('ebee.db', { verbose: console.log });

// Tabloları oluştur
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount REAL,
    date TEXT,
    category TEXT,
    description TEXT,
    createdAt TEXT,
    workspaceId TEXT DEFAULT 'default',
    status TEXT DEFAULT 'completed'
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    transactionId TEXT,
    fileName TEXT,
    fileSize INTEGER,
    fileType TEXT,
    fileData TEXT,
    uploadedAt TEXT,
    FOREIGN KEY(transactionId) REFERENCES transactions(id) ON DELETE CASCADE
  );
`);

// Eski veritabanları için workspace sütunu ve varsayılan workspace ekle
try {
  db.exec("ALTER TABLE transactions ADD COLUMN workspaceId TEXT DEFAULT 'default'");
} catch(e) { /* Sütun zaten varsa hata verir, yok sayılır */ }

try {
  db.exec("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed'");
} catch(e) { /* Sütun zaten varsa hata verir, yok sayılır */ }

try {
  db.exec("INSERT OR IGNORE INTO workspaces (id, name, createdAt) VALUES ('default', 'Varsayılan Tablo', datetime('now'))");
} catch(e) {}

console.log('SQLite veritabanı başarıyla bağlandı ve tablolar doğrulandı.');

// ----------------------------------------------------
// WORKSPACES API
// ----------------------------------------------------
app.get('/api/workspaces', (req, res) => {
  try {
    const w = db.prepare('SELECT * FROM workspaces ORDER BY createdAt ASC').all();
    res.json(w);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/workspaces', (req, res) => {
  try {
    const { id, name, createdAt } = req.body;
    const stmt = db.prepare('INSERT INTO workspaces (id, name, createdAt) VALUES (?, ?, ?)');
    stmt.run(id, name, createdAt);
    res.json({ success: true, id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ----------------------------------------------------
// TRANSACTIONS API
// ----------------------------------------------------
app.get('/api/transactions', (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || 'default';
    const stmt = db.prepare('SELECT * FROM transactions WHERE workspaceId = ? ORDER BY date DESC, createdAt DESC');
    const transactions = stmt.all(workspaceId);
    res.json(transactions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { id, type, amount, date, category, description, createdAt, workspaceId = 'default', status = 'completed' } = req.body;
    const stmt = db.prepare('INSERT INTO transactions (id, type, amount, date, category, description, createdAt, workspaceId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, type, amount, date, category, description, createdAt, workspaceId, status);
    res.json({ success: true, id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/transactions/:id', (req, res) => {
  try {
    const { type, amount, date, category, description, status } = req.body;
    const stmt = db.prepare('UPDATE transactions SET type = ?, amount = ?, date = ?, category = ?, description = ?, status = ? WHERE id = ?');
    stmt.run(type, amount, date, category, description, status, req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/transactions/reset/:workspaceId/:year/:month', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const year = req.params.year;
    const month = String(Number(req.params.month) + 1).padStart(2, '0');
    const prefix = `${year}-${month}-%`;
    
    // İşlemleri sildiğimizde, foreign key ON DELETE CASCADE olduğu için documents da silinmelidir.
    const stmt = db.prepare('DELETE FROM transactions WHERE workspaceId = ? AND date LIKE ?');
    const result = stmt.run(workspaceId, prefix);
    
    res.json({ success: true, deleted: result.changes });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ----------------------------------------------------
// DOCUMENTS API
// ----------------------------------------------------
// (Documents işlemleri transactions'a bağlı olduğu için workspace filtresi şart değil ancak eklenebilir)
// Frontend genel olarak transaction üzerinden document getirdiği için doğrudan çekmek sorun olmaz, 
// ancak güvenlik / izolasyon adına tüm doc'ları da workspace üzerinden çekmek daha sağlıklı olabilir.
// Şimdilik sadece aktif olan workspaceId istekle alınsın veya tümü alınsın.
app.get('/api/documents', (req, res) => {
  try {
    // Tümünü çekmek yeterli (Memory filtreleme yapıyor)
    const stmt = db.prepare('SELECT * FROM documents ORDER BY uploadedAt DESC');
    const documents = stmt.all();
    res.json(documents);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/documents', (req, res) => {
  try {
    const { id, transactionId, fileName, fileSize, fileType, fileData, uploadedAt } = req.body;
    const stmt = db.prepare('INSERT INTO documents (id, transactionId, fileName, fileSize, fileType, fileData, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, transactionId, fileName, fileSize, fileType, fileData, uploadedAt);
    res.json({ success: true, id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/documents/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Start Server
app.listen(port, () => {
  console.log('============================================');
  console.log('🐝 eBee Sunucusu (Tablolar Aktif) Başlatıldı!');
  console.log(`🔗 http://localhost:${port}`);
  console.log('============================================');
});
