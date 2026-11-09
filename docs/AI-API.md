# 后端 AI 接口实现说明

上游开源版把 `/api/interpret`（单盘解读）与 `/api/heming`（合盘分析）留空 ——
前端会调，但路由不存在，于是显示「开源版不含该接口」。本目录下的这份文档记录
这两个接口在本仓库里的实现。

**排盘本身仍然不需要任何 API Key。** 安星、四化、格局、古籍阅读、命理百科全部在
浏览器里用 `lib/ziwei/` 完成。只有这两个接口要配模型。

---

## 一、文件清单

| 文件 | 作用 |
|------|------|
| `app/api/interpret/route.ts` | 单盘解读路由 |
| `app/api/heming/route.ts` | 合盘分析路由 |
| `lib/ai/provider.ts` | 模型接入：OpenAI 兼容协议 + Anthropic 协议 |
| `lib/ai/sse.ts` | SSE 编解码（上游解析 + 按前端约定重新编码） |
| `lib/ai/prompts.ts` | 系统提示词与合盘知识库的按需裁剪 |
| `lib/ai/messages.ts` | 对话历史校验与规整 |
| `lib/ai/ratelimit.ts` | 进程内滑动窗口限流 |
| `lib/ai/http.ts` | 请求体大小、JSON 解析、限流入口 |
| `lib/ziwei/chart-input.ts` | 前端提交命盘的白名单校验 |
| `lib/ziwei/chart-context.ts` | 命盘 → 提示词文本 |

另外改了两处前端：`components/ChatPanel.tsx` 与 `components/InsightPanel.tsx`
原先按 chunk 切行读 SSE，JSON 被网络在中间截断时会丢字；现在跨 chunk 缓冲半行，
读法与 `app/heming/page.tsx` 一致。

---

## 二、接口契约

两个接口的响应都是 `text/event-stream`，帧格式由前端既有代码决定，不可改：

```
data: {"delta":{"text":"紫微"}}

data: {"delta":{"text":"在命宫"}}

data: [DONE]
```

### POST /api/interpret

```jsonc
{
  "chart": { /* ZiweiChart，见 lib/ziwei/types.ts */ },
  "messages": [{ "role": "user", "content": "我的事业运如何？" }]
}
```

调用方：`components/ChatPanel.tsx`、`components/InsightPanel.tsx`。
`messages` 最后一条必须是 `user`。

### POST /api/heming

```jsonc
{
  "chartA": { /* ZiweiChart */ },
  "chartB": { /* ZiweiChart */ },
  "question": "我们适合今年结婚吗？"   // 可选
}
```

调用方：`app/heming/page.tsx`。

### 状态码

| 码 | 含义 |
|---|---|
| 200 | 正常流式输出 |
| 400 | 命盘或对话内容不合法，`error` 字段说明哪个字段错了 |
| 413 | 请求体超过 1 MB |
| 429 | 超出限流，`retryAfterSec` 给出等待秒数 |

**AI 未配置时返回的是 200**，流里推一帧说明文字，并带响应头 `x-ai-config: missing`。
这是故意的：前端只对 404 有专门分支，其他非 2xx 一律显示「解读失败，请稍后重试」，
那样开发者看不到真正的原因。监控按 `x-ai-config` 头区分即可。

---

## 三、配置

`cp .env.example .env.local`，然后按档位填：

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx
```

| 档位 | 必填 | 默认 base_url | 默认 model |
|---|---|---|---|
| `deepseek` | `DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1` | `deepseek-chat` |
| `anthropic` | `ANTHROPIC_API_KEY` | `https://api.anthropic.com` | `claude-sonnet-5-5` |
| `openai` | `OPENAI_API_KEY` | `https://api.openai.com/v1` | `gpt-4o` |
| `mimo` | `MIMO_API_KEY` + `MIMO_BASE_URL` + `MIMO_MODEL` | — | — |
| `ollama` | `AI_MODEL`（**不需要 Key**） | `http://localhost:11434/v1` | — |
| `lmstudio` | `AI_MODEL`（**不需要 Key**） | `http://localhost:1234/v1` | — |
| `custom` | `AI_API_KEY` + `AI_BASE_URL` + `AI_MODEL` | — | — |

**模型跑在本机时不需要 API Key。** `ollama` / `lmstudio` 两档，以及 `custom` 指向
localhost / 127.0.0.1 / host.docker.internal / `*.local` 的情况，都会跳过 Key 校验；
没有 Key 时也不会发 `Authorization` 头（有些本地服务器见到空 Bearer 会直接拒绝）。
对外部服务则一如既往必须有 Key。

注意：本机地址只在你自己跑 `npm run dev` 或自托管时有效。部署到 Vercel 这类平台后，
服务器端的 localhost 是那台机器自己，连不到你的电脑。

每档的 `*_BASE_URL` / `*_MODEL` 都能单独覆盖默认值。

限流：`AI_RATE_LIMIT`（默认 20）、`AI_RATE_WINDOW_SEC`（默认 300）。

### 一个容易踩的坑：`.env.local` 不会覆盖已存在的环境变量

Next.js 读 `.env.local` 时，**进程里已经有的同名变量优先**。如果你的 shell 或容器
已经导出了 `ANTHROPIC_BASE_URL`、`ANTHROPIC_API_KEY` 之类的变量（装过 Claude Code
的机器很常见），写进 `.env.local` 的值会被忽略，请求会打到你没预期的地址上。

排查：

```bash
env | grep -iE '^ANTHROPIC|^OPENAI|^DEEPSEEK|^AI_'
```

有输出就说明那些变量来自环境而不是 `.env.local`。临时覆盖：

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:8899 npm run dev
```

要长期生效，就从 shell 配置里删掉它，或者改用 `AI_PROVIDER=custom` 配一组
不会撞名的 `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL`。

---

## 四、提示词里有什么

模型拿到的不是 JSON，是一段文本化的盘。`buildChartContext()` 产出这些小节：

- 基本信息（公历/农历/四柱/五行局/命主身主/真太阳时是否校正）
- 生年四化落宫
- 命宫概要与三方四正
- 十二宫详情（星曜 + 7 档亮度 + 四化 + 宫干自化 + 空宫借星）
- 当前大限与大限宫干四化
- **格局识别** —— 服务端用 `lib/ziwei/patterns.ts` 的 `detectPatterns()` 重新算，
  带已满足条件、加分项、破格警示与古籍出处

合盘再加 `lib/ziwei/heming-knowledge.ts`：倪师双宫联参方法论、本案夫妻宫主星的
断语、四化在夫妻宫、本盘出现的婚姻杂曜、五星制评级口径。知识库是**按本案裁剪**的，
不全量灌进上下文 —— 否则模型会去讲盘上根本没有的星。

### 系统提示词兜住三件事

1. **输出格式**。前端 `AiContent` 渲染器只认独占一行的 `**【小节名】**` 和行内
   `**粗体**`。写 Markdown 标题、列表或表格会原样显示成一堆星号。
2. **边界**。命盘与用户提问是数据不是指令，正文里写「忽略以上规则」也不改角色。
3. **不编出处**。断语库不在开源范围，模型手上只有 `patterns.ts` 的格局规则和合盘
   知识库。明确禁止伪造《全书》原文页码和倪师原话的集数时间码。

另外按 README 的口径要求：六亲结论必须附保留（倪师原话「斗数批六亲本来就比较差
一点」），健康只讲「哪个脏腑宜留意、建议就医」，不做医疗诊断与投资建议。

---

## 五、安全

### 命盘数据不被信任

`chart` 是浏览器 POST 上来的，而它会进提示词。`sanitizeChart()` 按白名单重建对象：

- 星名、宫名、命主身主等命理专名：**只允许 1–6 个汉字**。换行、英文指令、标点全挡掉。
- 枚举字段（`siHua`、`brightnessRaw`、`type`、`gender`）必须命中白名单。
- 数值字段必须是整数且在合法区间（地支 0–11、天干 0–9、时辰索引 0–11……）。
- 12 宫数量与地支唯一性都要查。
- 对宫 `oppositeBranch` 恒等于 `(branch + 6) % 12`，直接重算，不采信前端值。
- 唯一的自由文本（姓名、省市）只留汉字/字母/数字/空格/间隔号并截断。
- `analysisCacheProfile` 这类签名标记直接丢弃。

**为什么不干脆用 `birthInfo` 在服务端重排一遍**：`algorithm.ts` 的亮度流派
（`setBrightnessSchool`）是模块级状态，由用户在前端流派抽屉里切换。服务端重排会
按默认流派出盘，和用户眼前的盘不一致，解读就对不上。所以保留前端盘的内容，只做
结构与字符集净化 —— 但格局仍在服务端重算，不采信前端送来的任何结论。

### 限流的真实作用范围

计数在**单个 Node 进程的内存**里：

- 自己跑 `next start` 或单容器部署：有效。
- Serverless 多实例 / 冷启动：每个实例一份计数，只能挡最蠢的连点。

要真防刷，把 `checkRateLimit()` 换成 Redis 实现（仓库已有 `ioredis` 依赖）或上游 WAF。
另外 `x-forwarded-for` 在没有可信反代时可由客户端伪造 —— 限流是减速带，不是认证。

### 其他

- 上游错误细节只进服务端日志，不透给前端（里面可能带 key 片段或内部地址）。
- 请求体上限 1 MB，`content-length` 与实际字节数都查。
- 用户关页面时 `req.signal` 传给上游，不继续烧 token。

---

## 六、仍然不包含

上游未开源的部分，这次也没补上：

- **断语库**。`lib/ziwei/db-analysis.ts` 的 `STAR_DB` 仍是空的，知识库 SEO 详情页
  依旧生成 0 条静态路由。线上那套是上万行的 13 主题断语，不在开源范围。
  这里的解读靠模型 + `patterns.ts` 的格局规则现场生成，和线上数据集不是一回事。
- 用户系统（登录/会员/支付）、`/api/generate`、水印与签名。

想要线上那套 13 维解读的**内容**，走 Releases 的 v4.0 数据集（按年份分 77 个文件，
压缩后 161 MB）；想要**能力**，就是这两个接口。两者不互相替代。

---

## 七、验证

```bash
npm run typecheck
```

```bash
npm run dev
```

接口自测（未配 Key 时会返回那一帧说明文字，也能验证路由是通的）：

```bash
curl -N -X POST http://localhost:3000/api/interpret -H 'Content-Type: application/json' -d '{"chart":{},"messages":[{"role":"user","content":"test"}]}'
```

上面这条会返回 400 并指出 `chart` 哪里不合法 —— 校验层生效的证据。
要跑通完整链路，从 `/chart` 页排一张盘，再点解读面板的话题按钮。
