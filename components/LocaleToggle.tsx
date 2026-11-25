'use client';
import { useI18n } from './LocaleProvider';
import { useTheme } from '@/components/ThemeProvider';

/**
 * Công tắc ngôn ngữ, cố định góc dưới phải.
 *
 * Để ở layout chứ không nhét vào thanh điều hướng của trang chủ, vì các trang
 * khác (/chart, /heming, /library) không có thanh nào cả — nằm cố định thì
 * trang nào cũng đổi được. Góc dưới PHẢI vì góc dưới trái là huy hiệu dev của Next.
 */
export default function LocaleToggle() {
  const { locale, toggle, t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const active = {
    background: isDark ? 'rgba(212,168,67,0.22)' : 'rgba(140,100,20,0.14)',
    color: isDark ? 'rgba(232,208,144,0.95)' : 'rgba(110,72,8,0.95)',
  };
  const idle = {
    background: 'transparent',
    color: isDark ? 'rgba(200,210,230,0.5)' : 'rgba(90,70,30,0.5)',
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('common.lang.toggleLabel')}
      className="fixed bottom-4 right-4 z-[60] flex items-center gap-0.5 rounded-full border px-1 py-1 backdrop-blur"
      style={{
        borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(140,100,20,0.3)',
        background: isDark ? 'rgba(10,16,32,0.75)' : 'rgba(255,252,242,0.9)',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(140,100,20,0.15)',
      }}
    >
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors"
        style={locale === 'vi' ? active : idle}
      >
        VI
      </span>
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors"
        style={locale === 'zh' ? active : idle}
      >
        中
      </span>
    </button>
  );
}
