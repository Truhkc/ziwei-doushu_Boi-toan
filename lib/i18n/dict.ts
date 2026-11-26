/**
 * lib/i18n/dict —— từ điển chuỗi giao diện (tiếng Việt / tiếng Trung)
 *
 * Chỉ chứa chữ của giao diện. Chuyên danh mệnh lý (tên sao, tên cung, tứ hoá,
 * can chi, cách cục) nằm ở terms.ts và đi qua term() — chúng là dữ liệu engine
 * sinh ra lúc chạy, không phải chuỗi tĩnh.
 *
 * Bản tiếng Trung là nguyên văn của dự án thượng nguồn, giữ nguyên để người
 * dùng gạt công tắc về 中文 là thấy đúng giao diện gốc.
 *
 * Chỗ nào cần chèn giá trị thì dùng {tên}; t() thay bằng vars tương ứng.
 */

export interface Entry {
  vi: string;
  zh: string;
}

export const UI = {
  // ── Công tắc chung ───────────────────────────────────────
  'common.lang.toggleLabel': { vi: 'Chuyển sang tiếng Trung', zh: '切换到越南语' },
  'common.lang.short': { vi: 'VI', zh: '中' },
  'common.theme.dark': { vi: 'Tối', zh: '暗色' },
  'common.theme.light': { vi: 'Sáng', zh: '亮色' },
  'common.theme.toLight': { vi: 'Chuyển giao diện sáng', zh: '切换亮色主题' },
  'common.theme.toDark': { vi: 'Chuyển giao diện tối', zh: '切换暗色主题' },

  // ── Trang lập lá số ──────────────────────────────────────
  'chart.title': { vi: 'Lập lá số Tử Vi Đẩu Số', zh: '紫微斗数排盘' },
  'chart.subtitle': {
    vi: 'Nhập ngày giờ sinh, engine mã nguồn mở lập lá số ngay lập tức.',
    zh: '输入出生年月日时，开源排盘引擎即时生成命盘。',
  },
  'chart.demoNote': {
    vi: '(Trang này là bản Demo của engine. Nhân lõi lập lá số — an sao, tứ hoá, cách cục, thư viện cổ tịch — mở hoàn toàn.)',
    zh: '（本页为引擎 Demo，完整商业版界面不在开源范围；排盘内核完全开放。）',
  },
  'chart.back': { vi: '← Lập lá số khác', zh: '← 重新起盘' },

  // ── Biểu mẫu ngày sinh ───────────────────────────────────
  'form.heading': { vi: '── Nhập ngày giờ sinh ──', zh: '── 输入生辰八字 ──' },
  'form.name.label': { vi: 'Họ tên (tuỳ chọn)', zh: '姓名（可选）' },
  'form.name.placeholder': { vi: 'Nhập họ tên', zh: '请输入姓名' },
  'form.date.label': { vi: 'Ngày sinh (dương lịch)', zh: '出生日期（公历）' },
  'form.year': { vi: 'Năm', zh: '年份' },
  'form.month': { vi: 'Tháng', zh: '月份' },
  'form.day': { vi: 'Ngày', zh: '日期' },
  'form.monthOption': { vi: 'Tháng {n}', zh: '{n} 月' },
  'form.dayOption': { vi: 'Ngày {n}', zh: '{n} 日' },
  'form.place.label': {
    vi: 'Nơi sinh (để hiệu chỉnh chân thái dương thời)',
    zh: '出生地点（用于真太阳时校正）',
  },
  'form.province': { vi: 'Tỉnh / Thành phố', zh: '省份 / 直辖市' },
  'form.city': { vi: 'Thành phố', zh: '城市' },
  'form.cityPickProvince': { vi: 'Chọn tỉnh trước', zh: '先选省份' },
  'form.cityNone': { vi: '(chưa chọn thành phố)', zh: '（请选择城市）' },
  'form.longitude': { vi: 'Kinh độ', zh: '经度' },
  'form.offset': { vi: 'lệch', zh: '时差' },
  'form.minutes': { vi: 'phút', zh: '分钟' },
  'form.trueSolarHint': {
    vi: '* Nghê Hải Hạ luận mệnh theo chân thái dương thời — nên điền nơi sinh để tự hiệu chỉnh giờ',
    zh: '* 倪海厦批命用真太阳时，建议填写出生地以自动校正时辰',
  },
  'form.time.label': { vi: 'Giờ sinh (giờ đồng hồ)', zh: '出生时间（北京时间）' },
  'form.hourOption': { vi: '{n} giờ', zh: '{n} 时' },
  'form.minuteOption': { vi: '{n} phút', zh: '{n} 分' },
  'form.trueSolarArrow': { vi: 'Chân thái dương thời → ', zh: '真太阳时 → ' },
  'form.shichen': { vi: 'giờ {x}', zh: '{x}时' },
  'form.unknownTime': {
    vi: 'Không biết giờ sinh, lập theo giờ Tý (23:00–01:00)',
    zh: '不知道出生时间，以子时（23:00–01:00）起盘',
  },
  'form.gender': { vi: 'Giới tính', zh: '性别' },
  'form.male': { vi: '♂ Nam', zh: '♂ 男' },
  'form.female': { vi: '♀ Nữ', zh: '♀ 女' },
  'form.genderMaleShort': { vi: 'Nam', zh: '男' },
  'form.genderFemaleShort': { vi: 'Nữ', zh: '女' },
  'form.summaryDate': { vi: '{d}/{m}/{y}', zh: '{y}年{m}月{d}日' },
  'form.summaryUnknownTime': { vi: 'Không rõ giờ', zh: '时辰不详' },
  'form.submitting': { vi: 'Đang lập lá số…', zh: '紫微起盘中…' },
  'form.submit': { vi: 'Lập lá số ngay', zh: '立即起盘 · 解命运密码' },
  'form.err.year': { vi: 'Vui lòng chọn năm sinh', zh: '请选择出生年份' },
  'form.err.yearRange': { vi: 'Năm hợp lệ: 1900–2026', zh: '年份范围：1900–2026' },
  'form.err.month': { vi: 'Vui lòng chọn tháng', zh: '请选择月份' },
  'form.err.day': { vi: 'Vui lòng chọn ngày', zh: '请选择日期' },
  'form.err.dayInvalid': { vi: 'Tháng {m} không có ngày {d}', zh: '{m}月没有{d}日' },

  // ── Bàn lá số ────────────────────────────────────────────
  'board.title': { vi: 'Lá số Tử Vi', zh: '紫微斗数命盘' },
  'board.brand': { vi: 'TỬ VI ĐẨU SỐ', zh: '紫微斗数' },
  'board.ming': { vi: 'Mệnh', zh: '命宫' },
  'board.shen': { vi: 'Thân', zh: '身宫' },
  'board.currentDaxian': { vi: 'Đại hạn hiện tại', zh: '当前大限' },
  'board.ageSuffix': { vi: ' tuổi', zh: '岁' },
  'board.lunarPrefix': { vi: 'ÂL ', zh: '' },
  'board.leapMark': { vi: 'N', zh: '闰' },
  'board.hint': { vi: 'Bấm vào cung để xem tam phương tứ chính', zh: '点击宫位看三方四正' },

  // ── Ô cung ───────────────────────────────────────────────
  'cell.empty': { vi: 'Cung trống', zh: '空宫' },
  'cell.mingBadge': { vi: 'Mệnh', zh: '命' },
  'cell.shenBadge': { vi: 'Thân', zh: '身' },

  // ── Thanh vận hạn ────────────────────────────────────────
  'nav.natal': { vi: 'Bản mệnh', zh: '本命' },
  'nav.daxian': { vi: 'Đại hạn', zh: '大限' },
  'nav.daxianRange': { vi: 'Đại hạn {a}–{b}', zh: '大限 {a}–{b}' },
  'nav.liunian': { vi: 'Lưu niên', zh: '流年' },
  'nav.overlayDaxian': { vi: 'Tứ hoá đại hạn · can {stem}:', zh: '大限·{stem}年四化：' },
  'nav.overlayYear': { vi: 'Tứ hoá năm {year} · can {stem}:', zh: '{year}·{stem}年四化：' },
  'nav.badgeDaxian': { vi: 'ĐH', zh: '限' },
  'nav.badgeYear': { vi: 'LN', zh: '年' },

  // ── Khung giải đoán ──────────────────────────────────────
  'insight.header': { vi: 'Giải đoán', zh: '命理解读' },
  'insight.placeholder': {
    vi: 'Hỏi tiếp, ví dụ: năm nay có nên đổi việc không?',
    zh: '继续追问，如：今年适合换工作吗？',
  },
  'insight.send': { vi: 'Hỏi', zh: '追问' },
  'insight.topic.overview': { vi: 'Mệnh cục', zh: '命格' },
  'insight.topic.love': { vi: 'Tình cảm', zh: '感情' },
  'insight.topic.career': { vi: 'Sự nghiệp', zh: '事业' },
  'insight.topic.wealth': { vi: 'Tài vận', zh: '财运' },
  'insight.topic.health': { vi: 'Sức khoẻ', zh: '健康' },
  'insight.topic.personality': { vi: 'Tính cách', zh: '性格' },
  'insight.err.apiMissing': {
    vi: 'Không tìm thấy /api/interpret — repo này đã có sẵn route đó, hãy kiểm tra app/api/interpret/route.ts và khởi động lại dev server. Việc lập lá số không cần API Key.',
    zh: '找不到 /api/interpret —— 本仓库已内置该接口，请确认 app/api/interpret/route.ts 存在并重启开发服务器。排盘本身不需要任何 API Key。',
  },
  'insight.err.failed': { vi: 'Giải đoán thất bại, vui lòng thử lại sau.', zh: '解读失败，请稍后重试。' },

  // ── Trang chủ ────────────────────────────────────────────
  'home.niMethod': { vi: 'Phép lập lá số Nghê Hải Hạ', zh: '倪海厦排盘法' },
  'home.starGroup.ziwei': { vi: 'Chòm Tử Vi', zh: '紫微系' },
  'home.starGroup.tianfu': { vi: 'Chòm Thiên Phủ', zh: '天府系' },
  'home.sihuaFlying': { vi: 'Tứ hoá phi tinh', zh: '四化飞星' },
  'home.patternsCount': {
    vi: 'Tự động nhận diện hơn 40 cách cục kinh điển',
    zh: '自动识别 40 多种经典格局',
  },

  'home.nav.brand': { vi: 'Lá số Tử Vi', zh: '紫微命盘' },
  'home.nav.heming': { vi: 'Hợp bàn', zh: '合盘' },
  'home.nav.lich': { vi: 'Ngày hoàng đạo', zh: '黄道吉日' },
  'home.cta': { vi: 'Lập lá số', zh: '立即起盘' },
  'home.hero.tag': { vi: 'Tử Vi Đẩu Số · hệ Nghê Hải Hạ', zh: '紫微斗数 · 倪海厦体系' },
  'home.hero.line1': {
    vi: 'Tử Vi là cửa · Thiên Địa Nhân là đường · Nghê Hải Hạ là thầy',
    zh: '紫微为门 · 天地人为路 · 倪海厦为师',
  },
  'home.hero.line2': { vi: 'AI giải đáp · tri hành hợp nhất', zh: 'AI 答疑 · 知行合一' },
  'home.hero.sub': {
    vi: 'Nhập ngày giờ sinh để lập lá số Tử Vi Đẩu Số của riêng bạn.',
    zh: '输入出生年月日时，生成专属紫微斗数命盘。',
  },
  'home.scrollMore': { vi: 'Khám phá thêm', zh: '探索更多' },
  'home.mingVanQuan': { vi: 'Mệnh · Vận · Quán', zh: '命 · 运 · 观' },
  'home.scroll.l1': { vi: 'Ý nghĩa của việc hé nhìn vận mệnh', zh: '提前窥探命运的意义' },
  'home.scroll.l2': { vi: 'không nằm ở biết trước tương lai', zh: '不在于预知未来' },
  'home.scroll.l3': { vi: 'mà ở chỗ không ngừng hiểu chính mình', zh: '而在于不断认识自己' },
  'home.scroll.end': { vi: 'Để rồi tự viết kịch bản đời mình', zh: '最终书写属于自己的人生剧本' },
  'home.sections.title': { vi: 'Các khu vực của trang', zh: '本站板块' },
  'home.sections.sub': {
    vi: 'Lập lá số, hợp bàn, và thư viện cổ tịch nguyên văn',
    zh: '排盘、合盘，以及古籍原文库',
  },
  'home.trio.title': { vi: 'Thiên · Địa · Nhân', zh: '天 · 地 · 人' },
  'home.trio.sub1': {
    vi: 'Quan niệm cốt lõi của Nghê Hải Hạ về vận mệnh: vận mệnh chưa bao giờ là toàn bộ đời người.',
    zh: '倪海厦老师的核心命运观：命运从来不是人生的全部。',
  },
  'home.trio.sub2': {
    vi: 'Ông chia các lực ảnh hưởng tới đời người thành ba chiều quan trọng ngang nhau.',
    zh: '他将影响人生的力量分为三个同等重要的维度。',
  },
  'home.trio.quote': {
    vi: '«Vận mệnh không phải toàn bộ đời người; cộng thêm địa lý và tâm niệm con người, mới là.»',
    zh: '「命运不是人生的全部，加上地理位置和人念，才是。」',
  },
  'home.niName': { vi: 'Nghê Hải Hạ', zh: '倪海厦' },

  'home.heming.title': { vi: 'Hợp bàn Tử Vi', zh: '紫微合盘' },
  'home.heming.sub1': {
    vi: 'Nhập thông tin sinh của hai người, AI theo hệ Nghê Hải Hạ đối chiếu cung Phu Thê, độ tương hợp cung Mệnh và tương tác tam phương tứ chính,',
    zh: '输入两个人的出生信息，AI 基于倪海厦体系分析夫妻宫互参、命宫兼容性与三方四正交互，',
  },
  'home.heming.sub2': {
    vi: 'đưa ra mức hợp tình cảm, khả năng hợp tác và lời khuyên chung sống.',
    zh: '给出感情匹配度、合伙可行性与最佳相处建议。',
  },
  'home.heming.chip1': { vi: 'Phân tích độ hợp tình cảm', zh: '感情匹配度分析' },
  'home.heming.chip2': { vi: 'Đánh giá hợp tác khởi nghiệp', zh: '合伙创业评估' },
  'home.heming.chip3': { vi: 'Luận duyên cha mẹ – con cái', zh: '亲子缘分解读' },
  'home.heming.chip4': { vi: 'Xem hợp tuổi trước hôn nhân', zh: '婚前相性评估' },
  'home.heming.cta': { vi: 'Bắt đầu hợp bàn', zh: '开始合盘分析' },
  'home.final.tag': { vi: 'Bắt đầu hành trình lá số của bạn', zh: '开始你的命盘之旅' },
  'home.final.title1': { vi: 'Lá số Tử Vi của bạn', zh: '你的紫微命盘' },
  'home.final.title2': { vi: 'đang chờ được luận giải', zh: '等你解读' },
  'home.final.sub1': {
    vi: 'Nhập ngày giờ sinh, lá số riêng của bạn hiện ra trong vài giây',
    zh: '输入出生年月日时，在几秒内生成你的专属命盘',
  },
  'home.final.sub2': {
    vi: 'rồi AI luận giải sâu theo hệ Nghê Hải Hạ',
    zh: '再由 AI 按倪海厦体系为你深度解读',
  },
  'home.final.cta': { vi: 'Lập lá số miễn phí', zh: '免费起盘' },
  'home.link.library': { vi: '📜 Thư viện cổ tịch nguyên văn →', zh: '📜 古籍原典库 →' },
  'home.footer.line1': {
    vi: 'Lá số Tử Vi · dựa trên hệ Nghê Hải Hạ · chỉ để tham khảo, vận mệnh nằm trong tay bạn',
    zh: '紫微命盘 · 基于倪海厦正宗体系 · 仅供参考，命运掌握在自己手中',
  },
  'home.footer.line2': {
    vi: 'Trang này dựa trên nghiên cứu văn hoá truyền thống, chỉ cung cấp tham khảo để học tập.',
    zh: '本平台基于中国传统文化研究，仅提供学习参考。',
  },
  'home.footer.line3': {
    vi: 'Không cấu thành bất kỳ lời khuyên y tế, đầu tư, pháp lý hay quyết định hệ trọng nào.',
    zh: '不构成任何医疗、投资、法律或重大决策建议。',
  },
  'home.footer.terms': { vi: 'Điều khoản dịch vụ', zh: '服务条款' },
  'home.footer.privacy': { vi: 'Chính sách riêng tư', zh: '隐私政策' },

  'form.group.vn': { vi: 'Việt Nam', zh: '越南' },
  'form.group.cn': { vi: 'Trung Quốc', zh: '中国' },
  'form.shichenRange': { vi: '({range})', zh: '（{range}）' },

  // ── Bảng chi tiết tinh diệu ──────────────────────────────
  'star.type.major': { vi: 'Chính tinh', zh: '主星' },
  'star.type.lucky': { vi: 'Cát tinh', zh: '吉星' },
  'star.type.sha': { vi: 'Sát tinh', zh: '煞星' },
  'star.type.minor': { vi: 'Tạp diệu', zh: '杂星' },
  'star.tag.element': { vi: 'Ngũ hành · {x}', zh: '五行 · {x}' },
  'star.tag.nature': { vi: 'Tính chất · {x}', zh: '性质 · {x}' },
  'star.tag.position': { vi: 'Vị trí · {x}', zh: '位置 · {x}' },
  'star.tag.bright': { vi: 'Miếu vượng', zh: '庙旺' },
  'star.tag.dim': { vi: 'Lạc hãm', zh: '落陷' },
  'star.tag.neutral': { vi: 'Bình hoà', zh: '平和' },
  'star.section.traits': { vi: 'Đặc chất tinh diệu', zh: '星曜特质' },
  'star.section.classical': { vi: 'Nguyên văn cổ thư', zh: '古书原文' },
  'star.section.niReading': { vi: 'Nghê Hải Hạ luận', zh: '倪海厦老师解读' },
  'star.field.career': { vi: 'Hướng sự nghiệp', zh: '事业方向' },
  'star.field.relationship': { vi: 'Đặc chất tình cảm', zh: '感情特质' },
  'star.field.wealth': { vi: 'Phân tích tài vận', zh: '财运分析' },
  'star.field.health': { vi: 'Lưu ý sức khoẻ', zh: '健康提示' },
  'star.field.bestPalace': { vi: 'Cung tốt nhất', zh: '最佳宫位' },
  'star.field.worstPalace': { vi: 'Cung cần lưu ý', zh: '注意宫位' },
  'star.noDetail': {
    vi: 'Ngôi sao này chưa có bài luận chi tiết trong kho dữ liệu. Bấm vào cung chứa nó để hỏi AI.',
    zh: '此星暂无详细论断，可点击所在宫位让 AI 解读。',
  },
  'star.proseStillChinese': {
    vi: 'Phần luận giải dưới đây hiện còn nguyên văn tiếng Trung — chưa dịch.',
    zh: '',
  },
  'home.seal': { vi: 'TỬ|VI', zh: '紫|微' },
} as const satisfies Record<string, Entry>;

export type UiKey = keyof typeof UI;

/** Thay {tên} bằng giá trị tương ứng; thiếu biến thì giữ nguyên placeholder. */
export function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, k: string) =>
    k in vars ? String(vars[k]) : whole,
  );
}
