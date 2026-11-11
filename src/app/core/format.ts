import { Pipe, PipeTransform } from '@angular/core';

const LOCALE = 'en-US';
export function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return v.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function fmtCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 2 }).format(v);
}
export function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
}
export function trend(v: number | null | undefined): 'up' | 'down' | 'flat' {
  if (v === null || v === undefined || v === 0) return 'flat';
  return v > 0 ? 'up' : 'down';
}

@Pipe({ name: 'num' }) export class NumPipe implements PipeTransform {
  transform(v: number | null | undefined, digits = 2) { return fmtNum(v, digits); }
}
@Pipe({ name: 'compact' }) export class CompactPipe implements PipeTransform {
  transform(v: number | null | undefined) { return fmtCompact(v); }
}
@Pipe({ name: 'pct' }) export class PctPipe implements PipeTransform {
  transform(v: number | null | undefined) { return fmtPct(v); }
}
