import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * TerabyteShop - Cloudflare protegido, Puppeteer com stealth
 */
export default class TerabyteEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'terabyte';
        this.displayName = 'TerabyteShop';
        this.baseUrl = 'https://www.terabyteshop.com.br';
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
            // Primeiro acessar home para pegar cookies
            await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await delay(3000);

            // Agora buscar
            const url = `${this.baseUrl}/busca?str=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            // Esperar Cloudflare challenge resolver
            await delay(5000);

            // Verificar se passou do Cloudflare
            const title = await page.title();
            if (title.includes('attack') || title.includes('challenge')) {
                // Esperar mais
                await delay(5000);
            }

            // Scroll
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollBy(0, 600));
                await delay(800);
            }

            return page.evaluate(() => {
                const products = [];
                const seen = new Set();

                // TerabyteShop: cards de produto
                const cards = document.querySelectorAll('.pbox, .product-item, [class*="commerce_columns"] > div, .product-card');
                
                cards.forEach(card => {
                    const nameEl = card.querySelector('.prod-name, h2, .product-name, a[title]');
                    const priceEl = card.querySelector('.prod-new-price, .price, [class*="price"]');
                    const linkEl = card.querySelector('a[href*="/produto/"]');
                    const imgEl = card.querySelector('img');

                    const name = nameEl?.textContent?.trim() || nameEl?.title?.trim();
                    const priceText = priceEl?.textContent?.trim();

                    if (!name || name.length < 5 || !priceText || seen.has(name)) return;

                    seen.add(name);
                    products.push({
                        name,
                        price: priceText,
                        url: linkEl?.href || '',
                        imageUrl: imgEl?.src || imgEl?.dataset?.src || null,
                        inStock: true
                    });
                });

                // Fallback generico
                if (products.length === 0) {
                    const allLinks = document.querySelectorAll('a[href*="/produto/"]');
                    allLinks.forEach(link => {
                        const name = link.textContent?.trim() || link.title?.trim();
                        if (!name || name.length < 10 || seen.has(name)) return;
                        
                        const parent = link.closest('div, li') || link.parentElement;
                        const parentText = parent?.innerText || '';
                        const priceMatch = parentText.match(/R\$\s*[\d.,]+/);
                        
                        if (priceMatch) {
                            seen.add(name);
                            products.push({
                                name,
                                price: priceMatch[0],
                                url: link.href,
                                imageUrl: null,
                                inStock: true
                            });
                        }
                    });
                }

                return products;
            });
        });
    }
}
