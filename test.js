const { checkProhibitedWords, analyzeJsonContent } = require('./index.js');

// Test data
const testData = {
    title: "这是一个正常的标题",
    description: "这里包含暴力内容",
    items: [
        { name: "正常项目", value: "正常值" },
        { name: "问题项目", value: "包含诈骗信息" }
    ],
    metadata: {
        tags: ["标签1", "色情", "标签3"],
        author: "作者名称"
    }
};

console.log('=== 违禁词检查功能测试 ===');
console.log('');

// Test prohibited words detection
console.log('1. 测试违禁词检查功能:');
const testTexts = [
    "这是正常文本",
    "这里包含暴力内容",
    "这里有诈骗和色情内容",
    "This contains spam and fraud"
];

testTexts.forEach((text, index) => {
    const foundWords = checkProhibitedWords(text);
    console.log(`   文本 ${index + 1}: "${text}"`);
    console.log(`   发现违禁词: ${foundWords.length > 0 ? foundWords.join(', ') : '无'}`);
    console.log('');
});

// Test JSON analysis
console.log('2. 测试 JSON 分析功能:');
const results = analyzeJsonContent(testData);
console.log(`   分析结果: 发现 ${results.length} 处违禁内容`);
results.forEach((result, index) => {
    console.log(`   ${index + 1}. 位置: ${result.path}`);
    console.log(`      违禁词: ${result.prohibitedWords.join(', ')}`);
    console.log(`      内容: ${result.content}`);
});

console.log('');
console.log('✅ 测试完成');