# Supabase Public Assets Migration — Etapa 01

**Data:** 25/11/2026
**Branch:** `feat/supabase-public-assets-copy`
**Base:** `main` em `dd7010ab95cc3c763a9069e30452ecede2da8485`
**Bucket de origem:** `portfolio-media` (projeto `wdjffhfnzydudmhhekmk`, público)

## Escopo e resultado da auditoria

O bucket contém 77 objetos, somando 132.475.975 bytes. Cruzei os caminhos com os registros públicos visíveis de projetos, instituições, perfil, CV e galeria About; a consulta encontrou 31 referências públicas ativas. A cópia preserva os arquivos originais do Supabase e não altera registros, Storage, Auth ou RLS.

| Resultado | Quantidade |
| --- | ---: |
| Arquivos únicos copiados para o GitHub | 57 |
| Volume novo no repositório | 113.032.100 bytes (107,8 MiB) |
| Duplicatas exatas entre objetos do Supabase evitadas | 4 |
| PNGs legados na raiz do projeto, idênticos à variante canônica `/PNG/` | 7 |
| Objetos não copiados por não estarem em conteúdo público ativo | 9 |
| Duplicatas exatas dos arquivos que já estavam na `main` | 0 |

Os 57 arquivos são: 12 fotografias da galeria About em JPG original, PNG e WebP (36 arquivos); sete capas de projetos visíveis em PNG e WebP (14); cinco logos raster de instituições referenciadas (5); a foto de perfil (1); e o CV atualmente referenciado (1). Os quatro objetos repetidos são registrados no inventário com o caminho GitHub compartilhado, sem criar cópias redundantes.

Os nove objetos mantidos apenas no Supabase são oito relacionados a projetos ocultos ou retirados (capas e logos do PDF Frequency Analyzer e do Scientific Analysis Toolkit) e um CV antigo sem referência pública atual. Nenhum foi excluído ou alterado.

## Organização no GitHub

```text
public/assets/
├── about/
│   ├── gallery/
│   │   ├── originals/   # JPG
│   │   ├── PNG/         # ampliação/download
│   │   └── WebP/        # renderização otimizada
│   └── profile/
├── documents/cv/
├── institutions/raster/
└── projects/
    ├── cities-comparing/{PNG,WebP}/
    ├── embedded-control-platform/{PNG,WebP}/
    ├── foton-hub/{PNG,WebP}/
    ├── hamlet/{PNG,WebP}/
    ├── quantum-education-apps/{PNG,WebP}/
    ├── speaker-portfolio/{PNG,WebP}/
    └── webseer/{PNG,WebP}/
```

O catálogo de referências e hashes está em [`assets/supabase-public-assets-inventory.json`](assets/supabase-public-assets-inventory.json). Ele relaciona cada objeto de origem ao destino, ao registro/página que o referencia, ao formato, às dimensões, ao tamanho e ao SHA-256. Os arquivos excluídos aparecem no mesmo inventário com o motivo e permanecem no Supabase.

## Integridade, build e capacidade

- Todos os 57 arquivos novos foram comparados com a origem: tamanho e SHA-256 conferem. Os arquivos de imagem também têm dimensões registradas.
- O maior arquivo individual tem 15.135.381 bytes (PNG da galeria); nenhum excede 100 MB.
- `npm ci`: concluído. O npm apresentou aviso de configuração local `http-proxy`, aviso de suporte do ESLint e aviso do script de instalação do esbuild.
- `npm exec vite build`: aprovado; empacotou 1.899 módulos e copiou os assets para `dist/`.
- O build limpo (`npm ci && npm run build`) inicialmente revelou que `vite.config.ts` usa `process`, mas `@types/node` não estava declarado diretamente. Adicionei `@types/node` `22.20.7` como dependência de desenvolvimento fixada, com a atualização mínima necessária do lockfile. Depois disso, `npm ci` e `npm run build` passaram; o Vite empacotou 1.899 módulos e incluiu os assets em `dist/`.
- `npm run test:isolated -- node tests/isolation/Guardrail.test.mjs`: não executou os testes; o ambiente atual não possui `sudo`, exigido pelo script para criar o namespace de rede. A infraestrutura não foi contornada.
- Tamanho medido de `dist/`: 146.601.183 bytes (~139,8 MiB). O limite publicado atual do GitHub Pages é 1 GB; o artefato está abaixo dele ([documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).

No primeiro CI do PR, o check de qualidade apontou whitespace dentro dos bytes do PDF. O Git o estava tratando como texto. Adicionei `*.pdf binary` em `.gitattributes`, preservando o PDF byte a byte e mantendo `git diff --check` sobre arquivos textuais; o workflow e os testes não foram desativados nem enfraquecidos. O pipeline anterior aprovou os 12 checks no SHA indicado abaixo; a inclusão da dependência fixada e este relatório atualizado exigem uma nova execução integral, ainda pendente.

## CI do Pull Request

No SHA `f98d719cb0d8d00fff042637eef3c2497573abdb`, os 12 checks aplicáveis passaram: auditoria de dependências, inventário e paridade, cinco shards de qualidade, isolamento, typecheck/browser e dois grupos build/browser. Evidências:

- [Pipeline de qualidade e isolamento — run 45560511001](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45560511001)
- [Typecheck e browser — run 45560511051](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45560511051)
- [Build e browser — run 45560510649](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45560510649)
- [Build e browser — run 45560510685](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45560510685)

O teste de isolamento passou no runner do GitHub; a execução local não pôde iniciar por falta de `sudo` no ambiente de trabalho. O PR é [#54](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/pull/54). A `main` foi reconsultada antes da consolidação e retornou `protected: false`, sem regrasets; nenhuma proteção ou permissão foi modificada. O commit final precisa passar novamente pelo CI completo antes do merge.

## Compatibilidade e estado da publicação

Esta é somente uma cópia: referências do app continuam apontando para o Supabase, de modo que esta etapa não muda o site publicado nem ativa os novos caminhos locais. A migração futura das referências permanece separada. Não houve alteração de UI, conteúdo dos cards, dependências, banco, Storage, Auth ou RLS.

Os checks do commit de assets passaram antes desta atualização documental. O commit documental e o commit de merge devem ser registrados no PR #54; a aplicação continua usando as URLs atuais do Supabase até uma etapa futura de migração das referências.
