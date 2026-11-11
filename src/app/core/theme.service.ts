import { Injectable, signal } from '@angular/core';

const KEY = 'bvc.theme';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(this.initial());
  constructor() { this.apply(); }
  toggle() { this.dark.update((d) => !d); this.apply(); try { localStorage.setItem(KEY, this.dark() ? 'dark' : 'light'); } catch {} }
  private initial() { try { return localStorage.getItem(KEY) !== 'light'; } catch { return true; } }
  private apply() {
    const el = document.documentElement;
    el.classList.toggle('theme-dark', this.dark());
    el.classList.toggle('theme-light', !this.dark());
  }
}
