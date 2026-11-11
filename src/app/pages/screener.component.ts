import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '../core/market-api.service';
import { Load, ScreenerResult, Sourced } from '../core/models';
import { MoversTableComponent } from '../shared/movers-table.component';
import { SourceNoteComponent } from '../shared/source-note.component';
import { StateComponent } from '../shared/state.component';

@Component({
  selector: 'app-screener',
  imports: [MoversTableComponent, SourceNoteComponent, StateComponent],
  template: `
  <h1 class="page-title">Market screener</h1>
  <p class="page-sub">The ten strongest and weakest stocks of the session, the most traded by value, and the largest companies.</p>
  <app-state [loading]="res().loading && !res().value" [error]="res().error ?? (res().value?.quality === 'UNAVAILABLE' ? res().value?.error : null)" />
  <div class="g">
    <div class="panel"><h2>Top gainers</h2><app-movers [stocks]="res().value?.data?.gainers ?? []" show="volume" empty="No stock is up in this session." /></div>
    <div class="panel"><h2>Top losers</h2><app-movers [stocks]="res().value?.data?.losers ?? []" show="volume" empty="No stock is down in this session." /></div>
    <div class="panel"><h2>Most active by traded value</h2><app-movers [stocks]="res().value?.data?.active ?? []" show="turnover" /></div>
    <div class="panel"><h2>Largest market capitalization</h2><app-movers [stocks]="res().value?.data?.marketcap ?? []" show="marketCap" /></div>
  </div>
  <p class="mt-3"><app-source-note [s]="res().value" /></p>`,
  styles: [`.g{display:grid;grid-template-columns:1fr 1fr;gap:1rem} @media (max-width:1000px){.g{grid-template-columns:1fr}}`],
})
export class ScreenerComponent {
  readonly res = toSignal(inject(MarketApiService).screener(10), { initialValue: { loading: true, value: null, error: null } as Load<Sourced<ScreenerResult>> });
}
