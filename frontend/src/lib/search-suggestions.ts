/**
 * Sugestões de busca para eletrônicos, hardware, celulares etc.
 * Organizado por categorias para facilitar a manutenção.
 */

interface Suggestion {
  text: string
  category: string
  icon?: string // emoji opcional
}

const SUGGESTIONS: Suggestion[] = [
  // --- Notebooks ---
  { text: 'Notebook', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Gamer', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Dell', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Lenovo', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Samsung', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Acer', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook ASUS', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook HP', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook i5', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook i7', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Ryzen 5', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook Ryzen 7', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook 16GB RAM', category: 'Notebooks', icon: '💻' },
  { text: 'Notebook SSD 512GB', category: 'Notebooks', icon: '💻' },
  { text: 'MacBook Air', category: 'Notebooks', icon: '💻' },
  { text: 'MacBook Pro', category: 'Notebooks', icon: '💻' },
  { text: 'MacBook Air M2', category: 'Notebooks', icon: '💻' },
  { text: 'MacBook Pro M3', category: 'Notebooks', icon: '💻' },

  // --- Celulares ---
  { text: 'Celular', category: 'Celulares', icon: '📱' },
  { text: 'Celular Samsung', category: 'Celulares', icon: '📱' },
  { text: 'iPhone', category: 'Celulares', icon: '📱' },
  { text: 'iPhone 15', category: 'Celulares', icon: '📱' },
  { text: 'iPhone 15 Pro', category: 'Celulares', icon: '📱' },
  { text: 'iPhone 16', category: 'Celulares', icon: '📱' },
  { text: 'iPhone 16 Pro Max', category: 'Celulares', icon: '📱' },
  { text: 'Samsung Galaxy S24', category: 'Celulares', icon: '📱' },
  { text: 'Samsung Galaxy S24 Ultra', category: 'Celulares', icon: '📱' },
  { text: 'Samsung Galaxy A54', category: 'Celulares', icon: '📱' },
  { text: 'Samsung Galaxy A15', category: 'Celulares', icon: '📱' },
  { text: 'Xiaomi Redmi', category: 'Celulares', icon: '📱' },
  { text: 'Xiaomi Redmi Note 13', category: 'Celulares', icon: '📱' },
  { text: 'Motorola Moto G', category: 'Celulares', icon: '📱' },
  { text: 'Motorola Edge', category: 'Celulares', icon: '📱' },
  { text: 'Celular 128GB', category: 'Celulares', icon: '📱' },
  { text: 'Celular 256GB', category: 'Celulares', icon: '📱' },

  // --- Placas de Vídeo ---
  { text: 'Placa de Vídeo', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 4060', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 4070', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 4070 Ti', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 4080', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 4090', category: 'Hardware', icon: '🎮' },
  { text: 'RTX 3060', category: 'Hardware', icon: '🎮' },
  { text: 'RX 7600', category: 'Hardware', icon: '🎮' },
  { text: 'RX 7800 XT', category: 'Hardware', icon: '🎮' },
  { text: 'RX 7900 XTX', category: 'Hardware', icon: '🎮' },
  { text: 'GPU NVIDIA', category: 'Hardware', icon: '🎮' },
  { text: 'GPU AMD Radeon', category: 'Hardware', icon: '🎮' },

  // --- Processadores ---
  { text: 'Processador', category: 'Hardware', icon: '⚡' },
  { text: 'Processador Intel i5', category: 'Hardware', icon: '⚡' },
  { text: 'Processador Intel i7', category: 'Hardware', icon: '⚡' },
  { text: 'Processador Intel i9', category: 'Hardware', icon: '⚡' },
  { text: 'Processador AMD Ryzen 5', category: 'Hardware', icon: '⚡' },
  { text: 'Processador AMD Ryzen 7', category: 'Hardware', icon: '⚡' },
  { text: 'Processador AMD Ryzen 9', category: 'Hardware', icon: '⚡' },
  { text: 'Intel Core i5 13400F', category: 'Hardware', icon: '⚡' },
  { text: 'Intel Core i7 14700K', category: 'Hardware', icon: '⚡' },
  { text: 'AMD Ryzen 7 7800X3D', category: 'Hardware', icon: '⚡' },

  // --- Memória RAM ---
  { text: 'Memória RAM', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM DDR4 16GB', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM DDR4 8GB', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM DDR5 16GB', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM DDR5 32GB', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM Notebook', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM Kingston', category: 'Hardware', icon: '🧩' },
  { text: 'Memória RAM Corsair', category: 'Hardware', icon: '🧩' },

  // --- SSD / Armazenamento ---
  { text: 'SSD', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD 1TB', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD 512GB', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD 240GB', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD NVMe', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD NVMe 1TB', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD Kingston', category: 'Armazenamento', icon: '💾' },
  { text: 'SSD Samsung', category: 'Armazenamento', icon: '💾' },
  { text: 'HD Externo', category: 'Armazenamento', icon: '💾' },
  { text: 'HD Externo 1TB', category: 'Armazenamento', icon: '💾' },
  { text: 'Pen Drive 64GB', category: 'Armazenamento', icon: '💾' },
  { text: 'Cartão de Memória 128GB', category: 'Armazenamento', icon: '💾' },

  // --- Monitores ---
  { text: 'Monitor', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor Gamer', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor 144Hz', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor 240Hz', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor 4K', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor Ultrawide', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor 27 polegadas', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor Samsung', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor LG', category: 'Monitores', icon: '🖥️' },
  { text: 'Monitor Dell', category: 'Monitores', icon: '🖥️' },

  // --- Teclados e Mouses ---
  { text: 'Teclado Mecânico', category: 'Periféricos', icon: '⌨️' },
  { text: 'Teclado Gamer', category: 'Periféricos', icon: '⌨️' },
  { text: 'Teclado Logitech', category: 'Periféricos', icon: '⌨️' },
  { text: 'Teclado Razer', category: 'Periféricos', icon: '⌨️' },
  { text: 'Mouse Gamer', category: 'Periféricos', icon: '🖱️' },
  { text: 'Mouse sem fio', category: 'Periféricos', icon: '🖱️' },
  { text: 'Mouse Logitech', category: 'Periféricos', icon: '🖱️' },
  { text: 'Mouse Razer', category: 'Periféricos', icon: '🖱️' },
  { text: 'Mousepad Gamer', category: 'Periféricos', icon: '🖱️' },

  // --- Headsets / Áudio ---
  { text: 'Headset Gamer', category: 'Áudio', icon: '🎧' },
  { text: 'Fone de Ouvido Bluetooth', category: 'Áudio', icon: '🎧' },
  { text: 'AirPods', category: 'Áudio', icon: '🎧' },
  { text: 'AirPods Pro', category: 'Áudio', icon: '🎧' },
  { text: 'JBL Fone', category: 'Áudio', icon: '🎧' },
  { text: 'Caixa de Som Bluetooth', category: 'Áudio', icon: '🔊' },
  { text: 'Caixa de Som JBL', category: 'Áudio', icon: '🔊' },
  { text: 'Soundbar', category: 'Áudio', icon: '🔊' },

  // --- Placas-mãe ---
  { text: 'Placa Mãe', category: 'Hardware', icon: '🔧' },
  { text: 'Placa Mãe AMD', category: 'Hardware', icon: '🔧' },
  { text: 'Placa Mãe Intel', category: 'Hardware', icon: '🔧' },
  { text: 'Placa Mãe B550', category: 'Hardware', icon: '🔧' },
  { text: 'Placa Mãe B660', category: 'Hardware', icon: '🔧' },
  { text: 'Placa Mãe X670', category: 'Hardware', icon: '🔧' },

  // --- Fonte / Gabinete ---
  { text: 'Fonte 600W', category: 'Hardware', icon: '🔌' },
  { text: 'Fonte 750W', category: 'Hardware', icon: '🔌' },
  { text: 'Fonte Corsair', category: 'Hardware', icon: '🔌' },
  { text: 'Gabinete Gamer', category: 'Hardware', icon: '🔌' },
  { text: 'Gabinete ATX', category: 'Hardware', icon: '🔌' },
  { text: 'Cooler para Processador', category: 'Hardware', icon: '❄️' },
  { text: 'Water Cooler', category: 'Hardware', icon: '❄️' },

  // --- Tablets ---
  { text: 'Tablet', category: 'Tablets', icon: '📱' },
  { text: 'iPad', category: 'Tablets', icon: '📱' },
  { text: 'iPad Air', category: 'Tablets', icon: '📱' },
  { text: 'iPad Pro', category: 'Tablets', icon: '📱' },
  { text: 'Tablet Samsung', category: 'Tablets', icon: '📱' },
  { text: 'Samsung Galaxy Tab', category: 'Tablets', icon: '📱' },

  // --- Smart TV ---
  { text: 'Smart TV', category: 'TVs', icon: '📺' },
  { text: 'Smart TV 50 polegadas', category: 'TVs', icon: '📺' },
  { text: 'Smart TV 55 polegadas', category: 'TVs', icon: '📺' },
  { text: 'Smart TV 4K', category: 'TVs', icon: '📺' },
  { text: 'Smart TV Samsung', category: 'TVs', icon: '📺' },
  { text: 'Smart TV LG', category: 'TVs', icon: '📺' },

  // --- Câmeras / Foto ---
  { text: 'Webcam', category: 'Câmeras', icon: '📷' },
  { text: 'Webcam Logitech', category: 'Câmeras', icon: '📷' },
  { text: 'Câmera de Segurança', category: 'Câmeras', icon: '📷' },
  { text: 'GoPro', category: 'Câmeras', icon: '📷' },

  // --- Impressoras ---
  { text: 'Impressora', category: 'Impressoras', icon: '🖨️' },
  { text: 'Impressora HP', category: 'Impressoras', icon: '🖨️' },
  { text: 'Impressora Epson', category: 'Impressoras', icon: '🖨️' },
  { text: 'Impressora Multifuncional', category: 'Impressoras', icon: '🖨️' },

  // --- Smartwatch / Wearables ---
  { text: 'Smartwatch', category: 'Wearables', icon: '⌚' },
  { text: 'Apple Watch', category: 'Wearables', icon: '⌚' },
  { text: 'Samsung Galaxy Watch', category: 'Wearables', icon: '⌚' },
  { text: 'Xiaomi Smart Band', category: 'Wearables', icon: '⌚' },

  // --- Cabos e Acessórios ---
  { text: 'Cabo USB-C', category: 'Acessórios', icon: '🔌' },
  { text: 'Cabo HDMI', category: 'Acessórios', icon: '🔌' },
  { text: 'Carregador iPhone', category: 'Acessórios', icon: '🔌' },
  { text: 'Carregador Samsung', category: 'Acessórios', icon: '🔌' },
  { text: 'Carregador sem fio', category: 'Acessórios', icon: '🔌' },
  { text: 'Power Bank', category: 'Acessórios', icon: '🔋' },
  { text: 'Capinha iPhone', category: 'Acessórios', icon: '📱' },
  { text: 'Película de Vidro', category: 'Acessórios', icon: '📱' },

  // --- Redes ---
  { text: 'Roteador Wi-Fi', category: 'Redes', icon: '📶' },
  { text: 'Roteador Wi-Fi 6', category: 'Redes', icon: '📶' },
  { text: 'Repetidor Wi-Fi', category: 'Redes', icon: '📶' },
  { text: 'Switch de Rede', category: 'Redes', icon: '📶' },

  // --- Consoles / Games ---
  { text: 'PlayStation 5', category: 'Games', icon: '🎮' },
  { text: 'PS5', category: 'Games', icon: '🎮' },
  { text: 'Xbox Series X', category: 'Games', icon: '🎮' },
  { text: 'Xbox Series S', category: 'Games', icon: '🎮' },
  { text: 'Nintendo Switch', category: 'Games', icon: '🎮' },
  { text: 'Controle PS5', category: 'Games', icon: '🎮' },
  { text: 'Controle Xbox', category: 'Games', icon: '🎮' },

  // --- Cadeira ---
  { text: 'Cadeira Gamer', category: 'Móveis', icon: '🪑' },
  { text: 'Cadeira de Escritório', category: 'Móveis', icon: '🪑' },
  { text: 'Suporte para Notebook', category: 'Acessórios', icon: '💻' },
  { text: 'Mesa Gamer', category: 'Móveis', icon: '🪑' },

  // --- PC Completo ---
  { text: 'PC Gamer', category: 'Computadores', icon: '🖥️' },
  { text: 'PC Gamer Completo', category: 'Computadores', icon: '🖥️' },
  { text: 'Computador Desktop', category: 'Computadores', icon: '🖥️' },
  { text: 'Mini PC', category: 'Computadores', icon: '🖥️' },
]

/**
 * Normaliza string para comparação (remove acentos, lowercase)
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Busca sugestões baseadas no input do usuário.
 * Retorna até `limit` sugestões, priorizando:
 * 1. Começa com o texto digitado
 * 2. Contém o texto digitado
 */
export function getSuggestions(input: string, limit: number = 4): Suggestion[] {
  const query = normalize(input.trim())
  if (!query || query.length < 1) return []

  const terms = query.split(/\s+/)

  const startsWithMatches: Suggestion[] = []
  const containsMatches: Suggestion[] = []

  for (const suggestion of SUGGESTIONS) {
    const normalizedText = normalize(suggestion.text)

    // Todos os termos devem estar presentes
    const allTermsMatch = terms.every(term => normalizedText.includes(term))
    if (!allTermsMatch) continue

    // Priorizar: começa com o primeiro termo
    if (normalizedText.startsWith(terms[0])) {
      startsWithMatches.push(suggestion)
    } else {
      containsMatches.push(suggestion)
    }
  }

  // Combinar priorizando startsWith, depois contains
  const results = [...startsWithMatches, ...containsMatches]
  
  // Remover duplicatas exatas do texto digitado
  return results
    .filter(s => normalize(s.text) !== query)
    .slice(0, limit)
}

/**
 * Retorna sugestões populares (quando o input está vazio e o campo tem foco)
 */
export function getPopularSuggestions(): Suggestion[] {
  return [
    { text: 'Notebook Gamer', category: 'Notebooks', icon: '💻' },
    { text: 'iPhone 16', category: 'Celulares', icon: '📱' },
    { text: 'RTX 4060', category: 'Hardware', icon: '🎮' },
    { text: 'SSD NVMe 1TB', category: 'Armazenamento', icon: '💾' },
  ]
}

export type { Suggestion }
