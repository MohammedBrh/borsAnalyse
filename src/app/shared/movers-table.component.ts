import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CompactPipe, NumPipe } from '../core/format';
import { Stock } from '../core/models';
import { ChangeComponent } from './change.component';

@Component({
  selector: 'app-movers',
  imports: [NumPipe, CompactPipe, ChangeComponent],
  template: `
  <div class="tbl-wrap"><table class="fin">
    <thead><tr><th>Stock</th><th class="r">Last (MAD)</th><th class="r">Change</th>
      @if (show() === 'turnover') { <th class="r">Traded value</th> }
      @if (show() === 'volume') { <th class="r">Volume</th> }
      @if (show() === 'marketCap') { <th class="r">Market cap</th> }</tr></thead>
    <tbody>
      @for (s of stocks(); track s.symbol) {
        <tr class="link" (click)="open(s)" (keydown.enter)="open(s)" tabindex="0">
          <td><strong>{{ s.symbol }}</strong><div class="muted name">{{ s.name ?? '' }}</div></td>
          <td class="r">{{ s.price | num }}</td>
          <td class="r"><app-change [pct]="s.changePercent" /></td>
          @if (show() === 'turnover') { <td class="r">{{ s.turnover | compact }}</td> }
          @if (show() === 'volume') { <td class="r">{{ s.volume | num: 0 }}</td> }
          @if (show() === 'marketCap') { <td class="r">{{ s.marketCap | compact }}</td> }
        </tr>
      } @empty { <tr><td colspan="4" class="muted">{{ empty() }}</td></tr> }
    </tbody>
  </table></div>`,
  styles: [`.name{font-size:.75rem;max-width:22ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`],
})
export class MoversTableComponent {
  readonly stocks = input<Stock[]>([]);
  readonly show = input<'turnover' | 'volume' | 'marketCap' | null>(null);
  readonly empty = input('No stocks in this list right now.');
  private readonly router = inject(Router);
  open(s: Stock) { this.router.navigate(['/stocks', s.symbol]); }
}
