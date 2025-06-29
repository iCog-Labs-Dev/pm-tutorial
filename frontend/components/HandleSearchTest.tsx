import React from "react"
import { useState } from "react"

export interface SearchResult {
  url: string
  title: string
  relevance: number
  sectionTitle?: string
  description: string
  matchContext?: string
  category: string
  tags: string[]
}

export  const [searchQuery, setSearchQuery] = useState("")
export  const [results, setResults] = useState<SearchResult[]>([])
export  const [isSearching, setIsSearching] = useState(false)
export  const [debugInfo, setDebugInfo] = useState("")
export  const [error, setError] = useState<string | null>(null)

export  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setDebugInfo(`Searching for: "${searchQuery.trim()}"...`)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)

      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}: ${response.statusText}`)
      }

      const data: SearchResult[] = await response.json()
      
      setResults(data)
      setDebugInfo(
        `Search complete. Found ${data.length} results for "${searchQuery.trim()}"\n\n` +
          `The search looks for exact matches of your query in all LaTeX files.`,
      )
    } catch (error) {
      console.error("Search error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage)
      setDebugInfo(`Error searching: ${errorMessage}`)
    } finally {
      setIsSearching(false)
    }
  }