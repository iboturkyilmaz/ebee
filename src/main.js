// eBee - Ana Uygulama

import { formatCurrency, formatDate, formatDateShort, getMonthYear, formatFileSize, generateId, getTodayString } from './utils/formatters.js';
import { getCategoryById, getCategoriesByType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './utils/categories.js';
import {
    getAllTransactions, addTransaction, updateTransaction, deleteTransaction,
    getTransactionsByMonth, getMonthlyTotals, getExpensesByCategory, getIncomeByCategory,
    getMonthlyTrend, addDocument, getAllDocuments, deleteDocument,
    getDocumentByTransactionId, getDocumentById, seedDemoData
} from './store.js';

// ---------- App State ----------
let currentPage = 'dashboard';
let currentDate = new Date();
let chartInstances = {};

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    seedDemoData();
    setupRouter();
    setupMobileNav();
    setupModal();
    navigate(window.location.hash || '#/');
});

// ---------- Router ----------
function setupRouter() {
    window.addEventListener('hashchange', () => {
        navigate(window.location.hash);
    });
}

function navigate(hash) {
    const route = hash.replace('#', '') || '/';
    const app = document.getElementById('app');

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    destroyCharts();

    if (route === '/' || route === '/dashboard') {
        currentPage = 'dashboard';
        document.getElementById('nav-dashboard')?.classList.add('active');
        app.innerHTML = renderDashboard();
        initDashboard();
    } else if (route === '/add') {
        currentPage = 'add';
        document.getElementById('nav-add')?.classList.add('active');
        app.innerHTML = renderAddTransaction();
        initAddTransaction();
    } else if (route.startsWith('/edit/')) {
        currentPage = 'edit';
        document.getElementById('nav-add')?.classList.add('active');
        const id = route.replace('/edit/', '');
        app.innerHTML = renderEditTransaction(id);
        initEditTransaction(id);
    } else if (route === '/transactions') {
        currentPage = 'transactions';
        document.getElementById('nav-transactions')?.classList.add('active');
        app.innerHTML = renderTransactions();
        initTransactions();
    } else if (route === '/documents') {
        currentPage = 'documents';
        document.getElementById('nav-documents')?.classList.add('active');
        app.innerHTML = renderDocuments();
        initDocuments();
    } else {
        currentPage = 'dashboard';
        document.getElementById('nav-dashboard')?.classList.add('active');
        app.innerHTML = renderDashboard();
        initDashboard();
    }

    // Close mobile nav
    document.querySelector('.navbar-links')?.classList.remove('open');

    // Animate page
    app.querySelector('.page')?.classList.add('page-enter');
}

// ---------- Mobile Nav ----------
function setupMobileNav() {
    document.getElementById('mobile-toggle').addEventListener('click', () => {
        document.querySelector('.navbar-links').classList.toggle('open');
    });
}

// ---------- Modal ----------
function setupModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function openModal(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ---------- Toast ----------
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastExit 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- Destroy Charts ----------
function destroyCharts() {
    Object.values(chartInstances).forEach(c => {
        if (c && typeof c.destroy === 'function') c.destroy();
    });
    chartInstances = {};
}

// =============================================
//  DASHBOARD PAGE
// =============================================
function renderDashboard() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totals = getMonthlyTotals(year, month);
    const transactions = getTransactionsByMonth(year, month);
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    // Previous month comparison
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevTotals = getMonthlyTotals(prevYear, prevMonth);

    const incomeChange = prevTotals.income > 0 ? ((totals.income - prevTotals.income) / prevTotals.income * 100).toFixed(1) : 0;
    const expenseChange = prevTotals.expense > 0 ? ((totals.expense - prevTotals.expense) / prevTotals.expense * 100).toFixed(1) : 0;

    return `
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Finansal durumunuza genel bakış</p>
        </div>

        <!-- Month Selector -->
        <div class="month-selector">
            <button class="month-selector-btn" id="month-prev" aria-label="Önceki ay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span class="month-selector-label" id="month-label">${getMonthYear(currentDate)}</span>
            <button class="month-selector-btn" id="month-next" aria-label="Sonraki ay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
            <div class="card summary-card income">
                <div class="summary-card-icon">📈</div>
                <div class="summary-card-label">Toplam Gelir</div>
                <div class="summary-card-amount">${formatCurrency(totals.income)}</div>
                ${incomeChange !== 0 ? `<div class="summary-card-change ${incomeChange >= 0 ? 'up' : 'down'}">${incomeChange >= 0 ? '↑' : '↓'} %${Math.abs(incomeChange)}</div>` : ''}
            </div>
            <div class="card summary-card expense">
                <div class="summary-card-icon">📉</div>
                <div class="summary-card-label">Toplam Gider</div>
                <div class="summary-card-amount">${formatCurrency(totals.expense)}</div>
                ${expenseChange !== 0 ? `<div class="summary-card-change ${expenseChange <= 0 ? 'up' : 'down'}">${expenseChange <= 0 ? '↓' : '↑'} %${Math.abs(expenseChange)}</div>` : ''}
            </div>
            <div class="card summary-card balance">
                <div class="summary-card-icon">💎</div>
                <div class="summary-card-label">Net Bakiye</div>
                <div class="summary-card-amount">${formatCurrency(totals.balance)}</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <div class="card chart-card">
                <div class="chart-card-title">Gider Dağılımı</div>
                <div class="chart-container">
                    <canvas id="expense-chart"></canvas>
                </div>
            </div>
            <div class="card chart-card">
                <div class="chart-card-title">Yıllık Trend</div>
                <div class="chart-container">
                    <canvas id="trend-chart"></canvas>
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transaction-section">
            <div class="section-header">
                <div class="section-title">Son İşlemler</div>
                <a href="#/transactions" class="view-all-btn">Tümünü Gör →</a>
            </div>
            ${recentTransactions.length > 0
                ? recentTransactions.map(t => renderTransactionItem(t, false)).join('')
                : `<div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">Bu ay henüz işlem yok</div>
                    <div class="empty-state-sub">Yeni işlem eklemek için "İşlem Ekle" sayfasını kullanın</div>
                  </div>`
            }
        </div>
    </div>`;
}

function initDashboard() {
    // Month navigation
    document.getElementById('month-prev')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        navigate('#/');
    });
    document.getElementById('month-next')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        navigate('#/');
    });

    // Charts
    initExpenseChart();
    initTrendChart();
}

function initExpenseChart() {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const expenseData = getExpensesByCategory(year, month);

    const labels = [];
    const data = [];
    const colors = [
        '#7c3aed', '#06b6d4', '#ef4444', '#10b981', '#f59e0b',
        '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    Object.entries(expenseData).forEach(([catId, amount]) => {
        const cat = getCategoryById(catId);
        labels.push(`${cat.icon} ${cat.name}`);
        data.push(amount);
    });

    if (data.length === 0) {
        canvas.parentElement.innerHTML = `<div class="empty-state" style="padding:40px 0"><div class="empty-state-icon">📊</div><div class="empty-state-text">Gider verisi yok</div></div>`;
        return;
    }

    chartInstances.expense = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 0,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#8b949e',
                        font: { family: 'Inter', size: 12 },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#e6edf3',
                    bodyColor: '#8b949e',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => ` ${formatCurrency(ctx.raw)}`
                    }
                }
            }
        }
    });
}

function initTrendChart() {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;

    const year = currentDate.getFullYear();
    const trend = getMonthlyTrend(year);
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    chartInstances.trend = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Gelir',
                    data: trend.map(t => t.income),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Gider',
                    data: trend.map(t => t.expense),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#8b949e', font: { family: 'Inter', size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: {
                        color: '#8b949e',
                        font: { family: 'Inter', size: 11 },
                        callback: (v) => v >= 1000 ? (v / 1000) + 'K' : v
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#8b949e',
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        padding: 16,
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#e6edf3',
                    bodyColor: '#8b949e',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                    }
                }
            }
        }
    });
}

// =============================================
//  TRANSACTION ITEM COMPONENT
// =============================================
function renderTransactionItem(t, showActions = true) {
    const cat = getCategoryById(t.category);
    const doc = getDocumentByTransactionId(t.id);
    return `
    <div class="transaction-item" data-id="${t.id}">
        <div class="transaction-icon ${t.type}">${cat.icon}</div>
        <div class="transaction-info">
            <div class="transaction-title">${t.description || cat.name}</div>
            <div class="transaction-category">${cat.name}</div>
        </div>
        ${doc ? '<div class="transaction-doc-indicator" title="Döküman ekli"></div>' : ''}
        <div class="transaction-meta">
            <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(parseFloat(t.amount))}</div>
            <div class="transaction-date">${formatDate(t.date)}</div>
        </div>
        ${showActions ? `
        <div class="transaction-actions">
            <button class="edit-btn" data-id="${t.id}" title="Düzenle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="delete-btn" data-id="${t.id}" title="Sil">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>` : ''}
    </div>`;
}

// =============================================
//  ADD TRANSACTION PAGE
// =============================================
function renderAddTransaction() {
    return `
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">İşlem Ekle</h1>
            <p class="page-subtitle">Yeni gelir veya gider kaydı oluşturun</p>
        </div>

        <div class="form-container">
            <div class="card form-card">
                <!-- Type Toggle -->
                <div class="form-type-toggle">
                    <button class="form-type-btn active income-type" data-type="income" id="type-income">
                        📈 Gelir
                    </button>
                    <button class="form-type-btn expense-type" data-type="expense" id="type-expense">
                        📉 Gider
                    </button>
                </div>

                <form id="transaction-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="tx-amount">Tutar (₺)</label>
                            <input type="number" id="tx-amount" class="form-input" placeholder="0.00" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="tx-date">Tarih</label>
                            <input type="date" id="tx-date" class="form-input" value="${getTodayString()}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tx-category">Kategori</label>
                        <select id="tx-category" class="form-select" required>
                            ${INCOME_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tx-description">Açıklama</label>
                        <textarea id="tx-description" class="form-textarea" placeholder="İşlem hakkında kısa açıklama..." rows="3"></textarea>
                    </div>

                    <!-- File Upload -->
                    <div class="form-group">
                        <label class="form-label">Fatura / Döküman (Opsiyonel)</label>
                        <div class="file-upload-area" id="file-upload-area">
                            <input type="file" class="file-upload-input" id="file-input" accept="image/*,.pdf">
                            <div class="file-upload-icon">📎</div>
                            <div class="file-upload-text">Dosya sürükleyin veya tıklayarak seçin</div>
                            <div class="file-upload-hint">PDF, JPG, PNG - Maks 5MB</div>
                        </div>
                        <div id="file-preview-container"></div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full" id="submit-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Kaydet
                    </button>
                </form>
            </div>
        </div>
    </div>`;
}

function initAddTransaction() {
    let currentType = 'income';
    let uploadedFile = null;

    const typeIncome = document.getElementById('type-income');
    const typeExpense = document.getElementById('type-expense');
    const categorySelect = document.getElementById('tx-category');
    const form = document.getElementById('transaction-form');
    const fileInput = document.getElementById('file-input');
    const fileUploadArea = document.getElementById('file-upload-area');
    const previewContainer = document.getElementById('file-preview-container');

    function setType(type) {
        currentType = type;
        typeIncome.classList.toggle('active', type === 'income');
        typeExpense.classList.toggle('active', type === 'expense');

        const cats = getCategoriesByType(type);
        categorySelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }

    typeIncome.addEventListener('click', () => setType('income'));
    typeExpense.addEventListener('click', () => setType('expense'));

    // File upload
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('Dosya boyutu 5MB\'dan büyük olamaz', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
            };
            showFilePreview();
        };
        reader.readAsDataURL(file);
    }

    function showFilePreview() {
        if (!uploadedFile) {
            previewContainer.innerHTML = '';
            return;
        }
        const isImage = uploadedFile.type.startsWith('image/');
        previewContainer.innerHTML = `
            <div class="file-preview">
                <div class="file-preview-icon">${isImage ? '🖼️' : '📄'}</div>
                <div class="file-preview-info">
                    <div class="file-preview-name">${uploadedFile.name}</div>
                    <div class="file-preview-size">${formatFileSize(uploadedFile.size)}</div>
                </div>
                <button type="button" class="file-preview-remove" id="remove-file">&times;</button>
            </div>
        `;
        document.getElementById('remove-file').addEventListener('click', () => {
            uploadedFile = null;
            fileInput.value = '';
            previewContainer.innerHTML = '';
        });
    }

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = document.getElementById('tx-amount').value;
        const date = document.getElementById('tx-date').value;
        const category = document.getElementById('tx-category').value;
        const description = document.getElementById('tx-description').value;

        if (!amount || parseFloat(amount) <= 0) {
            showToast('Lütfen geçerli bir tutar girin', 'error');
            return;
        }

        const transaction = addTransaction({
            type: currentType,
            amount: parseFloat(amount),
            date,
            category,
            description,
        });

        // Save document if uploaded
        if (uploadedFile) {
            addDocument({
                transactionId: transaction.id,
                fileName: uploadedFile.name,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
                fileData: uploadedFile.data,
            });
        }

        showToast(`${currentType === 'income' ? 'Gelir' : 'Gider'} başarıyla kaydedildi!`);

        // Reset form
        form.reset();
        document.getElementById('tx-date').value = getTodayString();
        uploadedFile = null;
        previewContainer.innerHTML = '';
        setType('income');
    });
}

// =============================================
//  EDIT TRANSACTION PAGE
// =============================================
function renderEditTransaction(id) {
    const t = getAllTransactions().find(tx => tx.id === id);
    if (!t) {
        return `<div class="page"><div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">İşlem bulunamadı</div></div></div>`;
    }

    const cats = getCategoriesByType(t.type);
    return `
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">İşlem Düzenle</h1>
            <p class="page-subtitle">Mevcut işlemi güncelleyin</p>
        </div>

        <div class="form-container">
            <div class="card form-card">
                <div class="form-type-toggle">
                    <button class="form-type-btn ${t.type === 'income' ? 'active' : ''} income-type" data-type="income" id="type-income">
                        📈 Gelir
                    </button>
                    <button class="form-type-btn ${t.type === 'expense' ? 'active' : ''} expense-type" data-type="expense" id="type-expense">
                        📉 Gider
                    </button>
                </div>

                <form id="edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="tx-amount">Tutar (₺)</label>
                            <input type="number" id="tx-amount" class="form-input" value="${t.amount}" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="tx-date">Tarih</label>
                            <input type="date" id="tx-date" class="form-input" value="${t.date}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tx-category">Kategori</label>
                        <select id="tx-category" class="form-select" required>
                            ${cats.map(c => `<option value="${c.id}" ${c.id === t.category ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tx-description">Açıklama</label>
                        <textarea id="tx-description" class="form-textarea" rows="3">${t.description || ''}</textarea>
                    </div>

                    <div style="display:flex;gap:12px">
                        <button type="submit" class="btn btn-primary" style="flex:1">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Güncelle
                        </button>
                        <a href="#/transactions" class="btn btn-secondary" style="flex:0 0 auto">İptal</a>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

function initEditTransaction(id) {
    let currentType = getAllTransactions().find(t => t.id === id)?.type || 'income';

    const typeIncome = document.getElementById('type-income');
    const typeExpense = document.getElementById('type-expense');
    const categorySelect = document.getElementById('tx-category');
    const form = document.getElementById('edit-form');

    function setType(type) {
        currentType = type;
        typeIncome.classList.toggle('active', type === 'income');
        typeExpense.classList.toggle('active', type === 'expense');
        const cats = getCategoriesByType(type);
        categorySelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }

    typeIncome?.addEventListener('click', () => setType('income'));
    typeExpense?.addEventListener('click', () => setType('expense'));

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        updateTransaction(id, {
            type: currentType,
            amount: parseFloat(document.getElementById('tx-amount').value),
            date: document.getElementById('tx-date').value,
            category: document.getElementById('tx-category').value,
            description: document.getElementById('tx-description').value,
        });
        showToast('İşlem güncellendi!');
        window.location.hash = '#/transactions';
    });
}

// =============================================
//  TRANSACTIONS PAGE
// =============================================
function renderTransactions() {
    const allTransactions = getAllTransactions();

    return `
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">İşlemler</h1>
            <p class="page-subtitle">Tüm gelir ve gider kayıtlarınız</p>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="filter-group">
                <label class="filter-label">Tür:</label>
                <select id="filter-type" class="filter-select">
                    <option value="all">Tümü</option>
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Kategori:</label>
                <select id="filter-category" class="filter-select">
                    <option value="all">Tümü</option>
                    ${[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Başlangıç:</label>
                <input type="date" id="filter-start" class="filter-input">
            </div>
            <div class="filter-group">
                <label class="filter-label">Bitiş:</label>
                <input type="date" id="filter-end" class="filter-input">
            </div>
        </div>

        <!-- Transaction List -->
        <div id="transactions-list">
            ${allTransactions.length > 0
                ? allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => renderTransactionItem(t, true)).join('')
                : `<div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">Henüz işlem kaydı yok</div>
                    <div class="empty-state-sub">İlk işleminizi eklemek için <a href="#/add" style="color:var(--accent-cyan)">buraya tıklayın</a></div>
                  </div>`
            }
        </div>
    </div>`;
}

function initTransactions() {
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const filterStart = document.getElementById('filter-start');
    const filterEnd = document.getElementById('filter-end');
    const listContainer = document.getElementById('transactions-list');

    function applyFilters() {
        let transactions = getAllTransactions();

        // Type filter
        if (filterType.value !== 'all') {
            transactions = transactions.filter(t => t.type === filterType.value);
        }

        // Category filter
        if (filterCategory.value !== 'all') {
            transactions = transactions.filter(t => t.category === filterCategory.value);
        }

        // Date range filter
        if (filterStart.value) {
            transactions = transactions.filter(t => t.date >= filterStart.value);
        }
        if (filterEnd.value) {
            transactions = transactions.filter(t => t.date <= filterEnd.value);
        }

        // Sort by date desc
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            listContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Filtrelerle eşleşen işlem bulunamadı</div></div>`;
        } else {
            listContainer.innerHTML = transactions.map(t => renderTransactionItem(t, true)).join('');
            attachTransactionActions();
        }
    }

    function attachTransactionActions() {
        listContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                window.location.hash = `#/edit/${id}`;
            });
        });

        listContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
                    deleteTransaction(id);
                    showToast('İşlem silindi', 'info');
                    applyFilters();
                }
            });
        });
    }

    filterType?.addEventListener('change', applyFilters);
    filterCategory?.addEventListener('change', applyFilters);
    filterStart?.addEventListener('change', applyFilters);
    filterEnd?.addEventListener('change', applyFilters);

    attachTransactionActions();
}

// =============================================
//  DOCUMENTS PAGE
// =============================================
function renderDocuments() {
    const documents = getAllDocuments();

    return `
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">Dökümanlar</h1>
            <p class="page-subtitle">Yüklenen fatura ve belgeler</p>
        </div>

        ${documents.length > 0 ? `
        <div class="documents-grid" id="documents-grid">
            ${documents.map(doc => {
                const isImage = doc.fileType?.startsWith('image/');
                const transaction = getAllTransactions().find(t => t.id === doc.transactionId);
                const cat = transaction ? getCategoryById(transaction.category) : null;
                return `
                <div class="card document-card" data-doc-id="${doc.id}">
                    <div class="document-card-preview">
                        ${isImage ? `<img src="${doc.fileData}" alt="${doc.fileName}">` : '📄'}
                    </div>
                    <div class="document-card-name">${doc.fileName}</div>
                    <div class="document-card-meta">
                        <span>${cat ? cat.icon + ' ' + cat.name : ''}</span>
                        ${transaction ? `<span class="document-card-amount ${transaction.type}">${formatCurrency(transaction.amount)}</span>` : ''}
                    </div>
                    <div class="document-card-meta" style="margin-top:4px">
                        <span>${formatFileSize(doc.fileSize)}</span>
                        <span>${formatDate(doc.uploadedAt)}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>` : `
        <div class="empty-state">
            <div class="empty-state-icon">📂</div>
            <div class="empty-state-text">Henüz döküman yüklenmemiş</div>
            <div class="empty-state-sub">İşlem eklerken fatura/belge yükleyebilirsiniz</div>
        </div>`}
    </div>`;
}

function initDocuments() {
    document.querySelectorAll('.document-card').forEach(card => {
        card.addEventListener('click', () => {
            const docId = card.dataset.docId;
            const doc = getDocumentById(docId);
            if (!doc) return;

            const isImage = doc.fileType?.startsWith('image/');
            const transaction = getAllTransactions().find(t => t.id === doc.transactionId);

            let bodyHtml = '';
            if (isImage) {
                bodyHtml = `<img src="${doc.fileData}" alt="${doc.fileName}" style="width:100%;margin-bottom:16px;">`;
            } else {
                bodyHtml = `<div style="text-align:center;padding:40px;font-size:64px;">📄</div>`;
                bodyHtml += `<a href="${doc.fileData}" download="${doc.fileName}" class="btn btn-primary btn-full" style="margin-bottom:16px">
                    📥 Dosyayı İndir
                </a>`;
            }

            if (transaction) {
                const cat = getCategoryById(transaction.category);
                bodyHtml += `
                <div style="padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-default)">
                    <div style="font-weight:700;margin-bottom:8px">${cat.icon} ${transaction.description || cat.name}</div>
                    <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-secondary)">
                        <span>${formatDate(transaction.date)}</span>
                        <span class="transaction-amount ${transaction.type}" style="font-weight:700">${formatCurrency(transaction.amount)}</span>
                    </div>
                </div>`;
            }

            bodyHtml += `
            <div style="display:flex;gap:8px;margin-top:16px">
                <button class="btn btn-secondary btn-sm" style="flex:1" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Kapat</button>
                <button class="btn btn-sm" style="flex:0 0 auto;background:var(--expense-bg);color:var(--expense-color)" id="delete-doc-${doc.id}">🗑️ Sil</button>
            </div>`;

            openModal(doc.fileName, bodyHtml);

            document.getElementById(`delete-doc-${doc.id}`)?.addEventListener('click', () => {
                if (confirm('Bu dökümanı silmek istediğinize emin misiniz?')) {
                    deleteDocument(doc.id);
                    closeModal();
                    showToast('Döküman silindi', 'info');
                    navigate('#/documents');
                }
            });
        });
    });
}
