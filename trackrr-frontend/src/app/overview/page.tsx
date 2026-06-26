"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/hooks/usePortfolio";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Shield } from "lucide-react";

export default function OverviewPage() {
  const { data, loading, error, refetch } = usePortfolio();

  if (error) {
    return (
      <div className="p-6 md:p-10">
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={refetch} className="mt-4 text-xs text-beige/50 hover:text-beige flex items-center gap-1.5 mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const isPositive = (data?.total_ret ?? 0) >= 0;
  const todayPos = (data?.today_change ?? 0) >= 0;

  return (
    <div className="p-6 md:p-10 space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-beige tracking-tight">Overview</h1>
          <p className="text-beige/40 text-sm mt-1">
            Paper Portfolio · Since {data?.start_date ?? "01 Jan 2026"}
          </p>
        </div>
        <button
          onClick={refetch}
          className="glass rounded-lg p-2 text-beige/40 hover:text-beige/80 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </motion.div>

      {/* Hero stat */}
      <motion.div
        className="glass-purple rounded-2xl p-8 glow-purple"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-beige/50 text-xs font-medium uppercase tracking-widest mb-2">
          Total Portfolio Value
        </p>
        {loading ? (
          <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        ) : (
          <>
            <p className="text-4xl font-bold text-beige tracking-tight">
              {formatCurrency(data?.end_val ?? 0)}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {isPositive
                ? <TrendingUp size={14} className="text-emerald-400" />
                : <TrendingDown size={14} className="text-red-400" />
              }
              <span className={`text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(Math.abs((data?.end_val ?? 0) - (data?.start_val ?? 0)))}
              </span>
              <Badge variant={isPositive ? "positive" : "negative"}>
                {formatPercent(data?.total_ret ?? 0)}
              </Badge>
              <span className="text-beige/30 text-xs">vs start</span>
              <span className="text-beige/20 text-xs mx-1">·</span>
              <span className={`text-xs ${todayPos ? "text-emerald-400" : "text-red-400"}`}>
                {todayPos ? "+" : ""}{formatCurrency(data?.today_change_abs ?? 0)} today
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Start Value"
              value={formatCurrency(data?.start_val ?? 0)}
              icon={<DollarSign size={14} />}
            />
            <StatCard
              label="Today's Change"
              value={formatPercent(data?.today_change ?? 0)}
              subValue={formatCurrency(data?.today_change_abs ?? 0)}
              positive={todayPos}
              icon={<Activity size={14} />}
            />
            <StatCard
              label="vs Nifty 50"
              value={formatPercent(data?.nifty_total ?? 0)}
              subValue={`Alpha: ${formatPercent(data?.alpha ?? 0)}`}
              positive={(data?.alpha ?? 0) > 0}
              icon={<TrendingUp size={14} />}
            />
            <StatCard
              label="Max Drawdown"
              value={formatPercent(data?.max_dd ?? 0)}
              subValue={`Sharpe: ${(data?.sharpe ?? 0).toFixed(2)}`}
              positive={(data?.max_dd ?? 0) > -10}
              icon={<Shield size={14} />}
            />
          </>
        )}
      </motion.div>

      {/* Charts row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio vs Benchmarks</CardTitle>
            <Badge variant="muted">Indexed to 100</Badge>
          </CardHeader>
          {loading ? (
            <div className="h-52 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <PortfolioChart chart={data?.chart ?? { dates: [], portfolio: [], nifty: [], sp500: [] }} />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          {loading ? (
            <div className="h-52 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <AllocationChart holdings={data?.holdings ?? []} />
          )}
        </Card>
      </motion.div>

      {data?.updated_at && (
        <p className="text-beige/20 text-xs text-right">Updated {data.updated_at}</p>
      )}
    </div>
  );
}