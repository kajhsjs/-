// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    DEMO_MODE: true,
    INITIAL_BALANCE: 0,
    ADMIN_IDS: [123456789], // Замени на свой Telegram ID
    MIN_BET: 5,
    MAX_BET: 1000,
    
    // Игры
    GAMES: [
        {
            id: 'dice',
            name: 'Кости',
            icon: 'fas fa-dice',
            color: '#FF9500',
            description: 'Угадай сумму на костях',
            minMultiplier: 2,
            maxMultiplier: 50,
            rtp: 95
        },
        {
            id: 'slots',
            name: 'Слоты',
            icon: 'fas fa-sliders-h',
            color: '#34C759',
            description: 'Классические игровые автоматы',
            minMultiplier: 1,
            maxMultiplier: 100,
            rtp: 94
        },
        {
            id: 'plinko',
            name: 'Плинко',
            icon: 'fas fa-bullseye',
            color: '#007AFF',
            description: 'Бросай шарик и выигрывай',
            minMultiplier: 1.5,
            maxMultiplier: 75,
            rtp: 93
        },
        {
            id: 'mines',
            name: 'Минёр',
            icon: 'fas fa-bomb',
            color: '#FF3B30',
            description: 'Найди бриллианты, избегай мин',
            minMultiplier: 1.2,
            maxMultiplier: 60,
            rtp: 96
        }
    ]
};

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentPlayer = null;
let tg = null;
let currentGame = null;

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('TON Play загружается...');
    
    try {
        // 1. Инициализация Telegram
        await initTelegram();
        
        // 2. Создание игрока
        await initPlayer();
        
        // 3. Загрузка интерфейса
        initUI();
        
        // 4. Инициализация игр
        initGames();
        
        // 5. Обновление статистики
        updateLiveStats();
        
        console.log('✅ TON Play готов!');
        showNotification('Добро пожаловать в TON Play!', 'info');
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showNotification('Ошибка загрузки приложения', 'error');
    }
});

// ===== TELEGRAM =====
async function initTelegram() {
    if (typeof Telegram !== 'undefined') {
        tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Настройки Telegram
        tg.setHeaderColor('#0a0a0a');
        tg.setBackgroundColor('#0a0a0a');
        
        console.log('Telegram Web App инициализирован');
        return true;
    }
    
    console.log('Демо режим (Telegram не найден)');
    return false;
}

// ===== ИГРОК =====
async function initPlayer() {
    let playerData = null;
    let telegramUser = null;
    
    // Проверяем Telegram данные
    if (tg && tg.initDataUnsafe?.user) {
        telegramUser = tg.initDataUnsafe.user;
        const playerId = `tg_${telegramUser.id}`;
        
        // Пробуем загрузить из localStorage
        const savedData = localStorage.getItem(`player_${playerId}`);
        
        if (savedData) {
            playerData = JSON.parse(savedData);
            playerData.last_login = new Date().toISOString();
            console.log('Игрок загружен из памяти');
        } else {
            // Создаем нового игрока
            playerData = createNewPlayer(telegramUser);
            console.log('Новый игрок создан');
        }
    } else {
        // Демо режим
        playerData = createDemoPlayer();
        console.log('Демо режим активирован');
    }
    
    currentPlayer = playerData;
    savePlayerData();
    return playerData;
}

function createNewPlayer(telegramUser) {
    return {
        id: `tg_${telegramUser.id}`,
        telegram_id: telegramUser.id,
        username: telegramUser.username || `user_${telegramUser.id}`,
        first_name: telegramUser.first_name || 'Игрок',
        last_name: telegramUser.last_name || '',
        avatar: telegramUser.photo_url || '',
        
        // Баланс
        balance: CONFIG.INITIAL_BALANCE,
        
        // Статистика
        games_played: 0,
        total_won: 0,
        total_lost: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        luck_factor: 1.0,
        
        // Системное
        registration_date: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_admin: CONFIG.ADMIN_IDS.includes(telegramUser.id || 0),
        
        // История
        history: []
    };
}

function createDemoPlayer() {
    return {
        id: 'demo_guest',
        username: 'Гость',
        first_name: 'Гость',
        last_name: '',
        avatar: '',
        
        balance: CONFIG.INITIAL_BALANCE,
        
        games_played: 0,
        total_won: 0,
        total_lost: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        luck_factor: 0.8,
        
        registration_date: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_admin: false,
        
        history: []
    };
}

function savePlayerData() {
    if (!currentPlayer) return;
    localStorage.setItem(`player_${currentPlayer.id}`, JSON.stringify(currentPlayer));
}

// ===== ИНТЕРФЕЙС =====
function initUI() {
    if (!currentPlayer) return;
    
    // Обновляем данные пользователя
    updateUserInfo();
    
    // Обновляем баланс
    updateBalance();
    
    // Приветственное сообщение
    updateWelcomeMessage();
}

function updateUserInfo() {
    document.getElementById('username').textContent = currentPlayer.first_name;
    document.getElementById('userId').textContent = `ID: ${currentPlayer.id.substring(3, 8)}`;
    
    // Аватар
    const avatar = document.getElementById('userAvatar');
    if (currentPlayer.avatar) {
        avatar.innerHTML = `<img src="${currentPlayer.avatar}" alt="Avatar">`;
    } else if (currentPlayer.telegram_id) {
        avatar.innerHTML = '<i class="fas fa-user-check"></i>';
        avatar.style.background = 'linear-gradient(135deg, #34c759, #2a2a2a)';
    }
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = currentPlayer.balance.toFixed(2);
    }
}

function updateWelcomeMessage() {
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText && currentPlayer) {
        if (currentPlayer.id === 'demo_guest') {
            welcomeText.textContent = 'Демо режим | TON Play';
        } else {
            welcomeText.textContent = `Добро пожаловать, ${currentPlayer.first_name}!`;
        }
    }
}

// ===== ИГРЫ =====
function initGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (!gamesGrid) return;
    
    gamesGrid.innerHTML = '';
    
    CONFIG.GAMES.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
    });
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.onclick = () => startGame(game.id);
    
    card.innerHTML = `
        <div class="game-icon" style="background: ${game.color}">
            <i class="${game.icon}"></i>
        </div>
        <div class="game-title">${game.name}</div>
        <div class="game-description">${game.description}</div>
        <div class="game-multiplier">Выигрыш: ${game.minMultiplier}x - ${game.maxMultiplier}x</div>
        <button class="btn btn-primary" style="margin-top: 10px;">
            <i class="fas fa-play"></i> Играть
        </button>
    `;
    
    return card;
}

function startGame(gameId) {
    if (currentPlayer.balance < CONFIG.MIN_BET) {
        showNotification(`Минимальная ставка: ${CONFIG.MIN_BET} TON`, 'warning');
        return;
    }
    
    // В демо режиме запускаем игру
    if (typeof window.launchGame === 'function') {
        window.launchGame(gameId, CONFIG.MIN_BET);
    } else {
        showNotification(`Игра "${gameId}" загружается...`, 'info');
        
        // Симуляция игры
        simulateGame(gameId);
    }
}

function simulateGame(gameId) {
    const game = CONFIG.GAMES.find(g => g.id === gameId);
    if (!game) return;
    
    const betAmount = CONFIG.MIN_BET;
    
    // Проверяем баланс
    if (currentPlayer.balance < betAmount) {
        showNotification('Недостаточно средств', 'error');
        return;
    }
    
    // Симуляция результата (50% шанс на победу)
    const isWin = Math.random() > 0.5;
    let winAmount = 0;
    let multiplier = 0;
    
    if (isWin) {
        // Генерируем множитель
        multiplier = game.minMultiplier + Math.random() * (game.maxMultiplier - game.minMultiplier);
        winAmount = betAmount * multiplier;
        
        // Обновляем баланс
        currentPlayer.balance -= betAmount;
        currentPlayer.balance += winAmount;
        currentPlayer.total_won += winAmount;
        
        showNotification(`🎉 ПОБЕДА! Вы выиграли ${winAmount.toFixed(2)} TON (${multiplier.toFixed(1)}x)`, 'success');
    } else {
        // Проигрыш
        currentPlayer.balance -= betAmount;
        currentPlayer.total_lost += betAmount;
        
        showNotification(`😔 Проигрыш ${betAmount} TON. Попробуйте еще раз!`, 'warning');
    }
    
    // Обновляем статистику
    currentPlayer.games_played++;
    
    // Сохраняем историю
    const historyItem = {
        game: game.name,
        bet: betAmount,
        win: isWin ? winAmount : 0,
        multiplier: multiplier,
        timestamp: new Date().toISOString(),
        result: isWin ? 'win' : 'loss'
    };
    
    currentPlayer.history.unshift(historyItem);
    if (currentPlayer.history.length > 50) {
        currentPlayer.history = currentPlayer.history.slice(0, 50);
    }
    
    // Сохраняем и обновляем
    savePlayerData();
    updateBalance();
    updateHistory();
}

// ===== ПЛАТЕЖИ =====
function openDeposit() {
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-wallet"></i> Пополнение баланса</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div style="text-align: center; margin: 20px 0;">
                        <i class="fas fa-coins" style="font-size: 48px; color: #FFCC00; margin-bottom: 15px;"></i>
                        <h4 style="margin-bottom: 10px;">Пополнение TON</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 25px;">
                            В демо режиме средства зачисляются мгновенно
                        </p>
                    </div>
                    
                    <div class="amount-input">
                        <input type="number" id="depositAmount" value="100" min="10" max="10000">
                        <span style="font-weight: bold; color: var(--primary);">TON</span>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin: 20px 0;">
                        <button class="btn btn-secondary" onclick="setAmount(100)">100 TON</button>
                        <button class="btn btn-secondary" onclick="setAmount(500)">500 TON</button>
                        <button class="btn btn-secondary" onclick="setAmount(1000)">1000 TON</button>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Текущий баланс:</span>
                            <span style="font-weight: bold;">${currentPlayer.balance} TON</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 18px;">
                            <span>Новый баланс:</span>
                            <span style="font-weight: bold; color: var(--success);" id="newBalance">${currentPlayer.balance + 100} TON</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-cancel" onclick="closeModal()">Отмена</button>
                    <button class="btn btn-confirm" onclick="processDeposit()">
                        <i class="fas fa-check"></i> Пополнить
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // Обновляем новый баланс при изменении суммы
    const amountInput = document.getElementById('depositAmount');
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const newBalanceEl = document.getElementById('newBalance');
            if (newBalanceEl) {
                newBalanceEl.textContent = (currentPlayer.balance + amount).toFixed(2) + ' TON';
            }
        });
    }
}

function openWithdraw() {
    if (currentPlayer.balance < 10) {
        showNotification('Минимальная сумма для вывода: 10 TON', 'warning');
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-money-bill-wave"></i> Вывод средств</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div style="text-align: center; margin: 20px 0;">
                        <i class="fas fa-wallet" style="font-size: 48px; color: #34C759; margin-bottom: 15px;"></i>
                        <h4 style="margin-bottom: 10px;">Вывод TON</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 25px;">
                            В демо режиме вывод обрабатывается мгновенно
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span>Доступно для вывода:</span>
                            <span style="font-weight: bold; color: var(--success);">${currentPlayer.balance} TON</span>
                        </div>
                        
                        <div class="amount-input">
                            <input type="number" id="withdrawAmount" 
                                   value="10" 
                                   min="10" 
                                   max="${currentPlayer.balance}"
                                   step="10">
                            <span style="font-weight: bold; color: var(--primary);">TON</span>
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-secondary" onclick="setWithdrawPercent(0.25)">25%</button>
                            <button class="btn btn-secondary" onclick="setWithdrawPercent(0.5)">50%</button>
                            <button class="btn btn-secondary" onclick="setWithdrawPercent(0.75)">75%</button>
                            <button class="btn btn-secondary" onclick="setWithdrawPercent(1)">100%</button>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Сумма вывода:</span>
                            <span style="font-weight: bold;" id="withdrawSum">10 TON</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Комиссия (3%):</span>
                            <span style="color: var(--warning);" id="withdrawFee">0.3 TON</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 18px;">
                            <span>Вы получите:</span>
                            <span style="font-weight: bold; color: var(--success);" id="withdrawReceive">9.7 TON</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <input type="text" 
                               placeholder="TON адрес кошелька (например: EQABD...)" 
                               style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 8px; color: white;"
                               id="walletAddress">
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-cancel" onclick="closeModal()">Отмена</button>
                    <button class="btn btn-confirm" onclick="processWithdraw()">
                        <i class="fas fa-paper-plane"></i> Вывести
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    updateWithdrawSummary();
}

function processDeposit() {
    const amountInput = document.getElementById('depositAmount');
    if (!amountInput) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    
    if (amount < 10) {
        showNotification('Минимальное пополнение: 10 TON', 'error');
        return;
    }
    
    if (amount > 10000) {
        showNotification('Максимальное пополнение: 10,000 TON', 'error');
        return;
    }
    
    // Зачисляем средства
    currentPlayer.balance += amount;
    currentPlayer.total_deposited += amount;
    
    // Сохраняем транзакцию
    currentPlayer.history.unshift({
        type: 'deposit',
        amount: amount,
        timestamp: new Date().toISOString(),
        status: 'completed'
    });
    
    savePlayerData();
    updateBalance();
    updateHistory();
    
    showNotification(`✅ Баланс пополнен на ${amount} TON!`, 'success');
    closeModal();
}

function processWithdraw() {
    const amountInput = document.getElementById('withdrawAmount');
    const walletInput = document.getElementById('walletAddress');
    
    if (!amountInput || !walletInput) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const wallet = walletInput.value.trim();
    
    if (amount < 10) {
        showNotification('Минимальный вывод: 10 TON', 'error');
        return;
    }
    
    if (amount > currentPlayer.balance) {
        showNotification('Недостаточно средств', 'error');
        return;
    }
    
    if (!wallet || wallet.length < 10) {
        showNotification('Введите корректный адрес кошелька', 'error');
        return;
    }
    
    // Комиссия 3%
    const fee = amount * 0.03;
    const receive = amount - fee;
    
    // Списание средств
    currentPlayer.balance -= amount;
    currentPlayer.total_withdrawn += amount;
    
    // Сохраняем транзакцию
    currentPlayer.history.unshift({
        type: 'withdrawal',
        amount: amount,
        fee: fee,
        receive: receive,
        wallet: wallet,
        timestamp: new Date().toISOString(),
        status: 'completed'
    });
    
    savePlayerData();
    updateBalance();
    updateHistory();
    
    showNotification(`✅ Вывод ${receive.toFixed(2)} TON выполнен!`, 'success');
    closeModal();
}

// ===== ИСТОРИЯ =====
function updateHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList || !currentPlayer) return;
    
    if (currentPlayer.history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-clock"></i>
                <p>Здесь будет отображаться история игр</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    currentPlayer.history.slice(0, 10).forEach(item => {
        if (item.type === 'game') {
            html += `
                <div class="history-item">
                    <div class="history-game">
                        <div class="history-icon">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="history-details">
                            <div class="history-name">${item.game}</div>
                            <div class="history-time">${formatTime(item.timestamp)}</div>
                        </div>
                    </div>
                    <div class="history-result ${item.result}">
                        ${item.result === 'win' ? '+' : '-'}${item.bet} TON
                    </div>
                </div>
            `;
        } else if (item.type === 'deposit') {
            html += `
                <div class="history-item">
                    <div class="history-game">
                        <div class="history-icon" style="background: var(--success);">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="history-details">
                            <div class="history-name">Пополнение</div>
                            <div class="history-time">${formatTime(item.timestamp)}</div>
                        </div>
                    </div>
                    <div class="history-result" style="color: var(--success);">
                        +${item.amount} TON
                    </div>
                </div>
            `;
        } else if (item.type === 'withdrawal') {
            html += `
                <div class="history-item">
                    <div class="history-game">
                        <div class="history-icon" style="background: var(--warning);">
                            <i class="fas fa-minus"></i>
                        </div>
                        <div class="history-details">
                            <div class="history-name">Вывод</div>
                            <div class="history-time">${formatTime(item.timestamp)}</div>
                        </div>
                    </div>
                    <div class="history-result" style="color: var(--warning);">
                        -${item.amount} TON
                    </div>
                </div>
            `;
        }
    });
    
    historyList.innerHTML = html;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || 
                     document.createElement('div');
    
    if (!document.getElementById('notification-container')) {
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function showModal(content) {
    const container = document.getElementById('modal-container') ||
                     document.createElement('div');
    
    if (!document.getElementById('modal-container')) {
        container.id = 'modal-container';
        document.body.appendChild(container);
    }
    
    container.innerHTML = content;
}

function closeModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.innerHTML = '';
    }
}

function setAmount(amount) {
    const input = document.getElementById('depositAmount');
    if (input) {
        input.value = amount;
        
        // Обновляем новый баланс
        const newBalanceEl = document.getElementById('newBalance');
        if (newBalanceEl) {
            newBalanceEl.textContent = (currentPlayer.balance + amount).toFixed(2) + ' TON';
        }
    }
}

function setWithdrawPercent(percent) {
    const amount = Math.floor(currentPlayer.balance * percent);
    const minAmount = 10;
    const finalAmount = Math.max(minAmount, amount);
    
    const input = document.getElementById('withdrawAmount');
    if (input) {
        input.value = finalAmount;
        updateWithdrawSummary();
    }
}

function updateWithdrawSummary() {
    const amountInput = document.getElementById('withdrawAmount');
    if (!amountInput) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const fee = amount * 0.03;
    const receive = amount - fee;
    
    document.getElementById('withdrawSum').textContent = amount.toFixed(2) + ' TON';
    document.getElementById('withdrawFee').textContent = fee.toFixed(2) + ' TON';
    document.getElementById('withdrawReceive').textContent = receive.toFixed(2) + ' TON';
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    });
}

function switchTab(tab) {
    // В будущем можно добавить переключение вкладок
    showNotification(`Переключено на вкладку: ${tab}`, 'info');
}

function toggleAdmin() {
    if (currentPlayer && currentPlayer.is_admin) {
        showNotification('Админ панель доступна', 'info');
        // Можно добавить админ функционал
    }
}

function updateLiveStats() {
    // Обновление онлайн статистики
    setInterval(() => {
        const onlineCount = document.getElementById('onlineCount');
        const todayWins = document.getElementById('todayWins');
        const gamesCount = document.getElementById('gamesCount');
        
        if (onlineCount) {
            const current = parseInt(onlineCount.textContent.replace(',', '')) || 1589;
            const change = Math.floor(Math.random() * 21) - 10;
            onlineCount.textContent = Math.max(1500, current + change).toLocaleString();
        }
        
        if (todayWins) {
            const current = parseFloat(todayWins.textContent.replace('M', '')) || 8.7;
            const change = (Math.random() * 0.5 - 0.25);
            todayWins.textContent = (Math.max(5, current + change)).toFixed(1) + 'M';
        }
        
        if (gamesCount) {
            const current = parseInt(gamesCount.textContent.replace(',', '')) || 15239;
            const change = Math.floor(Math.random() * 100);
            gamesCount.textContent = (current + change).toLocaleString();
        }
    }, 10000);
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.openDeposit = openDeposit;
window.openWithdraw = openWithdraw;
window.closeModal = closeModal;
window.setAmount = setAmount;
window.setWithdrawPercent = setWithdrawPercent;
window.processDeposit = processDeposit;
window.processWithdraw = processWithdraw;
window.switchTab = switchTab;
window.toggleAdmin = toggleAdmin;