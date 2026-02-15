import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Extra - Puppeteer com networkidle2
 * Mesma plataforma do Ponto Frio / Casas Bahia (Via Varejo)
 * URL: extra.com.br/busca/{query}
 */
export default class ExtraEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'extra';
        this.displayName = 'Extra';
        this.baseUrl = 'https://www.extra.com.br';
        this.enabled = false; // Site bloqueia scraping - busca e paginas de produto retornam erro
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

                // Extra (Via Varejo): produtos em links com href contendo /p/
                const links = document.querySelectorAll('a[href*="/p/"]');
                for (const link of links) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;

                    const name = link.textContent?.trim();
                    if (!name || name.length < 10) continue;
                    if (name.includes('Avise-me') || name.includes('indisponível')) continue;

                    // Subir na arvore DOM ate encontrar bloco com preco
                    let el = link;
                    for (let i = 0; i < 6; i++) {
                        el = el.parentElement;
                        if (!el) break;
                        const text = el.innerText || '';
                        if (text.includes('R$') && !text.includes('indisponível')) {
                            // Pegar todos os precos e usar o menor como preco principal
                            const allPrices = text.match(/R\$\s*([\d.]+,\d{2})/g) || [];
                            if (allPrices.length > 0) {
                                const parsed = allPrices.map(p => {
                                    const val = p.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                                    return { text: p, value: parseFloat(val) };
                                }).filter(p => p.value > 10).sort((a, b) => a.value - b.value);

                                if (parsed.length > 0) {
                                    const imgEl = el.querySelector('img');
                                    seen.add(href);
                                    products.push({
                                        name,
                                        price: parsed[0].text,
                                        originalPrice: parsed.length > 1 ? parsed[parsed.length - 1].text : null,
                                        url: href,
                                        imageUrl: imgEl?.src || imgEl?.dataset?.src || null,
                                        inStock: true
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
                return products;
            }, this.baseUrl);
        });
    }
}
