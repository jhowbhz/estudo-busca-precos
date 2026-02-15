import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Shopee Brasil - SPA pesado com anti-bot
 * Busca: shopee.com.br/search?keyword={query}
 * Puppeteer com stealth necessario
 */
export default class ShopeeEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'shopee';
        this.displayName = 'Shopee';
        this.baseUrl = 'https://shopee.com.br';
        this.enabled = false; // Anti-bot pesado, nao renderiza produtos em headless
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
            const url = `${this.baseUrl}/search?keyword=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(5000);

            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(1000);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Shopee: product cards com links de produto
                const allLinks = document.querySelectorAll('a[href*="shopee.com.br/"]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    // Links de produto Shopee contem -i. seguido de numeros
                    if (!href.match(/-i\.\d+\.\d+/)) continue;

                    let card = link;
                    for (let i = 0; i < 6; i++) {
                        card = card.parentElement;
                        if (!card) break;
                        const text = card.innerText || '';
                        if (text.includes('R$') && text.length > 20 && text.length < 2000) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,?\d{0,2})/);
                            if (!priceMatch) continue;

                            const lines = text.split('\n').filter(l => l.trim().length > 10);
                            const name = lines.find(l => 
                                !l.includes('R$') && !l.includes('frete') && 
                                !l.includes('vendido') && !l.includes('Comprar') &&
                                !l.match(/^\d+%/) && !l.match(/^\d+ vendido/) &&
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
