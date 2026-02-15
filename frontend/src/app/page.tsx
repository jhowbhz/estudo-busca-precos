'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_STORES } from '@/components/StoreSelector'
import Logo from '@/components/Logo'
import { getSuggestions, getPopularSuggestions } from '@/lib/search-suggestions'

export default function Home() {
  const router = useRouter()
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [query, setQuery] = useState('')
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

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim()
    if (term) {
      setShowSuggestions(false)
      const params = new URLSearchParams({ q: term })
      if (selectedStores.length > 0) {
        params.set('stores', selectedStores.join(','))
      }
      router.push(`/search?${params.toString()}`)
    }
  }

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

  const handleSelect = (text: string) => {
    setQuery(text)
    setShowSuggestions(false)
    handleSearch(text)
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

  // Scroll o item selecionado
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Reset selectedIndex quando sugestões mudam
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  // Focar o input após montagem no cliente (evita hydration mismatch)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[580px] -mt-20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Search Bar com sugestões */}
        <div ref={containerRef} className="relative w-full">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch() }}
            className="w-full"
          >
            <div className={`
              flex items-center border border-gray-200 px-4 py-3 transition-all
              ${visibleSuggestions
                ? 'shadow-md border-gray-300 rounded-t-2xl border-b-0'
                : showSuggestions
                  ? 'shadow-md border-gray-300 rounded-full'
                  : 'rounded-full shadow-sm hover:shadow-md'
              }
            `}>
              <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
                className="flex-1 text-base text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                placeholder="Buscar produto..."
                autoComplete="off"
                role="combobox"
                aria-expanded={visibleSuggestions}
                aria-haspopup="listbox"
                aria-autocomplete="list"
              />

              {query && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setShowSuggestions(true)
                      inputRef.current?.focus()
                    }}
                    className="text-gray-400 hover:text-gray-600 mr-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="w-px h-6 bg-gray-200 mr-2" />
                </>
              )}

              <button
                type="submit"
                disabled={!query.trim()}
                className="text-blue-500 hover:text-blue-600 disabled:text-gray-300 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Dropdown de sugestões */}
          {visibleSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 z-50 bg-white border border-gray-300 border-t-0 rounded-b-2xl shadow-md overflow-hidden"
              role="listbox"
            >
              {/* Separador */}
              <div className="mx-4 border-t border-gray-100" />

              {isPopular && (
                <div className="px-4 pt-2.5 pb-1">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Buscas populares</span>
                </div>
              )}

              <div className="py-1 max-h-[360px] overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.text}-${index}`}
                    data-suggestion-item
                    type="button"
                    onClick={() => handleSelect(suggestion.text)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
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
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    )}

                    {/* Texto com highlight */}
                    <span className="flex-1 text-sm truncate">
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

        {/* Store Chips */}
        <div className="mt-6">
          <HomeStoreChips selected={selectedStores} onChange={setSelectedStores} />
        </div>
      </div>
    </main>
  )
}

const FIRST_ROW = 5

function HomeStoreChips({ selected, onChange }: { selected: string[], onChange: (s: string[]) => void }) {
  const [expanded, setExpanded] = useState(false)
  const allSelected = selected.length === 0
  const firstRow = ALL_STORES.slice(0, FIRST_ROW)
  const secondRow = ALL_STORES.slice(FIRST_ROW)

  const toggleStore = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
        <button
          onClick={() => onChange([])}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
            allSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Todas
        </button>
        {firstRow.map((store) => (
          <button
            key={store.name}
            onClick={() => toggleStore(store.name)}
            className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
              selected.includes(store.name)
                ? `${store.color} text-white`
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {store.displayName}
          </button>
        ))}
        {!expanded && secondRow.length > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="px-3 py-1 rounded-full text-xs text-blue-500 hover:bg-blue-50 transition-all whitespace-nowrap shrink-0"
          >
            +{secondRow.length} mais
          </button>
        )}
      </div>
      {expanded && secondRow.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2 animate-fadeIn">
          {secondRow.map((store) => (
            <button
              key={store.name}
              onClick={() => toggleStore(store.name)}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
                selected.includes(store.name)
                  ? `${store.color} text-white`
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {store.displayName}
            </button>
          ))}
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-1 rounded-full text-xs text-gray-400 hover:bg-gray-100 transition-all whitespace-nowrap shrink-0"
          >
            menos
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {selected.length} {selected.length === 1 ? 'loja' : 'lojas'}
          <button onClick={() => onChange([])} className="ml-1.5 text-blue-500 hover:underline">limpar</button>
        </p>
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
