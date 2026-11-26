/**
 * Canh lớp Hán–Việt của lịch cổ truyền.
 *
 * `lunar-javascript` sinh ra thuật ngữ bằng chữ Hán từ một tập hữu hạn. Nếu
 * thiếu một chữ trong bảng dịch, `viActivity()` lùi lặng lẽ về chữ gốc —
 * chữ Hán hiện ra giữa trang tiếng Việt mà không ai hay. Bài này quét sáu
 * năm lịch để bắt đúng cái lùi lặng lẽ đó, và sẽ gãy ngay nếu thư viện nâng
 * phiên bản mà thêm thuật ngữ mới.
 */
import { Solar } from 'lunar-javascript';
import { VI_ACTIVITY, VI_DAY_GOD, VI_NAYIN, VI_XIU, VI_ZHI_XING } from '../../lib/almanac/terms';
import { almanacForDate } from '../../lib/almanac/day';
import { TASKS, findGoodDays, scoreDay } from '../../lib/almanac/tasks';

let failures = 0;
function check(ok: boolean, msg: string) {
  if (!ok) {
    console.error('  ✗ ' + msg);
    failures++;
  }
}

// ── 1. Quét sáu năm, gom mọi thuật ngữ thư viện có thể sinh ra ──────────
const activities = new Set<string>();
const gods = new Set<string>();
const zhiXings = new Set<string>();
const xius = new Set<string>();
const naYins = new Set<string>();

let solar = Solar.fromYmd(2024, 1, 1);
const DAYS = 365 * 6;
for (let i = 0; i < DAYS; i++) {
  const lunar = solar.getLunar();
  lunar.getDayYi().forEach((t: string) => activities.add(t));
  lunar.getDayJi().forEach((t: string) => activities.add(t));
  gods.add(lunar.getDayTianShen());
  zhiXings.add(lunar.getZhiXing());
  xius.add(lunar.getXiu());
  naYins.add(lunar.getDayNaYin());
  solar = solar.next(1);
}

const missingAct = [...activities].filter(t => !(t in VI_ACTIVITY));
const missingGod = [...gods].filter(t => !(t in VI_DAY_GOD));
const missingZhi = [...zhiXings].filter(t => !(t in VI_ZHI_XING));
const missingXiu = [...xius].filter(t => !(t in VI_XIU));
const missingNaYin = [...naYins].filter(t => !(t in VI_NAYIN));

check(missingAct.length === 0, `thiếu Hán–Việt cho ${missingAct.length} chữ Nghi/Kỵ: ${missingAct.join(' ')}`);
check(missingGod.length === 0, `thiếu Hán–Việt cho thiên thần: ${missingGod.join(' ')}`);
check(missingZhi.length === 0, `thiếu Hán–Việt cho trực: ${missingZhi.join(' ')}`);
check(missingXiu.length === 0, `thiếu Hán–Việt cho tú: ${missingXiu.join(' ')}`);
check(missingNaYin.length === 0, `thiếu Hán–Việt cho nạp âm: ${missingNaYin.join(' ')}`);

// ── 2. Không chữ Hán nào được lọt ra bản dịch ───────────────────────────
const HAN = /[一-鿿]/;
const leaked = [...Object.entries(VI_ACTIVITY), ...Object.entries(VI_NAYIN)]
  .filter(([, vi]) => HAN.test(vi));
check(leaked.length === 0, `bản dịch còn lẫn chữ Hán: ${leaked.map(([k]) => k).join(' ')}`);

// ── 3. Sáu vị hoàng đạo, sáu vị hắc đạo — đúng định nghĩa cổ ────────────
const goodGods = Object.values(VI_DAY_GOD).filter(g => g.good).length;
check(goodGods === 6, `phải có đúng 6 thiên thần hoàng đạo, đang có ${goodGods}`);
check(Object.keys(VI_DAY_GOD).length === 12, 'phải có đúng 12 thiên thần');
check(Object.keys(VI_ZHI_XING).length === 12, 'phải có đúng 12 trực');
check(Object.keys(VI_XIU).length === 28, 'phải có đúng 28 tú');
check(Object.keys(VI_NAYIN).length === 30, 'phải có đúng 30 nạp âm');

// ── 4. Mọi thuật ngữ trong bảng việc đều có thật ────────────────────────
for (const task of TASKS) {
  const unknown = task.terms.filter(t => !(t in VI_ACTIVITY));
  check(unknown.length === 0, `việc "${task.vi}" dùng thuật ngữ lạ: ${unknown.join(' ')}`);
  const unseen = task.terms.filter(t => !activities.has(t));
  check(unseen.length === 0, `việc "${task.vi}" dùng thuật ngữ thư viện không bao giờ sinh ra: ${unseen.join(' ')}`);
}

// ── 5. Ngày kỵ đúng việc thì phải bị loại, không phải chấm điểm thấp ────
const wedding = TASKS.find(t => t.key === 'wedding')!;
let rejectedCount = 0;
let acceptedCount = 0;
let s = Solar.fromYmd(2026, 1, 1);
for (let i = 0; i < 365; i++) {
  const day = almanacForDate(s.getYear(), s.getMonth(), s.getDay());
  const m = scoreDay(day, wedding);
  if (m === null) {
    rejectedCount++;
    // nếu bị loại thì phải có lý do: kỵ đúng việc, hoặc không hề nghi việc đó
    const kyDungViec = day.jiZh.some(t => wedding.terms.includes(t));
    const khongNghi = !day.yiZh.some(t => wedding.terms.includes(t));
    const phuDinhToanPhan = [...day.yiZh, ...day.jiZh].some(t => t === '诸事不宜' || t === '馀事勿取');
    check(kyDungViec || khongNghi || phuDinhToanPhan, `ngày ${day.date} bị loại mà không rõ lý do`);
  } else {
    acceptedCount++;
    check(m.score > 0 && m.score <= 100, `điểm ngày ${day.date} ra ngoài khoảng 0–100: ${m.score}`);
    check(m.hits.length > 0, `ngày ${day.date} được nhận mà không nêu được lý do`);
    check(!day.jiZh.some(t => wedding.terms.includes(t)), `ngày ${day.date} kỵ cưới hỏi mà vẫn lọt`);
  }
  s = s.next(1);
}
check(acceptedCount > 0, 'cả năm 2026 không có ngày nào hợp cưới hỏi — bảng việc hỏng');
check(rejectedCount > 0, 'cả năm 2026 không loại ngày nào — bộ lọc không chạy');

// ── 6. Kết quả tìm ngày phải sắp đúng và không vượt giới hạn ────────────
for (const task of TASKS) {
  const picks = findGoodDays(task.key, '2026-01-01', 90, 9);
  check(picks.length <= 9, `việc "${task.vi}" trả về quá giới hạn: ${picks.length}`);
  for (let i = 1; i < picks.length; i++) {
    const a = picks[i - 1], b = picks[i];
    check(
      a.score > b.score || (a.score === b.score && a.day.date <= b.day.date),
      `việc "${task.vi}" sắp sai thứ tự ở vị trí ${i}`,
    );
  }
}

// ── 7. Ngày mốc đã tra tay, canh cho lớp dịch không trôi ────────────────
const probe = almanacForDate(2026, 11, 26);
check(probe.dayGanZhi === 'Giáp Thìn', `can chi ngày 26/11/2026 phải là Giáp Thìn, đang ra "${probe.dayGanZhi}"`);
check(probe.godVi === 'Tư Mệnh', `thiên thần phải là Tư Mệnh, đang ra "${probe.godVi}"`);
check(probe.isGood === true, 'ngày 26/11/2026 phải là hoàng đạo');
check(probe.zhiXingVi === 'Chấp', `trực phải là Chấp, đang ra "${probe.zhiXingVi}"`);
check(probe.dayBranchVi === 'Thìn', `địa chi ngày phải là Thìn, đang ra "${probe.dayBranchVi}"`);
check(probe.yi.includes('Cưới hỏi'), 'ngày 26/11/2026 phải có NGHI "Cưới hỏi"');
check(probe.ji.includes('Động thổ'), 'ngày 26/11/2026 phải có KỴ "Động thổ"');
check(probe.naYin === 'Phúc Đăng Hoả', `nạp âm phải là Phúc Đăng Hoả, đang ra "${probe.naYin}"`);

if (failures > 0) {
  console.error(`\n[almanac-coverage] ${failures} lỗi`);
  process.exit(1);
}
console.log(
  `[almanac-coverage] ${activities.size} chữ Nghi/Kỵ · ${gods.size} thiên thần · ` +
  `${zhiXings.size} trực · ${xius.size} tú · ${naYins.size} nạp âm: đều có Hán–Việt. ` +
  `${TASKS.length} đầu việc lọc ngày đúng quy tắc.`,
);
