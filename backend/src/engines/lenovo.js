import BaseEngine from './base-engine.js';

/**
 * Lenovo Brasil - DESABILITADO (substituido por ASUS Store)
 * O site usa SPA pesado que nao renderiza resultados de busca mesmo com Puppeteer.
 */
export default class LenovoEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'lenovo';
        this.displayName = 'Lenovo Brasil';
        this.baseUrl = 'https://www.lenovo.com/br/pt';
        this.enabled = false; // Substituido por ASUS Store
    }

    async search(query, options = {}) {
        return [];
    }
}
