import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { MarketApiService } from '../core/market-api.service';
import { ThemeService } from '../core/theme.service';
import { QualityBadgeComponent } from '../shared/quality-badge.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule, DatePipe, QualityBadgeComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly theme = inject(ThemeService);
  readonly api = inject(MarketApiService);
  readonly mobile = toSignal(inject(BreakpointObserver).observe('(max-width: 900px)').pipe(map((r) => r.matches)), { initialValue: false });
  readonly status = this.api.lastStatus;
  readonly phaseText = computed(() => ({ OPEN: 'Market open', PRE_OPEN: 'Pre-open', CLOSED: 'Market closed' })[this.status()?.marketPhase ?? 'CLOSED']);
  readonly nav = [
    { path: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { path: '/stocks', icon: 'table_rows', label: 'Stocks' },
    { path: '/masi', icon: 'show_chart', label: 'MASI' },
    { path: '/screener', icon: 'filter_list', label: 'Screener' },
    { path: '/watchlist', icon: 'star', label: 'Watchlist' },
  ];
}
