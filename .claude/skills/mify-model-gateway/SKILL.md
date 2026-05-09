---
name: mify-model-gateway
description: 小米公司大模型网关（Mify, model.mify.ai.srv）的操作入口，以及基于 Artificial Analysis Intelligence Index 今日榜单做开放式 LLM 推荐。触发场景（满足任一都应使用）：(1) 查询 Mify 网关是否有某模型（Kimi/DeepSeek/Qwen/GPT/Claude/Gemini/GLM/Doubao 等）；(2) 列出公司支持的某类模型（LLM/embedding/TTS/ASR/rerank）；(3) 对比同一模型在不同 owner 下的可用版本；(4) 验证某模型能否调通（smoke test）；(5) 开放式 LLM 推荐（"推荐个性能强的模型"/"哪个又强又快"/"国产里哪个最好"/"适合 RAG 的 embedding"/"启动快的 chat 模型"），skill 会先拉今日 Artificial Analysis 榜单再交叉 Mify 可用性给建议；(6) 用户在对话里贴出疑似 Mify API key（sk-...）时，自动调用 install_token.py 一键帮他装好；(7) 用户说"把 X 设成我的 Claude Code 模型"/"用 Mify 的 Kimi 跑 Claude Code"/"切 Claude Code 到 xiaomi/…"，或刚给出模型推荐后需要一键落盘到 ~/.claude/settings.json 时，自动调用 set_cc_model.py 带 --dry-run 给用户看 diff 再真写。不要为"OpenAI 官方 API 怎么用"/"Anthropic API 计费"这类与公司网关无关的问题触发，也不要为"推荐本书/餐厅"这类非 LLM 推荐触发。
---

# Mify 大模型网关查询

## 背景

Mify (`model.mify.ai.srv`) 是小米公司的大模型统一网关，**OpenAI 兼容接口**，聚合了 13 条上游通道（`tongyi` / `azure_openai` / `siliconflow` / `volcengine_maas` / `ppio` / `xiaomi` / `zhipuai` / `baidu_qianfan` / `wenxin` / `hunyuan` / `minimax` / `vertex_ai` / `cloudml`）。完整说明见 `references/owner_guide.md`。

**同一个模型 id 可能出现多次，`owned_by` 不同**，背后是不同供应商的推理服务，计费/SLA/稳定性都不同。推荐优先级见 owner_guide.md。

### 调用格式（最重要的 Mify 约定）

**`/v1/chat/completions` 的 `model` 参数必须是 `{owned_by}/{id}` 形式，裸 id 一律 HTTP 400。**

因为同一个 id 在不同 owner 下都存在（如 `kimi-k2.5` 同时在 `xiaomi` 和 `tongyi` 下），网关用裸 id 无法路由。必须显式带 owner 前缀：

| ✗ 错误（会 400） | ✓ 正确 |
|---|---|
| `kimi-k2.5` | `xiaomi/kimi-k2.5` 或 `tongyi/kimi-k2.5` |
| `DeepSeek-R1-0528` | `xiaomi/DeepSeek-R1-0528` |
| `gpt-5` | `azure_openai/gpt-5` |
| `moonshotai/Kimi-K2-Thinking` | `siliconflow/moonshotai/Kimi-K2-Thinking` |

注意最后一行：即使原 id 本身已经带 `moonshotai/` 前缀，Mify 调用时还是要在最外层再加 owner，变成 `siliconflow/moonshotai/...`。不要自己省略。

`list_models.py` 的输出里有一列叫 **CALL AS**，列出的字符串是**可以直接复制到 `model` 参数里的**，永远照抄那一列。

### list endpoint vs chat endpoint 的语义差异

- `/v1/models` 返回网关**配置里挂了**的所有模型（约 450 条），反映「公司网关是否集成了 X」。
- `/v1/chat/completions` 是实际调用路径，**model 必须带 owner 前缀**（见上）。

绝大多数 key 对所有通道都开放，`test_model.py` 对列表里任意 `owner/id` 基本都会返回 200。如果 400 且是 "Not supported model"，99% 的情况是**你忘了 owner 前缀**，少数情况是 owner 名拼错或该通道对这个 key 不开放。

## 何时触发

主要场景：

1. **可用性查询**：「公司网关支不支持 X 模型？」「Mify 上有没有 kimi-k2.6？」「DeepSeek-V3.2 在不在？」
2. **清单筛选**：「公司的 embedding 模型有哪些？」「我要找 TTS 模型」「列出 xiaomi 自建的所有 LLM」
3. **调用验证**：「帮我测一下 X 模型能不能调通」「我写的代码一直 404，是不是模型 id 写错了？」
4. **版本比较**：「Mify 上 Qwen 最新版本是多少？」「Kimi 各版本有哪些？」
5. **通用推荐**：「推荐个性能强的模型」「哪个模型又快又强」「适合 RAG 的 LLM 选哪个」「国产里最好的大模型」—— 这种开放问题也触发本 skill，因为需要**业界榜单 × 公司可用性**的交叉判断，不能拍脑袋。
6. **落盘 Claude Code 配置**：「把 `xiaomi/kimi-k2.5` 设成我的 Claude Code 模型」「用 Mify 的 Kimi 跑 Claude Code」「切 Claude Code 到 ppio 那个 claude-opus-4-7」。调 `set_cc_model.py` 改 `~/.claude/settings.json` 的 Haiku/Sonnet/Opus 三档 env 变量之一。**每次推荐完模型后都应主动 offer 一句**「要不要直接在 Claude Code 配置里切过去试试？」

如果用户贴出了一段 `curl model.mify.ai.srv` 的命令 —— 无论是问 models 列表、调 chat completion，还是 embedding —— 都应直接用本 skill 的脚本替代裸 curl，**不要重新抄一遍 curl 命令**。

## 前置条件

脚本从环境变量 `$MIFY_API_KEY` 读取 token。如果未配置，`list_models.py` / `test_model.py` 会报错并退出 1：

```
Missing $MIFY_API_KEY. Run:
  export MIFY_API_KEY=sk-...
and re-run this command.
```

### 用户还没配 token 时该怎么引导

如果遇到这个错误，**不要直接帮用户 `export` 完事** —— 那只在当前 session 生效，换个 shell 就没了。也**不要**让用户自己 mkdir / chmod / 改 zshrc —— 那是繁琐体力活。

正确流程：**让用户把 key 贴进对话，你调 `install_token.py` 一键安装**。

#### 一键安装协议（当用户贴出疑似 key 或说「这是我的 key」时触发）

判断：用户发送了一个以 `sk-` 开头、长度在 20-200 之间的字符串，且没有明显非 key 语义（不是代码片段、不是日志），就按下面流程走，不要额外反问。

1. **执行命令**（把 `<KEY>` 替换成用户提供的字符串）：

   ```bash
   printf %s '<KEY>' | python3 ${SKILL_DIR}/scripts/install_token.py
   ```

   **用 `printf %s`，不要用 `echo`**：
   - `echo` 在某些 shell 下会对反斜杠做转义，可能破坏 key；
   - `printf %s` 原样输出、不加换行、不做转义，最安全。
   - **必须用单引号**包裹 key，避免 `$`、反引号、`!` 等字符被 shell 解释。

2. 脚本会：
   - 对 key 做格式校验（前缀 / 长度 / 无空白）
   - 对 `/v1/models` 实测一次，验证 key 有效（看响应模型数）
   - 写 `~/.config/mify/credentials`（chmod 600），覆盖旧值
   - 在 `~/.zshrc` / `~/.bashrc` 里追加 source 语句（幂等，已有就不重复）
   - 报告每步结果，**不会 echo key 本身**

3. 成功后告诉用户：
   - 新终端已经能直接用；
   - 当前终端要么开新窗口，要么 `source ~/.config/mify/credentials` 让 env var 立即生效；
   - 你可以紧接着跑一条 `list_models.py --grep kimi` 或类似命令作为「装完即验证」。

4. 失败（脚本返回非 0）：
   - `HTTP 401/403`：key 无效或已吊销，让用户重新拿一个。
   - `Cannot reach ...`：用户没在小米内网/VPN 上，让他先连通再重试。
   - `Key does not look right`：用户可能贴进了乱码或半截 key，让他重新复制。
   - 失败时**不要**把坏 key 写进任何文件 —— 脚本已经帮你守住这条线。

#### 传统手动方式（只在一键失败或用户明确要求手动时）

让他读 `references/setup_token.md` 的「方式 2 独立 secrets 文件 + zshrc source」。文档覆盖了 fish 等非 zsh/bash shell 的情况。

**关键安全规则**（对你和用户都适用）：

- ✓ Token 可以放在用户本人的 `~/.config/mify/credentials`（chmod 600）或类似的本地 secrets 文件 —— 这是持久化的正确姿势。
- ✗ 禁止把 token 写进 **skill 目录**（SKILL.md、scripts/、references/ 等）、**项目源码**、**workspace 输出**、**commit/PR/issue**、或任何可能被打包/同步/分享的地方。
- ✗ 若用户在对话里直接贴了 token，**不要** echo 到 log、不要写进文件落盘（除了用户自己的 `~/.config/mify/credentials`）。指引他走方式 2。

Token 长啥样：约 50 字符，前缀 `sk-`。

## 标准工作流

### Step 1: 拿到最新列表或按需过滤

先尝试用关键字筛选而不是拉全量。450 多个模型，全量 response ≈38KB，直接塞进对话会浪费上下文。

```bash
# 按关键字（大小写不敏感，子串匹配）
python ${SKILL_DIR}/scripts/list_models.py --grep kimi

# 按模型类型（注意 embedding 类型名是 text-embedding，带连字符）
python ${SKILL_DIR}/scripts/list_models.py --type text-embedding

# 按 owner
python ${SKILL_DIR}/scripts/list_models.py --owner xiaomi --type llm

# 组合过滤
python ${SKILL_DIR}/scripts/list_models.py --grep qwen --type llm --owner xiaomi

# 需要结构化时用 JSON 输出
python ${SKILL_DIR}/scripts/list_models.py --grep kimi --json
```

如果用户确实需要总览（很少见），再用 `--all`：

```bash
python ${SKILL_DIR}/scripts/list_models.py --all --summary
```

`--summary` 会打印「总数 + 按 type 分布 + 按 owner 分布」三行聚合结果，不会 dump 450 条 id。

### Step 2: 解读结果

对命中结果做三件事：

1. **去重同 id**：同一个模型 id 可能出现多次 owner，脚本默认会按 id 聚合并把所有 owner 列在一起。
2. **给出明确结论**：回答用户的原始问题时，**第一句就是结论**（「支持」/「不支持」/「部分支持」/「只有旧版本」）。
3. **推荐首选 owner**：当同一个 id 有多个 owner 时，按下面优先级推荐：

   ```
   xiaomi > tongyi > volcengine_maas > ppio ≈ siliconflow > 其他
   ```

   理由：xiaomi 自建成本最优、稳定性最好、合规最稳；tongyi / volcengine_maas 是国内大厂 maas，SLA 有保障；siliconflow / ppio 是第三方聚合，作为兜底。

### Step 3 (可选): 调用验证

当用户明确想「验证能不能调通」或怀疑网关问题时，对 LLM 类型的模型发一个最小 chat completion。**传进去的 `--model` 必须是 `{owner}/{id}` 格式**（从 list_models 的 CALL AS 列复制）：

```bash
python ${SKILL_DIR}/scripts/test_model.py --model xiaomi/kimi-k2.5

# 换条通道验证
python ${SKILL_DIR}/scripts/test_model.py --model tongyi/kimi-k2.5

# 自定义 prompt
python ${SKILL_DIR}/scripts/test_model.py --model xiaomi/DeepSeek-R1-0528 --prompt "用一句话介绍你自己"
```

脚本会打印 HTTP 状态码、响应时延、token 用量、首段回复。常见错误码含义：

- `400 "Not supported model"`: 99% 是忘了 owner 前缀（`kimi-k2.5` → `xiaomi/kimi-k2.5`）；其次是 owner 名拼错。脚本的 hint 会根据 `--model` 是否含 `/` 给出对应提示。
- `401`: `$MIFY_API_KEY` 过期或失效
- `429`: 速率限制（该 owner 通道配额打满），换 owner 试试
- `503`: 上游挂了，换个 owner

**⚠️ 只对 `model_type=llm` 的模型调用 `test_model.py`**。Embedding / rerank / TTS / ASR 走的是不同 endpoint，脚本不支持，请在回答里明确提示用户这类模型需要手测。

### Step 4 (可选): 通用推荐 — AA 榜单 × Mify 可用性

当用户问「推荐个模型」「哪个又快又强」「最适合 X 的模型」时，不要拍脑袋 —— 参考 [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/#intelligence) 的今日榜单（业界独立基准，每天更新），再交叉 Mify 可用性给推荐。

#### 拉榜单

```bash
# 今日 top 15（reasoning + non-reasoning 都在；按 intelligence 降序）
python ${SKILL_DIR}/scripts/fetch_aa_rankings.py --top 15

# 只要启动快（非 reasoning，TTFT 低）的 top 10
python ${SKILL_DIR}/scripts/fetch_aa_rankings.py --no-reasoning --top 10

# 合规/数据出境敏感：只看中国模型
python ${SKILL_DIR}/scripts/fetch_aa_rankings.py --country cn --top 10

# 强制刷新今日缓存（默认每天自动 refresh 一次）
python ${SKILL_DIR}/scripts/fetch_aa_rankings.py --refresh --top 15
```

表格里列：rank / IQ（intelligence index，`~` 前缀代表 estimated 分数）/ R 列（Y = reasoning 模型，thinks before replying，**TTFT 慢**）/ Cty（US/CN/...）/ Vendor / 模型名 / 发布日期。

#### 推荐三步走

1. **拿业界榜**：`fetch_aa_rankings.py --top 15`（或加 `--no-reasoning` / `--country cn` 根据用户需求过滤）
2. **查网关可用**：对榜单上每个候选 id（label 或 slug）跑 `list_models.py --grep <name>` —— AA 叫 "Kimi K2.6"，网关里可能是 `kimi-k2.6` 或 `tongyi/kimi-k2.6` 这种路径形式；用模糊匹配。
3. **给结论**：
   - 指出 top 业界榜的前 N 名
   - 逐条标注「Mify 已接入 ✓」/「Mify 未接入 ✗ → 业界最新 X 版本 Mify 还没跟上」
   - 针对用户的偏好（性能 / 启动速度 / 成本 / 合规）从可用交集里挑首选

#### 如何回应「性能强 + 启动快」

用户说「启动快」通常指**首 token 延迟（TTFT）低**。reasoning 模型要先内部 think 一段，TTFT 明显比非 reasoning 慢。策略：

- 用 `--no-reasoning --top 10` 先过滤出「非 reasoning 但 IQ 仍高」的候选
- 但**别假装 reasoning 模型不能用**：它们 IQ 普遍高出 5-15 分，如果用户实际需求是单轮问答且延迟敏感，非 reasoning 是对的；但如果是复杂推理，reasoning 的精度提升往往值得那几秒等待 —— 把权衡讲给用户。

#### 如何回应「国产最好」「不出境」

直接 `--country cn --top 15`。当前榜单前列的国产（不完整）：
- Moonshot Kimi K2.6（小米网关里可能还是 K2.5）
- Alibaba Qwen3.6 Max / Plus
- Z AI GLM-5.1 / GLM-5
- MiniMax M2.7
- **Xiaomi MiMo-V2-Pro**（自家模型，可以特别提一下，但 IQ 低于前几个）
- DeepSeek V3.2

#### 如何回应「AA 榜上没有的模型」

AA 只跑它收录的那批（~200 条主流模型）。MiMo / MiLM 的某些变体、一些小众聚合版本可能不在。如果 `list_models.py` 返回某模型但 `fetch_aa_rankings.py` 里找不到，**明确说「AA 未收录该模型，无法给出业界分数定位」**，而不是瞎推测。

#### 榜单 vs 实际体验

AA 的 Intelligence Index 是多个 benchmark 的加权平均（HLE, GPQA, tau2, omniscience 等）。它对**同质化任务（学术问答、代码生成、推理）**的评估比较准；对**工程落地（tool call、长上下文 retrieval、RAG 稳定性）**的体现有限。推荐时要加这句 caveat，别把 IQ 数字当成绝对真理。

### Step 5 (可选): 把选中的模型写入 Claude Code 配置

用户说「把 X 设成我的 Claude Code 模型」或你刚做完推荐、要顺势 offer「直接落盘」时，走这里。脚本写的是 user-level 的 `~/.claude/settings.json`，影响的是 Claude Code 在本机的默认模型。

#### 关键事实（不然会踩坑）

- Mify 网关的 `http://model.mify.ai.srv/anthropic` 路径**原生支持 Anthropic 协议**，Claude Code 不需要 claude-code-router 之类的中间层。
- Claude Code 按「三档」查模型：`ANTHROPIC_DEFAULT_HAIKU_MODEL`（小/便宜）/ `ANTHROPIC_DEFAULT_SONNET_MODEL`（默认）/ `ANTHROPIC_DEFAULT_OPUS_MODEL`（大/贵）。**每档独立**，切一档不影响另外两档。
- 模型 id 依然要写 `{owner}/{id}`（如 `xiaomi/kimi-k2.5`），裸 id 会 400。

#### 一键落盘流程（**禁止绕过 dry-run**）

```bash
# 先 dry-run 看 diff（永远先来这步）
python ${SKILL_DIR}/scripts/set_cc_model.py --model xiaomi/kimi-k2.5 --tier sonnet --dry-run

# 用户看完 diff 点头后，去掉 --dry-run 真写
python ${SKILL_DIR}/scripts/set_cc_model.py --model xiaomi/kimi-k2.5 --tier sonnet

# 一次切多档
python ${SKILL_DIR}/scripts/set_cc_model.py --model xiaomi/kimi-k2.5 --tier haiku,sonnet

# 三档全改
python ${SKILL_DIR}/scripts/set_cc_model.py --model xiaomi/kimi-k2.5 --tier all

# 翻车或改了后悔，立即还原
python ${SKILL_DIR}/scripts/set_cc_model.py --revert
```

脚本每次真写都会：拉 Mify 现货列表预检 → 备份原 settings.json 到 `settings.json.bak.YYYYMMDD-HHMMSS` → 写新文件 → 向 `/anthropic/v1/messages` 发一条最小消息做 smoke test → 失败自动 revert。所以最差结果就是「切换失败、原配置保留」，永远不会把用户的 settings.json 搞坏。

#### 决定用户想切哪一档

用户如果没明确说，先问一句：

- **Haiku**（便宜快）→ 后台/自动化/subagent 用。
- **Sonnet**（默认）→ 日常对话大部分场景走这档。
- **Opus**（大而慢）→ 复杂推理 / 长文理解 / agent 编排。
- **all**（三档一起）→ 想完全切到一个模型、不在乎档位分工。

例：用户说「用 Kimi 跑 Claude Code」但没指定档位 → 问「想把 Kimi 挂在哪个档？Sonnet（默认对话）还是 Opus（大任务）？都挂就选 all。」

#### 兼容性与非 Mify 配置

脚本**只在必要时**才修 `ANTHROPIC_BASE_URL` 和 token：
- URL 没设 → 自动填成 Mify 的 `http://model.mify.ai.srv/anthropic`。
- URL 已经指向 Mify → 一个字都不动。
- URL 指向别的服务（如 Anthropic 直连）→ **拒绝覆盖**，要用户明确加 `--force-url` 才会改。
- `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_API_KEY` 只要有其一就不动；都没有才从 `$MIFY_API_KEY`（或 `~/.config/mify/credentials`）补上。

也就是说，**你只改模型字段，不会动用户任何其他 Claude Code 配置**。

#### Smoke test 常见信号

- `HTTP 200 (empty reply — OK, pipeline works)`：通道通了，reasoning 模型在 `max_tokens=32` 下很可能没有 user-facing 输出，这是正常的，算通过。
- `HTTP 200, reply: 'hi!'`：最理想情况，模型能立即产出内容。
- `HTTP 4xx/5xx`：脚本已经自动 revert，把 stderr 里那行 HTTP 错误截屏或复述给用户作为诊断依据（403/404 基本是 token 对该 owner 通道没开放；400 基本是 id/owner 拼错）。

#### 写完之后必须提醒的两件事

1. **重启 Claude Code**：当前正在运行的 Claude Code 进程读的是启动时的 settings.json，改完后要**关掉重开一个新终端**才生效。
2. **想回到原样**：一行 `set_cc_model.py --revert` 即可。

#### 跟推荐场景联动（主动 offer 模式）

当你刚在 Step 4 给出了一个推荐（哪怕只是回答「Kimi K2.5 又快又便宜」），**主动**加一句：

> 要不要我帮你在 Claude Code 配置里把 Sonnet 档切过去试试？一条命令就能切，也能一键还原。

**不要**自己默默写入。一定要走 `--dry-run` 给用户看 diff，得到确认之后再真写。

## 回答格式建议

给用户的回答结构推荐：

```
[一句话结论]

### 命中的候选
| model id | owned_by | model_type | 备注 |
|---|---|---|---|
| ... | ... | ... | ... |

### 推荐使用
`<推荐 id>`（owner=`xiaomi`），理由：<为什么>

### 补充（可选）
- 如果用户问的是某个不存在的版本，查一下有没有"上一个版本"或"相近版本"，主动给出备选。
- 如果模型列表里没有用户要的精确版本，坦白说"没接入"，不要含糊其辞。
```

## 常见坑

### 坑 1: 拉全量 dump 回对话
**不要**。过滤后的结果通常 <20 条，几百字；全量 450 条 / 38KB 会白白占用上下文。如果用户坚持要全量，写到文件里再给路径。

### 坑 2: 只看 `id` 不看 `owner`
回答「支持 kimi-k2.5」却没告诉用户走哪个 owner —— 用户用默认路由可能撞到慢通道或不稳定通道。**始终把 owner 信息一起返回**。

### 坑 3: 用裸 id 调 chat endpoint
用户反馈「明明列表里有 kimi-k2.5 但调不了，返回 400 Not supported model」时，**99% 是忘了加 owner 前缀**。正确姿势是 `xiaomi/kimi-k2.5` 或 `tongyi/kimi-k2.5`。查过 `list_models.py` 后直接把 CALL AS 列里的字符串当 model 参数传即可。如果已经带了前缀还 400，才去怀疑 owner 拼错或通道未开放。

### 坑 4: 模型版本号的约定
观察到网关里版本号有几种写法：

- `X.Y`（语义版本，如 `kimi-k2.5`、`MiniMax-M2.5`）
- `X-Instruct-0905`（日期后缀，月日）
- `X-250711`（6 位年月日）
- `X-thinking` / `X-turbo`（能力后缀）

用户问「最新版」时，需要把这些都列出来让他确认；**不要自己脑补「k2.6 就是最新」**。官方未发布的版本网关里一定没有。

## 文件地图

- `scripts/list_models.py` — 查询 & 过滤 Mify 网关
- `scripts/test_model.py` — LLM 调用验证（用 `{owner}/{id}` 格式）
- `scripts/install_token.py` — **一键 token 安装**（stdin 读 key，校验 → 落盘 → 改 rc），用户贴 key 时调它
- `scripts/fetch_aa_rankings.py` — 拉 Artificial Analysis Intelligence Index 今日榜单（日级缓存），用于通用推荐场景
- `scripts/set_cc_model.py` — 把选中的 Mify 模型落盘到 `~/.claude/settings.json` 的 Haiku/Sonnet/Opus 档位，自带 dry-run / smoke test / 一键 revert
- `references/owner_guide.md` — owner 速查 & 选择策略（详版）
- `references/setup_token.md` — token 配置教程（含一键、secrets 文件、纯手动，以及安全底线）
