# Trackrr.

A live stock portfolio dashboard built with Python and Flask. Tracks NSE-listed stocks, calculates risk-adjusted performance metrics, and visualises portfolio returns against the Nifty 50 benchmark — updated automatically every 60 seconds.

**Live site → [trakrr.onrender.com](https://trakrr.onrender.com)**

---

## What it does

- Fetches 6 months of live price data from Yahoo Finance (NSE stocks, 15-min delay)
- Calculates total return, Sharpe ratio, alpha vs Nifty 50, best and worst days
- Plots an interactive chart — portfolio vs benchmark, indexed to 100
- Shows per-stock breakdown: price, daily return, total return, portfolio weight
- Auto-refreshes every 60 seconds in the browser
- Fully deployed and accessible online

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, Flask, yfinance, pandas |
| Frontend | HTML, CSS, Chart.js |
| Deployment | Render (free tier), Gunicorn |
| Version control | Git, GitHub |

## Project structure

```
Trackrr/
├── app.py              # Flask server — fetches data, serves API
├── requirements.txt    # Python dependencies
└── templates/
    └── index.html      # Frontend dashboard
```

## Run locally

```bash
git clone https://github.com/aliasgarj0har/Trakrr.git
cd Trakrr
pip install -r requirements.txt
python3 app.py
```

Then open `http://127.0.0.1:5000` in your browser.

## Customise your portfolio

Edit the `HOLDINGS` dictionary in `app.py`:

```python
HOLDINGS = {
    "RELIANCE.NS": {"shares": 10, "name": "Reliance Industries"},
    "INFY.NS":     {"shares": 20, "name": "Infosys"},
    "TCS.NS":      {"shares": 5,  "name": "Tata Consultancy Services"},
    "HDFCBANK.NS": {"shares": 15, "name": "HDFC Bank"},
}
```

Use `.NS` suffix for NSE stocks. For US stocks, just use the ticker (e.g. `AAPL`).

## Note on data

Price data is sourced from Yahoo Finance via the `yfinance` library and carries an approximate 15-minute delay. This is standard for free market data feeds and is clearly disclosed on the dashboard.

---

Built by [Aliasgar Johar](https://github.com/aliasgarj0har) · Undergraduate Finance Student
