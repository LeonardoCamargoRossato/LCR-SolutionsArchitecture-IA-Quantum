# LCR Code Root Migration — Baseline

**SHA submetido ao baseline:** `dd7010ab95cc3c763a9069e30452ecede2da8485`  
**Branch:** `main`  
**Data:** 24/11/2026 (BRT)  
**Último deploy saudável identificado:** GitHub Actions run [45530499240](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45530499240), publicado a partir do mesmo SHA.

## Estado geral

A linha de base usa a revisão exata da `main` acima. A execução GitHub Actions terminou com sucesso, incluindo auditoria de dependências, inventário/paridade, isolamento, os cinco grupos de qualidade, build/deploy de Pages e verificação de preview social. A branch local de auditoria é somente documental.

## Build e instalação

| Verificação | Resultado | Evidência/observação |
|---|---|---|
| `npm ci` com npm 10.9.4 | passou | 170 pacotes instalados a partir de `package-lock.json`; executado sem credenciais Supabase |
| `npm run build` com npm 10.9.4 | passou | Vite 6.4.6; 1.899 módulos transformados; saída `dist/` gerada em checkout temporário |
| `npm ci` com npm 11.19.1 | instalou dependências, mas o build direto falhou | npm 11 não instalou o peer opcional `@types/node` presente no lockfile; `vite.config.ts` reportou `Cannot find name 'process'`. O mesmo lock/build passou com npm 10.9.4, em linha com a instalação da CI. Registrar a versão npm explicitamente no procedimento local de baseline futuro. Não foi alterado lockfile nem dependências. |
| `npm run test:isolated -- npm run build` neste executor | não iniciou | o executor não tem `sudo`; `tests/isolation/run.sh` exige `sudo`, `unshare`, `ip` e `setpriv` para criar namespace sem rede. Não foi contornado o isolamento. O job equivalente da CI para o SHA exato passou. |

O build executado sem isolamento foi usado somente para diagnosticar a diferença de npm; a execução normal de testes permanece sob o comando de isolamento do projeto. A limitação local não é classificada como falha funcional do aplicativo. Nenhum teste ordinário acessou Supabase de produção.

## Aplicação: rotas e áreas

O site usa `HashRouter`. Rotas observadas em `src/App.tsx`: `/`, `/about`, `/projects/:slug`, `/workflow`, `/admin` e fallback `*`. `src/RootRouteGate.tsx` encaminha `/test-component-lab` ao laboratório, mantendo a experiência do portfólio separada. São seis rotas declaradas no Router do portfólio, mais a rota dedicada do Lab.

A cobertura de qualidade disponível inclui Home/Hero e responsividade, animações particle-wave, Loading Portal V2, Test Component Lab V1/V2, galerias e carrosséis, cases de portfólio, logos institucionais, carregamento de imagens, Open Graph/social sharing, login simulado/restrição administrativa e regressão de conteúdo/capturas.

## Assets e integridade

- `public/`: 203 arquivos; `public/assets/`: 88 arquivos, totalizando 15.923.536 bytes. Todos os arquivos dos diretórios migrados estão listados individualmente no inventário com tamanho e SHA-256.
- `src/`: 200 arquivos; `docs/`: 64; `scripts/`: 12; `supabase/`: 3; `tests/`: 53.
- O workflow `quality / isolation` passou a validação de metadados estáticos e assets preservados no SHA-base. Artefato associado: `lcr-isolation-evidence` no run #45530499240.
- O workflow de deploy gerou o artefato `github-pages` (29.840.803 bytes) e concluiu o job de verificação do preview social.

## Dependências bloqueadas

O lockfile é `lockfileVersion: 3`. Versões resolvidas no lockfile na data de auditoria:

| Pacote | Versão bloqueada |
|---|---:|
| `vite` | 6.4.6 |
| `@vitejs/plugin-react` | 4.7.0 |
| `typescript` | 5.8.3 |
| `react` / `react-dom` | 19.2.8 / 19.2.8 |
| `react-router-dom` | 7.18.3 |
| `@supabase/supabase-js` | 2.114.0 |
| `lucide-react` | 0.542.0 |
| `simple-icons` | 15.22.0 |
| `eslint` | 9.39.5 |
| `@types/node` | 26.4.0 (peer opcional no lockfile) |

As faixas declaradas estão em `package.json`; os valores acima são as versões efetivamente travadas. A etapa de migração não deve alterar dependências.

## Testes, CI e evidências

O projeto contém 53 arquivos em `tests/`, incluindo testes de integridade de assets, smoke de browser, testes de contrato de autenticação, `Guardrail`, comparação com baseline imutável, testes de Portal/Lab e benchmarks. O workflow reutilizável usa `npm ci`, bloqueio de egress e fixture local; seu job do SHA base passou nas etapas de inventário/política, bloqueio de endpoint não autorizado, prova de isolamento de egress, build fixture, auth/admin simulado, comparação de screenshot/conteúdo com baseline, metadados/assets e upload de evidências.

Resultados da execução #45530499240, todos concluídos com sucesso:

- `Quality dependency audit`
- `Quality transition inventory`
- `Isolation`
- `Quality shadow / Hero`
- `Quality shadow / Portfolio`
- `Quality shadow / Static`
- `Quality shadow / Performance`
- `Quality shadow / Lab`
- build e validações de produção
- publicação GitHub Pages e `verify-social-preview`

Artefatos do SHA-base: [workflow #45530499240](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45530499240). Os artefatos `quality-hero`, `quality-portfolio`, `quality-lab` e `lcr-isolation-evidence` mantêm screenshots/evidências para inspeção; `quality-performance` e `quality-parity-summary` guardam as medições e comparações disponíveis. As execuções documentam baseline e medições existentes; a proposta de consolidação não é contabilizada como economia operacional medida nesta etapa.

Benchmarks versionados que devem ser preservados e repetidos após a mudança:

- `tests/loading-portal-v2-benchmark.mjs`
- `tests/portal-performance-hotfix-benchmark.mjs`
- cenários de carregamento/demanda de imagens incluídos no grupo `Quality shadow / Performance`

## UI e publicação

Os artefatos de qualidade no run base cobrem screenshots desktop/mobile e comparação com commits imutáveis; o job de teste reportou aprovação de comparação de screenshots e conteúdo. Loading Portal V2, Hero, animações, Test Component Lab, estudos de caso, responsividade e carrosséis estão incluídos nos grupos Hero/Portfolio/Lab. Open Graph foi validado por metadata/asset checks, e o preview social foi verificado na publicação. Login e restrição de admin foram validados em modo simulado. Este documento reutiliza a evidência CI existente, sem acessar APIs reais ou executar teste de carga no site público.

## Falhas preexistentes e limitações identificadas

1. **Ambiente local:** o executor não tem `sudo`, requisito explícito do script de isolamento. Os testes isolados foram bloqueados antes de iniciar; a CI realizou e aprovou esses mesmos gates no SHA base.
2. **Compatibilidade npm:** npm 11.19.1 omitiu um peer opcional de tipos usado pela configuração Vite e causou erro de typecheck; npm 10.9.4 instalou os 170 pacotes e o build passou. A CI do SHA-base passou. Registrar versão de npm em futura política de ambiente/reprodutibilidade, sem atualizar dependências nesta migração.
3. **Revisão independente:** não foi localizado no Drive um arquivo com o título exato `LCR_AUDITORIA`; a busca retornou referências a ele dentro dos Guardrails e do CI/CD Standard. Identificar a versão normativa correta antes da revisão independente da Etapa 02.

Nenhuma regressão da aplicação foi observada nas evidências de CI do SHA base. A tentativa de build com npm 11 é uma limitação de compatibilidade do executor/versão e está registrada separadamente, não como resultado da baseline aprovada.
