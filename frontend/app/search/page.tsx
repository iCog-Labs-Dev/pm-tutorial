import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string }
}) {
  const query = searchParams.q || ""

  // This page is now only shown when no results are found
  return (
    <div className=" py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">No Results Found</h1>
          <p className="text-muted-foreground">{` No results found for ${query}`}</p>
        </div>

        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">Try searching with different keywords</h2>
 
        </div>
      </div>
    </div>
  )
}
