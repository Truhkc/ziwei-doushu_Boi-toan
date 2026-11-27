import type { Metadata } from 'next';

/**
 * `app/chart/page.tsx` là client component nên không khai được `metadata`.
 * Đặt ở layout của chính route này là cách Next cho phép, và cũng là chỗ
 * BẮT BUỘC phải có canonical riêng — thiếu nó là thừa hưởng canonical '/'
 * của layout gốc, tức tự báo với Google rằng trang này là bản sao trang chủ.
 */
export const metadata: Metadata = {
  title: 'Lập lá số Tử Vi · 14 chính tinh, 12 cung, tứ hoá | Gieo Quẻ',
  description:
    'Nhập ngày giờ sinh để lập lá số Tử Vi Đẩu Số theo hệ Nghê Hải Hạ. Hiệu chỉnh chân thái dương thời theo nơi sinh, an đủ 14 chính tinh, tứ hoá, đại hạn và lưu niên.',
  alternates: { canonical: '/chart' },
  openGraph: {
    title: 'Lập lá số Tử Vi · 14 chính tinh, 12 cung, tứ hoá',
    description: 'Nhập ngày giờ sinh để lập lá số Tử Vi Đẩu Số theo hệ Nghê Hải Hạ.',
    url: '/chart',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
