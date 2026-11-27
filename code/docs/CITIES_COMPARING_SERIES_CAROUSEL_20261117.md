# CITIES_COMPARING_SERIES_CAROUSEL_20261117

## Objetivo

Adicionar as **sete capturas de tela fornecidas pelo responsável** ao carrossel do estudo de caso Cities Comparing no portfólio LCR, **depois da capa e do resumo gráfico** já publicados. A sequência aprovada contém nove slides (2 existentes + 7 novos). Esta alteração não modifica a aplicação CitiesComparing-ResearchPlatform original.

## Hierarquia e contratos de mídia

```
public/projects/cities-comparing/
  graphical-abstract-{thumb,preview,card,full}.webp  # existente, preservado
  series-compare/
    PNG/
      Research_Platform_Series_Compare_01.png
      ...
      Research_Platform_Series_Compare_07.png
    WebP/
      Research_Platform_Series_Compare_01.webp
      ...
      Research_Platform_Series_Compare_07.webp
```

| Slides | Conteúdo | Renderização | Ampliar / download |
|---|---|---|---|
| 1 | Capa oficial atual, Supabase | WebP existente | Capa original atual |
| 2 | Graphical abstract | WebP existente | Arquivo existente |
| 3 a 9 | Research Platform Series Compare 01 a 07 | WebP de cada item | PNG do mesmo número |

- Resolutor central da série: `src/data/citiesComparingSeriesGallery.ts`.
- Montagem de carrossel: `src/application/services/ProjectService.ts`; preserva os slides existentes e evita duplicações por ID nas futuras edições.
- Visualizador compartilhado: `src/components/case/CaseHero.tsx` e `ImageLightbox.tsx`.
- Catálogo e integridade: `docs/assets/cities-comparing-series-compare.json`, com ordem, dimensões, SHA-256, tamanhos e nomes.
- As sete capturas foram copiadas sem alteração binária dos PNGs, e os sete WebPs são derivados otimizados da mesma imagem, com dimensões **1920 × 1080**.
- Fonte de acervo: pasta privada `LCR Apps/LCR-SolutionsArchitecture-IA-Quantum/cities-comparing-series-compare/{PNG,WebP}` no Google Drive.
- Publicação: arquivos estáticos em GitHub Pages; as nove imagens do carrossel são montadas na camada de apresentação. **Nenhum registro do Supabase foi alterado** nesta PR.

## Validação

- `npm ci` e `npm run build`.
- `node tests/cities-comparing-series-assets.test.mjs`: verifica 7 PNG + 7 WebP, hashes SHA-256, dimensões, formato e contagem.
- `node tests/cities-comparing-series-carousel-smoke.mjs`: navegador real, 9 imagens em desktop (1440×900) e mobile (390×844), sequência correta, ausência de 404, WebP antes do clique, PNG na ampliação, download PNG e ausência de transbordamento horizontal.
- GitHub Actions da branch: `cities-comparing-series-ci.yml`.
- Após merge/deploy, repetir o smoke na URL pública e conferir o resultado antes de declarar publicação validada.

## Reversão

O conteúdo anterior não foi sobrescrito. Para desfazer, reverter a PR em uma nova PR, sem excluir os arquivos já publicados ou os originais no Drive. Os dois slides existentes permanecem inalterados. Se algum PNG/WebP falhar, não fazer merge até corrigir e repetir os testes.

**LCR Workflow:** organização por função, inventário, fonte e variantes preservadas, execução em branch, validação antes de publicação e possibilidade de recuperação.
