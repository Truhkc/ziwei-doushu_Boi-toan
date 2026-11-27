'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { KOI_EVENT, koiMode, type KoiMode } from '@/components/KoiToggle';

/**
 * Con trỏ là một con cá chép.
 *
 * Không phải cái hình dán theo con trỏ: THÂN CÁ ĐI THEO ĐÚNG VỆT CHUỘT vừa
 * quét qua. Mỗi khung hình lấy lại đường đi gần nhất của con trỏ rồi rải đều
 * các đốt sống lên đó, nên ngoặt tay là cá lượn theo, vòng gấp là thân cong
 * hẳn — y như con cá thật luồn nước.
 *
 * Mấy điều làm nó ra con cá chứ không ra cái đuôi sao băng:
 *
 *   · SỐNG LƯNG BÁM VỆT CHUỘT. Đốt sống đặt theo khoảng cách cung đường chứ
 *     không theo thời gian, nên rê nhanh hay chậm thì cá vẫn đúng một độ dài.
 *   · THÂN UỐN SÓNG. Trên đường đi còn cộng một hình sin chạy dọc, biên độ
 *     nhỏ ở đầu lớn dần về đuôi — cá quẫy đuôi chứ không lắc đầu.
 *   · ĐUÔI, RÂU, VÂY ĐI SAU MỘT NHỊP. Đều lấy pha trễ hơn thân; thiếu cái
 *     trễ ấy thì cả con cứng như mảnh giấy cắt.
 *   · ĐỨNG YÊN VẪN SỐNG. Ngừng tay thì thân duỗi dần nhưng vây và râu còn
 *     phe phẩy, như cá đang lơ lửng giữ chỗ.
 *
 * Cá để lại vệt mực loang sau đuôi, nối tiếp ý đồ thuỷ mặc của cả trang.
 *
 * Con trỏ thật bị ẩn đi, nhưng CHỈ ở chỗ nó vốn là mũi tên thường — link, nút
 * và ô nhập vẫn giữ nguyên con trỏ của chúng, để không mất dấu hiệu bấm được.
 */

/** Độ dài thân, px */
const LEN = 84;
/** Nửa bề ngang chỗ phình nhất, px */
const GIRTH = 8.0;
/** Số đốt sống */
const SEG = 18;
/** Giữ lại bấy nhiêu điểm vệt chuột — đủ dài hơn thân cá nhiều lần */
const TRAIL_MAX = 160;

type Pt = [number, number];

export default function InkKoi() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const [mode, setMode] = useState<KoiMode>('off');

  useEffect(() => {
    setMode(koiMode());
    const onChange = (e: Event) => setMode((e as CustomEvent<KoiMode>).detail);
    window.addEventListener(KOI_EVENT, onChange);
    return () => window.removeEventListener(KOI_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (mode === 'off') return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /**
     * Mép nét phải nhoè thì mới ra mực thấm giấy, chứ `fill()` trần cho mép
     * sắc như dao cắt. Nhưng KHÔNG được nhoè từng nét một: mỗi lần đổi
     * `ctx.filter` là một lượt hợp ảnh riêng, mà con cá có tới gần tám mươi
     * nét nhỏ (râu và đuôi đều chẻ thành nhiều đoạn để thuôn dần) — làm thế
     * thì treo cứng cả trang.
     *
     * Nên: vẽ cả con lên một canvas phụ với nét sắc, rồi dán sang canvas
     * chính đúng MỘT lần kèm nhoè.
     *
     * Canvas phụ chỉ to bằng CON CÁ, không to bằng màn hình. Nhoè là phép
     * tính trên từng điểm ảnh: làm mờ cả khung 2880×1800 mỗi lần vẽ thì rơi
     * xuống sáu khung hình một giây, còn làm mờ một ô 340×340 quanh con cá
     * thì nhẹ hơn gần hai mươi lần.
     */
  
    /** Nửa cạnh ô vẽ quanh đầu cá, px — đủ chứa thân, đuôi và râu dài nhất */
    const PAD = 170;
    const off = document.createElement('canvas');
    const octx = off.getContext('2d');
    if (!octx) return;
    const canFilter = 'filter' in ctx;

    // Giấu mũi tên đi, cá thay chỗ nó
    document.documentElement.classList.add('koi-cursor');

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Canvas CHỈ to bằng ô quanh con cá, không phủ kín màn hình.
      //
      // Một canvas trong suốt phủ kín màn hình, lại nằm trên bức sơn thuỷ đầy
      // bộ lọc nhoè, buộc trình duyệt hợp ảnh lại CẢ TRANG mỗi khung — đó mới
      // là chỗ ngốn, chứ không phải mấy nét vẽ. Ô nhỏ thì chỉ cần dời bằng
      // `transform`, việc hợp ảnh gọn trong vài trăm điểm ảnh.
      canvas.width = Math.ceil(PAD * 2 * dpr);
      canvas.height = canvas.width;
      canvas.style.width = `${PAD * 2}px`;
      canvas.style.height = `${PAD * 2}px`;
      // Cố ý vẽ cá ở độ phân giải thấp hơn màn hình rồi phóng to lúc dán:
      // bớt được bốn lần việc tô điểm ảnh, và chính cái phóng to cho thêm
      // độ mềm ở mép — thứ mà ta vốn đang phải cầu kỳ đi tạo ra.
      off.width = PAD * 2;
      off.height = off.width;
    };
    resize();

    /** Vệt chuột, phần tử 0 là mới nhất */
    const trail: Pt[] = [];
    let seen = false;
    // Hướng đầu cá, làm mượt để đứng yên không giật
    let hdx = 1;
    let hdy = 0;

    const onMove = (e: PointerEvent) => {
      const p: Pt = [e.clientX, e.clientY];
      if (!seen) {
        seen = true;
        for (let i = 0; i < TRAIL_MAX; i++) trail.push(p);
      }
      trail.unshift(p);
      if (trail.length > TRAIL_MAX) trail.length = TRAIL_MAX;
    };


    /** Nối điểm bằng nét cong, KHÔNG mở đường mới — để thân cá là một hình kín */
    const appendSmooth = (g: CanvasRenderingContext2D, pts: Pt[], start: boolean) => {
      if (start) g.moveTo(pts[0][0], pts[0][1]);
      else g.lineTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2;
        const my = (pts[i][1] + pts[i + 1][1]) / 2;
        g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
      }
      const last = pts[pts.length - 1];
      g.lineTo(last[0], last[1]);
    };

    /** Đầu tù, phình ở khoảng một phần tư, thon dần về đuôi */
    const halfWidth = (s: number) =>
      GIRTH * Math.pow(Math.sin(Math.PI * Math.min((s + 0.1) / 1.14, 1)), 0.7);

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!seen) return;

      const now = performance.now();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dark = themeRef.current === 'dark';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Xoá sạch ô mỗi khung. Thân cá là hình đặc lại vẽ ở chỗ mới liên
      // tục; chỉ phủ mờ thì các bản cũ còn đọng rất lâu, râu với vây chồng
      // lên nhau thành một con rết dài chạy suốt vệt chuột.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, PAD * 2, PAD * 2);

      // ── Chiều dài tích luỹ dọc vệt chuột, để rải đốt sống theo cung đường ──
      const cum: number[] = [0];
      for (let i = 1; i < trail.length; i++) {
        cum.push(cum[i - 1] + Math.hypot(trail[i][0] - trail[i - 1][0], trail[i][1] - trail[i - 1][1]));
      }
      const total = cum[cum.length - 1];

      // Hướng đầu: lấy theo đoạn vệt gần đầu nhất, làm mượt dần
      const probe = at(Math.min(14, Math.max(total, 1)));
      const vx = trail[0][0] - probe[0];
      const vy = trail[0][1] - probe[1];
      const vlen = Math.hypot(vx, vy);
      if (vlen > 0.6) {
        hdx += (vx / vlen - hdx) * 0.25;
        hdy += (vy / vlen - hdy) * 0.25;
        const n = Math.hypot(hdx, hdy) || 1;
        hdx /= n; hdy /= n;
      }

      function at(d: number): Pt {
        if (d <= 0) return trail[0];
        if (d >= total) {
          // Vệt ngắn hơn thân (vừa đứng yên) → kéo dài ngược theo hướng đầu
          const last = trail[trail.length - 1];
          const ext = d - total;
          return [last[0] - hdx * ext, last[1] - hdy * ext];
        }
        let lo = 0, hi = cum.length - 1;
        while (lo < hi - 1) {
          const mid = (lo + hi) >> 1;
          if (cum[mid] <= d) lo = mid; else hi = mid;
        }
        const t = (d - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
        return [
          trail[lo][0] + (trail[hi][0] - trail[lo][0]) * t,
          trail[lo][1] + (trail[hi][1] - trail[lo][1]) * t,
        ];
      }

      // ── Sống lưng: bám vệt chuột, cộng sóng uốn ──
      const nx = -hdy, ny = hdx;
      const phase = now / 120;
      const sp: Pt[] = [];
      for (let i = 0; i <= SEG; i++) {
        const s = i / SEG;
        const [px, py] = at(s * LEN);
        const amp = 1.2 + s * s * 6.5;
        const wv = Math.sin(phase - s * 3.3) * amp;
        sp.push([px + nx * wv, py + ny * wv]);
      }

      const pale = dark ? '#EDE6D6' : '#FBF8F0';
      const ink = dark ? '#24323C' : '#1C242B';
      const body = mode === 'white' ? pale : ink;
      const mark = mode === 'white' ? ink : pale;

      // ── Con cá vẽ lên canvas phụ, nét sắc ──────────────────────────────
      const g = octx;
      // Dời gốc toạ độ: đầu cá rơi đúng tâm ô, nên toàn bộ phần vẽ bên dưới
      // vẫn dùng được toạ độ màn hình như cũ, không phải tính lại gì.
      const ox = trail[0][0] - PAD;
      const oy = trail[0][1] - PAD;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, off.width, off.height);
      g.setTransform(1, 0, 0, 1, -ox, -oy);

      const head = sp[0];
      const tail = sp[SEG];

      /**
       * Một sợi thuôn dần: cắt đường cong thành nhiều đoạn ngắn, mỗi đoạn
       * mảnh hơn đoạn trước. Canvas không vẽ được nét đổi bề dày trong một
       * stroke, mà râu cá tịt dần về đầu mút mới ra chất bút lông — nên phải
       * chẻ ra thế này.
       */
      const filament = (pts: Pt[], w0: number) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const t = i / (pts.length - 1);
          g.lineWidth = Math.max(0.12, w0 * Math.pow(1 - t, 1.5));
          g.beginPath();
          g.moveTo(pts[i][0], pts[i][1]);
          g.lineTo(pts[i + 1][0], pts[i + 1][1]);
          g.stroke();
        }
      };

      /** Lấy mẫu đường cong bậc ba thành chuỗi điểm */
      const bez = (p0: Pt, c1: Pt, c2: Pt, p3: Pt, n: number): Pt[] => {
        const out: Pt[] = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n, u = 1 - t;
          out.push([
            u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
          ]);
        }
        return out;
      };

      /** Toạ độ theo hệ của cá: a dọc thân (dương = ra trước), b ngang */
      const P = (o: Pt, a: number, b: number): Pt =>
        [o[0] + hdx * a + nx * b, o[1] + hdy * a + ny * b];

      // ── Vây và râu: mỏng, trong, nhoè — như lụa thấm nước ──────────────
      // Đây là chỗ quyết định bức này ra tranh hay ra hình vector: vây phải
      // nhạt hơn thân và mép phải tan, không được sắc như dao cắt.
      g.globalAlpha = 0.4;
      g.fillStyle = body;
      g.strokeStyle = body;
      g.lineCap = 'round';

      // Đuôi: hai dải lụa dài buông về sau, uốn theo nhịp trễ nhất
      const tLag = Math.sin(phase - 3.4);
      for (const side of [-1, 1]) {
        const sway = tLag * 11 * side;
        g.beginPath();
        g.moveTo(...P(tail, 2, side * 2));
        g.bezierCurveTo(
          ...P(tail, -14, side * 11 + sway * 0.4),
          ...P(tail, -34, side * 21 + sway),
          ...P(tail, -52, side * 12 + sway * 1.5),
        );
        g.bezierCurveTo(
          ...P(tail, -34, side * 6 + sway),
          ...P(tail, -15, side * 2 + sway * 0.4),
          ...P(tail, 2, side * -1),
        );
        g.fill();
      }

      // Vài sợi đuôi vượt ra ngoài dải lụa, cho đuôi tan dần chứ không cụt
      for (const side of [-1, 1]) {
        for (const [len, spread] of [[66, 16], [58, 6]] as const) {
          filament(
            bez(
              P(tail, 0, side * 2),
              P(tail, -20, side * (spread + 6) + tLag * 8 * side),
              P(tail, -44, side * spread + tLag * 12 * side),
              P(tail, -len, side * (spread - 4) + tLag * 16 * side),
              8,
            ),
            1.5,
          );
        }
      }

      // Râu: ba sợi mỗi bên, dài ngắn khác nhau, vuốt ra sau rồi trôi
      const wLag = Math.sin(phase - 1.0);
      for (const side of [-1, 1]) {
        const whiskers: [number, number, number][] = [
          // [dài, xoè ngang, bề dày gốc]
          [46, 26, 1.5],
          [34, 17, 1.2],
          [25, 9, 1.0],
        ];
        for (const [len, spread, w0] of whiskers) {
          filament(
            bez(
              P(head, 2, side * 2),
              P(head, 7, side * spread * 0.55),
              P(head, -len * 0.45, side * spread + wLag * 5 * side),
              P(head, -len, side * (spread * 0.85) + wLag * 9 * side),
              8,
            ),
            w0,
          );
        }
      }

      // Vây ngực: hai lá mỏng sau mang, phe phẩy trễ nửa nhịp
      const pec = sp[3];
      const pLag = Math.sin(phase - 1.7) * 4;
      for (const side of [-1, 1]) {
        g.beginPath();
        g.moveTo(...P(pec, 1, side * 2));
        g.bezierCurveTo(
          ...P(pec, -2, side * 14 + pLag),
          ...P(pec, -14, side * 13 + pLag),
          ...P(pec, -21, side * 6 + pLag),
        );
        g.bezierCurveTo(
          ...P(pec, -13, side * 4),
          ...P(pec, -6, side * 2),
          ...P(pec, 1, side * 1),
        );
        g.fill();
      }

      // Vây lưng: một dải chạy dọc sống lưng
      g.beginPath();
      g.moveTo(...P(sp[5], 0, 0));
      g.bezierCurveTo(
        ...P(sp[6], 0, 8),
        ...P(sp[9], 0, 9),
        ...P(sp[11], 0, 0),
      );
      g.fill();

      // ── Thân: đặc, mép chỉ nhoè rất nhẹ ────────────────────────────────
      g.globalAlpha = 1;
      const left: Pt[] = [];
      const right: Pt[] = [];
      for (let i = 0; i <= SEG; i++) {
        const wdt = halfWidth(i / SEG);
        left.push([sp[i][0] + nx * wdt, sp[i][1] + ny * wdt]);
        right.push([sp[i][0] - nx * wdt, sp[i][1] - ny * wdt]);
      }
      g.beginPath();
      appendSmooth(g, left, true);
      appendSmooth(g, right.slice().reverse(), false);
      g.closePath();
      g.fillStyle = body;
      g.fill();

      // ── Vệt giọt nước trên đầu ─────────────────────────────────────────
      const hm = sp[1];
      g.beginPath();
      g.moveTo(...P(hm, 9, 0));
      g.bezierCurveTo(...P(hm, 3, 5.4), ...P(hm, -10, 4.4), ...P(hm, -15, 0));
      g.bezierCurveTo(...P(hm, -10, -4.4), ...P(hm, 3, -5.4), ...P(hm, 9, 0));
      g.fillStyle = mark;
      g.fill();

      // ── Mắt ──
      const eye = sp[2];
      for (const side of [-1, 1]) {
        g.beginPath();
        g.arc(...P(eye, 0, side * 5.4), 1.1, 0, Math.PI * 2);
        g.fill();
      }


      // ── Dán sang canvas chính, nhoè đúng một lần ───────────────────────
      if (canFilter) ctx.filter = 'blur(0.9px)';
      ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, PAD * 2, PAD * 2);
      if (canFilter) ctx.filter = 'none';
      // Dời cả ô tới chỗ con cá — việc của bộ hợp ảnh, không phải của CPU
      canvas.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      document.documentElement.classList.remove('koi-cursor');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0"
      style={{ zIndex: 60, willChange: 'transform' }}
    />
  );
}
