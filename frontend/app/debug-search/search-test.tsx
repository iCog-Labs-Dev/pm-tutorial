"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Result from "@/components/Result"
import { SearchResult, searchQuery,setSearchQuery,results,setResults, isSearching,setIsSearching,debugInfo,setDebugInfo,error,setError,handleSearch} from "@/components/HandleSearchTest"



export function SearchTest() {


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Test Tool</CardTitle>
          <CardDescription>Test the search functionality with detailed results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <Textarea
            readOnly
            value={debugInfo}
            className="min-h-[100px] font-mono text-sm"
            placeholder="Debug information will appear here..."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {`Found ${results.length} results for "${searchQuery}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Result result={result} index={index}/>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Click on a result title to navigate to that page</p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}