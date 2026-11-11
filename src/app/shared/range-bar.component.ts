import { Component, computed, input } from '@angular/core';
import { fmtNum } from '../core/format';

/** Day range: low ─ open ─ current ─ high on one track. Renders nothing if low/high are missing. */
@Component({
  selector: 'app-range-bar',
  template: `@if (ok()) {
  <div class="rb" role="img" [attr.aria-label]="aria()">
    <div class="track"><div class="fill" [style.left.%]="fillL()" [style.width.%]="fillW()" [class.down]="down()"></div>
      @if (openPos() !== null) { <span class="tick" [style.left.%]="openPos()" title="Open"></span> }
      <span class="dot" [style.left.%]="curPos()"></span></div>
    <div class="lbl"><span>Low {{ f(low()) }}</span><span>High {{ f(high()) }}</span></div>
  </div> }`,
  styles: [`
    .rb{width:100%} .track{position:relative;height:6px;border-radius:3px;background:var(--line);margin:.6rem 0 .35rem}
    .fill{position:absolute;top:0;bottom:0;border-radius:3px;background:var(--up)} .fill.down{background:var(--down)}
    .tick{position:absolute;top:-4px;width:2px;height:14px;background:var(--muted);transform:translateX(-1px)}
    .dot{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--ink);transform:translate(-50%,-50%)}
    .lbl{display:flex;justify-content:space-between;font-size:.75rem;color:var(--muted);font-variant-numeric:tabular-nums}`],
})
export class RangeBarComponent {
  readonly low = input<number | null>(null);
  readonly high = input<number | null>(null);
  readonly open = input<number | null>(null);
  readonly current = input<number | null>(null);
  readonly ok = computed(() => this.low() !== null && this.high() !== null && this.current() !== null);
  private pos(v: number | null) {
    const l = this.low()!, h = this.high()!;
    if (v === null) return null;
    return h === l ? 50 : Math.min(100, Math.max(0, ((v - l) / (h - l)) * 100));
  }
  readonly curPos = computed(() => this.pos(this.current()));
  readonly openPos = computed(() => this.pos(this.open()));
  readonly down = computed(() => this.open() !== null && this.current()! < this.open()!);
  readonly fillL = computed(() => Math.min(this.openPos() ?? 0, this.curPos() ?? 0));
  readonly fillW = computed(() => Math.abs((this.curPos() ?? 0) - (this.openPos() ?? 0)));
  readonly aria = computed(() => `Day range from ${fmtNum(this.low())} to ${fmtNum(this.high())}, current ${fmtNum(this.current())}`);
  f(v: number | null) { return fmtNum(v); }
}
