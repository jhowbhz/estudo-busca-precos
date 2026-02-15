'use client'

import { useState } from 'react'
import FilterSidebar from './FilterSidebar'
import { SearchFilters, Product } from '@/lib/api'

interface MobileFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  products: Product[]
}

export default function MobileFilter({ filters, onFiltersChange, products }: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botao flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        Filtros
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {/* Painel lateral */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FilterSidebar
            filters={filters}
            onFiltersChange={(newFilters) => {
              onFiltersChange(newFilters)
              setIsOpen(false)
            }}
            products={products}
          />
        </div>
      </div>
    </>
  )
}
