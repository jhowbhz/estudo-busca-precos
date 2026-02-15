<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Puppeteer-22-40B5A4?logo=puppeteer&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

<h1 align="center">BuscaPrecos</h1>

<p align="center">
  <strong>Comparador de precos de eletrônicos em tempo real</strong><br/>
  Busca simultaneamente em 13+ lojas brasileiras com resultados progressivos via streaming
</p>

---

## O que é?

O **BuscaPrecos** é um simples estudo de motor de busca de precos que consulta multiplas lojas de eletrônicos ao mesmo tempo. Os resultados chegam em tempo real conforme cada loja responde, sem esperar todas terminarem.


## Problema que resolve:

Comparar precos manualmente em dezenas de sites e demorado. O BuscaPrecos faz isso em segundos.

## Funcionalidades:

- **13 lojas simultâneas** — KaBuM!, Mercado Livre, Amazon, Magalu, Samsung e mais
- **Streaming em tempo real** — resultados aparecem conforme cada loja responde (SSE)
- **Autocomplete** — sugestões inteligentes para eletrônicos, hardware, celulares
- **Filtros** — por preço, loja, estoque, desconto
- **Ordenacao** — menor preço, maior preço, relevancia
- **Selecao de lojas** — buscar apenas nas lojas que quiser
- **Historico de precos** — salvo em SQLite
- **Cache** — resultados ficam em cache por 15 minutos
- **Responsivo** — desktop e mobile

## Lojas Suportadas:

| Loja | Método | Velocidade |
|------|--------|------------|
| **KaBuM!** | API | ~2s |
| **Mercado Livre** | API | ~3s |
| **Magazine Luiza** | API | ~3s |
| **Amazon Brasil** | Fetch + HTML | ~4s |
| **Samsung Store** | API VTEX | ~3s |
| **Havan** | Fetch + HTML | ~5s |
| **iByte** | API VTEX | ~3s |
| **Dell Brasil** | Puppeteer | ~15s |
| **TerabyteShop** | Puppeteer | ~12s |
| **Pichau** | Puppeteer | ~12s |
| **Fast Shop** | Puppeteer | ~15s |
| **ASUS Store** | Puppeteer | ~20s |
| **Leroy Merlin** | Puppeteer | ~18s |

## Fluxo de busca:

1. Usuario digita o termo e busca
2. Frontend abre conexao SSE com o backend
3. Backend dispara todas as engines em paralelo (fetch primeiro, puppeteer depois)
4. Conforme cada engine termina, envia resultados via SSE
5. Frontend exibe produtos progressivamente
6. Resultados salvos em cache (15min) e banco de dados (histórico)

## Stacks:

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 · React 19 · TypeScript · Tailwind CSS 3.4 |
| **Backend** | Node.js · Express 4.18 · ES Modules |
| **Scraping** | Puppeteer 22 · puppeteer-extra · Stealth Plugin |
| **Banco** | SQLite (sql.js) |
| **Cache** | node-cache (TTL 15min) |

## Licença
MIT