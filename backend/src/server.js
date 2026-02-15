import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importar rotas
import searchRoutes from './routes/search.js';
import productsRoutes from './routes/products.js';
import statsRoutes from './routes/stats.js';

// Swagger
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

// Importar banco de dados (inicializa automaticamente)
import './database/db.js';
import orchestrator from './services/search-orchestrator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisicoes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'Monitor de Precos de Eletronicos - API',
        version: '1.0.0',
        docs: '/api-docs',
        endpoints: {
            health: '/health',
            search: '/api/search?q=termo',
            searchStream: '/api/search/stream?q=termo',
            stores: '/api/search/stores',
            stats: '/api/stats',
            recent: '/api/products/recent',
            history: '/api/products/history?name=...&store=...'
        }
    });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BuscaPrecos API - Docs',
}));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Rotas da API
app.use('/api/search', searchRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota nao encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Buscar: http://localhost:${PORT}/api/search?q=iPhone`);
    const stores = orchestrator.getAvailableStores();
    console.log(`\n📦 ${stores.length} lojas ativas: ${stores.map(s => s.displayName).join(', ')}\n`);
});
