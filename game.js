// 游戏状态管理
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

// DOM 元素引用
const elements = {
    englishWords: document.getElementById('englishWords'),
    chineseWords: document.getElementById('chineseWords'),
    connectionCanvas: document.getElementById('connectionCanvas'),
    scoreElement: document.getElementById('score'),
    remainingElement: document.getElementById('remaining'),
    fileInput: document.getElementById('fileInput'),
    restartBtn: document.getElementById('restartBtn'),
    exportBtn: document.getElementById('exportBtn'),
    dragModeBtn: document.getElementById('dragModeBtn'),
    clickModeBtn: document.getElementById('clickModeBtn'),
    mistakeList: document.getElementById('mistakeList'),
    successSound: document.getElementById('successSound'),
    errorSound: document.getElementById('errorSound'),
    templateBtn: document.getElementById('templateBtn'),
    uploadZone: document.getElementById('uploadZone'),
    particlesContainer: document.getElementById('particlesContainer')
};

// 初始化游戏
function initGame() {
    console.log('开始初始化游戏...');
    
    try {
        showLoading(true);
        setupElements();
        initCanvas();
        gameState.words = [...defaultWords];
        shuffleArray(gameState.words);
        gameState.words = gameState.words.slice(0, 10);
        renderWordCards();
        updateScore();
        loadMistakes();
        bindEvents();
        setupDragAndDrop();
        
        console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showFriendlyError('游戏加载过程中出现错误，请刷新页面重试。');
    } finally {
        showLoading(false);
    }
}

// 设置拖放区域
function setupDragAndDrop() {
    const uploadZone = elements.uploadZone;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('drag-over');
        });
    });
    
    uploadZone.addEventListener('drop', handleFileDrop);
}

// 阻止默认行为
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 处理文件拖放
function handleFileDrop(e) {
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    const reader = new FileReader();
    
    if (file.name.endsWith('.txt')) {
        reader.onload = handleTxtFile;
        reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
        reader.onload = handleXlsxFile;
        reader.readAsArrayBuffer(file);
    } else {
        showFriendlyError('不支持的文件格式，请使用 .txt 或 .xlsx 文件');
    }
}

// 显示/隐藏加载提示
function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// 显示友好错误提示
function showFriendlyError(message) {
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        gameArea.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="location.reload()">刷新页面</button>
            </div>
        `;
    } else {
        alert(message);
    }
}