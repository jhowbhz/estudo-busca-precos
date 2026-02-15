import BaseEngine from './base-engine.js';

/**
 * Mercado Livre - extrai dados do HTML server-rendered
 * Usa class poly-component__title para titulos e andes-money-amount para precos
 */
export default class MercadoLivreEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'mercadolivre';
        this.displayName = 'Mercado Livre';
        this.baseUrl = 'https://lista.mercadolivre.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/${encodeURIComponent(query)}`;
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
        const products = [];
        const seen = new Set();

        // Dividir por blocos de produto (poly-card__content)
        const blocks = html.split(/class="poly-card__content"/);
        
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i].substring(0, 5000);
            
            // Titulo
            const titleMatch = block.match(/poly-component__title[^>]*>([^<]+)/);
            if (!titleMatch) continue;
            
            const name = titleMatch[1].trim();
            if (seen.has(name)) continue;
            seen.add(name);
            
            // Preco: andes-money-amount__fraction (pode ter atributos extras)
            const priceMatch = block.match(/andes-money-amount__fraction"[^>]*>([\d.]+)</) ||
                              block.match(/aria-label="(?:Antes: )?(\d+(?:\.\d+)?)\s*reais"/);
            
            // Link: pode ser redirect (click1.mercadolivre) ou direto
            const linkMatch = block.match(/href="(https:\/\/www\.mercadolivre\.com\.br\/[^"]+)"/) ||
                             block.match(/href="(https:\/\/[^"]+mercadolivre[^"]+)"/);
            
            // Imagem
            const imgMatch = block.match(/src="(https:\/\/http2\.mlstatic\.com\/[^"]+)"/) ||
                            block.match(/data-src="(https:\/\/http2\.mlstatic\.com\/[^"]+)"/);
            
            if (priceMatch) {
                const priceStr = priceMatch[1].replace(/\./g, '');
                
                products.push({
                    name,
                    price: parseFloat(priceStr),
                    url: linkMatch?.[1] || '',
                    imageUrl: imgMatch?.[1] || null,
                    inStock: true
                });
            }
        }

        return products;
    }
}
