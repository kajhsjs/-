// ===== УПРОЩЕННАЯ ПЛАТЕЖНАЯ СИСТЕМА =====

// Класс платежной системы
class SimplePaymentSystem {
    constructor() {
        this.transactions = [];
        this.loadTransactions();
    }
    
    loadTransactions() {
        const saved = localStorage.getItem('payment_transactions');
        if (saved) {
            this.transactions = JSON.parse(saved);
        }
    }
    
    saveTransactions() {
        localStorage.setItem('payment_transactions', JSON.stringify(this.transactions));
    }
    
    // Создание депозита (демо)
    createDeposit(amount, currency = 'TON') {
        const transaction = {
            id: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'deposit',
            amount: amount,
            currency: currency,
            status: 'completed',
            timestamp: new Date().toISOString(),
            method: 'demo',
            description: `Демо пополнение на ${amount} ${currency}`
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        
        return transaction;
    }
    
    // Создание вывода (демо)
    createWithdrawal(amount, currency = 'TON', walletAddress) {
        const fee = amount * 0.03; // 3% комиссия
        const receive = amount - fee;
        
        const transaction = {
            id: `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'withdrawal',
            amount: amount,
            receive: receive,
            fee: fee,
            currency: currency,
            status: 'completed',
            timestamp: new Date().toISOString(),
            wallet: walletAddress,
            method: 'demo',
            description: `Демо вывод ${receive} ${currency} на ${walletAddress.substring(0, 8)}...`
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        
        return transaction;
    }
    
    // Показать историю платежей
    getPaymentHistory(limit = 10) {
        return this.transactions.slice(0, limit);
    }
}

// Инициализация платежной системы
let paymentSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    // Даем время на загрузку основного приложения
    setTimeout(() => {
        paymentSystem = new SimplePaymentSystem();
        console.log('Платежная система инициализирована');
    }, 1000);
});

// Глобальные функции для платежей
window.processPayment = function(type, amount, wallet = '') {
    if (!paymentSystem) {
        alert('Платежная система не загружена');
        return null;
    }
    
    let transaction = null;
    
    if (type === 'deposit') {
        transaction = paymentSystem.createDeposit(amount);
        showPaymentSuccess('deposit', amount);
    } else if (type === 'withdrawal') {
        if (!wallet) {
            alert('Введите адрес кошелька');
            return null;
        }
        transaction = paymentSystem.createWithdrawal(amount, 'TON', wallet);
        showPaymentSuccess('withdrawal', amount, wallet);
    }
    
    return transaction;
};

// Показ успешного платежа
function showPaymentSuccess(type, amount, wallet = '') {
    const message = type === 'deposit' 
        ? `✅ Успешно пополнено ${amount} TON`
        : `✅ Вывод ${amount} TON выполнен`;
    
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, 'success');
    } else {
        alert(message);
    }
    
    // Обновляем баланс если доступен
    if (type === 'deposit' && window.currentPlayer && window.updateBalance) {
        window.currentPlayer.balance += amount;
        window.updateBalance();
    } else if (type === 'withdrawal' && window.currentPlayer && window.updateBalance) {
        const fee = amount * 0.03;
        window.currentPlayer.balance -= amount;
        window.updateBalance();
    }
}

// Экспортируем для глобального использования
window.paymentSystem = {
    processPayment: window.processPayment,
    getHistory: () => paymentSystem ? paymentSystem.getPaymentHistory() : []
};