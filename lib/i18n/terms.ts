/**
 * lib/i18n/terms —— 命理专名的越南语（汉越音）对照表
 *
 * 口径：**引擎内部一律保持中文**，只在显示层翻译。三个理由：
 *
 * 1. `lib/ziwei/chart-input.ts` 的白名单要求星名、宫名是 1–6 个汉字；
 *    把引擎产出改成越南语会直接让接口拒绝自己的盘。
 * 2. 送进模型的命盘上下文用古典中文术语，模型对「贪狼化忌」的理解远好于
 *    对 "Tham Lang hoá Kỵ" 的理解。翻译交给模型的输出端。
 * 3. 古籍原文（lib/classics/）属于公版文献，**不翻译**。
 *
 * 越南传统紫微用汉越音，不是意译：紫微 = Tử Vi（不是 "Ngôi sao tím"）。
 * 下面每一条都是汉越读音。
 *
 * 覆盖面由 scripts/regression/i18n-coverage.test.ts 钉住：
 * 扫 6800+ 张盘取引擎能产出的全部名称，少一条就报错。上游新增星曜时会当场失败。
 */

/** 十四主星 */
export const VI_MAJOR_STARS: Record<string, string> = {
  紫微: 'Tử Vi',   天机: 'Thiên Cơ',  太阳: 'Thái Dương', 武曲: 'Vũ Khúc',
  天同: 'Thiên Đồng', 廉贞: 'Liêm Trinh', 天府: 'Thiên Phủ', 太阴: 'Thái Âm',
  贪狼: 'Tham Lang', 巨门: 'Cự Môn',   天相: 'Thiên Tướng', 天梁: 'Thiên Lương',
  七杀: 'Thất Sát',  破军: 'Phá Quân',
};

/** 吉星・辅曜 */
export const VI_LUCKY_STARS: Record<string, string> = {
  左辅: 'Tả Phù',    右弼: 'Hữu Bật',   文昌: 'Văn Xương', 文曲: 'Văn Khúc',
  天魁: 'Thiên Khôi', 天钺: 'Thiên Việt', 禄存: 'Lộc Tồn',   天马: 'Thiên Mã',
  三台: 'Tam Thai',  八座: 'Bát Toạ',   台辅: 'Thai Phụ',  封诰: 'Phong Cáo',
  恩光: 'Ân Quang',  天贵: 'Thiên Quý', 龙池: 'Long Trì',  凤阁: 'Phượng Các',
  天才: 'Thiên Tài', 天寿: 'Thiên Thọ', 天官: 'Thiên Quan', 天福: 'Thiên Phúc',
  天巫: 'Thiên Vu',  解神: 'Giải Thần', 年解: 'Niên Giải', 华盖: 'Hoa Cái',
  红鸾: 'Hồng Loan', 天喜: 'Thiên Hỷ',  天德: 'Thiên Đức', 月德: 'Nguyệt Đức',
};

/** 煞星・空劫刑忌 */
export const VI_SHA_STARS: Record<string, string> = {
  擎羊: 'Kình Dương', 陀罗: 'Đà La',    火星: 'Hoả Tinh',  铃星: 'Linh Tinh',
  地空: 'Địa Không',  地劫: 'Địa Kiếp',  天空: 'Thiên Không', 截空: 'Triệt Không',
  副截: 'Phó Triệt',  旬空: 'Tuần Không', 副旬: 'Phó Tuần',  大耗: 'Đại Hao',
  天刑: 'Thiên Hình', 天哭: 'Thiên Khốc', 天虚: 'Thiên Hư',  天月: 'Thiên Nguyệt',
  天伤: 'Thiên Thương', 天使: 'Thiên Sứ', 孤辰: 'Cô Thần',   寡宿: 'Quả Tú',
  阴煞: 'Âm Sát',     蜚廉: 'Phi Liêm',
};

/** 杂曜 */
export const VI_MINOR_STARS: Record<string, string> = {
  天姚: 'Thiên Diêu', 咸池: 'Hàm Trì',  劫煞: 'Kiếp Sát',
  破碎: 'Phá Toái',   天厨: 'Thiên Trù', 龙德: 'Long Đức',
};

/** 十二宫（iztro zh-CN 口径：只有命宫带「宫」字，交友叫「仆役」） */
export const VI_PALACES: Record<string, string> = {
  命宫: 'Mệnh',     兄弟: 'Huynh Đệ', 夫妻: 'Phu Thê',   子女: 'Tử Tức',
  财帛: 'Tài Bạch', 疾厄: 'Tật Ách',  迁移: 'Thiên Di',  仆役: 'Nô Bộc',
  交友: 'Giao Hữu', 官禄: 'Quan Lộc', 田宅: 'Điền Trạch', 福德: 'Phúc Đức',
  父母: 'Phụ Mẫu',
};

/** 星曜亮度 —— 引擎默认流派只出 7 档，「闲」「地」是其他流派才有，一并收录 */
export const VI_BRIGHTNESS: Record<string, string> = {
  庙: 'Miếu', 旺: 'Vượng', 得: 'Đắc', 利: 'Lợi',
  平: 'Bình', 不: 'Bất',   闲: 'Nhàn', 陷: 'Hãm', 地: 'Địa',
};

/** 四化 */
export const VI_SIHUA: Record<string, string> = {
  禄: 'Lộc', 权: 'Quyền', 科: 'Khoa', 忌: 'Kỵ',
};

/** 天干 */
export const VI_STEMS: Record<string, string> = {
  甲: 'Giáp', 乙: 'Ất', 丙: 'Bính', 丁: 'Đinh', 戊: 'Mậu',
  己: 'Kỷ',   庚: 'Canh', 辛: 'Tân', 壬: 'Nhâm', 癸: 'Quý',
};

/** 地支 */
export const VI_BRANCHES: Record<string, string> = {
  子: 'Tý',  丑: 'Sửu', 寅: 'Dần', 卯: 'Mão', 辰: 'Thìn', 巳: 'Tỵ',
  午: 'Ngọ', 未: 'Mùi', 申: 'Thân', 酉: 'Dậu', 戌: 'Tuất', 亥: 'Hợi',
};

/** 五行局 */
export const VI_WUXING_JU: Record<string, string> = {
  水二局: 'Thuỷ Nhị Cục', 木三局: 'Mộc Tam Cục', 金四局: 'Kim Tứ Cục',
  土五局: 'Thổ Ngũ Cục',  火六局: 'Hoả Lục Cục',
};

/** 阴阳男女 */
export const VI_YINYANG_GENDER: Record<string, string> = {
  阳男: 'Dương Nam', 阴男: 'Âm Nam', 阳女: 'Dương Nữ', 阴女: 'Âm Nữ',
};

/**
 * 十二神煞（将前 / 岁前 / 博士三套）。
 * 三套之间有重名（华盖、劫煞、咸池、龙德、天德、大耗、官符、小耗、病符、飞廉），
 * 汉越音相同，合成一张表即可。
 */
export const VI_SHIER_SHEN: Record<string, string> = {
  // 将前十二神
  将星: 'Tướng Tinh', 攀鞍: 'Phan Yên', 岁驿: 'Tuế Dịch', 息神: 'Tức Thần',
  灾煞: 'Tai Sát',   天煞: 'Thiên Sát', 指背: 'Chỉ Bối',  月煞: 'Nguyệt Sát',
  亡神: 'Vong Thần',
  // 岁前十二神
  岁建: 'Tuế Kiến', 晦气: 'Hối Khí',  丧门: 'Tang Môn', 贯索: 'Quán Sách',
  官符: 'Quan Phù', 小耗: 'Tiểu Hao', 岁破: 'Tuế Phá',  白虎: 'Bạch Hổ',
  吊客: 'Điếu Khách', 病符: 'Bệnh Phù',
  // 博士十二神
  博士: 'Bác Sĩ',   力士: 'Lực Sĩ',   青龙: 'Thanh Long', 将军: 'Tướng Quân',
  奏书: 'Tấu Thư',  飞廉: 'Phi Liêm', 喜神: 'Hỷ Thần',   伏兵: 'Phục Binh',
};

/**
 * 格局名 —— 只收**固定**名称。
 *
 * patterns.ts 另有一族是模板拼出来的：`${星}化禄入命`、`${星}化忌入${命|迁}`，
 * 星名取自四化表，随天干变。那一族不列举，由 viPattern() 按规则拼，
 * 上游给某颗星加四化时自动跟上。
 */
export const VI_PATTERNS: Record<string, string> = {
  紫府同宫: 'Tử Phủ Đồng Cung',   君臣庆会: 'Quân Thần Khánh Hội',
  日月同宫: 'Nhật Nguyệt Đồng Cung', 日月夹命: 'Nhật Nguyệt Giáp Mệnh',
  巨日同宫: 'Cự Nhật Đồng Cung',  府相朝垣: 'Phủ Tướng Triều Viên',
  杀破狼: 'Sát Phá Lang',         机月同梁: 'Cơ Nguyệt Đồng Lương',
  机月同梁三星会: 'Cơ Nguyệt Đồng Lương Tam Tinh Hội',
  阳梁昌禄: 'Dương Lương Xương Lộc', 石中隐玉: 'Thạch Trung Ẩn Ngọc',
  明珠出海: 'Minh Châu Xuất Hải', 马头带箭: 'Mã Đầu Đới Tiễn',
  三奇加会: 'Tam Kỳ Gia Hội',     双禄朝垣: 'Song Lộc Triều Viên',
  科权双会: 'Khoa Quyền Song Hội', 昌曲同会: 'Xương Khúc Đồng Hội',
  昌曲坐命: 'Xương Khúc Toạ Mệnh', 昌曲夹命: 'Xương Khúc Giáp Mệnh',
  辅弼同会: 'Phụ Bật Đồng Hội',   辅弼夹命: 'Phụ Bật Giáp Mệnh',
  魁钺同会: 'Khôi Việt Đồng Hội', 魁钺夹命: 'Khôi Việt Giáp Mệnh',
  火贪格: 'Cách Hoả Tham',        铃贪格: 'Cách Linh Tham',
  武贪格: 'Cách Vũ Tham',         火铃夹命: 'Hoả Linh Giáp Mệnh',
  空劫夹命: 'Không Kiếp Giáp Mệnh', 羊陀夹忌: 'Dương Đà Giáp Kỵ',
  巨火羊: 'Cự Hoả Dương',         廉杀羊: 'Liêm Sát Dương',
  铃昌陀武: 'Linh Xương Đà Vũ',   武曲七杀: 'Vũ Khúc Thất Sát',
  天同天梁格: 'Cách Thiên Đồng Thiên Lương',
  廉贞天相格: 'Cách Liêm Trinh Thiên Tướng',
  紫微入命: 'Tử Vi Nhập Mệnh',    天马入命: 'Thiên Mã Nhập Mệnh',
  天马在迁: 'Thiên Mã Tại Thiên Di',
  禄存守命: 'Lộc Tồn Thủ Mệnh',   禄存守身: 'Lộc Tồn Thủ Thân',
  化科入命: 'Hoá Khoa Nhập Mệnh', 化科入身: 'Hoá Khoa Nhập Thân',
  化禄入财: 'Hoá Lộc Nhập Tài',   化权入官: 'Hoá Quyền Nhập Quan',
};

/**
 * Ngũ hành, tính chất và đặc chất của tinh diệu — lấy từ STAR_DESCRIPTIONS
 * trong lib/ziwei/constants.ts, hiện ở bảng chi tiết sao.
 */
export const VI_ELEMENTS: Record<string, string> = {
  金: 'Kim', 木: 'Mộc', 水: 'Thuỷ', 火: 'Hoả', 土: 'Thổ',
};

export const VI_STAR_NATURE: Record<string, string> = {
  吉星: 'Cát tinh',
  凶星: 'Hung tinh',
  中性: 'Trung tính',
  中性偏吉: 'Trung tính thiên cát',
  凶中带吉: 'Hung trung hữu cát',
};

/** Đặc chất (keywords) của 14 chính tinh */
export const VI_STAR_TRAITS: Record<string, string> = {
  帝王: 'đế vương',   尊贵: 'tôn quý',   独立: 'độc lập',
  智慧: 'trí tuệ',    机变: 'cơ biến',   谋略: 'mưu lược',
  阳刚: 'dương cương', 官贵: 'quan quý',  慷慨: 'khảng khái',
  财富: 'tài phú',    刚毅: 'cương nghị', 果断: 'quả đoán',
  温和: 'ôn hoà',     享福: 'hưởng phúc', 随缘: 'tuỳ duyên',
  才艺: 'tài nghệ',   刑囚: 'hình tù',   桃花: 'đào hoa',
  财库: 'kho tài',    稳重: 'vững vàng',  保守: 'bảo thủ',
  柔美: 'nhu mỹ',     阴柔: 'âm nhu',
  欲望: 'dục vọng',   多才: 'đa tài',
  口舌: 'khẩu thiệt',  是非: 'thị phi',   善辩: 'thiện biện',
  辅佐: 'phụ tá',     行政: 'hành chính', 印绶: 'ấn thụ',
  荫护: 'ấm hộ',      医药: 'y dược',    长辈: 'bậc trưởng',
  将星: 'tướng tinh',  果决: 'quả quyết',  孤克: 'cô khắc',
  开创: 'khai sáng',   变动: 'biến động',  破坏: 'phá hoại',
};

/** 星名合表（主星 + 吉星 + 煞星 + 杂曜） */
export const VI_STARS: Record<string, string> = {
  ...VI_MAJOR_STARS, ...VI_LUCKY_STARS, ...VI_SHA_STARS, ...VI_MINOR_STARS,
};

/** 全部专名合表 —— 查不到就原样返回中文，绝不显示 undefined */
const ALL: Record<string, string> = {
  ...VI_STARS, ...VI_PALACES, ...VI_BRIGHTNESS, ...VI_SIHUA,
  ...VI_STEMS, ...VI_BRANCHES, ...VI_WUXING_JU, ...VI_YINYANG_GENDER,
  ...VI_SHIER_SHEN, ...VI_PATTERNS,
  ...VI_ELEMENTS, ...VI_STAR_NATURE, ...VI_STAR_TRAITS,
};

/** 单个专名转汉越音；未收录时原样返回，不吞掉内容 */
export function vi(term: string): string {
  return ALL[term] ?? term;
}

/** 干支连写：甲子 → Giáp Tý */
export function viGanZhi(stem: string, branch: string): string {
  return `${VI_STEMS[stem] ?? stem} ${VI_BRANCHES[branch] ?? branch}`;
}

/** 四化标记：禄 → hoá Lộc */
export function viSihua(hua: string): string {
  return `hoá ${VI_SIHUA[hua] ?? hua}`;
}

/** 宫名 + 「cung」前缀：命宫 → cung Mệnh */
export function viPalace(name: string, capitalize = false): string {
  const t = VI_PALACES[name] ?? name;
  return `${capitalize ? 'Cung' : 'cung'} ${t}`;
}

/** 格局名里「入X」的宫位简称：入命 / 入迁 / 入财 / 入官 / 入身 */
const VI_PATTERN_TARGET: Record<string, string> = {
  命: 'Mệnh', 迁: 'Thiên Di', 财: 'Tài Bạch', 官: 'Quan Lộc', 身: 'Thân',
};

/** `${星}化${四化}入${宫}` —— 模板拼出来的那一族格局名 */
const COMPOSED_PATTERN = /^(.{2,4})化([\u7984\u6743\u79d1\u5fcc])入(.)$/;

/**
 * 格局名转汉越音。固定名查表，模板名按规则拼；都不中就原样返回中文。
 *
 * 「化科入命」这类没有星名前缀的是固定名，正则要求星名至少 2 字，不会误匹配。
 */
export function viPattern(name: string): string {
  const fixed = VI_PATTERNS[name];
  if (fixed) return fixed;

  const m = COMPOSED_PATTERN.exec(name);
  if (m) {
    const [, star, hua, target] = m;
    const viStar = VI_STARS[star];
    const viHua = VI_SIHUA[hua];
    const viTarget = VI_PATTERN_TARGET[target];
    if (viStar && viHua && viTarget) return `${viStar} Hoá ${viHua} Nhập ${viTarget}`;
  }
  return name;
}

// ─── Lớp nhận biết ngôn ngữ ────────────────────────────────

export type Locale = 'vi' | 'zh';

/**
 * Chuyển một chuyên danh mệnh lý sang ngôn ngữ đang chọn.
 *
 * Với 'zh' thì trả về nguyên văn chữ Hán — engine vốn đã nói tiếng Trung,
 * nên đường tiếng Trung không tốn một phép tra nào.
 */
export function term(name: string, locale: Locale): string {
  return locale === 'zh' ? name : vi(name);
}

/** Tên cách cục theo ngôn ngữ đang chọn */
export function termPattern(name: string, locale: Locale): string {
  return locale === 'zh' ? name : viPattern(name);
}

/** Can chi: 甲子 / Giáp Tý */
export function termGanZhi(stem: string, branch: string, locale: Locale): string {
  return locale === 'zh' ? `${stem}${branch}` : viGanZhi(stem, branch);
}

/** Tứ hoá: 化禄 / hoá Lộc */
export function termSihua(hua: string, locale: Locale): string {
  return locale === 'zh' ? `化${hua}` : viSihua(hua);
}
