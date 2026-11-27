# ADR — Estrutura Padrão de Carrossel de Projetos (17/11/2026)

**Status:** implementado em branch, sujeito a validação CI e revisão humana antes de integrar na main.

## Contexto

O layout do hero CE235 tinha o fim do trilho de miniaturas alinhado com os botões, porém o topo da imagem começava abaixo da categoria/título. Uma regra específica do Cities Comparing já fora removida, mas o código que gerava a galeria ainda residia dentro de `CaseHero.tsx`. A repetição futura desse código em projetos adicionais geraria divergências.

## Decisão

1. Extrair um componente único `ProjectCarousel` e o adaptador `buildProjectCarouselImages` para `src/estruturas-padroes/carrossel-projetos/`, respeitando kebab-case técnico e mantendo o nome humano "Estruturas Padrões".
2. Deixar `CaseHero` responsável apenas pelo texto, contexto institucional, links e composição do layout. O projeto fornece o catálogo de imagens existente; o carrossel processa os dados de forma uniforme.
3. Colocar "Voltar aos Projetos" fora das duas colunas, numa área acima da grade. **Topo das colunas = categoria e imagem principal**.
4. Esticar a altura das duas colunas em desktop; colocar os botões no fim do texto, alinhar a barra de miniaturas ao fim do painel, crescer **somente a faixa de miniaturas**, preservando o preview principal 16:9.
5. Preservar o fluxo empilhado no mobile e o comportamento de zoom, download, navegação e seleção.
6. Consolidar estilos específicos do carrossel em arquivo da estrutura padrão, sem CSS duplicado por slug.

## Impactos e riscos

- **Escopo:** projetos main e more que usam `ProjectCaseV1 → CaseHero`, inclusive CE235, Cities Comparing e WebSeer.
- **Compatibilidade:** `ProjectGalleryItem`, `MediaAsset`, URLs derivadas e originais do catálogo continuam iguais; projetos sem galeria conservam uma única capa.
- **Riscos:** imagens grandes ou legendas longas podem ampliar o hero; testar desktop/mobile, dark mode e overflow horizontal.
- **Sem migração de assets:** nenhum arquivo foi removido, convertido, movido ou renomeado.

## Critérios de aceite

- Build TypeScript e produção aprovados.
- Categoria/texto e galeria com bordas superiores coincidentes em desktop.
- Colunas com a mesma altura e bordas inferiores alinhadas à faixa de rolagem e aos botões, quando houver botões.
- Primeiro preview com proporção 16:9; miniaturas elásticas e proporcionalmente landscape.
- Cinza translúcido na rolagem, azul apenas para elementos selecionados.
- Navegação, visualizador, responsividade e projetos sem galeria sem regressões.
- Evidência por projeto nos relatórios/screenshot da CI; PR aprovada antes de merge.

## Referências

- `LCR_ASSET_ORGANIZATION_STANDARD` — documento privado do Drive consultado em 17/11/2026.
- `src/estruturas-padroes/carrossel-projetos/README.md`.
- `tests/cities-carousel-alignment-smoke.mjs`.
- `tests/portfolio-carousel-unified-smoke.mjs`.
