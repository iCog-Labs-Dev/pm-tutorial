// hooks/useMeTTaHighlighter.ts
import { useState, useEffect } from 'react'

interface UseMeTTaHighlighterReturn {
  highlightedCode: string
  prismLoaded: boolean
  isLoading: boolean
  error: string | null
}

// Type definitions for Prism
interface PrismToken {
  type: string
  content: any // Prism's TokenStream can be complex, so we use any here
  alias?: string | string[]
}

interface StackItem {
  index: number
  level: number
}

export const useMeTTaHighlighter = (code: string): UseMeTTaHighlighterReturn => {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [prismLoaded, setPrismLoaded] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Load Prism.js and define MeTTa language
  useEffect(() => {
    const loadPrism = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Import Prism core
        const prismModule = await import("prismjs")
        const Prism = prismModule.default

        // Define MeTTa language with enhanced syntax support
        Prism.languages.metta = {
          // Comments: both single-line and block
          comment: [
            {
              pattern: /;.*$/m, // single-line
              greedy: true,
            },
            {
              pattern: /\/\*[\s\S]*?\*\//, // block /* ... */
              greedy: true,
            },
          ],

          // Strings: single and double quoted
          string: [
            {
              pattern: /'(?:[^'\\]|\\.)*'/,
              greedy: true,
            },
            {
              pattern: /"(?:[^"\\]|\\.)*"/,
              greedy: true,
            },
          ],

          // Variables: starting with $
          variable: {
            pattern: /\$[a-zA-Z_][a-zA-Z0-9_-]*/,
            alias: 'variable',
          },

          // AtomSpace: starting with &
          atomspace: {
            pattern: /&[a-zA-Z_][a-zA-Z0-9_-]*/,
            alias: 'atomspace',
          },

          // Keywords (excluding variables which are now handled separately)
          keyword: {
            pattern: /\b(?:Type!)\b/,
            alias: 'keyword',
            greedy: true,
          },

          // Operators
          operator: {
            pattern: /[:+*/\-]|->|=/,
            alias: 'operator'
          },

          // Numbers
          number: {
            pattern: /\b\d+(?:\.\d+)?\b/,
          },

          // Function-like identifiers
          function: {
            pattern: /\b[a-zA-Z][a-zA-Z0-9-]*(?=\s*[(!])/,
          },

          // Brackets and other punctuation
          bracket: {
            pattern: /[\[\]{}]/,
          },

          // Punctuation like commas or semicolons
          punctuation_mark: {
            pattern: /[;,]/,
          },
        }

        // Add custom parentheses handling after language definition
        Prism.hooks.add('after-tokenize', function (env: any) {
          if (env.language !== 'metta') return
          
          processParentheses(env.tokens)
        })

        // Function to process parentheses and add nesting levels
        function processParentheses(tokens: any[]): void {
          const stack: StackItem[] = []
          
          function processToken(
            token: any, 
            index: number, 
            parentArray: any[]
          ): number {
            if (typeof token === 'string') {
              // Handle string tokens that might contain parentheses
              const chars = token.split('')
              const newTokens: any[] = []
              
              for (let i = 0; i < chars.length; i++) {
                const char = chars[i]
                if (char === '(') {
                  stack.push({ index: newTokens.length, level: stack.length })
                  newTokens.push(new Prism.Token('paren-open', char, [`paren-level-${stack.length % 6}`]))
                } else if (char === ')') {
                  if (stack.length > 0) {
                    const openParen = stack.pop()
                    newTokens.push(new Prism.Token('paren-close', char, [`paren-level-${(stack.length + 1) % 6}`]))
                  } else {
                    // Unmatched closing parenthesis
                    newTokens.push(new Prism.Token('paren-unmatched', char, ['paren-error']))
                  }
                } else {
                  newTokens.push(char)
                }
              }
              
              // Replace the original token with processed tokens
              if (newTokens.length > 1 || (newTokens.length === 1 && typeof newTokens[0] !== 'string')) {
                parentArray.splice(index, 1, ...newTokens)
                return newTokens.length - 1 // Return offset for index adjustment
              }
            } else if (token.type === 'punctuation' && token.alias === 'parenthesis') {
              // Handle parentheses that were already tokenized
              if (token.content === '(') {
                stack.push({ index, level: stack.length })
                token.type = 'paren-open'
                token.alias = [`paren-level-${stack.length % 6}`]
              } else if (token.content === ')') {
                if (stack.length > 0) {
                  const openParen = stack.pop()
                  token.type = 'paren-close'
                  token.alias = [`paren-level-${(stack.length + 1) % 6}`]
                } else {
                  token.type = 'paren-unmatched'
                  token.alias = ['paren-error']
                }
              }
            } else if (token.content && Array.isArray(token.content)) {
              // Recursively process nested tokens
              for (let i = 0; i < token.content.length; i++) {
                const offset = processToken(token.content[i], i, token.content)
                if (offset) i += offset
              }
            }
            return 0
          }
          
          // Process all tokens
          for (let i = 0; i < tokens.length; i++) {
            const offset = processToken(tokens[i], i, tokens)
            if (offset) i += offset
          }
          
          // Mark remaining unclosed parentheses
          stack.forEach((unclosed: StackItem) => {
            // Find and mark unclosed opening parentheses as errors
            // This is a simplified approach - in a real implementation you'd want to track positions better
          })
        }

        setPrismLoaded(true)
      } catch (err) {
        console.error("Failed to load Prism:", err)
        setError("Failed to load syntax highlighter")
      } finally {
        setIsLoading(false)
      }
    }

    loadPrism()
  }, [])

  // Apply syntax highlighting when code changes or Prism loads
  useEffect(() => {
    if (!prismLoaded || !code) {
      if (code) {
        setHighlightedCode(escapeHtml(code))
      }
      return
    }

    const highlightCode = async () => {
      try {
        const Prism = (await import("prismjs")).default
        const highlighted = Prism.highlight(code, Prism.languages.metta, "metta")
        setHighlightedCode(highlighted)
      } catch (err) {
        console.error("Failed to highlight code:", err)
        // Fallback to plain text if highlighting fails
        setHighlightedCode(escapeHtml(code))
        setError("Failed to highlight code, showing plain text")
      }
    }

    highlightCode()
  }, [code, prismLoaded])

  // Escape HTML to prevent XSS when fallback is needed
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  return {
    highlightedCode,
    prismLoaded,
    isLoading,
    error
  }
}