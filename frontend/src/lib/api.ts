import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
})

export interface Product {
  name: string
  price: number
  originalPrice?: number
  url: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  inStock: boolean
  store: string
  storeDisplayName: string
}

export interface SearchFilters {
  stores?: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  withDiscountOnly?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'relevance'
}

export interface SearchResponse {
  query: string
  results: Product[]
  totalResults: number
  searchTime: number
  storesSearched: string[]
  storesFailed?: string[]
}

export interface StoreStatus {
  name: string
  displayName: string
  status: 'pending' | 'searching' | 'done' | 'empty' | 'error'
  productCount?: number
  time?: number
  error?: string
}

export interface StreamEvent {
  type: 'start' | 'searching' | 'store_result' | 'store_empty' | 'store_error' | 'cached' | 'done'
  data: any
}

export type StreamCallback = (event: StreamEvent) => void

/**
 * Busca com streaming SSE - resultados progressivos
 */
export function searchProductsStream(
  query: string,
  filters: SearchFilters | undefined,
  onEvent: StreamCallback
): () => void {
  const params = new URLSearchParams({ q: query })
  if (filters?.sortBy) params.set('sortBy', filters.sortBy)
  if (filters?.stores) params.set('stores', filters.stores.join(','))
  if (filters?.minPrice) params.set('minPrice', String(filters.minPrice))
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice))
  if (filters?.inStockOnly) params.set('inStockOnly', 'true')
  if (filters?.withDiscountOnly) params.set('withDiscountOnly', 'true')

  const url = `${API_BASE_URL}/api/search/stream?${params.toString()}`
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const parsed: StreamEvent = JSON.parse(event.data)
      onEvent(parsed)

      // Fechar conexao quando terminar
      if (parsed.type === 'done' || parsed.type === 'cached') {
        eventSource.close()
      }
    } catch (e) {
      console.error('Erro ao parsear SSE:', e)
    }
  }

  eventSource.onerror = () => {
    eventSource.close()
  }

  // Retorna funcao para cancelar
  return () => {
    eventSource.close()
  }
}

/**
 * Busca classica (espera tudo)
 */
export async function searchProducts(query: string, filters?: SearchFilters): Promise<SearchResponse> {
  const response = await api.get('/api/search', {
    params: { q: query, ...filters },
  })
  return response.data
}

export async function getStats() {
  const response = await api.get('/api/stats')
  return response.data
}

export async function healthCheck() {
  const response = await api.get('/health')
  return response.data
}

export default api
