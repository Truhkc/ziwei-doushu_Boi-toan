'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { UI, fill, type UiKey } from '@/lib/i18n/dict';
import {
  type Locale,
  term as rawTerm,
  termGanZhi as rawGanZhi,
  termPattern as rawPattern,
  termSihua as rawSihua,
} from '@/lib/i18n/terms';

export type { Locale };

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  /** Chuỗi giao diện; {tên} được thay bằng vars */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Chuyên danh mệnh lý do engine sinh ra (tên sao, tên cung, can, chi…) */
  term: (name: string) => string;
  /** Tên cách cục */
  pattern: (name: string) => string;
  /** Can chi ghép: 甲子 / Giáp Tý */
  ganzhi: (stem: string, branch: string) => string;
  /** Tứ hoá: 化禄 / hoá Lộc */
  sihua: (hua: string) => string;
}

const DEFAULT_LOCALE: Locale = 'vi';

const LocaleContext = createContext<LocaleCtx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  toggle: () => {},
  t: key => UI[key][DEFAULT_LOCALE],
  term: n => rawTerm(n, DEFAULT_LOCALE),
  pattern: n => rawPattern(n, DEFAULT_LOCALE),
  ganzhi: (s, b) => rawGanZhi(s, b, DEFAULT_LOCALE),
  sihua: h => rawSihua(h, DEFAULT_LOCALE),
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  /**
   * Phải khởi tạo đúng bằng ngôn ngữ server dựng sẵn, không được đọc <html
   * lang> ở đây. Đọc DOM trong hàm khởi tạo state làm lần render đầu ở client
   * khác HTML của server; React kêu "hydration failed" rồi giữ nguyên markup
   * server, nên người đã chọn tiếng Trung quay lại vẫn thấy tiếng Việt cho
   * tới lúc bấm nút. Đổi trong useEffect thì React vá đầy đủ.
   */
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ziwei-locale');
    if (saved === 'vi' || saved === 'zh') {
      setLocale(saved);
      return;
    }
    const lang = document.documentElement.getAttribute('lang');
    if (lang === 'zh-CN') setLocale('zh');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('lang', locale === 'zh' ? 'zh-CN' : 'vi');
    localStorage.setItem('ziwei-locale', locale);
  }, [locale, mounted]);

  const value: LocaleCtx = {
    locale,
    setLocale,
    toggle: () => setLocale(l => (l === 'vi' ? 'zh' : 'vi')),
    t: (key, vars) => fill(UI[key][locale], vars),
    term: name => rawTerm(name, locale),
    pattern: name => rawPattern(name, locale),
    ganzhi: (stem, branch) => rawGanZhi(stem, branch, locale),
    sihua: hua => rawSihua(hua, locale),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useI18n = () => useContext(LocaleContext);
