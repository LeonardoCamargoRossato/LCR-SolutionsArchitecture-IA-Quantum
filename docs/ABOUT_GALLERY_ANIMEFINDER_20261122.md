# LCR Portfolio — Galeria 06.1, Sobre e screenshots do AnimeFinder

Data: 22/11/2026 · Builder Chat 2  
Status: código e CMS atualizados; screenshots binários produzidos e verificados em arquivo ZIP, **aguardando incorporação no repositório**.

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

## Limitação operacional e instalação

A integração atual do GitHub permite criar e modificar **arquivos de texto**, mas não possui acesso direto aos bytes locais da pasta `/mnt/data` para a transferência binária. O pacote ZIP com os 16 PNGs, 16 WebPs e os hashes SHA-256 foi criado e validado no ambiente da conversa. **Não declarar que esses binários foram enviados ao GitHub enquanto não forem efetivamente incorporados.**

Para instalar: extrair o ZIP, copiar `public/assets/projects/animefinder` para a mesma localização na raiz deste repositório, fazer commit e push. O manifest deve ser enviado **no mesmo commit** que os 32 arquivos. Após o deploy, a galeria entra em funcionamento automaticamente, sem novas alterações de React.

## Privacidade e rastreabilidade

As imagens foram fornecidas explicitamente para uso no portfólio, mas contêm detalhes de conta, catálogo pessoal, comentários e conversas privadas. Antes da efetiva publicação pública dos binários, revisar se todos esses detalhes devem ficar visíveis. Não introduzir capturas fictícias nem usar imagens geradas para substituir prints reais. Referência: `LCR_ASSET_ORGANIZATION_STANDARD` no Drive.

## Validação

- `npm run build` (TypeScript + Vite)
- `tests/about-gallery-credentials-smoke.mjs`: desktop/mobile, contador, botão da grade, 16:9, rotas, formação, links oficiais, correção de LACQ e proteção quando assets ausentes
- `tests/about-gallery-media.test.mjs`: resolução das fotos existentes e caminho WebP→PNG
- `tests/portfolio-carousel-unified-smoke.mjs`: regressão dos carrosséis de todos os estudos de caso

O padrão base do carrossel de projetos não foi duplicado nem reconstruído.
