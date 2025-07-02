// components/useDebugSearch.ts
"use client";

import { useState } from "react";

export function useDebugSearch() {
  const [searchType, setSearchType]   = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debugInfo, setDebugInfo]     = useState("");

  const handleDirectSearch = () => {
    if (searchQuery.trim()) {
      const url = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`;
      window.location.href = url;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`;
      setDebugInfo(`Form submitted. Redirecting to: ${url}`);
      window.location.href = url;
    }
  };

  return {
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    debugInfo,
    handleDirectSearch,
    handleFormSubmit,
  };
}
