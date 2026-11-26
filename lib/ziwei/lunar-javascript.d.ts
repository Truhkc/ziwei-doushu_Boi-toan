declare module 'lunar-javascript' {
  class Lunar {
    /** month 为负表示闰月（如 -5 = 闰五月） */
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getMonth(): number;  // negative = leap month
    getDay(): number;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    /** 换算成公历(2026-08-05 补声明:lib/ziwei/share.ts 早在用，只是从前靠 as any 绕过) */
    getSolar(): Solar;

    /* ── 黄历(2026-11-26 补:lib/almanac 用;以下方法 runtime 都在,
          只是上游 .d.ts 没声明。每一个都在加进来前跑过一遍确认) ── */
    /** 干支,两字,如 "甲辰" */
    getDayInGanZhi(): string;
    getMonthInGanZhi(): string;
    getYearInGanZhi(): string;
    /** 农历日/月的汉字写法,如 "十八" / "十" */
    getDayInChinese(): string;
    getMonthInChinese(): string;
    /** 值日天神,如 "司命";12 个之一 */
    getDayTianShen(): string;
    /** "黄道" 或 "黑道" */
    getDayTianShenType(): string;
    /** "吉" 或 "凶" */
    getDayTianShenLuck(): string;
    /** 建除十二神,如 "执" */
    getZhiXing(): string;
    /** 宜 / 忌,每项都是汉语词,如 "嫁娶" */
    getDayYi(): string[];
    getDayJi(): string[];
    /** 冲,如 "(戊戌)狗" */
    getDayChongDesc(): string;
    /** 纳音,如 "覆灯火" */
    getDayNaYin(): string;
    /** 二十八宿,单字,如 "奎" */
    getXiu(): string;
    /** 当天交的节气;不交节气时为空字符串 */
    getJieQi(): string;
  }

  class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    /** 前后推 n 天(n 可为负) */
    next(days: number): Solar;
    /** "YYYY-MM-DD" */
    toYmd(): string;
    /** 0 = 周日 */
    getWeek(): number;
  }

  /** 农历月信息(2026-06-10 补:闰月大小月边界 clamp 用) */
  class LunarMonth {
    /** month 为负表示闰月(如 -5 = 闰五月);查无此月返回 null */
    static fromYm(year: number, month: number): LunarMonth | null;
    getDayCount(): number;
  }
}
