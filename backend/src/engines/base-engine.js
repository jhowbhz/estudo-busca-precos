/**
 * Classe base para todos os scrapers de lojas
 * Cada loja deve extender esta classe e implementar o metodo search()
 */
export default class BaseEngine {
    constructor() {
        this.name = '';           // Identificador unico (ex: 'kabum', 'mercadolivre')
        this.displayName = '';    // Nome para exibicao (ex: 'KaBuM!', 'Mercado Livre')
        this.baseUrl = '';        // URL base da loja
        this.enabled = true;      // Se o scraper esta ativo
        this._query = '';         // Query atual (setada pelo processProducts)
    }

    /**
     * Metodo principal que deve ser implementado por cada engine
     * @param {string} query - Termo de busca
     * @param {object} options - Opcoes adicionais (limite de resultados, etc)
     * @returns {Promise<Array>} Array de produtos encontrados
     */
    async search(query, options = {}) {
        throw new Error(`Metodo search() nao implementado para ${this.name}`);
    }

    /**
     * Fetch com timeout embutido
     * @param {string} url - URL para buscar
     * @param {object} options - Opcoes do fetch
     * @param {number} timeoutMs - Timeout em ms (default 15s)
     * @returns {Promise<Response>}
     */
    async fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
            const response = await fetch(url, { 
                ...options, 
                signal: controller.signal,
                // Garantir que nao segue redirects infinitos
                redirect: options.redirect || 'follow',
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error(`Fetch timeout (${timeoutMs}ms): ${url.substring(0, 80)}`);
            }
            throw error;
        }
    }

    /**
     * Normaliza um produto para o formato padrao
     * @param {object} rawProduct - Dados brutos do produto
     * @returns {object} Produto normalizado
     */
    normalizeProduct(rawProduct) {
        return {
            name: rawProduct.name || '',
            price: this.parsePrice(rawProduct.price),
            originalPrice: rawProduct.originalPrice ? this.parsePrice(rawProduct.originalPrice) : null,
            url: rawProduct.url || '',
            imageUrl: rawProduct.imageUrl || null,
            rating: rawProduct.rating || null,
            reviewCount: rawProduct.reviewCount || null,
            inStock: rawProduct.inStock !== false, // Default true
            store: this.name,
            storeDisplayName: this.displayName
        };
    }

    /**
     * Converte string de preco em numero
     * @param {string|number} priceStr - Preco como string (ex: "R$ 1.299,90")
     * @returns {number} Preco como numero
     */
    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;

        const str = priceStr.toString().trim();

        // Tentar extrair primeiro preco no formato R$ X.XXX,XX
        const brMatch = str.match(/R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
        if (brMatch) {
            const cleaned = brMatch[1].replace(/\./g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }

        // Fallback: extrair primeiro numero com virgula
        const simpleMatch = str.match(/(\d[\d.,]*\d)/);
        if (simpleMatch) {
            let num = simpleMatch[1];
            // Se tem virgula, tratar como decimal BR
            if (num.includes(',')) {
                num = num.replace(/\./g, '').replace(',', '.');
            }
            return parseFloat(num) || 0;
        }

        // Ultimo fallback
        const cleaned = str.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Valida se o produto tem dados minimos necessarios
     * @param {object} product - Produto a validar
     * @returns {boolean}
     */
    isValidProduct(product) {
        return !!(
            product.name &&
            product.price > 0 &&
            product.url
        );
    }

    /**
     * Verifica se o produto e relevante para a busca
     * Pelo menos uma palavra-chave da query deve estar no nome do produto
     * @param {object} product - Produto normalizado
     * @param {string} query - Termo de busca original
     * @returns {boolean}
     */
    isRelevant(product, query) {
        if (!query || !product.name) return true;

        const productName = product.name.toLowerCase();
        const productUrl = (product.url || '').toLowerCase();

        // Normalizar query: remover acentos e caracteres especiais
        const normalizedQuery = query.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedName = productName
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Separar palavras da query (ignorar palavras muito curtas como "de", "do", "a")
        const stopWords = new Set(['de', 'do', 'da', 'dos', 'das', 'a', 'o', 'e', 'em', 'no', 'na', 'com', 'para', 'por', 'um', 'uma']);
        const queryWords = normalizedQuery
            .split(/\s+/)
            .filter(w => w.length >= 2 && !stopWords.has(w));

        if (queryWords.length === 0) return true;

        // Verificar se pelo menos uma palavra significativa da busca esta no nome do produto
        // Para queries com 1 palavra, exigir match exato
        // Para queries com 2+ palavras, exigir pelo menos 1 match
        const matches = queryWords.filter(word => 
            normalizedName.includes(word) || productUrl.includes(word)
        );

        // Se a query tem 1 palavra, essa palavra DEVE estar no nome
        if (queryWords.length === 1) {
            return matches.length >= 1;
        }

        // Se a query tem 2+ palavras, pelo menos 1 deve estar no nome
        // Mas se nenhuma palavra principal esta, e irrelevante
        return matches.length >= 1;
    }

    /**
     * Filtra e normaliza array de produtos
     * @param {Array} rawProducts - Array de produtos brutos
     * @param {string} query - Termo de busca (para filtro de relevancia)
     * @returns {Array} Array de produtos normalizados e validos
     */
    processProducts(rawProducts, query = '') {
        const normalized = rawProducts
            .map(p => this.normalizeProduct(p))
            .filter(p => this.isValidProduct(p));

        // Aplicar filtro de relevancia se tiver query
        if (query) {
            const relevant = normalized.filter(p => this.isRelevant(p, query));
            const removed = normalized.length - relevant.length;
            if (removed > 0) {
                console.log(`🔍 [${this.displayName}] ${removed} produtos irrelevantes removidos`);
            }
            return relevant;
        }

        return normalized;
    }

    /**
     * Log de erro padronizado
     * @param {Error} error - Erro capturado
     * @param {string} context - Contexto onde ocorreu o erro
     */
    logError(error, context = 'search') {
        console.error(`❌ [${this.displayName}] Erro em ${context}:`, error.message);
    }

    /**
     * Log de sucesso
     * @param {number} count - Numero de produtos encontrados
     */
    logSuccess(count) {
        console.log(`✅ [${this.displayName}] ${count} produtos encontrados`);
    }

    /**
     * Log de debug (para diagnostico de scrapers)
     * @param {string} message - Mensagem de debug
     */
    logDebug(message) {
        if (process.env.DEBUG_SCRAPERS === 'true') {
            console.log(`🔍 [${this.displayName}] ${message}`);
        }
    }
}
