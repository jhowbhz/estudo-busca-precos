import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Leroy Merlin Brasil - SPA
 * Busca: leroymerlin.com.br/search?term={query}
 * Precisa Puppeteer pois HTML nao contem precos
 */
export default class LeroyMerlinEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'leroymerlin';
        this.displayName = 'Leroy Merlin';
        this.baseUrl = 'https://www.leroymerlin.com.br';
    }

    async search(query, options = {}) {
        const maxResults = options.maxResults || 20;
        try {
            const products = await this.fetchWithPuppeteer(query);
            const processed = this.processProducts(products, query);
            this.logSuccess(processed.length);
            return processed.slice(0, maxResults);
        } catch (error) {
            this.logError(error);
            return [];
        }
    }

    async fetchWithPuppeteer(query) {
        return withPage(async (page) => {
            const url = `${this.baseUrl}/search?term=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(4000);

            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Leroy Merlin: product cards com links de produto
                const allLinks = document.querySelectorAll('a[href*="leroymerlin.com.br/"]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    // Links de produto geralmente tem _XXXXXXXXXX no final
                    if (!href.match(/_\d{5,}/)) continue;

                    let card = link;
                    for (let i = 0; i < 8; i++) {
                        card = card.parentElement;
                        if (!card) break;
                        const text = card.innerText || '';
                        if (text.includes('R$') && text.length > 20 && text.length < 2000) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                            if (!priceMatch) continue;

                            const lines = text.split('\n').filter(l => l.trim().length > 10);
                            const name = lines.find(l => 
                                !l.includes('R$') && !l.includes('frete') && 
                                !l.includes('Entrega') && !l.includes('Vendido') &&
                                !l.includes('Comprar') && !l.includes('carrinho') &&
                                !l.includes('prazo') && !l.includes('Calcule') &&
                                l.length > 15 && l.length < 200
                            );
                            if (!name || seen.has(name)) continue;

                            const imgEl = card.querySelector('img[src*="http"]');

                            seen.add(href);
                            seen.add(name);
                            products.push({
                                name: name.trim(),
                                price: priceMatch[0],
                                url: href,
                                imageUrl: imgEl?.src || null,
                                inStock: true
                            });
                            break;
                        }
                    }
                }
                return products;
            }, this.baseUrl);
        });
    }
}
