# JSON 内容分析工具

这是一个用于分析 JSON 内容并检查违禁词的工具，使用 Playwright 来展示分析结果。

## 功能特性

- 🔍 **JSON 内容分析**: 从 URL 获取 JSON 数据并进行深度分析
- 🚫 **违禁词检查**: 检测内容中的违禁词汇（支持中英文）
- 📊 **可视化报告**: 生成美观的 HTML 分析报告
- 🎭 **Playwright 集成**: 使用浏览器展示分析结果
- 📋 **演示模式**: 提供演示数据用于测试和学习

## 安装依赖

```bash
npm install
```

注意: 如果需要使用 Playwright 浏览器功能，请运行:
```bash
npx playwright install
```

## 使用方法

### 1. 分析远程 JSON 文件

```bash
npm start
```
或
```bash
node index.js
```

这将尝试从以下 URL 获取 JSON 数据进行分析:
`https://edrawcloudpubliccn.oss-cn-shenzhen.aliyuncs.com/work/38166419/2025-6-24/1750767210/outline.json`

### 2. 使用演示数据（无违禁词）

```bash
node index.js --demo
```

### 3. 使用演示数据（包含违禁词）

```bash
node index.js --demo-violations
```

### 4. 运行功能测试

```bash
npm test
```
或
```bash
node test.js
```

## 项目结构

```
├── package.json                    # 项目配置文件
├── index.js                       # 主程序入口
├── test.js                        # 功能测试文件
├── prohibited-words.json          # 违禁词配置文件
├── demo-data.json                 # 正常演示数据
├── demo-data-with-violations.json # 包含违禁词的演示数据
├── analysis-report.html           # 生成的分析报告（运行后生成）
└── README.md                      # 项目说明文档
```

## 违禁词配置

违禁词配置文件 `prohibited-words.json` 包含了中英文违禁词列表，包括：

- 暴力、色情、政治敏感词汇
- 诈骗、恶意、仇恨相关词汇  
- 违法、侵权等违规内容词汇

可以根据需要修改此配置文件来调整检查规则。

## 分析报告

工具会生成详细的 HTML 分析报告，包含：

- **分析摘要**: 数据源、分析时间、违禁词总数
- **违禁词详细信息**: 具体位置、内容片段、发现的违禁词
- **原始 JSON 数据**: 完整的 JSON 内容展示
- **美观的界面**: 使用 CSS 样式的现代化界面

## 输出示例

### 控制台输出
```
=== JSON 内容分析工具 ===

📋 使用演示数据模式
✅ 演示数据加载成功
🔍 正在分析违禁词...
📝 正在生成分析报告...

=== 分析结果 ===
⚠️  发现 7 处违禁内容:
1. 位置: sections[0].content
   违禁词: 暴力
   内容: 这是一个包含暴力内容的测试项目

...

分析报告已保存到: /path/to/analysis-report.html
```

### HTML 报告
工具会生成包含完整分析结果的 HTML 报告，可以在浏览器中查看。

## 技术栈

- **Node.js**: 运行环境
- **Axios**: HTTP 请求库
- **Playwright**: 浏览器自动化和展示
- **HTML/CSS**: 报告界面

## 错误处理

- 网络连接失败时自动切换到演示数据
- Playwright 浏览器启动失败时保存为 HTML 文件
- 完善的错误提示和异常处理

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具！
