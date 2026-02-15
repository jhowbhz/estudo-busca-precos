'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import FilterSidebar from '@/components/FilterSidebar'
import MobileFilter from '@/components/MobileFilter'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import StoreProgress from '@/components/StoreProgress'
import StoreSelector from '@/components/StoreSelector'
import Logo from '@/components/Logo'
import { searchProductsStream, Product, SearchFilters, StoreStatus, StreamEvent } from '@/lib/api'

function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const storesParam = searchParams.get('stores') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState(0)
  const [storeStatuses, setStoreStatuses] = useState<StoreStatus[]>([])
  const [completedStores, setCompletedStores] = useState(0)
  const [totalStores, setTotalStores] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'price_asc' })
  const [selectedStores, setSelectedStores] = useState<string[]>(
    storesParam ? storesParam.split(',').filter(Boolean) : []
  )
  const cancelRef = useRef<(() => void) | null>(null)

  const cancelSearch = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current()
      cancelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!query) { router.push('/'); return }
    const urlStores = storesParam ? storesParam.split(',').filter(Boolean) : []
    setSelectedStores(urlStores)
    performSearch(urlStores)
    return () => cancelSearch()
  }, [query, storesParam])

  const performSearch = (storesToSearch?: string[]) => {
    cancelSearch()
    const stores = storesToSearch ?? selectedStores
    setProducts([])
    setIsSearching(true)
    setIsDone(false)
    setError(null)
    setSearchTime(0)
    setStoreStatuses([])
    setCompletedStores(0)
    setTotalStores(0)

    const searchFilters: SearchFilters = {
      ...filters,
      stores: stores.length > 0 ? stores : undefined,
    }
    const cancel = searchProductsStream(query, searchFilters, handleStreamEvent)
    cancelRef.current = cancel
  }

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'start':
        setTotalStores(event.data.totalStores)
        setStoreStatuses(event.data.stores.map((s: any) => ({
          name: s.name, displayName: s.displayName, status: 'pending' as const,
        })))
        break
      case 'searching':
        setStoreStatuses(prev => prev.map(s =>
          s.name === event.data.store ? { ...s, status: 'searching' as const } : s
        ))
        break
      case 'store_result':
        setProducts(event.data.allProducts)
        setCompletedStores(event.data.storesCompleted)
        setSearchTime(event.data.searchTime)
        setStoreStatuses(prev => prev.map(s =>
          s.name === event.data.store
            ? { ...s, status: 'done' as const, productCount: event.data.newProducts.length, time: event.data.engineTime }
            : s
        ))
        break
      case 'store_empty':
        setCompletedStores(event.data.storesCompleted)
        setStoreStatuses(prev => prev.map(s =>
          s.name === event.data.store ? { ...s, status: 'empty' as const, time: event.data.engineTime } : s
        ))
        break
      case 'store_error':
        setCompletedStores(event.data.storesCompleted)
        setStoreStatuses(prev => prev.map(s =>
          s.name === event.data.store ? { ...s, status: 'error' as const, error: event.data.error } : s
        ))
        break
      case 'cached':
        setProducts(event.data.results)
        setSearchTime(event.data.searchTime)
        setIsSearching(false)
        setIsDone(true)
        break
      case 'done':
        setProducts(event.data.results)
        setSearchTime(event.data.searchTime)
        setIsSearching(false)
        setIsDone(true)
        setCompletedStores(event.data.storesSearched.length + (event.data.storesFailed?.length || 0))
        break
    }
  }, [])

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams({ q: newQuery })
    if (selectedStores.length > 0) params.set('stores', selectedStores.join(','))
    router.push(`/search?${params.toString()}`)
  }

  const handleStoreChange = (stores: string[]) => {
    setSelectedStores(stores)
    const params = new URLSearchParams({ q: query })
    if (stores.length > 0) params.set('stores', stores.join(','))
    router.push(`/search?${params.toString()}`)
  }

  const filteredProducts = products.filter(p => {
    if (filters.stores && filters.stores.length > 0 && !filters.stores.includes(p.store)) return false
    if (filters.minPrice && p.price < filters.minPrice) return false
    if (filters.maxPrice && p.price > filters.maxPrice) return false
    if (filters.inStockOnly && !p.inStock) return false
    if (filters.withDiscountOnly && !(p.originalPrice && p.originalPrice > p.price)) return false
    return true
  })

  const hasResults = products.length > 0
  const showSkeleton = isSearching && !hasResults

  return (
    <div className="min-h-screen bg-white">
      {/* Header - estilo Google */}
      <header className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="shrink-0">
              <Logo size="sm" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <SearchBar onSearch={handleSearch} initialValue={query} />
            </div>

            {/* Seletor de lojas */}
            <div className="shrink-0">
              <StoreSelector selected={selectedStores} onChange={handleStoreChange} compact />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-4">
        {/* Progresso */}
        {isSearching && storeStatuses.length > 0 && (
          <StoreProgress stores={storeStatuses} completedCount={completedStores} totalCount={totalStores} />
        )}

        {/* Info bar */}
        {hasResults && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
            <div>
              <span className="text-gray-600 font-medium">{filteredProducts.length}</span> resultados para{' '}
              <span className="text-gray-600">&quot;{query}&quot;</span>
              {searchTime > 0 && <span className="ml-1">({(searchTime / 1000).toFixed(1)}s)</span>}
              {isSearching && (
                <span className="ml-2 inline-flex items-center gap-1 text-blue-500">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                  buscando...
                </span>
              )}
            </div>
            {isDone && (
              <span>{completedStores} lojas</span>
            )}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="border border-red-100 rounded-lg p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => performSearch()}
              className="px-4 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Skeleton */}
        {showSkeleton && <LoadingSkeleton count={9} />}

        {/* Resultados */}
        {hasResults && (
          <div className="flex gap-6">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block w-56 shrink-0">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} products={products} />
            </aside>

            {/* Mobile filter */}
            <MobileFilter filters={filters} onFiltersChange={setFilters} products={products} />

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-400 text-sm mb-1">Nenhum produto com esses filtros</p>
                  <p className="text-gray-300 text-xs">Tente ajustar os filtros</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-20 lg:pb-0">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={`${product.store}-${index}`}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}

                  {/* Skeleton inline */}
                  {isSearching && [...Array(3)].map((_, i) => (
                    <div key={`skel-${i}`} className="bg-white border border-gray-100 rounded-lg p-3 animate-pulse">
                      <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-3" />
                      <div className="h-3 bg-gray-50 rounded w-16 mb-2" />
                      <div className="h-3 bg-gray-50 rounded w-full mb-1.5" />
                      <div className="h-5 bg-gray-50 rounded w-28" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nenhum resultado */}
        {isDone && !hasResults && !error && (
          <div className="py-20 text-center">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-gray-500 text-sm mb-1">
              Nenhum produto encontrado para &quot;{query}&quot;
            </p>
            <p className="text-gray-300 text-xs">Tente outros termos de busca</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={9} />}>
      <SearchResults />
    </Suspense>
  )
}
