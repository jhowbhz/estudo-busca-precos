import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Dell Brasil - SPA, Puppeteer para renderizar resultados de busca
 * O preco fica 3+ niveis acima do h3 do titulo
 */
export default class DellEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'dell';
        this.displayName = 'Dell Brasil';
        this.baseUrl = 'https://www.dell.com/pt-br';
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
            const url = `${this.baseUrl}/search/${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            try {
                await page.waitForSelector('h3', { timeout: 10000 });
            } catch(e) { /* timeout ok */ }
            
            await delay(4000);

            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollBy(0, 600));
                await delay(800);
            }

            return page.evaluate(() => {
                const products = [];
                const seen = new Set();
                
                // Dell: h3 contem titulo, preco fica varios niveis acima
                // Subir na arvore ate encontrar um bloco com R$
                const h3s = document.querySelectorAll('h3');
                
                for (const h3 of h3s) {
                    const name = h3.textContent?.trim();
                    if (!name || name.length < 5 || seen.has(name)) continue;
                    if (name === 'Filtros' || name.includes('Especificações') || 
                        name.includes('Vantagens') || name.includes('pagamento') ||
                        name.includes('Classificar')) continue;
                    
                    // Subir na arvore ate encontrar bloco com preco
                    let el = h3;
                    let found = false;
                    for (let i = 0; i < 8; i++) {
                        el = el.parentElement;
                        if (!el) break;
                        
                        const text = el.innerText || '';
                        if (text.includes('R$')) {
                            const priceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                            if (!priceMatch) continue;
                            
                            const linkEl = el.querySelector('a[href*="dell.com"]');
                            const imgEl = el.querySelector('img');
                            
                            seen.add(name);
                            products.push({
                                name,
                                price: priceMatch[0],
                                url: linkEl?.href || '',
                                imageUrl: imgEl?.src || null,
                                inStock: true
                            });
                            found = true;
                            break;
                        }
                    }
                }
                
                return products;
            });
        });
    }
}
