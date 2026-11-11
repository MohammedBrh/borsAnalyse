export type DataQuality = 'LIVE' | 'DELAYED' | 'EOD' | 'STALE' | 'UNAVAILABLE';
export type MarketPhase = 'PRE_OPEN' | 'OPEN' | 'CLOSED';

export interface Sourced<T> {
  data: T | null;
  quality: DataQuality;
  source: string;
  providerTimestamp: string | null;
  fetchedAt: string | null;
  marketPhase: MarketPhase;
  error?: string;
}

export interface Stock {
  symbol: string; name: string | null; sector: string | null; currency: string;
  price: number | null; change: number | null; changePercent: number | null; previousClose: number | null;
  open: number | null; high: number | null; low: number | null;
  volume: number | null; turnover: number | null; marketCap: number | null; peRatio: number | null;
}

export interface IndexValue {
  code: string; name: string | null; value: number | null; change: number | null; changePercent: number | null;
  open: number | null; high: number | null; low: number | null;
}

export interface SectorSummary {
  sector: string; count: number; marketCap: number; weightedChangePercent: number | null; advancers: number; decliners: number;
}

export interface MarketOverview {
  index: IndexValue | null;
  totalMarketCap: number | null; totalVolume: number | null; totalTurnover: number | null;
  breadth: { advancers: number; decliners: number; unchanged: number };
  topGainers: Stock[]; topLosers: Stock[]; mostActive: Stock[];
  sectors: SectorSummary[];
  coverage: { stocks: number; note: string };
}
export type OverviewResponse = Sourced<MarketOverview> & { indexStatus: Omit<Sourced<unknown>, 'data'> };

export interface ScreenerResult { gainers: Stock[]; losers: Stock[]; active: Stock[]; marketcap: Stock[]; }

export interface DailyBar {
  date: string; open: number | null; high: number | null; low: number | null; close: number | null;
  volume: number | null; complete: boolean; capturedAt: string;
}
export interface HistoryResponse { symbol: string; bars: DailyBar[]; note: string; }

export interface Level {
  label: string; price: number; kind: 'resistance' | 'support' | 'pivot';
  method: 'pivot-classic' | 'pivot-fibonacci' | 'intraday' | 'swing'; distancePercent: number | null;
}
export interface LevelsResult {
  symbol: string; price: number | null;
  basis: { session: 'previous-complete' | 'current-provisional'; date: string | null; high: number; low: number; close: number } | null;
  pivot: number | null; classic: Level[]; fibonacci: Level[]; intraday: Level[]; swing: Level[];
  nearestResistance: Level | null; nearestSupport: Level | null; historySessions: number; notes: string[];
}

/** UI-side wrapper: loading / error / value. */
export interface Load<T> { loading: boolean; value: T | null; error: string | null; }
