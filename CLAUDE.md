
## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
# Superpowers + gstack 搭配配置

## Superpowers（思考与流程层）
负责所有 plan、brainstorm、debug、TDD、verify、code review。
触发方式：自动触发。

## gstack（执行与外部世界层）
负责浏览器操作、QA、ship、deploy、canary、安全审计。
触发方式：斜杠命令手动触发。

## 浏览器规则
使用 /browse 作为唯一浏览器入口。
禁止使用 mcp__claude-in-chrome__* 操作浏览器。

## 分工裁决
- 计划撰写 → Superpowers: writing-plans
- 计划多视角审查 → gstack: /autoplan
- 编码 → Superpowers: test-driven-development
- 调试 → Superpowers: systematic-debugging
- 真实环境验证 → gstack: /qa
- 代码审查 → Superpowers: requesting-code-review
- 发布 → gstack: /ship
- 安全审计 → gstack: /cso

Available skills: /office-hours, /plan-ceo-review, /plan-eng-review,
/plan-design-review, /design-consultation, /design-shotgun, /design-html,
/review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /qa,
/qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro,
/investigate, /document-release, /codex, /cso, /autoplan, /pair-agent,
/careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn
