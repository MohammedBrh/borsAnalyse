import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, startWith, switchMap, tap, timer } from 'rxjs';
import { API_BASE, UI_REFRESH_MS } from './config';
import {
  HistoryResponse, IndexValue, LevelsResult, Load, OverviewResponse, ScreenerResult, Sourced, Stock,
} from './models';

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private readonly http = inject(HttpClient);

  /** Last provenance seen by any request: drives the header status and footer. */
  readonly lastStatus = signal<Omit<Sourced<unknown>, 'data'> | null>(null);

  overview() { return this.poll<OverviewResponse>('/overview'); }
  stocks() { return this.poll<Sourced<Stock[]>>('/stocks'); }
  stock(symbol: string) { return this.poll<Sourced<Stock>>(`/stocks/${encodeURIComponent(symbol)}`); }
  levels(symbol: string) { return this.poll<Sourced<LevelsResult>>(`/stocks/${encodeURIComponent(symbol)}/levels`); }
  stockHistory(symbol: string) { return this.once<HistoryResponse>(`/stocks/${encodeURIComponent(symbol)}/history`); }
  screener(limit = 10) { return this.poll<Sourced<ScreenerResult>>(`/screener?limit=${limit}`); }
  index(name = 'MASI') { return this.poll<Sourced<IndexValue>>(`/index?name=${name}`); }
  indexHistory(name = 'MASI') { return this.once<HistoryResponse>(`/index/history?name=${name}`); }

  /** Request now, then every UI_REFRESH_MS. Errors become a value, never a broken stream. */
  private poll<T>(path: string): Observable<Load<T>> {
    return timer(0, UI_REFRESH_MS).pipe(switchMap(() => this.once<T>(path)));
  }

  private once<T>(path: string): Observable<Load<T>> {
    return this.http.get<T>(API_BASE + path).pipe(
      tap((res) => {
        const r = res as unknown as Sourced<unknown>;
        if (r && typeof r === 'object' && 'quality' in r) {
          const { data: _d, ...status } = r;
          this.lastStatus.set(status);
        }
      }),
      map((value) => ({ loading: false, value, error: null })),
      catchError((e: HttpErrorResponse) => of({ loading: false, value: null, error: this.describe(e) })),
      startWith({ loading: true, value: null, error: null } as Load<T>),
    );
  }

  private describe(e: HttpErrorResponse): string {
    if (e.status === 0) return 'The dashboard backend is not reachable on localhost:3000. Start it with "npm run start:dev" in /backend.';
    if (e.status === 404) return e.error?.message ?? 'Not found.';
    return e.error?.message ?? `Backend error ${e.status}.`;
  }
}
