Warning: truncated output (original token count: 3249)
Total output lines: 138

# LCR Code Root Migration — Plan

**Etapa:** 01/05 — auditoria e baseline
**Repositório:** `LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum`
**Branch de trabalho:** `refactor/lcr-framework-code-root`
**SHA de origem:** `dd7010ab95cc3c763a9069e30452ecede2da8485` (`main`)
**Data de referência:** 24/11/2026, 23:05 BRT

## Objetivo e limite

Preparar a migração estrutural da aplicação para `code/`, sem alterar comportamento, conteúdo, design, dependências, workflows de publicação ou o site. Esta etapa apenas registra o diagnóstico, o inventário e a linha de base. Nenhum arquivo da aplicação foi movido; `main` não foi alterada; não houve merge ou publicação.

A organização alvo segue o LCR Framework: `.agents/` e `.github/workflows/` permanecem na raiz; código executável e assets ficam em `code/`; documentação de governança versionada fica em `documentation/`. A documentação técnica hoje em `docs/` será movida para `code/docs/`, sem mesclar os dois diretórios. A documentação versionada no GitHub é pública; não criar `documentation/public/`.

## Situação atual verificada

| Indicador | Leitura preliminar | Atualizado em `main` |
|---|---:|---:|
| Arquivos em `docs/`, `public/`, `scripts/`, `src/`, `supabase/`, `tests/` | 535 | 535 |
| Arquivos de aplicação/configuração na raiz a migrar | 8 | 8 |
| Workflows em `.github/workflows/` | 32 | 32 |
| Pull requests abertos | 0 na leitura preliminar | 0 |
| SHA atual da `main` | `dd7010ab95cc3c763a9069e30452ecede2da8485` | `dd7010ab95cc3c763a9069e30452ecede2da8485` |

A árvore contém 868 entradas Git (arquivos e diretórios). `code/` e `documentation/` já existem na raiz; antes da migração, cada uma contém apenas `.gitkeep`. O inventário registra 543 arquivos: os 535 dos seis diretórios e os oito arquivos de configuração listados no escopo. O inventário atribui hash SHA-256 calculado a cada arquivo rastreado no checkout do SHA acima, além do SHA de blob Git, tamanho, tipo, destino e resultados da busca de referências.

## Branches e concorrência

A `main` foi verificada novamente antes da criação da branch. Não há PR aberto concorrente. Existem branches antigas sem PR aberto, algumas divergentes e com alterações em áreas de aplicação (Hero, galerias, carrosséis, Test Component Lab e `.agents/skills`). Elas não são concorrência ativa de PR, mas não devem ser integradas automaticamente. Na Etapa 02, antes de mover arquivos, atualizar a `main`, conferir o SHA base e revisar qualquer branch/PR novo que toque nos caminhos migrados. O scaffold de `code/` e `documentation/` já integrado pelo PR #53 é parte da base atual.

## Mapa de destinos

| Origem | Destino | Classe principal |
|---|---|---|
| `docs/**` | `code/docs/**` | documentação técnica, links relativos |
| `public/**` | `code/public/**` | assets e URLs públicas do Vite |
| `scripts/**` | `code/scripts/**` | scripts, raiz de execução e caminhos relativos |
| `src/**` | `code/src/**` | imports, aplicação, rotas e recursos relativos |
| `supabase/**` | `code/supabase/**` | configuração, migrations e funções Supabase |
| `tests/**` | `code/tests/**` | harness, fixtures, isolamento e caminhos relativos |
| Oito arquivos indicados abaixo | `code/<mesmo nome>` | configuração e entrada do projeto |
| `.agents/**` | permanece na raiz | descoberta de skills |
| `.github/workflows/**` | permanece na raiz | automação GitHub Actions |
| `.gitignore`, `AGENTS.md`, `README.md` | permanecem na raiz | governança e instruções de repositório |
| `documentation/**` | permanece na raiz | governança e registros do projeto |

Arquivos de configuração a migrar: `index.html`, `package.json`, `package-lock.json`, `storage.rules`, `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`.

## Áreas que exigem adaptação na Etapa 02

A busca foi feita nos 543 arquivos inventariados, nos 32 workflows e em instruções/configurações da raiz. O JSON contém os resultados por arquivo para os padrões solicitados. As ocorrências incluem caminhos de filesystem, resolução por `process.cwd()`, `Path(__file__)`, imports relativos, URLs públicas, artefatos e referências documentais. Os mesmos caracteres podem representar classes diferentes; alterações precisam ser revisadas pelo contexto, sem substituição global.

1. **Build e ferramentas:** a configuração Vite e os `tsconfig` mudam de diretório. Confirmar `root`, `envDir`, `publicDir`, `base`, diretório `dist`, localização do lockfile e resolução de imports antes de ajustar scripts.
2. **Workflows (32):** localizar todas as instalações, comandos npm, caches, `working-directory`, artefatos e scripts de CI. Ajustar caminhos de checkout e cache quando necessário, mantendo cada cenário e os checks existentes.
3. **Deploy GitHub Pages:** manter `.github/workflows/deploy.yml` na raiz; apontar instalação/build/validação para `code/`, preservar o caminho-base do site, validar o SHA construído/publicado e manter a validação de preview social.
4. **Testes e isolamento:** `tests/isolation/run.sh`, fixture server, `process.cwd()`, snapshots, arquivos de saída e verificações de workflow assumem a raiz atual. Preservar o namespace de rede, fixtures locais e bloqueio de endpoints de produção.
5. **Documentação técnica:** atualizar links relativos e comandos após `docs/` virar `code/docs/`; manter documentação de governança independente em `documentation/`.
6. **Supabase:** verificar diretório-base da CLI e caminhos de migrations/functions. Testes ordinários continuam sem chamadas ao Supabase de produção.
7. **Skills:** manter `.agents/` e a validação/descoberta associada na raiz, conforme o Framework.

Não foi feita alteração em qualquer desses pontos nesta etapa. Decisões de implementação devem ser registradas no PR da Etapa 02 e validadas por cenário.

## Sequência proposta para a Etapa 02

1. Reconfirmar `main`,…249 tokens truncated…ão até o gate final.

## Recuperação

- **SHA inicial / último deploy saudável:** `dd7010ab95cc3c763a9069e30452ecede2da8485`.
- **Evidência:** execução de publicação GitHub Actions [#45530499240](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45530499240), concluída com sucesso para esse SHA; o job de validação do preview social também passou.
- **Rollback previsto após uma futura publicação:** reverter o merge de migração com commit rastreável na `main`, executar novamente os gates exigidos, publicar o SHA revertido pelo pipeline normal e confirmar o SHA implantado e smoke mínimo de leitura. Não editar manualmente a publicação nem apagar os arquivos originais como método de rollback.
- Nesta etapa não há rollback operacional necessário: nenhuma publicação ou arquivo de aplicação foi alterado.

## Referências normativas consultadas

Documentos atuais no Drive do LCR Framework, consultados em 24/11/2026: `LCR_WORKFLOW` (v1.2), `LCR_GUARDRAILS`, `LCR_CICD_STANDARD` (v1.2), `LCR_TESTING_STANDARD` (v1.0), `LCR_ASSET_ORGANIZATION_STANDARD` (v1.2), `LCR_PERFORMANCE_STANDARD` (v1.0) e `LCR_RESOURCE_GOVERNANCE_STANDARD` (v1.0), além do `AGENTS.md` do repositório. A busca no Drive por `LCR_AUDITORIA` não identificou um documento com esse título; a referência aparece nos Guardrails/CI/CD. Confirmar o documento de auditoria aplicável antes do gate de revisão da etapa de implementação.

## Critérios para considerar a Etapa 01 pronta

- [x] SHA da `main`, branches e PRs verificados antes do trabalho.
- [x] Branch de auditoria criada a partir do SHA verificado.
- [x] Inventário com destinos, SHA-256, tipos, bytes, dependências e mapa de ocorrências.
- [x] Baseline com build, rotas, assets, lockfile, CI, evidências de UI, isolamento e benchmarks.
- [x] Plano de recuperação documentado.
- [x] Nenhum arquivo de aplicação movido e nenhuma publicação/merge efetuado.

## Etapa 02 — resultado da migração

**Estado:** concluída na branch de trabalho; não houve merge nem publicação.
**Commit com a estrutura completa:** `252d2a5960a1faab209e1749f19adc2c079a30ec`.

| Lote | Commit | Verificação |
|---|---|---|
| A — `docs/` → `code/docs/` | `e51950e5de113d3ddc2ce99cae677f7c16c1365f` | 64 arquivos conferidos pelo SHA-256 da baseline |
| B — `supabase/` → `code/supabase/` | `548376242ff78ddd2000f17a5a67c916ef913041` | 3 SQL byte a byte; nenhum executado |
| C — `scripts/` → `code/scripts/` | `f789f4805360f7f39a82ff885563eb0a34641bac` | 12 arquivos; raízes `REPO_ROOT`/`APP_ROOT` e caminhos adaptados |
| D — `tests/` → `code/tests/` | `627258a9a1cdb7439c2359ae6ab823e499f1d118` | 53 arquivos; isolation preservado e caminhos adaptados |
| E — `public/` → `code/public/` | `5a73e15e74029bfae9d82a016bcba24dbe4c5411` | 203 arquivos; todos os SHA-256, nomes e extensões preservados |
| F — `src/` → `code/src/` | `367ca9f093016774d2a0c5e97a222b5a984bf91c` | 200 arquivos byte a byte; imports relativos preservados |
| G — configurações → `code/` | `252d2a5960a1faab209e1749f19adc2c079a30ec` | 8 arquivos byte a byte; `package-lock.json` inalterado |

Foram atualizados os caminhos dos documentos de instrução na raiz (`AGENTS.md`, `README.md`), dos comandos ativos de qualidade/social sharing e das raízes de execução dos scripts. `.agents/` e `.github/workflows/` continuam na raiz; `documentation/` permanece separada; removido `code/.gitkeep`; nenhuma `package.json` duplicada foi criada na raiz. `.gitignore` agora ignora `test-results/`, junto aos diretórios de build/dependências.

### Validação após a movimentação

- `cd code && npm ci && npm run build`: **passou** usando npm 10.9.4 para reproduzir a versão compatível com a CI. TypeScript passou; Vite 6.4.6 transformou 1.899 módulos e gerou `code/dist/`. Nenhuma variável/credencial de produção foi fornecida.
- `code/package-lock.json`: SHA-256 idêntico ao inventário inicial; nenhuma dependência atualizada.
- Integridade local passou para AnimeFinder (16 pares PNG/WebP), CE-235, Cities Comparing (7 pares), logos (5 SVG), seis variantes estáticas do Loading Portal, skills, política dos 32 workflows, verificação de segredos do artefato e preview social estático.
- Verificação de links relativos em `README.md`, `AGENTS.md` e documentação técnica: zero destinos quebrados.
- Todos os 543 arquivos estão no destino previsto, com SHA-256 pré e pós-migração registrado no inventário. Conteúdo adaptado em 16 arquivos de scripts, harnesses e instruções; os demais permaneceram byte a byte idênticos.
- A suíte de isolamento de rede não foi iniciada no executor local: ele não dispõe de `sudo`, requerido pelo `tests/isolation/run.sh`. O isolamento não foi contornado. A execução completa dos workflows aguarda a Etapa 03, que adaptará seus caminhos na raiz.

### Estrutura resultante

```text
.agents/                    (mantida na raiz)
.github/workflows/          (mantida na raiz; CI/CD ainda não adaptado)
code/
  docs/ public/ scripts/ src/ supabase/ tests/
  index.html package.json package-lock.json storage.rules
  tsconfig*.json vite.config.ts

documentation/              (mantida na raiz)
.gitignore AGENTS.md README.md
```

### Pendências para a Etapa 03

1. Atualizar os 32 workflows para instalar e executar a aplicação dentro de `code/`, conservando paths, caches, artifacts, baseline worktrees, checks e proteção do deploy.
2. Confirmar que os jobs de qualidade rodam a partir do SHA de código efetivo e que a publicação usa `code/dist/`, valida o SHA e mantém o mesmo `base` público.
3. Executar o CI completo na branch/PR; tratar diferenças antes de solicitar revisão. Esta branch ainda não foi integrada nem publicada.

O inventário detalhado registra cada caminho, SHA-256 anterior e posterior, bytes, tipo, destinos, dependências, buscas de referência, adaptações e resultados de validação.
