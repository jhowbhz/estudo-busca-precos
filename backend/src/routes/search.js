import express from 'express';
import searchOrchestrator from '../services/search-orchestrator.js';

const router = express.Router();

/**
 * GET /api/search/stream?q=termo
 * Busca com Server-Sent Events - resultados progressivos
 */
router.get('/stream', async (req, res) => {
    try {
        const { q: query } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
        }

        const filters = {
            stores: req.query.stores ? req.query.stores.split(',') : undefined,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            inStockOnly: req.query.inStockOnly === 'true',
            withDiscountOnly: req.query.withDiscountOnly === 'true',
            sortBy: req.query.sortBy || 'price_asc'
        };

        // Configurar SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no'
        });

        // Enviar heartbeat para manter conexao viva
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 15000);

        // Callback que envia cada evento SSE
        const sendEvent = (event) => {
            try {
                const data = JSON.stringify(event);
                res.write(`data: ${data}\n\n`);
            } catch (e) {
                // conexao pode ter sido fechada
            }
        };

        // Executar busca streaming
        await searchOrchestrator.searchStream(query.trim(), filters, sendEvent);

        // Limpar e fechar
        clearInterval(heartbeat);
        res.end();

    } catch (error) {
        console.error('Erro na rota /api/search/stream:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
        }
    }
});

/**
 * GET /api/search?q=termo
 * Busca classica (espera tudo terminar) - mantida para compatibilidade
 */
router.get('/', async (req, res) => {
    try {
        const { q: query } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
        }

        const filters = {
            stores: req.query.stores ? req.query.stores.split(',') : undefined,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            inStockOnly: req.query.inStockOnly === 'true',
            withDiscountOnly: req.query.withDiscountOnly === 'true',
            sortBy: req.query.sortBy || 'price_asc'
        };

        const results = await searchOrchestrator.search(query.trim(), filters);
        res.json(results);

    } catch (error) {
        console.error('Erro na rota /api/search:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
    }
});

/**
 * GET /api/search/stores
 * Lista lojas disponiveis
 */
router.get('/stores', (req, res) => {
    try {
        const stores = searchOrchestrator.getAvailableStores();
        res.json({ stores });
    } catch (error) {
        console.error('Erro ao listar lojas:', error);
        res.status(500).json({ error: 'Erro ao listar lojas' });
    }
});

export default router;
