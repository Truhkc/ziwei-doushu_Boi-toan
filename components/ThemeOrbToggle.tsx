'use client';
import { useRef } from 'react';
import { useTheme } from './ThemeProvider';
import { useI18n } from './LocaleProvider';

/**
 * Nút đổi nền: trăng khuyết (nền tối) ↔ mặt trời (nền sáng).
 *
 * Bấm vào sẽ kích hoạt chuyển cảnh trong ThemeProvider, loang ra đúng từ tâm
 * nút này — nên động tác bấm và hiệu ứng là một, không rời rạc.
 *
 * Đặt cố định cạnh nút ngôn ngữ thay vì nhét vào thanh điều hướng trang chủ,
 * vì /chart, /heming, /library không có thanh nào.
 */
export default function ThemeOrbToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const ref = useRef<HTMLButtonElement>(null);
  const dark = theme === 'dark';

  const handle = () => {
    const r = ref.current?.getBoundingClientRect();
    toggle(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handle}
      aria-label={dark ? t('common.theme.toLight') : t('common.theme.toDark')}
      className="fixed bottom-4 right-[88px] z-[60] flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur"
      style={{
        borderColor: dark ? 'rgba(194,160,90,0.3)' : 'rgba(122,95,46,0.3)',
        background: dark ? 'rgba(12,14,12,0.75)' : 'rgba(251,247,238,0.9)',
        boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(20,17,13,0.15)',
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        {/* Tia nắng — chỉ hiện ở nền sáng, xoè ra khi mặt trời lên */}
        <g
          className="orb-ray"
          style={{ opacity: dark ? 0 : 1, transform: dark ? 'rotate(-45deg) scale(0.6)' : 'none' }}
          stroke={dark ? '#C2A05A' : '#B07A2E'}
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line
              key={deg}
              x1="12"
              y1="2.6"
              x2="12"
              y2="5"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </g>

        {/* Thiên thể: hình tròn, khuyết đi một miếng để thành trăng lưỡi liềm */}
        <defs>
          <mask id="orb-crescent">
            <rect x="0" y="0" width="24" height="24" fill="#fff" />
            {/* Đĩa che trượt ra ngoài khi sang mặt trời → trăng tròn dần thành mặt trời */}
            <circle
              className="orb-body"
              cx={dark ? 16.4 : 30}
              cy={dark ? 8.6 : 2}
              r="7.4"
              fill="#000"
            />
          </mask>
        </defs>
        <circle
          className="orb-body"
          cx="12"
          cy="12"
          r={dark ? 7.4 : 5.6}
          fill={dark ? '#D8D2C2' : '#D9A441'}
          mask="url(#orb-crescent)"
          style={{ filter: dark ? 'none' : 'drop-shadow(0 0 4px rgba(217,164,65,0.6))' }}
        />
      </svg>
    </button>
  );
}
