import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Ponto Frio - Puppeteer com networkidle2
 * Mesma estrutura do Casas Bahia (Via Varejo)
 * URL: pontofrio.com.br/busca/{query}
 */
export default class PontoFrioEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'pontofrio';
        this.displayName = 'Ponto Frio';
        this.baseUrl = 'https://www.pontofrio.com.br';
        this.enabled = false; // Busca retorna livros ao inves de eletronicos
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

            // Scroll para carregar mais produtos
            for (let i = 0; i < 4; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Ponto Frio: produtos em links com href contendo /p/
                const links = document.querySelectorAll('a[href*="/p/"]');
                for (const link of links) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;

                    const name = link.textContent?.trim();
                    if (!name || name.length < 10) continue;
                    // Ignorar "Avise-me" e textos curtos
                    if (name.includes('Avise-me') || name.includes('indisponível')) continue;

                    // Subir na arvore DOM ate encontrar bloco com preco
                    let el = link;
                    let found = false;
                    for (let i = 0; i < 6; i++) {
                        el = el.parentElement;
                        if (!el) break;
                        const text = el.innerText || '';
                        if (text.includes('R$') && !text.includes('indisponível')) {
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
                                found = true;
                                break;
                            }
                        }
                    }
                }
                return products;
            }, this.baseUrl);
        });
    }
}
