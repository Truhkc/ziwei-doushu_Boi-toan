import type { Metadata } from 'next';

/** Xem ghi chú ở app/chart/layout.tsx về lý do metadata nằm ở layout. */
export const metadata: Metadata = {
  title: 'Ngày hoàng đạo · La bàn chọn ngày, nên kiêng | Gieo Quẻ',
  description:
    'Tra ngày hoàng đạo hay hắc đạo theo lịch cổ truyền: thiên thần trực nhật, trực kiến trừ, việc nên làm và nên kiêng, ngày xung. Xoay la bàn để đổi ngày, hoặc chọn ngày tốt theo từng việc.',
  alternates: { canonical: '/lich' },
  openGraph: {
    title: 'Ngày hoàng đạo · La bàn chọn ngày, nên kiêng',
    description: 'Tra ngày hoàng đạo hay hắc đạo, việc nên làm và nên kiêng, chọn ngày tốt theo việc.',
    url: '/lich',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function LichLayout({ children }: { children: React.ReactNode }) {
  return children;
}
