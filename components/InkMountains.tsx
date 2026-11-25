'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

/**
 * Sơn thuỷ huyền ảo — ánh vàng kim.
 *
 * Dựng theo lối thuỷ mặc thật, không phải đồ hoạ vector:
 *   · Núi là MẢNG MỰC đặc, bờ răng cưa, mép loang nhoè — không phải hình
 *     khối trơn có đường viền. Mép loang làm bằng feTurbulence +
 *     feDisplacementMap, nên mỗi sống núi tự có cái rung của nét bút ướt.
 *   · Vàng kim không nằm ở đường viền mà nằm ở hai chỗ: lớp núi xa được rửa
 *     một nước vàng, và tán cây trụi lá trên sống núi.
 *   · Sương trắng dày, cuộn ngang, nuốt chân núi — chính nó tạo chiều sâu,
 *     chứ không phải phối cảnh.
 *
 * Tương tác:
 *   · Rê chuột → các tầng trượt lệch nhau, tầng gần đi xa nhất
 *   · Bấm vùng nước → gợn sóng lan ra rồi tắt
 *
 * Chỉ dải nước bắt chuột; phần còn lại `pointer-events: none`.
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

/** Nguồn sáng: núi xa phía này được rửa vàng đậm nhất */
const LIGHT = { x: 1000, y: 96 };

/**
 * Trắc diện sống núi, chuẩn hoá về [0,1]×[0,1]. Đỉnh cố ý đặt lệch khỏi tâm.
 * Đây mới là bộ xương; nét thật được uốn cong ở `smooth()` bên dưới.
 */
const RIDGES: number[][][] = [
  // A — một đỉnh chủ sắc, vai phải thoải dần
  [[0,0],[0.06,0.20],[0.13,0.15],[0.21,0.41],[0.29,0.32],[0.37,0.63],[0.43,0.54],
   [0.50,1.00],[0.56,0.70],[0.63,0.79],[0.71,0.46],[0.79,0.54],[0.87,0.26],[0.94,0.32],[1,0]],
  // B — hai vai, không đỉnh nào áp đảo
  [[0,0],[0.07,0.31],[0.15,0.23],[0.26,0.56],[0.34,0.45],[0.42,0.71],[0.50,0.57],
   [0.58,0.87],[0.66,0.61],[0.74,0.68],[0.84,0.35],[0.92,0.43],[1,0]],
  // C — dải núi răng cưa, đều đỉnh
  [[0,0],[0.06,0.39],[0.13,0.27],[0.20,0.53],[0.28,0.43],[0.36,0.67],[0.43,0.51],
   [0.52,0.75],[0.60,0.55],[0.68,0.64],[0.76,0.41],[0.85,0.51],[0.93,0.25],[1,0]],
  // D — vách dựng, đỉnh dồn về trái
  [[0,0],[0.05,0.25],[0.12,0.45],[0.18,0.35],[0.25,0.79],[0.31,1.00],[0.38,0.67],
   [0.46,0.75],[0.54,0.49],[0.62,0.59],[0.72,0.33],[0.82,0.41],[0.91,0.19],[1,0]],
];

/**
 * Nối các điểm bằng nét cong kiểu Catmull-Rom, không phải đường gấp khúc.
 * Đường gấp khúc cho ra răng cưa cứng như đồ hoạ; nét cong giữ đúng vị trí
 * đỉnh nhưng sườn núi lượn như bút lông kéo qua giấy. `TENSION` thấp thì nét
 * mềm, cao thì gãy gắt — 0.2 là chỗ còn ra núi mà không ra cánh hoa.
 */
const TENSION = 0.2;

function smooth(pts: [number, number][]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * TENSION;
    const c1y = p1[1] + (p2[1] - p0[1]) * TENSION;
    const c2x = p2[0] - (p3[0] - p1[0]) * TENSION;
    const c2y = p2[1] - (p3[1] - p1[1]) * TENSION;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

function ridgePath(profile: number[][], cx: number, w: number, h: number, base: number): string {
  const l = cx - w / 2;
  const pts = profile.map(([px, py]) => [l + px * w, base - py * h] as [number, number]);
  // Kéo thẳng xuống đáy khung: chân núi tan vào sương nhờ dải mờ, không cần
  // đường chân — có vẽ cũng bị nuốt hết.
  return `${smooth(pts)}L${(l + w).toFixed(1)},${VB_H}L${l.toFixed(1)},${VB_H}Z`;
}

/**
 * Cây trụi lá, tán rắc vàng. Lá là những chấm nhỏ RẢI THƯA và lệch nhau, cỡ
 * lẫn độ đậm đều khác nhau — nếu xếp đều thành vòng tròn thì ra cây kẹo mút
 * chứ không ra cây mùa thu nhìn từ xa.
 */
const LEAVES: [number, number, number, number][] = [
  // x, y, bán kính, độ đậm
  [-7.6,-15.4,1.1,0.9], [-5.2,-18.8,0.8,0.65], [-3.4,-15.8,1.3,1], [-1.2,-21.2,0.9,0.8],
  [0.8,-18.4,1.5,1],    [1.6,-23.4,0.7,0.55],  [3.8,-20.2,1.1,0.85], [5.4,-16.4,1.4,1],
  [7.2,-18.6,0.8,0.6],  [2.6,-14.6,0.9,0.75],  [-6.2,-21,0.7,0.5],
];

function GoldTree({ trunk, leaf, scale = 1 }: { trunk: string; leaf: string; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <g stroke={trunk} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.95">
        <path d="M0,0 C-0.6,-6 0.6,-11 0,-17" />
        <path d="M0,-8.5 C-3,-11 -5.4,-12.8 -7,-16" />
        <path d="M0,-11 C2.6,-13.2 4.6,-15 5.8,-17.8" />
        <path d="M0,-13.5 C-1.8,-16.4 -3.4,-18.4 -4.6,-21" />
        <path d="M0,-14.5 C1.2,-18 2,-20.4 2.4,-23" />
      </g>
      <g fill={leaf}>
        {LEAVES.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={o} />
        ))}
      </g>
    </g>
  );
}

/** Lầu các mái đao cong, đứng lẫn trong sương */
function Pavilion({ fill, opacity = 1 }: { fill: string; opacity?: number }) {
  return (
    <g fill={fill} opacity={opacity}>
      <path d="M-26,0 C-17,-4 -9,-8 0,-9 C9,-8 17,-4 26,0 C19,-2 14,-1 10,1 L-10,1 C-14,-1 -19,-2 -26,0 Z" />
      <path d="M-15,-10 C-10,-13 -4,-16 0,-17 C4,-16 10,-13 15,-10 C10,-11 8,-11 6,-9 L-6,-9 C-8,-11 -10,-11 -15,-10 Z" />
      <rect x="-8" y="1" width="16" height="8" />
      <rect x="-9.5" y="9" width="2" height="6" />
      <rect x="-2.5" y="9" width="2" height="6" />
      <rect x="4.5" y="9" width="2" height="6" />
      <rect x="8" y="9" width="2" height="6" />
    </g>
  );
}

/** Chim: hai nét bút hình cánh cung */
function Bird({ stroke, scale = 1 }: { stroke: string; scale?: number }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.4 / scale} strokeLinecap="round" transform={`scale(${scale})`}>
      <path d="M-6,0 C-3.5,-3.4 -1.4,-3.4 0,-0.9" />
      <path d="M0,-0.9 C1.4,-3.4 3.5,-3.4 6,0" />
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

  const gold = dark ? '#D9B468' : '#C79A3E';
  const goldHot = dark ? '#F5DFA6' : '#E8C27A';
  const mist = dark ? '#AFC6D2' : '#FFFFFF';
  const trunkInk = dark ? '#0A1218' : '#2A3238';
  const waterTop = 408;

  /**
   * Bốn tầng, từ xa tới gần. Núi xa nhạt và được rửa một nước vàng; núi gần
   * gần như mực nguyên chất. `wash` là độ đậm của nước vàng phủ lên tầng đó.
   */
  const ranges = [
    {
      depth: 4,
      tone: dark ? '#3C5464' : '#B6BFC6',
      o: dark ? 0.55 : 0.52,
      wash: dark ? 0.5 : 0.62,
      blur: 9,
      base: 392,
      masses: [
        { r: 2, cx: 190, w: 560, h: 236 },
        { r: 0, cx: 690, w: 480, h: 292 },
        { r: 1, cx: 1130, w: 620, h: 258 },
        { r: 3, cx: 1430, w: 420, h: 222 },
      ],
    },
    {
      depth: 10,
      tone: dark ? '#22394A' : '#79858E',
      o: dark ? 0.75 : 0.66,
      wash: dark ? 0.34 : 0.34,
      blur: 6.5,
      base: 414,
      masses: [
        { r: 1, cx: 60, w: 520, h: 214 },
        { r: 3, cx: 540, w: 600, h: 268 },
        { r: 2, cx: 1040, w: 520, h: 198 },
        { r: 0, cx: 1380, w: 480, h: 250 },
      ],
    },
    {
      depth: 19,
      tone: dark ? '#111F2A' : '#4C565F',
      o: dark ? 0.9 : 0.82,
      wash: dark ? 0.16 : 0.14,
      blur: 4.5,
      base: 436,
      masses: [
        { r: 3, cx: 250, w: 640, h: 212 },
        { r: 0, cx: 830, w: 540, h: 244 },
        { r: 2, cx: 1290, w: 580, h: 186 },
      ],
    },
    {
      depth: 32,
      tone: dark ? '#050C11' : '#262E35',
      o: dark ? 1 : 0.94,
      wash: 0,
      blur: 2.8,
      base: 458,
      masses: [
        { r: 2, cx: 120, w: 620, h: 164 },
        { r: 1, cx: 700, w: 700, h: 190 },
        { r: 3, cx: 1330, w: 560, h: 150 },
      ],
    },
  ];

  /** Cây mọc trên sống núi — x, y, cỡ, và tầng (khớp theo `depth`) */
  const trees: [number, number, number, number][] = [
    [206, 296, 1.15, 19], [262, 310, 0.85, 19], [318, 302, 1.0, 19],
    [742, 318, 1.2, 19], [802, 330, 0.9, 19],
    [1246, 300, 1.05, 19], [1308, 314, 0.8, 19],
    [96, 352, 1.3, 32], [152, 364, 0.95, 32],
    [648, 370, 1.25, 32], [712, 380, 0.9, 32],
    [1288, 356, 1.1, 32],
  ];

  /** Sương: dải ngang dày, cuộn rất chậm, nuốt chân từng tầng núi */
  const mistBands = [
    { cy: 268, rx: 760, ry: 34, cx: 360, o: dark ? 0.2 : 0.52, cls: 'ink-mist' },
    { cy: 322, rx: 880, ry: 40, cx: 1020, o: dark ? 0.26 : 0.62, cls: 'ink-mist ink-mist-slow' },
    { cy: 372, rx: 980, ry: 42, cx: 500, o: dark ? 0.3 : 0.72, cls: 'ink-mist' },
    { cy: 416, rx: 1080, ry: 40, cx: 920, o: dark ? 0.32 : 0.8, cls: 'ink-mist ink-mist-slow' },
  ];

  /** Bụi vàng: toạ độ và nhịp cố định để không nhảy loạn mỗi lần render */
  const motes = Array.from({ length: 18 }, (_, i) => {
    const seed = (i * 97) % 53;
    return {
      x: 60 + ((i * 149) % 1320),
      y: 150 + ((i * 83) % 250),
      r: 0.8 + (seed % 5) * 0.3,
      dur: 11 + (seed % 9) * 1.6,
      delay: (seed % 11) * 0.9,
    };
  });

  /** Đàn chim: túm lại một chỗ trên cao bên phải, không rải đều khắp trời */
  const birds = [
    { x: 1016, y: 108, s: 1.1, dur: 38, delay: 0 },
    { x: 1066, y: 92, s: 0.9, dur: 38, delay: 0.8 },
    { x: 1104, y: 118, s: 0.75, dur: 38, delay: 1.6 },
    { x: 1148, y: 98, s: 0.85, dur: 38, delay: 2.3 },
    { x: 1192, y: 126, s: 0.65, dur: 38, delay: 3.1 },
  ];

  return (
    <div
      className="absolute inset-x-0 bottom-0 select-none overflow-hidden"
      style={{ height, opacity: opacity ?? 1 }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          {/* Mép mực loang: nhiễu đẩy lệch đường biên rồi nhoè nhẹ. Đây là thứ
              phân biệt mảng mực với hình vector — thiếu nó, núi ra đồ hoạ. */}
          {ranges.map((r, i) => (
            <filter key={i} id={`ink-wet-${i}`} x="-25%" y="-30%" width="150%" height="160%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.006 0.015"
                numOctaves="4"
                seed={7 + i * 11}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={34 - i * 6}
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation={r.blur} />
            </filter>
          ))}

          {/* Mảng mực nhạt dần xuống chân: núi tan vào sương thay vì kết
              thúc bằng một khối đặc có mép cứng */}
          {ranges.map((r, i) => (
            <linearGradient key={`m${i}`} id={`mass-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={r.tone} stopOpacity="1" />
              <stop offset="34%"  stopColor={r.tone} stopOpacity="0.94" />
              <stop offset="72%"  stopColor={r.tone} stopOpacity="0.42" />
              <stop offset="100%" stopColor={r.tone} stopOpacity="0" />
            </linearGradient>
          ))}

          <filter id="fog" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="glow-soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="shaft-blur" x="-40%" y="-20%" width="180%" height="150%">
            <feGaussianBlur stdDeviation="24" />
          </filter>

          {/* Quầng sáng sau rặng núi */}
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldHot} stopOpacity={dark ? 0.46 : 0.5} />
            <stop offset="44%" stopColor={gold} stopOpacity={dark ? 0.2 : 0.22} />
            <stop offset="100%" stopColor={gold} stopOpacity="0" />
          </radialGradient>

          {/* Nước vàng rửa lên núi xa: đậm nhất phía nguồn sáng, nhạt dần sang
              trái, tan hẳn ở chân núi nơi sương dày */}
          <linearGradient id="wash" x1="1" y1="0.1" x2="0" y2="0.9">
            <stop offset="0%" stopColor={goldHot} stopOpacity="0.95" />
            <stop offset="34%" stopColor={gold} stopOpacity="0.6" />
            <stop offset="76%" stopColor={gold} stopOpacity="0.12" />
            <stop offset="100%" stopColor={gold} stopOpacity="0" />
          </linearGradient>

          <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={goldHot} stopOpacity="0" />
            <stop offset="18%" stopColor={goldHot} stopOpacity={dark ? 0.12 : 0.08} />
            <stop offset="100%" stopColor={goldHot} stopOpacity="0" />
          </linearGradient>

          <linearGradient id="water-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="water-mask">
            <rect x="0" y={waterTop} width={VB_W} height={VB_H - waterTop} fill="url(#water-fade)" />
          </mask>
        </defs>

        {/* ── Quầng sáng, nằm sau tất cả. Phải nằm trọn trong viewBox: khung
               ngoài `overflow-hidden`, quầng tràn ra sẽ bị xén thành một vệt
               thẳng cắt ngang trời. ── */}
        <ellipse className="pointer-events-none" cx={LIGHT.x} cy={LIGHT.y + 140} rx="600" ry="228" fill="url(#halo)" />

        {/* ── Cột nắng: rất mờ, chỉ để không khí có hạt ── */}
        <g className="light-shafts pointer-events-none" filter="url(#shaft-blur)">
          {[-14, 4, 17].map((deg, i) => (
            <polygon
              key={deg}
              points={`${LIGHT.x - 24},${LIGHT.y} ${LIGHT.x + 24},${LIGHT.y} ${LIGHT.x + 150 + i * 30},${VB_H} ${LIGHT.x - 110 - i * 26},${VB_H}`}
              fill="url(#shaft)"
              transform={`rotate(${deg} ${LIGHT.x} ${LIGHT.y})`}
              style={{ animationDelay: `${i * 3.1}s` }}
            />
          ))}
        </g>

        {/* ── Đàn chim, bay trên rặng núi ── */}
        <g className="pointer-events-none">
          {birds.map((b, i) => (
            <g key={i} className="sky-bird" style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
              <g transform={`translate(${b.x} ${b.y})`}>
                <Bird stroke={dark ? '#C7B894' : '#55606A'} scale={b.s} />
              </g>
            </g>
          ))}
        </g>

        {/* ── Núi: mảng mực, xen sương giữa các tầng ── */}
        {ranges.map((r, i) => (
          <g key={i} className="pointer-events-none">
            <g
              style={{
                transform: `translateX(${-shift * r.depth}px)`,
                transition: 'transform 420ms cubic-bezier(0.22,0.61,0.36,1)',
              }}
            >
              <g filter={`url(#ink-wet-${i})`}>
                {/* thân mực */}
                <g fill={`url(#mass-${i})`} opacity={r.o}>
                  {r.masses.map((m, k) => (
                    <path key={k} d={ridgePath(RIDGES[m.r], m.cx, m.w, m.h, r.base)} />
                  ))}
                </g>
                {/* nước vàng rửa lên trên, chỉ ăn vào phần núi */}
                {r.wash > 0 && (
                  <g fill="url(#wash)" opacity={r.wash}>
                    {r.masses.map((m, k) => (
                      <path key={k} d={ridgePath(RIDGES[m.r], m.cx, m.w, m.h, r.base)} />
                    ))}
                  </g>
                )}
              </g>

              {/* cây mọc trên sống núi của tầng này */}
              {trees
                .filter(([, , , d]) => d === r.depth)
                .map(([x, y, s], k) => (
                  <g key={k} transform={`translate(${x} ${y})`}>
                    <GoldTree trunk={trunkInk} leaf={gold} scale={s} />
                  </g>
                ))}

              {/* lầu các: chỉ hai tầng gần, nếu không thì thành đồ chơi rải khắp */}
              {i === 2 && (
                <>
                  <path
                    d="M300,268 Q520,240 740,272"
                    fill="none"
                    stroke={dark ? '#D9B468' : '#5A646E'}
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <g transform="translate(300 268) scale(0.6)">
                    <Pavilion fill={trunkInk} opacity={0.85} />
                  </g>
                </>
              )}
              {i === 3 && (
                <g transform="translate(1026 338) scale(0.7)">
                  <Pavilion fill={r.tone} />
                </g>
              )}
            </g>

            {/* dải sương chen ngay sau tầng này → chiều sâu do sương, không do
                phối cảnh */}
            {mistBands[i] && (
              <g className={`${mistBands[i].cls} pointer-events-none`} opacity={mistBands[i].o}>
                <ellipse
                  cx={mistBands[i].cx} cy={mistBands[i].cy}
                  rx={mistBands[i].rx} ry={mistBands[i].ry}
                  fill={mist} filter="url(#fog)"
                />
                <ellipse
                  cx={LIGHT.x} cy={mistBands[i].cy}
                  rx={mistBands[i].rx * 0.4} ry={mistBands[i].ry}
                  fill={goldHot} opacity={dark ? 0.3 : 0.26} filter="url(#fog)"
                />
              </g>
            )}
          </g>
        ))}

        {/* ── Bụi vàng ── */}
        <g className="pointer-events-none" fill={goldHot}>
          {motes.map((m, i) => (
            <circle
              key={i}
              className="gold-mote"
              cx={m.x} cy={m.y} r={m.r}
              style={{ animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }}
            />
          ))}
        </g>

        {water && (
          <>
            <g mask="url(#water-mask)" className="pointer-events-none">
              <ellipse cx={LIGHT.x} cy={waterTop + 18} rx="150" ry="24" fill={gold} opacity="0.26" filter="url(#glow-soft)" />
              {[418, 430, 444].map((y, i) => (
                <line
                  key={y}
                  x1="0" y1={y} x2={VB_W} y2={y}
                  stroke={dark ? '#D9B468' : '#8A939B'}
                  strokeWidth="0.7"
                  opacity={0.14}
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
                  rx="6" ry="2"
                  fill="none"
                  stroke={goldHot}
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
