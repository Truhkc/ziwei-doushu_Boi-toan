'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

/**
 * Sơn thuỷ — viễn sơn và mặt nước, vẽ bằng SVG, có tương tác.
 *
 * Ba lớp núi mực loãng dần về xa, dưới chân là mặt nước hắt bóng. Hai cách
 * tương tác:
 *
 *   · Rê chuột  → các lớp trượt ngang lệch nhau (thị sai). Lớp gần đi nhiều,
 *                 lớp xa gần như đứng yên, nên nhìn vào thấy có chiều sâu
 *                 thay vì một tấm phẳng.
 *   · Bấm nước  → gợn sóng lan ra từ chỗ bấm rồi tắt.
 *
 * Dùng SVG chứ không dùng ảnh: nhẹ, co giãn mọi bề ngang, đổi màu theo nền
 * sáng/tối mà không cần hai file.
 *
 * Phần núi không bắt chuột; chỉ dải nước bắt, để không chắn nội dung ở trên.
 */

interface Ripple {
  id: number;
  /** Vị trí ngang trong hệ toạ độ SVG 0–1440 */
  x: number;
  /** Vị trí dọc trong dải nước, 0–1 */
  y: number;
}

const RIPPLE_MS = 2600;
const MAX_RIPPLES = 6;

export default function InkMountains({
  height = 320,
  opacity,
  /** Bật mặt nước và gợn sóng. Trang lá số tắt đi cho đỡ rối. */
  water = true,
}: {
  height?: number;
  opacity?: number;
  water?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const hostRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;

    // Thị sai theo vị trí chuột ngang trong khung nhìn, chuẩn hoá về -1..1.
    // Gộp qua rAF để không tính lại layout mỗi lần chuột nhúc nhích.
    const onMove = (e: PointerEvent) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setShift((e.clientX / window.innerWidth) * 2 - 1);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const addRipple = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    if (reduced.current) return;
    const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples(prev => [
      ...prev.slice(-(MAX_RIPPLES - 1)),
      {
        id,
        x: ((e.clientX - box.left) / box.width) * 1440,
        y: (e.clientY - box.top) / box.height,
      },
    ]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), RIPPLE_MS);
  }, []);

  // Nền tối: mực ánh bạc trên lụa đen. Nền sáng: mực nho trên giấy.
  const ink = dark ? '#9FB3A8' : '#2B2721';
  const layers = [
    { d: 'M0,214 C120,186 196,158 286,166 C370,173 418,200 498,192 C586,183 636,142 724,148 C806,154 852,192 938,196 C1026,200 1078,166 1164,172 C1252,178 1326,206 1440,198 L1440,320 L0,320 Z', o: dark ? 0.14 : 0.13, blur: 'ink-softer', depth: 6 },
    { d: 'M0,248 C106,228 170,206 262,214 C348,221 402,248 486,242 C572,236 628,204 712,210 C796,216 846,246 930,250 C1018,254 1076,226 1162,232 C1250,238 1340,258 1440,248 L1440,320 L0,320 Z', o: dark ? 0.22 : 0.2, blur: 'ink-soft', depth: 14 },
    { d: 'M0,282 C98,268 158,252 248,258 C332,263 388,284 470,280 C556,275 610,252 694,257 C778,262 828,284 912,287 C1000,290 1064,270 1150,274 C1240,278 1346,292 1440,284 L1440,320 L0,320 Z', o: dark ? 0.32 : 0.3, blur: 'ink-soft', depth: 26 },
  ];

  const waterTop = 292;

  return (
    <div
      ref={hostRef}
      className="absolute inset-x-0 bottom-0 select-none overflow-hidden"
      style={{ height, opacity: opacity ?? (dark ? 0.78 : 0.62) }}
    >
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="ink-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="ink-softer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          {/* Đỉnh núi nhô ra từ sương: mờ ở trên, rõ dần xuống chân */}
          <linearGradient id="ink-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="34%" stopColor="#fff" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="ink-mask">
            <rect x="0" y="0" width="1440" height="320" fill="url(#ink-fade)" />
          </mask>
          {/* Bóng nước nhạt dần xuống đáy */}
          <linearGradient id="water-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="water-mask">
            <rect x="0" y={waterTop} width="1440" height={320 - waterTop} fill="url(#water-fade)" />
          </mask>
        </defs>

        {/* ── Núi ── lớp gần trượt nhiều hơn lớp xa */}
        <g mask="url(#ink-mask)" className="pointer-events-none">
          {layers.map((l, i) => (
            <g
              key={i}
              style={{
                transform: `translateX(${-shift * l.depth}px)`,
                transition: 'transform 420ms cubic-bezier(0.22,0.61,0.36,1)',
              }}
            >
              <path d={l.d} fill={ink} opacity={l.o} filter={`url(#${l.blur})`} />
            </g>
          ))}
        </g>

        {water && (
          <>
            {/* ── Mặt nước ── bóng núi lộn ngược, mờ và nhoè */}
            <g mask="url(#water-mask)" className="pointer-events-none">
              <g transform={`translate(0 ${waterTop * 2}) scale(1 -1)`}>
                {layers.map((l, i) => (
                  <path key={i} d={l.d} fill={ink} opacity={l.o * 0.55} filter="url(#ink-softer)" />
                ))}
              </g>
              {/* Vài nét ngang gợi mặt nước lặng */}
              {[300, 306, 312].map((y, i) => (
                <line
                  key={y}
                  x1="0" y1={y} x2="1440" y2={y}
                  stroke={ink}
                  strokeWidth="0.6"
                  opacity={0.07}
                  style={{
                    transform: `translateX(${shift * (4 + i * 3)}px)`,
                    transition: 'transform 620ms ease-out',
                  }}
                />
              ))}
            </g>

            {/* Gợn sóng khi bấm */}
            <g className="pointer-events-none">
              {ripples.map(r => (
                <ellipse
                  key={r.id}
                  className="ink-ripple"
                  cx={r.x}
                  cy={waterTop + (320 - waterTop) * r.y}
                  rx="6"
                  ry="2"
                  fill="none"
                  stroke={ink}
                  strokeWidth="1.2"
                />
              ))}
            </g>

            {/* Vùng bắt chuột: chỉ dải nước, để không chắn nội dung phía trên */}
            <rect
              x="0" y={waterTop} width="1440" height={320 - waterTop}
              fill="transparent"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onPointerDown={addRipple}
            />
          </>
        )}

        {/* Sương vắt ngang sườn núi */}
        <g className="ink-mist pointer-events-none" opacity={dark ? 0.1 : 0.14}>
          <ellipse cx="420" cy="238" rx="430" ry="15" fill={ink} filter="url(#ink-softer)" />
        </g>
        <g className="ink-mist ink-mist-slow pointer-events-none" opacity={dark ? 0.08 : 0.11}>
          <ellipse cx="1040" cy="268" rx="380" ry="12" fill={ink} filter="url(#ink-softer)" />
        </g>
      </svg>
    </div>
  );
}
