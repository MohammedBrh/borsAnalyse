import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { CompactPipe, NumPipe } from '../core/format';
import { MarketApiService } from '../core/market-api.service';
import { Load, Sourced, Stock } from '../core/models';
import { WatchlistService } from '../core/watchlist.service';
import { ChangeComponent } from '../shared/change.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

@Component({
  selector: 'app-stocks',
  imports: [FormsModule, MatTableModule, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, NumPipe, CompactPipe, ChangeComponent, SourceNoteComponent, StateComponent],
  templateUrl: './stocks.component.html',
  styles: [`
    .filters { display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; }
    .filters mat-form-field { min-width: 240px; }
    .name { font-size:.75rem; color:var(--muted); max-width:26ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    tr.mat-mdc-row { cursor:pointer; }
    .star { color: var(--muted); } .star.on { color: var(--brass); }
    .mat-column-symbol { min-width: 200px; }
  `],
})
export class StocksComponent {
  private readonly api = inject(MarketApiService);
  private readonly router = inject(Router);
  readonly watch = inject(WatchlistService);
  readonly res = toSignal(this.api.stocks(), { initialValue: { loading: true, value: null, error: null } as Load<Sourced<Stock[]>> });

  readonly cols = ['star', 'symbol', 'sector', 'price', 'change', 'changePercent', 'open', 'high', 'low', 'volume', 'marketCap', 'peRatio'];
  readonly query = signal('');
  readonly sector = signal<string>('');
  readonly ds = new MatTableDataSource<Stock>([]);
  private readonly sort = viewChild(MatSort);
  private readonly pager = viewChild(MatPaginator);

  readonly sectors = computed(() => [...new Set((this.res().value?.data ?? []).map((s) => s.sector).filter((x): x is string => !!x))].sort());
  readonly error = computed(() => this.res().error ?? (this.res().value?.quality === 'UNAVAILABLE' ? this.res().value?.error : null));

  constructor() {
    this.ds.filterPredicate = (s, f) => {
      const { q, sector } = JSON.parse(f) as { q: string; sector: string };
      const hay = `${s.symbol} ${s.name ?? ''}`.toLowerCase();
      return (!q || hay.includes(q)) && (!sector || s.sector === sector);
    };
    effect(() => { this.ds.data = this.res().value?.data ?? []; });
    effect(() => { this.ds.filter = JSON.stringify({ q: this.query().trim().toLowerCase(), sector: this.sector() }); this.pager()?.firstPage(); });
    effect(() => { const s = this.sort(); const p = this.pager(); if (s) this.ds.sort = s; if (p) this.ds.paginator = p; });
  }

  open(s: Stock) { this.router.navigate(['/stocks', s.symbol]); }
  star(e: Event, s: Stock) { e.stopPropagation(); this.watch.toggle(s.symbol, s.price); }
}
