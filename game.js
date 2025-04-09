// ... 前面的代码保持不变 ...
// 改进游戏状态管理
const gameState = {
    // ... 保持现有状态属性
    isDragging: false,
    dragStartPos: { x: 0, y: 0 },
    dragEndPos: { x: 0, y: 0 },
    connections: [],
    difficulty: 'normal',
    timeLimit: 0,
    timer: null,
    soundEnabled: true
};

// 在 initGame 函数末尾添加
function initGame() {
    if (gameState.timeLimit > 0) {
        startTimer();
    }
}

// 添加难度和计时相关函数
function setDifficulty(level) {
    gameState.difficulty = level;
    switch(level) {
        case 'easy': gameState.timeLimit = 120000; break;
        case 'normal': gameState.timeLimit = 90000; break;
        case 'hard': gameState.timeLimit = 60000; break;
    }
    restartGame();
}

// DOM 元素引用
const elements = {
    englishWords: null,
    chineseWords: null,
    connectionCanvas: null,
    scoreElement: null,
    remainingElement: null,
    fileInput: null,
    restartBtn: null,
    exportBtn: null,
    dragModeBtn: null,
    clickModeBtn: null,
    mistakeList: null,
    successSound: null,
    errorSound: null,
    particlesContainer: null
};

// ... 保持现有的其他函数不变 ...

// 改进计时器功能
function startTimer() {
    const startTime = Date.now();
    const timerElement = document.getElementById('timer');
    
    gameState.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, gameState.timeLimit - elapsed);
        
        if (remaining === 0) {
            clearInterval(gameState.timer);
            handleTimeUp();
        }
        
        timerElement.textContent = `剩余时间: ${Math.ceil(remaining / 1000)}秒`;
    }, 100);
}

// 处理时间到
function handleTimeUp() {
    showFriendlyError(`时间到！您的得分是: ${gameState.score}`, 3000);
    setTimeout(() => restartGame(), 3000);
}

// 改进错误提示
function showFriendlyError(message, duration = 3000) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-toast';
    errorContainer.textContent = message;
    
    document.body.appendChild(errorContainer);
    
    setTimeout(() => {
        errorContainer.classList.add('fade-out');
        setTimeout(() => errorContainer.remove(), 300);
    }, duration);
}

// 改进音效控制
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
        soundBtn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    }
}

// 改进音效播放
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    try {
        const sound = type === 'success' ? elements.successSound : elements.errorSound;
        if (sound) {
            sound.currentTime = 0;
            sound.volume = 0.5;
            sound.play().catch(err => console.log('音效播放失败:', err));
        }
    } catch (error) {
        console.error('音效处理错误:', error);
    }
}

// 改进粒子效果
function createMatchParticles(card1, card2) {
    const container = elements.particlesContainer;
    const center1 = getCardCenter(card1);
    const center2 = getCardCenter(card2);
    const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${center1.x}px`;
        particle.style.top = `${center1.y}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 2 + Math.random() * 3;
        const lifetime = 1000 + Math.random() * 1000;
        
        particle.style.setProperty('--tx', `${Math.cos(angle) * velocity * 50}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * velocity * 50}px`);
        particle.style.animation = `particle ${lifetime}ms ease-out forwards`;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), lifetime);
    }
}

// 获取卡片中心点
function getCardCenter(card) {
    const rect = card.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// 绘制连线
function drawConnection() {
    const canvas = elements.connectionCanvas;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制当前拖拽线
    if (gameState.isDragging) {
        ctx.beginPath();
        ctx.moveTo(gameState.dragStartPos.x, gameState.dragStartPos.y);
        ctx.lineTo(gameState.dragEndPos.x, gameState.dragEndPos.y);
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 绘制已匹配的连线
    gameState.connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.start.x, conn.start.y);
        ctx.lineTo(conn.end.x, conn.end.y);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    if (gameState.isDragging) {
        requestAnimationFrame(drawConnection);
    }
}

// 清除连线
function clearConnections() {
    const canvas = elements.connectionCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 更新分数
function updateScore() {
    elements.scoreElement.textContent = gameState.score;
    elements.remainingElement.textContent = 
        gameState.words.length - gameState.matchedPairs.length;
}

// 加载错题本
function loadMistakes() {
    const savedMistakes = localStorage.getItem('mistakes');
    if (savedMistakes) {
        gameState.mistakes = JSON.parse(savedMistakes);
        updateMistakeList();
    }
}

// 保存错题本
function saveMistakes() {
    localStorage.setItem('mistakes', JSON.stringify(gameState.mistakes));
}

// 更新错题列表
function updateMistakeList() {
    const list = elements.mistakeList;
    list.innerHTML = '';
    
    Object.entries(gameState.mistakes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([word, count]) => {
            const item = document.createElement('div');
            item.textContent = `${word}: ${count}次`;
            list.appendChild(item);
        });
}

// 导出错题本
function exportMistakes() {
    const mistakes = Object.entries(gameState.mistakes).map(([word, count]) => ({
        word,
        count,
        timestamp: new Date().toISOString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(mistakes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "错题本");
    XLSX.writeFile(workbook, "mistakes.xlsx");
}

// 重启游戏
function restartGame() {
    gameState.words = [];
    gameState.selectedWord = null;
    gameState.matchedPairs = [];
    gameState.score = 0;
    gameState.connections = [];
    clearConnections();
    initGame();
}

// 设置游戏模式
function setGameMode(mode) {
    gameState.gameMode = mode;
    renderWordCards();
}

// 工具函数：打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 播放音效
function playSound(type) {
    try {
        const sound = type === 'success' ? elements.successSound : elements.errorSound;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.log('音效播放失败:', err));
        }
    } catch (error) {
        console.error('音效处理错误:', error);
    }
}

// 处理 TXT 文件
function handleTxtFile(e) {
    const content = e.target.result;
    const lines = content.split('\n');
    const words = lines.map(line => {
        const [english, chinese] = line.trim().split(',');
        return { english, chinese };
    }).filter(pair => pair.english && pair.chinese);
    
    if (words.length > 0) {
        gameState.words = words;
        restartGame();
    }
}

// 处理 XLSX 文件
function handleXlsxFile(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const words = XLSX.utils.sheet_to_json(worksheet).map(row => ({
        english: row.english || row.English || '',
        chinese: row.chinese || row.Chinese || ''
    })).filter(pair => pair.english && pair.chinese);
    
    if (words.length > 0) {
        gameState.words = words;
        restartGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);