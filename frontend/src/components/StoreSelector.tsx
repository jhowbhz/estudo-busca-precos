'use client'

import { useState, useEffect, useRef } from 'react'

export interface StoreOption {
  name: string
  displayName: string
  color: string
}

const ALL_STORES: StoreOption[] = [
  { name: 'kabum', displayName: 'KaBuM!', color: 'bg-orange-500' },
  { name: 'mercadolivre', displayName: 'Mercado Livre', color: 'bg-yellow-500' },
  { name: 'magalu', displayName: 'Magalu', color: 'bg-blue-600' },
  { name: 'amazon', displayName: 'Amazon', color: 'bg-orange-600' },
  { name: 'samsung', displayName: 'Samsung', color: 'bg-blue-800' },
  { name: 'havan', displayName: 'Havan', color: 'bg-blue-900' },
  { name: 'pichau', displayName: 'Pichau', color: 'bg-purple-600' },
  { name: 'terabyte', displayName: 'Terabyte', color: 'bg-green-600' },
  { name: 'dell', displayName: 'Dell', color: 'bg-blue-700' },
  { name: 'fastshop', displayName: 'Fast Shop', color: 'bg-gray-700' },
  { name: 'asus', displayName: 'ASUS Store', color: 'bg-blue-500' },
  { name: 'leroymerlin', displayName: 'Leroy Merlin', color: 'bg-green-500' },
  { name: 'ibyte', displayName: 'iByte', color: 'bg-red-500' },
]

interface StoreSelectorProps {
  selected: string[]
  onChange: (stores: string[]) => void
  compact?: boolean
}

export default function StoreSelector({ selected, onChange, compact = false }: StoreSelectorProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const allSelected = selected.length === 0

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleStore = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const selectAll = () => {
    onChange([])
  }

  const label = allSelected
    ? 'Todas as lojas'
    : selected.length === 1
      ? ALL_STORES.find(s => s.name === selected[0])?.displayName || '1 loja'
      : `${selected.length} lojas`

  return (
    <div ref={containerRef} className={`relative ${compact ? 'inline-block' : 'w-full max-w-xs'}`}>
      {/* Botão trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all w-full
          ${open
            ? 'border-blue-300 ring-2 ring-blue-100 bg-white shadow-sm'
            : allSelected
              ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-600'
              : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
          }
        `}
      >
        {/* Ícone loja */}
        <svg className={`w-4 h-4 shrink-0 ${allSelected ? 'text-gray-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V3.375c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125v5.974" />
        </svg>

        <span className="flex-1 text-left truncate">{label}</span>

        {/* Badge contador */}
        {!allSelected && (
          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none font-medium">
            {selected.length}
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fadeIn min-w-[220px]">
          {/* Header: Selecionar todas */}
          <button
            type="button"
            onClick={selectAll}
            className={`
              w-full flex items-center gap-3 px-3.5 py-2.5 text-sm border-b border-gray-100 transition-colors
              ${allSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}
            `}
          >
            <div className={`
              w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
              ${allSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
            `}>
              {allSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            Todas as lojas
          </button>

          {/* Lista de lojas */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {ALL_STORES.map((store) => {
              const isChecked = selected.includes(store.name)
              return (
                <button
                  key={store.name}
                  type="button"
                  onClick={() => toggleStore(store.name)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2 text-sm transition-colors
                    ${isChecked ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Checkbox */}
                  <div className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  `}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>

                  {/* Bolinha de cor */}
                  <span className={`w-2 h-2 rounded-full ${store.color} shrink-0`} />

                  {/* Nome */}
                  <span className={`flex-1 text-left ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {store.displayName}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Footer: limpar */}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3.5 py-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {selected.length} {selected.length === 1 ? 'selecionada' : 'selecionadas'}
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] text-blue-500 hover:text-blue-600 font-medium"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { ALL_STORES }
