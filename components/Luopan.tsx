'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { VI_BRANCHES } from '@/lib/i18n/terms';

/**
 * La bàn (la kinh) xoay được.
 *
 * Bốn vòng, từ ngoài vào: nhị thập tứ sơn hướng, mười hai địa chi, bát
 * quái, rồi thái cực ở tâm. Kim đứng yên ở đỉnh; chính VÒNG xoay, đúng như
 * la bàn thật — người dùng xoay mặt la bàn cho sơn hướng khớp với kim.
 *
 * Mỗi nấc 30° là một địa chi, cũng là MỘT NGÀY: can chi ngày xoay vòng theo
 * chu kỳ mười hai chi, nên kéo la bàn đi một nấc đúng bằng bước sang ngày
 * kế. Kéo thuận chiều kim đồng hồ là tới, ngược lại là lui.
 */

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** Nhị thập tứ sơn, bắt đầu từ Nhâm để Tý rơi đúng chính Bắc */
const SHAN_24 = [
  '壬', '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳',
  '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥',
];

const TRIGRAMS = ['乾', '坎', '艮', '震', '巽', '离', '坤', '兑'];

/** Góc một nấc, độ. Mười hai chi chia đều vòng tròn. */
const STEP = 30;

export default function Luopan({
  branch,
  onStep,
  size = 340,
}: {
  /** Địa chi của ngày đang xem, chữ Hán — vòng xoay sao cho chi này lên đỉnh */
  branch: string;
  /** Người dùng kéo xong: +n là tiến n ngày, -n là lùi */
  onStep: (steps: number) => void;
  size?: number;
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const ref = useRef<SVGSVGElement | null>(null);
  /** Góc lệch trong lúc đang kéo, chưa chốt thành ngày */
  const [drag, setDrag] = useState(0);
  const startAngle = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /** Góc của con trỏ so với tâm la bàn, độ, 0 ở đỉnh */
  const angleOf = useCallback((clientX: number, clientY: number): number => {
    const el = ref.current;
    if (!el) return 0;
    const b = el.getBoundingClientRect();
    const dx = clientX - (b.left + b.width / 2);
    const dy = clientY - (b.top + b.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }, []);

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    startAngle.current = angleOf(e.clientX, e.clientY);
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (startAngle.current === null) return;
    let d = angleOf(e.clientX, e.clientY) - startAngle.current;
    // atan2 nhảy ±360 khi con trỏ vượt qua đỉnh; kéo về khoảng (-180,180]
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    setDrag(d);
  };

  const finish = (e: React.PointerEvent<SVGSVGElement>) => {
    if (startAngle.current === null) return;
    startAngle.current = null;
    const steps = Math.round(drag / STEP);
    setDrag(0);
    if (steps !== 0) onStep(steps);
  };

  const bi = Math.max(0, BRANCHES.indexOf(branch));
  // Xoay sao cho chi của ngày nằm dưới kim, cộng thêm phần đang kéo dở
  const rotation = -bi * STEP + drag;

  const ink = dark ? '#E8DCC2' : '#2A3238';
  const gold = dark ? '#E2C379' : '#9A7B40';
  const goldDim = dark ? 'rgba(226,195,121,0.34)' : 'rgba(154,123,64,0.34)';
  const face = dark ? '#0D151B' : '#FBF7EE';
  const faceEdge = dark ? '#15222A' : '#EDE6D8';

  const R = 160;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg
        ref={ref}
        viewBox="-180 -180 360 360"
        width={size}
        height={size}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{ cursor: startAngle.current !== null ? 'grabbing' : 'grab', touchAction: 'none' }}
        role="slider"
        aria-label="La bàn chọn ngày — kéo để đổi ngày"
        aria-valuenow={bi}
        aria-valuemin={0}
        aria-valuemax={11}
        aria-valuetext={VI_BRANCHES[branch] ?? branch}
      >
        <defs>
          <radialGradient id="lp-face" cx="38%" cy="30%" r="76%">
            <stop offset="0%" stopColor={faceEdge} />
            <stop offset="100%" stopColor={face} />
          </radialGradient>
          <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* quầng sáng sau mặt la bàn */}
        <circle r={R + 10} fill={gold} opacity={dark ? 0.1 : 0.07} filter="url(#lp-glow)" />

        {/* ───── phần xoay ───── */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: startAngle.current === null && !reduced.current
              ? 'transform 520ms cubic-bezier(0.22,0.61,0.36,1)'
              : 'none',
          }}
        >
          <circle r={R} fill="url(#lp-face)" stroke={goldDim} strokeWidth="1.5" />

          {/* vòng ngoài: nhị thập tứ sơn */}
          <circle r={R - 2} fill="none" stroke={goldDim} strokeWidth="0.8" />
          <circle r={R - 30} fill="none" stroke={goldDim} strokeWidth="0.8" />
          {SHAN_24.map((s, i) => {
            const a = i * 15;
            return (
              <g key={s + i} transform={`rotate(${a})`}>
                <line x1="0" y1={-(R - 2)} x2="0" y2={-(R - 30)} stroke={goldDim} strokeWidth="0.6" />
                <text
                  y={-(R - 16)} textAnchor="middle" dominantBaseline="middle"
                  fill={ink} opacity="0.75" fontSize="11"
                  transform={`rotate(${-a - rotation} 0 ${-(R - 16)})`}
                >
                  {s}
                </text>
              </g>
            );
          })}

          {/* vòng giữa: mười hai địa chi — vòng chính, kim chỉ vào đây */}
          <circle r={R - 74} fill="none" stroke={goldDim} strokeWidth="0.8" />
          {BRANCHES.map((b, i) => {
            const a = i * STEP;
            const active = i === bi;
            return (
              <g key={b} transform={`rotate(${a})`}>
                <line x1="0" y1={-(R - 30)} x2="0" y2={-(R - 74)} stroke={goldDim} strokeWidth="0.6" />
                {active && (
                  <path
                    d={`M ${-(R - 52) * Math.sin(Math.PI / 12)},${-(R - 52) * Math.cos(Math.PI / 12)}
                        A ${R - 52},${R - 52} 0 0 1 ${(R - 52) * Math.sin(Math.PI / 12)},${-(R - 52) * Math.cos(Math.PI / 12)}`}
                    fill="none" stroke={gold} strokeWidth="26" opacity={dark ? 0.16 : 0.12}
                  />
                )}
                <g transform={`rotate(${-a - rotation} 0 ${-(R - 52)})`}>
                  <text
                    y={-(R - 46)} textAnchor="middle" dominantBaseline="middle"
                    fill={active ? gold : ink} opacity={active ? 1 : 0.82}
                    fontSize="16" fontWeight={active ? 700 : 500}
                  >
                    {b}
                  </text>
                  <text
                    y={-(R - 62)} textAnchor="middle" dominantBaseline="middle"
                    fill={active ? gold : ink} opacity={active ? 0.9 : 0.5}
                    fontSize="9" letterSpacing="0.08em"
                  >
                    {VI_BRANCHES[b]}
                  </text>
                </g>
              </g>
            );
          })}

          {/* vòng trong: bát quái */}
          <circle r={R - 112} fill="none" stroke={goldDim} strokeWidth="0.8" />
          {TRIGRAMS.map((t, i) => {
            const a = i * 45;
            return (
              <g key={t} transform={`rotate(${a})`}>
                <text
                  y={-(R - 92)} textAnchor="middle" dominantBaseline="middle"
                  fill={ink} opacity="0.6" fontSize="12"
                  transform={`rotate(${-a - rotation} 0 ${-(R - 92)})`}
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* thái cực: khử góc xoay để đồ hình âm dương luôn đứng đúng chiều */}
          <g opacity={dark ? 0.9 : 0.8} transform={`rotate(${-rotation})`}>
            <circle r="30" fill="none" stroke={goldDim} strokeWidth="1" />
            <path d="M0,-30 A15,15 0 0,1 0,0 A15,15 0 0,0 0,30 A30,30 0 0,1 0,-30 Z" fill={ink} opacity="0.5" />
            <circle cx="0" cy="-15" r="4.5" fill={face} />
            <circle cx="0" cy="15" r="4.5" fill={ink} opacity="0.5" />
          </g>
        </g>

        {/* ───── kim, đứng yên ───── */}
        <g>
          <path d="M0,-176 L7,-158 L-7,-158 Z" fill={gold} />
          <line x1="0" y1="-158" x2="0" y2="-120" stroke={gold} strokeWidth="1.6" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}
