/**
 * Mô hình chạy ngay trên máy người dùng phải dùng được mà không cần API key.
 *
 * Ollama, LM Studio, llama.cpp… đều nói chuẩn OpenAI nhưng không kiểm tra khoá.
 * Trước đây resolveProvider() chặn mọi cấu hình thiếu khoá, nên muốn chạy local
 * phải bịa ra một chuỗi vô nghĩa. Ở đây chốt hai điều:
 *   1. host nội bộ (hoặc档 ollama / lmstudio) thì khoá là tuỳ chọn;
 *   2. không có khoá thì KHÔNG gửi header Authorization — vài máy chủ từ chối
 *      khi thấy "Bearer " rỗng.
 * Dịch vụ ngoài vẫn phải có khoá như cũ.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import '../lib/server-only-stub';

const ENV_KEYS = [
  'AI_PROVIDER', 'AI_API_KEY', 'AI_BASE_URL', 'AI_MODEL',
  'DEEPSEEK_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'MIMO_API_KEY',
];
function setEnv(vars: Record<string, string>): void {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, vars);
}

async function main(): Promise<void> {
  const { resolveProvider, streamChat } = await import('../../lib/ai/provider');

  // ── 1) các档 chạy local: không khoá vẫn hợp lệ ──────────
  setEnv({ AI_PROVIDER: 'ollama', AI_MODEL: 'qwen2.5' });
  let r = resolveProvider();
  assert.equal(r.ok, true, 'ollama không khoá phải hợp lệ');
  assert.equal(r.ok && r.provider.baseUrl, 'http://localhost:11434/v1');
  assert.equal(r.ok && r.provider.apiKey, '');

  setEnv({ AI_PROVIDER: 'lmstudio', AI_MODEL: 'local-model' });
  r = resolveProvider();
  assert.equal(r.ok, true, 'lmstudio không khoá phải hợp lệ');
  assert.equal(r.ok && r.provider.baseUrl, 'http://localhost:1234/v1');

  // thiếu tên model thì vẫn phải báo lỗi
  setEnv({ AI_PROVIDER: 'ollama' });
  assert.equal(resolveProvider().ok, false, 'ollama thiếu AI_MODEL phải bị từ chối');

  // ── 2) custom trỏ vào host nội bộ: miễn khoá ───────────
  for (const host of ['http://localhost:8080/v1', 'http://127.0.0.1:8080/v1', 'http://host.docker.internal:8080/v1']) {
    setEnv({ AI_PROVIDER: 'custom', AI_BASE_URL: host, AI_MODEL: 'm' });
    assert.equal(resolveProvider().ok, true, `${host} phải miễn khoá`);
  }

  // ── 3) dịch vụ ngoài: vẫn bắt buộc có khoá ─────────────
  setEnv({ AI_PROVIDER: 'custom', AI_BASE_URL: 'https://api.example.com/v1', AI_MODEL: 'm' });
  r = resolveProvider();
  assert.equal(r.ok, false, 'endpoint ngoài thiếu khoá phải bị từ chối');
  assert.ok(!r.ok && r.reason.vi.includes('AI_API_KEY'));

  setEnv({ AI_PROVIDER: 'deepseek' });
  assert.equal(resolveProvider().ok, false, 'deepseek thiếu khoá phải bị từ chối');

  // ── 4) header Authorization ────────────────────────────
  const seen: { auth: string | undefined }[] = [];
  const srv = http.createServer((req, res) => {
    seen.push({ auth: req.headers.authorization });
    req.resume();
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.end('data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n\n');
    });
  });
  await new Promise<void>(done => srv.listen(0, '127.0.0.1', done));
  const port = (srv.address() as { port: number }).port;

  const drain = async (gen: AsyncIterable<string>) => {
    let out = '';
    for await (const piece of gen) out += piece;
    return out;
  };
  const call = (apiKey: string) => drain(streamChat({
    provider: { id: 'test', kind: 'openai', baseUrl: `http://127.0.0.1:${port}/v1`, apiKey, model: 'm' },
    system: 's',
    messages: [{ role: 'user', content: 'q' }],
  }));

  try {
    assert.equal(await call(''), 'ok');
    assert.equal(seen[0].auth, undefined, 'khoá rỗng thì không được gửi header Authorization');

    assert.equal(await call('sk-real'), 'ok');
    assert.equal(seen[1].auth, 'Bearer sk-real', 'có khoá thì phải gửi Bearer');
  } finally {
    srv.close();
  }

  console.log('[ai-provider-local] máy chủ nội bộ chạy không cần khoá; dịch vụ ngoài vẫn bắt buộc');
}

main().catch(e => { console.error(e); process.exit(1); });
