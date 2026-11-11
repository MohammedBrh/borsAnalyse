import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { EChartsOption } from 'echarts';
import { CompactPipe, NumPipe } from '../core/format';
import { MarketApiService } from '../core/market-api.service';
import { Load, OverviewResponse, Sourced, Stock } from '../core/models';
import { ChangeComponent } from '../shared/change.component';
import { EchartComponent } from '../shared/echart.component';
import { MoversTableComponent } from '../shared/movers-table.component';
import { QualityBadgeComponent } from '../shared/quality-badge.component';
import { RangeBarComponent } from '../shared/range-bar.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NumPipe, CompactPipe, ChangeComponent, EchartComponent, MoversTableComponent, QualityBadgeComponent, RangeBarComponent, SourceNoteComponent, StateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly api = inject(MarketApiService);
  readonly ov = toSignal(this.api.overview(), { initialValue: { loading: true, value: null, error: null } as Load<OverviewResponse> });
  readonly all = toSignal(this.api.stocks(), { initialValue: { loading: true, value: null, error: null } as Load<Sourced<Stock[]>> });

  readonly data = computed(() => this.ov().value?.data ?? null);
  readonly idx = computed(() => this.data()?.index ?? null);
  readonly providerError = computed(() => this.ov().error ?? (this.ov().value?.quality === 'UNAVAILABLE' ? this.ov().value?.error : null));
  readonly staleNote = computed(() => this.ov().value?.quality === 'STALE' ? `The provider is not responding (${this.ov().value?.error}). Showing the last values kept by the backend.` : null);
  readonly byCap = computed(() => [...(this.all().value?.data ?? [])].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0)));

  readonly breadth = computed(() => {
    const b = this.data()?.breadth;
    if (!b) return null;
    const t = b.advancers + b.decliners + b.unchanged || 1;
    return { ...b, a: (b.advancers / t) * 100, d: (b.decliners / t) * 100, u: (b.unchanged / t) * 100 };
  });

  readonly sectorChart = computed<EChartsOption | null>(() => {
    const s = (this.data()?.sectors ?? []).filter((x) => x.weightedChangePercent !== null);
    if (!s.length) return null;
    const css = getComputedStyle(document.documentElement);
    const up = css.getPropertyValue('--up').trim(), down = css.getPropertyValue('--down').trim(), line = css.getPropertyValue('--line').trim();
    const rows = [...s].sort((a, b) => (a.weightedChangePercent ?? 0) - (b.weightedChangePercent ?? 0));
    return {
      grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${Number(v).toFixed(2)}%` },
      xAxis: { type: 'value', axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: line } } },
      yAxis: { type: 'category', data: rows.map((r) => `${r.sector} (${r.count})`), axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', barMaxWidth: 14, data: rows.map((r) => ({ value: r.weightedChangePercent, itemStyle: { color: (r.weightedChangePercent ?? 0) >= 0 ? up : down, borderRadius: 3 } })),
        label: { show: true, position: 'right', formatter: (p) => `${Number(p.value).toFixed(2)}%`, fontSize: 11, color: css.getPropertyValue('--text').trim(), textBorderWidth: 0 } }],
    };
  });
}
