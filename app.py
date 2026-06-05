from flask import Flask, render_template, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)

HOLDINGS = {
    "RELIANCE.NS": {"shares": 10, "name": "Reliance Industries"},
    "INFY.NS":     {"shares": 20, "name": "Infosys"},
    "TCS.NS":      {"shares": 5,  "name": "Tata Consultancy Services"},
    "HDFCBANK.NS": {"shares": 15, "name": "HDFC Bank"},
}

PERIOD_DAYS = 180

def to_list(series):
    return [None if (v is None or (isinstance(v, float) and np.isnan(v))) else round(v, 2) for v in series]

def get_portfolio_data():
    end   = datetime.today()
    start = end - timedelta(days=PERIOD_DAYS)
    tickers = list(HOLDINGS.keys()) + ["^NSEI", "^GSPC"]
    raw    = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)
    prices = raw["Close"] if isinstance(raw.columns, pd.MultiIndex) else raw[["Close"]]
    prices.dropna(how="all", inplace=True)
    nifty  = prices["^NSEI"].dropna()
    sp500  = prices["^GSPC"].dropna()
    stocks = prices.drop(columns=["^NSEI", "^GSPC"])
    port_value = pd.Series(0.0, index=stocks.index)
    for ticker, info in HOLDINGS.items():
        if ticker in stocks.columns:
            port_value += stocks[ticker] * info["shares"]
    port_ret  = port_value.pct_change().dropna()
    nifty_ret = nifty.pct_change().dropna()
    port_ret, nifty_ret = port_ret.align(nifty_ret, join="inner")
    start_val   = float(port_value.iloc[0])
    end_val     = float(port_value.iloc[-1])
    total_ret   = (end_val - start_val) / start_val * 100
    nifty_total = float(((1 + nifty_ret).prod() - 1) * 100)
    alpha       = total_ret - nifty_total
    sharpe      = float((port_ret.mean() / port_ret.std()) * (252 ** 0.5))
    holdings_data = []
    for ticker, info in HOLDINGS.items():
        if ticker not in stocks.columns:
            continue
        col       = stocks[ticker].dropna()
        ret       = (float(col.iloc[-1]) - float(col.iloc[0])) / float(col.iloc[0]) * 100
        today_ret = float(col.pct_change().iloc[-1]) * 100
        value     = float(col.iloc[-1]) * info["shares"]
        weight    = (value / end_val) * 100
        holdings_data.append({
            "ticker":    ticker.replace(".NS", ""),
            "name":      info["name"],
            "shares":    info["shares"],
            "price":     round(float(col.iloc[-1]), 1),
            "today_ret": round(today_ret, 2),
            "total_ret": round(ret, 2),
            "value":     round(value, 0),
            "weight":    round(weight, 1),
        })
    port_norm  = port_value / port_value.iloc[0] * 100
    nifty_norm = (nifty / nifty.iloc[0] * 100).reindex(port_norm.index)
    sp500_norm = (sp500 / sp500.iloc[0] * 100).reindex(port_norm.index)
    chart_dates = [d.strftime("%d %b '%y") for d in port_norm.index]
    return {
        "updated_at":  datetime.now().strftime("%H:%M:%S"),
        "start_val":   round(start_val, 0),
        "end_val":     round(end_val, 0),
        "total_ret":   round(total_ret, 2),
        "nifty_total": round(nifty_total, 2),
        "alpha":       round(alpha, 2),
        "sharpe":      round(sharpe, 2),
        "best_day":    round(float(port_ret.max()) * 100, 2),
        "worst_day":   round(float(port_ret.min()) * 100, 2),
        "holdings":    holdings_data,
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

@app.route("/api/data")
def api_data():
    try:
        return jsonify({"status": "ok", "data": get_portfolio_data()})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
