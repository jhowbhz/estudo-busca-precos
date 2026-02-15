import BaseEngine from './base-engine.js';
import { withPage, delay } from '../services/browser-pool.js';

/**
 * Fast Shop - site.fastshop.com.br
 * Busca via Puppeteer: navega, clica no input via coordenadas, digita, submete
 */
export default class FastShopEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'fastshop';
        this.displayName = 'Fast Shop';
        this.baseUrl = 'https://site.fastshop.com.br';
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
            await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 25000 });
            await delay(2000);

            // Encontrar coordenadas do input de busca visivel
            const inputBox = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input[placeholder*="deseja"]');
                for (const input of inputs) {
                    const rect = input.getBoundingClientRect();
                    if (rect.width > 100 && rect.height > 10) {
                        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                    }
                }
                return null;
            });

            if (!inputBox) {
                console.log('[FastShop] Input de busca nao encontrado');
                return [];
            }

            // Clicar nas coordenadas do input
            await page.mouse.click(inputBox.x, inputBox.y);
            await delay(500);

            // Limpar e digitar
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await delay(200);

            await page.keyboard.type(query, { delay: 60 });
            await delay(1000);
            await page.keyboard.press('Enter');
            await delay(7000);

            // Scroll para carregar mais
            for (let i = 0; i < 6; i++) {
                await page.evaluate(() => window.scrollBy(0, 600));
                await delay(800);
            }

            const pageUrl = page.url();
            console.log(`[FastShop] URL apos busca: ${pageUrl}`);

            return page.evaluate((baseUrl) => {
                const products = [];
                const seen = new Set();

                // Buscar h2 que sao nomes de produtos
                const headings = document.querySelectorAll('h2');
                for (const h2 of headings) {
                    const name = h2.textContent?.trim();
                    if (!name || name.length < 15 || seen.has(name)) continue;
                    if (name.includes('Destaques') || name.includes('Melhores') || name.includes('ofertas') ||
                        name.includes('endereço') || name.includes('Redes') || name.includes('seguro') ||
                        name.includes('pagamento') || name.includes('App') || name.includes('Fast Shop')) continue;

                    const card = h2.closest('li') || h2.parentElement?.parentElement;
                    if (!card) continue;

                    const cardText = card.innerText || '';
                    if (!cardText.includes('R$')) continue;

                    const priceMatch = cardText.match(/R\$\s*([\d.]+,?\d{0,2})/);
                    if (!priceMatch) continue;

                    const linkEl = card.querySelector('a[href*="fastshop.com.br/"]') ||
                                   h2.closest('a') || h2.querySelector('a');
                    const href = linkEl?.href;
                    if (!href || seen.has(href)) continue;
                    if (href.includes('#') || href === baseUrl + '/') continue;

                    const imgEl = card.querySelector('img');
                    const allPrices = cardText.match(/R\$\s*[\d.]+,?\d{0,2}/g);
                    const origPrice = allPrices && allPrices.length >= 2 ? allPrices[1] : null;

                    seen.add(href);
                    seen.add(name);
                    products.push({
                        name,
                        price: priceMatch[0],
                        originalPrice: origPrice,
                        url: href,
                        imageUrl: imgEl?.src || null,
                        inStock: !cardText.includes('indisponível')
                    });
                }
                return products;
            }, this.baseUrl);
        });
    }
}
