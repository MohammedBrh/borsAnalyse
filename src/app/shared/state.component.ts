import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

/** Loading / error / provider-error banner, shown above a block of data. */
@Component({
  selector: 'app-state',
  imports: [MatProgressBarModule, MatIconModule],
  template: `
    @if (loading()) { <mat-progress-bar mode="indeterminate" aria-label="Loading" /> }
    @if (error()) {
      <div class="banner err" role="alert"><mat-icon>cloud_off</mat-icon><div><strong>{{ title() }}</strong><p>{{ error() }}</p></div></div>
    }`,
  styles: [`
    .banner { display:flex; gap:.75rem; align-items:flex-start; padding:.85rem 1rem; border-radius:10px; border:1px solid var(--line); background:var(--surface); margin:.5rem 0 1rem; }
    .banner p { margin:.2rem 0 0; color:var(--muted); font-size:.875rem; }
    .err mat-icon { color: var(--down); }
  `],
})
export class StateComponent {
  readonly loading = input(false);
  readonly error = input<string | null | undefined>(null);
  readonly title = input('Market data could not be loaded');
}
