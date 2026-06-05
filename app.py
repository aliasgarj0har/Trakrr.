# app.py — Trackrr backend
# Flask server that fetches live NSE data and serves the dashboard

from flask import Flask, render_template, jsonify
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)

# ── YOUR PORTFOLIO ────────────────────────────────────────────────
HOLDINGS = {
    "RELIANCE.NS": {"shares": 10, "name": "Reliance Industries"},
    "INFY.NS":     {"shares": 20, "name": "Infosys"},
    "TCS.NS":      {"shares": 5,  "name": "Tata Consultancy Services"},
    "HDFCBANK.NS": {"shares": 15, "name": "HDFC Bank"},
}
BENCHMARK   = "^NSEI"
PERIOD_DAYS = 180

# ── FETCH LIVE DATA ───────────────────────────────────────────────
def get_portfolio_data():
    tickers = list(HOLDINGS.keys()) + [BENCHMARK]
    end     = datetime.today()
    start   = end - timedelta(days=PERIOD_DAYS)

    raw    = yf.download(tickers, start=start, end=end,
                         auto_adjust=True, progress=False)
    prices = raw["Close"] if isinstance(raw.columns, pd.MultiIndex) else raw[["Close"]]
    prices.dropna(how="all", inplace=True)

    bench  = prices[BENCHMARK].dropna()
    stocks = prices.drop(columns=[BENCHMARK])

    # portfolio value over time
    port_value = pd.Series(0.0, index=stocks.index)
    for ticker, info in HOLDINGS.items():
        if ticker in stocks.columns:
            port_value += stocks[ticker] * info["shares"]

    port_ret  = port_value.pct_change().dropna()
    bench_ret = bench.pct_change().dropna()
    port_ret, bench_ret = port_ret.align(bench_ret, join="inner")

    # summary stats
    start_val      = port_value.iloc[0]
    end_val        = port_value.iloc[-1]
    total_ret      = (end_val - start_val) / start_val * 100
    bench_total    = ((1 + bench_ret).prod() - 1) * 100
    alpha          = total_ret - bench_total
    sharpe         = (port_ret.mean() / port_ret.std()) * (252 ** 0.5)

    # per-stock data
    holdings_data = []
    for ticker, info in HOLDINGS.items():
        if ticker not in stocks.columns:
            continue
        col        = stocks[ticker].dropna()
        ret        = (col.iloc[-1] - col.iloc[0]) / col.iloc[0] * 100
        today_ret  = col.pct_change().iloc[-1] * 100
        value      = col.iloc[-1] * info["shares"]
        weight     = (value / end_val) * 100
        holdings_data.append({
            "ticker":    ticker.replace(".NS", ""),
            "name":      info["name"],
            "shares":    info["shares"],
            "price":     round(col.iloc[-1], 1),
            "today_ret": round(today_ret, 2),
            "total_ret": round(ret, 2),
            "value":     round(value, 0),
            "weight":    round(weight, 1),
        })

    # chart data — normalised to 100
    port_norm  = (port_value  / port_value.iloc[0]  * 100).round(2)
    bench_norm = (bench / bench.iloc[0] * 100).round(2)
    chart_dates = [d.strftime("%d %b '%y") for d in port_norm.index]

    return {
        "updated_at":  datetime.now().strftime("%H:%M:%S"),
        "start_val":   round(start_val, 0),
        "end_val":     round(end_val, 0),
        "total_ret":   round(total_ret, 2),
        "bench_total": round(bench_total, 2),
        "alpha":       round(alpha, 2),
        "sharpe":      round(sharpe, 2),
        "best_day":    round(port_ret.max() * 100, 2),
        "worst_day":   round(port_ret.min() * 100, 2),
        "holdings":    holdings_data,
        "chart": {
            "dates":     chart_dates,
            "portfolio": port_norm.tolist(),
            "benchmark": bench_norm.tolist(),
        }
    }

# ── ROUTES ────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/data")
def api_data():
    try:
        data = get_portfolio_data()
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ── RUN ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
