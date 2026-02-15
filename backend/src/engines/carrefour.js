import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Carrefour Brasil - SPA (VTEX-based)
 * Busca: carrefour.com.br/s?q={query}&sort=relevance
 * Precisa Puppeteer pois HTML nao contem precos
 */
export default class CarrefourEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'carrefour';
        this.displayName = 'Carrefour';
        this.baseUrl = 'https://www.carrefour.com.br';
        this.enabled = false; // Anti-bot pesado, nao renderiza produtos
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
            const url = `${this.baseUrl}/s?q=${encodeURIComponent(query)}&sort=relevance`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(4000);

            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Carrefour: product cards com links /p ou /produto
                const allLinks = document.querySelectorAll('a[href*="/p"]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    if (!href.includes('carrefour.com.br')) continue;

                    let card = link;
                    for (let i = 0; i < 8; i++) {
                        card = card.parentElement;
                        if (!card) break;
                        const text = card.innerText || '';
                        if (text.includes('R$') && text.length > 30 && text.length < 2000) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                            if (!priceMatch) continue;

                            const lines = text.split('\n').filter(l => l.trim().length > 10);
                            const name = lines.find(l => 
                                !l.includes('R$') && !l.includes('frete') && 
                                !l.includes('Entrega') && !l.includes('Vendido') &&
                                !l.includes('Comprar') && !l.includes('cashback') &&
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
