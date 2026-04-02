// eBee - Veri Yönetimi (localStorage)

import { generateId } from './utils/formatters.js';

const STORAGE_KEY = 'ebee_transactions';
const DOCS_KEY = 'ebee_documents';

// ---------- Transactions ----------

export function getAllTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction) {
    const transactions = getAllTransactions();
    const newTransaction = {
        id: generateId(),
        ...transaction,
        createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

export function updateTransaction(id, updates) {
    const transactions = getAllTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        saveTransactions(transactions);
        return transactions[index];
    }
    return null;
}

export function deleteTransaction(id) {
    const transactions = getAllTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
    // Also delete linked document
    const docs = getAllDocuments();
    const filteredDocs = docs.filter(d => d.transactionId !== id);
    saveDocuments(filteredDocs);
}

export function getTransactionById(id) {
    return getAllTransactions().find(t => t.id === id) || null;
}

export function getTransactionsByMonth(year, month) {
    return getAllTransactions().filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
}

export function getMonthlyTotals(year, month) {
    const transactions = getTransactionsByMonth(year, month);
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'income') income += amount;
        else expense += amount;
    });

    return { income, expense, balance: income - expense };
}

export function getExpensesByCategory(year, month) {
    const transactions = getTransactionsByMonth(year, month).filter(t => t.type === 'expense');
    const map = {};
    transactions.forEach(t => {
        const cat = t.category;
        if (!map[cat]) map[cat] = 0;
        map[cat] += parseFloat(t.amount) || 0;
    });
    return map;
}

export function getIncomeByCategory(year, month) {
    const transactions = getTransactionsByMonth(year, month).filter(t => t.type === 'income');
    const map = {};
    transactions.forEach(t => {
        const cat = t.category;
        if (!map[cat]) map[cat] = 0;
        map[cat] += parseFloat(t.amount) || 0;
    });
    return map;
}

export function getMonthlyTrend(year) {
    const data = [];
    for (let m = 0; m < 12; m++) {
        const totals = getMonthlyTotals(year, m);
        data.push(totals);
    }
    return data;
}

// ---------- Documents ----------

export function getAllDocuments() {
    try {
        const data = localStorage.getItem(DOCS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveDocuments(docs) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function addDocument(doc) {
    const docs = getAllDocuments();
    const newDoc = {
        id: generateId(),
        ...doc,
        uploadedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    saveDocuments(docs);
    return newDoc;
}

export function deleteDocument(id) {
    const docs = getAllDocuments();
    const filtered = docs.filter(d => d.id !== id);
    saveDocuments(filtered);
}

export function getDocumentByTransactionId(transactionId) {
    return getAllDocuments().find(d => d.transactionId === transactionId) || null;
}

export function getDocumentById(id) {
    return getAllDocuments().find(d => d.id === id) || null;
}

// ---------- Demo Data ----------

export function seedDemoData() {
    if (getAllTransactions().length > 0) return; // already has data

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const demoTransactions = [
        { type: 'income', category: 'salary', amount: 45000, description: 'Aylık maaş', date: `${year}-${String(month + 1).padStart(2, '0')}-01` },
        { type: 'income', category: 'freelance', amount: 8500, description: 'Web site projesi', date: `${year}-${String(month + 1).padStart(2, '0')}-05` },
        { type: 'expense', category: 'rent', amount: 12000, description: 'Ev kirası', date: `${year}-${String(month + 1).padStart(2, '0')}-01` },
        { type: 'expense', category: 'bills', amount: 1850, description: 'Elektrik faturası', date: `${year}-${String(month + 1).padStart(2, '0')}-10` },
        { type: 'expense', category: 'bills', amount: 320, description: 'İnternet faturası', date: `${year}-${String(month + 1).padStart(2, '0')}-08` },
        { type: 'expense', category: 'grocery', amount: 4200, description: 'Haftalık market alışverişi', date: `${year}-${String(month + 1).padStart(2, '0')}-07` },
        { type: 'expense', category: 'transport', amount: 1100, description: 'Akbil yükleme', date: `${year}-${String(month + 1).padStart(2, '0')}-03` },
        { type: 'expense', category: 'food', amount: 750, description: 'Dışarıda yemek', date: `${year}-${String(month + 1).padStart(2, '0')}-12` },
        { type: 'expense', category: 'entertainment', amount: 350, description: 'Netflix + Spotify', date: `${year}-${String(month + 1).padStart(2, '0')}-01` },
        { type: 'income', category: 'investment', amount: 2200, description: 'Borsa getirisi', date: `${year}-${String(month + 1).padStart(2, '0')}-15` },
        { type: 'expense', category: 'health', amount: 600, description: 'Eczane', date: `${year}-${String(month + 1).padStart(2, '0')}-09` },
        { type: 'expense', category: 'clothing', amount: 2800, description: 'Kışlık kıyafet', date: `${year}-${String(month + 1).padStart(2, '0')}-14` },
    ];

    // Add previous month data too
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDemoTransactions = [
        { type: 'income', category: 'salary', amount: 42000, description: 'Aylık maaş', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01` },
        { type: 'income', category: 'freelance', amount: 5000, description: 'Logo tasarımı', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-12` },
        { type: 'expense', category: 'rent', amount: 12000, description: 'Ev kirası', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01` },
        { type: 'expense', category: 'bills', amount: 2100, description: 'Doğalgaz faturası', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-10` },
        { type: 'expense', category: 'grocery', amount: 3800, description: 'Market alışverişi', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-06` },
        { type: 'expense', category: 'tech', amount: 15000, description: 'Yeni telefon', date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-20` },
    ];

    [...demoTransactions, ...prevDemoTransactions].forEach(t => addTransaction(t));
}
