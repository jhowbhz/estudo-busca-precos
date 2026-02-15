import express from 'express';
import { getStats } from '../database/queries.js';
import { getCacheStats } from '../services/cache.js';

const router = express.Router();

/**
 * GET /api/stats
 * Estatísticas gerais do sistema
 */
router.get('/', async (req, res) => {
    try {
        const dbStats = getStats();
        const cacheStats = getCacheStats();

        res.json({
            database: dbStats,
            cache: {
                keys: cacheStats.keys,
                hits: cacheStats.hits,
                misses: cacheStats.misses,
                hitRate: cacheStats.hits > 0 
                    ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%'
                    : '0%'
            },
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

export default router;
