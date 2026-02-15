import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

// TTL padrao: 15 minutos (900 segundos)
const TTL = parseInt(process.env.CACHE_TTL) || 900;

// Criar instancia do cache
const cache = new NodeCache({
    stdTTL: TTL,
    checkperiod: 120, // Verifica itens expirados a cada 2 minutos
    useClones: false  // Nao clonar objetos (melhor performance)
});

/**
 * Gera chave de cache a partir da query e filtros
 */
function getCacheKey(query, filters = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const filterStr = JSON.stringify(filters);
    return `search:${normalizedQuery}:${filterStr}`;
}

/**
 * Busca resultado no cache
 */
export function getCachedSearch(query, filters) {
    const key = getCacheKey(query, filters);
    const cached = cache.get(key);
    
    if (cached) {
        console.log(`🎯 Cache HIT para: "${query}"`);
        return cached;
    }
    
    console.log(`❌ Cache MISS para: "${query}"`);
    return null;
}

/**
 * Salva resultado no cache
 */
export function setCachedSearch(query, filters, results) {
    const key = getCacheKey(query, filters);
    cache.set(key, results);
    console.log(`💾 Cache SAVED para: "${query}" (TTL: ${TTL}s)`);
}

/**
 * Limpa todo o cache
 */
export function clearCache() {
    cache.flushAll();
    console.log('🗑️  Cache limpo');
}

/**
 * Estatisticas do cache
 */
export function getCacheStats() {
    return cache.getStats();
}

export default cache;
