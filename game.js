// 游戏配置
const gameConfig = {
    maxWords: 20,
    bonusTimePoints: 100,
    penaltyPoints: -5,
    particleCount: 30,
    defaultWordList: [
        { english: "apple", chinese: "苹果" },
        { english: "book", chinese: "书" },
        { english: "cat", chinese: "猫" },
        { english: "dog", chinese: "狗" },
        { english: "elephant", chinese: "大象" }
    ],
    difficulties: {
        easy: { timeLimit: 120000, scoreMultiplier: 1 },
        normal: { timeLimit: 90000, scoreMultiplier: 1.5 },
        hard: { timeLimit: 60000, scoreMultiplier: 2 }
    }
};

// 游戏状态
const gameState = {
    words: [],
    selectedWord: null,
    matchedPairs: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    mistakes: {},
    gameMode: 'drag',
    isDragging: false,
    dragStartPos: { x: 0, y: 0 },
    dragEndPos: { x: 0, y: 0 },
    connections: [],
    difficulty: 'normal',
    timeLimit: 0,
    timer: null,
    soundEnabled: true,
    isPaused: false
};

// DOM 元素引用
const elements = {
    gameContainer: document.getElementById('gameContainer'),
    englishWords: document.getElementById('englishWords'),
    chineseWords: document.getElementById('chineseWords'),
    connectionCanvas: document.getElementById('connectionCanvas'),
    scoreElement: document.getElementById('score'),
    comboElement: document.getElementById('combo'),
    timerElement: document.getElementById('timer'),
    mistakeList: document.getElementById('mistakeList')
};

// 初始化游戏
function initGame() {
    loadGameProgress();
    setupEventListeners();
    initializeCanvas();
    renderUI();
    startGame();
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isPaused) {
        updateGame();
        renderGame();
    }
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function updateGame() {
    updateTimer();
    updateScore();
    checkGameEnd();
}

// 渲染游戏
function renderGame() {
    renderWordCards();
    drawConnections();
    updateUI();
}

// 开始新游戏
function startGame() {
    resetGameState();
    loadWords();
    startTimer();
    gameLoop();
}

// 重置游戏状态
function resetGameState() {
    Object.assign(gameState, {
        score: 0,
        combo: 0,
        maxCombo: 0,
        matchedPairs: [],
        connections: [],
        isPaused: false
    });
}

// 加载单词
function loadWords() {
    if (gameState.words.length === 0) {
        gameState.words = [...gameConfig.defaultWordList];
    }
    shuffleArray(gameState.words);
}

// 渲染UI
function renderUI() {
    elements.scoreElement.textContent = `得分: ${gameState.score}`;
    elements.comboElement.textContent = gameState.combo > 1 ? `${gameState.combo}连击!` : '';
    updateMistakeList();
}

// ... 其他现有函数保持不变 ...
