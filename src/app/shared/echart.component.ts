import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { BarChart, CandlestickChart, LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register only what the dashboard uses (keeps the bundle small).
echarts.use([BarChart, LineChart, CandlestickChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);
import { ThemeService } from '../core/theme.service';
import { inject } from '@angular/core';

/** Minimal ECharts host: re-renders on option or theme change, resizes with its box. */
@Component({
  selector: 'app-echart',
  template: `<div #host class="w-full" [style.height]="height()" role="img" [attr.aria-label]="label()"></div>`,
})
export class EchartComponent implements AfterViewInit, OnDestroy {
  readonly options = input.required<EChartsOption>();
  readonly height = input('280px');
  readonly label = input('Chart');
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private chart?: echarts.EChartsType;
  private ro?: ResizeObserver;
  private readonly theme = inject(ThemeService);

  constructor() {
    effect(() => {
      const opt = this.options();
      this.theme.dark();
      if (this.chart) this.chart.setOption(this.withTheme(opt), true);
    });
  }

  ngAfterViewInit() {
    this.chart = echarts.init(this.host().nativeElement, undefined, { renderer: 'canvas' });
    this.chart.setOption(this.withTheme(this.options()), true);
    this.ro = new ResizeObserver(() => this.chart?.resize());
    this.ro.observe(this.host().nativeElement);
  }

  ngOnDestroy() { this.ro?.disconnect(); this.chart?.dispose(); }

  private withTheme(o: EChartsOption): EChartsOption {
    const css = getComputedStyle(document.documentElement);
    const v = (n: string) => css.getPropertyValue(n).trim();
    return {
      backgroundColor: 'transparent',
      textStyle: { fontFamily: 'Manrope, system-ui, sans-serif', color: v('--muted') },
      ...o,
    };
  }
}
