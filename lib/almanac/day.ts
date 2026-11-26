import { Solar } from 'lunar-javascript';
import { VI_BRANCHES, VI_STEMS } from '@/lib/i18n/terms';
import { VI_DAY_GOD, VI_ZHI_XING, viActivity, viNaYin, viXiu } from './terms';

/**
 * Lịch cổ truyền cho một ngày dương lịch.
 *
 * Toàn bộ số liệu lấy từ `lunar-javascript` — cùng bộ máy lịch mà phần an
 * sao đang dùng, nên ngày tháng ở hai nơi không bao giờ lệch nhau. Ở đây
 * không có phép tính riêng nào, chỉ dịch và sắp lại cho dễ đọc.
 *
 * "Hoàng đạo" là ngày do một trong sáu thiên thần lành trực nhật (Thanh
 * Long, Minh Đường, Kim Quỹ, Thiên Đức, Ngọc Đường, Tư Mệnh); "hắc đạo" là
 * ngày của sáu vị còn lại. Đây là cách định nghĩa cổ, không phải xếp hạng
 * tốt xấu chung chung.
 */

export interface AlmanacDay {
  /** Dương lịch, dạng YYYY-MM-DD */
  date: string;
  year: number;
  month: number;
  day: number;
  /** 0 = Chủ nhật */
  weekday: number;

  /** Âm lịch, dạng chữ Hán (十八) — giữ cho bản tiếng Trung */
  lunarDay: string;
  lunarMonth: string;
  lunarYear: string;
  /** Âm lịch bằng số, để bản tiếng Việt khỏi phải đọc chữ Hán */
  lunarDayNum: number;
  lunarMonthNum: number;
  /** Tháng này có phải tháng nhuận không */
  isLeapMonth: boolean;

  /** Can chi ngày, đã Hán–Việt */
  dayGanZhi: string;
  monthGanZhi: string;
  yearGanZhi: string;
  /** Địa chi ngày, chữ Hán — kim la bàn chỉ vào đây */
  dayBranchZh: string;
  dayBranchVi: string;

  /** Thiên thần trực nhật */
  godVi: string;
  /** true = hoàng đạo, false = hắc đạo */
  isGood: boolean;

  /** Trực (kiến trừ thập nhị thần) */
  zhiXingVi: string;
  zhiXingGist: string;

  /** Nhị thập bát tú */
  xiuVi: string;

  /** Nghi / Kỵ, đã dịch */
  yi: string[];
  ji: string[];
  /** Nghi / Kỵ, giữ nguyên chữ Hán — dùng để lọc ngày theo việc */
  yiZh: string[];
  jiZh: string[];

  /** Ngày xung tuổi nào */
  chong: string;
  /** Nạp âm */
  naYin: string;
  /** Tiết khí rơi đúng ngày này, nếu có */
  jieQi: string;
}

/** Can chi → Hán–Việt. Chuỗi vào luôn đúng 2 chữ: 1 can + 1 chi. */
function viGanZhi(gz: string): string {
  const gan = VI_STEMS[gz[0]] ?? gz[0];
  const zhi = VI_BRANCHES[gz[1]] ?? gz[1];
  return `${gan} ${zhi}`;
}

/**
 * `getDayChongDesc()` trả về dạng "(戊戌)狗" — can chi xung trong ngoặc, kèm
 * con giáp. Ta chỉ lấy phần can chi rồi dịch; con giáp chữ Hán bỏ đi vì
 * phần Hán–Việt đã nói đủ.
 */
function viChong(desc: string): string {
  const m = desc.match(/\(([^)]{2})\)/);
  return m ? viGanZhi(m[1]) : desc;
}

export function almanacForDate(year: number, month: number, day: number): AlmanacDay {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const godZh = lunar.getDayTianShen();
  const god = VI_DAY_GOD[godZh];
  const zhiXingZh = lunar.getZhiXing();
  const zhiXing = VI_ZHI_XING[zhiXingZh];
  const branchZh = lunar.getDayZhi();

  const yiZh: string[] = lunar.getDayYi();
  const jiZh: string[] = lunar.getDayJi();

  return {
    date: solar.toYmd(),
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    weekday: solar.getWeek(),

    lunarDay: lunar.getDayInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarYear: viGanZhi(lunar.getYearInGanZhi()),
    // lunar-javascript lấy tháng âm ÂM để chỉ tháng nhuận (-5 = nhuận năm)
    lunarDayNum: lunar.getDay(),
    lunarMonthNum: Math.abs(lunar.getMonth()),
    isLeapMonth: lunar.getMonth() < 0,

    dayGanZhi: viGanZhi(lunar.getDayInGanZhi()),
    monthGanZhi: viGanZhi(lunar.getMonthInGanZhi()),
    yearGanZhi: viGanZhi(lunar.getYearInGanZhi()),
    dayBranchZh: branchZh,
    dayBranchVi: VI_BRANCHES[branchZh] ?? branchZh,

    // Lùi về chữ Hán chỉ khi thư viện sinh ra thần/trực lạ; bài test coverage
    // canh để chuyện đó không lặng lẽ trôi qua.
    godVi: god?.vi ?? godZh,
    isGood: god?.good ?? false,

    zhiXingVi: zhiXing?.vi ?? zhiXingZh,
    zhiXingGist: zhiXing?.gist ?? '',

    xiuVi: viXiu(lunar.getXiu()),

    yi: yiZh.map(viActivity),
    ji: jiZh.map(viActivity),
    yiZh,
    jiZh,

    chong: viChong(lunar.getDayChongDesc()),
    naYin: viNaYin(lunar.getDayNaYin()),
    jieQi: lunar.getJieQi(),
  };
}

/** Lịch cổ truyền cho một ngày, nhận vào Date */
export function almanacForDay(d: Date): AlmanacDay {
  return almanacForDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Cả tháng dương lịch, từ mồng 1 tới hết tháng. Dùng để tô màu lịch tháng.
 */
export function almanacForMonth(year: number, month: number): AlmanacDay[] {
  const out: AlmanacDay[] = [];
  let solar = Solar.fromYmd(year, month, 1);
  while (solar.getMonth() === month) {
    out.push(almanacForDate(solar.getYear(), solar.getMonth(), solar.getDay()));
    solar = solar.next(1);
  }
  return out;
}

/** Cộng/trừ ngày, trả về chuỗi YYYY-MM-DD — tránh bẫy lệch múi giờ của Date */
export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return Solar.fromYmd(y, m, d).next(days).toYmd();
}

export function todayYmd(): string {
  const n = new Date();
  return Solar.fromYmd(n.getFullYear(), n.getMonth() + 1, n.getDate()).toYmd();
}

export function parseYmd(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y, m, d];
}
