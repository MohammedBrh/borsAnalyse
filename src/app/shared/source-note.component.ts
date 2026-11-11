import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Sourced } from '../core/models';
import { QualityBadgeComponent } from './quality-badge.component';

@Component({
  selector: 'app-source-note',
  imports: [DatePipe, QualityBadgeComponent],
  template: `@if (s(); as s) {
    <p class="note"><app-quality [q]="s.quality" />
      <span>Updated {{ s.fetchedAt ? (s.fetchedAt | date: 'medium') : 'never' }}</span>
      @if (s.providerTimestamp) { <span>provider stamp {{ s.providerTimestamp | date: 'medium' }}</span> }
    </p> }`,
  styles: [`.note{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;color:var(--muted);font-size:.8rem;margin:0}`],
})
export class SourceNoteComponent {
  readonly s = input<Omit<Sourced<unknown>, 'data'> | null | undefined>(null);
}
