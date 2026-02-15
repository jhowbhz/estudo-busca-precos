'use client'

import { useState } from 'react'
import { SearchFilters, Product } from '@/lib/api'

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  products: Product[]
}

export default function FilterSidebar({ filters, onFiltersChange, products }: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const uniqueStores = Array.from(new Set(products.map(p => p.store)))
  const storeCount = (store: string) => products.filter(p => p.store === store).length

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any })
  }

  const handleStoreToggle = (store: string) => {
    const currentStores = filters.stores || []
    const newStores = currentStores.includes(store)
      ? currentStores.filter(s => s !== store)
      : [...currentStores, store]
    onFiltersChange({ ...filters, stores: newStores.length > 0 ? newStores : undefined })
  }

  const handlePriceFilter = () => {
    onFiltersChange({
      ...filters,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    })
  }

  const clearPriceFilter = () => {
    setMinPrice('')
    setMaxPrice('')
    onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 sticky top-20">
      {/* Ordenacao */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ordenar</h3>
        <div className="space-y-1">
          {[
            { value: 'price_asc', label: 'Menor preco' },
            { value: 'price_desc', label: 'Maior preco' },
            { value: 'relevance', label: 'Relevancia' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={`
                w-full text-left px-3 py-1.5 rounded text-sm transition-colors
                ${filters.sortBy === opt.value
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Faixa de preco */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preco</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400"
          />
          <span className="text-gray-300 self-center">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePriceFilter}
            className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            Aplicar
          </button>
          {(filters.minPrice || filters.maxPrice) && (
            <button
              onClick={clearPriceFilter}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-600 text-xs"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Opcoes */}
      <div className="mb-5 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStockOnly || false}
            onChange={() => onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800">Em estoque</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.withDiscountOnly || false}
            onChange={() => onFiltersChange({ ...filters, withDiscountOnly: !filters.withDiscountOnly })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800">Com desconto</span>
        </label>
      </div>

      {/* Lojas encontradas */}
      {uniqueStores.length > 0 && (
        <>
          <hr className="border-gray-100 mb-5" />
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Lojas ({uniqueStores.length})
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {uniqueStores.map((store) => {
                const product = products.find(p => p.store === store)
                const count = storeCount(store)
                return (
                  <label key={store} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.stores?.includes(store) || false}
                      onChange={() => handleStoreToggle(store)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 flex-1">
                      {product?.storeDisplayName || store}
                    </span>
                    <span className="text-[11px] text-gray-300">{count}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
