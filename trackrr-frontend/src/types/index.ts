// ─── /api/data ────────────────────────────────────────────────────────────────
// Flask returns: { status: "ok", data: FlaskPortfolioData }

export interface FlaskHolding {
  ticker: string;       // "ADANIPORTS" (NS stripped)
  name: string;
  sector: string;
  price: string;        // formatted string e.g. "₹1,234.5" or "$185.0"
  today_ret: number;    // % today
  total_ret: number;    // % since start
  value: number;        // INR value
  weight: number;       // % of portfolio
  shares: number;
}

export interface FlaskChart {
  dates: string[];       // ["01 Jan '26", ...]
  portfolio: (number | null)[];
  nifty: (number | null)[];
  sp500: (number | null)[];
}

export interface FlaskPortfolioData {
  updated_at: string;
  start_date: string;
  start_val: number;
  end_val: number;
  total_ret: number;
  nifty_total: number;
  sp500_total: number;
  alpha: number;
  sharpe: number;
  max_dd: number;
  best_day: number;
  worst_day: number;
  today_change: number;
  today_change_abs: number;
  holdings: FlaskHolding[];
  chart: FlaskChart;
}

export interface FlaskPortfolioResponse {
  status: "ok" | "error";
  data: FlaskPortfolioData;
  message?: string;
}

// ─── /api/market ──────────────────────────────────────────────────────────────
// Flask returns: { status: "ok", ticker, shortName, currency, stats, priceHistory, ... }

export interface FlaskMarketStats {
  currentPrice: number | null;
  marketCap: number | null;
  trailingPE: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  volume: number | null;
}

export interface FlaskPriceHistory {
  dates: string[];
  close: (number | null)[];
}

export interface FlaskMarketResponse {
  status: "ok" | "error";
  ticker: string;
  shortName: string;
  currency: string;       // "INR" or "USD"
  stats: FlaskMarketStats;
  priceHistory: FlaskPriceHistory;
  // only present when currency === "USD"
  usdInrRate?: number;
  statsInr?: FlaskMarketStats;
  priceHistoryInr?: FlaskPriceHistory;
  message?: string;
}

// ─── Convenience nav type ─────────────────────────────────────────────────────
export type NavPage = "overview" | "holdings" | "markets" | "analytics" | "history" | "learn";
