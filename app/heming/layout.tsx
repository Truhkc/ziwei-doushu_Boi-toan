import type { Metadata } from 'next';

/** Xem ghi chú ở app/chart/layout.tsx về lý do metadata nằm ở layout. */
export const metadata: Metadata = {
  title: 'Hợp bàn Tử Vi · Đối chiếu hai lá số | Gieo Quẻ',
  description:
    'Đối chiếu hai lá số Tử Vi Đẩu Số: song cung Phu Thê và Phúc Đức, tương tác tứ hoá giữa hai bàn, luận duyên hợp bằng AI tiếng Việt.',
  alternates: { canonical: '/heming' },
  openGraph: {
    title: 'Hợp bàn Tử Vi · Đối chiếu hai lá số',
    description: 'Đối chiếu hai lá số Tử Vi: song cung Phu Thê và Phúc Đức, tương tác tứ hoá.',
    url: '/heming',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function HemingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
