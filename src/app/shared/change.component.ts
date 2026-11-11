import { Component, computed, input } from '@angular/core';
import { fmtNum, fmtPct, trend } from '../core/format';

/** Coloured change: green up, red down, neutral when unchanged or unknown. */
@Component({
  selector: 'app-change',
  template: `<span class="chg {{ dir() }}">@if (dir() !== 'flat') {<span aria-hidden="true">{{ dir() === 'up' ? '▲' : '▼' }}</span>}
    @if (abs() !== undefined) { {{ absText() }} } @if (pct() !== undefined) { <span [class.paren]="abs() !== undefined">{{ pctText() }}</span> }</span>`,
  styles: [`.chg{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--muted)} .up{color:var(--up)} .down{color:var(--down)} .paren{opacity:.85}`],
})
export class ChangeComponent {
  readonly abs = input<number | null | undefined>(undefined);
  readonly pct = input<number | null | undefined>(undefined);
  readonly digits = input(2);
  readonly dir = computed(() => trend(this.pct() ?? this.abs()));
  readonly absText = computed(() => { const v = this.abs(); return v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${fmtNum(v, this.digits())}`; });
  readonly pctText = computed(() => fmtPct(this.pct()));
}
