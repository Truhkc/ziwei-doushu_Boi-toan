'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

/** Toạ độ tâm của nút bấm, để chuyển cảnh loang ra đúng từ chỗ người dùng chạm */
export interface ToggleOrigin {
  x: number;
  y: number;
}

const ThemeContext = createContext<{
  theme: Theme;
  toggle: (origin?: ToggleOrigin) => void;
}>({ theme: 'dark', toggle: () => {} });

/** Thời lượng chuyển cảnh, ms — dùng chung cho cả CSS lẫn hẹn giờ dọn dẹp */
const SCENE_MS = 900;

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ziwei-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('ziwei-theme', theme);
  }, [theme, mounted]);

  /**
   * Chuyển cảnh: một quầng sáng loang ra từ chỗ người dùng bấm, phủ kín màn
   * hình rồi tan. Đi sang nền sáng thì loang màu bình minh, về nền tối thì
   * loang màu hoàng hôn — nên cảm giác là cả không gian đổi, không phải chỉ
   * đổi màu nền.
   */
  const [scene, setScene] = useState<{ origin: ToggleOrigin; to: Theme; id: number } | null>(null);

  const toggle = (origin?: ToggleOrigin) => {
    const root = document.documentElement;
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced) {
      const o = origin ?? { x: window.innerWidth - 56, y: window.innerHeight - 56 };
      setScene({ origin: o, to: next, id: Date.now() });
      setTimeout(() => setScene(null), SCENE_MS);
    }

    root.classList.add('theme-transitioning');
    setTheme(next);
    setTimeout(() => root.classList.remove('theme-transitioning'), 420);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
      {scene && (
        <div
          key={scene.id}
          aria-hidden
          className={`scene-wipe ${scene.to === 'light' ? 'scene-wipe-dawn' : 'scene-wipe-dusk'}`}
          style={{
            // Bán kính đủ phủ góc xa nhất của màn hình, tính từ điểm bấm
            ['--wipe-x' as string]: `${scene.origin.x}px`,
            ['--wipe-y' as string]: `${scene.origin.y}px`,
          }}
        />
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
