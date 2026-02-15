import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Casas Bahia - Puppeteer com networkidle2
 * A busca retorna muitos resultados irrelevantes, o filtro de relevancia cuida disso
 */
export default class CasasBahiaEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'casasbahia';
        this.displayName = 'Casas Bahia';
        this.baseUrl = 'https://www.casasbahia.com.br';
        this.enabled = false; // Substituido por Ponto Frio
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
            const url = `${this.baseUrl}/busca/${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await delay(3000);

            // Scroll para carregar mais
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate(() => {
                const products = [];
                const seen = new Set();
                
                const links = document.querySelectorAll('a[href*="/p/"]');
                for (const link of links) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    
                    const name = link.textContent?.trim();
                    if (!name || name.length < 10) continue;
                    
                    // Subir na arvore ate encontrar bloco com preco
                    let el = link;
                    for (let i = 0; i < 6; i++) {
                        el = el.parentElement;
                        if (!el) break;
                        const text = el.innerText || '';
                        if (text.includes('R$')) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                            if (priceMatch) {
                                const imgEl = el.querySelector('img');
                                seen.add(href);
                                products.push({
                                    name,
                                    price: priceMatch[0],
                                    url: href,
                                    imageUrl: imgEl?.src || imgEl?.dataset?.src || null,
                                    inStock: true
                                });
                                break;
                            }
                        }
                    }
                }
                return products;
            });
        });
    }
}
