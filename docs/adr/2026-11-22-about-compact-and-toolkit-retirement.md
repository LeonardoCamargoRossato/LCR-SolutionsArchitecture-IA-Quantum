# ADR — Retirar Toolkit de Análise Científica e compactar a seção Sobre

Data: 22/11/2026  
Projeto: LCR Portfolio — branch `fix/lcr-about-compact-retire-toolkit-20261122`

## Escopo aprovado

1. **Scientific Analysis Toolkit:** retirar do catálogo, dos dados em cache e da rota de estudo de caso. Preservar **Embedded Control Platform** e **Cities Comparing / Series Compare**.
2. **06 / Sobre:** manter foto/CV/contatos na coluna esquerda; o último contato determina a linha inferior da coluna direita no desktop (larguras 721 px ou mais). O conteúdo extenso deve ficar acessível por "Leia mais", que abre um diálogo nativo sem alongar a seção.
3. **Rodapé:** UFSM, UFRGS e ITA como três links discretos. Os detalhes completos da formação e liderança permanecem no diálogo.
4. **Separador:** linha única de largura total entre 06 / Sobre e 06.1 / Galeria.
5. **Mobile:** colunas empilhadas, prévia curta, leitura integral no diálogo e nenhum scroll horizontal involuntário.

## Retirada gradual e rastreável

- O registro `more_projects.scientific-analysis-toolkit` foi marcado com `visible=false` no CMS; o registro histórico foi preservado para auditoria/rollback.
- O filtro central `src/config/retiredProjects.ts` bloqueia catálogo, dados em cache e rota direta, independentemente da origem do registro. O serviço de projetos também não permite reapresentá-lo à administração.
- `public/projects/scientific-analysis.png` e `.svg` foram retirados do deploy porque não fazem parte das galerias ativas. As versões originais permanecem rastreáveis no histórico Git.
- O arquivo privado de imagem apontado pelo registro legado no Supabase Storage **não foi excluído**; nenhuma exclusão destrutiva de mídia do banco foi feita.
- Nenhum arquivo do Series Compare, nem o projeto de controle embarcado, sofreu alteração.

## Layout e acessibilidade

- O `ResizeObserver` mede a altura real da coluna da foto e contatos (inclusive carregamento tardio) e aplica essa referência apenas em desktop.
- O corpo do resumo usa o espaço restante com máscara suave para indicar continuação; botão visível oferece a versão completa.
- O diálogo HTML nativo tem Escape, fechamento no botão, clique fora e comportamento de foco da plataforma.
- Os links das universidades abrem em nova guia com `noopener noreferrer`.
- O conteúdo longo do CMS é preservado; não foi removida a biografia, a formação ou a liderança.

## Testes e publicação

- `npm ci && npm run build`
- `node tests/about-compact-retirement-smoke.mjs`: desktop 1280/1440 e mobile 390, mesma linha inferior, links, diálogo, cache antigo, rota 404 e controle embarcado preservado.
- `node tests/ai-positioning-smoke.mjs`: identidade, idiomas e demais estudos de caso.
- `node tests/portfolio-carousel-unified-smoke.mjs`: regressão dos carrosséis.
- CI obrigatória antes do merge; GitHub Pages confirma publicação após merge.
