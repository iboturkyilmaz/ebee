// eBee - Kategori Verileri

export const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Maaş', icon: '💰' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'investment', name: 'Yatırım', icon: '📈' },
    { id: 'rental', name: 'Kira Geliri', icon: '🏠' },
    { id: 'gift', name: 'Hediye', icon: '🎁' },
    { id: 'other_income', name: 'Diğer', icon: '💵' },
];

export const EXPENSE_CATEGORIES = [
    { id: 'rent', name: 'Kira', icon: '🏡' },
    { id: 'bills', name: 'Faturalar', icon: '📄' },
    { id: 'grocery', name: 'Market', icon: '🛒' },
    { id: 'transport', name: 'Ulaşım', icon: '🚗' },
    { id: 'health', name: 'Sağlık', icon: '🏥' },
    { id: 'education', name: 'Eğitim', icon: '📚' },
    { id: 'entertainment', name: 'Eğlence', icon: '🎬' },
    { id: 'clothing', name: 'Giyim', icon: '👕' },
    { id: 'food', name: 'Yemek', icon: '🍽️' },
    { id: 'tech', name: 'Teknoloji', icon: '📱' },
    { id: 'other_expense', name: 'Diğer', icon: '📦' },
];

export function getCategoryById(id) {
    const all = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    return all.find(c => c.id === id) || { id: 'unknown', name: 'Bilinmiyor', icon: '❓' };
}

export function getCategoriesByType(type) {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
