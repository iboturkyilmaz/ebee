// eBee - Formatlama Yardımcıları

const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = MONTHS_TR[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export function formatDateShort(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
}

export function getMonthName(monthIndex) {
    return MONTHS_TR[monthIndex];
}

export function getMonthYear(date) {
    return `${MONTHS_TR[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getTodayString() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}
