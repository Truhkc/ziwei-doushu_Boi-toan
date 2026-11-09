/**
 * lib/ai/provider —— 模型接入层
 *
 * 两条协议就覆盖了绝大多数厂商：
 *   - openai    : POST {base}/chat/completions，增量在 choices[0].delta.content
 *   - anthropic : POST {base}/v1/messages，增量在 content_block_delta.delta.text
 *
 * 用 fetch 直连而不是各家 SDK：少一层版本耦合，两条协议的 SSE 格式都很稳定，
 * 换厂商只要改环境变量，不用动代码。
 */
import 'server-only';
import { parseSseData } from './sse';

export type AiProviderKind = 'openai' | 'anthropic';

export interface AiProvider {
  id: string;
  kind: AiProviderKind;
  /** 不带尾斜杠 */
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface Preset {
  kind: AiProviderKind;
  defaultBaseUrl: string;
  keyEnv: string;
  baseUrlEnv: string;
  modelEnv: string;
  defaultModel: string;
  /** Máy chủ chạy ngay trên máy người dùng thì không cần khoá */
  keyOptional?: boolean;
}

/**
 * Máy chủ mô hình chạy nội bộ (Ollama, LM Studio, llama.cpp…) hầu hết không
 * kiểm tra khoá. Nhận diện qua host để `custom` trỏ vào localhost cũng được
 * miễn khoá, không bắt người dùng bịa ra một chuỗi vô nghĩa.
 */
function isLocalHost(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host === 'host.docker.internal' ||
      host.endsWith('.local')
    );
  } catch {
    return false;
  }
}

/**
 * AI_PROVIDER 的取值。`.env.example` 里给的是 deepseek 与 mimo 两档，
 * 这里额外补上 anthropic / openai，以及完全自定义的 custom。
 */
const PRESETS: Record<string, Preset> = {
  deepseek: {
    kind: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    keyEnv: 'DEEPSEEK_API_KEY',
    baseUrlEnv: 'DEEPSEEK_BASE_URL',
    modelEnv: 'DEEPSEEK_MODEL',
    defaultModel: 'deepseek-chat',
  },
  anthropic: {
    kind: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    keyEnv: 'ANTHROPIC_API_KEY',
    baseUrlEnv: 'ANTHROPIC_BASE_URL',
    modelEnv: 'ANTHROPIC_MODEL',
    defaultModel: 'claude-sonnet-5-5',
  },
  openai: {
    kind: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    keyEnv: 'OPENAI_API_KEY',
    baseUrlEnv: 'OPENAI_BASE_URL',
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o',
  },
  // .env.example 里的「其他 OpenAI 兼容模型」示例：base_url 与 model 必填
  mimo: {
    kind: 'openai',
    defaultBaseUrl: '',
    keyEnv: 'MIMO_API_KEY',
    baseUrlEnv: 'MIMO_BASE_URL',
    modelEnv: 'MIMO_MODEL',
    defaultModel: '',
  },
  // Ollama chạy trên máy: `ollama serve`, mặc định cổng 11434, không cần khoá.
  // AI_MODEL bắt buộc, vì tên model tuỳ bạn đã `ollama pull` cái gì.
  ollama: {
    kind: 'openai',
    defaultBaseUrl: 'http://localhost:11434/v1',
    keyEnv: 'AI_API_KEY',
    baseUrlEnv: 'AI_BASE_URL',
    modelEnv: 'AI_MODEL',
    defaultModel: '',
    keyOptional: true,
  },
  // LM Studio: bật "Local Server", mặc định cổng 1234, cũng không cần khoá.
  lmstudio: {
    kind: 'openai',
    defaultBaseUrl: 'http://localhost:1234/v1',
    keyEnv: 'AI_API_KEY',
    baseUrlEnv: 'AI_BASE_URL',
    modelEnv: 'AI_MODEL',
    defaultModel: '',
    keyOptional: true,
  },
  // 任意 OpenAI 兼容端点：AI_BASE_URL / AI_API_KEY / AI_MODEL
  custom: {
    kind: 'openai',
    defaultBaseUrl: '',
    keyEnv: 'AI_API_KEY',
    baseUrlEnv: 'AI_BASE_URL',
    modelEnv: 'AI_MODEL',
    defaultModel: '',
  },
};

/** Lý do thiếu cấu hình, hai ngôn ngữ — route chọn theo locale người dùng gửi lên */
export interface ConfigReason {
  vi: string;
  zh: string;
}

export type ProviderResult =
  | { ok: true; provider: AiProvider }
  | { ok: false; reason: ConfigReason };

function env(name: string): string {
  return (process.env[name] ?? '').trim();
}

/** 读环境变量决定用哪家模型。缺配置时返回能直接给开发者看的原因。 */
export function resolveProvider(): ProviderResult {
  const id = env('AI_PROVIDER') || 'deepseek';
  const preset = PRESETS[id] ?? PRESETS.custom;

  const apiKey = env(preset.keyEnv);
  const baseUrl = (env(preset.baseUrlEnv) || preset.defaultBaseUrl).replace(/\/+$/, '');
  const model = env(preset.modelEnv) || preset.defaultModel;

  if (!PRESETS[id] && (!baseUrl || !apiKey || !model)) {
    return {
      ok: false,
      reason: {
        zh: `AI_PROVIDER="${id}" 不是内置档位（deepseek / anthropic / openai / mimo / custom），` +
            '按自定义端点处理时需要同时配好 AI_BASE_URL、AI_API_KEY、AI_MODEL。',
        vi: `AI_PROVIDER="${id}" không phải lựa chọn có sẵn (deepseek / anthropic / openai / mimo / custom). ` +
            'Dùng như một endpoint tự định nghĩa thì phải khai báo đủ AI_BASE_URL, AI_API_KEY và AI_MODEL.',
      },
    };
  }

  const missing = (envName: string): ProviderResult => ({
    ok: false,
    reason: {
      zh: `AI_PROVIDER="${id}" 缺少 ${envName}，请在 .env.local 里配置。`,
      vi: `AI_PROVIDER="${id}" còn thiếu ${envName} — hãy khai báo trong .env.local.`,
    },
  });

  // Khoá chỉ bắt buộc khi gọi ra dịch vụ ngoài; máy chủ chạy nội bộ thì bỏ qua.
  const keyNeeded = !preset.keyOptional && !isLocalHost(baseUrl);
  if (keyNeeded && !apiKey) return missing(preset.keyEnv);
  if (!baseUrl) return missing(preset.baseUrlEnv);
  if (!model) return missing(preset.modelEnv);

  return { ok: true, provider: { id, kind: preset.kind, baseUrl, apiKey, model } };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  provider: AiProvider;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

/** 上游返回非 2xx 时，取一点响应体帮助定位，但不把它整段透给前端 */
async function upstreamError(res: Response, provider: AiProvider): Promise<Error> {
  let detail = '';
  try {
    detail = (await res.text()).slice(0, 500);
  } catch {
    /* 读不到就算了 */
  }
  return new Error(
    `upstream ${provider.id} (${provider.model}) responded ${res.status}: ${detail || '<empty body>'}`,
  );
}

/** 文本增量流。两种协议的差异都收在这里，调用方只看到 string。 */
export async function* streamChat(opts: StreamChatOptions): AsyncGenerator<string> {
  const { provider, system, messages, signal } = opts;
  const maxTokens = opts.maxTokens ?? 4096;
  const temperature = opts.temperature ?? 0.7;

  if (provider.kind === 'anthropic') {
    const res = await fetch(`${provider.baseUrl}/v1/messages`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: maxTokens,
        temperature,
        system,
        stream: true,
        messages,
      }),
    });
    if (!res.ok || !res.body) throw await upstreamError(res, provider);

    for await (const data of parseSseData(res.body)) {
      if (data === '[DONE]') return;
      let evt: { type?: string; delta?: { text?: string }; error?: { message?: string } };
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }
      if (evt.type === 'error') throw new Error(`upstream error event: ${evt.error?.message ?? 'unknown'}`);
      if (evt.type === 'message_stop') return;
      if (evt.type === 'content_block_delta' && evt.delta?.text) yield evt.delta.text;
    }
    return;
  }

  // ─── OpenAI 兼容协议 ───
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      // Máy chủ nội bộ không cần khoá — gửi header rỗng có thể khiến vài bản từ chối
      ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: maxTokens,
      temperature,
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok || !res.body) throw await upstreamError(res, provider);

  for await (const data of parseSseData(res.body)) {
    if (data === '[DONE]') return;
    let evt: {
      choices?: { delta?: { content?: string | null } }[];
      error?: { message?: string };
    };
    try {
      evt = JSON.parse(data);
    } catch {
      continue;
    }
    if (evt.error) throw new Error(`upstream error event: ${evt.error.message ?? 'unknown'}`);
    const piece = evt.choices?.[0]?.delta?.content;
    if (piece) yield piece;
  }
}
