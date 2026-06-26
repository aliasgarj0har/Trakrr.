"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import type { FlaskMarketResponse } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketChart } from "@/components/charts/market-chart";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, TrendingUp, TrendingDown, X } from "lucide-react";

const QUICK_TICKERS = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS",
  "TMPV.NS", "ETERNAL.NS", "ADANIPORTS.NS", "AAPL", "AMZN", "MSFT",
];

export default function MarketsPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FlaskMarketResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(ticker: string) {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.getMarket(ticker.trim().toUpperCase());
      setResult(data);
    } catch (e) {
      setError(`Could not find data for "${ticker}". Check the ticker and try again.`);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setQuery(""); setResult(null); setError(null);
    inputRef.current?.focus();
  }

  // Use INR stats when available (USD stocks), otherwise native stats
  const stats = result?.statsInr ?? result?.stats;
  const history = result?.priceHistoryInr ?? result?.priceHistory;

  // Compute change from price history (last 2 close values)
  const closes = history?.close.filter((v): v is number => v !== null) ?? [];
  const latestPrice = stats?.currentPrice ?? closes[closes.length - 1] ?? 0;
  const prevPrice = closes[closes.length - 2] ?? latestPrice;
  const change = latestPrice - prevPrice;
  const changePct = prevPrice ? (change / prevPrice) * 100 : 0;
  const isPos = change >= 0;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-beige tracking-tight">Markets</h1>
        <p className="text-beige/40 text-sm mt-1">Search any NSE or global ticker</p>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); search(query); }} className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-beige/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. TCS.NS, AAPL, RELIANCE.NS"
          className="w-full glass rounded-xl pl-11 pr-12 py-3.5 text-sm text-beige placeholder:text-beige/30 outline-none focus:border-purple/40 transition-colors"
          autoCapitalize="characters"
          spellCheck={false}
        />
        {query && (
          <button type="button" onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-beige/30 hover:text-beige/60">
            <X size={14} />
          </button>
        )}
      </form>

      {/* Quick picks */}
      <div className="flex flex-wrap gap-2">
        {QUICK_TICKERS.map((t) => (
          <button key={t} onClick={() => { setQuery(t); search(t); }}
            className="glass rounded-lg px-3 py-1.5 text-xs text-beige/50 hover:text-beige hover:border-purple/30 transition-all">
            {t}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <Card className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-xl p-5 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-beige">{result.ticker}</h2>
                  <Badge variant="muted">{result.currency}</Badge>
                  {result.usdInrRate && (
                    <span className="text-xs text-beige/30">
                      1 USD = ₹{result.usdInrRate}
                    </span>
                  )}
                </div>
                <p className="text-beige/40 text-sm mt-0.5">{result.shortName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-beige">
                  {/* Show INR for USD stocks, native for INR stocks */}
                  {result.currency === "USD" && result.usdInrRate
                    ? `₹${latestPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                    : `₹${latestPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                </p>
                <p className={cn("text-sm font-medium mt-0.5", isPos ? "text-emerald-400" : "text-red-400")}>
                  {isPos ? "+" : ""}{change.toFixed(2)} ({isPos ? "+" : ""}{changePct.toFixed(2)}%) today
                </p>
              </div>
            </CardHeader>

            {/* Stat boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-beige/5">
              {[
                { label: "52W High", value: stats?.fiftyTwoWeekHigh
                    ? `₹${stats.fiftyTwoWeekHigh.toLocaleString("en-IN")}` : "—" },
                { label: "52W Low",  value: stats?.fiftyTwoWeekLow
                    ? `₹${stats.fiftyTwoWeekLow.toLocaleString("en-IN")}` : "—" },
                { label: "P/E Ratio", value: stats?.trailingPE
                    ? stats.trailingPE.toFixed(1) : "—" },
                { label: "Volume", value: stats?.volume
                    ? `${(stats.volume / 1_000_000).toFixed(2)}M` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="glass rounded-lg p-3">
                  <p className="text-xs text-beige/40 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-beige">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Price chart */}
          {history && history.dates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>1-Year Price History</CardTitle>
                <Badge variant="muted">{result.currency === "USD" ? "Converted to INR" : "INR"}</Badge>
              </CardHeader>
              <MarketChart history={history} />
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="glass rounded-xl p-12 text-center">
          <Search size={28} className="text-beige/20 mx-auto mb-3" />
          <p className="text-beige/30 text-sm">Search a ticker to see live market data</p>
          <p className="text-beige/20 text-xs mt-1">NSE stocks use .NS suffix — e.g. TCS.NS</p>
        </div>
      )}
    </div>
  );
}
