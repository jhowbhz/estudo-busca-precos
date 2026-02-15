import BaseEngine from './base-engine.js';

/**
 * Miranda Computacao - HTML server-rendered com schema.org
 * Busca: miranda.com.br/busca?busca={query}
 * Produtos em <div class="ui card produto product-in-card"> com itemprop="name", itemprop="price", itemprop="url"
 */
export default class MirandaEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'miranda';
        this.displayName = 'Miranda';
        this.baseUrl = 'https://www.miranda.com.br';
        this.enabled = false; // Busca do site retorna resultados em ordem alfabetica, nao por relevancia
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/busca?busca=${encodeURIComponent(query)}`;
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

        // Dividir por blocos de produto
        const blocks = html.split(/class="ui card produto product-in-card"/);

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i].substring(0, 5000);

            // Nome do produto via schema.org
            const nameMatch = block.match(/itemprop="name"[^>]*>([^<]+)</) ||
                              block.match(/title="([^"]{10,})"/);
            if (!nameMatch) continue;
            const name = nameMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
            if (!name || name.length < 10 || seen.has(name)) continue;
            seen.add(name);

            // Preco via itemprop ou regex
            const priceItemprop = block.match(/itemprop="price"\s+content="([\d.]+)"/);
            let price = 0;
            if (priceItemprop) {
                price = parseFloat(priceItemprop[1]);
            } else {
                // Fallback: pegar precos visiveis (R$ X.XXX,XX)
                const visiblePrices = block.match(/R\$\s*([\d.]+,\d{2})/g) || [];
                if (visiblePrices.length > 0) {
                    // Pegar o menor preco (preco a vista)
                    const parsed = visiblePrices.map(p => {
                        const val = p.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                        return parseFloat(val);
                    }).filter(v => v > 0).sort((a, b) => a - b);
                    if (parsed.length > 0) price = parsed[0];
                }
            }
            if (price <= 0) continue;

            // Preco original (De: R$ X.XXX,XX)
            let originalPrice = null;
            const dePriceMatch = block.match(/De\s*(?:<[^>]*>)*\s*R\$\s*([\d.]+,\d{2})/i);
            if (dePriceMatch) {
                const op = parseFloat(dePriceMatch[1].replace(/\./g, '').replace(',', '.'));
                if (op > price) originalPrice = op;
            }

            // URL do produto
            const urlMatch = block.match(/itemprop="url"\s+href="([^"]+)"/) ||
                             block.match(/href="(\/produto\/[^"]+)"/);
            const url = urlMatch ? (urlMatch[1].startsWith('http') ? urlMatch[1] : `${this.baseUrl}${urlMatch[1]}`) : this.baseUrl;

            // Imagem
            const imgMatch = block.match(/itemprop="image"\s+(?:data-)?src="([^"]+)"/) ||
                             block.match(/src="([^"]*(?:produto|product|img)[^"]*)"/i) ||
                             block.match(/data-src="([^"]+\.(?:jpg|png|webp)[^"]*)"/i);
            let imageUrl = imgMatch ? imgMatch[1] : null;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${this.baseUrl}${imageUrl}`;
            }
            // Ignorar imagem placeholder
            if (imageUrl && imageUrl.includes('img_default')) imageUrl = null;

            // Estoque
            const exhausted = block.match(/data-exhausted="([^"]+)"/);
            const inStock = exhausted ? exhausted[1] !== 'True' : true;

            products.push({
                name,
                price,
                originalPrice,
                url,
                imageUrl,
                inStock,
            });
        }

        return products;
    }
}
