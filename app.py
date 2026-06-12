from flask import Flask, render_template, jsonify, request
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time

app = Flask(__name__)

_cache = {"data": None, "ts": 0}
CACHE_TTL = 55  # seconds

_market_cache = {}
MARKET_CACHE_TTL = 60  # seconds

HOLDINGS = {
    "ADANIPORTS.NS": {"shares": 3,  "name": "Adani Ports",   "sector": "Infrastructure"},
    "TMPV.NS": {"shares": 10,  "name": "Tata Motors PV",   "sector": "Automotive"},
    "ETERNAL.NS":     {"shares": 15,  "name": "Eternal (Zomato)",        "sector": "Consumer Tech"},
    "AMZN":          {"shares": 2,   "name": "Amazon",        "sector": "Global Tech"},
    "AAPL":          {"shares": 5,   "name": "Apple",         "sector": "Global Tech"},
}

START_DATE  = "2026-01-01"
BENCHMARK   = "^NSEI"
BENCHMARK2  = "^GSPC"

def to_list(series):
    return [None if (v is None or (isinstance(v, float) and np.isnan(v))) else round(float(v), 2)
            for v in series]

def get_data():
    start  = pd.Timestamp(START_DATE)
    end    = datetime.today()
    tickers = list(HOLDINGS.keys()) + [BENCHMARK, BENCHMARK2]

    raw    = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)
    prices = raw["Close"] if isinstance(raw.columns, pd.MultiIndex) else raw[["Close"]]
    prices.dropna(how="all", inplace=True)

    nifty  = prices[BENCHMARK].dropna()
    sp500  = prices[BENCHMARK2].dropna()
    stocks = prices.drop(columns=[BENCHMARK, BENCHMARK2])

    # portfolio value — convert USD stocks to INR
    usd_inr = yf.download("USDINR=X", start=start, end=end, auto_adjust=True, progress=False)
    fx      = usd_inr["Close"].dropna() if isinstance(usd_inr.columns, pd.MultiIndex) else usd_inr[["Close"]]
    if isinstance(fx, pd.DataFrame):
        fx = fx.iloc[:, 0]

    port_value = pd.Series(0.0, index=stocks.index)
    for ticker, info in HOLDINGS.items():
        if ticker not in stocks.columns:
            continue
        col = stocks[ticker].ffill()
        if ticker in ["AMZN", "AAPL"]:
            fx_aligned = fx.reindex(col.index, method="ffill")
            col = col * fx_aligned
        port_value += col * info["shares"]

    port_value = port_value[port_value > 0]
    port_ret   = port_value.pct_change().dropna()
    nifty_ret  = nifty.pct_change().dropna()
    port_ret, nifty_ret = port_ret.align(nifty_ret, join="inner")

    start_val   = float(port_value.iloc[0])
    end_val     = float(port_value.iloc[-1])
    total_ret   = (end_val - start_val) / start_val * 100
    nifty_total = float(((1 + nifty_ret).prod() - 1) * 100)
    sp500_total = 0
    try:
        sp500_ret_series = sp500.pct_change().dropna()
        sp500_total = float(((1 + sp500_ret_series).prod() - 1) * 100)
        if np.isnan(sp500_total):
            sp500_total = 0
    except Exception:
        sp500_total = 0
    alpha       = total_ret - nifty_total
    sharpe      = float((port_ret.mean() / port_ret.std()) * (252 ** 0.5))
    max_dd      = float(((port_value / port_value.cummax()) - 1).min() * 100)

    # holdings
    holdings_data = []
    for ticker, info in HOLDINGS.items():
        if ticker not in stocks.columns:
            continue
        col = stocks[ticker].dropna()
        if ticker in ["AMZN", "AAPL"]:
            fx_aligned = fx.reindex(col.index, method="ffill")
            col_inr    = col * fx_aligned
        else:
            col_inr = col
        ret       = (float(col_inr.iloc[-1]) - float(col_inr.iloc[0])) / float(col_inr.iloc[0]) * 100
        today_ret = float(col_inr.pct_change().iloc[-1]) * 100
        value     = float(col_inr.iloc[-1]) * info["shares"]
        weight    = (value / end_val) * 100
        price_disp = f"${col.iloc[-1]:,.1f}" if ticker in ["AMZN","AAPL"] else f"₹{col.iloc[-1]:,.1f}"
        holdings_data.append({
            "ticker":    ticker.replace(".NS",""),
            "name":      info["name"],
            "sector":    info["sector"],
            "price":     price_disp,
            "today_ret": round(today_ret, 2),
            "total_ret": round(ret, 2),
            "value":     round(value, 0),
            "weight":    round(weight, 1),
            "shares":    info["shares"],
        })

    # chart
    port_norm  = port_value  / port_value.iloc[0]  * 100
    nifty_norm = (nifty  / nifty.iloc[0]  * 100).reindex(port_norm.index)
    sp500_norm = (sp500  / sp500.iloc[0]  * 100).reindex(port_norm.index)
    chart_dates = [d.strftime("%d %b '%y") for d in port_norm.index]

    today_change = 0
    today_change_abs = 0
    try:
        if len(port_ret) > 0:
            tc = float(port_ret.iloc[-1]) * 100
            if not np.isnan(tc):
                today_change = tc
                tca = end_val * tc / 100
                today_change_abs = 0 if np.isnan(tca) else tca
    except Exception:
        today_change = 0
        today_change_abs = 0

    return {
        "updated_at":  datetime.now().strftime("%H:%M:%S"),
        "start_date":  start.strftime("%d %b %Y"),
        "start_val":   round(start_val, 0),
        "end_val":     round(end_val, 0),
        "total_ret":   round(total_ret, 2),
        "nifty_total": round(nifty_total, 2),
        "sp500_total": round(sp500_total, 2),
        "alpha":       round(alpha, 2),
        "sharpe":      round(sharpe, 2),
        "max_dd":      round(max_dd, 2),
        "best_day":    round(float(port_ret.max()) * 100, 2),
        "worst_day":        round(float(port_ret.min()) * 100, 2),
        "today_change":     round(today_change, 2),
        "today_change_abs": round(today_change_abs, 0),
        "holdings":         holdings_data,
        "chart": {
            "dates":     chart_dates,
            "portfolio": to_list(port_norm),
            "nifty":     to_list(nifty_norm),
            "sp500":     to_list(sp500_norm),
        }
    }

@app.route("/")
def index():
    return render_template("index.html")

STAT_KEYS = [
    "currentPrice", "marketCap", "trailingPE",
    "fiftyTwoWeekHigh", "fiftyTwoWeekLow", "volume",
]

def _extract_close(df):
    close = df["Close"]
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]
    return close.dropna()

def _safe_float(val):
    if val is None:
        return None
    try:
        f = float(val)
        return None if np.isnan(f) else round(f, 2)
    except (TypeError, ValueError):
        return None

def _get_usd_inr_rate():
    fx = yf.download("USDINR=X", period="5d", auto_adjust=True, progress=False)
    if fx.empty:
        return None
    close = _extract_close(fx)
    return round(float(close.iloc[-1]), 4) if len(close) else None

def get_market_data(ticker):
    end   = datetime.today()
    start = end - timedelta(days=365)

    raw = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)
    if raw.empty:
        raise ValueError(f"No price data found for {ticker}")

    close = _extract_close(raw)
    if close.empty:
        raise ValueError(f"No price data found for {ticker}")

    try:
        info = yf.Ticker(ticker).info or {}
    except Exception:
        info = {}

    stats = {key: _safe_float(info.get(key)) for key in STAT_KEYS}
    currency  = info.get("currency")
    short_name = info.get("shortName")

    result = {
        "ticker":       ticker,
        "shortName":    short_name,
        "currency":     currency,
        "stats":        stats,
        "priceHistory": {
            "dates": [d.strftime("%Y-%m-%d") for d in close.index],
            "close": to_list(close),
        },
    }

    if currency == "USD":
        rate = _get_usd_inr_rate()
        if rate is not None:
            result["usdInrRate"] = rate
            result["statsInr"] = {
                key: round(val * rate, 2) if val is not None else None
                for key, val in stats.items()
            }
            result["priceHistoryInr"] = {
                "dates": result["priceHistory"]["dates"],
                "close": [round(p * rate, 2) if p is not None else None
                          for p in result["priceHistory"]["close"]],
            }

    return result

@app.route("/api/market")
def api_market():
    ticker = request.args.get("ticker", "").strip().upper()
    if not ticker:
        return jsonify({"status": "error", "message": "Missing ticker parameter"}), 400

    now = time.time()
    cached = _market_cache.get(ticker)
    if cached is not None and (now - cached["ts"]) < MARKET_CACHE_TTL:
        return jsonify({"status": "ok", **cached["data"]})

    try:
        data = get_market_data(ticker)
        _market_cache[ticker] = {"data": data, "ts": now}
        return jsonify({"status": "ok", **data})
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/data")
def api_data():
    now = time.time()
    if _cache["data"] is not None and (now - _cache["ts"]) < CACHE_TTL:
        return jsonify({"status": "ok", "data": _cache["data"]})

    try:
        data = get_data()
        _cache["data"] = data
        _cache["ts"] = now
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        if _cache["data"] is not None:
            return jsonify({"status": "ok", "data": _cache["data"]})
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
