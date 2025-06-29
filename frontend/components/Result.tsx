import React from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  url: string
  title: string
  relevance: number
  sectionTitle?: string
  description: string
  matchContext?: string
  category: string
  tags: string[]
}

interface ResultProps {
  result: SearchResult
  index: number
}

const Result: React.FC<ResultProps> = ({ result, index }) => {
  return (
    <div key={index} className="border rounded-md p-4">
      <div className="flex justify-between items-start mb-2">
        <Link href={result.url} className="text-lg font-medium hover:underline">
          {result.title}
        </Link>
        <Badge variant="outline">Relevance: {result.relevance}</Badge>
      </div>

      {result.sectionTitle && (
        <div className="mb-2">
          <Badge variant="secondary">Section: {result.sectionTitle}</Badge>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-2">{result.description}</p>

      {result.matchContext && (
        <div className="bg-muted p-2 rounded text-sm font-mono mt-2 whitespace-pre-wrap">
          <p className="text-xs text-muted-foreground mb-1">Match context:</p>
          {result.matchContext}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-2">
        <Badge variant="outline" className="text-xs">
          {result.category}
        </Badge>
        {result.tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <p>URL: {result.url}</p>
      </div>
    </div>
  )
}

export default Result
