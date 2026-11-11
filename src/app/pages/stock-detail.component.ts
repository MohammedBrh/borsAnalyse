import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { EChartsOption } from 'echarts';
import { switchMap } from 'rxjs';
import { CompactPipe, NumPipe, PctPipe, fmtNum, fmtPct } from '../core/format';
import { MarketApiService } from '../core/market-api.service';
import { HistoryResponse, Level, LevelsResult, Load, Sourced, Stock } from '../core/models';
import { WatchlistService } from '../core/watchlist.service';
import { ChangeComponent } from '../shared/change.component';
import { EchartComponent } from '../shared/echart.component';
import { QualityBadgeComponent } from '../shared/quality-badge.component';
import { RangeBarComponent } from '../shared/range-bar.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

type Method = 'classic' | 'fibonacci' | 'intraday' | 'swing';
const idle = { loading: true, value: null, error: null };

@Component({
  selector: 'app-stock-detail',
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, MatIconModule, NumPipe, CompactPipe, PctPipe, ChangeComponent, EchartComponent, QualityBadgeComponent, RangeBarComponent, SourceNoteComponent, StateComponent],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.scss',
})
export class StockDetailComponent {
  /** Route param, bound by withComponentInputBinding(). */
  readonly symbol = input.required<string>();
  private readonly api = inject(MarketApiService);
  readonly watch = inject(WatchlistService);
  private readonly sym$ = toObservable(this.symbol);

  readonly stock = toSignal(this.sym$.pipe(switchMap((s) => this.api.stock(s))), { initialValue: idle as Load<Sourced<Stock>> });
  readonly lv = toSignal(this.sym$.pipe(switchMap((s) => this.api.levels(s))), { initialValue: idle as Load<Sourced<LevelsResult>> });
  readonly hist = toSignal(this.sym$.pipe(switchMap((s) => this.api.stockHistory(s))), { initialValue: idle as Load<HistoryResponse> });

  readonly s = computed(() => this.stock().value?.data ?? null);
  readonly L = computed(() => this.lv().value?.data ?? null);
  readonly error = computed(() => this.stock().error ?? (this.stock().value?.quality === 'UNAVAILABLE' ? this.stock().value?.error : null));
  readonly method = signal<Method>('classic');

  readonly methodHelp: Record<Method, string> = {
    classic: 'Floor-trader pivots from the last completed session: P = (High + Low + Close) / 3, then R1–R3 and S1–S3.',
    fibonacci: 'Same pivot P, with resistances and supports at 38.2%, 61.8% and 100% of the previous session’s range.',
    intraday: 'Prices the market actually touched today: the session high and low, the open and the previous close.',
    swing: 'From the daily bars this app has recorded: the 20-session high/low and recent swing highs and lows.',
  };

  /** Ladder rows: levels of the chosen method, sorted high→low, with the current price inserted. */
  readonly ladder = computed(() => {
    const l = this.L();
    if (!l) return [];
    const levels: Level[] = l[this.method()] ?? [];
    const rows: ({ type: 'level'; level: Level } | { type: 'price'; price: number })[] =
      [...levels].sort((a, b) => b.price - a.price).map((level) => ({ type: 'level' as const, level }));
    if (l.price !== null) {
      const at = rows.findIndex((r) => r.type === 'level' && r.level.price < l.price!);
      rows.splice(at === -1 ? rows.length : at, 0, { type: 'price', price: l.price });
    }
    return rows;
  });

  readonly maxDist = computed(() => Math.max(1, ...(this.L()?.[this.method()] ?? []).map((x) => Math.abs(x.distancePercent ?? 0))));

  readonly summary = computed(() => {
    const l = this.L();
    if (!l || l.price === null) return null;
    const d = (x: Level | null) => x ? `${fmtNum(x.price)} MAD (${x.label}, ${this.methodName(x.method)}, ${fmtPct(x.distancePercent)})` : 'none found';
    return { res: d(l.nearestResistance), sup: d(l.nearestSupport) };
  });

  readonly chart = computed<EChartsOption | null>(() => {
    const bars = (this.hist().value?.bars ?? []).filter((b) => b.open !== null && b.close !== null && b.low !== null && b.high !== null);
    if (bars.length < 2) return null;
    const css = getComputedStyle(document.documentElement);
    const c = (n: string) => css.getPropertyValue(n).trim();
    const l = this.L();
    const marks = (l?.classic ?? []).filter((x) => ['R1', 'P', 'S1'].includes(x.label))
      .map((x) => ({ yAxis: x.price, name: x.label, lineStyle: { color: x.label === 'P' ? c('--brass') : x.label.startsWith('R') ? c('--down') : c('--up'), type: 'dashed' as const } }));
    return {
      grid: { left: 8, right: 56, top: 16, bottom: 28, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: bars.map((b) => b.date + (b.complete ? '' : ' (in progress)')) },
      yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { color: c('--line') } } },
      series: [{
        type: 'candlestick', name: this.symbol(),
        data: bars.map((b) => [b.open, b.close, b.low, b.high]),
        itemStyle: { color: c('--up'), color0: c('--down'), borderColor: c('--up'), borderColor0: c('--down') },
        markLine: { symbol: 'none', label: { formatter: '{b} {c}', color: c('--muted') }, data: marks },
      }],
    };
  });

  methodName(m: Level['method']) {
    return { 'pivot-classic': 'classic pivot', 'pivot-fibonacci': 'Fibonacci pivot', intraday: 'today', swing: 'swing' }[m];
  }
  barWidth(l: Level) { return Math.max(4, (Math.abs(l.distancePercent ?? 0) / this.maxDist()) * 100); }
}
