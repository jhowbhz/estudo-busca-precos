import BaseEngine from './base-engine.js';

/**
 * Amazon Brasil - extrai dados do HTML server-rendered
 * Busca links /dp/ com nomes de produto e precos a-offscreen
 */
export default class AmazonEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'amazon';
        this.displayName = 'Amazon Brasil';
        this.baseUrl = 'https://www.amazon.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(query)}&__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91`;
            const response = await this.fetchWithTimeout(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
                    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
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

        // Amazon: buscar links /dp/ com nome do produto
        const dpLinks = [...html.matchAll(/<a[^>]*href="(\/[^"]*\/dp\/([A-Z0-9]{10})[^"]*)"[^>]*>[\s\S]*?<span[^>]*>([^<]{10,})<\/span>/g)];
        
        for (const match of dpLinks) {
            const [, url, asin, text] = match;
            const name = text.trim();
            
            // Filtrar badges e textos que nao sao nomes de produto
            if (seen.has(asin)) continue;
            if (name.startsWith('Mais de ')) continue;
            if (name.startsWith('R$')) continue;
            if (name.startsWith('Patrocinado')) continue;
            if (name.match(/^\d+[.,]\d+ de \d/)) continue;
            if (name.length < 15) continue;
            
            seen.add(asin);
            
            // Buscar preco proximo (a-offscreen)
            const afterIdx = match.index + match[0].length;
            const afterBlock = html.substring(afterIdx, afterIdx + 3000);
            const priceMatch = afterBlock.match(/<span class="a-offscreen">(R\$\s*[\d.,]+)<\/span>/);
            
            // Buscar imagem
            const beforeBlock = html.substring(Math.max(0, match.index - 2000), match.index);
            const imgMatch = beforeBlock.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/) ||
                            afterBlock.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
            
            if (priceMatch) {
                products.push({
                    name: name.replace(/&#x27;/g, "'").replace(/&amp;/g, '&'),
                    price: priceMatch[1].trim(),
                    url: `${this.baseUrl}${url.replace(/&amp;/g, '&')}`,
                    imageUrl: imgMatch?.[1] || null,
                    inStock: true
                });
            }
        }

        return products;
    }
}
