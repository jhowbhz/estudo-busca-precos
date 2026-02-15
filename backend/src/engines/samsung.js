import BaseEngine from './base-engine.js';

/**
 * Samsung Store Brasil - usa API interna de busca
 */
export default class SamsungEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'samsung';
        this.displayName = 'Samsung Store';
        this.baseUrl = 'https://shop.samsung.com/br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const products = await this.fetchFromApi(query) || await this.fetchFromHtml(query);
            const processed = this.processProducts(products, query);
            this.logSuccess(processed.length);
            return processed.slice(0, maxResults);
        } catch (error) {
            this.logError(error);
            return [];
        }
    }

    async fetchFromApi(query) {
        try {
            // Samsung Store BR usa VTEX - tentar API de busca
            const apiUrl = `https://shop.samsung.com/br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=0&_to=23`;
            
            const response = await this.fetchWithTimeout(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                    'Origin': this.baseUrl,
                    'Referer': `${this.baseUrl}/search?searchTerm=${encodeURIComponent(query)}`,
                }
            });

            if (!response.ok) throw new Error(`API status ${response.status}`);
            
            const items = await response.json();
            if (!Array.isArray(items)) throw new Error('Resposta nao e array');
            
            return items.map(item => {
                const sku = item.items?.[0];
                const seller = sku?.sellers?.[0];
                const price = seller?.commertialOffer?.Price || 0;
                const listPrice = seller?.commertialOffer?.ListPrice || 0;
                
                return {
                    name: item.productName || item.name || '',
                    price: price,
                    originalPrice: listPrice > price ? listPrice : null,
                    url: item.link || item.linkText ? `${this.baseUrl}/${item.linkText}/p` : '',
                    imageUrl: sku?.images?.[0]?.imageUrl || item.items?.[0]?.images?.[0]?.imageUrl || null,
                    rating: null,
                    inStock: seller?.commertialOffer?.IsAvailable !== false
                };
            });
        } catch (e) {
            this.logDebug(`VTEX API falhou: ${e.message}`);
            return null;
        }
    }

    async fetchFromHtml(query) {
        try {
            // Tentar busca inteligente VTEX
            const apiUrl = `https://shop.samsung.com/br/api/io/_v/api/intelligent-search/product_search/v2?query=${encodeURIComponent(query)}&page=1&count=24&locale=pt-BR`;
            
            const response = await this.fetchWithTimeout(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Origin': this.baseUrl,
                    'Referer': `${this.baseUrl}/`,
                }
            });

            if (!response.ok) throw new Error(`Intelligent search status ${response.status}`);
            
            const data = await response.json();
            const items = data?.products || [];
            
            return items.map(item => {
                const price = item.priceRange?.sellingPrice?.lowPrice || 0;
                const listPrice = item.priceRange?.listPrice?.lowPrice || 0;
                
                return {
                    name: item.productName || item.name || '',
                    price: price,
                    originalPrice: listPrice > price ? listPrice : null,
                    url: item.link ? (item.link.startsWith('http') ? item.link : `${this.baseUrl}${item.link}`) : '',
                    imageUrl: item.items?.[0]?.images?.[0]?.imageUrl || null,
                    inStock: true
                };
            });
        } catch (e) {
            this.logDebug(`Intelligent search falhou: ${e.message}`);
            
            // Ultimo fallback: HTML
            try {
                const searchUrl = `${this.baseUrl}/search?searchTerm=${encodeURIComponent(query)}`;
                const resp = await this.fetchWithTimeout(searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html',
                    }
                });
                const html = await resp.text();
                const products = [];
                
                // Buscar __NEXT_DATA__
                const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>({[\s\S]*?})<\/script>/);
                if (nextDataMatch) {
                    const data = JSON.parse(nextDataMatch[1]);
                    const items = data?.props?.pageProps?.searchResult?.products || 
                                 data?.props?.pageProps?.data?.productSearch?.products || [];
                    for (const item of items) {
                        products.push({
                            name: item.productName || item.name || '',
                            price: item.priceRange?.sellingPrice?.lowPrice || item.price || 0,
                            url: item.link || '',
                            imageUrl: item.items?.[0]?.images?.[0]?.imageUrl || null,
                            inStock: true
                        });
                    }
                }
                
                return products;
            } catch (e2) {
                return [];
            }
        }
    }
}
