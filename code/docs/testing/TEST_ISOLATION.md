# P0 — isolamento de testes e contenção de egress

Base: 7b5d0ad67d9697b7338c945dfc7691ed8b0bd0d1. Último deploy saudável: Actions 45479636816. A auditoria de 24/11 indicou tráfego Headless Chrome e jobs com variáveis de produção; volume faturado por job não comprovado nesta execução.

## Uso
- Linux com sudo, unshare, iproute2 e setpriv; Node 22. Instale dependências com npm ci e Playwright 1.56.1/Chromium antes de iniciar o namespace. Rode npm run test:preflight ou npm run test:isolated -- node tests/<suite>.mjs.
- Namespace de rede novo, somente loopback, processos sem capabilities; nenhuma alternativa automática à rede do host. Vite ignora .env no modo isolado. Mock HTTP local REST/Auth/Storage com conteúdo sintético e imagens representativas públicas versionadas. Logs em test-results/isolation. Não use credenciais reais em testes.
- Dev real exige LCR_ALLOW_LIVE_DEV=1. Build de publicação preserva configuração normal; verifica endpoint e ausência da chave fictícia sem imprimir valores.
- Fixtures não certificam RLS, autenticação real nem disponibilidade de Storage de produção. Integração real pendente de ambiente/credencial/orçamento autorizados. Scripts de migração suspensos em CI, inclusive dry-run remoto; histórico preservado.

## Mapa
| Rotina | Ambiente | Controle |
|---|---|---|
| Hero, home, portal, Lab, cases, logos, galeria, covers | loopback + fixtures | namespaces + guard Node/browser |
| Checks de assets e metadata | arquivos locais | sem backend |
| Cinco antigos smokes pós-deploy | manual isolado; equivalentes em CI | sem disparo automático na publicação |
| Deploy | build de produção + Pages | variáveis apenas no build; nenhuma execução de app contra produção |
| Smoke publicado | Pages, HTML + JPEG | 2 GETs, 128 KB de corpo, 15 s por request, sem redirects/retries |
| Migrações | sintaxe local | execução real exige autorização separada |
| Integração Supabase real | pendente | não provisionar novo projeto |

## Evidência e rollback
Relatórios de namespace, tentativas bloqueadas e artefatos CI vinculados ao SHA; resultados somente após execução. Quantificar egress real via painel autorizado, sem inferir economia faturada. Rollback por PR para base validada; manter isolamento ou suspender automações se reverter. Nenhum dado/bucket/RLS alterado.

### Verificação complementar
O baseline imutável é reconstruído retrospectivamente no namespace, sem tráfego real. Compara conteúdo/capa/overflow e produz screenshots dos casos AnimeFinder e CE235 (desktop e mobile), além das suítes de regressão. Guardrail prova bloqueio de socket CLI com endereço reservado para documentação; Auth usa login fictício inválido, sessão não-admin e logout.
