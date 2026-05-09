# Claude Code 橙皮书

v2.1 · AI编程工具完全技术指南

**创建者**: 滔哥
**为谁创建**: 想深入掌握Claude Code的开发者、技术负责人、DevOps工程师
**基于**: Claude Code v2.1.123 · Claude Opus 4.7
**最后更新**: 2026-04-30
**适用场景**: 日常开发、代码审查、CI/CD自动化、团队协作、Agent开发

---

## Part 1: 认识 Claude Code

从"是什么"到"为什么用"。读完能做出判断。

---

## 01 是什么 / 为什么存在

### 01.1 一句话定义

Claude Code是Anthropic出的agentic编程工具。跑在终端里。能看你的整个项目。能自己决定下一步做什么。

它不是代码补全。它是一个能自主行动的编程Agent。

### 01.2 诞生背景

2024年，AI编程工具主要是两类：

| 类型 | 代表 | 模式 |
|------|------|------|
| 代码补全 | GitHub Copilot | 你打字，它猜下一行 |
| IDE集成 | Cursor | 你选中代码，它帮你改 |

这两类工具都有一个根本限制：它们只能看到你打开的文件。

2025年2月，Anthropic发布Claude Code。思路完全不同：

不是"帮你写当前文件"，是"帮你做整个项目"。

### 01.3 核心理念

Claude Code的设计哲学是Unix哲学：

- 做一件事，做好（终端里的AI编程助手）
- 能组合（管道、脚本、CI/CD）
- 能扩展（MCP、Hooks、Plugins、Agent SDK）

> **滔哥的经验**：用了Claude Code之后，我最大的感受是——它不是在帮我写代码，它是在帮我做项目。你给方向，它自己规划、执行、验证。这个区别很关键。

---

## 02 核心概念

### 02.1 Agentic循环

Claude Code的工作模式是一个循环：

```
规划 → 执行 → 验证 → 调整 → 继续
```

举个例子。你说"给这个项目加个用户认证功能"。

它会：
1. 读项目结构，了解技术栈
2. 规划方案：用JWT还是Session？密码怎么存？
3. 创建文件、写代码
4. 跑测试，看有没有报错
5. 如果报错，自己修
6. 重复，直到完成

你随时可以打断它。

### 02.2 工具系统

Claude Code有一套内置工具：

| 工具 | 作用 | 类比 |
|------|------|------|
| Read | 读文件 | cat |
| Write | 写文件 | 重定向 > |
| Edit | 精确编辑 | sed |
| Glob | 按模式找文件 | find |
| Grep | 按内容搜索 | grep/rg |
| Bash | 执行命令 | 终端本身 |
| Agent | 启动子Agent | 派活给别人 |
| WebSearch | 搜索网络 | Google |
| WebFetch | 抓取网页 | curl |

这些工具是Claude Code的"手脚"。没有工具，它只能说话。有了工具，它能干活。

### 02.3 上下文管理

Claude的上下文窗口是有限的。Claude Code用几个机制管理：

- **自动压缩**：上下文快满时，自动压缩历史对话
- **手动压缩**：`/compact`命令，可以指定压缩重点
- **CLAUDE.md**：每次会话自动加载的项目指令
- **Memory**：跨会话的记忆系统
- **Tool Search**：MCP工具延迟加载，不占上下文

### 02.4 权限模型

Claude Code可以做很多事——读文件、写文件、执行命令。这些操作需要权限。

6种权限模式：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| `default` | 每次操作都问你 | 刚开始用 |
| `acceptEdits` | 自动接受文件编辑，其他仍问 | 日常开发 |
| `plan` | 只读不写，用于规划 | 了解项目 |
| `auto` | AI判断安全的操作自动执行 | 高效模式 |
| `dontAsk` | 除了危险操作都不问 | 高信任度 |
| `bypassPermissions` | 全部自动执行 | CI/CD专用 |

> **滔哥的经验**：我日常用`acceptEdits`。写文件让它自动来，跑命令我还是想确认一下。做CI/CD用`bypassPermissions`，因为没人看着。

---

## 03 与其他方案的对比

### 03.1 全景对比

| 维度 | Claude Code | Cursor | GitHub Copilot | Windsurf |
|------|-------------|--------|----------------|----------|
| 界面 | 终端+IDE+桌面+Web+Slack+iOS | IDE (VS Code fork) | IDE扩展+CLI | IDE (VS Code fork) |
| 核心模式 | Agentic循环 | 补全+Agent | 补全+Agent | 补全+Agent |
| 上下文 | 整个项目目录 | 当前文件+索引 | 当前文件 | 当前文件+索引 |
| MCP | 完整（服务器+注册表+工具搜索） | 是 | 有限 | 有限 |
| Hooks | 完整生命周期（12种事件） | 无 | 无 | 无 |
| Agent SDK | Python+TypeScript | 无 | 无 | 无 |
| 多Agent | 子agent+团队模式 | 无 | 无 | 无 |
| 调度 | Routines+/loop+/schedule | 无 | 无 | 无 |
| Git集成 | 深度（commit/PR/worktree/review） | 基础 | 基础 | 基础 |
| 云端执行 | 有（Web会话/Routines） | 无 | 无 | 无 |
| 模型 | Claude Opus 4.7/Sonnet/Haiku | 多模型 | GPT-4o/Claude | 多模型 |
| 定价 | ~$20-100/月 | $20-40/月 | $10-39/月 | $15-30/月 |

### 03.2 差异化能力

Claude Code有4个独有能力，其他三家都没有：

1. **Hooks系统**：12种生命周期事件，5种处理器类型
2. **Agent SDK**：Python+TypeScript构建自定义Agent
3. **多Agent协作**：子Agent+团队模式
4. **调度系统**：Routines云端定时+/loop本地循环

> **重点看**：这4个能力不是"稍微好一点"，是"根本没有"。

### 03.3 选型建议

| 场景 | 推荐 |
|------|------|
| 项目<10个文件，需要多模型 | Cursor |
| 深度GitHub生态集成 | GitHub Copilot |
| 项目>20个文件，需要Agent能力 | Claude Code |
| 团队标准化+CI/CD自动化 | Claude Code |
| 预算紧张，只需补全 | GitHub Copilot |

---

## 04 安装和环境要求

### 04.1 系统要求

| 平台 | 最低版本 | 架构 |
|------|---------|------|
| macOS | 13+ | ARM64, x64 |
| Windows | 10 1809+ | x64 |
| Ubuntu | 20.04+ | ARM64, x64 |
| Debian | 10+ | ARM64, x64 |
| Alpine | 3.19+ | ARM64, x64 |

### 04.2 安装方式

**推荐：原生安装（自动更新）**

macOS/Linux：
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell（管理员）：
```powershell
irm https://claude.ai/install.ps1 | iex
```

Windows CMD：
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

**其他方式（手动更新）**

```bash
# Homebrew
brew install --cask claude-code

# WinGet
winget install Anthropic.ClaudeCode

# apt (Debian/Ubuntu)
# 通过签名的apt仓库安装

# dnf (Fedora/RHEL)
# 通过签名的dnf仓库安装

# npm（已弃用，不推荐）
npm install -g @anthropic-ai/claude-code
```

### 04.3 使用入口

| 入口 | 命令/位置 | 说明 |
|------|----------|------|
| 终端CLI | `claude` | 主要入口 |
| VS Code扩展 | 扩展商店搜索"Claude Code" | IDE内使用 |
| JetBrains插件 | 插件市场搜索"Claude Code" | IntelliJ/PyCharm等 |
| 桌面应用 | claude.ai/download | macOS/Windows |
| Web | claude.ai/code | 浏览器直接用 |
| Slack | @Claude | 团队协作 |
| iOS | App Store搜索"Claude" | 移动端 |

### 04.4 认证方式

```bash
# 方式1：Claude订阅账号（推荐）
claude
# 首次运行会弹出浏览器登录

# 方式2：API Key
export ANTHROPIC_API_KEY=sk-ant-xxx
claude

# 方式3：Amazon Bedrock
export AWS_REGION=us-east-1
export CLAUDE_CODE_USE_BEDROCK=1
claude

# 方式4：Google Vertex AI
export CLOUD_ML_REGION=us-east5
export CLAUDE_CODE_USE_VERTEX=1
claude
```

### 04.5 安装验证

```bash
# 检查版本
claude --version
# 预期输出：Claude Code v2.1.123

# 检查环境
claude /doctor
# 会检查：Node.js、Git、权限、网络等

# 第一次对话
claude "你好，告诉我你的版本"
```

### 04.6 常见安装问题

| 问题 | 平台 | 解决 |
|------|------|------|
| "无法验证开发者" | macOS | 系统设置 → 安全性 → 仍要打开 |
| PowerShell执行策略 | Windows | `Set-ExecutionPolicy RemoteSigned` |
| curl找不到 | Windows CMD | 用PowerShell安装方式 |
| 网络超时 | 所有 | 检查代理，或用VPN |
| 权限不足 | Linux | `sudo`或检查`~/.local/bin`在PATH中 |

---

## Part 2: 技术架构

深入内部机制。读完能理解Claude Code怎么工作。

---

## 05 架构概览

### 05.1 整体架构

```
用户输入
  ↓
权限检查 ← hooks.json
  ↓
Claude模型（Opus 4.7 / Sonnet / Haiku）
  ↓
工具调度
  ├── 文件工具：Read / Write / Edit / Glob / Grep
  ├── 执行工具：Bash / PowerShell
  ├── 网络工具：WebSearch / WebFetch
  ├── MCP工具：通过MCP服务器扩展
  └── Agent工具：启动子Agent
  ↓
结果验证
  ↓
输出给用户
  ↓
Hooks后处理 ← hooks.json
```

### 05.2 模型选择

| 模型 | 特点 | 适用场景 | 成本 |
|------|------|---------|------|
| Opus 4.7 | 最强推理，最深思考 | 复杂架构、代码审查 | 高 |
| Sonnet 4.6 | 平衡速度和质量 | 日常开发 | 中 |
| Haiku 4.5 | 最快 | 简单查询、批量处理 | 低 |

切换方式：
```
/model opus    # 切到Opus
/model sonnet  # 切到Sonnet
/model haiku   # 切到Haiku
```

### 05.3 会话生命周期

```
1. SessionStart → 触发启动Hooks
2. 加载CLAUDE.md（全局+项目级）
3. 加载settings.json配置
4. 加载MCP服务器
5. 等待用户输入
6. UserPromptSubmit → 触发输入Hooks
7. 模型推理 + 工具调用循环
8. PreToolUse → 工具执行前Hook
9. 工具执行
10. PostToolUse → 工具执行后Hook
11. 输出结果
12. 回到步骤5
13. Stop → 触发停止Hook
14. SessionEnd → 触发结束Hook
```

---

## 06 内置工具链

### 06.1 文件工具

**Read — 读文件**

```bash
# Claude内部调用
Read(file_path="/path/to/file", offset=1, limit=100)
```

- 支持文本、图片、PDF、Jupyter Notebook
- 默认读前2000行
- 可指定offset和limit

**Write — 写文件**

```bash
Write(file_path="/path/to/file", content="文件内容")
```

- 覆盖写入
- 创建新文件前会检查父目录

**Edit — 精确编辑**

```bash
Edit(
  file_path="/path/to/file",
  old_string="要替换的文本",
  new_string="新文本",
  replace_all=false
)
```

- 只替换差异部分，不覆盖整个文件
- `replace_all=true`替换所有匹配

**Glob — 文件搜索**

```bash
Glob(pattern="**/*.ts", path="/src")
```

- 支持glob模式
- 按修改时间排序

**Grep — 内容搜索**

```bash
Grep(pattern="function\\s+\\w+", type="ts", output_mode="content")
```

- 基于ripgrep
- 支持正则、文件类型过滤
- 输出模式：files_with_matches / content / count

### 06.2 执行工具

**Bash — 执行shell命令**

```bash
Bash(command="npm test", timeout=120000, description="Run tests")
```

- 超时默认120秒，最大600秒
- 支持后台运行（`run_in_background=true`）
- 工作目录在会话间保持

**Monitor — 监控后台任务**

```bash
Monitor(task_id="task-123", follow=true)
```

- 流式输出后台脚本的事件
- 2026年4月新增

### 06.3 网络工具

**WebSearch — 搜索**

```bash
WebSearch(query="Claude Code latest features 2026")
```

- 返回结构化搜索结果
- 支持域名过滤

**WebFetch — 抓取网页**

```bash
WebFetch(url="https://example.com", prompt="提取关键信息")
```

- HTML转Markdown
- 内置15分钟缓存
- 不支持需要认证的页面

---

## 07 MCP协议

### 07.1 什么是MCP

Model Context Protocol。模型上下文协议。

让Claude Code连接外部服务。GitHub、数据库、Slack、Jira——任何有API的东西。

类比：没有MCP的Claude像关在房间里的程序员。有了MCP，像有手机的程序员。

### 07.2 配置方式

**方式1：.mcp.json文件**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

**方式2：命令行**

```bash
# 添加
claude mcp add github -e GITHUB_TOKEN=xxx -- npx -y @modelcontextprotocol/server-github

# 添加SSE远程服务器
claude mcp add --transport sse remote-server https://example.com/mcp

# 查看
claude mcp list

# 删除
claude mcp remove github
```

**方式3：settings.json**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### 07.3 传输协议

| 协议 | 用途 | 配置 |
|------|------|------|
| stdio | 本地服务器 | `command` + `args` |
| SSE | 远程服务器 | `url` |

### 07.4 环境变量

```json
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}",
    "K8S_NAMESPACE": "${K8S_NAMESPACE:-default}"
  }
}
```

- `${VAR}` — 运行时注入
- `${VAR:-default}` — 带默认值
- `${CLAUDE_PLUGIN_ROOT}` — 插件根目录

### 07.5 高级配置

**alwaysLoad — 跳过工具搜索延迟**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "alwaysLoad": true
    }
  }
}
```

默认情况下，MCP工具通过Tool Search延迟加载。设`alwaysLoad: true`可以跳过延迟。

**MCP注册表**

Claude Code有一个MCP注册表（`api.anthropic.com/mcp-registry`），可以发现和安装社区贡献的MCP服务器。

### 07.6 常用MCP服务器

| 服务器 | 用途 | 安装 |
|--------|------|------|
| GitHub | Issues/PR/Actions | `npx -y @modelcontextprotocol/server-github` |
| PostgreSQL | 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |
| SQLite | 本地数据库 | `npx -y @modelcontextprotocol/server-sqlite` |
| Slack | 消息/频道 | `npx -y @modelcontextprotocol/server-slack` |
| Filesystem | 文件操作 | `npx -y @modelcontextprotocol/server-filesystem` |
| Puppeteer | 浏览器自动化 | `npx -y @modelcontextprotocol/server-puppeteer` |
| Brave Search | 网络搜索 | `npx -y @modelcontextprotocol/server-brave-search` |
| Memory | 知识图谱 | `npx -y @modelcontextprotocol/server-memory` |

### 07.7 MCP故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 工具不出现 | 服务器没启动成功 | 检查`.mcp.json`语法，看日志 |
| 工具太多选择困难 | 暴露了几百个工具 | 设`alwaysLoad: false` |
| Token过期 | 凭据失效 | 重新生成，更新配置 |
| 超时 | 服务器响应慢 | 检查网络，或换本地服务器 |
| 权限错误 | Token权限不足 | 检查Token的scope |

---

## 08 Hooks系统

### 08.1 什么是Hooks

在Claude Code的生命周期里，插入你自己的逻辑。

类比：Git hooks在commit/push前后执行脚本。Claude Hooks在工具调用前后执行脚本。

### 08.2 事件类型

| 事件 | 触发时机 | 典型用途 |
|------|---------|---------|
| `SessionStart` | 会话开始 | 加载上下文、初始化环境 |
| `SessionEnd` | 会话结束 | 清理资源、发送报告 |
| `Setup` | 首次设置 | 安装依赖 |
| `UserPromptSubmit` | 用户输入时 | 过滤敏感词、预处理 |
| `Stop` | Claude要停止时 | 检查任务完成度 |
| `StopFailure` | Claude停止但任务失败 | 重试或报警 |
| `PreToolUse` | 工具执行前 | 安全检查、权限控制 |
| `PostToolUse` | 工具执行后 | 格式化、记录日志 |
| `PostToolBatch` | 批量工具执行后 | 汇总处理 |
| `PermissionRequest` | 请求权限时 | 自动审批/拒绝 |
| `FileChanged` | 文件被修改后 | 自动lint、格式化 |
| `CwdChanged` | 工作目录变化 | 切换配置 |

### 08.3 处理器类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `command` | 执行shell脚本 | `bash check.sh` |
| `http` | 调用webhook | 通知Slack |
| `mcp_tool` | 调用MCP工具 | 查数据库校验 |
| `prompt` | 让Claude判断 | "检查代码是否安全" |
| `agent` | 启动子Agent | 专项检查Agent |

### 08.4 配置方式

**方式1：settings.json**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/safety-check.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**方式2：插件内配置**

```
my-plugin/
  hooks/
    hooks.json      # Hook配置
    safety-check.sh  # Hook脚本
```

### 08.5 Matcher规则

```json
{
  "matcher": "Bash"           // 精确匹配
  "matcher": "Write|Edit"     // 正则匹配
  "matcher": "*"              // 匹配所有
  "matcher": "Bash|Write"     // 多个工具
}
```

### 08.6 Hook输入输出

Hook通过stdin接收JSON输入：

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/build"
  }
}
```

Hook通过stdout输出：

```json
{
  "decision": "block",
  "reason": "危险命令被拦截"
}
```

- `decision: "block"` — 阻止执行
- `decision: "approve"` — 允许执行
- 不输出JSON — 默认允许

### 08.7 条件Hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "if": "command contains 'deploy'",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "确认要执行部署命令吗？检查环境变量和目标环境。"
          }
        ]
      }
    ]
  }
}
```

2026年3月新增的`if`条件字段，支持对Hook输入做条件判断。

### 08.8 实战：完整质量门禁

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/safety-check.sh",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx eslint --fix $CLAUDE_FILE_PATH 2>/dev/null || true",
            "timeout": 15
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "检查所有修改的文件，确认测试通过、没有lint错误。"
          }
        ]
      }
    ]
  }
}
```

---

## Part 3: 配置详解

每一个配置文件的作用和最佳实践。

---

## 09 CLAUDE.md

### 09.1 作用

项目级指令文件。每次会话自动加载。告诉Claude"在这个项目里，你要遵守什么规则"。

### 09.2 层级

| 层级 | 路径 | 覆盖关系 |
|------|------|---------|
| 全局 | `~/.claude/CLAUDE.md` | 最低优先级 |
| 项目 | `./CLAUDE.md` | 覆盖全局 |
| 子目录 | `./src/CLAUDE.md` | 特定目录规则 |

### 09.3 内容模板

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
- 业务逻辑：src/services/
- 接口：src/routes/
- 类型定义：src/types/
- 工具函数：src/utils/

## Git规范
- Commit格式：type(scope): description
- 不自动push

## 架构决策
- 用REST不用GraphQL
- 认证用JWT不用Session
- 缓存用Redis不用内存

## 已知问题
- user表的created_at有时区问题，统一用UTC
- 支付回调幂等性靠外部订单号保证

## 禁止事项
- 不用any类型
- 不硬编码密钥
- 不删已有的测试
```

### 09.4 初始化

```bash
# 在项目目录下运行
claude /init
```

自动扫描项目，生成CLAUDE.md草稿。

### 09.5 最佳实践

| 实践 | 说明 |
|------|------|
| 持续更新 | 每次踩坑都往里加 |
| 具体不模糊 | "2空格缩进"而非"标准缩进" |
| 写决策原因 | "用JWT因为要支持移动端" |
| 写已知问题 | 避免Claude重复踩坑 |
| 不写能推导的 | 代码风格能从现有代码推导 |

---

## 10 settings.json

### 10.1 位置

| 层级 | 路径 |
|------|------|
| 全局 | `~/.claude/settings.json` |
| 项目 | `./.claude/settings.json` |

### 10.2 完整配置示例

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...]
  },
  "mcpServers": {
    "github": {...},
    "postgres": {...}
  },
  "enabledPlugins": ["commit-commands", "code-review"],
  "extraKnownMarketplaces": [
    { "url": "https://github.com/your-org/your-marketplace" }
  ],
  "permissions": {
    "allow": ["Read", "Glob", "Grep"],
    "deny": ["Bash(rm *)"]
  }
}
```

### 10.3 权限配置

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(git *)",
      "Bash(npm test)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)"
    ]
  }
}
```

---

## 11 .mcp.json

### 11.1 完整配置

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "alwaysLoad": true
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "remote-api": {
      "transport": "sse",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

### 11.2 优先级

1. 命令行 `--mcp-config`
2. 插件级 `.mcp.json`
3. 项目级 `.mcp.json`
4. 全局 `~/.claude/.mcp.json`

---

## 12 权限模式

### 12.1 六种模式详解

| 模式 | 文件编辑 | Bash命令 | 适用场景 |
|------|---------|---------|---------|
| `default` | 每次确认 | 每次确认 | 刚开始用 |
| `acceptEdits` | 自动 | 每次确认 | 日常开发 |
| `plan` | 不允许 | 不允许 | 只读规划 |
| `auto` | AI判断 | AI判断 | 高效模式 |
| `dontAsk` | 自动 | 除危险外自动 | 高信任度 |
| `bypassPermissions` | 全自动 | 全自动 | CI/CD |

### 12.2 Auto模式

2026年3月引入的research preview。一个分类器模型评估每个操作的安全性。

- 安全操作 → 自动执行
- 危险操作 → 拦截并询问

可用计划：Max、Team Premium、Enterprise、API。

### 12.3 切换方式

```bash
# 启动时指定
claude --permission-mode auto

# 会话中切换
/permissions

# 查看当前模式
/config
```

---

## Part 4: 核心功能

每个功能的原理、配置和实战。

---

## 13 斜杠命令

### 13.1 内置命令

| 命令 | 作用 |
|------|------|
| `/help` | 查看帮助 |
| `/clear` | 清空对话 |
| `/compact` | 压缩上下文 |
| `/model` | 切换模型 |
| `/effort` | 调节思考深度 |
| `/plan` | 进入规划模式 |
| `/resume` | 恢复会话 |
| `/usage` | 查看用量 |
| `/doctor` | 环境检查 |
| `/init` | 初始化CLAUDE.md |
| `/mcp` | 管理MCP |
| `/hooks` | 查看Hooks |
| `/plugin` | 管理插件 |
| `/theme` | 切换主题 |
| `/tui` | 终端UI模式 |
| `/powerup` | 交互式教程 |
| `/focus` | 聚焦上下文 |
| `/copy` | 复制输出 |
| `/rename` | 重命名会话 |
| `/feedback` | 反馈 |
| `/ultraplan` | 云端规划 |
| `/ultrareview` | 云端多Agent审查 |
| `/team-onboarding` | 团队引导 |
| `/autofix-pr` | 自动修复PR |
| `/loop` | 循环执行 |
| `/schedule` | 定时任务 |

### 13.2 自定义命令

文件位置：`.claude/commands/*.md`

```markdown
---
description: Review latest changes
allowed-tools: Read, Bash(git:*)
model: sonnet
argument-hint: [scope]
---

Review the latest git changes in $ARGUMENTS:
1. Run `git diff HEAD~1`
2. Check for issues
3. Suggest improvements
```

文件名即命令名：`review.md` → `/review`

### 13.3 命令参数

```markdown
---
description: Explain a file or concept
argument-hint: [file-or-concept]
---

Explain $ARGUMENTS in detail.
Use $1 for first arg, $2 for second, $ARGUMENTS for all.
```

用法：`/explain src/auth/jwt.js`

### 13.4 命令中的特殊语法

```markdown
---
description: Demo command
---

# 引用文件
Read the config: @.claude/settings.json

# 执行shell命令
Current branch: !`git branch --show-current`

# 参数
Task: $ARGUMENTS
```

---

## 14 Skills系统

### 14.1 什么是Skills

比斜杠命令更强大。可以定义触发条件、多步工作流、工具限制、子Agent。

### 14.2 目录结构

```
.claude/skills/
  code-review/
    SKILL.md          # 技能定义（必须）
    references/       # 参考资料（可选）
    scripts/          # 辅助脚本（可选）
```

### 14.3 SKILL.md格式

```markdown
---
name: code-review
description: Automatic code review on PR
---

# Code Review Skill

## When to activate
- When user mentions "review", "code review", "PR review"
- When a PR is created or updated

## Workflow
1. Read the diff
2. Check for security issues
3. Check code style
4. Check test coverage
5. Generate structured report

## Tools allowed
- Read
- Grep
- Glob
- Bash(git *)
```

### 14.4 Skills vs 命令 vs Hooks

| 维度 | 命令 | Skills | Hooks |
|------|------|--------|-------|
| 触发 | 手动`/命令` | 自动匹配 | 事件驱动 |
| 复杂度 | 单文件 | 多文件 | 脚本 |
| 典型场景 | 日常操作 | 专项能力 | 质量门禁 |

---

## 15 子Agent

### 15.1 概念

主Agent可以启动子Agent。子Agent有独立上下文窗口，独立执行任务。

类比：技术负责人分配任务给专项工程师。

### 15.2 内置Agent类型

| 类型 | 用途 |
|------|------|
| `general-purpose` | 通用任务 |
| `Explore` | 代码探索 |
| `Plan` | 架构规划 |

### 15.3 自定义Agent

`.claude/agents/security-reviewer.md`：

```markdown
---
name: security-reviewer
description: Security code review specialist
allowed-tools: Read, Grep, Glob
---

You are a security code review specialist.

Check for:
1. OWASP Top 10 vulnerabilities
2. SQL injection, XSS, CSRF
3. Input validation
4. Authentication/authorization issues
5. Hardcoded secrets

Output format:
- Severity: Critical/High/Medium/Low
- File and line number
- Issue description
- Recommended fix
```

### 15.4 使用方式

```
让security-reviewer检查src/auth/目录
```

Claude自动启动对应Agent执行任务。

### 15.5 团队模式

```bash
export CLAUDE_AGENT_TEAMS=1
claude
```

主Agent像项目经理：分解任务、分配、协调、合并。

> **注意**：团队模式token消耗是单Agent的3-5倍。

### 15.6 并行执行

当子任务之间没有依赖时，子Agent会并行执行：

```
帮我重构认证模块：
1. agent-1: JWT逻辑
2. agent-2: 中间件
3. agent-3: 测试
```

3个Agent同时开始，互不干扰。

---

## 16 插件系统

### 16.1 插件结构

```
my-plugin/
  .claude-plugin/        # 元数据
  skills/                # 技能
  commands/              # 命令
  agents/                # 子Agent
  hooks/                 # Hook脚本+配置
  .mcp.json              # MCP服务器
```

### 16.2 创建插件

```bash
# 交互式创建
/plugin-dev:create-plugin

# 8阶段引导：发现 → 规划 → 设计 → 结构 → 实现 → 验证 → 测试 → 文档
```

### 16.3 安装插件

```bash
# 从市场安装
/plugin install pr-review

# 从本地目录
claude --plugin-dir /path/to/plugin

# 管理
/plugin             # 列出已安装
/plugin enable xxx  # 启用
/plugin disable xxx # 禁用
```

### 16.4 插件设置

每个项目可以有独立的插件设置：

`.claude/my-plugin.local.md`（应加入.gitignore）

---

## Part 5: 进阶实战

真实场景、真实方案。

---

## 17 Git工作流

### 17.1 基础操作

```
# 提交
帮我提交当前修改，commit message用中文

# 分支
创建一个feature/auth分支

# 合并
把feature/auth合并到main

# 冲突
帮我解决这个合并冲突
```

### 17.2 Worktree

```bash
# 在隔离的worktree中工作
claude --worktree

# 或在对话中
创建一个worktree来做这个功能
```

Worktree让Claude在独立的Git分支中工作，不影响你的主分支。

### 17.3 PR工作流

```bash
# 创建PR
帮我创建一个PR，标题用英文，描述用中文

# 基于PR工作
claude --from-pr 123 "修复这个PR的review意见"

# 自动修复
/autofix-pr 123
```

### 17.4 Ultrareview

2026年4月新功能。云端多Agent并行代码审查。

```bash
# CLI
claude ultrareview

# 会话中
/ultrareview
```

启动多个Agent并行审查不同文件，最后汇总结果。

---

## 18 CI/CD集成

### 18.1 Print模式

```bash
# 基础用法
claude -p "检查项目安全漏洞"

# 管道输入
cat error.log | claude -p "分析错误根因"

# JSON输出
claude -p --output-format json "列出所有TODO"

# 限制轮数
claude -p --max-turns 5 "review这段代码"

# 限制预算
claude -p --max-budget-usd 0.5 "完成这个任务"
```

### 18.2 GitHub Actions

```yaml
name: AI Review
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

      - name: Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/main...HEAD | claude -p --output-format json "
            审查这个PR。检查安全、风格、bug。
          " > review.json
```

### 18.3 GitLab CI

```yaml
ai-review:
  stage: review
  script:
    - curl -fsSL https://claude.ai/install.sh | bash
    - git diff origin/main...HEAD | claude -p --output-format json "审查代码"
  rules:
    - if: $CI_MERGE_REQUEST_IID
```

### 18.4 安全注意事项

| 措施 | 说明 |
|------|------|
| `--max-turns` | 限制执行轮数 |
| `--max-budget-usd` | 限制费用 |
| `--permission-mode bypassPermissions` | CI/CD专用权限 |
| 环境变量管理 | 用CI/CD secrets，不硬编码 |

---

## 19 调度和自动化

### 19.1 /loop — 会话内循环

```
/loop 5m /check-status
```

每5分钟执行一次`/check-status`。

### 19.2 /schedule — 定时任务

```
/schedule
```

设置云端定时任务：
- 每天早上9点检查测试
- 每次新PR自动review
- 每周生成质量报告

### 19.3 Routines — 云端调度

2026年4月新功能。云端Agent按计划执行。

触发方式：
- 时间计划（cron表达式）
- GitHub事件（PR创建、Issue更新）
- API调用

### 19.4 Remote Control

从浏览器或手机控制本地Claude Code会话。

```
/desktop
```

打开远程控制界面。

---

## 20 Agent SDK

### 20.1 安装

```bash
# Python
pip install claude-agent-sdk

# TypeScript
npm install @anthropic-ai/claude-agent-sdk
```

### 20.2 基础用法

```python
from claude_agent_sdk import Agent

agent = Agent(
    model="claude-sonnet-4-6",
    tools=["Read", "Write", "Bash", "Grep"],
)

result = agent.run("检查src/目录，修复ESLint错误")
print(result)
```

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  model: 'claude-sonnet-4-6',
  tools: ['Read', 'Write', 'Bash', 'Grep'],
});

const result = await agent.run('检查src/目录，修复ESLint错误');
console.log(result);
```

### 20.3 自定义工具

```python
from claude_agent_sdk import Agent, tool

@tool
def query_database(sql: str) -> str:
    """执行SQL查询"""
    import psycopg2
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(sql)
    results = cur.fetchall()
    return str(results)

agent = Agent(
    model="claude-sonnet-4-6",
    tools=[query_database],
)
```

### 20.4 结构化输出

```python
from pydantic import BaseModel

class CodeReview(BaseModel):
    issues: list[dict]
    score: int
    summary: str

agent = Agent(
    model="claude-sonnet-4-6",
    output_schema=CodeReview,
)

result = agent.run("审查这个文件")
# result 是 CodeReview 类型
```

### 20.5 子Agent

```python
agent = Agent(
    model="claude-sonnet-4-6",
    subagents=["security-reviewer", "test-writer"],
)

result = agent.run("重构认证模块，让security-reviewer检查安全，让test-writer写测试")
```

### 20.6 流式输出

```python
agent = Agent(model="claude-sonnet-4-6")

for chunk in agent.stream("分析这个代码库"):
    print(chunk, end="", flush=True)
```

### 20.7 成本控制

```python
agent = Agent(
    model="claude-sonnet-4-6",
    max_budget_usd=1.0,
    max_turns=10,
)

result = agent.run("完成这个任务")
print(f"花费: ${agent.cost_usd}")
```

### 20.8 Hooks

```python
from claude_agent_sdk import Agent, hook

@hook("pre_tool_use")
def check_safety(tool_name, tool_input):
    if tool_name == "Bash" and "rm" in tool_input.get("command", ""):
        return {"decision": "block", "reason": "危险命令"}
    return {"decision": "approve"}

agent = Agent(
    model="claude-sonnet-4-6",
    hooks=[check_safety],
)
```

---

## 21 高级特性

### 21.1 Extended Thinking

按`Alt+T`（macOS: `Option+T`）切换扩展思考。

开启后Claude会展示推理过程。复杂问题用这个。

### 21.2 Effort级别

```
/effort
```

| 级别 | 说明 | 适用 |
|------|------|------|
| low | 快速回答 | 简单查询 |
| medium | 标准 | 日常开发 |
| high | 深度思考 | 复杂问题 |
| xhigh | 最深思考 | 架构设计 |

### 21.3 Checkpoint和回退

每次文件编辑都会创建checkpoint。

按`Esc`两次打开checkpoint选择器。选择要回退到的点。

### 21.4 Memory系统

Claude Code有自动记忆系统：

- 跨会话保存学习成果
- 用户偏好、项目知识、反馈
- 存储在`~/.claude/projects/<project>/memory/`

### 21.5 Context Window管理

```
# 查看上下文使用情况
/context

# 手动压缩，指定重点
/compact 重点放在数据库设计

# 聚焦特定主题
/focus auth
```

### 21.6 Computer Use（Research Preview）

2026年3月引入。Claude可以：
- 打开原生应用
- 点击UI元素
- 验证视觉变化

目前仅macOS桌面应用和CLI可用。

### 21.7 Channels

结构化多会话工作流。把不同类型的工作分到不同的Channel。

### 21.8 Voice Dictation

语音输入支持。对着麦克风说，Claude听。

---

## Part 6: 附录

---

## 22 部署检查清单

### 22.1 个人开发环境

- [ ] Claude Code已安装（`claude --version`）
- [ ] 已登录（`claude`能正常对话）
- [ ] CLAUDE.md已创建（`/init`）
- [ ] 常用MCP已配置（GitHub/数据库）
- [ ] 权限模式已选择（推荐`acceptEdits`）
- [ ] 3个核心Hook已配置（安全/质量/收尾）

### 22.2 团队环境

- [ ] 个人环境全部完成
- [ ] 项目CLAUDE.md已提交到Git
- [ ] `.claude/commands/`已提交（团队命令）
- [ ] `.claude/skills/`已提交（团队技能）
- [ ] `.claude/agents/`已提交（团队Agent）
- [ ] `.mcp.json`已加入.gitignore（含Token）
- [ ] CI/CD已配置AI review
- [ ] 团队已了解权限模式

### 22.3 CI/CD环境

- [ ] `ANTHROPIC_API_KEY`已配置为CI/CD secret
- [ ] 使用`--permission-mode bypassPermissions`
- [ ] 已设置`--max-turns`和`--max-budget-usd`
- [ ] 测试过print模式正常工作
- [ ] JSON输出能被下游脚本处理

---

## 23 常见问题

| 问题 | 解决 |
|------|------|
| `claude`命令找不到 | 重启终端，或检查PATH |
| 401 Unauthorized | 重新登录：`claude --login` |
| Rate limit exceeded | 等几分钟，或升级计划 |
| Context window full | `/compact`压缩上下文 |
| MCP工具不出现 | 检查`.mcp.json`语法 |
| Hook超时 | 优化脚本或增加timeout |
| 代码风格不一致 | 完善CLAUDE.md |
| 子Agent不启动 | 检查`.claude/agents/`目录 |
| 安装后无法打开(macOS) | 系统设置 → 安全性 → 仍要打开 |
| PowerShell执行策略(Windows) | `Set-ExecutionPolicy RemoteSigned` |

---

## 24 版本更新日志

### 2026年4月重点更新

| 版本 | 日期 | 更新 |
|------|------|------|
| v2.1.123 | 04-29 | OAuth 401修复 |
| v2.1.122 | 04-28 | Bedrock配置增强，PR URL搜索 |
| v2.1.121 | 04-28 | alwaysLoad MCP，插件清理命令 |
| v2.1.120 | 04-28 | Windows PowerShell支持，ultrareview CLI |
| v2.1.111 | 04-16 | Opus 4.7默认，xhigh effort，/ultrareview |
| v2.1.110 | 04-15 | /tui无闪烁渲染，推送通知 |
| v2.1.101 | 04-10 | /team-onboarding，/ultraplan |
| v2.1.98 | 04-09 | Vertex AI向导，Monitor工具，沙盒化 |

### 2026年3月重点更新

| 版本 | 日期 | 更新 |
|------|------|------|
| v2.1.85 | 03-27 | Auto mode，Computer Use，PR auto-fix |
| v2.1.86 | 03-30 | CLI Computer Use，/powerup |
| v2.1.91 | 04-03 | /tui，MCP 500K结果 |

---

## 核心命令速查表

| 命令 | 作用 |
|------|------|
| `claude` | 启动交互式会话 |
| `claude -p "指令"` | Print模式 |
| `claude -p --output-format json` | JSON输出 |
| `claude --resume` | 恢复会话 |
| `claude --from-pr 123` | 基于PR |
| `claude --worktree` | Git worktree |
| `claude --max-turns 5` | 限制轮数 |
| `claude --permission-mode auto` | 权限模式 |
| `claude --plugin-dir /path` | 加载插件 |
| `claude ultrareview` | 云端审查 |
| `/compact` | 压缩上下文 |
| `/model` | 切换模型 |
| `/effort` | 思考深度 |
| `/plan` | 规划模式 |
| `/resume` | 恢复会话 |
| `/usage` | 查看用量 |
| `/doctor` | 环境检查 |
| `/init` | 初始化 |
| `/mcp` | MCP管理 |
| `/hooks` | Hook查看 |
| `/plugin` | 插件管理 |
| `/theme` | 主题切换 |
| `/tui` | 终端UI |
| `/loop` | 循环执行 |
| `/schedule` | 定时任务 |
| `/ultrareview` | 云端审查 |
| `/ultraplan` | 云端规划 |

---

> **滔哥出品** | AI Native Coder · 独立开发者
> 最后更新：2026-04-30
