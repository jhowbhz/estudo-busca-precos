/**
 * Configuracao completa do Swagger/OpenAPI 3.0
 * Acessivel em /api-docs
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'BuscaPrecos API',
    description: `API do BuscaPrecos — comparador de precos de eletronicos em tempo real.

Busca simultaneamente em **13+ lojas brasileiras** e retorna resultados progressivos via Server-Sent Events (SSE).

## Funcionalidades
- Busca em tempo real com streaming (SSE)
- Busca classica (aguarda todas as lojas)
- Filtros por preco, loja, estoque e desconto
- Historico de precos
- Cache inteligente (15 min)
- Estatisticas do sistema

## Lojas ativas
KaBuM!, Mercado Livre, Magazine Luiza, Amazon, Samsung, Havan, iByte, Dell, TerabyteShop, Pichau, Fast Shop, ASUS Store, Leroy Merlin`,
    version: '1.0.0',
    contact: {
      name: 'BuscaPrecos',
    },
    license: {
      name: 'MIT',
    },
  },

  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Desenvolvimento local',
    },
  ],

  tags: [
    { name: 'Busca', description: 'Endpoints de busca de produtos' },
    { name: 'Produtos', description: 'Historico e buscas recentes' },
    { name: 'Sistema', description: 'Health check e estatisticas' },
  ],

  paths: {
    // ============================================================
    // BUSCA
    // ============================================================

    '/api/search': {
      get: {
        tags: ['Busca'],
        summary: 'Busca classica',
        description: 'Busca produtos em todas as lojas e retorna quando **todas** terminarem. Para resultados progressivos, use `/api/search/stream`.',
        operationId: 'searchClassic',
        parameters: [
          { $ref: '#/components/parameters/QueryParam' },
          { $ref: '#/components/parameters/StoresParam' },
          { $ref: '#/components/parameters/MinPriceParam' },
          { $ref: '#/components/parameters/MaxPriceParam' },
          { $ref: '#/components/parameters/InStockOnlyParam' },
          { $ref: '#/components/parameters/WithDiscountOnlyParam' },
          { $ref: '#/components/parameters/SortByParam' },
        ],
        responses: {
          200: {
            description: 'Resultados da busca',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SearchResult' },
                example: {
                  query: 'notebook',
                  totalProducts: 125,
                  searchTime: 32540,
                  storesSearched: ['kabum', 'mercadolivre', 'magalu', 'amazon'],
                  storesFailed: [],
                  results: [
                    {
                      name: 'Notebook Lenovo IdeaPad 3 i5 8GB 256GB SSD',
                      price: 2499.0,
                      originalPrice: 3199.0,
                      url: 'https://www.kabum.com.br/produto/123456',
                      imageUrl: 'https://images.kabum.com.br/produtos/123456.jpg',
                      store: 'kabum',
                      storeDisplayName: 'KaBuM!',
                      inStock: true,
                      relevanceScore: 0.95,
                    },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/api/search/stream': {
      get: {
        tags: ['Busca'],
        summary: 'Busca com streaming (SSE)',
        description: `Busca produtos com **Server-Sent Events**. Os resultados chegam progressivamente conforme cada loja responde.

### Eventos SSE

| Evento | Descricao |
|--------|-----------|
| \`start\` | Inicio da busca, lista de lojas |
| \`searching\` | Loja X comecou a buscar |
| \`store_result\` | Loja X retornou produtos |
| \`store_empty\` | Loja X nao encontrou nada |
| \`store_error\` | Loja X falhou |
| \`cached\` | Resultado veio do cache |
| \`done\` | Busca finalizada |

### Exemplo de consumo (JavaScript)
\`\`\`javascript
const evtSource = new EventSource('/api/search/stream?q=notebook');
evtSource.onmessage = (e) => {
  const event = JSON.parse(e.data);
  console.log(event.type, event.data);
};
\`\`\``,
        operationId: 'searchStream',
        parameters: [
          { $ref: '#/components/parameters/QueryParam' },
          { $ref: '#/components/parameters/StoresParam' },
          { $ref: '#/components/parameters/MinPriceParam' },
          { $ref: '#/components/parameters/MaxPriceParam' },
          { $ref: '#/components/parameters/InStockOnlyParam' },
          { $ref: '#/components/parameters/WithDiscountOnlyParam' },
          { $ref: '#/components/parameters/SortByParam' },
        ],
        responses: {
          200: {
            description: 'Stream de eventos SSE',
            content: {
              'text/event-stream': {
                schema: { $ref: '#/components/schemas/SSEEvent' },
                example: 'data: {"type":"store_result","data":{"store":"kabum","newProducts":[...],"allProducts":[...],"storesCompleted":1}}\n\n',
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/api/search/stores': {
      get: {
        tags: ['Busca'],
        summary: 'Listar lojas disponiveis',
        description: 'Retorna a lista de todas as lojas ativas no sistema.',
        operationId: 'listStores',
        responses: {
          200: {
            description: 'Lista de lojas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stores: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Store' },
                    },
                  },
                },
                example: {
                  stores: [
                    { name: 'kabum', displayName: 'KaBuM!', type: 'fetch' },
                    { name: 'mercadolivre', displayName: 'Mercado Livre', type: 'fetch' },
                    { name: 'dell', displayName: 'Dell Brasil', type: 'puppeteer' },
                  ],
                },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ============================================================
    // PRODUTOS
    // ============================================================

    '/api/products/history': {
      get: {
        tags: ['Produtos'],
        summary: 'Historico de precos',
        description: 'Retorna o historico de precos de um produto em uma loja especifica (ultimos 30 registros).',
        operationId: 'getPriceHistory',
        parameters: [
          {
            name: 'name',
            in: 'query',
            required: true,
            description: 'Nome do produto',
            schema: { type: 'string' },
            example: 'Notebook Lenovo IdeaPad 3',
          },
          {
            name: 'store',
            in: 'query',
            required: true,
            description: 'Identificador da loja',
            schema: { type: 'string' },
            example: 'kabum',
          },
        ],
        responses: {
          200: {
            description: 'Historico de precos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PriceHistory' },
                example: {
                  product: 'Notebook Lenovo IdeaPad 3',
                  store: 'kabum',
                  history: [
                    { price: 2499.0, originalPrice: 3199.0, inStock: true, searchedAt: '2025-02-15T10:30:00.000Z' },
                    { price: 2599.0, originalPrice: 3199.0, inStock: true, searchedAt: '2025-02-14T08:15:00.000Z' },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/api/products/recent': {
      get: {
        tags: ['Produtos'],
        summary: 'Buscas recentes',
        description: 'Retorna as 10 buscas mais recentes realizadas no sistema.',
        operationId: 'getRecentSearches',
        responses: {
          200: {
            description: 'Buscas recentes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    searches: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/RecentSearch' },
                    },
                  },
                },
                example: {
                  searches: [
                    { query: 'notebook gamer', productsFound: 145, searchedAt: '2025-02-15T10:30:00.000Z' },
                    { query: 'iphone 16', productsFound: 89, searchedAt: '2025-02-15T09:20:00.000Z' },
                  ],
                },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ============================================================
    // SISTEMA
    // ============================================================

    '/': {
      get: {
        tags: ['Sistema'],
        summary: 'Informacoes da API',
        description: 'Retorna informacoes basicas da API e lista de endpoints disponiveis.',
        operationId: 'getApiInfo',
        responses: {
          200: {
            description: 'Informacoes da API',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    version: { type: 'string' },
                    endpoints: { type: 'object' },
                  },
                },
                example: {
                  message: 'Monitor de Precos de Eletronicos - API',
                  version: '1.0.0',
                  endpoints: {
                    health: '/health',
                    search: '/api/search?q=termo',
                    stores: '/api/search/stores',
                    stats: '/api/stats',
                    recent: '/api/products/recent',
                    history: '/api/products/history?name=...&store=...',
                  },
                },
              },
            },
          },
        },
      },
    },

    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        description: 'Verifica se a API esta funcionando.',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'API funcionando',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' },
                example: {
                  status: 'ok',
                  timestamp: '2025-02-15T10:30:00.000Z',
                  uptime: 3600.5,
                },
              },
            },
          },
        },
      },
    },

    '/api/stats': {
      get: {
        tags: ['Sistema'],
        summary: 'Estatisticas do sistema',
        description: 'Retorna estatisticas do banco de dados, cache, uptime e uso de memoria.',
        operationId: 'getStats',
        responses: {
          200: {
            description: 'Estatisticas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SystemStats' },
                example: {
                  database: {
                    totalProducts: 15420,
                    totalSearches: 342,
                    uniqueStores: 13,
                  },
                  cache: {
                    keys: 5,
                    hits: 120,
                    misses: 45,
                    hitRate: '72.73%',
                  },
                  uptime: 7200.5,
                  memoryUsage: {
                    rss: 85000000,
                    heapTotal: 45000000,
                    heapUsed: 32000000,
                    external: 2000000,
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },

  // ============================================================
  // COMPONENTES
  // ============================================================

  components: {
    parameters: {
      QueryParam: {
        name: 'q',
        in: 'query',
        required: true,
        description: 'Termo de busca (minimo 2 caracteres)',
        schema: { type: 'string', minLength: 2 },
        example: 'notebook gamer',
      },
      StoresParam: {
        name: 'stores',
        in: 'query',
        required: false,
        description: 'Lojas para buscar, separadas por virgula. Se omitido, busca em todas.',
        schema: { type: 'string' },
        example: 'kabum,amazon,mercadolivre',
      },
      MinPriceParam: {
        name: 'minPrice',
        in: 'query',
        required: false,
        description: 'Preco minimo',
        schema: { type: 'number', minimum: 0 },
        example: 1000,
      },
      MaxPriceParam: {
        name: 'maxPrice',
        in: 'query',
        required: false,
        description: 'Preco maximo',
        schema: { type: 'number', minimum: 0 },
        example: 5000,
      },
      InStockOnlyParam: {
        name: 'inStockOnly',
        in: 'query',
        required: false,
        description: 'Retornar apenas produtos em estoque',
        schema: { type: 'boolean', default: false },
      },
      WithDiscountOnlyParam: {
        name: 'withDiscountOnly',
        in: 'query',
        required: false,
        description: 'Retornar apenas produtos com desconto',
        schema: { type: 'boolean', default: false },
      },
      SortByParam: {
        name: 'sortBy',
        in: 'query',
        required: false,
        description: 'Criterio de ordenacao',
        schema: {
          type: 'string',
          enum: ['price_asc', 'price_desc', 'relevance'],
          default: 'price_asc',
        },
      },
    },

    schemas: {
      Product: {
        type: 'object',
        description: 'Produto encontrado',
        properties: {
          name: { type: 'string', description: 'Nome do produto', example: 'Notebook Lenovo IdeaPad 3 i5 8GB 256GB SSD' },
          price: { type: 'number', description: 'Preco atual em R$', example: 2499.0 },
          originalPrice: { type: 'number', nullable: true, description: 'Preco original (se com desconto)', example: 3199.0 },
          url: { type: 'string', format: 'uri', description: 'Link para o produto na loja', example: 'https://www.kabum.com.br/produto/123456' },
          imageUrl: { type: 'string', format: 'uri', nullable: true, description: 'URL da imagem', example: 'https://images.kabum.com.br/produtos/123456.jpg' },
          store: { type: 'string', description: 'Identificador da loja', example: 'kabum' },
          storeDisplayName: { type: 'string', description: 'Nome de exibicao da loja', example: 'KaBuM!' },
          inStock: { type: 'boolean', description: 'Se esta em estoque', example: true },
          relevanceScore: { type: 'number', description: 'Score de relevancia (0-1)', example: 0.95 },
        },
        required: ['name', 'price', 'url', 'store', 'storeDisplayName'],
      },

      Store: {
        type: 'object',
        description: 'Loja disponivel',
        properties: {
          name: { type: 'string', description: 'Identificador', example: 'kabum' },
          displayName: { type: 'string', description: 'Nome de exibicao', example: 'KaBuM!' },
          type: { type: 'string', enum: ['fetch', 'puppeteer'], description: 'Tipo do engine', example: 'fetch' },
        },
      },

      SearchResult: {
        type: 'object',
        description: 'Resultado completo de uma busca classica',
        properties: {
          query: { type: 'string' },
          totalProducts: { type: 'integer' },
          searchTime: { type: 'number', description: 'Tempo total em ms' },
          storesSearched: { type: 'array', items: { type: 'string' } },
          storesFailed: { type: 'array', items: { type: 'string' } },
          results: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        },
      },

      SSEEvent: {
        type: 'object',
        description: 'Evento Server-Sent Events',
        properties: {
          type: {
            type: 'string',
            enum: ['start', 'searching', 'store_result', 'store_empty', 'store_error', 'cached', 'done'],
            description: 'Tipo do evento',
          },
          data: { type: 'object', description: 'Dados do evento (varia por tipo)' },
        },
        example: {
          type: 'store_result',
          data: {
            store: 'kabum',
            storeDisplayName: 'KaBuM!',
            newProducts: [],
            allProducts: [],
            storesCompleted: 1,
            searchTime: 2340,
            engineTime: 2340,
          },
        },
      },

      PriceHistory: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          store: { type: 'string' },
          history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                price: { type: 'number' },
                originalPrice: { type: 'number', nullable: true },
                inStock: { type: 'boolean' },
                searchedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },

      RecentSearch: {
        type: 'object',
        properties: {
          query: { type: 'string', example: 'notebook gamer' },
          productsFound: { type: 'integer', example: 145 },
          searchedAt: { type: 'string', format: 'date-time' },
        },
      },

      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', description: 'Uptime em segundos' },
        },
      },

      SystemStats: {
        type: 'object',
        properties: {
          database: {
            type: 'object',
            properties: {
              totalProducts: { type: 'integer' },
              totalSearches: { type: 'integer' },
              uniqueStores: { type: 'integer' },
            },
          },
          cache: {
            type: 'object',
            properties: {
              keys: { type: 'integer', description: 'Chaves no cache' },
              hits: { type: 'integer', description: 'Cache hits' },
              misses: { type: 'integer', description: 'Cache misses' },
              hitRate: { type: 'string', description: 'Taxa de acerto', example: '72.73%' },
            },
          },
          uptime: { type: 'number', description: 'Uptime em segundos' },
          memoryUsage: {
            type: 'object',
            properties: {
              rss: { type: 'integer' },
              heapTotal: { type: 'integer' },
              heapUsed: { type: 'integer' },
              external: { type: 'integer' },
            },
          },
        },
      },

      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Mensagem de erro' },
          message: { type: 'string', description: 'Detalhes adicionais' },
        },
      },
    },

    responses: {
      BadRequest: {
        description: 'Parametros invalidos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Query deve ter pelo menos 2 caracteres' },
          },
        },
      },
      InternalError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Erro ao buscar produtos', message: 'Timeout' },
          },
        },
      },
    },
  },
};
