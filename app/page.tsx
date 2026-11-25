'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/LocaleProvider';
import type { Locale } from '@/lib/i18n/terms';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import InkMountains from '@/components/InkMountains';
import { useTheme, type Theme } from '@/components/ThemeProvider';

// ─── 滚动入场 wrapper ────────────────────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  // 之前的版本有 1px 实线 + 12px 渐变阴影，主题切换时形成清晰横线很硬。
  // 改为更柔和的 24px 渐变 + 低 opacity，section 衔接更自然。
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

// ─── 主星数据 ────────────────────────────────────────────
const STARS = [
  { name: '紫微' }, { name: '天机' }, { name: '太阳' }, { name: '武曲' },
  { name: '天同' }, { name: '廉贞' }, { name: '天府' }, { name: '太阴' },
  { name: '贪狼' }, { name: '巨门' }, { name: '天相' }, { name: '天梁' },
  { name: '七杀' }, { name: '破军' },
];

// ─── 功能模块 ────────────────────────────────────────────
const FEATURES_VI = [
  {
    tag: 'Hệ thống lập lá số',
    title: 'Tử Vi Đẩu Số\ntheo hệ Nghê Hải Hạ',
    subtitle: 'Không rút gọn, bám sát quy tắc giảng dạy',
    points: [
      'Khởi cục theo nạp âm ngũ hành, không dùng thuật toán rút gọn trên mạng',
      'An cung Mệnh nghịch theo giờ sinh, cung Thân thuận theo giờ sinh',
      'Chân thái dương thời: hiệu chỉnh theo kinh độ nơi sinh và phương trình thời gian',
      'Tháng nhuận bốn khẩu quyết, đổi ngày giờ Tý muộn — chọn được, không đóng cứng một phái',
    ],
  },
  {
    tag: 'Trình bày lá số',
    title: 'Đủ 14 chính tinh\nvà tứ hoá phi tinh',
    subtitle: 'Bố cục rõ, nhìn một lượt thấy ngay trục chính',
    points: [
      'Đủ 14 chính tinh an cung, quan hệ giữa các sao đọc được ngay',
      'Phụ tinh và sát tinh hiện cùng màn hình, không thiếu thông tin then chốt',
      'Bảy cấp độ sáng miếu / vượng / đắc / lợi / bình / bất / hãm để nhận nhanh mạnh yếu',
      'Chuyển qua lại bản mệnh, đại hạn và lưu niên; tứ hoá của từng tầng hiện chồng lên lá số',
    ],
  },
  {
    tag: 'Giải đoán AI',
    title: 'Luận sâu lá số\nkhông dừng ở an sao',
    subtitle: 'Tri thức hệ Nghê Hải Hạ × mô hình AI bạn tự cấu hình',
    points: [
      'Mệnh cục: từ chính tinh cung Mệnh, kết hợp tam phương tứ chính',
      'Sáu chiều: mệnh cục, tình cảm, sự nghiệp, tài vận, sức khoẻ, tính cách',
      'Theo dõi vận hạn: trọng điểm đại hạn 10 năm và cung lưu niên năm nay',
      'Hỏi tự do bằng tiếng Việt — AI trả lời theo đúng ngôn ngữ bạn hỏi',
    ],
  },
  {
    tag: 'Nhận diện cách cục',
    title: 'Tự động phát hiện\ncách cục trên lá số',
    subtitle: 'Tìm ra điều đã định sẵn trong cách phối tinh diệu',
    points: [
      'Hơn 40 cách cục cố định: Tử Phủ Đồng Cung, Sát Phá Lang, Cơ Nguyệt Đồng Lương, Phủ Tướng Triều Viên…',
      'Cách giáp như Phụ Bật Giáp Mệnh, Nhật Nguyệt Giáp Mệnh được phát hiện riêng',
      'Tứ hoá nhập cung Mệnh / Thiên Di được đánh dấu tự động',
      'Mỗi cách cục kèm điều kiện đã thoả, điểm cộng, cảnh báo phá cách và xuất xứ cổ tịch',
    ],
  },
];

const FEATURES_ZH = [
  {
    tag: '排盘体系',
    title: '倪海厦正宗\n紫微斗数',
    subtitle: '非简化版，严格遵循倪海厦老师传承',
    points: [
      '纳音五行局起盘，不采用网络简化算法',
      '命宫逆数生时、身宫顺数生时，严格对齐教学规则',
      '十四主星与四化飞星按原法推演，结构完整可复核',
    ],
  },
  {
    tag: '命盘呈现',
    title: '完整十四主星\n四化飞星',
    subtitle: '结构清晰，一眼看懂主轴与重点',
    points: [
      '十四主星完整入宫，主星关系清楚可读',
      '辅星与煞星同屏呈现，避免关键信息缺失',
      '庙旺利陷亮度分级，快速识别强弱',
      '点击任意主星即可查看倪海厦老师对该星的详细解读',
    ],
  },
  {
    tag: 'AI 解读',
    title: '深度解盘\n不止于算',
    subtitle: '倪海厦体系知识库 × Claude AI',
    points: [
      '命格分析：从命宫主星出发，结合三方四正，给出全面的性格与人生格局判断',
      '六大维度解读：事业方向、感情婚姻、财运模式、健康注意、家庭关系、子女缘分',
      '大限流年追踪：当前10年大限重点、今年流年宫位的具体提示与行动建议',
      '自由追问：针对你的命盘直接提问，「今年能换工作吗」「什么时候结婚运最好」',
    ],
  },
  {
    tag: '格局识别',
    title: '自动检测\n命盘格局',
    subtitle: '从星曜组合中发现你的命中注定',
    points: [
      '自动识别11种经典格局：紫府同宫、杀破狼格、机月同梁、廉相格、武曲七杀等',
      '辅弼夹命、日月夹命等特殊格局精准检测，并给出倪海厦体系下的标准解读',
      '四化入命宫迁移宫的特殊状况自动标注，提示需关注的人生议题',
      '格局按吉凶等级分层展示，让你一目了然自己命盘中的优势与挑战',
    ],
  },
];

const FEATURES: Record<Locale, typeof FEATURES_VI> = { vi: FEATURES_VI, zh: FEATURES_ZH };

/**
 * Các khu vực của trang, dùng cho dải điều hướng ở hero và ở footer.
 *
 * Bản gốc ở đây là lộ trình sản phẩm của dự án thượng nguồn (Thiên Kỷ /
 * Địa Kỷ / Nhân Kỷ, kèm tháng ra mắt). Đó là kế hoạch của họ, không phải
 * của site này, nên thay bằng đúng những route repo này thực sự phục vụ.
 *
 * /knowledge cố tình không có ở đây: trang danh sách chạy được nhưng mọi
 * link chi tiết đều 404, vì STAR_DB trong lib/ziwei/db-analysis.ts là bản
 * giữ chỗ rỗng (thư viện đoán ngữ không thuộc phạm vi mã nguồn mở).
 */
const SECTIONS_VI = [
  {
    key: 'chart',
    name: 'Lá số',
    en: 'Chart',
    desc: '14 chính tinh · 12 cung · tứ hoá · đại hạn lưu niên',
    status: 'ready' as const,
    when: 'Dùng được',
    icon: '◉',
    note: '',
    href: '/chart',
  },
  {
    key: 'heming',
    name: 'Hợp bàn',
    en: 'Compatibility',
    desc: 'Đối chiếu hai lá số · song cung Phu Thê và Phúc Đức',
    status: 'ready' as const,
    when: 'Dùng được',
    icon: '⊙',
    note: '',
    href: '/heming',
  },
  {
    key: 'library',
    name: 'Cổ tịch',
    en: 'Classics',
    desc: 'Toàn Thư · Toàn Tập · Cốt Tuỷ Phú · tìm toàn văn',
    status: 'ready' as const,
    when: 'Dùng được',
    icon: '⊕',
    note: '',
    href: '/library',
  },
];

const SECTIONS_ZH: typeof SECTIONS_VI = [
  {
    key: 'chart',
    name: '排盘',
    en: 'Chart',
    desc: '14 主星 · 12 宫 · 四化 · 大限流年',
    status: 'ready' as const,
    when: '可用',
    icon: '◉',
    note: '',
    href: '/chart',
  },
  {
    key: 'heming',
    name: '合盘',
    en: 'Compatibility',
    desc: '双盘对照 · 夫妻宫与福德宫联参',
    status: 'ready' as const,
    when: '可用',
    icon: '⊙',
    note: '',
    href: '/heming',
  },
  {
    key: 'library',
    name: '古籍',
    en: 'Classics',
    desc: '全书 · 全集 · 骨髓赋 · 全文检索',
    status: 'ready' as const,
    when: '可用',
    icon: '⊕',
    note: '',
    href: '/library',
  },
];

const SECTIONS: Record<Locale, typeof SECTIONS_VI> = { vi: SECTIONS_VI, zh: SECTIONS_ZH };

// ─── 倪海厦核心教义 ──────────────────────────────────────
const NI_TEACHINGS_VI = [
  {
    title: 'Mệnh làm gốc, tam phương làm dụng',
    body: 'Nghê Hải Hạ luôn nhấn mạnh: xem mệnh phải xem cung Mệnh trước. Chính tinh cung Mệnh quyết định cách cục cơ bản và tính cách bẩm sinh; tam phương (Tài Bạch, Quan Lộc, Thiên Di) quyết định "đất dụng võ" của người đó. Bốn cung liên động mới là bức tranh đầy đủ.',
  },
  {
    title: 'Cung trống mượn sao, không được bỏ qua',
    body: 'Điểm riêng của Nghê Hải Hạ là coi trọng cung đối. Cung nào trống phải mượn tinh diệu cung đối để luận. Đối diện cung Mệnh là cung Thiên Di, hai bên ảnh hưởng lẫn nhau — đây là chỗ người mới học hay bỏ sót.',
  },
  {
    title: 'Tứ hoá mới là bàn tay của vận mệnh',
    body: 'Tinh diệu chỉ là nền. Tứ hoá (hoá Lộc, hoá Quyền, hoá Khoa, hoá Kỵ) mới quyết định vận tốt xấu. Cùng một sao, mang hoá Lộc hay mang hoá Kỵ thì quỹ đạo đời người khác hẳn. Nghê Hải Hạ nhắc đi nhắc lại: không xem tứ hoá thì lá số mới giải được một nửa.',
  },
  {
    title: 'Đại hạn mười năm, vận có nhịp',
    body: 'Nghê Hải Hạ chia đời người thành 12 đại hạn, mỗi đại hạn 10 năm. Ông cho rằng ở những cung đại hạn khác nhau, cảnh ngộ hoàn toàn khác. Biết mình đang đi đại hạn nào, cung đó có tinh diệu gì, mới thực sự nắm được vận hiện tại.',
  },
];

const NI_TEACHINGS_ZH = [
  {
    title: '命宫为本，三方为用',
    body: '倪师始终强调，看命必先看命宫。命宫主星决定一个人的基本格局与天生性格，三方（财帛、官禄、迁移）则决定此人的「用武之地」。四宫联动才是完整的人生图景。',
  },
  {
    title: '对宫借星，不可忽视',
    body: '倪师的独到之处在于重视「对宫」。任何宫位若为空宫，必须借对宫星曜来论断，命宫的对面是迁移宫，两者互相影响，这是很多初学者容易忽略的关键。',
  },
  {
    title: '四化才是命运的手',
    body: '星曜只是基础，四化（化禄、化权、化科、化忌）才是决定运势好坏的关键。同一颗星，有化禄与有化忌，人生轨迹可以截然不同。倪师反复强调：不看四化，命盘只解了一半。',
  },
  {
    title: '大限十年，运势有节',
    body: '倪师将人生划分为12个大限，每个大限10年。他认为人在不同的大限宫位，际遇完全不同。了解自己现在走的是哪个大限、该宫位有何星曜，才能真正把握当下的运势。',
  },
];

const NI_TEACHINGS: Record<Locale, typeof NI_TEACHINGS_VI> = { vi: NI_TEACHINGS_VI, zh: NI_TEACHINGS_ZH };


// ─── 主题色彩 helper ─────────────────────────────────────
function useColors(theme: Theme) {
  const d = theme === 'dark';
  /**
   * Bảng màu "sơn thuỷ huyền ảo & ánh vàng kim".
   *
   * Tối  = bóng tối ngả lam chàm (xanh sương núi lúc chưa rạng), vàng kim bắt
   *        sáng nổi lên trên. Chàm và vàng bù trừ nhau, nên vàng tự phát sáng
   *        mà không phải tăng độ chói.
   * Sáng = giấy tuyên ngả vàng, chữ mực, nhấn kim nâu đủ đậm để đọc được.
   *
   * Chữ phụ ở nền tối ngả lam để lùi vào sương; chữ chính giữ chất giấy ấm.
   */
  return {
    bgBase:       d ? '#070C11'                                : '#F3EEE3',
    navBg:        d ? '#070C11'                                : '#F3EEE3',
    navBorder:    d ? 'rgba(243,236,220,0.06)'                 : 'rgba(20,17,13,0.10)',
    goldGrad:     d ? 'linear-gradient(160deg,#B9924A 0%,#F4DDA8 38%,#C9A860 68%,#E2C379 100%)'
                    : 'linear-gradient(160deg,#4A3A1E 0%,#8A6B35 42%,#5A4624 72%,#7A5F2E 100%)',
    goldSolid:    d ? '#E2C379'                                : '#7A5F2E',
    goldLine:     d ? 'rgba(226,195,121,0.36)'                 : 'rgba(122,95,46,0.34)',
    tagText:      d ? 'rgba(226,195,121,0.60)'                 : 'rgba(90,70,36,0.66)',
    textPrimary:  d ? '#EDE6D6'                                : '#221E18',
    textSecond:   d ? '#C3BCAB'                                : '#4A4238',
    textMuted:    d ? '#9FADB6'                                : '#6B6356',
    textFaint:    d ? 'rgba(237,230,214,0.46)'                 : '#99907F',
    accent:       d ? '#6E9EA8'                                : '#4A6B62',
    accentSoft:   d ? 'rgba(110,158,168,0.16)'                 : 'rgba(74,107,98,0.10)',
    cardBg:       d ? 'rgba(243,236,220,0.035)'                : 'rgba(251,247,238,0.86)',
    cardBorder:   d ? 'rgba(243,236,220,0.09)'                 : 'rgba(20,17,13,0.12)',
    cardShadow:   d ? '0 4px 32px rgba(0,0,0,0.45)'            : '0 4px 24px rgba(20,17,13,0.08)',
    featureBg:    d ? 'rgba(243,236,220,0.03)'                 : 'rgba(251,247,238,0.72)',
    featureBord:  d ? 'rgba(243,236,220,0.07)'                 : 'rgba(20,17,13,0.10)',
    glowTint:     d ? 'rgba(226,195,121,0.07)'                 : 'rgba(154,123,64,0.05)',
    glowBlue:     d ? 'rgba(96,140,164,0.10)'                  : 'rgba(74,107,98,0.05)',
    glowPurple:   d ? 'rgba(72,112,136,0.07)'                  : 'rgba(120,100,80,0.035)',
    niBg:         d ? 'rgba(243,236,220,0.035)'                : 'rgba(251,247,238,0.8)',
    niBorder:     d ? 'rgba(226,195,121,0.20)'                 : 'rgba(122,95,46,0.22)',
    niDivider:    d ? 'rgba(243,236,220,0.07)'                 : 'rgba(20,17,13,0.10)',
    niCardBg:     d ? 'rgba(243,236,220,0.035)'                : 'rgba(251,247,238,0.88)',
    niCardBord:   d ? 'rgba(243,236,220,0.07)'                 : 'rgba(20,17,13,0.10)',
    niCardShadow: d ? '0 2px 20px rgba(0,0,0,0.38)'            : '0 2px 16px rgba(20,17,13,0.07)',
    starBg:       d ? 'rgba(243,236,220,0.035)'                : 'rgba(251,247,238,0.7)',
    starBorder:   d ? 'rgba(226,195,121,0.22)'                 : 'rgba(122,95,46,0.26)',
    starText:     d ? 'rgba(226,195,121,0.74)'                 : 'rgba(90,70,36,0.72)',
    ctaBg:        d ? 'linear-gradient(135deg,#A4823C,#E2C379,#A4823C)'
                    : 'linear-gradient(135deg,#4A3A1E,#7A5F2E,#4A3A1E)',
    ctaText:      d ? '#070C11'                                : '#F7F2E6',
    footerText:   d ? 'rgba(243,236,220,0.10)'                 : '#B9A478',
    scrollLine:   d ? 'rgba(226,195,121,0.28)'                 : 'rgba(122,95,46,0.26)',
    scrollText:   d ? 'rgba(243,236,220,0.14)'                 : '#AE9B74',
    altSection:   d ? 'rgba(243,236,220,0.018)'                : 'rgba(251,247,238,0.4)',
    quoteBg:      d ? 'rgba(226,195,121,0.035)'                : 'rgba(251,247,238,0.9)',
  };
}


// ─── 四化简介数据 ─────────────────────────────────────────
const SIHUA_BRIEF_VI: Record<string, { attr: string; brief: string }> = {
  '化禄': { attr: 'Cát hoá · tăng ích', brief: 'Phúc tinh đáo cung, chủ tài vận và phúc khí được tăng. Việc thuộc cung đó hanh thông, năng lực mạnh lên — là hoá tinh được mong nhất trên lá số.' },
  '化权': { attr: 'Cát hoá · quyền uy', brief: 'Quyền lực tinh đáo cung, chủ nắm giữ và khả năng lãnh đạo. Cung đó chủ cứng rắn và quyết đoán, hợp nhập Quan Lộc hoặc Mệnh, chủ thực quyền trong sự nghiệp.' },
  '化科': { attr: 'Cát hoá · danh tiếng', brief: 'Khoa danh tinh đáo cung, chủ thanh danh và duyên quý nhân. Cung đó chủ văn danh và vận thi cử, có quý nhân nâng đỡ, hợp học thuật, thi cử, nơi công khai.' },
  '化忌': { attr: 'Hung hoá · trở ngại', brief: 'Kiếp số tinh đáo cung, chủ chấp niệm và trở ngại. Cung đó cần lưu tâm đặc biệt; bài học đời người của cung ấy sẽ thành thử thách đáng kể.' },
};

const SIHUA_BRIEF_ZH: Record<string, { attr: string; brief: string }> = {
  '化禄': { attr: '吉化·增益', brief: '福星到宫，主财运与福气增益。所在宫位事物顺遂，能力增强，是命盘中最受欢迎的化星。' },
  '化权': { attr: '吉化·权威', brief: '权力星到宫，主掌控与领导力。所在宫位主强势与决断，喜入官禄宫与命宫，主事业上的实权。' },
  '化科': { attr: '吉化·名誉', brief: '科名星到宫，主声誉与贵人缘。所在宫位主文名与考运，有贵人扶持，宜学术、考试与公开场合。' },
  '化忌': { attr: '凶化·阻碍', brief: '劫数星到宫，主执念与阻碍。所在宫位需特别关注，该宫人生课题将成为重要考验。' },
};

const SIHUA_BRIEF: Record<Locale, typeof SIHUA_BRIEF_VI> = { vi: SIHUA_BRIEF_VI, zh: SIHUA_BRIEF_ZH };


// ─── 主星简介数据 ─────────────────────────────────────────
const STAR_BRIEF_VI: Record<string, { attr: string; brief: string }> = {
  '紫微': { attr: 'Thổ · đế vương tinh', brief: 'Thiên hoàng quý tinh, thống ngự các sao. Toạ mệnh có khí cô ngạo, chủ quyền uy hiển đạt, bẩm sinh có khí chất lãnh đạo, hợp vị trí đứng mũi chịu sào.' },
  '天机': { attr: 'Mộc · trí tuệ tinh', brief: 'Ích thọ tinh, chủ mưu trí và biến động. Thông minh lanh lợi, giỏi trù hoạch, tâm tư tinh tế, hợp nghề hoạch định, tư vấn, kỹ thuật.' },
  '太阳': { attr: 'Hoả · Quan Lộc chủ', brief: 'Chủ tinh Quan Lộc, chủ thanh danh và danh vọng. Hào phóng rộng lượng, coi trọng hình ảnh công chúng, lợi quan trường và công chức; nam mệnh lực mạnh, nhập miếu thì quang minh lỗi lạc.' },
  '武曲': { attr: 'Kim · Tài Bạch chủ', brief: 'Chủ tinh Tài Bạch, chủ tài chính và quyết đoán. Ý chí kiên định, hành động quả cảm, hợp tài chính, ngân hàng, quân cảnh; là sao cô khắc, lợi kết hôn muộn.' },
  '天同': { attr: 'Thuỷ · phúc tinh', brief: 'Chủ tinh Phúc Đức, chủ hưởng thụ và nhân duyên. Tính tình ôn hoà, nhân duyên rất tốt, coi trọng chất lượng sống, tình cảm tinh tế, vận hậu vận tốt.' },
  '廉贞': { attr: 'Hoả · tài nghệ tinh', brief: 'Thứ đào hoa tinh, chủ tài nghệ và tình dục. Tài hoa nổi bật, tình cảm phong phú, hợp nghệ thuật và chính giới; đa tài nhưng cần phòng thị phi đào hoa.' },
  '天府': { attr: 'Thổ · tài khố tinh', brief: 'Nam Đẩu chủ tinh, chủ kho tài và tích luỹ. Vững vàng bảo thủ, khả năng quản tài mạnh, là lực ổn định của lá số, hợp quản lý tài chính và hành chính.' },
  '太阴': { attr: 'Thuỷ · Điền Trạch chủ', brief: 'Chủ tinh Điền Trạch, chủ tài phú và âm nhu. Tinh tế dịu dàng, cảm thụ mạnh, nữ mệnh càng tốt, lợi bất động sản và tích luỹ, hợp văn nghệ hoặc dịch vụ.' },
  '贪狼': { attr: 'Mộc Thuỷ · đào hoa', brief: 'Đào hoa tinh, chủ dục vọng và tài nghệ. Đa tài đa nghệ, dục vọng mạnh, giao tiếp năng động, hợp nghệ thuật, quan hệ công chúng, thương mại; nhân duyên rất tốt.' },
  '巨门': { attr: 'Thuỷ · thị phi tinh', brief: 'Ám tinh, chủ khẩu tài và thị phi. Khẩu tài nổi bật, năng lực biện luận mạnh, hợp luật sư, giáo dục, truyền thông; chú ý khẩu thiệt thị phi, lấy biện tài lập thân.' },
  '天相': { attr: 'Thuỷ · ấn tinh', brief: 'Ấn tinh, chủ phụ tá và ấn thụ. Giỏi điều phối, coi trọng lễ tiết, chính trực thủ pháp, hợp tham mưu, hành chính, pháp lý; vận quý nhân tốt.' },
  '天梁': { attr: 'Thổ · ấm tinh', brief: 'Ấm tinh, chủ lão thành và che chở. Chính trực vững vàng, lòng từ bi mạnh, hợp y tế, công tác xã hội, lĩnh vực tôn giáo.' },
  '七杀': { attr: 'Kim Hoả · tướng tinh', brief: 'Tướng tinh, chủ cương liệt và khai sáng. Tính cách cương nghị, hành động mạnh, dám thách thức, hợp khởi nghiệp, quân cảnh, ngành cạnh tranh.' },
  '破军': { attr: 'Thuỷ · hao tinh', brief: 'Hao tinh, chủ biến động và khai phá. Dám đột phá, không ngại thay đổi, một đời biến động nhiều nhưng có khí phách, hợp việc khai phá, đi con đường chưa ai đi.' },
};

const STAR_BRIEF_ZH: Record<string, { attr: string; brief: string }> = {
  '紫微': { attr: '土·帝王星', brief: '天皇贵星，统御众星。坐命者有孤傲之气，主权威显达，天生具备领导气质，适合独当一面的领导岗位。' },
  '天机': { attr: '木·智慧星', brief: '益寿星，主智谋与变动。聪慧机灵，善于筹谋，心思细腻，宜从事策划、顾问、技术类工作。' },
  '太阳': { attr: '火·官禄主', brief: '官禄主星，主声誉与名望。慷慨大度，重视公众形象，利官场与公职，男命力强，入庙时光明磊落。' },
  '武曲': { attr: '金·财帛主', brief: '财帛主星，主财务与决断。意志坚定，行动果敢，适合财务、金融、军警类职业，孤克之星，利晚婚。' },
  '天同': { attr: '水·福星', brief: '福德主星，主享乐与人缘。性情温和，人缘极好，注重生活品质，感情细腻，晚年运势佳。' },
  '廉贞': { attr: '火·才艺星', brief: '次桃花星，主才艺与情欲。才华出众，感情丰富，适合艺术、政界，多才多艺但需防桃花是非。' },
  '天府': { attr: '土·财库星', brief: '南斗主星，主财库与积蓄。稳重保守，理财能力强，是命盘的稳定力量，适合管理财务与行政。' },
  '太阴': { attr: '水·田宅主', brief: '田宅主星，主财富与阴柔。细腻温柔，感受力强，女命尤佳，利不动产与积蓄，适合文艺或服务业。' },
  '贪狼': { attr: '木水·桃花', brief: '桃花星，主欲望与才艺。多才多艺，欲望旺盛，社交活跃，宜从事艺术、公关、商业，人缘极好。' },
  '巨门': { attr: '水·是非星', brief: '暗星，主口才与是非。口才出众，思辨能力强，适合律师、教育、媒体，注意口舌是非，以辩才立身。' },
  '天相': { attr: '水·印星', brief: '印星，主辅佐与印绶。善于协调，重视礼节，正直守法，适合幕僚、行政、法律类工作，贵人运佳。' },
  '天梁': { attr: '土·荫星', brief: '荫星，主老成与荫蔽。正直稳重，慈悲心强，老天爷会保佑，适合医疗、社会工作、宗教领域。' },
  '七杀': { attr: '金火·将星', brief: '将星，主刚烈与开创。性格刚毅，行动力强，勇于挑战，适合创业、军警、竞争性行业，逢凶化吉。' },
  '破军': { attr: '水·耗星', brief: '耗星，主变动与开拓。勇于突破，不惧改变，一生变动大但有魄力，适合开拓型工作，走别人没走过的路。' },
};

const STAR_BRIEF: Record<Locale, typeof STAR_BRIEF_VI> = { vi: STAR_BRIEF_VI, zh: STAR_BRIEF_ZH };


/** Phần chữ của khối Thiên–Địa–Nhân; màu sắc lấy từ bảng màu trong component. */
const TRIO_TEXT: Record<Locale, { glyph: string; label: string; sub: string; desc: string }[]> = {
  vi: [
    {
      glyph: 'Thiên', label: 'Vận mệnh tiên thiên', sub: 'Lá số · tinh diệu · ngũ hành',
      desc: 'Thứ Tử Vi Đẩu Số chỉ ra là cách cục tiên thiên của một người — thế an sao, số ngũ hành cục, chính tinh cung Mệnh, tất cả do thời điểm sinh quyết định. Đó mới là một phần ba của vận mệnh, là nền của đời người chứ không phải toàn cảnh.',
    },
    {
      glyph: 'Địa', label: 'Môi trường địa lý', sub: 'Vùng đất · phong thuỷ · môi trường',
      desc: 'Môi trường địa lý, thành phố, quốc gia, thế phong thuỷ, cho tới hoàn cảnh gia đình và cấu trúc xã hội — tất cả hợp thành chiều thứ hai. Cùng một lá số, sinh ở nơi khác nhau thì cảnh ngộ có thể khác một trời một vực.',
    },
    {
      glyph: 'Nhân', label: 'Tâm niệm con người', sub: 'Ý chí · lựa chọn · hành động',
      desc: 'Ý chí, tâm thái, lựa chọn và hành động của mỗi người mới là lực chủ động nhất để đổi vận. Nghê Hải Hạ nhấn mạnh: hiểu lá số là để sống cho tốt hơn, không phải ngồi chờ số phận an bài. Tự mình tinh tiến là cách phá cục mạnh nhất.',
    },
  ],
  zh: [
    {
      glyph: '天', label: '先天命运', sub: '命盘 · 星曜 · 五行',
      desc: '紫微斗数所揭示的，是一个人的先天命盘格局——出生时间决定的星曜布局、五行局数、命宫主星。这只是命运的三分之一，是人生的底色，而非全貌。',
    },
    {
      glyph: '地', label: '地理环境', sub: '地域 · 风水 · 环境',
      desc: '你所在的地理环境、城市、国家、风水格局，乃至家庭背景与社会结构，共同构成了命运的第二个维度。同一命盘，生在不同地方，际遇可以天壤之别。',
    },
    {
      glyph: '人', label: '人心意念', sub: '意志 · 选择 · 行动',
      desc: '个人的意志、心态、选择与行动，才是改变命运最主动的力量。倪师强调：了解命盘是为了更好地做人，而不是坐等命运安排。精进自己，是最强的破局之道。',
    },
  ],
};

/**
 * Tiểu sử Nghê Hải Hạ. Bản gốc có <strong>/<em> lồng trong câu; ở đây tách chữ
 * ra dữ liệu nên chỉ giữ nhãn in đậm đầu đoạn, phần thân để nguyên văn.
 */
const BIO: Record<Locale, {
  title: string; sub1: string; sub2: string;
  stats: { label: string; value: string; sub: string }[];
  paras: { label: string; body: string }[];
  disclaimer: string;
}> = {
  vi: {
    title: 'Thầy Nghê Hải Hạ',
    sub1: 'Một trong những bậc thầy Trung y và thuật số có ảnh hưởng nhất trong cộng đồng người Hoa đương đại',
    sub2: 'Người sáng lập Học viện Trung y Hán Đường tại Mỹ · để lại hai hệ giảng dạy «Nhân Kỷ» và «Thiên Kỷ»',
    stats: [
      { label: 'Sinh', value: '1954', sub: 'Đài Loan' },
      { label: 'Mất', value: '2012', sub: '31/1 · thọ 58 tuổi' },
      { label: 'Truyền thừa', value: 'Tử Vi Đẩu Số', sub: 'Trung y kinh phương · Kinh Dịch' },
    ],
    paras: [
      { label: 'Tiểu sử', body: 'Nghê Hải Hạ (1954–2012) sinh tại Đài Loan, sớm theo học nhiều danh y Trung y, chuyên sâu phái kinh phương (truyền thừa «Thương Hàn Luận»). Trung niên sang Mỹ hành nghề, lập Học viện Trung y Hán Đường, hơn hai mươi năm giảng dạy Trung y và thuật số truyền thống một cách hệ thống. Ngày 31 tháng 1 năm 2012 ông mất vì ung thư gan tại Đài Loan, thọ 58 tuổi.' },
      { label: 'Hệ giảng dạy', body: 'Ông sắp xếp cả đời sở học thành hai chuỗi giảng công khai. «Nhân Kỷ» gồm «Châm Cứu Đại Thành», «Thần Nông Bản Thảo Kinh», «Hoàng Đế Nội Kinh», «Thương Hàn Luận», «Kim Quỹ Yếu Lược» — đặt nền cho con đường học Trung y trọn vẹn. «Thiên Kỷ» gồm Tử Vi Đẩu Số và «Kinh Dịch» — là thành quả hệ thống hoá việc nghiên cứu thuật số. Hai phần hợp lại là di sản đầy đủ nhất ông để lại.' },
      { label: 'Lập trường Tử Vi', body: 'Về Tử Vi Đẩu Số, ông thuộc Nam phái Tam Hợp, chủ trương «lấy cung Mệnh làm gốc, lấy tam phương tứ chính làm dụng, lấy tứ hoá làm cương». Trong khoá «Thiên Kỷ» ông nói thẳng: phi tinh bay tới bay lui quá rắc rối, không làm thứ đó, bởi đại đạo chí giản. Lập trường này phân biệt rõ ông với phái Phi Tinh rườm rà.' },
      { label: 'Thái độ trị học', body: 'Ông phản đối học thuộc lòng khẩu quyết, nhấn mạnh «hiểu nguyên lý hơn thuộc lòng», «logic kiểm chứng được hơn huyền học thần bí». Thái độ đó đưa Tử Vi Đẩu Số từ một hệ thống khép kín truyền riêng thầy trò sang hệ tri thức hiện đại: có hệ thống, kiểm chứng được, học được.' },
      { label: 'Ảnh hưởng đương đại', body: 'Video bài giảng của ông lan rộng trên nhiều nền tảng, được thế hệ mới yêu mệnh lý và Trung y xem là phần nhập môn bắt buộc. Ông không chỉ là người kế thừa Tử Vi Đẩu Số, mà còn là một trong những nhân vật then chốt đưa mệnh lý và Trung y truyền thống vào hệ tri thức hiện đại.' },
    ],
    disclaimer: 'Mọi nội dung giải đoán trên trang này dựa trên giáo trình công khai «Thiên Kỷ» của Nghê Hải Hạ, bản Minh của «Tử Vi Đẩu Số Toàn Thư» và cổ tịch phái Tam Hợp truyền thống, chỉ để tham khảo về văn hoá và phát triển bản thân. Bản thân ông không có bất kỳ liên hệ thương mại nào với trang này.',
  },
  zh: {
    title: '倪海厦老师',
    sub1: '当代华人圈最具影响力的中医与术数大家之一',
    sub2: '美国汉唐中医学院创办人 ·「人纪」「天纪」两大教学体系传世',
    stats: [
      { label: '生于', value: '1954年', sub: '台湾' },
      { label: '离世', value: '2012年', sub: '1月31日 · 享年58' },
      { label: '传承', value: '紫微斗数', sub: '经方中医 · 易经' },
    ],
    paras: [
      { label: '生平履历', body: '倪海厦先生（1954–2012）出生于台湾，早年师承多位中医名家，专研经方派（《伤寒论》传承）。中年赴美行医，在美国创立汉唐中医学院，二十余年间系统传授中医与传统术数。2012 年 1 月 31 日因肝癌在台湾离世，享年 58 岁。' },
      { label: '教学体系', body: '倪师将毕生所学整理为两大公开教学系列。「人纪」涵盖《针灸大成》《神农本草经》《黄帝内经》《伤寒论》《金匮要略》——这是「人之纪」，奠定中医学习的完整路径；「天纪」涵盖紫微斗数与《易经》——这是「天之纪」，是术数研究的体系化成果。两者相合，是倪师留给后世最完整的传承。' },
      { label: '紫微立场', body: '倪师在紫微斗数上明确属南派三合派，主张「以命宫为本、以三方四正为用、以四化为纲」。他在《天纪》课程中明言：「飞星（四化）飞来飞去太复杂，不搞这个，毕竟大道至简」——这一立场将其与繁琐的飞星派清晰区分。' },
      { label: '治学态度', body: '倪师反对死记硬背口诀，强调「理解原理胜过背诵」「逻辑可复核胜过神秘玄学」。这种态度让紫微斗数从师徒密传的封闭体系，走向系统化、可验证、可学习的现代知识体系。' },
      { label: '当代影响', body: '倪师的讲课视频在 B 站、YouTube 与各大平台广泛流传，是新一代命理与中医爱好者公认的入门必修。他不仅是紫微斗数的传承者，更是把传统命理与中医带入现代知识体系的关键人物之一。' },
    ],
    disclaimer: '本平台所有解读基于倪师《天纪》公开教学讲义、《紫微斗数全书》明版、传统三合派古籍整理而成，仅作文化与个人成长参考。倪师本人与本平台无任何商业关联。',
  },
};

// ─── 功能视觉装饰 ────────────────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  const { t, term, sihua, locale } = useI18n();

  /** Khoá của SIHUA_BRIEF là '化禄'…, còn sihua() nhận '禄' — bóc tiền tố rồi mới tra. */
  const sihuaLabel = (k: string) => (k.startsWith('化') ? sihua(k.slice(1)) : term(k));

  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-72 mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {isActive ? '★' : ''}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>{t('home.niMethod')}</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[locale][sel] ?? SIHUA_BRIEF[locale][sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {[
          { group: t('home.starGroup.ziwei'), stars: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'] },
          { group: t('home.starGroup.tianfu'), stars: ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{group.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {term(s)}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>{t('home.sihuaFlying')}</div>
          <div className="flex gap-2 flex-wrap">
            {[['化禄', 'rgba(52,211,153,0.7)'], ['化权', 'rgba(96,165,250,0.7)'], ['化科', 'rgba(250,204,21,0.7)'], ['化忌', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {sihuaLabel(label)}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{sihuaLabel(sel ?? '')}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{selInfo.attr}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{selInfo.brief}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      ...(locale === 'zh'
        ? [
            { role: 'user', text: '我今年的事业运势如何？' },
            { role: 'ai', text: '命宫天机化禄，今年大限走官禄宫，三方有左辅相助，事业有贵人提携，适合主动拓展…' },
            { role: 'user', text: '什么时候感情运最好？' },
          ]
        : [
            { role: 'user', text: 'Vận sự nghiệp năm nay của tôi thế nào?' },
            { role: 'ai', text: 'Cung Mệnh có Thiên Cơ hoá Lộc, đại hạn năm nay đi cung Quan Lộc, tam phương có Tả Phù trợ giúp — sự nghiệp có quý nhân nâng đỡ, hợp chủ động mở rộng…' },
            { role: 'user', text: 'Khi nào vận tình cảm tốt nhất?' },
          ]),
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      ...(locale === 'zh'
        ? [
            { name: '杀破狼格', desc: '开创进取之命', ok: true },
            { name: '廉相格', desc: '行政印绶之格', ok: true },
            { name: '化忌入命', desc: '需关注心理课题', ok: false },
          ]
        : [
            { name: 'Sát Phá Lang', desc: 'Mệnh khai sáng tiến thủ', ok: true },
            { name: 'Liêm Trinh Thiên Tướng', desc: 'Cách hành chính ấn thụ', ok: true },
            { name: 'Hoá Kỵ nhập Mệnh', desc: 'Cần lưu tâm bài học nội tâm', ok: false },
          ]),
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{p.name}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>
          {t('home.patternsCount')}
        </div>
      </div>
    );
  }

  return null;
}

// ─── 主页 ─────────────────────────────────────────────────
export default function HomePage() {
  const { t, term, locale } = useI18n();
  const router = useRouter();
  const { theme } = useTheme();
  const c = useColors(theme);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // 把 body / html 背景同步到 home 主题色，消除半透明 nav 透出 #fafaf9 的色差
  // useLayoutEffect 保证在浏览器绘制前同步更新，避免与根 div 的 transition 不同步
  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    // Nền lấy từ biến CSS, không lấy từ state React: server luôn dựng sẵn
    // `dark`, nên nếu tô bằng style thì người quay lại với lựa chọn nền sáng
    // sẽ thấy trang tối cho tới lúc bấm lại — React không vá chênh lệch
    // thuộc tính khi hydrate. Script chống nháy đã đặt data-theme từ trước
    // khi vẽ, nên var(--bg-0) ra đúng màu ngay khung hình đầu.
    <div style={{ background: 'var(--bg-0)', transition: 'background 0.35s ease' }} className="overflow-x-hidden">
      <StarField />

      {/* Quầng sáng toàn trang. Vệt vàng đặt lệch phải, trên cao — cùng một
          nguồn sáng với bức sơn thuỷ ở hero; hai vệt chàm còn lại là bóng. */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 left-[70%] -translate-x-1/2 w-[980px] h-[620px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-[14%] w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 left-[36%] w-80 h-80 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── 顶部导航 ── nav 与 hero 同色（c.bgBase），无 blur 无 border，彻底无色差带 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{
          background: 'var(--bg-0)',
        }}>
        <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium transition-colors duration-300 flex-shrink-0"
          style={{ color: c.goldSolid }}>
          {t('home.nav.brand')}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => router.push('/heming')}
            className="nav-link text-[11px] sm:text-xs px-1 py-1 tracking-[0.18em]"
            style={{ color: c.textMuted, ['--nav-rule' as string]: c.navBorder }}>
            {t('home.nav.heming')}
          </button>
          <span className="mx-1 sm:mx-2 text-[10px]" style={{ color: c.navBorder }}>·</span>
          <button
            onClick={() => router.push('/chart')}
            className="nav-link text-[11px] sm:text-xs px-1 py-1 tracking-[0.18em]"
            style={{ color: c.goldSolid, ['--nav-rule' as string]: c.goldLine }}>
            {t('home.cta')}
          </button>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82svh] lg:min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pb-24 pt-10">
        {/* Viễn sơn khép chân màn hero */}
        <InkMountains height={520} />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative w-full mx-auto mt-6"
        >
          <div className="mx-auto w-full max-w-[1100px] px-2 sm:px-6">
            <div className="flex items-start justify-between gap-8">
              {/* ── Khối chữ, dồn về trái để chừa khoảng trống bên phải ── */}
              <div className="min-w-0 flex-1 text-left">
                <motion.div
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="text-[10px] tracking-[0.45em]" style={{ color: c.tagText }}>
                    {t('home.hero.tag')}
                  </span>
                  <div className="h-px flex-1 max-w-[180px]"
                    style={{ background: `linear-gradient(to right, ${c.goldLine}, transparent)` }} />
                </motion.div>

                {/* Tiêu đề: phủ nhũ kim, bắt sáng cùng hướng với bức sơn thuỷ */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="ink-title gold-lit leading-[0.95] mb-6"
                  style={{
                    fontSize: 'clamp(52px, 9.5vw, 128px)',
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                  }}
                >
                  {t('home.nav.brand')}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="ink-title text-base md:text-xl mb-1.5"
                  style={{ color: c.textSecond, letterSpacing: '0.06em' }}
                >
                  {t('home.hero.line1')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-[11px] md:text-xs tracking-[0.34em] mb-7"
                  style={{ color: c.textMuted, opacity: 0.8 }}
                >
                  {t('home.hero.line2')}
                </motion.p>

                {/* Lạc khoản: tên 14 chính tinh viết liền một dòng, không khung viền */}
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.95 }}
                  className="max-w-[760px] text-[10px] md:text-[11px] leading-[2.2] mb-10"
                  style={{ color: c.starText, letterSpacing: '0.16em' }}
                >
                  {STARS.map(st => term(st.name)).join('  ·  ')}
                </motion.p>

                {/* Lời mời: chữ cùng một nét bút gạch dưới, không phải viên thuốc */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  onClick={() => router.push('/chart')}
                  className="brush-cta ink-title group relative inline-block pb-2 mt-2"
                  style={{ color: c.goldSolid, fontSize: '19px', letterSpacing: '0.2em' }}
                >
                  {t('home.cta')}
                  <svg
                    className="brush-stroke absolute left-0 w-full"
                    style={{ bottom: -4, height: 10, overflow: 'visible' }}
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M2,7 C34,3.4 62,8.2 96,5.2 C132,2 164,7.4 198,4"
                      fill="none"
                      stroke={c.goldSolid}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* ── Lạc khoản dọc, treo ngay cạnh tiêu đề như trên tranh ── */}
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.1 }}
                className="hidden md:flex flex-col items-center gap-4 pt-2 shrink-0"
              >
                <div className="w-px h-20"
                  style={{ background: `linear-gradient(to bottom, transparent, ${c.goldLine})` }} />
                <div
                  className="ink-seal flex-col leading-none"
                  style={{ width: 44, height: 44, gap: 1, fontSize: 12.5, paddingTop: 1 }}
                >
                  {t('home.seal').split('|').map(line => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
                <div className="w-px h-10"
                  style={{ background: `linear-gradient(to top, transparent, ${c.goldLine})` }} />
              </motion.div>
            </div>

            {/* Một câu duy nhất, đặt thấp và nhỏ, như chú thích dưới tranh */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-10 max-w-[520px] text-[12px] leading-relaxed"
              style={{ color: c.textFaint }}
            >
              {t('home.hero.sub')}
            </motion.p>
          </div>
        </motion.div>

        {/* 滚动提示（绝对定位，不影响 hero opacity 计算） */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: c.scrollText }}>{t('home.scrollMore')}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${c.scrollLine}, transparent)` }} />
        </motion.div>
      </section>

      {/* ══ 哲学引言 ══════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #020810 0%, #020810 6%, #030a18 22%, #0d0820 40%, #0a0618 68%, #030a18 86%, #020810 100%)'
              : 'linear-gradient(to bottom, #f5efe0 0%, #f5efe0 6%, #c08055 18%, #6a2810 32%, #1e0a02 50%, #1e0a02 70%, #6a2810 84%, #f5efe0 100%)',
            transition: 'background 0.4s ease',
          }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-bold" style={{ fontSize: 'clamp(220px, 38vw, 460px)', color: 'rgba(212,168,67,0.012)', lineHeight: 1, fontFamily: 'serif' }}>命</span>
        </div>
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.45))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>{t('home.mingVanQuan')}</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.45))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {[
              { text: t('home.scroll.l1'), size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: t('home.scroll.l2'), size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: t('home.scroll.l3'), size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {line.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold`}
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>
              {t('home.scroll.end')}
            </motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 大学习板块时间轴 ════════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.03) 50%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.04) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>Curriculum</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>
            {t('home.sections.title')}
          </div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>
            {t('home.sections.sub')}
          </div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          {/* 横向连接线（仅桌面）*/}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />

          {/* 纵向连接线（仅手机）—— 圆点贴在线上，做"地铁线路图"风格 */}
          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-4">
            {SECTIONS[locale].map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  {/* 节点圆 */}
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : (theme === 'dark' ? 'rgba(184,146,42,0.05)' : '#fdf8ee'),
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? '#fff' : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{s.icon}</span>
                    {ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  {/* 文字组：手机端右排单列；桌面端居中堆叠 */}
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    {/* 顶行：时间标签 + 板块名 + note（手机端 inline；桌面端依然分行） */}
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {s.when}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {s.name}
                      </div>
                      {s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                    {/* 桌面专属 note（手机已在顶行 inline 展示）*/}
                    {s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {s.note}
                      </div>
                    )}
                    {/* 简介 */}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 功能详解 ══════════════════════════════════════ */}
      <section className="relative z-10">
        {FEATURES[locale].map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* 文字区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{feature.tag}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {feature.title}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{feature.subtitle}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{point}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
                {/* 视觉装饰区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══ 天·地·人 三分理论 ════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Ni Haixia · Philosophy</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                {t('home.trio.title')}
              </h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>
                {t('home.trio.sub1')}<br />
                {t('home.trio.sub2')}
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {TRIO_TEXT[locale].map((text, i) => ({
              ...text,
              pct: '⅓',
              ...[
                { color: c.goldSolid, borderColor: c.goldLine },
                { color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)' },
                { color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)' },
              ][i],
            })).map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl font-bold leading-none" style={{ color: item.color }}>{item.glyph}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>of life</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>
                {t('home.trio.quote')}
              </p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>— {t('home.niName')}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ 倪海厦介绍 ════════════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Master · 1953 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                {BIO[locale].title}
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>
                {BIO[locale].sub1}<br />
                {BIO[locale].sub2}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {BIO[locale].stats.map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{item.label}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{item.value}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                {BIO[locale].paras.map(para => (
                  <p key={para.label}>
                    <strong style={{ color: c.goldSolid }}>{para.label}</strong>
                    {locale === 'zh' ? '：' : ': '}
                    {para.body}
                  </p>
                ))}
                <p style={{ fontSize: '11px', color: c.textMuted, fontStyle: 'italic', marginTop: '12px' }}>
                  {BIO[locale].disclaimer}
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NI_TEACHINGS[locale].map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{teaching.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{teaching.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 合盘入口 ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Compatibility · Analysis</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>
                {t('home.heming.title')}
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>
                {t('home.heming.sub1')}<br className="hidden md:block" />
                {t('home.heming.sub2')}
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {[t('home.heming.chip1'), t('home.heming.chip2'), t('home.heming.chip3'), t('home.heming.chip4')].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(140,100,20,0.1)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>
                {t('home.heming.cta')}
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ 最终 CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>{t('home.final.tag')}</p>
          <h2 className={`ink-title grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
            {t('home.final.title1')}<br />{t('home.final.title2')}
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>
            {t('home.final.sub1')}<br />
            {t('home.final.sub2')}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>
            {t('home.final.cta')}
          </motion.button>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <motion.a
              href="/library"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              {t('home.link.library')}
            </motion.a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>

        {/* 4 板块导航占位（已上线 + 即将开放）*/}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>
            Các khu vực của trang
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {SECTIONS[locale].map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={s.href}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {s.when}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>
            {t('home.footer.line1')}
          </p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>
            {t('home.footer.line2')}<br className="sm:hidden" />
            {t('home.footer.line3')}
          </p>
          <p className="text-[10px] tracking-wider" style={{ color: c.footerText }}>
            <a href="/terms" style={{ color: c.footerText, textDecoration: 'underline' }}>{t('home.footer.terms')}</a>
            {' · '}
            <a href="/privacy" style={{ color: c.footerText, textDecoration: 'underline' }}>{t('home.footer.privacy')}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
