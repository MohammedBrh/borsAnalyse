import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataQuality } from '../core/models';

const TEXT: Record<DataQuality, { label: string; help: string }> = {
  LIVE: { label: 'Live', help: 'Confirmed real-time data.' },
  DELAYED: { label: 'Delayed', help: 'Market in session. The free feed is not confirmed real-time, so prices may lag the exchange.' },
  EOD: { label: 'End of day', help: 'Market closed: values are from the last completed session.' },
  STALE: { label: 'Stale', help: 'The provider could not be reached; showing the last values the backend kept.' },
  UNAVAILABLE: { label: 'No data', help: 'No data could be loaded from the provider.' },
};

@Component({
  selector: 'app-quality',
  imports: [MatTooltipModule],
  template: `<span class="q q-{{ q().toLowerCase() }}" [matTooltip]="t().help" tabindex="0">{{ t().label }}</span>`,
  styles: [`
    .q { display:inline-flex; align-items:center; gap:.35rem; font-size:.75rem; font-weight:600; padding:.15rem .55rem; border-radius:999px; border:1px solid var(--line); color:var(--muted); white-space:nowrap; }
    .q::before { content:''; width:.45rem; height:.45rem; border-radius:50%; background:currentColor; }
    .q-live { color: var(--up); border-color: color-mix(in srgb, var(--up) 40%, transparent); }
    .q-delayed { color: var(--brass); border-color: color-mix(in srgb, var(--brass) 40%, transparent); }
    .q-eod { color: var(--sky); border-color: color-mix(in srgb, var(--sky) 40%, transparent); }
    .q-stale, .q-unavailable { color: var(--down); border-color: color-mix(in srgb, var(--down) 40%, transparent); }
  `],
})
export class QualityBadgeComponent {
  readonly q = input.required<DataQuality>();
  readonly t = computed(() => TEXT[this.q()]);
}
