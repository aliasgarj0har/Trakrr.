from flask import Flask, render_template, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)

HOLDINGS = {
    "ADANIPORTS.NS": {"shares": 10,  "name": "Adani Ports",   "sector": "Infrastructure"},
    "TATAMOTORS.BO": {"shares": 30,  "name": "Tata Motors",   "sector": "Automotive"},
    "ZOMATO.BO":     {"shares": 40,  "name": "Zomato",        "sector": "Consumer Tech"},
    "AMZN":          {"shares": 4,   "name": "Amazon",        "sector": "Global Tech"},
    "AAPL":          {"shares": 8,   "name": "Apple",         "sector": "Global Tech"},
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
        })

    # chart
    port_norm  = port_value  / port_value.iloc[0]  * 100
    nifty_norm = (nifty  / nifty.iloc[0]  * 100).reindex(port_norm.index)
    sp500_norm = (sp500  / sp500.iloc[0]  * 100).reindex(port_norm.index)
    chart_dates = [d.strftime("%d %b '%y") for d in port_norm.index]

    # daily returns for bar chart
    daily = (port_ret * 100).reindex(port_norm.index).fillna(0)

    return {
        "updated_at":  datetime.now().strftime("%H:%M:%S"),
        "start_date":  start.strftime("%d %b %Y"),
        "start_val":   round(start_val, 0),
        "end_val":     round(end_val, 0),
        "total_ret":   round(total_ret, 2),
        "nifty_total": round(nifty_total, 2),
        "alpha":       round(alpha, 2),
        "sharpe":      round(sharpe, 2),
        "max_dd":      round(max_dd, 2),
        "best_day":    round(float(port_ret.max()) * 100, 2),
        "worst_day":   round(float(port_ret.min()) * 100, 2),
        "holdings":    holdings_data,
        "chart": {
            "dates":     chart_dates,
            "portfolio": to_list(port_norm),
            "nifty":     to_list(nifty_norm),
            "sp500":     to_list(sp500_norm),
            "daily":     to_list(daily),
        }
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/data")
def api_data():
    try:
        return jsonify({"status": "ok", "data": get_data()})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
