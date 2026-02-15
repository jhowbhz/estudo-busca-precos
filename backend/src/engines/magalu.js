import BaseEngine from './base-engine.js';

/**
 * Magazine Luiza - extrai dados via regex no __NEXT_DATA__
 * O JSON e muito grande para parsear inteiro, entao usa regex
 */
export default class MagaluEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'magalu';
        this.displayName = 'Magazine Luiza';
        this.baseUrl = 'https://www.magazineluiza.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/busca/${encodeURIComponent(query)}/`;
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

        // Magalu: extrair via regex no __NEXT_DATA__ 
        // Formato: "title":"...","description":...,"bestPrice":"..."
        const productRegex = /"title":"([^"\\]{10,200}(?:\\.[^"\\]*)*)","description"[\s\S]*?"bestPrice":"([\d.]+)"/g;
        
        let match;
        while ((match = productRegex.exec(html)) !== null) {
            const [, titleEscaped, bestPrice] = match;
            
            const title = titleEscaped
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\n/g, ' ')
                .trim();
            
            if (seen.has(title) || !title || title.length < 5) continue;
            seen.add(title);
            
            const price = parseFloat(bestPrice);
            if (price <= 0) continue;
            
            // Buscar URL do produto (antes do title no JSON)
            const beforeMatch = html.substring(Math.max(0, match.index - 500), match.index);
            const urlMatch = beforeMatch.match(/"url":"(\/[^"]*\/p\/[^"]+)"/);
            
            // Buscar fullPrice
            const afterMatch = html.substring(match.index, match.index + 500);
            const fullPriceMatch = afterMatch.match(/"fullPrice":"([\d.]+)"/);
            const fullPrice = fullPriceMatch ? parseFloat(fullPriceMatch[1]) : null;
            
            // Buscar imagem
            const imgMatch = afterMatch.match(/"image":"([^"]+)"/) || 
                            beforeMatch.match(/"image":"([^"]+)"/);
            
            products.push({
                name: title,
                price,
                originalPrice: fullPrice && fullPrice > price ? fullPrice : null,
                url: urlMatch ? `${this.baseUrl}${urlMatch[1]}` : this.baseUrl,
                imageUrl: imgMatch?.[1]?.replace(/\\\//g, '/').replace(/\{w\}x\{h\}/, '400x400') || null,
                inStock: true
            });
        }

        return products;
    }
}
