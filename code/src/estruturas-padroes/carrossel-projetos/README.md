# Estruturas Padrões — Carrossel de Projetos

Esta pasta é a **implementação única** do carrossel utilizado nas páginas de projetos principais e adicionais do Portfólio LCR. Nome técnico em `kebab-case` conforme o LCR Workflow; o título humano corresponde a **Estruturas Padrões / Carrossel de Projetos**.

## Arquivos e responsabilidades

| Arquivo | Responsabilidade |
|---|---|
| `ProjectCarousel.tsx` | Visualização, miniaturas, navegação, gesto horizontal, zoom e download |
| `carousel-images.ts` | Contrato `ProjectCarouselImage` e conversão do catálogo do projeto em lista de imagens |
| `carrossel-projetos.css` | Layout único, formato 16:9, alinhamentos, barra cinza transparente e responsividade |
| `README.md` | Uso, mudanças e critérios de aceite |

O componente pai `src/components/case/CaseHero.tsx` monta o hero e **não implementa outro carrossel**. O roteiro comum vale para `main` e `more`.

## Como adicionar um novo projeto

1. Cadastre o projeto no sistema editorial existente (ou catálogo padrão).
2. Informe `coverImage` e `gallery`, com `id`, `order`/`sortOrder`, `caption`, `altText` e URLs das variantes disponíveis.
3. O `CaseHero` reutiliza automaticamente o adaptador e o componente:

```tsx
const images = buildProjectCarouselImages(project)
<ProjectCarousel key={project.slug} projectTitle={project.title} images={images} />
```

Se o projeto utilizar uma origem de imagens diferente, converta **os dados** para `ProjectCarouselImage[]` antes de chamar o componente; não copie os handlers, as estruturas HTML nem as regras CSS.

| Campo do contrato | Uso |
|---|---|
| `src` | Imagem leve renderizada no hero (preferencialmente WebP) |
| `thumbnailSrc` | Miniatura leve do trilho, de origem compatível |
| `fullSrc` | Arquivo em resolução plena para lightbox/download (PNG quando disponível) |
| `previewSrc` | Placeholder opcional |
| `alt` / `caption` | Acessibilidade / legenda |
| `downloadName` | Nome no download |

**Compatibilidade:** projetos sem galeria exibem uma única imagem sem botões e barra de rolagem. A primeira imagem do projeto e a ordem existente são preservadas. Nenhum asset é copiado ou excluído por esta refatoração.

## Layout aprovado

- O botão "Voltar aos Projetos" fica acima da grade comum; por isso **categoria e topo do carrossel** começam na mesma linha.
- As colunas de texto e mídia ocupam a mesma altura no desktop. Botões e barra de rolagem terminam na mesma linha.
- A **imagem principal mantém proporção 16:9**; não esticar imagem original para preencher altura.
- A **faixa de miniaturas aumenta de altura/largura proporcionalmente** quando necessário para completar a altura do painel.
- Trilha neutra cinza transparente, com variação acessível em tema escuro. Estado selecionado permanece azul.
- A miniatura selecionada acompanha o slide principal e é centralizada automaticamente na faixa inferior, com movimento suave nas mudanças e respeito a `prefers-reduced-motion`.
- A centralização também funciona nas extremidades (primeira/última imagem), em cliques, indicadores, setas e mudanças feitas no visualizador. Só o trilho horizontal rola; a página não sofre salto vertical.
- No mobile, as colunas empilham, sem forçar alturas idênticas nem causar overflow horizontal.

## Verificação e manutenção

- `npm run build`
- `node tests/cities-carousel-alignment-smoke.mjs`
- `node tests/portfolio-carousel-unified-smoke.mjs`
- Validar CE235, Cities Comparing, WebSeer e cada novo carrossel de projeto, no desktop, mobile e tema escuro.
- Tests de navegador exigem Playwright Chromium instalado; a CI prepara as dependências.
- Revisar efeitos de mudanças do catálogo (URLs externas, visibilidade, ordenação, qualidade e origem dos arquivos).

Referência normativa de organização de assets: `LCR_ASSET_ORGANIZATION_STANDARD` (Drive/LCR Framework; documento consultado em 17/11/2026). A organização dos assets de cada projeto **não** foi migrada aqui; permanece sob controle de inventário/ADR específico.
