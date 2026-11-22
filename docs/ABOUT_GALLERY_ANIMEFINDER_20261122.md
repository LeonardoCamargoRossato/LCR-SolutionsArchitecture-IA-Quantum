# LCR Portfolio — Galeria 06.1, Sobre e screenshots do AnimeFinder

Data: 22/11/2026 · Builder Chat 2  
Status: código e CMS atualizados; **16 PNGs originais, 16 WebPs e inventário incorporados ao GitHub e validados por hashes**.

## Correções editoriais

- Galeria do Sobre: `06.1 / Gallery`, pois a galeria aparece depois de `06 / Sobre`.
- Porto Alegre / PUCRS / Tecnopuc 2025: **LACQ (Liga Acadêmica de Computação Quântica)**. O rótulo incorreto `LACEQUI` foi substituído no catálogo editorial TS e no registro da galeria no Supabase, sem alterar a fotografia.
- Contador da galeria: imagem atual `n / total`, atualizado com navegação e rolagem horizontal.
- Botão `LayoutGrid` de quatro quadrados: expande/recolhe grade de miniaturas **16:9** abaixo do carrossel. A grade utiliza a mesma fonte WebP já aprovada e abre o lightbox PNG sem bifurcar código.
- O carrossel horizontal, a fotografia original, o lightbox, o download, a tipografia, a paleta e a responsividade foram preservados.

## Liderança e formação

- Presidente e cofundador do Instituto Foton (2025–2026; voluntário).
- Vice-presidente e cofundador do Movimento Nacional de Ligas Acadêmicas de Computação Quântica no Brasil (2024–2025; voluntário).
- Mais de 50 palestras em português e inglês.
- Físico (UFSM), Mestre em Física (UFRGS), Doutorando em Engenharia Eletrônica e Computação (ITA). O título de Doutorado permanece como **em andamento** e não como concluído.
- Os textos de formação e os links no rodapé abrem em novas abas:
  - UFSM: https://www.ufsm.br/
  - UFRGS: https://www.ufrgs.br/
  - ITA: https://www.ita.br/
- As experiências e a comunicação científica foram ajustadas em PT e EN no CMS `about.content_en` / `about.content_pt`, preservando demais campos, publicações e formação anterior. Na interface, a seção usa cards compactos em `AboutHighlights`.

## AnimeFinder — real screenshots

Os **16 PNGs** fornecidos pelo usuário foram copiados byte a byte sem recomposição por IA. Derivaram-se **16 WebPs** de alta qualidade em resolução original 1280×1024, sem corte nos arquivos.

Estrutura de destino no GitHub:

```text
public/assets/projects/animefinder/
├── PNG/
│   ├── animefinder-01-landing-page.png
│   └── ... 16 arquivos
├── WebP/
│   ├── animefinder-01-landing-page.webp
│   └── ... 16 arquivos
└── assets-index.json
```

O catálogo versionado do código é `src/data/animeFinderGallery.ts`. O primeiro print substitui a imagem de capa e os quinze restantes compõem a galeria do projeto, reutilizando `ProjectCarousel` e `ImageLightbox`. A prévia e as miniaturas usam WebP; a ampliação e o download usam PNG.

**Integridade e proteção contra regressão:** `useAnimeFinderAssetsReady` exige um manifesto JSON válido com os 16 IDs. Somente depois da presença desse manifesto é que a interface troca o SVG temporário pelos prints. Se os binários não estiverem publicados, o site mantém a capa vetorial anterior, sem criar imagens quebradas, galerias fictícias ou requisições individuais para arquivos ausentes. A capa principal mantém a razão 16:9 do carrossel e usa `object-fit: contain` para exibir o print inteiro, sem recortá-lo.

## Publicação efetiva e inventário

Os 32 arquivos binários mais `assets-index.json` foram incorporados no commit
`7cf99ecd3d615f8583089ddfe5885112280b60e1` da branch
`feat/animefinder-real-gallery-assets-20261122`, usando a API Git de blobs e árvore.
O manifesto de 16 screenshots ativa a integração de galeria já existente.
Os arquivos PNG são cópias byte a byte das imagens enviadas, sem recortes ou reconstrução.
As versões WebP foram otimizadas mantendo a resolução 1280×1024. O enquadramento
16:9 aplica-se somente via CSS ao carrossel.

Verificação: `tests/animefinder-asset-integrity.test.mjs` confere 16 IDs únicos,
headers PNG/WebP, dimensões dos PNGs, tamanho e SHA-256 registrados no
inventário. A CI executa ainda os testes de navegador e a regressão do carrossel.

Os arquivos temporariamente preparados em Drive para transporte da carga
binária foram excluídos após a gravação dos blobs no GitHub. Não há Drive como
dependência da página publicada.

## Privacidade e rastreabilidade

As imagens foram fornecidas explicitamente para uso no portfólio, mas contêm detalhes de conta, catálogo pessoal, comentários e conversas privadas. Antes da efetiva publicação pública dos binários, revisar se todos esses detalhes devem ficar visíveis. Não introduzir capturas fictícias nem usar imagens geradas para substituir prints reais. Referência: `LCR_ASSET_ORGANIZATION_STANDARD` no Drive.

## Validação

- `node tests/animefinder-asset-integrity.test.mjs` (16 PNG + 16 WebP + SHA-256)
- `npm run build` (TypeScript + Vite)
- `tests/about-gallery-credentials-smoke.mjs`: desktop/mobile, contador, botão da grade, 16:9, rotas, formação, links oficiais, correção de LACQ e proteção quando assets ausentes
- `tests/about-gallery-media.test.mjs`: resolução das fotos existentes e caminho WebP→PNG
- `tests/portfolio-carousel-unified-smoke.mjs`: regressão dos carrosséis de todos os estudos de caso

O padrão base do carrossel de projetos não foi duplicado nem reconstruído.
