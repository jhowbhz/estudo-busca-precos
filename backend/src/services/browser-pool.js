import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

dotenv.config();

// Adicionar plugin stealth para evitar deteccao de bots
puppeteer.use(StealthPlugin());

const HEADLESS = process.env.HEADLESS !== 'false';
const TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT) || 45000;

let browser = null;
let launching = null; // Evitar multiplos launches simultaneos

/**
 * Inicializa o browser (singleton com lock)
 */
export async function getBrowser() {
    if (browser && browser.isConnected()) {
        return browser;
    }

    // Se ja esta lancando, esperar (com timeout)
    if (launching) {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Browser launch timeout')), 30000)
        );
        return Promise.race([launching, timeout]);
    }

    launching = (async () => {
        console.log('🌐 Iniciando browser Puppeteer (singleton)...');
        
        browser = await puppeteer.launch({
            headless: HEADLESS ? 'new' : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            },
            timeout: 30000
        });

        console.log('✅ Browser Puppeteer iniciado (singleton)');
        launching = null;
        return browser;
    })().catch(err => {
        launching = null;
        browser = null;
        throw err;
    });

    return launching;
}

/**
 * Helper: esperar X milissegundos (substitui page.waitForTimeout)
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Cria uma nova pagina com configuracoes otimizadas
 */
export async function createPage() {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    // User agent realista (Chrome 122 atualizado)
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    // Headers extras para parecer navegador real
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    });

    // Configuracoes de timeout
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);

    // Bloquear recursos desnecessarios para acelerar (manter CSS e imagens!)
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();
        
        // Bloquear apenas fontes, media e trackers
        if (['font', 'media'].includes(resourceType)) {
            request.abort();
        } else if (
            url.includes('google-analytics') || 
            url.includes('googletagmanager') ||
            url.includes('facebook.net') || 
            url.includes('hotjar') ||
            url.includes('doubleclick') ||
            url.includes('adservice.google')
        ) {
            request.abort();
        } else {
            request.continue();
        }
    });

    return page;
}

/**
 * Fecha uma pagina especifica
 */
export async function closePage(page) {
    try {
        if (page && !page.isClosed()) {
            await page.close();
        }
    } catch (error) {
        // Ignorar erros ao fechar pagina
    }
}

/**
 * Fecha o browser completamente
 */
export async function closeBrowser() {
    if (browser) {
        console.log('🔴 Fechando browser...');
        try {
            await browser.close();
        } catch (e) {
            // Ignorar
        }
        browser = null;
    }
}

/**
 * Wrapper para executar scraping com tratamento de erros
 */
export async function withPage(callback) {
    const page = await createPage();
    
    try {
        return await callback(page);
    } catch (error) {
        throw error;
    } finally {
        await closePage(page);
    }
}

// Cleanup ao encerrar processo
process.on('SIGINT', async () => {
    await closeBrowser();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeBrowser();
    process.exit(0);
});
