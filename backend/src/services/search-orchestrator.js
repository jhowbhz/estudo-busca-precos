import KabumEngine from '../engines/kabum.js';
import MercadoLivreEngine from '../engines/mercadolivre.js';
import MagaluEngine from '../engines/magalu.js';
import AmazonEngine from '../engines/amazon.js';
import CasasBahiaEngine from '../engines/casasbahia.js';
import FastShopEngine from '../engines/fastshop.js';
import SamsungEngine from '../engines/samsung.js';
import AppleEngine from '../engines/apple.js';
import LenovoEngine from '../engines/lenovo.js';
import AsusEngine from '../engines/asus.js';
import DellEngine from '../engines/dell.js';
import TerabyteEngine from '../engines/terabyte.js';
import PichauEngine from '../engines/pichau.js';
import PontoFrioEngine from '../engines/pontofrio.js';
import AmericanasEngine from '../engines/americanas.js';
import HavanEngine from '../engines/havan.js';
import CarrefourEngine from '../engines/carrefour.js';
import LeroyMerlinEngine from '../engines/leroymerlin.js';
import MultilaseEngine from '../engines/multilaser.js';
import ShopeeEngine from '../engines/shopee.js';
import IbyteEngine from '../engines/ibyte.js';
import MirandaEngine from '../engines/miranda.js';
import ExtraEngine from '../engines/extra.js';

import { saveSearchResults } from '../database/queries.js';
import { getCachedSearch, setCachedSearch } from './cache.js';

/**
 * Gerencia a execucao dos scrapers com resultados progressivos
 */
class SearchOrchestrator {
    constructor() {
        // Fetch-based (rapidos, ~2-5s) - rodam primeiro
        this.fetchEngines = [
            new KabumEngine(),
            new MercadoLivreEngine(),
            new MagaluEngine(),
            new AmazonEngine(),
            new SamsungEngine(),
            new HavanEngine(),
            new IbyteEngine(),
            new MirandaEngine(),
        ];

        // Puppeteer-based (lentos, ~10-30s) - rodam em paralelo com menos concorrencia
        this.puppeteerEngines = [
            new PontoFrioEngine(),
            new DellEngine(),
            new TerabyteEngine(),
            new PichauEngine(),
            new FastShopEngine(),
            new AmericanasEngine(),
            new AsusEngine(),
            new CarrefourEngine(),
            new LeroyMerlinEngine(),
            new MultilaseEngine(),
            new ShopeeEngine(),
            new ExtraEngine(),
            new CasasBahiaEngine(),  // desabilitado
            new LenovoEngine(),      // desabilitado - substituido por ASUS
            new AppleEngine(),       // desabilitado - sem precos na busca
        ];

        this.engines = [...this.fetchEngines, ...this.puppeteerEngines];
        this.enabledEngines = this.engines.filter(e => e.enabled);
        const fetchCount = this.fetchEngines.filter(e => e.enabled).length;
        const puppeteerCount = this.puppeteerEngines.filter(e => e.enabled).length;
        console.log(`📦 SearchOrchestrator: ${fetchCount} fetch + ${puppeteerCount} Puppeteer = ${this.enabledEngines.length} lojas`);
    }

    /**
     * Busca STREAMING - envia resultados conforme cada loja responde
     * @param {string} query 
     * @param {object} filters 
     * @param {function} onStoreResult - callback(event) chamado a cada resultado de loja
     */
    async searchStream(query, filters = {}, onStoreResult) {
        const startTime = Date.now();

        // Filtrar engines por lojas selecionadas (se especificado)
        let enginesToRun = this.enabledEngines;
        if (filters.stores && filters.stores.length > 0) {
            enginesToRun = this.enabledEngines.filter(e => filters.stores.includes(e.name));
            // Se nenhuma engine valida, usar todas
            if (enginesToRun.length === 0) enginesToRun = this.enabledEngines;
        }

        console.log(`\n🔍 [STREAM] Iniciando busca por: "${query}"`);
        console.log(`📊 ${enginesToRun.length}/${this.enabledEngines.length} lojas serao consultadas\n`);

        // Verificar cache - se tiver, envia tudo de uma vez
        const cached = getCachedSearch(query, filters);
        if (cached) {
            onStoreResult({
                type: 'cached',
                data: cached
            });
            onStoreResult({ type: 'done', data: cached });
            return;
        }

        // Enviar evento inicial com lista de lojas que serao buscadas
        onStoreResult({
            type: 'start',
            data: {
                query,
                totalStores: enginesToRun.length,
                stores: enginesToRun.map(e => ({
                    name: e.name,
                    displayName: e.displayName,
                    status: 'pending'
                }))
            }
        });

        let allProducts = [];
        const storesSearched = [];
        const storesFailed = [];
        let completedCount = 0;

        // Disparar TODAS as engines ao mesmo tempo, mas com concorrencia limitada
        // Cada uma envia resultado assim que termina
        const runEngine = async (engine) => {
            const engineStart = Date.now();
            
            // Avisar que esta buscando nesta loja
            onStoreResult({
                type: 'searching',
                data: { store: engine.name, displayName: engine.displayName }
            });

            try {
                const products = await this.searchWithTimeout(engine, query, filters);
                const engineTime = Date.now() - engineStart;
                completedCount++;

                if (products.length > 0) {
                    allProducts = allProducts.concat(products);
                    storesSearched.push(engine.displayName);

                    // Ordenar todos os produtos acumulados
                    const sorted = this.sortResults([...allProducts], filters.sortBy);

                    // ENVIAR resultados desta loja imediatamente
                    onStoreResult({
                        type: 'store_result',
                        data: {
                            store: engine.name,
                            displayName: engine.displayName,
                            newProducts: products,
                            allProducts: sorted,
                            totalResults: sorted.length,
                            storesCompleted: completedCount,
                            totalStores: enginesToRun.length,
                            storesSearched: [...storesSearched],
                            storesFailed: [...storesFailed],
                            searchTime: Date.now() - startTime,
                            engineTime
                        }
                    });
                } else {
                    storesSearched.push(engine.displayName);
                    onStoreResult({
                        type: 'store_empty',
                        data: {
                            store: engine.name,
                            displayName: engine.displayName,
                            storesCompleted: completedCount,
                            totalStores: enginesToRun.length,
                            engineTime
                        }
                    });
                }
            } catch (error) {
                completedCount++;
                storesFailed.push(engine.displayName);
                console.error(`❌ [${engine.displayName}] Erro:`, error.message);

                onStoreResult({
                    type: 'store_error',
                    data: {
                        store: engine.name,
                        displayName: engine.displayName,
                        error: error.message,
                        storesCompleted: completedCount,
                        totalStores: enginesToRun.length
                    }
                });
            }
        };

        // Concorrencia: fetch engines sao leves, Puppeteer engines sao pesados
        // Rodar fetch engines primeiro com alta concorrencia, Puppeteer com baixa
        const CONCURRENCY = 4;
        const queue = [...enginesToRun];
        const running = new Set();

        await new Promise((resolve) => {
            const tryNext = () => {
                while (running.size < CONCURRENCY && queue.length > 0) {
                    const engine = queue.shift();
                    const promise = runEngine(engine).finally(() => {
                        running.delete(promise);
                        if (queue.length > 0) {
                            tryNext();
                        } else if (running.size === 0) {
                            resolve();
                        }
                    });
                    running.add(promise);
                }
                if (queue.length === 0 && running.size === 0) {
                    resolve();
                }
            };
            tryNext();
        });

        // Finalizar
        const searchTime = Date.now() - startTime;
        const finalProducts = this.sortResults(allProducts, filters.sortBy);

        // Salvar no banco
        this.saveToDatabase(query, finalProducts);

        const finalResponse = {
            query,
            results: finalProducts,
            totalResults: finalProducts.length,
            searchTime,
            storesSearched,
            storesFailed,
            timestamp: new Date().toISOString()
        };

        // Cache apenas se tem resultados
        if (finalProducts.length > 0) {
            setCachedSearch(query, filters, finalResponse);
        }

        console.log(`\n✅ Busca concluida em ${searchTime}ms`);
        console.log(`📦 ${finalProducts.length} produtos encontrados`);
        console.log(`✅ ${storesSearched.length} lojas ok | ❌ ${storesFailed.length} lojas falharam\n`);

        onStoreResult({
            type: 'done',
            data: finalResponse
        });
    }

    /**
     * Busca classica (nao-streaming) - mantida para compatibilidade
     */
    async search(query, filters = {}) {
        return new Promise((resolve, reject) => {
            let finalResult = null;
            this.searchStream(query, filters, (event) => {
                if (event.type === 'cached') {
                    finalResult = event.data;
                }
                if (event.type === 'done') {
                    resolve(finalResult || event.data);
                }
            }).catch(reject);
        });
    }

    async searchWithTimeout(engine, query, filters, timeout = 35000) {
        return Promise.race([
            engine.search(query, filters),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    }

    applyFilters(products, filters) {
        let filtered = [...products];
        if (filters.stores && filters.stores.length > 0) {
            filtered = filtered.filter(p => filters.stores.includes(p.store));
        }
        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= filters.maxPrice);
        }
        if (filters.inStockOnly) {
            filtered = filtered.filter(p => p.inStock);
        }
        if (filters.withDiscountOnly) {
            filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
        }
        return filtered;
    }

    sortResults(products, sortBy = 'price_asc') {
        const sorted = [...products];
        switch (sortBy) {
            case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
            case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
            case 'relevance': return sorted;
            default: return sorted.sort((a, b) => a.price - b.price);
        }
    }

    saveToDatabase(query, products) {
        try {
            const productsWithQuery = products.map(p => ({ ...p, query }));
            saveSearchResults(productsWithQuery);
            console.log(`💾 ${products.length} produtos salvos no banco`);
        } catch (error) {
            console.error('Erro ao salvar no banco:', error.message);
        }
    }

    getAvailableStores() {
        return this.enabledEngines.map(e => ({
            name: e.name,
            displayName: e.displayName,
            enabled: e.enabled
        }));
    }
}

const orchestrator = new SearchOrchestrator();
export default orchestrator;
