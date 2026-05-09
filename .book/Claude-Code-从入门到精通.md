# Claude Code 从入门到精通

A Complete Guide from Beginner to Master

**创建者**: 滔哥
**为谁创建**: 想用AI编程提效的开发者、技术管理者
**基于**: Claude Code v2.1.123 · Claude Opus 4.7
**最后更新**: 2026-04-30
**适用场景**: 日常开发、代码审查、CI/CD自动化、团队协作

---

## Part 1: 起步

从零到一。读完能跑通第一个项目。

---

## §01 为什么是 Claude Code

### 01.1 我用了3个月才想明白一件事

2025年底，我在做一个Node.js项目。用的是Cursor。

有一天晚上，我要改一个跨4个文件的功能。Cursor上下文窗口不够，改到第3个文件的时候，它忘了前面改了什么。我来回切了6次，花了40分钟。

那天我试了Claude Code。

同样的任务，它一口气改了4个文件。没有来回切。8分钟搞定。

这是我第一次意识到：AI编程工具之间的差距，不在"能不能写代码"，而在"能看多大的盘子"。

### 01.2 先给结论

Claude Code不是另一个代码补全工具。

它是Anthropic出的agentic编程工具。跑在终端里。能看你的整个项目。能自己决定下一步做什么。

> **滔哥的经验**：用了一年Claude Code之后，我最大的感受是——它不是在帮你写代码，它是在帮你做项目。你给方向，它自己规划、执行、验证。这个区别很关键。

### 01.3 和主流工具对比

| 维度 | Claude Code | Cursor | GitHub Copilot | Windsurf | 滔哥的结论 |
|------|-------------|--------|----------------|----------|-----------|
| 界面 | 终端+IDE+桌面+Web+Slack | IDE (VS Code fork) | IDE扩展+CLI | IDE (VS Code fork) | Claude Code入口最多 |
| 核心模式 | Agentic循环：规划→执行→验证 | 代码补全+Agent | 代码补全+Agent | 代码补全+Agent | Claude Code是真正的agent |
| 上下文 | 整个项目目录 | 当前文件+索引 | 当前文件 | 当前文件+索引 | Claude Code看得最远 |
| MCP支持 | 完整（服务器+注册表+工具搜索） | 是 | 有限 | 有限 | Claude Code最完整 |
| Hooks自动化 | 完整生命周期（12种事件） | 无 | 无 | 无 | 独有能力 |
| Agent SDK | Python+TypeScript | 无 | 无 | 无 | 独有能力 |
| 多Agent协作 | 子agent+团队模式 | 无 | 无 | 无 | 独有能力 |
| 调度任务 | Routines+/loop+/schedule | 无 | 无 | 无 | 独有能力 |
| 模型 | Claude Opus 4.7/Sonnet/Haiku | 多模型可选 | GPT-4o/Claude | 多模型可选 | Cursor灵活性好，Claude Code深度好 |
| 定价 | ~$20-100/月 | $20-40/月 | $10-39/月 | $15-30/月 | 价格相近，能力差距大 |

> **重点看**：MCP、Hooks、Agent SDK、多Agent这几列。
> 这四行是Claude Code独有，其他三家都没有。这不是"稍微好一点"，是"根本没有"。

### 01.4 类比级联：三个层次

我常用一个类比来解释AI编程工具的演进：

**第一层：输入法。** GitHub Copilot是你的智能输入法。你打几个字，它猜你要写什么。快，但你还是在写代码的人。

**第二层：结对伙伴。** Cursor是你的结对编程伙伴。你俩一起看屏幕，它帮你补全、改错、解释。但你俩坐在同一张桌子上，一次只能看一个文件。

**第三层：独立工程师。** Claude Code是你的独立工程师。你给需求，它自己去翻代码、改文件、跑测试、提PR。你看结果就行。

这三层不是"好一点"的关系。是质变。

### 01.5 适合谁 / 不适合谁

**适合你，如果你是：**

- 后端/全栈开发者，项目超过10个文件
- 想从"写代码的人"变成"给方向的人"
- 团队技术负责人，想统一代码规范和工作流
- 对终端不排斥，愿意学新工具

**可能不适合你，如果你是：**

- 只写单文件脚本，项目很小
- 完全不用终端，只用GUI
- 需要多模型自由切换（Cursor在这方面更好）
- 预算非常紧张（Claude Code需要付费订阅）

> **核心建议**：如果你的项目超过20个文件，Claude Code值得试。上下文能力的差距，在小项目里看不出来，在大项目里是天壤之别。

装完了，账号登了。下一章，开始做真实项目。

---

## §02 安装和第一次对话

### 02.1 你需要什么

- macOS 13+ / Windows 10 1809+ / Ubuntu 20.04+
- 终端（macOS自带Terminal，Windows用PowerShell）
- Claude账号（Pro ~$20/月 或 Max ~$100/月）
- 预计时间：10分钟

### 02.2 我们最终要做成什么

打开终端，输入`claude`，跟AI完成一次对话。能看到它读文件、写代码、执行命令。

就这三步。不多。

### 02.3 安装

**第一步：安装Claude Code**

macOS/Linux：
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell（管理员）：
```powershell
irm https://claude.ai/install.ps1 | iex
```

预期结果：看到安装成功的提示。没有报红。

> **注意**：如果你之前用npm装过旧版（`npm install -g @anthropic-ai/claude-code`），先卸掉。npm版已经弃用，现在是原生二进制，自动更新。

**第二步：登录**

```bash
claude
```

第一次运行会弹出浏览器，让你登录Claude账号。登录后回到终端。

预期结果：看到Claude Code的欢迎界面，可以输入文字了。

**第三步：验证**

输入一条简单指令：

```
你好，告诉我你是什么版本
```

预期结果：它回答版本号。比如`Claude Code v2.1.123`。

> **滔哥的经验**：我在3台机器上装过Claude Code。Mac最快，30秒搞定。Windows偶尔会遇到PowerShell执行策略问题，跑一下`Set-ExecutionPolicy RemoteSigned`就好了。Linux最省心，curl一行完事。

### 02.4 第一次对话：让它读你的项目

```bash
# 进入你的项目目录
cd ~/your-project

# 启动Claude Code
claude
```

然后试这个：

```
帮我看看这个项目是做什么的
```

它会自动扫描项目结构，读package.json或README，给你一个总结。

再试一个：

```
找到这个项目里所有的API接口，列个清单
```

它会用Grep工具搜索路由定义、控制器文件，给你一份结构化的清单。

> **滔哥的经验**：第一次用的时候，我让它"看看这个项目"。它花了30秒扫了整个目录，然后告诉我："这是一个Express+MongoDB的电商后端，有12个API接口，3个定时任务，用JWT做认证。"比我README写得清楚。

### 02.5 常见坑

| 坑 | 症状 | 解法 |
|----|------|------|
| 登录失败 | 浏览器打开了但终端没反应 | 关掉代理/VPN重试 |
| 权限问题 | macOS提示"无法验证开发者" | 系统设置 → 安全性 → 仍要打开 |
| 版本太旧 | 功能缺失 | 运行`claude --version`确认，原生安装会自动更新 |

> **核心建议**：装完之后第一件事，跑`claude --version`确认版本。v2.1.x以上的体验和之前完全不同。

装好了，跑通了。下一章，用Claude Code做一个真实项目。

---

## §03 第一个真实项目

### 03.1 项目需求

我们做一个Todo API。Node.js + Express + SQLite。

为什么选这个？三个原因：
1. 足够简单，30分钟能做完
2. 涵盖CRUD、数据库、错误处理，该有的都有
3. 后面章节的示例都基于这个项目

### 03.2 从零搭建

**第一步：创建项目目录**

```bash
mkdir todo-api && cd todo-api
claude
```

输入：

```
帮我创建一个Node.js + Express + SQLite的Todo API项目。
要求：
1. RESTful风格，支持增删改查
2. 用better-sqlite3做数据库
3. 有错误处理
4. 写个README说明怎么跑
```

它会自动创建package.json、安装依赖、写代码。你看着就行。

预期结果：项目目录下多了`package.json`、`index.js`、`db.js`、`README.md`。

> **滔哥的经验**：这一步我最惊讶的是，它不只是生成代码。它会先`mkdir`建目录，再`npm init`，再`npm install`，再写代码。整个过程像一个真人在操作终端。

**第二步：看看它写了什么**

```
让我看看index.js的内容
```

它会读文件给你看。或者你可以直接打开文件看。

**第三步：跑起来**

```
帮我把项目跑起来
```

它会执行`node index.js`。

预期结果：终端显示`Server running on port 3000`。

**第四步：测试**

```
用curl测试一下所有的API接口，给我看结果
```

它会依次调用：
```bash
# 创建
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"title":"买牛奶"}'

# 列表
curl http://localhost:3000/todos

# 更新
curl -X PUT http://localhost:3000/todos/1 -H "Content-Type: application/json" -d '{"completed":true}'

# 删除
curl -X DELETE http://localhost:3000/todos/1
```

预期结果：每个接口都返回正确的JSON。

### 03.3 加点料

项目跑通了，再加两个功能：

```
给这个项目加上：
1. 分页功能（page和pageSize参数）
2. 按完成状态筛选（completed参数）
3. 输入校验（title不能为空）
4. 写单元测试
```

它会修改代码、加校验中间件、写测试文件。你继续看着就行。

> **滔哥的经验**：这里我发现一个规律——你描述需求越具体，它做得越好。"加个分页"不如"用page和pageSize参数做分页，默认page=1, pageSize=20"。后者出来的代码几乎不用改。

### 03.4 踩坑记录

| 坑 | 什么情况 | 怎么解决 |
|----|---------|---------|
| 依赖装不上 | npm报错网络超时 | 换源：`npm config set registry https://registry.npmmirror.com` |
| 端口被占 | 3000端口已在用 | 让它换端口：`端口改成3001` |
| 代码风格不对 | 缩进、命名不是你习惯的 | 写CLAUDE.md，下章讲 |

### 03.5 回顾

我们做了什么：
- 创建了一个完整的Todo API
- 加了分页、筛选、校验、测试
- 全程没手写一行代码

花了多久：15分钟。

> **核心建议**：第一个项目别太复杂。先跑通流程，感受一下AI编程的节奏。复杂项目留到后面。

项目跑通了，但有个问题——每次开新对话，Claude都不记得你项目的规范。下一章，解决这个问题。

---

## Part 2: 核心能力

深入产品的关键能力，每章一个核心概念。

---

## §04 CLAUDE.md：让AI记住你的项目

### 04.1 问题：每次对话都像新来的实习生

用了两周Claude Code，我发现一个烦人的事。

每次新开对话，让它写代码，它用的缩进、命名风格、目录结构都不一样。上一次用2空格，这一次用4空释。上一次放在`src/`，这一次放根目录。

就像每天来一个新实习生，你得重新教一遍。

直到我认真写了CLAUDE.md。

### 04.2 CLAUDE.md 是什么

一句话：项目级别的指令文件。告诉Claude"在这个项目里，你要遵守什么规则"。

Claude Code每次启动都会自动读它。就像新人入职第一天看的团队规范。

它有两个层级：

| 层级 | 路径 | 作用范围 |
|------|------|---------|
| 全局 | `~/.claude/CLAUDE.md` | 所有项目通用 |
| 项目 | `./CLAUDE.md`（项目根目录） | 当前项目专用 |

项目级覆盖全局级。就像公司的规章制度和部门的补充规定。

### 04.3 我的CLAUDE.md长什么样

这是我现在项目里用的，你可以直接抄：

```markdown
# 项目规范

## 技术栈
- Node.js 20 + Express + TypeScript
- 数据库：PostgreSQL 16
- ORM：Prisma

## 代码风格
- 缩进：2空格
- 命名：camelCase变量函数，PascalCase类组件
- 函数长度：不超过30行
- 注释：公共方法必须写，复杂逻辑必须加

## 目录结构
- 业务逻辑放在 src/services/
- 接口放在 src/routes/
- 类型定义放在 src/types/
- 工具函数放在 src/utils/

## Git规范
- Commit格式：type(scope): description
- 不自动push

## 禁止事项
- 不用any类型
- 不硬编码密钥
- 不删已有的测试
```

> **滔哥的经验**：写了CLAUDE.md之后，代码风格一致性从大概60%提升到95%以上。它真的会看，真的会遵守。有一次我让它加个接口，它自动放在了`src/routes/`下面，用了camelCase命名，2空格缩进。我没说一个字。

### 04.4 初始化模板

Claude Code有个内置命令可以快速生成：

```
/init
```

它会扫描你的项目，自动生成一份CLAUDE.md草稿。你在此基础上改就行。

> **注意**：`/init`生成的是通用模板。你得根据自己团队的习惯改。比如它默认4空格缩进，但你团队用2空格，就得手动改。

### 04.5 CLAUDE.md的高级用法

除了代码规范，你还可以放：

**项目背景**：
```markdown
## 项目背景
这是一个内部管理系统，给财务部门用。
核心流程：录入→审批→出报表。
数据库里有3年的历史数据，不能丢。
```

**架构决策**：
```markdown
## 架构决策
- 用REST不用GraphQL，因为前端团队不熟GraphQL
- 认证用JWT不用Session，因为要支持移动端
- 缓存用Redis不用内存，因为多实例部署
```

**踩过的坑**：
```markdown
## 已知问题
- user表的created_at字段有时区问题，统一用UTC
- 支付回调不能重试，幂等性靠外部订单号保证
```

> **核心建议**：CLAUDE.md不是一次性的。每次踩坑、做架构决策、发现新规范，都往里加。它会越写越好，Claude也会越来越懂你的项目。

现在Claude记住了你的项目。下一章，让它变成你的专属工具。

---

## §05 斜杠命令和自定义技能

### 05.1 重复的事，不该说两遍

每天早上打开Claude Code，我说的第一句话都是：

```
看看今天的git log，有什么需要review的PR，检查一下测试有没有挂
```

连续说了两周之后，我烦了。

这就是斜杠命令要解决的问题。把重复的指令打包成一个命令。

### 05.2 先用现成的

Claude Code内置了55+个斜杠命令。常用的：

| 命令 | 作用 | 滔哥的用法 |
|------|------|-----------|
| `/help` | 查看帮助 | 刚装的时候用 |
| `/compact` | 压缩上下文 | 对话太长时用 |
| `/model` | 切换模型 | 需要快的时候切Haiku |
| `/effort` | 调节思考深度 | 简单任务调低，复杂任务调高 |
| `/plan` | 进入规划模式 | 做大功能前先规划 |
| `/clear` | 清空对话 | 换话题时用 |
| `/resume` | 恢复上次对话 | 中断后继续 |
| `/usage` | 查看用量 | 控制成本 |
| `/doctor` | 检查环境 | 出问题时诊断 |
| `/init` | 初始化CLAUDE.md | 新项目第一次用 |

> **滔哥的经验**：`/compact`是我用得最多的命令。聊了半小时之后上下文满了，它会自动压缩，但你可以指定压缩重点：`/compact 把重点放在数据库设计部分`。这样压缩后不会丢关键信息。

### 05.3 创建你的第一个斜杠命令

在项目里建个目录：

```bash
mkdir -p .claude/commands
```

创建一个命令文件 `.claude/commands/review.md`：

```markdown
---
description: Review the latest changes
allowed-tools: Read, Bash(git:*)
---

Look at the latest git changes:
1. Run `git diff HEAD~1` to see recent changes
2. Check for code style issues
3. Look for potential bugs
4. Suggest improvements

Give me a structured review with:
- What changed
- Issues found (if any)
- Suggestions
```

现在在Claude Code里输入`/review`，它就会自动执行这套流程。

> **注意**：文件名就是命令名。`review.md` → `/review`。`daily-check.md` → `/daily-check`。

### 05.4 带参数的命令

命令可以接收参数。用`$1`、`$2`或`$ARGUMENTS`：

```markdown
---
description: Explain a file or concept
argument-hint: [file-or-concept]
---

Explain $ARGUMENTS in detail. If it's a file, read it first.
If it's a concept, explain it with examples from this project.
```

用法：`/explain src/auth/jwt.js`

### 05.5 Skills：更强大的能力包

斜杠命令是单个文件。Skills是一整套能力。

目录结构：
```
.claude/skills/
  code-review/
    SKILL.md          # 技能定义
```

SKILL.md里可以定义：
- 触发条件（什么情况下自动激活）
- 工作流程（多步骤）
- 可用工具限制
- 子agent定义

> **滔哥的经验**：我把团队的代码review流程做成了一个Skill。每次提PR，Claude自动review，检查安全问题、代码风格、测试覆盖。省了至少一半review时间。

### 05.6 命令 vs 技能 vs Hooks

| 维度 | 斜杠命令 | Skills | Hooks |
|------|---------|--------|-------|
| 触发方式 | 手动输入`/命令` | 自动匹配 | 事件驱动 |
| 复杂度 | 单文件，简单 | 多文件，复杂 | 脚本，灵活 |
| 典型场景 | 日常重复操作 | 专项能力 | 质量门禁 |
| 示例 | `/review` | 代码审查全流程 | 提交前自动跑lint |

三者不冲突，配合使用效果最好。

> **核心建议**：先把重复3次以上的操作做成斜杠命令。等命令积累到5个以上，再考虑整合成Skill。

命令和技能让Claude更懂你。下一章，让它连接外部世界。

---

## §06 MCP：连接外部世界

### 06.1 问题：Claude看不到项目外的东西

用了Claude Code一个月，我遇到一个尴尬的场景。

我在做一个GitHub项目，想让它帮我看看有没有待处理的PR。它说："我没有访问GitHub的能力。"

你可以手动复制粘贴给它。但这太蠢了。

MCP就是解决这个问题的。

### 06.2 MCP 是什么

Model Context Protocol。模型上下文协议。

一句话：让Claude能连接外部服务。GitHub、数据库、Slack、Jira——任何有API的东西。

类比一下：
- 没有MCP的Claude，像一个关在房间里的程序员。只能看桌上的文件。
- 有了MCP的Claude，像一个有手机的程序员。能查邮件、看GitHub、查数据库。

### 06.3 配置一个MCP服务器

以GitHub为例。

**第一步：创建配置文件**

在项目根目录创建`.mcp.json`：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

> **注意**：Token不要提交到Git。把`.mcp.json`加到`.gitignore`，或者用环境变量：`${GITHUB_TOKEN}`。

**第二步：重启Claude Code**

```bash
# 退出当前会话，重新进入
claude
```

**第三步：测试**

```
帮我看看这个仓库的open issues
```

它现在能直接查GitHub了。不用你复制粘贴。

### 06.4 常用MCP服务器

| 服务器 | 连接什么 | 安装方式 |
|--------|---------|---------|
| GitHub | Issues、PR、Actions | `npx -y @modelcontextprotocol/server-github` |
| PostgreSQL | 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |
| Slack | 消息、频道 | `npx -y @modelcontextprotocol/server-slack` |
| Filesystem | 指定目录的文件 | `npx -y @modelcontextprotocol/server-filesystem` |
| Puppeteer | 浏览器操作 | `npx -y @modelcontextprotocol/server-puppeteer` |

> **滔哥的经验**：我项目里配了3个MCP——GitHub、PostgreSQL、Slack。现在Claude能直接查数据库、看PR、发Slack消息。一个对话搞定以前要切5个窗口的事。

### 06.5 用命令行管理MCP

不用手动编辑JSON，可以用命令：

```bash
# 添加
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# 添加带环境变量
claude mcp add github -e GITHUB_TOKEN=xxx -- npx -y @modelcontextprotocol/server-github

# 查看列表
claude mcp list

# 删除
claude mcp remove github
```

### 06.6 MCP的坑

| 坑 | 什么情况 | 怎么解决 |
|----|---------|---------|
| 工具太多 | MCP服务器暴露了几百个工具，Claude选择困难 | 用`alwaysLoad: false`让它按需加载 |
| Token过期 | GitHub Token有效期到了 | 重新生成Token，更新配置 |
| 超时 | 数据库查询太慢 | 在MCP服务器配置里加timeout |

> **核心建议**：先配一个你最常用的MCP。GitHub或数据库，选一个。跑通了再加别的。别一上来配5个，出了问题不知道是哪个。

现在Claude能看外面的世界了。下一章，让它自动干活。

---

## §07 Hooks：自动化你的工作流

### 07.1 一个真实场景

有一次，Claude帮我写了一段代码，用了`eval()`。

我没注意到。代码review过了。上线了。安全团队找上门了。

从那以后，我就在想：能不能让Claude在执行某些操作之前，自动检查一下？

可以。用Hooks。

### 07.2 Hooks 是什么

一句话：在Claude的生命周期里，插入你自己的检查逻辑。

它有12种事件：

| 事件 | 什么时候触发 | 典型用途 |
|------|------------|---------|
| `SessionStart` | 对话开始 | 加载项目上下文 |
| `UserPromptSubmit` | 你输入内容时 | 过滤敏感词 |
| `PreToolUse` | Claude调用工具前 | 安全检查、权限控制 |
| `PostToolUse` | 工具执行完后 | 格式化输出、记录日志 |
| `Stop` | Claude要停止时 | 检查任务完成度 |
| `FileChanged` | 文件被修改后 | 自动跑lint |
| `PermissionRequest` | 请求权限时 | 自动审批/拒绝 |

### 07.3 配置一个Hook

在`~/.claude/settings.json`里加：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/check-bash.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

创建检查脚本 `~/.claude/hooks/check-bash.sh`：

```bash
#!/bin/bash
# 读取Claude传入的工具输入
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // ""')

# 检查危险命令
if echo "$COMMAND" | grep -qE "rm -rf|DROP TABLE|git push --force"; then
  echo "BLOCKED: 危险命令被拦截: $COMMAND"
  exit 1
fi
```

> **滔哥的经验**：这个Hook救过我两次。一次是Claude要跑`rm -rf /tmp/build`，被拦下来了。另一次是它要`git push --force`，也被拦了。两次都是它自己判断错了路径。Hook就是你的安全网。

### 07.4 五种Hook类型

| 类型 | 做什么 | 示例 |
|------|--------|------|
| `command` | 跑shell脚本 | `bash validate.sh` |
| `http` | 调webhook | 通知Slack |
| `mcp_tool` | 调MCP工具 | 查数据库校验 |
| `prompt` | 让Claude自己判断 | "检查这段代码是否安全" |
| `agent` | 启动子agent | 专门的安全检查agent |

> **注意**：`prompt`类型最灵活但最贵（消耗token）。`command`类型最快最省。按需选择。

### 07.5 实战：一套完整的质量门禁

我项目里配了3个Hook：

**PreToolUse — Bash安全检查**：拦截危险命令。

**PostToolUse — Write/Edit自动Lint**：Claude写完代码自动跑ESLint。

**Stop — 任务完成检查**：Claude说"搞定了"之前，检查测试是否通过。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/safety-check.sh", "timeout": 5 }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "npx eslint --fix $CLAUDE_FILE_PATH 2>/dev/null || true", "timeout": 15 }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "prompt", "prompt": "检查所有修改的文件，确认测试通过、没有lint错误。如果有问题，修复后再停止。" }]
      }
    ]
  }
}
```

> **核心建议**：Hooks不用多，3个就够。一个管安全，一个管质量，一个管收尾。先把这3个配好，后面再按需加。

自动化搞定了。下一章，让多个Claude一起干活。

---

## Part 3: 进阶实战

多场景、多工具、多agent的复杂用法。

---

## §08 Agent团队：多agent协作

### 08.1 一个问题越来越大

项目大了之后，我发现一个问题。

让Claude Code做一个大功能——比如"重构认证模块"——它一个人干，要40分钟。中间还会因为上下文太长，质量下降。

后来我知道了：可以让多个Claude一起干。

### 08.2 子Agent是什么

类比一下：

- 单Agent模式：一个全栈工程师，什么都自己干。
- 多Agent模式：一个技术负责人 + 多个专项工程师。负责人分配任务，各干各的，最后汇总。

子Agent有自己独立的上下文窗口。主Agent的对话再长，不影响子Agent的发挥。

### 08.3 启动子Agent

在对话中直接说：

```
帮我重构认证模块。分3个部分并行做：
1. 一个agent负责JWT逻辑
2. 一个agent负责中间件
3. 一个agent负责测试
```

Claude Code会自动启动3个子Agent，各自独立工作。

> **滔哥的经验**：我做过一个实验。同一个重构任务，单Agent用了38分钟，3个子Agent并行用了14分钟。质量差不多，但快了接近3倍。

### 08.4 定义专用Agent

你可以在`.claude/agents/`目录下定义专用Agent：

```markdown
# .claude/agents/security-reviewer.md

---
name: security-reviewer
description: Security code review specialist
allowed-tools: Read, Grep, Glob
---

You are a security code review specialist.

When reviewing code:
1. Check for OWASP Top 10 vulnerabilities
2. Look for SQL injection, XSS, CSRF
3. Verify input validation
4. Check authentication and authorization
5. Look for hardcoded secrets

Output a structured report with:
- Severity (Critical/High/Medium/Low)
- File and line number
- Issue description
- Recommended fix
```

然后在对话中：

```
让security-reviewer检查一下src/auth/目录下的代码
```

### 08.5 Agent团队模式

更进一步，可以启用团队模式：

```bash
export CLAUDE_AGENT_TEAMS=1
claude
```

团队模式下，主Agent像项目经理，可以：
- 分解任务
- 分配给不同的子Agent
- 协调依赖关系
- 合并结果

> **注意**：团队模式消耗的token是单Agent的3-5倍。复杂任务值得用，简单任务别开。

### 08.6 什么时候用子Agent

| 场景 | 用不用子Agent |
|------|-------------|
| 改一个文件 | 不用 |
| 改3-5个相关文件 | 不用，单Agent够 |
| 重构一个模块（10+文件） | 用，按功能拆分 |
| 同时做前端+后端 | 用，各一个Agent |
| 代码审查 | 用，专用review Agent |
| 跑测试+写代码 | 用，互不阻塞 |

> **核心建议**：子Agent不是越多越好。3个是甜区。超过5个，协调成本会吃掉并行收益。

多个Agent一起干活，效率很高。下一章，让它们在CI/CD里自动跑。

---

## §09 CI/CD和自动化部署

### 09.1 从手动到自动

到这一步，你在终端里用Claude Code已经很熟了。

但有个问题：你不在的时候呢？

半夜2点有人提了个PR，谁来review？每天早上的代码质量检查，谁来跑？

答案是：让Claude跑在CI/CD里。

### 09.2 Print模式：非交互式运行

关键命令：`claude -p`（print模式）。

它不打开交互界面，直接执行指令，输出结果。适合脚本和CI/CD。

```bash
# 直接执行
claude -p "检查这个项目有没有安全漏洞"

# 处理文件内容
cat error.log | claude -p "分析这个错误日志，给出根因"

# JSON输出（方便脚本处理）
claude -p --output-format json "列出所有TODO注释"
```

> **滔哥的经验**：`claude -p`是CI/CD集成的关键。它能被任何脚本调用，输出结构化JSON，可以被jq处理。我在GitHub Actions里用它做自动review，效果很好。

### 09.3 GitHub Actions集成

创建 `.github/workflows/ai-review.yml`：

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: curl -fsSL https://claude.ai/install.sh | bash

      - name: Review PR
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(git diff origin/main...HEAD)
          echo "$DIFF" | claude -p --output-format json "
            审查这个PR的代码变更。
            检查：安全问题、代码风格、潜在bug。
            输出JSON格式的review结果。
          " > review-result.json

      - name: Comment on PR
        # 用GitHub API把review结果贴到PR评论里
        run: |
          RESULT=$(cat review-result.json | jq -r '.result')
          # ... 调用GitHub API发评论
```

### 09.4 自动修复PR

Claude Code有个内置命令：

```bash
claude --from-pr 123 "修复这个PR里指出的问题"
```

它会：
1. 读取PR #123的内容
2. 读取reviewer的评论
3. 自动修复问题
4. 推送修复

> **注意**：在CI/CD里用Claude Code，建议用`--max-turns`限制执行轮数，用`--max-budget-usd`限制费用。避免意外消耗。

### 09.5 Routines：定时任务

2026年4月新出的功能。云端定时执行Claude任务。

```
/schedule
```

可以设置：
- 每天早上9点检查测试状态
- 每次有新PR自动review
- 每周生成代码质量报告

> **滔哥的经验**：我设了一个Routine，每天早上8点跑。它会检查：测试是否全过、有没有新PR要review、有没有依赖需要更新。结果发到Slack。我到公司打开Slack就能看到，不用自己跑。

### 09.6 批量处理

```bash
# 批量生成文档
for file in src/*.ts; do
  claude -p --output-format json "为这个文件写JSDoc注释: $(cat $file)" > docs/$(basename $file .ts).json
done

# 批量分析日志
for log in logs/*.log; do
  claude -p "分析这个错误日志的根因: $(cat $log)" > analysis/$(basename $log .log).md
done
```

> **核心建议**：CI/CD集成从review开始。先让Claude自动review PR，跑一个月看看效果。再逐步加自动修复、自动文档、自动测试。

自动化搞定了。最后一章，从使用者变成构建者。

---

## §10 从使用者到构建者：Agent SDK

### 10.1 最后一步

前面9章，你学会了怎么用Claude Code。

这一章，讲怎么用Claude Code的能力，构建你自己的AI工具。

这就是Agent SDK。

### 10.2 Agent SDK 是什么

一句话：用Python或TypeScript，调用Claude Code同款能力。

你写的不是"调API"，是"构建一个有工具、有记忆、能自主行动的Agent"。

```python
# Python示例
from claude_agent_sdk import Agent

agent = Agent(
    model="claude-sonnet-4-6",
    tools=["Read", "Write", "Bash", "Grep"],
)

result = agent.run("检查src/目录下的代码，修复所有ESLint错误")
print(result)
```

```typescript
// TypeScript示例
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  model: 'claude-sonnet-4-6',
  tools: ['Read', 'Write', 'Bash', 'Grep'],
});

const result = await agent.run('检查src/目录下的代码，修复所有ESLint错误');
console.log(result);
```

> **滔哥的经验**：Agent SDK最让我兴奋的不是"能调Claude"，是"能定义工具"。你可以给Agent加上你自己的工具——访问公司内部API、操作特定数据库、调用业务系统。这就不只是编程助手了，是业务自动化。

### 10.3 核心能力

| 能力 | 说明 | 示例 |
|------|------|------|
| 工具定义 | 给Agent自定义工具 | 访问公司内部API |
| 子Agent | Agent可以启动子Agent | 主Agent分配任务 |
| Hooks | 生命周期回调 | 执行前后做检查 |
| MCP | 连接外部服务 | 数据库、Slack |
| 会话管理 | 多轮对话、上下文保持 | 长任务 |
| 结构化输出 | JSON Schema / Zod / Pydydantic | 数据提取 |
| 流式输出 | 实时返回结果 | 实时日志 |
| 成本追踪 | 监控token消耗 | 预算控制 |

### 10.4 实战：构建一个代码审查Agent

```python
from claude_agent_sdk import Agent, tool

@tool
def get_pr_diff(pr_number: int) -> str:
    """获取PR的代码变更"""
    # 调用GitHub API
    import subprocess
    result = subprocess.run(
        ["gh", "pr", "diff", str(pr_number)],
        capture_output=True, text=True
    )
    return result.stdout

@tool
def post_comment(pr_number: int, comment: str) -> bool:
    """在PR上发评论"""
    import subprocess
    result = subprocess.run(
        ["gh", "pr", "comment", str(pr_number), "--body", comment],
        capture_output=True, text=True
    )
    return result.returncode == 0

agent = Agent(
    model="claude-sonnet-4-6",
    tools=[get_pr_diff, post_comment],
    system="""你是一个代码审查专家。
    审查PR时关注：安全漏洞、代码风格、潜在bug。
    用中文回复。"""
)

# 运行
result = agent.run("审查PR #42，把结果评论到PR上")
```

> **滔哥的经验**：我用Agent SDK做了一个内部工具——"需求拆解Agent"。给它一个产品需求文档，它会拆成技术任务、估时间、写JSDoc、生成测试用例。以前产品经理和开发要开2小时会，现在10分钟出结果。

### 10.5 什么时候该用Agent SDK

| 场景 | 用Claude Code | 用Agent SDK |
|------|-------------|------------|
| 日常开发 | ✅ | ❌ |
| 一次性任务 | ✅ | ❌ |
| 团队标准化 | CLAUDE.md + Skills | ❌ |
| 定时自动化 | Routines | ✅ |
| 嵌入到你的产品 | ❌ | ✅ |
| 自定义工具链 | MCP | ✅ |
| 批量处理 | `claude -p` | ✅（更灵活） |

> **核心建议**：Agent SDK适合"Claude Code能力 + 你的业务逻辑"的场景。如果你的需求Claude Code本身就能搞定，没必要用SDK。SDK的价值在于"定制化"。

到这里，你已经从使用者变成了构建者。

---

## 附录

### A 核心命令速查表

| 命令 | 作用 | 常用场景 |
|------|------|---------|
| `claude` | 启动交互式会话 | 日常开发 |
| `claude -p "指令"` | Print模式，非交互 | 脚本/CI/CD |
| `claude -p --output-format json` | JSON输出 | 自动化处理 |
| `claude --resume` | 恢复上次会话 | 中断后继续 |
| `claude --from-pr 123` | 基于PR创建会话 | PR修复 |
| `claude --worktree` | 在git worktree中工作 | 隔离开发 |
| `claude --max-turns 5` | 限制执行轮数 | 控制成本 |
| `/help` | 查看帮助 | 刚开始用 |
| `/compact` | 压缩上下文 | 对话太长 |
| `/model` | 切换模型 | 需要速度/质量 |
| `/effort` | 调节思考深度 | 简单/复杂任务 |
| `/plan` | 进入规划模式 | 大功能设计 |
| `/clear` | 清空对话 | 换话题 |
| `/resume` | 恢复会话 | 继续上次 |
| `/usage` | 查看用量 | 成本控制 |
| `/doctor` | 环境检查 | 排查问题 |
| `/init` | 初始化CLAUDE.md | 新项目 |
| `/compact` | 压缩上下文 | 上下文快满时 |
| `/mcp` | 管理MCP服务器 | 配置外部连接 |
| `/hooks` | 查看Hooks | 检查自动化 |
| `/plugin` | 管理插件 | 安装/查看插件 |

### B MCP服务器推荐清单

| 服务器 | 用途 | 安装命令 |
|--------|------|---------|
| GitHub | Issues/PR/Actions | `npx -y @modelcontextprotocol/server-github` |
| PostgreSQL | 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |
| SQLite | 本地数据库 | `npx -y @modelcontextprotocol/server-sqlite` |
| Slack | 消息/频道 | `npx -y @modelcontextprotocol/server-slack` |
| Filesystem | 文件操作 | `npx -y @modelcontextprotocol/server-filesystem` |
| Puppeteer | 浏览器自动化 | `npx -y @modelcontextprotocol/server-puppeteer` |
| Brave Search | 网络搜索 | `npx -y @modelcontextprotocol/server-brave-search` |
| Memory | 知识图谱 | `npx -y @modelcontextprotocol/server-memory` |

### C 常见错误和解决方案

| 错误 | 原因 | 解决 |
|------|------|------|
| `401 Unauthorized` | API Key过期或无效 | 重新登录：`claude --login` |
| `Rate limit exceeded` | 请求太频繁 | 等几分钟，或升级计划 |
| `Context window full` | 对话太长 | 运行`/compact`压缩上下文 |
| `Tool execution failed` | 工具执行出错 | 检查权限、路径是否正确 |
| `MCP server not found` | MCP配置错误 | 检查`.mcp.json`语法 |
| `Hook timeout` | Hook脚本太慢 | 优化脚本或增加timeout |
| `Permission denied` | 文件权限问题 | 检查文件权限，或用`sudo` |
| 安装后`claude`命令找不到 | PATH没配 | 重启终端，或手动加PATH |

---

### 阅读指南

| 时间 | 章节 | 目标 |
|------|------|------|
| Day 1 | §01-§03 | 从零到第一次跑通 |
| Day 2-3 | §04-§07 | 掌握核心能力 |
| Day 4-5 | §08-§10 | 进阶实战 |
| Day 6 | 附录 | 速查和排错 |

---

> **滔哥出品** | AI Native Coder · 独立开发者
> 最后更新：2026-04-30
