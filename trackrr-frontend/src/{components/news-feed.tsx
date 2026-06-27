"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { ExternalLink } from "lucide-react";

interface Article {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  urlToImage?: string;
}

const QUERIES = ["Adani Ports", "Tata Motors", "Zomato", "Amazon stock", "Apple stock"];

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const query = QUERIES.join(" OR ");
        const res = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=8&sortBy=publishedAt&language=en&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
        );
        const data = await res.json();
        if (data.articles) setArticles(data.articles);
      } catch (e) {
        console.error("News fetch failed", e);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <Badge variant="muted">Your holdings</Badge>
      </CardHeader>
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))
          : articles.length === 0
          ? <p className="text-beige/30 text-sm">No news found</p>
          : articles.map((a, i) => (
              
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group hover:bg-white/3 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-beige/80 group-hover:text-beige transition-colors line-clamp-2 leading-snug">
                    {a.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-beige/30">{a.source.name}</span>
                    <span className="text-beige/20 text-xs">·</span>
                    <span className="text-xs text-beige/30">
                      {new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
                <ExternalLink size={12} className="text-beige/20 group-hover:text-beige/50 flex-shrink-0 mt-1" />
              </a>
            ))}
      </div>
    </Card>
  );
}