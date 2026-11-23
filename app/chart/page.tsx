'use client';
import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import { useI18n } from '@/components/LocaleProvider';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import StarDetailPanel from '@/components/StarDetailPanel';
import StarField from '@/components/StarField';
import type { TimeView } from '@/components/TimeNav';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace, Star } from '@/lib/ziwei/types';

/**
 * 命盘页 —— 开源版「排盘引擎 Demo」
 *
 * 这是一个最小可运行示例：用本仓库的排盘引擎 generateChart() 配合基础 UI
 * 组件，渲染一张完整紫微命盘 + 基础解读，并支持本命 / 大限 / 流年切换。
 *
 * 说明：线上商业版的完整交互界面（重设计的新 UI、AI 流式解读、合盘、分享
 * 卡片等）不在开源范围内；但排盘内核——安星算法、四化、格局识别、古籍库——
 * 完全开放（见 lib/ziwei/*），可自由二次开发出你自己的界面。
 */
export default function ChartPage() {
  const { t } = useI18n();
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  // Bấm vào một ngôi sao → mở bảng chi tiết của nó bên cột phải
  const [selectedStar, setSelectedStar] = useState<{ star: Star; palaceName: string } | null>(null);
  // Bấm vào dấu tứ hoá của đại hạn / lưu niên → hỏi AI riêng về phi hoá đó
  const [selectedSiHua, setSelectedSiHua] = useState<
    { starName: string; siHua: string; view: TimeView } | null
  >(null);

  // ── 未起盘：展示出生信息表单 ──
  if (!chart) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('chart.title')}</h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14, lineHeight: 1.7 }}>
          {t('chart.subtitle')}
          <br />
          {t('chart.demoNote')}
        </p>
        <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
      </main>
    );
  }

  // ── 已起盘：命盘 + 解读 ──
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px', position: 'relative' }}>
      {/* Nền sao nhấp nháy — canvas cố định, không chắn thao tác (pointer-events: none) */}
      <StarField />

      <button
        type="button"
        onClick={() => {
          setChart(null);
          setSelectedPalace(null);
          setSelectedStar(null);
          setSelectedSiHua(null);
        }}
        style={{
          marginBottom: 16, padding: '6px 14px', cursor: 'pointer',
          border: '1px solid #ccc', borderRadius: 8, background: 'transparent',
        }}
      >
        {t('chart.back')}
      </button>

      {/* ChartBoard tự dựng TimeNav bên trong và tự giữ trạng thái bản mệnh /
          đại hạn / lưu niên, nên ở đây không dựng thêm một thanh nữa. */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
        style={{
          gap: 20, marginTop: 16, alignItems: 'start', position: 'relative', zIndex: 1,
        }}
      >
        <ChartBoard
          chart={chart}
          onPalaceSelect={setSelectedPalace}
          onStarSelect={(star, palace) => setSelectedStar({ star, palaceName: palace.name })}
          onSiHuaClick={(starName, siHua, view) => setSelectedSiHua({ starName, siHua, view })}
          activeStarName={selectedStar?.star.name ?? null}
        />

        <div className="flex flex-col gap-4">
          <StarDetailPanel
            star={selectedStar?.star ?? null}
            palaceName={selectedStar?.palaceName}
            onClose={() => setSelectedStar(null)}
          />
          <InsightPanel
            chart={chart}
            selectedPalace={selectedPalace}
            selectedSiHua={selectedSiHua}
          />
        </div>
      </div>
    </main>
  );
}
