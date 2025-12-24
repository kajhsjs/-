// ===== ИГРОВОЙ ДВИЖОК =====

// Класс для игры в кости
class DiceGame {
    constructor(betAmount) {
        this.betAmount = betAmount;
        this.dice1 = 1;
        this.dice2 = 1;
        this.result = 0;
        this.prediction = null;
    }
    
    createInterface() {
        return `
            <div class="game-modal">
                <div class="game-header">
                    <h3><i class="fas fa-dice"></i> Игра в кости</h3>
                    <div class="game-bet">Ставка: ${this.betAmount} TON</div>
                </div>
                
                <div class="game-body">
                    <div class="dice-prediction">
                        <div class="prediction-title">Выберите прогноз:</div>
                        <div class="prediction-options">
                            <button class="prediction-btn" data-type="low" onclick="selectPrediction('low')">
                                <i class="fas fa-arrow-down"></i>
                                <span>Меньше 7</span>
                                <small>2x</small>
                            </button>
                            <button class="prediction-btn active" data-type="seven" onclick="selectPrediction('seven')">
                                <i class="fas fa-equals"></i>
                                <span>Равно 7</span>
                                <small>5x</small>
                            </button>
                            <button class="prediction-btn" data-type="high" onclick="selectPrediction('high')">
                                <i class="fas fa-arrow-up"></i>
                                <span>Больше 7</span>
                                <small>2x</small>
                            </button>
                        </div>
                    </div>
                    
                    <div class="dice-container">
                        <div class="dice" id="dice1">⚀</div>
                        <div class="dice" id="dice2">⚀</div>
                    </div>
                    
                    <div class="dice-result" id="diceResult">
                        <div class="result-text">Сумма: <span id="diceSum">2</span></div>
                        <div class="result-prediction" id="resultPrediction">Меньше 7</div>
                    </div>
                </div>
                
                <div class="game-footer">
                    <button class="btn btn-primary" onclick="rollDice()">
                        <i class="fas fa-play"></i> Бросить кости
                    </button>
                    <button class="btn btn-secondary" onclick="closeGame()">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `;
    }
    
    roll() {
        this.dice1 = Math.floor(Math.random() * 6) + 1;
        this.dice2 = Math.floor(Math.random() * 6) + 1;
        this.result = this.dice1 + this.dice2;
        
        // Определяем выигрыш
        let win = false;
        switch(this.prediction) {
            case 'low':
                win = this.result < 7;
                break;
            case 'seven':
                win = this.result === 7;
                break;
            case 'high':
                win = this.result > 7;
                break;
        }
        
        return {
            dice1: this.dice1,
            dice2: this.dice2,
            result: this.result,
            win: win,
            multiplier: win ? (this.prediction === 'seven' ? 5 : 2) : 0
        };
    }
}

// Класс для слотов
class SlotsGame {
    constructor(betAmount) {
        this.betAmount = betAmount;
        this.reels = ['🍒', '🍋', '🍊', '⭐', '7️⃣', '🔔'];
        this.result = [];
    }
    
    createInterface() {
        return `
            <div class="game-modal">
                <div class="game-header">
                    <h3><i class="fas fa-sliders-h"></i> Игровые автоматы</h3>
                    <div class="game-bet">Ставка: ${this.betAmount} TON</div>
                </div>
                
                <div class="game-body">
                    <div class="slots-machine">
                        <div class="reels">
                            <div class="reel" id="reel1">🍒</div>
                            <div class="reel" id="reel2">🍒</div>
                            <div class="reel" id="reel3">🍒</div>
                        </div>
                        <div class="payline"></div>
                    </div>
                    
                    <div class="slots-result" id="slotsResult">
                        <div class="result-text">Крутите барабаны!</div>
                        <div class="win-amount" id="winAmount">0x</div>
                    </div>
                    
                    <div class="paytable">
                        <h4>Выигрышные комбинации:</h4>
                        <div class="paytable-grid">
                            <div class="paytable-item">
                                <span>7️⃣7️⃣7️⃣</span>
                                <span class="multiplier">100x</span>
                            </div>
                            <div class="paytable-item">
                                <span>⭐⭐⭐</span>
                                <span class="multiplier">50x</span>
                            </div>
                            <div class="paytable-item">
                                <span>🔔🔔🔔</span>
                                <span class="multiplier">25x</span>
                            </div>
                            <div class="paytable-item">
                                <span>🍒🍒🍒</span>
                                <span class="multiplier">10x</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="game-footer">
                    <button class="btn btn-primary" onclick="spinSlots()">
                        <i class="fas fa-play"></i> Крутить
                    </button>
                    <button class="btn btn-secondary" onclick="closeGame()">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `;
    }
    
    spin() {
        this.result = [
            this.reels[Math.floor(Math.random() * this.reels.length)],
            this.reels[Math.floor(Math.random() * this.reels.length)],
            this.reels[Math.floor(Math.random() * this.reels.length)]
        ];
        
        // Проверяем комбинации
        let multiplier = 0;
        let winType = '';
        
        if (this.result[0] === '7️⃣' && this.result[1] === '7️⃣' && this.result[2] === '7️⃣') {
            multiplier = 100;
            winType = 'ДЖЕКПОТ! 7️⃣7️⃣7️⃣';
        } else if (this.result[0] === '⭐' && this.result[1] === '⭐' && this.result[2] === '⭐') {
            multiplier = 50;
            winType = '⭐⭐⭐';
        } else if (this.result[0] === '🔔' && this.result[1] === '🔔' && this.result[2] === '🔔') {
            multiplier = 25;
            winType = '🔔🔔🔔';
        } else if (this.result[0] === '🍒' && this.result[1] === '🍒' && this.result[2] === '🍒') {
            multiplier = 10;
            winType = '🍒🍒🍒';
        } else if (this.result[0] === this.result[1] || this.result[1] === this.result[2]) {
            multiplier = 2;
            winType = 'Пара';
        }
        
        return {
            result: this.result,
            win: multiplier > 0,
            multiplier: multiplier,
            winType: winType
        };
    }
}

// Глобальные переменные для игр
let currentGameInstance = null;
let currentGameType = null;

// Функция запуска игры
window.launchGame = function(gameId, betAmount) {
    currentGameType = gameId;
    
    // Закрываем предыдущую игру
    closeGame();
    
    // Создаем игру
    let gameInterface = '';
    
    switch(gameId) {
        case 'dice':
            currentGameInstance = new DiceGame(betAmount);
            gameInterface = currentGameInstance.createInterface();
            break;
        case 'slots':
            currentGameInstance = new SlotsGame(betAmount);
            gameInterface = currentGameInstance.createInterface();
            break;
        default:
            alert('Игра временно недоступна');
            return;
    }
    
    // Создаем модальное окно для игры
    const gameModal = document.createElement('div');
    gameModal.className = 'game-overlay';
    gameModal.innerHTML = gameInterface;
    document.body.appendChild(gameModal);
};

// Глобальные функции для игр
window.selectPrediction = function(type) {
    if (currentGameInstance && currentGameInstance.prediction) {
        currentGameInstance.prediction = type;
        
        // Обновляем кнопки
        document.querySelectorAll('.prediction-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.prediction-btn').classList.add('active');
    }
};

window.rollDice = function() {
    if (!currentGameInstance || !currentGameInstance.prediction) {
        alert('Выберите прогноз перед броском!');
        return;
    }
    
    const result = currentGameInstance.roll();
    
    // Обновляем интерфейс
    document.getElementById('dice1').textContent = getDiceSymbol(result.dice1);
    document.getElementById('dice2').textContent = getDiceSymbol(result.dice2);
    document.getElementById('diceSum').textContent = result.result;
    
    if (result.win) {
        const winAmount = currentGameInstance.betAmount * result.multiplier;
        document.getElementById('resultPrediction').innerHTML = 
            `🎉 ВЫИГРЫШ ${result.multiplier}x! +${winAmount} TON`;
        document.getElementById('resultPrediction').style.color = '#34c759';
        
        // Обновляем баланс
        if (window.currentPlayer) {
            window.currentPlayer.balance += winAmount;
            window.updateBalance();
            window.showNotification(`Вы выиграли ${winAmount} TON!`, 'success');
        }
    } else {
        document.getElementById('resultPrediction').innerHTML = 
            '😔 Проигрыш. Попробуйте еще раз!';
        document.getElementById('resultPrediction').style.color = '#ff3b30';
    }
};

window.spinSlots = function() {
    if (!currentGameInstance) return;
    
    const result = currentGameInstance.spin();
    
    // Анимация барабанов
    const reels = document.querySelectorAll('.reel');
    reels.forEach((reel, index) => {
        reel.textContent = result.result[index];
        reel.style.animation = 'spin 0.5s ease';
    });
    
    // Показываем результат
    const resultElement = document.getElementById('slotsResult');
    const winAmountElement = document.getElementById('winAmount');
    
    if (result.win) {
        const winAmount = currentGameInstance.betAmount * result.multiplier;
        resultElement.innerHTML = `<div class="result-text" style="color: #34c759;">${result.winType}</div>`;
        winAmountElement.textContent = `${result.multiplier}x! +${winAmount} TON`;
        winAmountElement.style.color = '#34c759';
        
        // Обновляем баланс
        if (window.currentPlayer) {
            window.currentPlayer.balance += winAmount;
            window.updateBalance();
            window.showNotification(`ДЖЕКПОТ! Вы выиграли ${winAmount} TON!`, 'success');
        }
    } else {
        resultElement.innerHTML = '<div class="result-text">Попробуйте еще раз!</div>';
        winAmountElement.textContent = '0x';
        winAmountElement.style.color = '#ff3b30';
    }
    
    // Убираем анимацию
    setTimeout(() => {
        reels.forEach(reel => {
            reel.style.animation = '';
        });
    }, 500);
};

window.closeGame = function() {
    const gameOverlay = document.querySelector('.game-overlay');
    if (gameOverlay) {
        gameOverlay.remove();
    }
    currentGameInstance = null;
    currentGameType = null;
};

// Вспомогательные функции
function getDiceSymbol(value) {
    const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceSymbols[value - 1] || '⚀';
}

// Добавляем стили для игр
const gameStyles = `
    <style>
        .game-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            padding: 20px;
        }
        
        .game-modal {
            background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(26, 26, 26, 0.95));
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .game-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .game-header h3 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .game-bet {
            background: rgba(0, 136, 204, 0.2);
            padding: 8px 15px;
            border-radius: 10px;
            font-weight: bold;
            color: #0088cc;
        }
        
        .game-body {
            margin: 25px 0;
        }
        
        .dice-prediction {
            margin-bottom: 30px;
        }
        
        .prediction-title {
            font-size: 16px;
            margin-bottom: 15px;
            color: #8e8e93;
        }
        
        .prediction-options {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .prediction-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            color: white;
        }
        
        .prediction-btn.active {
            background: rgba(0, 136, 204, 0.3);
            border-color: #0088cc;
            transform: translateY(-2px);
        }
        
        .prediction-btn small {
            display: block;
            font-size: 12px;
            color: #ff9500;
            margin-top: 5px;
            font-weight: bold;
        }
        
        .dice-container {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 40px 0;
        }
        
        .dice {
            font-size: 80px;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 20px;
            color: black;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transition: transform 0.5s;
        }
        
        .dice-result {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
        }
        
        .result-text {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .result-prediction {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        /* Slots стили */
        .slots-machine {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
        }
        
        .reels {
            display: flex;
            justify-content: center;
            gap: 20px;
        }
        
        .reel {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .payline {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 4px;
            background: #0088cc;
            transform: translateY(-50%);
            box-shadow: 0 0 10px #0088cc;
        }
        
        .slots-result {
            text-align: center;
            margin: 25px 0;
        }
        
        .win-amount {
            font-size: 32px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .paytable {
            margin-top: 30px;
        }
        
        .paytable h4 {
            font-size: 16px;
            margin-bottom: 15px;
            color: #8e8e93;
        }
        
        .paytable-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .paytable-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 12px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .multiplier {
            color: #ff9500;
            font-weight: bold;
        }
        
        .game-footer {
            display: flex;
            gap: 15px;
        }
        
        .game-footer .btn {
            flex: 1;
            padding: 15px;
            font-size: 16px;
        }
        
        @keyframes spin {
            0% { transform: rotateX(0); }
            100% { transform: rotateX(360deg); }
        }
        
        @media (max-width: 480px) {
            .game-modal {
                padding: 20px;
            }
            
            .dice {
                font-size: 60px;
                width: 70px;
                height: 70px;
            }
            
            .prediction-options {
                flex-direction: column;
            }
            
            .reel {
                width: 60px;
                height: 60px;
                font-size: 30px;
            }
        }
    </style>
`;

// Добавляем стили в документ
document.head.insertAdjacentHTML('beforeend', gameStyles);