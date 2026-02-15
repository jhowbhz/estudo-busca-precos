-- Tabela principal de resultados de busca
CREATE TABLE IF NOT EXISTS search_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    store TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    url TEXT NOT NULL,
    image_url TEXT,
    rating REAL,
    review_count INTEGER,
    in_stock BOOLEAN DEFAULT 1,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_query ON search_results(query);
CREATE INDEX IF NOT EXISTS idx_store ON search_results(store);
CREATE INDEX IF NOT EXISTS idx_price ON search_results(price);
CREATE INDEX IF NOT EXISTS idx_searched_at ON search_results(searched_at);

-- Tabela de cache de buscas (opcional, mas util para analytics)
CREATE TABLE IF NOT EXISTS search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL UNIQUE,
    last_searched DATETIME DEFAULT CURRENT_TIMESTAMP,
    search_count INTEGER DEFAULT 1
);
