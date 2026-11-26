'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { BRUSH_EVENT, brushEnabled } from '@/components/BrushToggle';

/**
 * Con chuột là cây bút lông.
 *
 * Rê chuột thì mực để lại trên trang rồi LOANG ra — không phải vệt sáng theo
 * đuôi con trỏ, mà là mực thấm vào giấy: mỗi chấm bút nở rộng dần trong lúc
 * nhạt đi, đúng như giọt mực gặp giấy xuyến.
 *
 * Hai thứ làm nên cảm giác bút lông thật:
 *
 *   · Nét ĐẬM NHẠT THEO TỐC ĐỘ. Rê chậm thì mực đọng thành nét to; vung
 *     nhanh thì nét mảnh và thưa, như bút lông bị kéo lướt. Nếu nét đều tăm
 *     tắp thì ra cây bút bi, không ra bút lông.
 *   · Mực LOANG RỒI MỚI KHÔ. Mỗi chấm có một quãng "ướt" chừng nửa giây:
 *     bán kính nở ra, độ đậm tụt xuống. Hết quãng ướt thì chấm ngừng được vẽ
 *     lại, phần mực đã nằm trên canvas thì nhạt dần theo lớp phủ chung.
 *
 * Cách dựng cho nhẹ máy: KHÔNG vẽ lại toàn bộ lịch sử nét mỗi khung hình.
 * Mỗi khung chỉ đóng dấu những chấm còn ướt (số lượng có chặn), rồi làm mờ
 * cả canvas một nhịp bằng `destination-out`. Mực cũ tự phai mà không tốn gì
 * thêm, nên vệt dài bao nhiêu cũng không ghì tốc độ xuống.
 *
 * Lớp này nằm dưới chữ và `pointer-events: none`, nên không bao giờ chắn
 * thao tác hay làm khó đọc.
 */

/** Quãng mực còn ướt, ms — hết quãng này thì chấm thôi nở */
const BLOOM_MS = 520;
/** Chặn số chấm còn ướt cùng lúc, để vung chuột thật nhanh cũng không ghì máy */
const MAX_WET = 90;
/** Khoảng cách tối thiểu giữa hai chấm, px — thưa hơn thì nét đứt quãng */
const MIN_GAP = 7;

interface Dab {
  x: number;
  y: number;
  /** Bán kính lúc vừa chạm giấy */
  r0: number;
  /** Nở thêm bao nhiêu trong cả quãng ướt */
  grow: number;
  born: number;
}

export default function InkBrush() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  /**
   * Người dùng có bật bút không. Khởi tạo bằng true cho khớp HTML server,
   * rồi mới đọc lựa chọn đã lưu — y như các nút khác.
   */
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(brushEnabled());
    const onChange = (e: Event) => setEnabled((e as CustomEvent<boolean>).detail);
    window.addEventListener(BRUSH_EVENT, onChange);
    return () => window.removeEventListener(BRUSH_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Màn cảm ứng không có con trỏ để mà cầm bút; bật lên chỉ tổ tốn pin.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const dabs: Dab[] = [];
    let last: { x: number; y: number; t: number } | null = null;

    /** Rải chấm dọc đoạn vừa đi qua, để vung nhanh cũng không hở nét */
    const stroke = (x: number, y: number, now: number) => {
      if (!last) {
        last = { x, y, t: now };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MIN_GAP) return;

      const dt = Math.max(now - last.t, 1);
      const speed = dist / dt; // px/ms

      // Bút lông: rê chậm mực đọng (nét to), vung nhanh nét mảnh.
      // 0.25 px/ms là tốc độ rê thong thả; nhanh gấp mấy lần thì nét teo lại.
      const weight = Math.max(0.28, Math.min(1, 0.25 / speed));

      const steps = Math.min(Math.ceil(dist / MIN_GAP), 12);
      for (let i = 1; i <= steps; i++) {
        const p = i / steps;
        // Đầu nét đậm hơn đuôi một chút, cho có chiều kéo bút
        const taper = 0.75 + 0.25 * (1 - p);
        dabs.push({
          x: last.x + dx * p,
          y: last.y + dy * p,
          r0: (5 + weight * 16) * taper,
          grow: 10 + weight * 26,
          born: now,
        });
      }
      if (dabs.length > MAX_WET) dabs.splice(0, dabs.length - MAX_WET);
      last = { x, y, t: now };
    };

    const onMove = (e: PointerEvent) => stroke(e.clientX, e.clientY, performance.now());
    const onLeave = () => { last = null; };

    let raf = 0;
    /**
     * Số khung hình đã phủ mờ kể từ chấm mực cuối. Mực phai hết sau chừng
     * ngần này khung; qua mốc đó thì canvas đã sạch, phủ mờ thêm cũng không
     * đổi gì — nên ngừng hẳn, đừng quay vòng vẽ vời trên một trang người ta
     * để mở rồi bỏ đi.
     */
    let idle = 0;
    const IDLE_LIMIT = 200;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dark = themeRef.current === 'dark';

      if (dabs.length > 0) idle = 0;
      else if (idle > IDLE_LIMIT) return;
      else idle++;

      // Mực cũ phai dần. Nền tối phai chậm hơn vì vàng kim trên nền tối đã
      // nhạt sẵn, phai nhanh nữa thì chưa kịp thấy gì.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${dark ? 0.028 : 0.042})`;
      ctx.fillRect(0, 0, w, h);

      if (dabs.length === 0) return;

      // Nền tối: mực vàng chồng lên nhau thì sáng thêm (lighter).
      // Nền sáng: mực thấm xuống giấy thì tối đi (multiply).
      ctx.globalCompositeOperation = dark ? 'lighter' : 'multiply';

      for (let i = dabs.length - 1; i >= 0; i--) {
        const d = dabs[i];
        const age = now - d.born;
        if (age > BLOOM_MS) {
          dabs.splice(i, 1);
          continue;
        }
        const p = age / BLOOM_MS;
        const r = d.r0 + d.grow * p;
        // Đậm nhất lúc vừa chạm giấy rồi tụt nhanh — mực loang ra thì nhạt đi
        const a = (1 - p) * (1 - p) * (dark ? 0.052 : 0.044);

        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
        if (dark) {
          g.addColorStop(0, `rgba(245,223,166,${a})`);
          g.addColorStop(0.45, `rgba(226,195,121,${a * 0.5})`);
          g.addColorStop(1, 'rgba(226,195,121,0)');
        } else {
          g.addColorStop(0, `rgba(122,95,46,${a})`);
          g.addColorStop(0.45, `rgba(74,58,30,${a * 0.5})`);
          g.addColorStop(1, 'rgba(74,58,30,0)');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', resize);
      // Tắt giữa chừng thì xoá luôn mực đang còn, đừng để một vệt treo lơ lửng
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 3 }}
    />
  );
}
