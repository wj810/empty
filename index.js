const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load prohibited words configuration
const prohibitedWordsConfig = JSON.parse(fs.readFileSync('./prohibited-words.json', 'utf8'));
const prohibitedWords = prohibitedWordsConfig.prohibitedWords;

// Target URL to analyze
const TARGET_URL = 'https://edrawcloudpubliccn.oss-cn-shenzhen.aliyuncs.com/work/38166419/2025-6-24/1750767210/outline.json';

/**
 * Fetch JSON content from URL
 */
async function fetchJsonContent(url) {
    try {
        console.log(`正在获取 JSON 内容: ${url}`);
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`获取 JSON 内容失败: ${error.message}`);
        throw error;
    }
}

/**
 * Check for prohibited words in text
 */
function checkProhibitedWords(text) {
    const foundWords = [];
    const lowerText = text.toLowerCase();
    
    prohibitedWords.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            foundWords.push(word);
        }
    });
    
    return foundWords;
}

/**
 * Recursively analyze JSON object for prohibited words
 */
function analyzeJsonContent(obj, path = '') {
    const results = [];
    
    if (typeof obj === 'string') {
        const foundWords = checkProhibitedWords(obj);
        if (foundWords.length > 0) {
            results.push({
                path: path,
                content: obj.substring(0, 100) + (obj.length > 100 ? '...' : ''),
                prohibitedWords: foundWords
            });
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            results.push(...analyzeJsonContent(item, `${path}[${index}]`));
        });
    } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            results.push(...analyzeJsonContent(obj[key], path ? `${path}.${key}` : key));
        });
    }
    
    return results;
}

/**
 * Generate HTML report
 */
function generateHtmlReport(jsonData, analysisResults, dataSource = TARGET_URL) {
    const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON 内容分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .summary { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .json-content { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .prohibited-word { background: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
        .analysis-item { margin: 15px 0; padding: 10px; border-left: 4px solid #dc3545; background: #fff; }
        .path { font-weight: bold; color: #007bff; }
        .content { margin: 10px 0; font-family: monospace; background: #f1f3f4; padding: 8px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>JSON 内容分析报告</h1>
        
        <div class="summary">
            <h2>分析摘要</h2>
            <p><strong>源 URL:</strong> ${dataSource}</p>
            <p><strong>分析时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
            <p><strong>发现的违禁词总数:</strong> ${analysisResults.length}</p>
        </div>

        ${analysisResults.length > 0 ? `
        <div class="error">
            <h3>⚠️ 发现违禁内容</h3>
            <p>在分析的 JSON 内容中发现了 ${analysisResults.length} 处违禁词，请查看详细信息：</p>
        </div>

        <h3>违禁词详细分析</h3>
        ${analysisResults.map((result, index) => `
        <div class="analysis-item">
            <div class="path">位置 ${index + 1}: ${result.path}</div>
            <div class="content">${result.content}</div>
            <div>
                发现的违禁词: ${result.prohibitedWords.map(word => `<span class="prohibited-word">${word}</span>`).join(' ')}
            </div>
        </div>
        `).join('')}
        ` : `
        <div class="warning">
            <h3>✅ 未发现违禁内容</h3>
            <p>分析完成，未在 JSON 内容中发现违禁词。</p>
        </div>
        `}

        <h3>原始 JSON 内容</h3>
        <div class="json-content">
            <pre>${JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    </div>
</body>
</html>`;
    
    return html;
}

/**
 * Use Playwright to display the report
 */
async function displayWithPlaywright(htmlContent) {
    try {
        // Try to use playwright if browsers are available
        const { chromium } = require('playwright');
        
        console.log('正在启动 Playwright 浏览器...');
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        
        // Set the HTML content
        await page.setContent(htmlContent);
        
        console.log('报告已在浏览器中打开，请查看分析结果');
        console.log('按任意键关闭浏览器...');
        
        // Keep the browser open until user input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', async () => {
            await browser.close();
            process.exit(0);
        });
        
    } catch (error) {
        console.log('无法启动 Playwright 浏览器，将保存为 HTML 文件');
        
        // Save as HTML file instead
        const outputPath = path.join(__dirname, 'analysis-report.html');
        fs.writeFileSync(outputPath, htmlContent, 'utf8');
        console.log(`分析报告已保存到: ${outputPath}`);
        console.log('请用浏览器打开该文件查看报告');
    }
}

/**
 * Load demo data when network is not available
 */
function loadDemoData(withViolations = false) {
    try {
        const demoFile = withViolations ? 'demo-data-with-violations.json' : 'demo-data.json';
        const demoPath = path.join(__dirname, demoFile);
        return JSON.parse(fs.readFileSync(demoPath, 'utf8'));
    } catch (error) {
        console.error('无法加载演示数据:', error.message);
        throw error;
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('=== JSON 内容分析工具 ===');
        console.log('');
        
        // Check for command line arguments
        const args = process.argv.slice(2);
        const useViolationsDemo = args.includes('--demo-violations');
        const useDemo = args.includes('--demo') || useViolationsDemo;
        
        let jsonData;
        let dataSource = TARGET_URL;
        
        if (useDemo) {
            console.log('📋 使用演示数据模式');
            jsonData = loadDemoData(useViolationsDemo);
            dataSource = useViolationsDemo ? 'demo-data-with-violations.json (违禁词演示)' : 'demo-data.json (正常演示数据)';
            console.log('✅ 演示数据加载成功');
        } else {
            // Try to fetch JSON content from URL
            try {
                jsonData = await fetchJsonContent(TARGET_URL);
                console.log('✅ JSON 内容获取成功');
            } catch (error) {
                console.log('⚠️  无法从远程 URL 获取数据，使用演示数据');
                console.log(`   错误信息: ${error.message}`);
                jsonData = loadDemoData();
                dataSource = 'demo-data.json (本地演示数据)';
                console.log('✅ 演示数据加载成功');
            }
        }
        
        // Analyze for prohibited words
        console.log('🔍 正在分析违禁词...');
        const analysisResults = analyzeJsonContent(jsonData);
        
        // Generate report (update the HTML to show correct data source)
        console.log('📝 正在生成分析报告...');
        const htmlReport = generateHtmlReport(jsonData, analysisResults, dataSource);
        
        // Display results
        console.log('');
        console.log('=== 分析结果 ===');
        if (analysisResults.length > 0) {
            console.log(`⚠️  发现 ${analysisResults.length} 处违禁内容:`);
            analysisResults.forEach((result, index) => {
                console.log(`${index + 1}. 位置: ${result.path}`);
                console.log(`   违禁词: ${result.prohibitedWords.join(', ')}`);
                console.log(`   内容: ${result.content}`);
                console.log('');
            });
        } else {
            console.log('✅ 未发现违禁内容');
        }
        
        // Use Playwright to display the report
        await displayWithPlaywright(htmlReport);
        
    } catch (error) {
        console.error('执行过程中出现错误:', error.message);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    fetchJsonContent,
    checkProhibitedWords,
    analyzeJsonContent,
    generateHtmlReport
};