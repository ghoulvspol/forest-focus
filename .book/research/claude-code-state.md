# Claude Code 产品状态调研

**调研时间**: 2026-04-30
**当前版本**: v2.1.123 (2026-04-29)
**默认模型**: Claude Opus 4.7

---

## 1. 安装方式

| 平台 | 推荐方式 | 自动更新 |
|------|---------|---------|
| macOS/Linux | `curl -fsSL https://claude.ai/install.sh \| bash` | 是 |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` | 是 |
| Homebrew | `brew install --cask claude-code` | 否 |
| npm (已弃用) | `npm install -g @anthropic-ai/claude-code` | 否 |

**支持平台**: macOS 13+, Windows 10 1809+, Ubuntu 20.04+, Debian 10+, Alpine 3.19+
**使用入口**: 终端CLI、VS Code扩展、JetBrains插件、桌面应用、Web (claude.ai/code)、Slack、iOS

---

## 2. 核心特性

### 内置工具
- Read / Write / Edit / Glob / Grep / Bash / WebSearch / WebFetch / Agent / Monitor

### 关键能力
- Agentic Coding: gather context → take action → verify results 循环
- 多文件编辑: 看到整个项目目录，协调编辑
- Git集成: staging, committing, branching, PR creation, worktree
- Agent Teams: 多agent并行协作
- Agent SDK: Python + TypeScript 构建自定义agent
- Computer Use (Research Preview): 打开原生应用，操作UI

### 配置体系
- CLAUDE.md: 项目指令文件（全局 ~/.claude/CLAUDE.md + 项目级）
- settings.json: 机器级配置
- .mcp.json: MCP服务器配置
- .claude/commands/*.md: 自定义斜杠命令
- .claude/skills/*/SKILL.md: 技能定义
- .claude/agents/*.md: 子agent定义

### 权限模式 (6种)
default / acceptEdits / plan / auto / dontAsk / bypassPermissions

### Hooks系统
- 事件: SessionStart, SessionEnd, Setup, UserPromptSubmit, Stop, StopFailure, PreToolUse, PostToolUse, PostToolBatch, PermissionRequest, FileChanged, CwdChanged
- 类型: command, http, mcp_tool, prompt, agent

### MCP支持
- .mcp.json 配置
- MCP registry
- Tool search (大规模MCP工具)
- alwaysLoad 选项

### 斜杠命令
/help, /clear, /compact, /context, /model, /effort, /login, /resume, /config, /hooks, /mcp, /permissions, /skills, /agents, /theme, /tui, /focus, /usage, /doctor, /init, /plan, /loop, /schedule, /desktop, /copy, /rename, /feedback, /powerup, /ultraplan, /ultrareview, /team-onboarding, /autofix-pr, /plugin

---

## 3. 定价

| 计划 | 说明 |
|------|------|
| Pro | ~$20/月，个人版，无auto mode |
| Max | ~$100/月，Opus 4.7，auto mode可用 |
| Team | ~$30/seat/月，管理控制，SSO |
| Enterprise | 自定义价格，高级安全合规 |

---

## 4. 竞品对比

| 维度 | Claude Code | Cursor | GitHub Copilot | Windsurf |
|------|-------------|--------|----------------|----------|
| 界面 | 终端+IDE+桌面+Web+Slack+CI/CD | IDE (VS Code fork) | IDE扩展+CLI | IDE (VS Code fork) |
| Agent循环 | 完整agentic | Agent模式 | Agent模式 | Agent模式 |
| MCP | 完整 | 是 | 有限 | 有限 |
| Hooks | 完整生命周期 | 无 | 无 | 无 |
| Agent SDK | Python+TypeScript | 无 | 无 | 无 |
| 调度 | Routines+/loop | 无 | 无 | 无 |
| 子agent | 多agent协调 | 无 | 无 | 无 |

---

## 5. 2026年重大更新

- Week 13: Auto mode, Computer Use, PR auto-fix
- Week 14: Computer Use in CLI, /powerup, /tui
- Week 15: Ultraplan, Monitor tool, /autofix-pr
- Week 16: Opus 4.7默认, /ultrareview, Routines, /effort
- Week 17: /ultrareview public preview, Session recap, Custom themes
- Agent SDK 重命名为 Claude Agent SDK
- Channels: Telegram/Discord/iMessage/Webhook 推送
- Slack集成: @Claude → PR
- Chrome扩展 (beta)
