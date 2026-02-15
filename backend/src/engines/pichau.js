import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Pichau - fetch retorna 403, precisa Puppeteer com stealth
 * Produtos estao em links <a> com nome + preco no texto
 */
export default class PichauEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'pichau';
        this.displayName = 'Pichau';
        this.baseUrl = 'https://www.pichau.com.br';
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
            const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(3000);

            // Scroll para carregar produtos
            for (let i = 0; i < 4; i++) {
                await page.evaluate(() => window.scrollBy(0, 800));
                await delay(800);
            }

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Pichau: produtos estao em links com href para pagina de produto
                // O texto do link contem nome + preco
                const allLinks = document.querySelectorAll('a[href]');

                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || !href.startsWith(baseUrl + '/') || seen.has(href)) continue;
                    // Ignorar links de navegacao
                    if (href.includes('/search') || href.includes('/departamento') ||
                        href.includes('/carrinho') || href.includes('/conta') ||
                        href.includes('#') || href === baseUrl + '/') continue;

                    const text = link.innerText || '';
                    if (text.length < 20) continue;

                    // Buscar preco: preferir "por R$ X.XXX,XX" (desconto), senao primeiro "R$ X.XXX,XX"
                    const discountMatch = text.match(/por\s+R\$\s*([\d.]+,\d{2})/);
                    const anyPriceMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
                    const priceMatch = discountMatch || anyPriceMatch;
                    if (!priceMatch) continue;

                    // Extrair nome: tudo antes de "de R$" ou "R$"
                    let name = text.split(/\bde\s+R\$/)[0]
                        .split(/\bR\$/)[0]
                        .replace(/Frete Gr[aá]tis[:\s]*(Sul e Sudeste|[^A-Z]*)/gi, '')
                        .replace(/\d+\s*%\s*OFF/gi, '')
                        .replace(/EM\s+ESTOQUE/gi, '')
                        .replace(/OPENBOX/gi, '')
                        .replace(/^\s*[\n\r]+/gm, '')
                        .replace(/\s+/g, ' ')
                        .trim();

                    if (!name || name.length < 10 || seen.has(name)) continue;

                    // Buscar imagem no card
                    const card = link.closest('div, li, article') || link;
                    const imgEl = card.querySelector('img[src*="pichau"], img[src*="media"]') ||
                                  link.querySelector('img');
                    const image = imgEl?.src || imgEl?.dataset?.src;

                    // Buscar preco original (de R$ X.XXX,XX por R$ Y.YYY,YY)
                    const origMatch = text.match(/de\s+R\$\s*([\d.]+,\d{2})\s*por/);
                    const origPrice = origMatch ? origMatch[0].replace(/\s*por$/, '') : null;

                    seen.add(href);
                    seen.add(name);
                    products.push({
                        name,
                        price: priceMatch[0].replace(/^por\s+/, ''),
                        originalPrice: origPrice,
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
