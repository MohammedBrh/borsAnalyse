/** The NestJS backend. The Oanor API key lives there, never in Angular. */
export const API_BASE = 'http://localhost:3000/api/market';
/** How often the UI asks the backend (the backend cache decides when the provider is called). */
export const UI_REFRESH_MS = 60_000;
