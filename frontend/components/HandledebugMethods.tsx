  import React from 'react'
  import { useState } from 'react'
  export const [searchType, setSearchType] = useState("all")

  export const [searchQuery, setSearchQuery] = useState("")

  export const [debugInfo, setDebugInfo] = useState("")
  
  export const handleDirectSearch = () => {
    if (searchQuery.trim()) {
      const url = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`
      window.location.href = url
    }
  }
  

  export const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        const url = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`
        setDebugInfo(`Form submitted. Redirecting to: ${url}`)
        window.location.href = url
      }
    }

