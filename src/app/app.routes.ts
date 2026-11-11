import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '', component: ShellComponent, children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', title: 'Dashboard · BVC Desk', loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'stocks', title: 'Stocks · BVC Desk', loadComponent: () => import('./pages/stocks.component').then((m) => m.StocksComponent) },
      { path: 'stocks/:symbol', title: 'Stock · BVC Desk', loadComponent: () => import('./pages/stock-detail.component').then((m) => m.StockDetailComponent) },
      { path: 'masi', title: 'MASI · BVC Desk', loadComponent: () => import('./pages/masi.component').then((m) => m.MasiComponent) },
      { path: 'screener', title: 'Screener · BVC Desk', loadComponent: () => import('./pages/screener.component').then((m) => m.ScreenerComponent) },
      { path: 'watchlist', title: 'Watchlist · BVC Desk', loadComponent: () => import('./pages/watchlist.component').then((m) => m.WatchlistComponent) },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
