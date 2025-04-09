const defaultWords = [
    { english: "apple", chinese: "苹果" },
    { english: "book", chinese: "书本" },
    { english: "cat", chinese: "猫" },
    { english: "dog", chinese: "狗" },
    { english: "elephant", chinese: "大象" },
    { english: "flower", chinese: "花" },
    { english: "grass", chinese: "草" },
    { english: "house", chinese: "房子" },
    { english: "ice", chinese: "冰" },
    { english: "juice", chinese: "果汁" },
    { english: "king", chinese: "国王" },
    { english: "lion", chinese: "狮子" },
    { english: "moon", chinese: "月亮" },
    { english: "night", chinese: "夜晚" },
    { english: "orange", chinese: "橙子" },
    { english: "pencil", chinese: "铅笔" },
    { english: "queen", chinese: "女王" },
    { english: "rain", chinese: "雨" },
    { english: "sun", chinese: "太阳" },
    { english: "tree", chinese: "树" }
];

// 导出模板示例
const templateExample = [
    { english: "word", chinese: "单词" },
    { english: "example", chinese: "例子" }
];

// 下载模板函数
function downloadTemplate() {
    const worksheet = XLSX.utils.json_to_sheet(templateExample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "模板");
    XLSX.writeFile(workbook, "word-matching-template.xlsx");
}