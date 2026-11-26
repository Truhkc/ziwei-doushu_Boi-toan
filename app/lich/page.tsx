'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useI18n } from '@/components/LocaleProvider';
import Luopan from '@/components/Luopan';
import InkMountains from '@/components/InkMountains';
import {
  almanacForDate,
  almanacForMonth,
  parseYmd,
  shiftDate,
  todayYmd,
} from '@/lib/almanac/day';
import { TASKS, findGoodDays } from '@/lib/almanac/tasks';

/**
 * Ngày hoàng đạo.
 *
 * La bàn là tâm trang, không phải đồ trang trí: kéo nó là đổi ngày. Dưới la
 * bàn là bản ghi của ngày đang chọn, rồi lịch tháng tô màu hoàng/hắc đạo,
 * cuối cùng là phần chọn ngày theo việc.
 */

const WEEKDAY_VI = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function useColors(dark: boolean) {
  return {
    text: dark ? '#EDE6D6' : '#221E18',
    muted: dark ? '#9FADB6' : '#6B6356',
    faint: dark ? 'rgba(237,230,214,0.46)' : '#99907F',
    gold: dark ? '#E2C379' : '#7A5F2E',
    goldLine: dark ? 'rgba(226,195,121,0.36)' : 'rgba(122,95,46,0.34)',
    card: dark ? 'rgba(243,236,220,0.035)' : 'rgba(251,247,238,0.86)',
    cardBord: dark ? 'rgba(243,236,220,0.09)' : 'rgba(20,17,13,0.12)',
    good: dark ? '#7FBE9C' : '#3F7A58',
    bad: dark ? '#D08A74' : '#A6412E',
  };
}

export default function LichPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { locale } = useI18n();
  const dark = theme === 'dark';
  const c = useColors(dark);

  const [date, setDate] = useState<string>(() => todayYmd());
  const [task, setTask] = useState<string>('wedding');

  const day = useMemo(() => {
    const [y, m, d] = parseYmd(date);
    return almanacForDate(y, m, d);
  }, [date]);

  const month = useMemo(() => almanacForMonth(day.year, day.month), [day.year, day.month]);
  const picks = useMemo(() => findGoodDays(task, todayYmd(), 90, 9), [task]);

  /** Ô trống đầu tháng để mồng 1 rơi đúng cột thứ của nó */
  const lead = month.length ? month[0].weekday : 0;

  const vn = locale === 'vi';

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh' }} className="relative overflow-x-hidden">
      <InkMountains height={360} opacity={dark ? 0.5 : 0.42} water={false} />

      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4">
        <button
          onClick={() => router.push('/')}
          className="text-[11px] sm:text-xs tracking-[0.3em]"
          style={{ color: c.gold }}
        >
          ← {vn ? 'Lá số Tử Vi' : '紫微命盘'}
        </button>
        <button
          onClick={() => setDate(todayYmd())}
          className="text-[11px] sm:text-xs tracking-[0.18em] px-3 py-1.5 rounded-full"
          style={{ color: c.gold, border: `1px solid ${c.goldLine}` }}
        >
          {vn ? 'Về hôm nay' : '回到今天'}
        </button>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-[980px] px-5 sm:px-8 pb-24">
        <header className="pt-6 pb-10 text-center">
          <p className="text-[10px] tracking-[0.45em] mb-3" style={{ color: c.faint }}>
            {vn ? 'LỊCH CỔ TRUYỀN' : '黄历'}
          </p>
          <h1
            className="ink-title gold-lit"
            style={{ fontSize: 'clamp(34px, 6vw, 58px)', letterSpacing: '0.04em', fontWeight: 600 }}
          >
            {vn ? 'Ngày hoàng đạo' : '黄道吉日'}
          </h1>
        </header>

        {/* ── La bàn: kéo để đổi ngày ── */}
        <section className="flex flex-col items-center">
          <Luopan
            branch={day.dayBranchZh}
            onStep={steps => setDate(d => shiftDate(d, steps))}
            size={320}
          />

          <div className="mt-6 flex items-center gap-5">
            <button
              onClick={() => setDate(d => shiftDate(d, -1))}
              className="text-xl px-3 py-1 rounded-full"
              style={{ color: c.gold, border: `1px solid ${c.goldLine}` }}
              aria-label={vn ? 'Ngày trước' : '前一天'}
            >
              ‹
            </button>
            <div className="text-center min-w-[190px]">
              <div className="text-2xl font-semibold" style={{ color: c.text }}>
                {day.day}/{day.month}/{day.year}
              </div>
              <div className="text-[11px] tracking-[0.2em] mt-1" style={{ color: c.muted }}>
                {vn ? WEEKDAY_VI[day.weekday] : `星期${day.weekday}`} ·{' '}
                {vn
                  ? `âm ${day.lunarDayNum}/${day.lunarMonthNum}${day.isLeapMonth ? ' nhuận' : ''}`
                  : `农历${day.lunarMonth}月${day.lunarDay}`}
              </div>
            </div>
            <button
              onClick={() => setDate(d => shiftDate(d, 1))}
              className="text-xl px-3 py-1 rounded-full"
              style={{ color: c.gold, border: `1px solid ${c.goldLine}` }}
              aria-label={vn ? 'Ngày sau' : '后一天'}
            >
              ›
            </button>
          </div>

          <label className="mt-4 text-[11px] tracking-[0.14em]" style={{ color: c.faint }}>
            {vn ? 'hoặc chọn ngày: ' : '或选择日期：'}
            <input
              type="date"
              value={date}
              onChange={e => e.target.value && setDate(e.target.value)}
              className="ml-2 bg-transparent px-2 py-1 rounded"
              style={{ color: c.text, border: `1px solid ${c.cardBord}`, colorScheme: dark ? 'dark' : 'light' }}
            />
          </label>
        </section>

        {/* ── Bản ghi của ngày ── */}
        <section className="mt-12">
          <div
            className="rounded-2xl px-6 py-6"
            style={{ background: c.card, border: `1px solid ${c.cardBord}` }}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-5 mb-5"
              style={{ borderBottom: `1px solid ${c.cardBord}` }}>
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{
                  color: day.isGood ? c.good : c.bad,
                  border: `1px solid ${day.isGood ? c.good : c.bad}`,
                  opacity: 0.95,
                }}
              >
                {day.isGood ? (vn ? 'Hoàng đạo' : '黄道') : (vn ? 'Hắc đạo' : '黑道')}
              </span>
              <span className="text-sm" style={{ color: c.muted }}>
                {vn ? 'Thiên thần' : '天神'}: <strong style={{ color: c.text }}>{day.godVi}</strong>
              </span>
              <span className="text-sm" style={{ color: c.muted }}>
                {vn ? 'Trực' : '值日'}: <strong style={{ color: c.text }}>{day.zhiXingVi}</strong>
              </span>
              <span className="text-sm" style={{ color: c.muted }}>
                {vn ? 'Ngày' : '日'}: <strong style={{ color: c.text }}>{day.dayGanZhi}</strong>
              </span>
            </div>

            {day.zhiXingGist && (
              <p className="text-center text-[13px] leading-relaxed mb-6" style={{ color: c.muted }}>
                {day.zhiXingGist}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[11px] tracking-[0.3em] mb-3" style={{ color: c.good }}>
                  {vn ? 'NÊN' : '宜'}
                </h3>
                <ul className="space-y-1.5">
                  {day.yi.map((t, i) => (
                    <li key={i} className="text-[13px] leading-snug" style={{ color: c.text }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] tracking-[0.3em] mb-3" style={{ color: c.bad }}>
                  {vn ? 'KIÊNG' : '忌'}
                </h3>
                <ul className="space-y-1.5">
                  {day.ji.map((t, i) => (
                    <li key={i} className="text-[13px] leading-snug" style={{ color: c.text }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-5 flex flex-wrap gap-x-6 gap-y-2 text-[12px]"
              style={{ borderTop: `1px solid ${c.cardBord}`, color: c.muted }}>
              <span>{vn ? 'Xung' : '冲'}: {day.chong}</span>
              <span>{vn ? 'Nạp âm' : '纳音'}: {day.naYin}</span>
              <span>{vn ? 'Tú' : '宿'}: {day.xiuVi}</span>
              <span>{vn ? 'Tháng' : '月'}: {day.monthGanZhi}</span>
              <span>{vn ? 'Năm' : '年'}: {day.yearGanZhi}</span>
              {day.jieQi && <span style={{ color: c.gold }}>{day.jieQi}</span>}
            </div>
          </div>
        </section>

        {/* ── Lịch tháng, tô màu hoàng/hắc đạo ── */}
        <section className="mt-12">
          <h2 className="text-[11px] tracking-[0.35em] mb-4 text-center" style={{ color: c.faint }}>
            {vn ? `THÁNG ${day.month}/${day.year}` : `${day.year}年${day.month}月`}
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_SHORT.map(w => (
              <div key={w} className="text-center text-[10px] py-1" style={{ color: c.faint }}>
                {w}
              </div>
            ))}
            {Array.from({ length: lead }, (_, i) => <div key={`lead${i}`} />)}
            {month.map(d => {
              const on = d.date === date;
              return (
                <button
                  key={d.date}
                  onClick={() => setDate(d.date)}
                  className="rounded-lg py-2 text-center transition-colors"
                  style={{
                    background: on ? (dark ? 'rgba(226,195,121,0.14)' : 'rgba(154,123,64,0.12)') : c.card,
                    border: `1px solid ${on ? c.gold : c.cardBord}`,
                  }}
                  aria-current={on ? 'date' : undefined}
                >
                  <div className="text-[13px] font-medium" style={{ color: c.text }}>{d.day}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: d.isGood ? c.good : c.bad }}>
                    {d.isGood ? (vn ? 'hoàng' : '黄') : (vn ? 'hắc' : '黑')}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Chọn ngày theo việc ── */}
        <section className="mt-14">
          <h2 className="text-[11px] tracking-[0.35em] mb-1 text-center" style={{ color: c.faint }}>
            {vn ? 'CHỌN NGÀY THEO VIỆC' : '按事择日'}
          </h2>
          <p className="text-center text-[12px] mb-5" style={{ color: c.muted }}>
            {vn
              ? 'Những ngày hợp nhất trong 90 ngày tới, kể từ hôm nay'
              : '自今日起 90 天内最相宜的日子'}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {TASKS.map(t => {
              const on = t.key === task;
              return (
                <button
                  key={t.key}
                  onClick={() => setTask(t.key)}
                  className="px-3 py-1.5 rounded-full text-[12px] transition-colors"
                  style={{
                    color: on ? c.gold : c.muted,
                    border: `1px solid ${on ? c.gold : c.cardBord}`,
                    background: on ? (dark ? 'rgba(226,195,121,0.10)' : 'rgba(154,123,64,0.08)') : 'transparent',
                  }}
                >
                  {t.vi}
                </button>
              );
            })}
          </div>

          {picks.length === 0 ? (
            <p className="text-center text-[13px]" style={{ color: c.muted }}>
              {vn
                ? 'Không có ngày nào thật hợp việc này trong 90 ngày tới.'
                : '未来 90 天内没有特别相宜的日子。'}
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {picks.map(p => (
                <button
                  key={p.day.date}
                  onClick={() => setDate(p.day.date)}
                  className="text-left rounded-xl px-4 py-3 transition-colors"
                  style={{ background: c.card, border: `1px solid ${c.cardBord}` }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold" style={{ color: c.text }}>
                      {p.day.day}/{p.day.month}
                    </span>
                    <span className="text-[10px]" style={{ color: p.day.isGood ? c.good : c.muted }}>
                      {p.day.isGood ? (vn ? 'hoàng đạo' : '黄道') : (vn ? 'hắc đạo' : '黑道')}
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.faint }}>
                    {vn ? WEEKDAY_VI[p.day.weekday] : ''} · {p.day.dayGanZhi}
                  </div>
                  <div className="text-[11px] mt-2 leading-snug" style={{ color: c.muted }}>
                    {p.hits.slice(0, 3).join(' · ')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <p className="mt-16 text-center text-[11px] leading-relaxed" style={{ color: c.faint }}>
          {vn
            ? 'Lịch cổ truyền chỉ để tham khảo · vận mệnh nằm trong tay bạn'
            : '黄历仅供参考 · 命运在你自己手中'}
        </p>
      </main>
    </div>
  );
}
