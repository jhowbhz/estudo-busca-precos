import BaseEngine from './base-engine.js';

/**
 * iByte - Plataforma VTEX com API JSON
 * API: ibyte.com.br/api/catalog_system/pub/products/search/{query}?_from=0&_to=19
 * Retorna JSON com productName, link, items[].sellers[].commertialOffer.Price, etc.
 */
export default class IbyteEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'ibyte';
        this.displayName = 'iByte';
        this.baseUrl = 'https://www.ibyte.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=19`;
            const response = await this.fetchWithTimeout(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                }
            }, 20000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = JSON.parse(await response.text());
            if (!Array.isArray(data)) {
                throw new Error('Resposta inesperada da API VTEX');
            }

            const products = this.parseProducts(data);
            const processed = this.processProducts(products, query);
            this.logSuccess(processed.length);
            return processed.slice(0, maxResults);
        } catch (error) {
            this.logError(error);
            return [];
        }
    }

    parseProducts(data) {
        const products = [];

        for (const item of data) {
            try {
                const name = item.productName;
                if (!name || name.length < 5) continue;

                // Pegar o primeiro SKU com seller disponivel
                const sku = item.items?.[0];
                if (!sku) continue;

                const seller = sku.sellers?.[0];
                if (!seller) continue;

                const offer = seller.commertialOffer;
                if (!offer) continue;

                const price = offer.Price;
                if (!price || price <= 0) continue;

                const listPrice = offer.ListPrice;
                const available = offer.AvailableQuantity > 0;

                // URL do produto
                const url = item.link || `${this.baseUrl}/${item.linkText}/p`;

                // Imagem
                const imageUrl = sku.images?.[0]?.imageUrl || null;

                products.push({
                    name,
                    price,
                    originalPrice: listPrice && listPrice > price ? listPrice : null,
                    url,
                    imageUrl,
                    inStock: available,
                });
            } catch (e) {
                // Ignorar produto com erro de parsing
                continue;
            }
        }

        return products;
    }
}
