'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

/**
 * Sơn thuỷ tiên hiệp — núi đá dựng đứng nổi trong sương, lầu các và cầu treo.
 *
 * Khác với đồi thoai thoải: ở đây là các mỏm đá cao, hẹp, chân tan vào sương
 * nên trông như đang lơ lửng. Sương cắt ngang thành từng tầng, càng xa càng
 * nhạt, tạo chiều sâu kiểu tranh thuỷ mặc.
 *
 * Tương tác:
 *   · Rê chuột  → các tầng trượt lệch nhau (thị sai), tầng gần đi xa nhất
 *   · Bấm nước  → gợn sóng lan ra rồi tắt
 *
 * Chỉ dải nước bắt chuột; phần núi để `pointer-events: none` cho khỏi chắn
 * nội dung phía trên.
 */

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const RIPPLE_MS = 2600;
const MAX_RIPPLES = 6;
const VB_W = 1440;
const VB_H = 460;

/**
 * Một mỏm núi: sườn cong, đỉnh lệch sang một bên.
 *
 * Vẽ bằng đường cong chứ không phải đoạn thẳng — nối nhiều đoạn thẳng đều nhau
 * sẽ ra hàng rào răng cưa, không ra núi. `lean` đẩy đỉnh lệch khỏi tâm nên hai
 * sườn không đối xứng, giống đá thật hơn.
 */
function peakPath(x: number, w: number, h: number, lean: number, base: number): string {
  const l = x - w;
  const r = x + w;
  const apex = x + lean;
  const t = base - h;
  return [
    `M${l},${base}`,
    // Vách trái dựng gần như thẳng đứng, chỉ thuôn nhẹ
    `L${l + w * 0.16},${base - h * 0.52}`,
    `C${l + w * 0.3},${base - h * 0.76} ${apex - w * 0.52},${base - h * 0.94} ${apex - w * 0.26},${t + h * 0.04}`,
    // Đỉnh gãy khúc, không nhọn hoắt
    `L${apex - w * 0.06},${t}`,
    `L${apex + w * 0.12},${t + h * 0.05}`,
    `C${apex + w * 0.44},${base - h * 0.9} ${r - w * 0.3},${base - h * 0.72} ${r - w * 0.14},${base - h * 0.48}`,
    `L${r},${base}`,
    'Z',
  ].join(' ');
}

/** Lầu các mái cong — vẽ ở gốc toạ độ, người gọi tự dịch chuyển và thu phóng */
function Pavilion({ fill, opacity = 1 }: { fill: string; opacity?: number }) {
  return (
    <g fill={fill} opacity={opacity}>
      {/* Mái dưới, hai đầu đao cong hất lên */}
      <path d="M-30,0 C-20,-5 -10,-9 0,-10 C10,-9 20,-5 30,0 C22,-2 16,-1 12,1 L-12,1 C-16,-1 -22,-2 -30,0 Z" />
      {/* Mái trên nhỏ hơn */}
      <path d="M-17,-11 C-11,-15 -5,-18 0,-19 C5,-18 11,-15 17,-11 C12,-12 9,-12 7,-10 L-7,-10 C-9,-12 -12,-12 -17,-11 Z" />
      {/* Thân và cột */}
      <rect x="-9" y="1" width="18" height="9" />
      <rect x="-11" y="10" width="2.2" height="7" />
      <rect x="-3" y="10" width="2.2" height="7" />
      <rect x="5" y="10" width="2.2" height="7" />
      <rect x="9" y="10" width="2.2" height="7" />
    </g>
  );
}

export default function InkMountains({
  height = 460,
  opacity,
  water = true,
}: {
  height?: number;
  opacity?: number;
  water?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [shift, setShift] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;

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
        x: ((e.clientX - box.left) / box.width) * VB_W,
        y: (e.clientY - box.top) / box.height,
      },
    ]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), RIPPLE_MS);
  }, []);

  // Tối: xanh xám lạnh như sương núi. Sáng: mực nho pha chút chàm.
  const ink = dark ? '#A8BCC4' : '#333C42';
  const waterTop = 404;

  /**
   * Ba tầng núi. Mỗi tầng là **vài** mỏm rời rạc, cao thấp và rộng hẹp lệch
   * nhau, đặt thưa để chừa khoảng sương — chứ không phải một dải liền kín
   * bề ngang. Càng gần thì càng đậm, càng thấp, và trượt nhiều hơn khi rê chuột.
   *
   * Mỗi mỏm: [tâm x, nửa bề ngang, chiều cao, độ lệch đỉnh]
   */
  const ranges = [
    {
      depth: 5,
      o: dark ? 0.15 : 0.14,
      blur: 'ink-far',
      base: 424,
      peaks: [
        [96, 34, 236, -10],
        [298, 26, 296, 8],
        [452, 42, 198, -6],
        [726, 30, 278, 12],
        [980, 48, 216, -14],
        [1208, 28, 288, 6],
        [1392, 38, 204, -8],
      ] as [number, number, number, number][],
    },
    {
      depth: 13,
      o: dark ? 0.23 : 0.22,
      blur: 'ink-mid',
      base: 438,
      peaks: [
        [188, 52, 206, 14],
        [506, 40, 248, -12],
        [790, 60, 176, 10],
        [1080, 44, 232, -10],
        [1340, 56, 188, 8],
      ] as [number, number, number, number][],
    },
    {
      depth: 26,
      o: dark ? 0.32 : 0.3,
      blur: 'ink-near',
      base: 452,
      peaks: [
        [120, 74, 152, -16],
        [604, 66, 180, 14],
        [938, 86, 134, -12],
        [1286, 70, 166, 12],
      ] as [number, number, number, number][],
    },
  ];

  /** Sương cắt ngang: chân núi tan vào đây nên các mỏm trông như đang lơ lửng */
  const mistBands = [
    { cy: 228, rx: 820, ry: 40, cx: 400, o: dark ? 0.3 : 0.36, cls: 'ink-mist' },
    { cy: 300, rx: 880, ry: 38, cx: 1040, o: dark ? 0.34 : 0.4, cls: 'ink-mist ink-mist-slow' },
    { cy: 364, rx: 960, ry: 36, cx: 540, o: dark ? 0.38 : 0.44, cls: 'ink-mist' },
    { cy: 414, rx: 1040, ry: 30, cx: 880, o: dark ? 0.3 : 0.36, cls: 'ink-mist ink-mist-slow' },
  ];

  return (
    <div
      className="absolute inset-x-0 bottom-0 select-none overflow-hidden"
      style={{ height, opacity: opacity ?? (dark ? 0.9 : 0.72) }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="ink-far" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="ink-mid" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="ink-near" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" />
          </filter>
          <filter id="ink-fog" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="26" />
          </filter>

          {/* Đỉnh rõ, chân tan — chính thứ làm núi "nổi" */}
          <linearGradient id="peak-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="58%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.12" />
          </linearGradient>
          <mask id="peak-mask">
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#peak-fade)" />
          </mask>

          <linearGradient id="water-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="water-mask">
            <rect x="0" y={waterTop} width={VB_W} height={VB_H - waterTop} fill="url(#water-fade)" />
          </mask>
        </defs>

        {/* ── Núi ── */}
        <g mask="url(#peak-mask)" className="pointer-events-none">
          {ranges.map((r, i) => (
            <g
              key={i}
              style={{
                transform: `translateX(${-shift * r.depth}px)`,
                transition: 'transform 420ms cubic-bezier(0.22,0.61,0.36,1)',
              }}
            >
              <g fill={ink} opacity={r.o} filter={`url(#${r.blur})`}>
                {r.peaks.map(([px, pw, ph, lean], k) => (
                  <path key={k} d={peakPath(px, pw, ph, lean, r.base)} />
                ))}
              </g>
            </g>
          ))}

          {/* Cầu dài vắt giữa hai mỏm, và lầu các đậu trên đỉnh */}
          <g
            style={{
              transform: `translateX(${-shift * 13}px)`,
              transition: 'transform 420ms cubic-bezier(0.22,0.61,0.36,1)',
            }}
            opacity={dark ? 0.34 : 0.32}
          >
            <path
              d="M268,232 Q470,200 672,236"
              fill="none"
              stroke={ink}
              strokeWidth="2.4"
            />
            {[316, 372, 428, 484, 540, 596].map((x, i) => (
              <rect key={x} x={x} y={218 + (i % 2) * 3} width="1.6" height="16" fill={ink} />
            ))}
            <g transform="translate(268 232) scale(0.72)">
              <Pavilion fill={ink} />
            </g>
            <g transform="translate(672 236) scale(0.66)">
              <Pavilion fill={ink} />
            </g>
          </g>

          <g
            style={{
              transform: `translateX(${-shift * 26}px)`,
              transition: 'transform 420ms cubic-bezier(0.22,0.61,0.36,1)',
            }}
            opacity={dark ? 0.42 : 0.4}
          >
            <g transform="translate(1020 300) scale(0.95)">
              <Pavilion fill={ink} />
            </g>
            <g transform="translate(168 372) scale(0.8)">
              <Pavilion fill={ink} />
            </g>
          </g>
        </g>

        {/* ── Sương tầng ── vẽ sau núi để cắt ngang chân các mỏm */}
        {mistBands.map((m, i) => (
          <g key={i} className={`${m.cls} pointer-events-none`} opacity={m.o}>
            <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill={dark ? '#C9D6DA' : '#F3EEE3'} filter="url(#ink-fog)" />
          </g>
        ))}

        {water && (
          <>
            <g mask="url(#water-mask)" className="pointer-events-none">
              <g transform={`translate(0 ${waterTop * 2}) scale(1 -1)`}>
                {ranges.map((r, i) => (
                  <g key={i} fill={ink} opacity={r.o * 0.45} filter="url(#ink-far)">
                    {r.peaks.map(([px, pw, ph, lean], k) => (
                      <path key={k} d={peakPath(px, pw, ph, lean, r.base)} />
                    ))}
                  </g>
                ))}
              </g>
              {[414, 424, 436].map((y, i) => (
                <line
                  key={y}
                  x1="0" y1={y} x2={VB_W} y2={y}
                  stroke={ink}
                  strokeWidth="0.7"
                  opacity={0.08}
                  style={{
                    transform: `translateX(${shift * (4 + i * 3)}px)`,
                    transition: 'transform 620ms ease-out',
                  }}
                />
              ))}
            </g>

            <g className="pointer-events-none">
              {ripples.map(r => (
                <ellipse
                  key={r.id}
                  className="ink-ripple"
                  cx={r.x}
                  cy={waterTop + (VB_H - waterTop) * r.y}
                  rx="6"
                  ry="2"
                  fill="none"
                  stroke={ink}
                  strokeWidth="1.2"
                />
              ))}
            </g>

            <rect
              x="0" y={waterTop} width={VB_W} height={VB_H - waterTop}
              fill="transparent"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onPointerDown={addRipple}
            />
          </>
        )}
      </svg>
    </div>
  );
}
