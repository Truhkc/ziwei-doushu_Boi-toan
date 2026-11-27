import type { Metadata } from 'next';

/**
 * Trang xem thử nội bộ: KHÔNG cho vào chỉ mục. Nó không phải nội dung dành
 * cho người tìm kiếm, mà lọt vào chỉ mục thì còn hút mất thứ hạng của những
 * trang thật.
 */
export const metadata: Metadata = {
  title: 'Xem thử',
  robots: { index: false, follow: false },
  alternates: { canonical: '/preview' },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
