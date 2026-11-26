'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useI18n } from '@/components/LocaleProvider';

/**
 * Nút tắt/mở bút mực.
 *
 * Không dùng context: InkBrush chỉ cần biết "còn bật không", mà nó lại nằm
 * ngoài cây render của nút này. Đi qua localStorage + một sự kiện tự đặt thì
 * gọn hơn hẳn một provider nữa, và tránh cho cả trang phải render lại mỗi
 * lần bật tắt.
 *
 * Mặc định BẬT. Lựa chọn nhớ theo máy, không nhớ theo thiết bị khác.
 */

export const BRUSH_KEY = 'ziwei-brush';
export const BRUSH_EVENT = 'ziwei-brush-change';

/** Đọc lựa chọn đã lưu. Chưa từng chọn thì coi như bật. */
export function brushEnabled(): boolean {
  try {
    return localStorage.getItem(BRUSH_KEY) !== 'off';
  } catch {
    return true;
  }
}

export default function BrushToggle() {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const dark = theme === 'dark';
  const vn = locale === 'vi';

  /**
   * Khởi tạo đúng bằng giá trị server dựng sẵn (bật), rồi mới đọc lựa chọn
   * đã lưu trong useEffect. Đọc localStorage ngay trong hàm khởi tạo state
   * sẽ làm lần render đầu ở client lệch HTML server, React kêu hydration
   * failed rồi giữ nguyên markup cũ — đúng cái bẫy đã làm hỏng nút đổi nền
   * và nút đổi ngôn ngữ trước đây.
   */
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOn(brushEnabled());
  }, []);

  const flip = () => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(BRUSH_KEY, next ? 'on' : 'off');
    } catch {
      // Chặn lưu trữ (chế độ ẩn danh chẳng hạn) thì vẫn đổi được trong phiên
    }
    window.dispatchEvent(new CustomEvent(BRUSH_EVENT, { detail: next }));
  };

  // Màn cảm ứng không có con trỏ để cầm bút, nên nút này cũng vô nghĩa.
  // Chỉ ẩn sau khi đã mounted, để HTML server và client khớp nhau.
  const [hasPointer, setHasPointer] = useState(true);
  useEffect(() => {
    setHasPointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);
  if (mounted && !hasPointer) return null;

  const label = vn
    ? on ? 'Tắt bút mực' : 'Bật bút mực'
    : on ? '关闭墨笔' : '开启墨笔';

  const stroke = dark
    ? on ? '#E2C379' : 'rgba(226,195,121,0.4)'
    : on ? '#7A5F2E' : 'rgba(122,95,46,0.4)';

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      aria-pressed={on}
      className="fixed bottom-4 right-[132px] z-[60] flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur"
      style={{
        borderColor: dark ? 'rgba(194,160,90,0.3)' : 'rgba(122,95,46,0.3)',
        background: dark ? 'rgba(12,14,12,0.75)' : 'rgba(251,247,238,0.9)',
        boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(20,17,13,0.15)',
      }}
    >
      {/* Cây bút lông chúc xuống; tắt thì có nét gạch chéo đè lên */}
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden fill="none">
        <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 3.6 L20.4 7.5 L10.8 17.1 L6 18.9 L7.8 14.1 Z" />
          <path d="M14.4 5.7 L18.3 9.6" />
        </g>
        {on && <circle cx="5.4" cy="19.5" r="1.5" fill={stroke} opacity="0.65" />}
        {!on && (
          <path d="M3.5 20.5 L20.5 3.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
