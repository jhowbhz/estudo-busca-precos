import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Americanas - Puppeteer (SPA pesado)
 * URL de busca: americanas.com.br/s?q={query}
 * Redireciona para pagina de categoria com produtos
 */
export default class AmericanasEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'americanas';
        this.displayName = 'Americanas';
        this.baseUrl = 'https://www.americanas.com.br';
        this.enabled = false; // SPA pesado - redireciona para categoria sem produtos individuais
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
            const url = `${this.baseUrl}/s?q=${encodeURIComponent(query)}&sort=score_desc&page=0`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await delay(5000);

            for (let i = 0; i < 6; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(1000);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                const allLinks = document.querySelectorAll('a[href*="americanas.com.br/"]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    if (href.includes('/s?') || href.includes('/login') || href.includes('/carrinho')) continue;

                    const name = link.textContent?.trim();
                    if (!name || name.length < 25 || name.length > 250) continue;
                    if (seen.has(name)) continue;
                    if (name.includes('faça seu login') || name.includes('cadastre-se')) continue;
                    if (name.match(/^\d+$/) || name.match(/\(\d+\)$/)) continue;

                    let card = link;
                    let price = null;
                    let image = null;

                    for (let i = 0; i < 6; i++) {
                        card = card.parentElement;
                        if (!card) break;
                        const text = card.innerText || '';
                        if (text.includes('R$') && text.length < 2000) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                            if (priceMatch) {
                                price = priceMatch[0];
                            }
                        }
                        if (!image) {
                            const imgEl = card.querySelector('img[src*="http"]');
                            if (imgEl) image = imgEl.src;
                        }
                    }

                    if (!price) continue;

                    seen.add(href);
                    seen.add(name);
                    products.push({
                        name: name.trim(),
                        price,
                        url: href,
                        imageUrl: image || null,
                        inStock: true
                    });
                }
                return products;
            }, this.baseUrl);
        });
    }
}
