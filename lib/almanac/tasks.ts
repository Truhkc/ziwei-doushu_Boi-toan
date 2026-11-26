import { almanacForDate, parseYmd, shiftDate, type AlmanacDay } from './day';

/**
 * Chọn ngày theo việc.
 *
 * Mỗi đầu việc đời thường ứng với một chùm thuật ngữ trong lịch cổ. Ví dụ
 * "cưới hỏi" không chỉ là 嫁娶 mà còn gồm 订盟 (đính ước), 纳采 (dạm ngõ),
 * 问名 (vấn danh) — các bước của cùng một nghi lễ. Ngày hợp là ngày có
 * thuật ngữ đó nằm trong mục NGHI; ngày phải loại là ngày có nó nằm trong
 * mục KỴ.
 */

export interface TaskDef {
  key: string;
  vi: string;
  /** Thuật ngữ chữ Hán tính là hợp với việc này */
  terms: string[];
}

export const TASKS: TaskDef[] = [
  { key: 'wedding',  vi: 'Cưới hỏi',            terms: ['嫁娶', '订盟', '纳采', '问名', '合帐', '冠笄', '归宁'] },
  { key: 'open',     vi: 'Khai trương, buôn bán', terms: ['开市', '交易', '立券', '纳财', '挂匾', '开仓', '出货财'] },
  { key: 'build',    vi: 'Động thổ, xây cất',   terms: ['动土', '起基', '竖柱', '上梁', '定磉', '修造', '盖屋', '作梁'] },
  { key: 'move',     vi: 'Nhập trạch, dọn nhà', terms: ['入宅', '移徙', '安床', '安门', '出火', '安香', '进人口'] },
  { key: 'travel',   vi: 'Xuất hành, đi xa',    terms: ['出行', '乘船', '赴任'] },
  { key: 'pray',     vi: 'Cầu phúc, tế lễ',     terms: ['祈福', '祭祀', '开光', '斋醮', '酬神', '求嗣', '塑绘'] },
  { key: 'contract', vi: 'Ký kết, nhậm chức',   terms: ['立券', '交易', '赴任', '雇佣', '入学', '习艺'] },
  { key: 'funeral',  vi: 'An táng, tang lễ',    terms: ['安葬', '破土', '启钻', '移柩', '立碑', '修坟', '合寿木', '除服'] },
  { key: 'heal',     vi: 'Chữa bệnh',           terms: ['求医', '治病', '针灸', '解除'] },
  { key: 'grooming', vi: 'Cắt tóc, may mặc',    terms: ['理发', '整手足甲', '沐浴', '裁衣'] },
  { key: 'farm',     vi: 'Trồng trọt, chăn nuôi', terms: ['栽种', '牧养', '纳畜', '造畜稠', '捕捉'] },
];

/** Hai câu phủ định toàn phần — gặp là loại, bất kể còn gì khác */
const BLANKET_BAD = ['诸事不宜', '馀事勿取'];

export interface TaskMatch {
  day: AlmanacDay;
  /** Thuật ngữ của việc này nằm trong mục NGHI của ngày, đã dịch */
  hits: string[];
  /** 0–100, càng cao càng hợp */
  score: number;
}

/**
 * Chấm một ngày cho một đầu việc.
 *
 * Trả về null khi ngày đó KỴ đúng việc đang hỏi, hoặc ngày đó mang câu phủ
 * định toàn phần. Loại thẳng chứ không chấm điểm thấp: một ngày ghi rõ
 * "kỵ cưới hỏi" thì không phải là ngày cưới điểm kém, mà là ngày không được
 * đem ra chọn.
 */
export function scoreDay(day: AlmanacDay, task: TaskDef): TaskMatch | null {
  if (day.yiZh.some(t => BLANKET_BAD.includes(t))) return null;
  if (day.jiZh.some(t => BLANKET_BAD.includes(t))) return null;
  if (day.jiZh.some(t => task.terms.includes(t))) return null;

  const hitsZh = day.yiZh.filter(t => task.terms.includes(t));
  if (hitsZh.length === 0) return null;

  // Điểm: phần lớn do số thuật ngữ trúng, cộng thêm nếu là ngày hoàng đạo.
  // Trần 100 để không có ngày nào vọt lên vì trúng quá nhiều chữ gần nghĩa.
  const base = Math.min(hitsZh.length, 4) * 18;
  const bonus = day.isGood ? 28 : 0;
  const score = Math.min(100, base + bonus);

  const idx = new Map(day.yiZh.map((zh, i) => [zh, i]));
  const hits = hitsZh.map(zh => day.yi[idx.get(zh)!]);

  return { day, hits, score };
}

/**
 * Tìm những ngày hợp với một đầu việc, kể từ `fromDate` trong `days` ngày.
 * Sắp theo điểm giảm dần, cùng điểm thì ngày gần hơn đứng trước.
 */
export function findGoodDays(
  taskKey: string,
  fromDate: string,
  days = 90,
  limit = 12,
): TaskMatch[] {
  const task = TASKS.find(t => t.key === taskKey);
  if (!task) return [];

  const out: TaskMatch[] = [];
  for (let i = 0; i < days; i++) {
    const [y, m, d] = parseYmd(shiftDate(fromDate, i));
    const match = scoreDay(almanacForDate(y, m, d), task);
    if (match) out.push(match);
  }

  out.sort((a, b) => b.score - a.score || a.day.date.localeCompare(b.day.date));
  return out.slice(0, limit);
}
