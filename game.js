// ... 前面的代码保持不变 ...

// 绑定事件
function bindEvents() {
    elements.restartBtn.addEventListener('click', restartGame);
    elements.exportBtn.addEventListener('click', exportMistakes);
    elements.dragModeBtn.addEventListener('click', () => setGameMode('drag'));
    elements.clickModeBtn.addEventListener('click', () => setGameMode('click'));
    elements.fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
    elements.templateBtn.addEventListener('click', downloadTemplate);
    window.addEventListener('resize', initCanvas);
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

// 渲染单词卡片
function renderWordCards() {
    elements.englishWords.innerHTML = '';
    elements.chineseWords.innerHTML = '';
    
    const englishWords = [...gameState.words];
    const chineseWords = [...gameState.words];
    
    shuffleArray(englishWords);
    shuffleArray(chineseWords);
    
    englishWords.forEach(word => {
        const card = createWordCard(word.english, 'english', word);
        elements.englishWords.appendChild(card);
    });
    
    chineseWords.forEach(word => {
        const card = createWordCard(word.chinese, 'chinese', word);
        elements.chineseWords.appendChild(card);
    });
}

// 创建单词卡片
function createWordCard(text, type, originalPair) {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.textContent = text;
    card.dataset.type = type;
    card.dataset.word = text;
    card.dataset.pair = type === 'english' ? originalPair.chinese : originalPair.english;
    
    if (gameState.gameMode === 'click') {
        card.addEventListener('click', () => handleCardClick(card));
    } else {
        setupDragEvents(card);
    }
    
    return card;
}

// 设置拖拽事件
function setupDragEvents(card) {
    card.draggable = true;
    card.addEventListener('dragstart', e => handleDragStart(e, card));
    card.addEventListener('dragend', e => handleDragEnd(e, card));
    card.addEventListener('dragover', e => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    });
    card.addEventListener('dragleave', e => {
        e.currentTarget.classList.remove('drag-over');
    });
    card.addEventListener('drop', e => handleDrop(e, card));
    
    // 触摸事件支持
    card.addEventListener('touchstart', e => handleTouchStart(e, card), { passive: false });
    card.addEventListener('touchmove', e => handleTouchMove(e), { passive: false });
    card.addEventListener('touchend', e => handleTouchEnd(e, card));
}

// 处理卡片点击
function handleCardClick(card) {
    if (card.classList.contains('matched')) return;
    
    if (gameState.selectedWord) {
        if (gameState.selectedWord === card) {
            card.classList.remove('selected');
            gameState.selectedWord = null;
            return;
        }
        
        const isMatch = checkMatch(gameState.selectedWord, card);
        if (isMatch) {
            handleMatch(gameState.selectedWord, card);
        } else {
            handleMismatch(gameState.selectedWord, card);
        }
        
        gameState.selectedWord.classList.remove('selected');
        gameState.selectedWord = null;
    } else {
        card.classList.add('selected');
        gameState.selectedWord = card;
    }
}

// 处理拖拽开始
function handleDragStart(e, card) {
    if (card.classList.contains('matched')) return;
    
    gameState.isDragging = true;
    gameState.selectedWord = card;
    card.classList.add('selected');
    
    const rect = card.getBoundingClientRect();
    gameState.dragStartPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
    
    requestAnimationFrame(drawConnection);
}

// 处理拖拽结束
function handleDragEnd(e, card) {
    gameState.isDragging = false;
    card.classList.remove('selected');
    gameState.selectedWord = null;
    clearConnections();
}

// 处理拖拽放下
function handleDrop(e, card) {
    e.preventDefault();
    card.classList.remove('drag-over');
    
    if (!gameState.selectedWord || gameState.selectedWord === card) return;
    
    const isMatch = checkMatch(gameState.selectedWord, card);
    if (isMatch) {
        handleMatch(gameState.selectedWord, card);
    } else {
        handleMismatch(gameState.selectedWord, card);
    }
    
    gameState.selectedWord.classList.remove('selected');
    gameState.selectedWord = null;
}

// 处理触摸开始
function handleTouchStart(e, card) {
    e.preventDefault();
    if (card.classList.contains('matched')) return;
    
    const touch = e.touches[0];
    gameState.isDragging = true;
    gameState.selectedWord = card;
    card.classList.add('selected');
    
    const rect = card.getBoundingClientRect();
    gameState.dragStartPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
    gameState.dragEndPos = {
        x: touch.clientX,
        y: touch.clientY
    };
    
    requestAnimationFrame(drawConnection);
}

// 处理触摸移动
function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.isDragging) return;
    
    const touch = e.touches[0];
    gameState.dragEndPos = {
        x: touch.clientX,
        y: touch.clientY
    };
}

// 处理触摸结束
function handleTouchEnd(e, card) {
    if (!gameState.isDragging) return;
    
    const endElement = document.elementFromPoint(
        gameState.dragEndPos.x,
        gameState.dragEndPos.y
    );
    
    if (endElement && endElement.classList.contains('word-card')) {
        handleDrop(e, endElement);
    }
    
    gameState.isDragging = false;
    card.classList.remove('selected');
    gameState.selectedWord = null;
    clearConnections();
}

// 检查匹配
function checkMatch(card1, card2) {
    if (card1.dataset.type === card2.dataset.type) return false;
    return card1.dataset.pair === card2.dataset.word;
}

// 处理匹配成功
function handleMatch(card1, card2) {
    gameState.matchedPairs.push([card1, card2]);
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // 添加连线
    const connection = {
        start: getCardCenter(card1),
        end: getCardCenter(card2)
    };
    gameState.connections.push(connection);
    
    // 更新分数和动画
    gameState.score += 10;
    updateScore();
    playSound('success');
    createMatchParticles(card1, card2);
    
    // 检查游戏是否结束
    if (gameState.matchedPairs.length === gameState.words.length) {
        setTimeout(() => {
            alert(`恭喜！您的最终得分是: ${gameState.score}`);
        }, 500);
    }
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

// 创建匹配成功粒子效果
function createMatchParticles(card1, card2) {
    const container = elements.particlesContainer;
    const center1 = getCardCenter(card1);
    const center2 = getCardCenter(card2);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${center1.x}px`;
        particle.style.top = `${center1.y}px`;
        
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 2 + Math.random() * 2;
        const lifetime = 1000 + Math.random() * 500;
        
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