import express from 'express';
import { getPriceHistory, getRecentSearches, getStats } from '../database/queries.js';

const router = express.Router();

/**
 * GET /api/products/history?name=...&store=...
 * Busca histórico de preços de um produto
 */
router.get('/history', async (req, res) => {
    try {
        const { name, store } = req.query;

        if (!name || !store) {
            return res.status(400).json({
                error: 'Parâmetros "name" e "store" são obrigatórios'
            });
        }

        const history = getPriceHistory(name, store, 30);

        res.json({
            product: name,
            store,
            history
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

/**
 * GET /api/products/recent
 * Busca recentes
 */
router.get('/recent', async (req, res) => {
    try {
        const recent = getRecentSearches(10);
        res.json({ searches: recent });
    } catch (error) {
        console.error('Erro ao buscar buscas recentes:', error);
        res.status(500).json({ error: 'Erro ao buscar buscas recentes' });
    }
});

export default router;
