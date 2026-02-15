'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import { getSuggestions, getPopularSuggestions } from '@/lib/search-suggestions'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
  autoFocus?: boolean
}

export default function SearchBar({ onSearch, initialValue = '', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Calcular sugestões de forma derivada
  const suggestions = query.trim().length > 0
    ? getSuggestions(query)
    : showSuggestions ? getPopularSuggestions() : []

  const visibleSuggestions = showSuggestions && suggestions.length > 0
  const isPopular = query.trim().length === 0

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      onSearch(query)
    }
  }

  const handleSelect = (text: string) => {
    setQuery(text)
    setShowSuggestions(false)
    onSearch(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!visibleSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault()
          handleSelect(suggestions[selectedIndex].text)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Scroll o item selecionado para a visão
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Reset selectedIndex quando query muda
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  return (
    <div ref={containerRef} className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className={`
          flex items-center border rounded-full px-4 py-2 transition-all
          ${visibleSuggestions
            ? 'shadow-md border-gray-300 rounded-b-none rounded-t-2xl border-b-0'
            : showSuggestions
              ? 'shadow-md border-gray-300'
              : 'shadow-sm border-gray-200 hover:shadow-md'
          }
        `}>
          <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar produto..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            autoFocus={autoFocus}
            autoComplete="off"
            role="combobox"
            aria-expanded={visibleSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setShowSuggestions(true)
                inputRef.current?.focus()
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de sugestões */}
      {visibleSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 z-50 bg-white border border-gray-300 border-t-0 rounded-b-2xl shadow-md overflow-hidden"
          role="listbox"
        >
          {/* Separador fino */}
          <div className="mx-4 border-t border-gray-100" />

          {isPopular && (
            <div className="px-4 pt-2 pb-1">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Buscas populares</span>
            </div>
          )}

          <div className="py-1 max-h-[320px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.text}-${index}`}
                data-suggestion-item
                type="button"
                onClick={() => handleSelect(suggestion.text)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left transition-colors text-sm
                  ${index === selectedIndex
                    ? 'bg-gray-50'
                    : 'hover:bg-gray-50'
                  }
                `}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {/* Ícone */}
                {isPopular ? (
                  <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}

                {/* Texto da sugestão com highlight */}
                <span className="flex-1 truncate">
                  {highlightMatch(suggestion.text, query)}
                </span>

                {/* Categoria */}
                <span className="text-[10px] text-gray-300 shrink-0">{suggestion.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Destaca a parte do texto que corresponde ao query
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return <span className="text-gray-700">{text}</span>

  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedQuery = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const index = normalizedText.indexOf(normalizedQuery)
  if (index === -1) return <span className="text-gray-700">{text}</span>

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.trim().length)
  const after = text.slice(index + query.trim().length)

  return (
    <>
      {before && <span className="text-gray-700 font-medium">{before}</span>}
      <span className="text-gray-400">{match}</span>
      {after && <span className="text-gray-700 font-medium">{after}</span>}
    </>
  )
}
