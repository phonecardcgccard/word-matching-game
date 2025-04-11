// 添加游戏配置选项
const gameConfig = {
    maxWords: 20,
    bonusTimePoints: 100,
    penaltyPoints: -5,
    particleCount: 30,
    defaultWordList: [
        { english: "apple", chinese: "苹果" },
        { english: "book", chinese: "书" },
        // ... 更多默认单词
    ]
};

// 在 gameState 中添加新属性
const gameState = {
    // ... 现有属性 ...
    bonusPoints: 0,
    combo: 0,
    maxCombo: 0,
    lastMatchTime: 0,
    statistics: {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        averageTime: 0
    }
};

// 添加统计功能
function updateStatistics() {
    const stats = gameState.statistics;
    stats.totalGames++;
    stats.totalScore += gameState.score;
    stats.bestScore = Math.max(stats.bestScore, gameState.score);
    
    localStorage.setItem('gameStats', JSON.stringify(stats));
}

// 改进计分系统
function updateScore(points) {
    if (points > 0) {
        gameState.combo++;
        gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
        
        // 计算连击加成
        const comboBonus = Math.floor(gameState.combo / 3) * 5;
        points += comboBonus;
        
        // 计算时间加成
        const now = Date.now();
        if (gameState.lastMatchTime && (now - gameState.lastMatchTime < 2000)) {
            points += gameConfig.bonusTimePoints;
        }
        gameState.lastMatchTime = now;
    } else {
        gameState.combo = 0;
    }
    
    gameState.score += points;
    elements.scoreElement.textContent = gameState.score;
}

// 添加进度保存功能
function saveProgress() {
    const progress = {
        score: gameState.score,
        matchedPairs: gameState.matchedPairs,
        mistakes: gameState.mistakes,
        timeRemaining: gameState.timeLimit
    };
    localStorage.setItem('gameProgress', JSON.stringify(progress));
}

// 加载进度
function loadProgress() {
    const savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        Object.assign(gameState, progress);
        updateScore(0);
        updateMistakeList();
    }
}

// 改进粒子效果
function createMatchParticles(card1, card2) {
    const container = elements.particlesContainer;
    const center1 = getCardCenter(card1);
    const center2 = getCardCenter(card2);
    const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];
    
    // 添加连击特效
    if (gameState.combo > 2) {
        colors.push('#FF9800', '#F44336');
    }
    
    for (let i = 0; i < (gameConfig.particleCount + Math.min(gameState.combo * 2, 20)); i++) {
        // ... 现有粒子创建代码 ...
    }
}

// 添加游戏结束统计
function showGameSummary() {
    const summary = document.createElement('div');
    summary.className = 'game-summary';
    summary.innerHTML = `
        <h2>游戏统计</h2>
        <p>最终得分: ${gameState.score}</p>
        <p>最大连击: ${gameState.maxCombo}</p>
        <p>错误次数: ${Object.keys(gameState.mistakes).length}</p>
        <p>用时: ${Math.floor((gameState.timeLimit - gameState.timer) / 1000)}秒</p>
        <button onclick="restartGame()">再来一局</button>
    `;
    document.body.appendChild(summary);
}

// 改进初始化函数
function initGame() {
    // ... 现有初始化代码 ...
    
    // 加载统计数据
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
        gameState.statistics = JSON.parse(savedStats);
    }
    
    // 加载上次进度
    loadProgress();
    
    if (gameState.timeLimit > 0) {
        startTimer();
    }
}
