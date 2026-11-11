import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NumPipe } from '../core/format';
import { MarketApiService } from '../core/market-api.service';
import { Load, Sourced, Stock } from '../core/models';
import { WatchlistService } from '../core/watchlist.service';
import { ChangeComponent } from '../shared/change.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

@Component({
  selector: 'app-watchlist',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, NumPipe, ChangeComponent, SourceNoteComponent, StateComponent],
  template: `
  <h1 class="page-title">Watchlist</h1>
  <p class="page-sub">Stocks you starred, saved in this browser. "Since added" compares today’s price with the price when you starred it.</p>
  <app-state [loading]="res().loading && !res().value" [error]="res().error" />
  <div class="panel">
    @if (rows().length) {
    <div class="tbl-wrap"><table class="fin">
      <thead><tr><th>Stock</th><th class="r">Last (MAD)</th><th class="r">Today</th><th class="r">Since added</th><th class="r">Day range</th><th>Added</th><th></th></tr></thead>
      <tbody>@for (r of rows(); track r.item.symbol) {
        <tr class="link" (click)="open(r.item.symbol)" (keydown.enter)="open(r.item.symbol)" tabindex="0">
          <td><strong>{{ r.item.symbol }}</strong><div class="muted" style="font-size:.75rem">{{ r.stock?.name ?? 'Open to load the quote' }}</div></td>
          <td class="r">{{ r.stock?.price | num }}</td>
          <td class="r"><app-change [pct]="r.stock?.changePercent" /></td>
          <td class="r"><app-change [pct]="r.since" /></td>
          <td class="r muted">{{ r.stock?.low | num }} – {{ r.stock?.high | num }}</td>
          <td class="muted">{{ r.item.addedAt | date: 'mediumDate' }}</td>
          <td class="r"><button mat-icon-button (click)="$event.stopPropagation(); watch.remove(r.item.symbol)" [attr.aria-label]="'Remove ' + r.item.symbol"><mat-icon>delete_outline</mat-icon></button></td>
        </tr>}</tbody>
    </table></div>
    } @else {
      <p class="muted">Your watchlist is empty. Star a stock in the <a routerLink="/stocks" style="color:var(--brass)">stocks explorer</a> to follow it here.</p>
    }
  </div>
  <p class="mt-3"><app-source-note [s]="res().value" /></p>`,
})
export class WatchlistComponent {
  readonly watch = inject(WatchlistService);
  private readonly router = inject(Router);
  readonly res = toSignal(inject(MarketApiService).stocks(), { initialValue: { loading: true, value: null, error: null } as Load<Sourced<Stock[]>> });
  readonly rows = computed(() => {
    const map = new Map((this.res().value?.data ?? []).map((s) => [s.symbol, s]));
    return this.watch.items().map((item) => {
      const stock = map.get(item.symbol) ?? null;
      const since = stock?.price != null && item.priceWhenAdded ? ((stock.price - item.priceWhenAdded) / item.priceWhenAdded) * 100 : null;
      return { item, stock, since };
    });
  });
  open(sym: string) { this.router.navigate(['/stocks', sym]); }
}
