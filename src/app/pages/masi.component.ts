import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { EChartsOption } from 'echarts';
import { CompactPipe, NumPipe } from '../core/format';
import { MarketApiService } from '../core/market-api.service';
import { HistoryResponse, Load, OverviewResponse } from '../core/models';
import { ChangeComponent } from '../shared/change.component';
import { EchartComponent } from '../shared/echart.component';
import { QualityBadgeComponent } from '../shared/quality-badge.component';
import { RangeBarComponent } from '../shared/range-bar.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

const idle = { loading: true, value: null, error: null };

@Component({
  selector: 'app-masi',
  imports: [NumPipe, CompactPipe, ChangeComponent, EchartComponent, QualityBadgeComponent, RangeBarComponent, SourceNoteComponent, StateComponent],
  template: `
  <h1 class="page-title">MASI analytics</h1>
  <p class="page-sub">The Moroccan All Shares Index and how each sector moved today. The provider currently publishes MASI only, so MASI 20 and the official sector indices are not shown.</p>
  <app-state [loading]="ov().loading && !ov().value" [error]="ov().error ?? (ov().value?.indexStatus?.quality === 'UNAVAILABLE' ? ov().value?.indexStatus?.error : null)" />

  @if (idx(); as i) {
  <section class="cols">
    <div class="panel">
      <div class="flex items-center gap-3"><h2 class="panel-title !m-0">MASI</h2>@if (ov().value?.indexStatus; as st) { <app-quality [q]="st.quality" /> }</div>
      <div class="val num">{{ i.value | num }}</div>
      <app-change [abs]="i.change" [pct]="i.changePercent" />
      <app-range-bar [low]="i.low" [high]="i.high" [open]="i.open" [current]="i.value" />
      <table class="fin mt-3"><tbody>
        <tr><td class="muted">Open</td><td class="r">{{ i.open | num }}</td></tr>
        <tr><td class="muted">High</td><td class="r">{{ i.high | num }}</td></tr>
        <tr><td class="muted">Low</td><td class="r">{{ i.low | num }}</td></tr>
        <tr><td class="muted">Previous close</td><td class="r">{{ i.value !== null && i.change !== null ? (i.value - i.change | num) : '—' }}</td></tr>
      </tbody></table>
    </div>
    <div class="panel">
      <h2>Index history recorded by this app</h2>
      @if (chart(); as opt) { <app-echart [options]="opt" height="300px" label="MASI daily closes" /> }
      @else { <p class="muted">No MASI history yet. The backend stores one value per session from the day you start it; the chart appears after two sessions.</p> }
    </div>
  </section>
  }

  <section class="panel">
    <h2>Sectors today</h2>
    <p class="muted text-sm mt-0">Computed by this app from the covered stocks: market-cap-weighted change, with how many stocks rose or fell.</p>
    <div class="tbl-wrap"><table class="fin">
      <thead><tr><th>Sector</th><th class="r">Stocks</th><th class="r">Weighted change</th><th class="r">Up / down</th><th class="r">Market cap (MAD)</th></tr></thead>
      <tbody>@for (s of ov().value?.data?.sectors ?? []; track s.sector) {
        <tr><td>{{ s.sector }}</td><td class="r">{{ s.count }}</td><td class="r"><app-change [pct]="s.weightedChangePercent" /></td>
          <td class="r"><span style="color:var(--up)">{{ s.advancers }}</span> / <span style="color:var(--down)">{{ s.decliners }}</span></td><td class="r">{{ s.marketCap | compact }}</td></tr>
      } @empty { <tr><td colspan="5" class="muted">No sector data available.</td></tr> }</tbody>
    </table></div>
  </section>
  <p class="mt-3"><app-source-note [s]="ov().value?.indexStatus" /></p>`,
  styles: [`.cols{display:grid;grid-template-columns:minmax(280px,1fr) 2fr;gap:1rem;margin-bottom:1rem} .val{font-size:2.4rem;font-weight:800;letter-spacing:-.03em;margin:.5rem 0 .1rem}
    @media (max-width:1000px){.cols{grid-template-columns:1fr}}`],
})
export class MasiComponent {
  private readonly api = inject(MarketApiService);
  readonly ov = toSignal(this.api.overview(), { initialValue: idle as Load<OverviewResponse> });
  readonly hist = toSignal(this.api.indexHistory('MASI'), { initialValue: idle as Load<HistoryResponse> });
  readonly idx = computed(() => this.ov().value?.data?.index ?? null);
  readonly chart = computed<EChartsOption | null>(() => {
    const bars = (this.hist().value?.bars ?? []).filter((b) => b.close !== null);
    if (bars.length < 2) return null;
    const c = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return {
      grid: { left: 8, right: 16, top: 16, bottom: 24, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: bars.map((b) => b.date) },
      yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { color: c('--line') } } },
      series: [{ type: 'line', name: 'MASI close', data: bars.map((b) => b.close), symbol: 'circle', symbolSize: 5,
        lineStyle: { color: c('--brass'), width: 2 }, itemStyle: { color: c('--brass') },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: c('--brass') + '55' }, { offset: 1, color: c('--brass') + '00' }] } } }],
    };
  });
}
