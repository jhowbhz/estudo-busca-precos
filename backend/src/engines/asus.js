import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * ASUS Store Brasil - br.store.asus.com
 * A loja ASUS nao tem busca convencional. Qualquer URL invalida
 * mostra uma pagina 404 com produtos sugeridos COM precos.
 * Usa Puppeteer para navegar e extrair produtos do catalogo + 404.
 */
export default class AsusEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'asus';
        this.displayName = 'ASUS Store';
        this.baseUrl = 'https://br.store.asus.com';
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
            // Navegar para URL com query - cai na 404 com produtos sugeridos
            const slug = query.replace(/\s+/g, '-').toLowerCase();
            const url = `${this.baseUrl}/${slug}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(3000);

            // Scroll para carregar precos (ficam abaixo do fold)
            for (let i = 0; i < 6; i++) {
                await page.evaluate(() => window.scrollBy(0, 500));
                await delay(600);
            }

            const pageUrl = page.url();
            console.log(`[ASUS] URL: ${pageUrl}`);

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Buscar links de produto com nomes longos (nomes ASUS completos)
                const allLinks = document.querySelectorAll('a[href]');
                for (const link of allLinks) {
                    const href = link.href;
                    if (!href || seen.has(href)) continue;
                    if (!href.includes('store.asus.com')) continue;

                    const name = link.textContent?.trim();
                    if (!name || name.length < 30 || name.length > 300) continue;
                    if (seen.has(name)) continue;
                    
                    // So pegar links de produto (contem termos de produto ASUS)
                    if (!name.match(/ASUS|Vivobook|Zenbook|ROG|TUF|ExpertBook|ProArt|Notebook/i)) continue;
                    // Ignorar links de nav
                    if (name.includes('Ver outras') || name.includes('FAQ') ||
                        name.includes('Saiba mais') || name.includes('Learn')) continue;

                    // Subir na arvore DOM para buscar card com preco
                    let el = link.parentElement;
                    let price = null;
                    let originalPrice = null;
                    let image = null;

                    // Subir ate 5 niveis para encontrar o card com preco
                    for (let i = 0; i < 5 && el; i++) {
                        const text = el.innerText || '';
                        if (text.includes('R$') && !price) {
                            // Extrair todos os precos em formato "R$ X.XXX,XX"
                            const priceMatches = text.match(/R\$\s*([\d.]+,\d{2})/g);
                            if (priceMatches && priceMatches.length >= 1) {
                                const prices = priceMatches.map(p => {
                                    const val = p.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                                    return { text: p, value: parseFloat(val) };
                                }).sort((a, b) => a.value - b.value);

                                // Precos ASUS: original (riscado) > a vista > parcela
                                // Ignorar parcelas (valores < 500 para eletronicos)
                                const fullPrices = prices.filter(p => p.value >= 500);
                                
                                if (fullPrices.length >= 2) {
                                    price = fullPrices[0].text; // menor completo = a vista
                                    originalPrice = fullPrices[fullPrices.length - 1].text;
                                } else if (fullPrices.length === 1) {
                                    price = fullPrices[0].text;
                                } else if (prices.length >= 1) {
                                    // Fallback: usar o maior preco como principal
                                    price = prices[prices.length - 1].text;
                                }
                            }
                        }
                        if (!image) {
                            const img = el.querySelector('img[src*="asus"], img[src*="vtex"]');
                            if (img) image = img.src || img.dataset?.src;
                        }
                        el = el.parentElement;
                    }

                    if (!price) continue; // Sem preco, nao serve

                    seen.add(href);
                    seen.add(name);
                    products.push({
                        name: name.replace(/\.\.\.$/, '').trim(),
                        price,
                        originalPrice: originalPrice !== price ? originalPrice : null,
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
