/**
 * Lớp Hán–Việt cho lịch cổ truyền.
 *
 * `lunar-javascript` trả về thuật ngữ bằng chữ Hán. Tập thuật ngữ nó có thể
 * sinh ra là HỮU HẠN và đã được quét hết: 114 chữ Nghi/Kỵ, 12 thiên thần,
 * 12 trực, 28 tú. Vì hữu hạn nên dịch được trọn vẹn, và
 * `scripts/regression/almanac-coverage.test.ts` canh để không chữ nào lọt
 * lưới khi thư viện nâng phiên bản.
 *
 * Nguyên tắc dịch: ưu tiên âm Hán–Việt khi đó là thuật ngữ nghi lễ người
 * Việt vẫn dùng (nhập trạch, an sàng, khai quang), và dịch nghĩa khi âm
 * Hán–Việt không ai hiểu (伐木 → đốn gỗ, chứ không phải "phạt mộc").
 */

/** Nghi (nên làm) và Kỵ (nên kiêng) — cùng một bộ chữ, khác chỗ xuất hiện */
export const VI_ACTIVITY: Record<string, string> = {
  上梁: 'Thượng lương (gác đòn dông)',
  乘船: 'Đi thuyền',
  习艺: 'Học nghề',
  交易: 'Giao dịch',
  伐木: 'Đốn gỗ',
  会亲友: 'Gặp họ hàng bạn bè',
  作梁: 'Làm đòn dông',
  作灶: 'Sửa bếp',
  修坟: 'Sửa mộ',
  修造: 'Sửa chữa xây cất',
  修门: 'Sửa cửa',
  修饰垣墙: 'Sửa tường rào',
  入学: 'Nhập học',
  入宅: 'Nhập trạch (về nhà mới)',
  入殓: 'Nhập liệm',
  冠笄: 'Quan kê (lễ trưởng thành)',
  出火: 'Xuất hoả (dời bát hương)',
  出行: 'Xuất hành',
  出货财: 'Xuất hàng',
  分居: 'Ra ở riêng',
  割蜜: 'Cắt mật ong',
  动土: 'Động thổ',
  取渔: 'Đánh cá',
  合寿木: 'Đóng áo quan',
  合帐: 'May màn trướng',
  合脊: 'Lợp nóc',
  启钻: 'Khởi phần (mở huyệt)',
  坏垣: 'Phá tường',
  塑绘: 'Tạc tượng vẽ tranh',
  塞穴: 'Lấp hang lỗ',
  嫁娶: 'Cưới hỏi',
  安床: 'An sàng (kê giường)',
  安机械: 'Lắp máy móc',
  安碓磑: 'Lắp cối xay',
  安葬: 'An táng',
  安门: 'Lắp cửa',
  安香: 'An hương (đặt bát hương)',
  定磉: 'Đặt đá chân cột',
  平治道涂: 'Sửa đường',
  开仓: 'Mở kho',
  开光: 'Khai quang (điểm nhãn tượng)',
  开厕: 'Làm nhà xí',
  开市: 'Khai trương',
  开柱眼: 'Đục lỗ mộng cột',
  开池: 'Đào ao',
  开渠: 'Đào mương',
  开生坟: 'Xây sinh phần',
  归宁: 'Về nhà mẹ đẻ',
  归岫: 'Quy sơn (hợp táng)',
  成服: 'Thành phục (mặc tang phục)',
  扫舍: 'Quét dọn nhà',
  拆卸: 'Tháo dỡ',
  挂匾: 'Treo biển',
  捕捉: 'Bắt thú trừ hại',
  掘井: 'Đào giếng',
  探病: 'Thăm người bệnh',
  放水: 'Tháo nước',
  教牛马: 'Dạy trâu ngựa',
  整手足甲: 'Cắt móng tay chân',
  斋醮: 'Trai tiếu (lập đàn cúng)',
  断蚁: 'Diệt kiến mối',
  无: 'Không có',
  普渡: 'Phổ độ (cúng cô hồn)',
  架马: 'Dựng giá gỗ',
  栽种: 'Trồng trọt',
  求医: 'Cầu thầy thuốc',
  求嗣: 'Cầu tự (cầu con)',
  沐浴: 'Tắm gội',
  治病: 'Chữa bệnh',
  牧养: 'Chăn nuôi',
  理发: 'Cắt tóc',
  畋猎: 'Đi săn',
  盖屋: 'Lợp nhà',
  破土: 'Phá thổ (động thổ phần mộ)',
  破屋: 'Phá nhà',
  祈福: 'Cầu phúc',
  祭祀: 'Tế tự (cúng lễ)',
  移徙: 'Di cư (dọn nhà)',
  移柩: 'Di quan',
  立券: 'Lập khế ước',
  立碑: 'Dựng bia',
  竖柱: 'Dựng cột',
  筑堤: 'Đắp đê',
  纳婿: 'Nhận rể',
  纳畜: 'Nhận gia súc',
  纳财: 'Nạp tài (thu tiền của)',
  纳采: 'Nạp thái (lễ dạm ngõ)',
  经络: 'Mắc khung cửi',
  结网: 'Đan lưới',
  置产: 'Mua sắm tài sản',
  行丧: 'Đưa tang',
  补垣: 'Vá tường',
  裁衣: 'Cắt may áo',
  解除: 'Giải trừ (tẩy uế)',
  订盟: 'Đính ước',
  词讼: 'Kiện tụng',
  诸事不宜: 'Mọi việc đều không nên',
  谢土: 'Tạ thổ',
  赴任: 'Nhậm chức',
  起基: 'Khởi móng',
  进人口: 'Thêm người vào nhà',
  造仓: 'Làm kho',
  造庙: 'Xây miếu',
  造桥: 'Bắc cầu',
  造畜稠: 'Làm chuồng trại',
  造船: 'Đóng thuyền',
  造车器: 'Đóng xe, làm đồ dùng',
  酬神: 'Tạ thần',
  针灸: 'Châm cứu',
  问名: 'Vấn danh (hỏi tên tuổi)',
  除服: 'Trừ phục (bỏ tang)',
  雇佣: 'Thuê người',
  雕刻: 'Chạm khắc',
  馀事勿取: 'Việc khác chớ làm',
};

/**
 * Mười hai thiên thần trực nhật. Sáu vị là hoàng đạo (lành), sáu vị là hắc
 * đạo (dữ) — đây chính là gốc của chữ "ngày hoàng đạo".
 */
export const VI_DAY_GOD: Record<string, { vi: string; good: boolean }> = {
  青龙: { vi: 'Thanh Long', good: true },
  明堂: { vi: 'Minh Đường', good: true },
  金匮: { vi: 'Kim Quỹ', good: true },
  天德: { vi: 'Thiên Đức', good: true },
  玉堂: { vi: 'Ngọc Đường', good: true },
  司命: { vi: 'Tư Mệnh', good: true },
  天刑: { vi: 'Thiên Hình', good: false },
  朱雀: { vi: 'Chu Tước', good: false },
  白虎: { vi: 'Bạch Hổ', good: false },
  天牢: { vi: 'Thiên Lao', good: false },
  玄武: { vi: 'Huyền Vũ', good: false },
  勾陈: { vi: 'Câu Trần', good: false },
};

/** Mười hai trực (kiến trừ thập nhị thần), kèm một câu tóm tính chất */
export const VI_ZHI_XING: Record<string, { vi: string; gist: string }> = {
  建: { vi: 'Kiến', gist: 'Khởi đầu, xuất hành, nhậm chức — kiêng động thổ' },
  除: { vi: 'Trừ', gist: 'Trừ cũ đón mới, chữa bệnh, tẩy uế' },
  满: { vi: 'Mãn', gist: 'Đầy đặn, cầu phúc tế tự — kiêng kiện tụng, uống thuốc' },
  平: { vi: 'Bình', gist: 'Bằng phẳng, sửa đường đắp đê — việc lớn nên hoãn' },
  定: { vi: 'Định', gist: 'Yên ổn, cưới hỏi nhập trạch — kiêng kiện tụng' },
  执: { vi: 'Chấp', gist: 'Nắm giữ, bắt giữ trừ hại — kiêng dời đổi' },
  破: { vi: 'Phá', gist: 'Hao tán, chỉ nên phá dỡ chữa bệnh — kiêng mọi việc lành' },
  危: { vi: 'Nguy', gist: 'Chông chênh, kiêng lên cao xuống nước' },
  成: { vi: 'Thành', gist: 'Thành tựu, khai trương nhập học cưới hỏi' },
  收: { vi: 'Thu', gist: 'Thu nạp, nạp tài thu hoạch — kiêng an táng' },
  开: { vi: 'Khai', gist: 'Mở mang, khai trương nhập trạch — kiêng an táng' },
  闭: { vi: 'Bế', gist: 'Đóng lấp, đắp đê lấp lỗ — kiêng khai trương chữa bệnh' },
};

/** Ba mươi nạp âm của lục thập hoa giáp */
export const VI_NAYIN: Record<string, string> = {
  海中金: 'Hải Trung Kim',   炉中火: 'Lô Trung Hoả',   大林木: 'Đại Lâm Mộc',
  路旁土: 'Lộ Bàng Thổ',     剑锋金: 'Kiếm Phong Kim', 山头火: 'Sơn Đầu Hoả',
  涧下水: 'Giản Hạ Thuỷ',    城头土: 'Thành Đầu Thổ',  白蜡金: 'Bạch Lạp Kim',
  杨柳木: 'Dương Liễu Mộc',  泉中水: 'Tuyền Trung Thuỷ', 屋上土: 'Ốc Thượng Thổ',
  霹雳火: 'Tích Lịch Hoả',   松柏木: 'Tùng Bách Mộc',  长流水: 'Trường Lưu Thuỷ',
  沙中金: 'Sa Trung Kim',    山下火: 'Sơn Hạ Hoả',     平地木: 'Bình Địa Mộc',
  壁上土: 'Bích Thượng Thổ', 金箔金: 'Kim Bạch Kim',   覆灯火: 'Phúc Đăng Hoả',
  天河水: 'Thiên Hà Thuỷ',   大驿土: 'Đại Dịch Thổ',   钗钏金: 'Thoa Xuyến Kim',
  桑柘木: 'Tang Đố Mộc',     大溪水: 'Đại Khê Thuỷ',   沙中土: 'Sa Trung Thổ',
  天上火: 'Thiên Thượng Hoả', 石榴木: 'Thạch Lựu Mộc', 大海水: 'Đại Hải Thuỷ',
};

/** Nhị thập bát tú */
export const VI_XIU: Record<string, string> = {
  角: 'Giác', 亢: 'Cang', 氐: 'Đê', 房: 'Phòng', 心: 'Tâm', 尾: 'Vĩ', 箕: 'Cơ',
  斗: 'Đẩu', 牛: 'Ngưu', 女: 'Nữ', 虚: 'Hư', 危: 'Nguy', 室: 'Thất', 壁: 'Bích',
  奎: 'Khuê', 娄: 'Lâu', 胃: 'Vị', 昴: 'Mão', 毕: 'Tất', 觜: 'Chuỷ', 参: 'Sâm',
  井: 'Tỉnh', 鬼: 'Quỷ', 柳: 'Liễu', 星: 'Tinh', 张: 'Trương', 翼: 'Dực', 轸: 'Chẩn',
};

/**
 * Tra có lùi về chữ gốc. Lùi lặng lẽ là cái bẫy: chữ Hán hiện ra giữa trang
 * tiếng Việt mà không ai hay. Bài test coverage chặn đúng chỗ này.
 */
export function viActivity(zh: string): string {
  return VI_ACTIVITY[zh] ?? zh;
}
export function viXiu(zh: string): string {
  return VI_XIU[zh] ?? zh;
}
export function viNaYin(zh: string): string {
  return VI_NAYIN[zh] ?? zh;
}
