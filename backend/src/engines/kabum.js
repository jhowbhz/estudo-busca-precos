import BaseEngine from './base-engine.js';

/**
 * KaBuM! - extrai dados do __NEXT_DATA__ (JSON aninhado)
 * pageProps.data e uma string JSON que contem catalogServer.data[]
 */
export default class KabumEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'kabum';
        this.displayName = 'KaBuM!';
        this.baseUrl = 'https://www.kabum.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/busca/${encodeURIComponent(query)}`;
            const response = await this.fetchWithTimeout(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html',
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                }
            }, 20000);

            const html = await response.text();
            const products = this.parseProducts(html);
            const processed = this.processProducts(products, query);
            this.logSuccess(processed.length);
            return processed.slice(0, maxResults);
        } catch (error) {
            this.logError(error);
            return [];
        }
    }

    parseProducts(html) {
        try {
            // Extrair __NEXT_DATA__
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
            if (!nextDataMatch) return [];

            const outerJson = JSON.parse(nextDataMatch[1]);
            const dataStr = outerJson?.props?.pageProps?.data;
            
            if (typeof dataStr !== 'string') return [];
            
            const innerData = JSON.parse(dataStr);
            const items = innerData?.catalogServer?.data || [];

            return items.map(item => ({
                name: item.name || '',
                price: item.priceWithDiscount || item.price || 0,
                originalPrice: item.oldPrice > item.priceWithDiscount ? item.oldPrice : null,
                url: `${this.baseUrl}/produto/${item.code}/${item.friendlyName || ''}`,
                imageUrl: item.image || null,
                rating: item.rating || null,
                reviewCount: item.ratingCount || null,
                inStock: item.available === true && item.quantity > 0
            }));
        } catch (e) {
            this.logDebug(`Parse error: ${e.message}`);
            return [];
        }
    }
}
