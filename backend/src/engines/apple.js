import BaseEngine from './base-engine.js';

/**
 * Apple Store Brasil - TEMPORARIAMENTE DESABILITADO
 * A Apple nao mostra precos na pagina de busca, apenas categorias e links.
 * Seria necessario navegar para cada pagina de produto individualmente.
 */
export default class AppleEngine extends BaseEngine {
    constructor() {
        super();
        this.name = 'apple';
        this.displayName = 'Apple Store Brasil';
        this.baseUrl = 'https://www.apple.com/br';
        this.enabled = false; // Busca nao mostra precos
    }

    async search(query, options = {}) {
        return [];
    }
}
