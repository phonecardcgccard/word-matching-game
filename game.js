// 游戏状态
const gameState = {
    words: [],
    selectedWord: null,
    matchedPairs: [],
    score: 0,
    mistakes: {},
    gameMode: 'drag',
    isDragging: false,
    dragStartPos: { x: 0, y: 0 },
    dragEndPos: { x: 0, y: 0 },
    connections: []
};

// 初始化游戏
function initGame() {
    console.log('开始初始化游戏...');
    
    try {
        setupElements();
        initCanvas();
        gameState.words = [...defaultWords];
        shuffleArray(gameState.words);
        gameState.words = gameState.words.slice(0, 10);
        renderWordCards();
        updateScore();
        loadMistakes();
        bindEvents();
        
        console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showFriendlyError('游戏加载过程中出现错误，请刷新页面重试。');
    }
}

// 初始化画布
function initCanvas() {
    const canvas = elements.connectionCanvas;
    const container = document.querySelector('.game-area');
    if (canvas && container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
}

// 绑定事件
function bindEvents() {
    window.addEventListener('resize', initCanvas);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.exportBtn.addEventListener('click', exportMistakes);
    elements.dragModeBtn.addEventListener('click', () => setGameMode('drag'));
    elements.clickModeBtn.addEventListener('click', () => setGameMode('click'));
    elements.fileInput.addEventListener('change', handleFileInput);
}

// 设置游戏模式
function setGameMode(mode) {
    gameState.gameMode = mode;
    document.querySelectorAll('.word-card').forEach(card => {
        if (mode === 'drag') {
            setupDragEvents(card);
        } else {
            card.draggable = false;
        }
    });
}

// 重启游戏
function restartGame() {
    gameState.words = [];
    gameState.selectedWord = null;
    gameState.matchedPairs = [];
    gameState.score = 0;
    initGame();
}

// 导出错题
function exportMistakes() {
    const mistakes = Object.entries(gameState.mistakes).map(([word, count]) => ({
        word,
        count
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(mistakes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "错题本");
    XLSX.writeFile(workbook, "mistakes.xlsx");
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

// 工具函数：打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);