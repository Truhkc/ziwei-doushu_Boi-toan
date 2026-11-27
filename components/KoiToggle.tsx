'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useI18n } from '@/components/LocaleProvider';

/**
 * Nút chọn con cá làm con trỏ: cá trắng → cá đen → tắt → cá trắng.
 *
 * Ba trạng thái gộp vào một nút thay vì bày thêm nút ra góc màn hình. Nhãn
 * luôn nói rõ đang ở đâu và bấm nữa thì sang gì, nên không phải đoán.
 *
 * Không dùng context: InkKoi chỉ cần biết đang chọn gì, mà nó nằm ngoài cây
 * render của nút này. Đi qua localStorage cộng một sự kiện tự đặt thì gọn hơn
 * hẳn một provider nữa, và cả trang khỏi phải render lại mỗi lần bấm.
 */

export type KoiMode = 'white' | 'black' | 'off';

export const KOI_KEY = 'ziwei-koi';
export const KOI_EVENT = 'ziwei-koi-change';

export function koiMode(): KoiMode {
  try {
    const v = localStorage.getItem(KOI_KEY);
    if (v === 'white' || v === 'black' || v === 'off') return v;
  } catch {
    // Chặn lưu trữ (ẩn danh chẳng hạn) thì coi như chưa chọn gì
  }
  return 'off';
}

const NEXT: Record<KoiMode, KoiMode> = { white: 'black', black: 'off', off: 'white' };

export default function KoiToggle() {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const dark = theme === 'dark';
  const vn = locale === 'vi';

  /**
   * Khởi tạo bằng đúng giá trị server dựng sẵn rồi mới đọc lựa chọn đã lưu
   * trong useEffect. Đọc localStorage ngay trong hàm khởi tạo state sẽ làm
   * lần render đầu ở client lệch HTML server, React kêu hydration failed rồi
   * giữ nguyên markup cũ — đúng cái bẫy đã làm hỏng nút đổi nền trước đây.
   */
  const [mode, setMode] = useState<KoiMode>('off');
  const [mounted, setMounted] = useState(false);
  const [hasPointer, setHasPointer] = useState(true);

  useEffect(() => {
    setMounted(true);
    setMode(koiMode());
    setHasPointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  const cycle = () => {
    const next = NEXT[mode];
    setMode(next);
    try {
      localStorage.setItem(KOI_KEY, next);
    } catch {
      // Chặn lưu trữ (ẩn danh chẳng hạn) thì vẫn đổi được trong phiên này
    }
    window.dispatchEvent(new CustomEvent(KOI_EVENT, { detail: next }));
  };

  // Màn cảm ứng không có con trỏ để mà thay, nên nút này vô nghĩa.
  // Chỉ ẩn sau khi mounted, để HTML server và client còn khớp nhau.
  if (mounted && !hasPointer) return null;

  const label = vn
    ? { white: 'Con trỏ: cá trắng — bấm để đổi sang cá đen',
        black: 'Con trỏ: cá đen — bấm để tắt',
        off:   'Con trỏ: thường — bấm để bật cá trắng' }[mode]
    : { white: '指针：白鲤 — 点击换黑鲤',
        black: '指针：黑鲤 — 点击关闭',
        off:   '指针：普通 — 点击开启白鲤' }[mode];

  const gold = dark ? '#E2C379' : '#7A5F2E';
  const dim = dark ? 'rgba(226,195,121,0.4)' : 'rgba(122,95,46,0.4)';
  const stroke = mode === 'off' ? dim : gold;
  // Ruột cá tô theo đúng con đang chọn, để nhìn nút là biết ngay trắng hay đen
  const belly =
    mode === 'white' ? (dark ? '#EDE6D6' : '#FBF8F0')
    : mode === 'black' ? (dark ? '#24323C' : '#1C242B')
    : 'transparent';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="fixed bottom-4 right-[132px] z-[60] flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur"
      style={{
        borderColor: dark ? 'rgba(194,160,90,0.3)' : 'rgba(122,95,46,0.3)',
        background: dark ? 'rgba(12,14,12,0.75)' : 'rgba(251,247,238,0.9)',
        boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(20,17,13,0.15)',
      }}
    >
      {/* Con cá nhìn ngang; tắt thì có nét gạch chéo đè lên */}
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden>
        <path
          d="M4 12c3.2-4.4 8.4-4.4 11.6 0-3.2 4.4-8.4 4.4-11.6 0Z"
          fill={belly} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"
        />
        <path
          d="M15.6 12l4.4-3.1v6.2L15.6 12Z"
          fill={belly} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"
        />
        <path
          d="M9 8.3c.5-1.6 1.6-2.4 2.8-2.3"
          fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round"
        />
        {mode !== 'off' && (
          <circle cx="7" cy="11.2" r="1" fill={mode === 'white' ? stroke : (dark ? '#EDE6D6' : '#FBF8F0')} />
        )}
        {mode === 'off' && (
          <path d="M3.5 20.5 L20.5 3.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
