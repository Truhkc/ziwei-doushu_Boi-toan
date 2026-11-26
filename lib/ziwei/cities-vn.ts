/**
 * lib/ziwei/cities-vn —— tỉnh thành Việt Nam cho hiệu chỉnh chân thái dương thời
 *
 * Bản gốc chỉ có địa danh Trung Quốc, nên người sinh ở Việt Nam không chọn được
 * nơi sinh và mất luôn phần hiệu chỉnh giờ.
 *
 * Điểm then chốt là **múi giờ**, không chỉ kinh độ. Đồng hồ Việt Nam chạy theo
 * UTC+7, kinh tuyến trung tâm 105°E; đồng hồ Trung Quốc theo UTC+8, kinh tuyến
 * 120°E. Công thức cũ `(kinh độ − 120) × 4` ngầm giả định giờ Bắc Kinh, áp cho
 * một người sinh ở Hà Nội sẽ lệch đúng 60 phút — đủ để nhảy nửa canh giờ, và ở
 * sát ranh giới canh giờ thì sai cả lá số. Vì vậy mỗi tỉnh mang theo
 * `utcOffsetMinutes` riêng.
 *
 * Kinh độ lấy ở trung tâm tỉnh lỵ, làm tròn 0,01° (~2,7 km, tức ~11 giây thời
 * gian) — nhỏ hơn nhiều so với sai số của việc nhớ giờ sinh.
 *
 * Danh sách theo tên tỉnh quen thuộc trước đợt sắp xếp hành chính 2025, vì
 * người dùng tra theo nơi sinh ngày xưa chứ không theo bản đồ hành chính hiện tại.
 */
import type { ProvinceInfo } from './cities';

/** Việt Nam dùng giờ Đông Dương UTC+7 từ 1975 tới nay */
const VN_OFFSET = 420;

/**
 * Mỗi tỉnh đúng MỘT mục, lấy kinh độ ở tỉnh lỵ.
 *
 * Trước đây vài tỉnh có thêm mục con (Hà Nội kèm Hà Đông, Sơn Tây...). Bỏ đi
 * vì chúng chỉ làm rối mà gần như không đổi được gì: trong một tỉnh, kinh độ
 * chênh nhau nhiều lắm là hơn một độ, tức dưới năm phút chân thái dương thời —
 * nhỏ hơn sai số của việc nhớ giờ sinh, và nhỏ hơn nhiều so với 60 phút lệch
 * do Việt Nam nằm ở UTC+7. Kèm theo đó, "Sơn Tây" trùng tên tỉnh Sơn Tây của
 * Trung Quốc nên người dùng tưởng dữ liệu lẫn lộn.
 *
 * `cities` vẫn là mảng vì kiểu ProvinceInfo dùng chung với danh sách Trung
 * Quốc, nơi mục con còn ý nghĩa (tỉnh bên đó rộng hơn nhiều).
 */
const vn = (name: string, city: string, longitude: number): ProvinceInfo => ({
  name,
  cities: [{ name: city, longitude }],
  country: 'VN',
  utcOffsetMinutes: VN_OFFSET,
});

export const VN_PROVINCES: ProvinceInfo[] = [
  // ─── Đồng bằng sông Hồng ───────────────────────────────
  vn('Hà Nội', 'Hà Nội', 105.85),
  vn('Hải Phòng', 'Hải Phòng', 106.68),
  vn('Quảng Ninh', 'Hạ Long', 107.08),
  vn('Hải Dương', 'Hải Dương', 106.33),
  vn('Hưng Yên', 'Hưng Yên', 106.05),
  vn('Bắc Ninh', 'Bắc Ninh', 106.08),
  vn('Bắc Giang', 'Bắc Giang', 106.19),
  vn('Vĩnh Phúc', 'Vĩnh Yên', 105.6),
  vn('Thái Bình', 'Thái Bình', 106.34),
  vn('Nam Định', 'Nam Định', 106.18),
  vn('Hà Nam', 'Phủ Lý', 105.91),
  vn('Ninh Bình', 'Ninh Bình', 105.97),

  // ─── Trung du và miền núi phía Bắc ─────────────────────
  vn('Phú Thọ', 'Việt Trì', 105.4),
  vn('Thái Nguyên', 'Thái Nguyên', 105.84),
  vn('Bắc Kạn', 'Bắc Kạn', 105.83),
  vn('Cao Bằng', 'Cao Bằng', 106.25),
  vn('Lạng Sơn', 'Lạng Sơn', 106.76),
  vn('Tuyên Quang', 'Tuyên Quang', 105.22),
  vn('Hà Giang', 'Hà Giang', 104.98),
  vn('Yên Bái', 'Yên Bái', 104.87),
  vn('Lào Cai', 'Lào Cai', 103.97),
  vn('Lai Châu', 'Lai Châu', 103.47),
  vn('Điện Biên', 'Điện Biên Phủ', 103.02),
  vn('Sơn La', 'Sơn La', 103.92),
  vn('Hoà Bình', 'Hoà Bình', 105.34),

  // ─── Bắc Trung Bộ ──────────────────────────────────────
  vn('Thanh Hoá', 'Thanh Hoá', 105.78),
  vn('Nghệ An', 'Vinh', 105.67),
  vn('Hà Tĩnh', 'Hà Tĩnh', 105.9),
  vn('Quảng Bình', 'Đồng Hới', 106.6),
  vn('Quảng Trị', 'Đông Hà', 107.1),
  vn('Thừa Thiên Huế', 'Huế', 107.58),

  // ─── Nam Trung Bộ ──────────────────────────────────────
  vn('Đà Nẵng', 'Đà Nẵng', 108.22),
  vn('Quảng Nam', 'Tam Kỳ', 108.48),
  vn('Quảng Ngãi', 'Quảng Ngãi', 108.8),
  vn('Bình Định', 'Quy Nhơn', 109.22),
  vn('Phú Yên', 'Tuy Hoà', 109.32),
  vn('Khánh Hoà', 'Nha Trang', 109.19),
  vn('Ninh Thuận', 'Phan Rang', 108.99),
  vn('Bình Thuận', 'Phan Thiết', 108.1),

  // ─── Tây Nguyên ────────────────────────────────────────
  vn('Lâm Đồng', 'Đà Lạt', 108.44),
  vn('Đắk Lắk', 'Buôn Ma Thuột', 108.05),
  vn('Đắk Nông', 'Gia Nghĩa', 107.69),
  vn('Gia Lai', 'Pleiku', 108.0),
  vn('Kon Tum', 'Kon Tum', 108.0),

  // ─── Đông Nam Bộ ───────────────────────────────────────
  vn('TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 106.7),
  vn('Đồng Nai', 'Biên Hoà', 106.82),
  vn('Bình Dương', 'Thủ Dầu Một', 106.65),
  vn('Bà Rịa – Vũng Tàu', 'Vũng Tàu', 107.08),
  vn('Tây Ninh', 'Tây Ninh', 106.13),
  vn('Bình Phước', 'Đồng Xoài', 106.89),

  // ─── Đồng bằng sông Cửu Long ───────────────────────────
  vn('Long An', 'Tân An', 106.41),
  vn('Tiền Giang', 'Mỹ Tho', 106.36),
  vn('Bến Tre', 'Bến Tre', 106.38),
  vn('Trà Vinh', 'Trà Vinh', 106.34),
  vn('Vĩnh Long', 'Vĩnh Long', 105.97),
  vn('Đồng Tháp', 'Cao Lãnh', 105.63),
  vn('An Giang', 'Long Xuyên', 105.44),
  vn('Kiên Giang', 'Rạch Giá', 105.08),
  vn('Cần Thơ', 'Cần Thơ', 105.78),
  vn('Hậu Giang', 'Vị Thanh', 105.47),
  vn('Sóc Trăng', 'Sóc Trăng', 105.97),
  vn('Bạc Liêu', 'Bạc Liêu', 105.72),
  vn('Cà Mau', 'Cà Mau', 105.15),
];
