"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const lessons = [
  {
    category: "Portfolio Basics",
    color: "#7c3aed",
    items: [
      {
        title: "What is a Paper Portfolio?",
        badge: "Beginner",
        content: `A paper portfolio simulates investing without using real money. You track hypothetical trades at real market prices to test strategies and build intuition — exactly what Trackrr does.

The name comes from the old practice of writing down imaginary trades on paper. Today, tools like Trackrr let you do this digitally with live market data.

Why use one? Paper trading lets you learn market mechanics, test investment theses, and build confidence before committing real capital.`,
      },
      {
        title: "Absolute Return vs. CAGR",
        badge: "Beginner",
        content: `Absolute Return is the total percentage gain or loss on an investment from start to now, regardless of how long you held it.

CAGR (Compound Annual Growth Rate) normalises return by time — it tells you what annual return would produce the same final result. It's more useful for comparing investments held for different periods.

Formula: CAGR = (End Value / Start Value)^(1/Years) − 1

Example: A 50% absolute return over 3 years = 14.5% CAGR.`,
      },
    ],
  },
  {
    category: "Risk Metrics",
    color: "#10b981",
    items: [
      {
        title: "Sharpe Ratio Explained",
        badge: "Intermediate",
        content: `The Sharpe Ratio measures risk-adjusted return — how much return you earn per unit of risk taken.

Formula: (Portfolio Return − Risk-Free Rate) / Portfolio Volatility

Interpretation:
• < 0 — negative alpha, worse than risk-free
• 0–1 — suboptimal but positive
• 1–2 — good
• > 2 — excellent

The risk-free rate is typically the yield on 91-day T-Bills. Trackrr uses Nifty 50 returns as the benchmark.`,
      },
      {
        title: "Volatility & Standard Deviation",
        badge: "Intermediate",
        content: `Volatility measures how much an asset's price fluctuates. In Trackrr, we calculate annualised volatility as the standard deviation of daily returns × √252 (trading days per year).

Higher volatility = higher risk, but also higher potential reward. A portfolio with 20% annualised volatility is considered moderate for equities.

Nifty 50 historically sits around 15–20% annualised volatility.`,
      },
      {
        title: "Alpha & Beta",
        badge: "Intermediate",
        content: `Beta measures your portfolio's sensitivity to the market. A beta of 1.2 means if Nifty falls 10%, your portfolio tends to fall 12%.
• Beta < 1 = defensive
• Beta > 1 = aggressive
• Beta = 1 = moves with the market

Alpha is the excess return above what beta would predict. Positive alpha means your stock picks are adding value beyond market exposure.

Alpha = Actual Return − (Risk-Free Rate + Beta × (Market Return − Risk-Free Rate))`,
      },
    ],
  },
  {
    category: "Markets",
    color: "#f59e0b",
    items: [
      {
        title: "NSE Tickers Explained",
        badge: "Beginner",
        content: `On the National Stock Exchange (NSE), tickers use the format SYMBOL.NS for yfinance.

Common examples:
• RELIANCE.NS — Reliance Industries
• HDFCBANK.NS — HDFC Bank
• TMPV.NS — Tata Motors (post-restructure ticker)
• ETERNAL.NS — Eternal Ltd. (formerly Zomato)

US stocks use plain tickers: AAPL, AMZN, MSFT. Trackrr auto-converts USD prices to INR using live exchange rates.`,
      },
      {
        title: "P/E Ratio",
        badge: "Beginner",
        content: `The Price-to-Earnings (P/E) ratio tells you how much investors are paying for ₹1 of earnings.

Formula: Market Price per Share / Earnings per Share (EPS)

A P/E of 25 means investors pay ₹25 for every ₹1 of annual profit. High P/E = growth expectations. Low P/E = value stock or distress.

Context matters: compare P/E within the same sector, not across industries. Tech stocks typically have higher P/Es than utilities.`,
      },
    ],
  },
];

function Lesson({ title, badge, content }: { title: string; badge: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-beige/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-beige">{title}</span>
          <Badge variant={badge === "Beginner" ? "muted" : "purple"}>{badge}</Badge>
        </div>
        <ChevronDown
          size={15}
          className={cn("text-beige/30 transition-transform duration-200 flex-shrink-0 ml-3", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="text-sm text-beige/60 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-beige tracking-tight">Learn</h1>
        <p className="text-beige/40 text-sm mt-1">Finance concepts explained simply</p>
      </div>

      <div className="space-y-6">
        {lessons.map(({ category, color, items }) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <h2 className="text-xs font-semibold text-beige/50 uppercase tracking-widest">{category}</h2>
            </div>
            <Card className="p-0 overflow-hidden">
              {items.map((item) => (
                <Lesson key={item.title} {...item} />
              ))}
            </Card>
          </div>
        ))}
      </div>

      <div className="glass-purple rounded-xl p-5 text-center">
        <p className="text-purple-light text-sm font-medium">More topics coming soon</p>
        <p className="text-beige/40 text-xs mt-1">DCF valuation, options basics, sector analysis & more</p>
      </div>
    </div>
  );
}
