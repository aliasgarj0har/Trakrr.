import type { FlaskPortfolioData, FlaskMarketResponse } from "@/types";

const FLASK_BASE = process.env.NEXT_PUBLIC_API_URL || "https://trakrr.onrender.com";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 55 }, // match Flask 55s cache TTL
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /**
   * GET /api/data → { status, data: FlaskPortfolioData }
   * Unwraps the envelope and returns just the data object.
   */
  getPortfolio: async (): Promise<FlaskPortfolioData> => {
    const json = await fetchJSON<{ status: string; data: FlaskPortfolioData; message?: string }>(
      `${FLASK_BASE}/api/data`
    );
    if (json.status !== "ok" || !json.data) {
      throw new Error(json.message || "Portfolio fetch failed");
    }
    return json.data;
  },

  /**
   * GET /api/market?ticker=X → { status, ticker, shortName, currency, stats, priceHistory, ... }
   * Returns the full market response (no inner .data wrapper on this route).
   */
  getMarket: async (ticker: string): Promise<FlaskMarketResponse> => {
    const json = await fetchJSON<FlaskMarketResponse>(
      `${FLASK_BASE}/api/market?ticker=${encodeURIComponent(ticker)}`
    );
    if (json.status !== "ok") {
      throw new Error(json.message || `No data for ${ticker}`);
    }
    return json;
  },
};
