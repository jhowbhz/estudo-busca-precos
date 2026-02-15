import db from './db.js';

/**
 * Salva resultados de busca no banco
 */
export function saveSearchResults(results) {
    try {
        for (const item of results) {
            db.run(`
                INSERT INTO search_results (query, store, product_name, price, original_price, url, image_url, rating, review_count, in_stock)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.query,
                item.store,
                item.name,
                item.price,
                item.originalPrice || null,
                item.url,
                item.imageUrl || null,
                item.rating || null,
                item.reviewCount || null,
                item.inStock ? 1 : 0
            ]);
        }
    } catch (error) {
        console.error('Erro ao salvar resultados:', error.message);
    }
}

/**
 * Busca historico de precos de um produto
 */
export function getPriceHistory(productName, store, limit = 30) {
    try {
        const stmt = db.prepare(`
            SELECT * FROM search_results
            WHERE product_name LIKE ? AND store = ?
            ORDER BY searched_at DESC
            LIMIT ?
        `);
        stmt.bind([`%${productName}%`, store, limit]);
        
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        
        return results;
    } catch (error) {
        console.error('Erro ao buscar histórico:', error.message);
        return [];
    }
}

/**
 * Busca ultimas buscas realizadas
 */
export function getRecentSearches(limit = 10) {
    try {
        const stmt = db.prepare(`
            SELECT DISTINCT query, MAX(searched_at) as last_searched
            FROM search_results
            GROUP BY query
            ORDER BY last_searched DESC
            LIMIT ?
        `);
        stmt.bind([limit]);
        
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        
        return results;
    } catch (error) {
        console.error('Erro ao buscar buscas recentes:', error.message);
        return [];
    }
}

/**
 * Estatisticas gerais
 */
export function getStats() {
    try {
        const totalSearchesStmt = db.prepare('SELECT COUNT(DISTINCT query) as total FROM search_results');
        totalSearchesStmt.step();
        const totalSearches = totalSearchesStmt.getAsObject();
        totalSearchesStmt.free();

        const totalProductsStmt = db.prepare('SELECT COUNT(*) as total FROM search_results');
        totalProductsStmt.step();
        const totalProducts = totalProductsStmt.getAsObject();
        totalProductsStmt.free();

        const storeStatsStmt = db.prepare(`
            SELECT store, COUNT(*) as count
            FROM search_results
            GROUP BY store
            ORDER BY count DESC
        `);
        
        const storeStats = [];
        while (storeStatsStmt.step()) {
            storeStats.push(storeStatsStmt.getAsObject());
        }
        storeStatsStmt.free();

        return {
            totalSearches: totalSearches.total || 0,
            totalProducts: totalProducts.total || 0,
            storeStats
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error.message);
        return {
            totalSearches: 0,
            totalProducts: 0,
            storeStats: []
        };
    }
}

/**
 * Limpar dados antigos (mais de 30 dias)
 */
export function cleanOldData() {
    try {
        db.run(`
            DELETE FROM search_results
            WHERE searched_at < datetime('now', '-30 days')
        `);
        
        console.log(`🗑️  Dados antigos removidos`);
        return 0;
    } catch (error) {
        console.error('Erro ao limpar dados:', error.message);
        return 0;
    }
}
