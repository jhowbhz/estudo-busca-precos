'use client'

import { StoreStatus } from '@/lib/api'

interface StoreProgressProps {
  stores: StoreStatus[]
  completedCount: number
  totalCount: number
}

export default function StoreProgress({ stores, completedCount, totalCount }: StoreProgressProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 mb-4">
      {/* Barra de progresso */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        {stores.map((store) => (
          <span
            key={store.name}
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-300
              ${store.status === 'done'
                ? 'bg-green-50 text-green-700'
                : store.status === 'searching'
                ? 'bg-blue-50 text-blue-600 animate-pulse'
                : store.status === 'error'
                ? 'bg-red-50 text-red-500'
                : store.status === 'empty'
                ? 'bg-gray-50 text-gray-400'
                : 'bg-gray-50 text-gray-300'
              }
            `}
          >
            {store.status === 'searching' && (
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
            )}
            {store.status === 'done' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {store.status === 'error' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {store.displayName}
            {store.productCount !== undefined && store.productCount > 0 && (
              <span className="text-[10px] text-green-600 font-semibold">{store.productCount}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
