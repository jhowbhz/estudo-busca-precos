import BaseEngine from './base-engine.js';

/**
 * Havan - Magento-based, HTML server-rendered
 * Busca: havan.com.br/catalogsearch/result/?q={query}
 * Produtos em <div class="product-item-info"> com data-price-amount e product-item-link
 */
export default class HavanEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'havan';
        this.displayName = 'Havan';
        this.baseUrl = 'https://www.havan.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const searchUrl = `${this.baseUrl}/catalogsearch/result/?q=${encodeURIComponent(query)}`;
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

        const blocks = html.split(/class="product-item-info/);

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i].substring(0, 10000);

            const nameMatch = block.match(/class="product-item-link"[^>]*>\s*([\s\S]*?)\s*<\/a/);
            if (!nameMatch) continue;
            const name = nameMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
            if (!name || name.length < 10 || seen.has(name)) continue;
            seen.add(name);

            // data-price-type="finalPrice" e o preco de venda
            const finalPriceMatch = block.match(/data-price-type="finalPrice"[\s\S]*?data-price-amount="([\d.]+)"/) ||
                                    block.match(/data-price-amount="([\d.]+)"[\s\S]*?data-price-type="finalPrice"/);
            const priceMatch = finalPriceMatch || block.match(/data-price-amount="([\d.]+)"/);
            if (!priceMatch) continue;
            const price = parseFloat(priceMatch[1]);
            if (price <= 0) continue;

            // data-price-type="oldPrice" e o preco original
            const oldPriceMatch = block.match(/data-price-type="oldPrice"[\s\S]*?data-price-amount="([\d.]+)"/) ||
                                  block.match(/data-price-amount="([\d.]+)"[\s\S]*?data-price-type="oldPrice"/);
            const oldPrice = oldPriceMatch ? parseFloat(oldPriceMatch[1]) : null;

            const urlMatch = block.match(/href="(https:\/\/www\.havan\.com\.br\/[^"]*\/p)"/);
            const imgMatch = block.match(/src="(https:\/\/[^"]+\.(?:jpg|png|webp)[^"]*)"/i) ||
                            block.match(/data-src="(https:\/\/[^"]+\.(?:jpg|png|webp)[^"]*)"/i);

            products.push({
                name,
                price,
                originalPrice: oldPrice && oldPrice > price ? oldPrice : null,
                url: urlMatch?.[1] || this.baseUrl,
                imageUrl: imgMatch?.[1] || null,
                inStock: !block.includes('indisponível') && !block.includes('out-of-stock')
            });
        }

        return products;
    }
}
