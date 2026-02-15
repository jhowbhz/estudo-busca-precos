import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho do banco de dados
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/database.db');
const dbDir = dirname(dbPath);

// Criar diretorio data se nao existir
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
}

// Inicializar SQL.js e banco
const SQL = await initSqlJs();
let db;

// Carregar banco existente ou criar novo
if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('📂 Banco de dados SQLite carregado:', dbPath);
} else {
    db = new SQL.Database();
    console.log('🆕 Novo banco de dados SQLite criado');
}

// Inicializar schema
const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');
db.run(schema);

// Função para salvar banco em disco
function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
}

// Salvar a cada 5 segundos se houver mudanças
let saveTimer = null;
function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveDatabase();
        console.log('💾 Banco de dados salvo');
    }, 5000);
}

// Wrapper para executar queries que modificam dados
const originalRun = db.run.bind(db);
db.run = function(...args) {
    const result = originalRun(...args);
    scheduleSave();
    return result;
};

// Salvar ao encerrar
process.on('exit', () => {
    saveDatabase();
    console.log('💾 Banco de dados salvo ao encerrar');
});

process.on('SIGINT', () => {
    saveDatabase();
    process.exit(0);
});

console.log('✅ Banco de dados SQLite inicializado:', dbPath);

export default db;
