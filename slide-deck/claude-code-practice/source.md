# Claude Code 实战

## 文档来源
飞书文档：https://mi.feishu.cn/wiki/EYzQwVoQYiROYtktQ3ScAWE2npg

## 内容概览

### 一、开场：MBTI 后 SBTI也过时了，MITI 来了

- SBTI（原版）vs MITI（Claude Code 实现版）对比
- 简单几句话需求，Claude Code 生成一个娱乐性质的项目
- 开发过程：逆向分析 → 调整加工（需求确定 + 生成计划）→ 重新实现

### 二、基础上手

- 安装：npm install -g @anthropic-ai/claude-code
- 配置 settings.json（API Key、模型选择）
- 模型对比：claude-opus-4-6 / qwen3.6-plus / mimo-v2-pro
- 价值定位：相对 OpenClaw，Token 消耗更小，稳定规划执行验证

### 三、实战进阶

#### 飞书 MCP：SKILLS 总结周报/月报
- 制作 SKILLS：skill-creator 分析文档内容并生成
- 使用 SKILLS 生成总结材料（侧重点选择）
- 效果总结：整体可用，数据飞阅部分相似度极高

#### 自然语言生图
- 飞书 CLI 工具安装
- 一句话需求 → 生成图表
- 验证优化和结果交付（小米汽车购车流程图）
- 延伸思考：AI 更适合文本绘图（Mermaid）

#### PDF 文件阅读和翻译
- 分析 PDF 并生成摘要
- 全文翻译（baoyu-translate skill）
- 提取重要图片
- 上传到飞书文档

#### 结合 Chrome MCP 竞品数据获取到 Excel
- Plan 模式 + 一句话背景
- AI 被反问细节，交互式确认
- 使用前面生成的 SKILLS

#### 适合业务团队的 skills
- Product Manager Toolkit、Business Analyst、Market Researcher
- Marketing Strategy / PMM、Lead Research Assistant
- Customer Success Manager、CSAT Analyzer、Data Analyst

### 四、Token 用量和费用账单

- mify 平台：Token 用量统计 + 用量账单

### 五、踩坑实录

1. 通过内部网关调用外部模型处理敏感数据 → 使用 mimo 模型
2. 只装 findskills 不装安全 skills → 配置 data-privacy/sensitive-check
3. 不理解"上下文"概念 → 建立"工作空间"思维，CLAUDE.md 设置业务上下文
4. 误解权限提示 → 理解三种能力（只读/创建/修改），设置合理权限模式
