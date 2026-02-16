<img width="1483" height="591" alt="image" src="https://github.com/user-attachments/assets/0ee973de-e9c3-41ae-aa04-4d031b86c005" />

---

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Puppeteer-22-40B5A4?logo=puppeteer&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

## BuscaPrecos 🔎

<strong>Comparador de precos de eletrônicos em tempo real</strong>, que busca simultaneamente em 13+ lojas brasileiras com resultados progressivos via streaming

## O que é?

O **BuscaPrecos** é um simples estudo de motor de busca de precos que consulta multiplas lojas de eletrônicos ao mesmo tempo. Os resultados chegam em tempo real conforme cada loja responde, sem esperar todas terminarem.


## Problema que resolve 🤷🏻‍♂️

Comparar precos manualmente em dezenas de sites e demorado. O BuscaPrecos faz isso em segundos.

## Funcionalidades

**13 lojas simultâneas** — KaBuM!, Mercado Livre, Amazon, Magalu, Samsung e mais

**Streaming em tempo real** — resultados aparecem conforme cada loja responde (SSE)

**Autocomplete** — sugestões inteligentes para eletrônicos, hardware, celulares

**Filtros** — por preço, loja, estoque, desconto

**Ordenacao** — menor preço, maior preço, relevancia

**Selecao de lojas** — buscar apenas nas lojas que quiser

**Historico de precos** — salvo em SQLite

**Cache** — resultados ficam em cache por 15 minutos

**Responsivo** — desktop e mobile

## Lojas Suportadas
<div style="width:100%; overflow-x:auto;">
  <table style="width:100%; min-width:100%; border-collapse:collapse;" border="1">
    <thead>
      <tr>
        <th>Loja</th>
        <th>Método</th>
        <th>Velocidade</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>KaBuM!</strong></td>
        <td>API</td>
        <td>~2s</td>
      </tr>
      <tr>
        <td><strong>Mercado Livre</strong></td>
        <td>API</td>
        <td>~3s</td>
      </tr>
      <tr>
        <td><strong>Magazine Luiza</strong></td>
        <td>API</td>
        <td>~3s</td>
      </tr>
      <tr>
        <td><strong>Amazon Brasil</strong></td>
        <td>Fetch + HTML</td>
        <td>~4s</td>
      </tr>
      <tr>
        <td><strong>Samsung Store</strong></td>
        <td>API VTEX</td>
        <td>~3s</td>
      </tr>
      <tr>
        <td><strong>Havan</strong></td>
        <td>Fetch + HTML</td>
        <td>~5s</td>
      </tr>
      <tr>
        <td><strong>iByte</strong></td>
        <td>API VTEX</td>
        <td>~3s</td>
      </tr>
      <tr>
        <td><strong>Dell Brasil</strong></td>
        <td>Puppeteer</td>
        <td>~15s</td>
      </tr>
      <tr>
        <td><strong>TerabyteShop</strong></td>
        <td>Puppeteer</td>
        <td>~12s</td>
      </tr>
      <tr>
        <td><strong>Pichau</strong></td>
        <td>Puppeteer</td>
        <td>~12s</td>
      </tr>
      <tr>
        <td><strong>Fast Shop</strong></td>
        <td>Puppeteer</td>
        <td>~15s</td>
      </tr>
      <tr>
        <td><strong>ASUS Store</strong></td>
        <td>Puppeteer</td>
        <td>~20s</td>
      </tr>
      <tr>
        <td><strong>Leroy Merlin</strong></td>
        <td>Puppeteer</td>
        <td>~18s</td>
      </tr>
    </tbody>
  </table>
</div>


## 🎥 Demonstração

<p align="center">
  <img src="./demo-busca-precos.gif" width="100%" />
</p>

## Screenshot API

<img width="1498" height="789" alt="image" src="https://github.com/user-attachments/assets/3ac7d78d-2165-4b65-ae0a-465ce595a53b" />

## Licença
MIT
