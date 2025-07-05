
"use client";

import { useState } from "react";

export interface SearchResult {
  url: string;
  title: string;
  relevance: number;
  sectionTitle?: string;
  description: string;
  matchContext?: string;
  category: string;
  tags: string[];
}

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults]         = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debugInfo, setDebugInfo]     = useState("");
  const [error, setError]             = useState<string | null>(null);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setError(null);
    setDebugInfo(`Searching for: "${q}"...`);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        throw new Error(`Search API returned ${res.status}: ${res.statusText}`);
      }
      const data: SearchResult[] = await res.json();
      setResults(data);
      setDebugInfo(
        `Search complete. Found ${data.length} results for "${q}".\n\n` +
        `The search looks for exact matches of your query in all LaTeX files.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Search error:", err);
      setError(msg);
      setDebugInfo(`Error searching: ${msg}`);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    results,
    isSearching,
    debugInfo,
    error,
    handleSearch,
  };
}
