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
// 优化初始化函数
function initGame() {
    console.log('开始初始化游戏...');
    
    try {
        // 显示加载提示
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // 异步初始化
        Promise.all([
            setupElements(),
            initCanvas(),
            loadAudioResources()
        ]).then(() => {
            gameState.words = [...defaultWords];
            shuffleArray(gameState.words);
            gameState.words = gameState.words.slice(0, 10);
            renderWordCards();
            updateScore();
            loadMistakes();
            bindEvents();
            
            console.log('游戏初始化完成');
        }).catch(error => {
            console.error('游戏初始化失败:', error);
            showFriendlyError('游戏加载过程中出现错误，请刷新页面重试。');
        }).finally(() => {
            // 隐藏加载提示
            document.getElementById('loadingIndicator').style.display = 'none';
        });
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showFriendlyError('游戏加载过程中出现错误，请刷新页面重试。');
    }
}

// 加载音频资源
function loadAudioResources() {
    return new Promise((resolve, reject) => {
        const audioFiles = [
            { id: 'successSound', src: 'assets/success.mp3' },
            { id: 'errorSound', src: 'assets/error.mp3' }
        ];
        
        let loadedCount = 0;
        
        audioFiles.forEach(audio => {
            const element = document.getElementById(audio.id);
            if (element) {
                element.addEventListener('canplaythrough', () => {
                    loadedCount++;
                    if (loadedCount === audioFiles.length) {
                        resolve();
                    }
                }, { once: true });
                
                element.addEventListener('error', reject);
            }
        });
    });
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

// 处理匹配成功
function handleMatch(card1, card2) {
    gameState.matchedPairs.push([card1, card2]);
    card1.classList.add('matched');
    card2.classList.add('matched');
    gameState.score += 10;
    updateScore();
    playSound('success');
}

// 处理匹配失败
function handleMismatch(card1, card2) {
    card1.classList.add('error');
    card2.classList.add('error');
    
    // 记录错误
    const word = card1.dataset.type === 'english' ? card1.dataset.word : card2.dataset.word;
    gameState.mistakes[word] = (gameState.mistakes[word] || 0) + 1;
    saveMistakes();
    updateMistakeList();
    
    playSound('error');
    
    setTimeout(() => {
        card1.classList.remove('error');
        card2.classList.remove('error');
    }, 1000);
}

// 绘制连线
function drawConnection() {
    const canvas = elements.connectionCanvas;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState.isDragging) {
        ctx.beginPath();
        ctx.moveTo(gameState.dragStartPos.x, gameState.dragStartPos.y);
        ctx.lineTo(gameState.dragEndPos.x, gameState.dragEndPos.y);
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
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

// 处理文件导入
function handleFileInput(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    if (file.name.endsWith('.txt')) {
        reader.onload = handleTxtFile;
        reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
        reader.onload = handleXlsxFile;
        reader.readAsArrayBuffer(file);
    }
}

// 处理 txt 文件
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

// 处理 xlsx 文件
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

// 检查匹配
function checkMatch(card1, card2) {
    if (card1.dataset.type === card2.dataset.type) return false;
    return card1.dataset.pair === card2.dataset.word;
}