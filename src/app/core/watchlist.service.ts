import { Injectable, computed, signal } from '@angular/core';

export interface WatchItem { symbol: string; addedAt: string; priceWhenAdded: number | null; }
const KEY = 'bvc.watchlist.v1';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  readonly items = signal<WatchItem[]>(this.read());
  readonly symbols = computed(() => new Set(this.items().map((i) => i.symbol)));

  has(symbol: string) { return this.symbols().has(symbol); }

  toggle(symbol: string, price: number | null) {
    this.has(symbol) ? this.remove(symbol) : this.add(symbol, price);
  }
  add(symbol: string, price: number | null) {
    if (this.has(symbol)) return;
    this.save([...this.items(), { symbol, addedAt: new Date().toISOString(), priceWhenAdded: price }]);
  }
  remove(symbol: string) { this.save(this.items().filter((i) => i.symbol !== symbol)); }

  private save(items: WatchItem[]) {
    this.items.set(items);
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode: keep in memory */ }
  }
  private read(): WatchItem[] {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
  }
}
