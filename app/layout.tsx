import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import LocaleToggle from '@/components/LocaleToggle';
import ThemeOrbToggle from '@/components/ThemeOrbToggle';
import InkKoi from '@/components/InkKoi';
import KoiToggle from '@/components/KoiToggle';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

/**
 * Metadata ở đây phục vụ TRANG CHỦ, vì layout gốc chính là layout của `/`.
 *
 * Hai điều phải giữ:
 *
 *   1. `alternates.canonical` ở đây là canonical của trang chủ. Next gộp
 *      metadata theo tầng, nên mọi trang con KHÔNG tự khai canonical sẽ thừa
 *      hưởng '/' — tức là tự khai với Google rằng mình là bản sao của trang
 *      chủ, và bị loại khỏi chỉ mục. Vì vậy mỗi route khác đều phải tự đặt
 *      canonical của nó; `scripts/regression/seo-canonical.test.ts` canh
 *      đúng chuyện đó, đừng bỏ bài test ấy đi.
 *   2. Chữ trên trang là tiếng Việt thì metadata cũng phải tiếng Việt. Trước
 *      đây title/description/keywords đều là tiếng Trung và `og:locale` là
 *      zh_CN, trong khi `lang="vi"` — người tìm "lá số tử vi" không khớp
 *      được với title chữ Hán, mà Google cũng khó đoán trang này dành cho ai.
 */
export const metadata: Metadata = {
  title: 'Lá số Tử Vi theo hệ Nghê Hải Hạ · Luận giải bằng AI | Gieo Quẻ',
  description:
    'Lập lá số Tử Vi Đẩu Số miễn phí theo hệ Nghê Hải Hạ: 14 chính tinh, 12 cung, tứ hoá, đại hạn lưu niên. AI luận giải bằng tiếng Việt, kèm kho cổ tịch và lịch ngày hoàng đạo.',
  keywords: [
    'lá số tử vi', 'tử vi đẩu số', 'lập lá số tử vi', 'xem tử vi',
    'Nghê Hải Hạ', 'tứ hoá', '14 chính tinh', '12 cung',
    'ngày hoàng đạo', 'luận giải tử vi AI',
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lá số Tử Vi theo hệ Nghê Hải Hạ · Luận giải bằng AI',
    description:
      'Lập lá số Tử Vi Đẩu Số miễn phí theo hệ Nghê Hải Hạ, AI luận giải bằng tiếng Việt.',
    url: SITE_URL,
    siteName: 'Gieo Quẻ',
    locale: 'vi_VN',
    type: 'website',
  },
  // 站长平台验证（拿到 verification code 后填入对应字段，重新部署即可）
  verification: {
    /**
     * Mã xác minh Google Search Console của chính site này.
     *
     * Để thẳng trong mã, KHÔNG đọc từ biến môi trường nữa: trên Vercel còn
     * một biến NEXT_PUBLIC_GOOGLE_VERIFICATION mang mã cũ, mà biến thì thắng
     * giá trị mặc định — giữ lối đọc biến thì mã mới dán vào đây sẽ không bao
     * giờ ra tới trang, và lỗi ấy im lặng tới mức chỉ phát hiện được khi
     * Search Console báo xác minh hỏng.
     *
     * Mã này vốn công khai: nó nằm trong HTML của trang cho Google đọc, nên
     * để trong kho không có gì phải giữ kín.
     */
    google: '0bVuaUCZQb4qOEmrjSYSE59m4zvnCw7LKmHTMUAxGTs',
    // Bing Webmaster Tools: 在 https://www.bing.com/webmasters 添加站点后获取
    other: {
      // Không để mã mặc định cứng ở đây: mã xác minh là của riêng từng chủ
      // site, dán sẵn mã của người khác thì vừa vô dụng vừa xác minh hộ họ.
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
      // 百度站长（等执照下来后）
      'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
      // 360 站长（等执照下来后）
      '360-site-verification': process.env.NEXT_PUBLIC_360_VERIFICATION || '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');document.documentElement.setAttribute('data-theme',(t==='light'||t==='dark')?t:'dark');var l=localStorage.getItem('ziwei-locale');document.documentElement.setAttribute('lang',l==='zh'?'zh-CN':'vi');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <LocaleProvider>
            {/* Con trỏ là một con cá chép; thân đi theo vệt chuột */}
            <InkKoi />
            {children}
            <KoiToggle />
            <ThemeOrbToggle />
            <LocaleToggle />
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
