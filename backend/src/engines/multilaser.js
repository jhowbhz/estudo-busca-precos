import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Multilaser (Multi) - VTEX-based SPA
 * Busca: multilaser.com.br/busca?q={query}
 * Precisa Puppeteer pois HTML nao contem precos
 */
export default class MultilaseEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'multilaser';
        this.displayName = 'Multilaser';
        this.baseUrl = 'https://www.multilaser.com.br';
        this.enabled = false; // Poucos produtos e precos incorretos (pega parcelas)
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
            const url = `${this.baseUrl}/busca?q=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(4000);

            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                const allLinks = document.querySelectorAll('a[href*="/p"]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    if (!href.includes('multilaser.com.br')) continue;

                    let card = link;
                    for (let i = 0; i < 8; i++) {
                        card = card.parentElement;
                        if (!card) break;
                        const text = card.innerText || '';
                        if (text.includes('R$') && text.length > 20 && text.length < 2000) {
                            // Extrair TODOS os precos e pegar o maior (preco total, nao parcela)
                            const allPrices = text.match(/R\$\s*[\d.]+,\d{2}/g);
                            if (!allPrices || allPrices.length === 0) continue;

                            const parsed = allPrices.map(p => {
                                const val = p.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                                return { text: p, value: parseFloat(val) };
                            }).filter(p => p.value > 0).sort((a, b) => b.value - a.value);

                            if (parsed.length === 0) continue;
                            const mainPrice = parsed[0]; // Maior preco = preco total

                            const lines = text.split('\n').filter(l => l.trim().length > 10);
                            const name = lines.find(l => 
                                !l.includes('R$') && !l.includes('frete') && 
                                !l.includes('Entrega') && !l.includes('Vendido') &&
                                !l.includes('Comprar') && !l.includes('carrinho') &&
                                !l.includes('Adicionar') && !l.includes('cashback') &&
                                !l.match(/^\d+x\s/) && !l.includes('sem juros') &&
                                l.length > 15 && l.length < 200
                            );
                            if (!name || seen.has(name)) continue;

                            const imgEl = card.querySelector('img[src*="http"]');

                            seen.add(href);
                            seen.add(name);
                            products.push({
                                name: name.trim(),
                                price: mainPrice.text,
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
