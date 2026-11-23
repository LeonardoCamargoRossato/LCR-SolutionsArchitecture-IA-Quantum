# LCR Workflow — Loading Portal V1 na Home real

**Data:** 2026-11-23 · **Base:** PR #34 / commit `68e2a22` · **Escopo:** primeira visita à rota `/` do HashRouter, sem autenticação especial.

## Arquitetura

- `src/RootRouteGate.tsx` mantém a rota `/test-component-lab` isolada dos providers e encapsula a experiência pública no `HomeBootCoordinator`.
- `src/features/home-loading/HomeBootCoordinator.tsx` monta a **Home verdadeira** sob a porta. O estado `homeMotionEnabled=false` impede a digitação, timers de cenas, reveals e loop Canvas de correrem enquanto o portal ainda bloqueia a Home.
- `HomeMotionContext.tsx` fornece um sinal interno e conserva o valor padrão `true` para componentes isolados e outras rotas.
- `preloadCriticalResources.ts` aguarda DOM da Home, imagem de fundo da Hero, `document.fonts.ready` e decodificação das duas artes de abertura. Não espera consultas remotas do CMS, autenticação, galerias ou rotas secundárias.
- `LoadingPortal.tsx` e **todos os WebPs aprovados da PR #34** foram preservados. Foi adicionado somente o callback opcional `onOpening` para instrumentação do marco de abertura; o Component Lab continua usando o contrato original.

## Máquina de estados

`initializing → loading → ready/degraded → opening → opened`. Quando a Hero não monta, `error` oferece tentar novamente. Quando uma imagem decorativa falha, `degraded` revela a Home montada sem deixar o visitante preso. Em carregamentos demorados, uma mensagem de recuperação aparece após 7 s; com 12 s sem a Hero, surge uma alternativa de erro.

A porta **só abre ao alcançar 100% e `ready=true`**, após a Home real estar montada e o conjunto de tarefas ter sido resolvido. O indicador de porcentagem é *progresso ponderado de tarefas verificáveis*, **não bytes transferidos**. O UI suaviza apenas o avanço até o total das tarefas efetivamente completadas. O carregamento remoto posterior continua com os fallbacks locais existentes.

## Pesos reais de prontidão

| Etapa | Peso |
|---|---:|
| Header, Home e primeira cena de IA realmente montados no DOM | 40% |
| SVG visível da Hero carregado/decodificado ou fallback disponível | 30% |
| Fontes prontas ou fonte de sistema disponível | 10% |
| Duas artes para abertura carregadas/decodificadas | 20% |

Tarefas opcionais fora da dobra não bloqueiam a abertura. O custo dos WebPs é contabilizado no inventário original da PR #34; nenhum PNG original nem print do portfólio entra no bundle.

## Entrada, replay e navegação

- Entrada `#/`: exibe a porta somente na primeira Home daquela sessão. A conclusão é guardada em `sessionStorage` (`lcr-loading-portal-v1-opened`).
- Link de QA `#/?portal=replay`: força a demonstração a cada novo carregamento do link, inclusive quando a sessão já viu a porta.
- `#/?portal=skip`: abre diretamente sem a porta, para testes A/B, emergência ou diagnóstico.
- Outras rotas `#/about`, `#/admin`, `#/workflow`, `#/projects/...`, `#/test-component-lab` não passam pelo portal e seguem com code-splitting normal.
- Sem alterar RLS, autenticação ou serviços Supabase. O Portal usa exclusivamente recursos públicos estáticos e estado efêmero da aba.

## Sincronização, acessibilidade, recuperação

- `HeroTypeTitle`: recomeça a digitação somente após `portal-opened`.
- `useHomeEntrance`: observers e reveals só entram em atividade após a abertura.
- `InteractiveAiVisual`: mantém a cena inicial `neural` e não consome os 7,9 s do grafo antes da abertura; `HeroParticleWave` herda o `playing=false` e pausa o loop de partículas.
- CSS suspende os efeitos do fundo e dos elementos da Hero que usam animação CSS.
- Conteúdo encoberto fica com `inert` e `aria-hidden` até a abertura; após aberto, fica interativo e acessível. Movimentos reduzidos continuam sem digitação progressiva e sem temporizadores longos.
- O componente original só é carregado na Home, não no Test Component Lab; o preview Lab permanece independente.

## Evidências e performance

Testes Chromium: primeira visita com a Home renderizada atrás da porta; contador e estado `Ready`; eventos de carregamento; início da digitação e do Canvas depois da abertura; clique no CTA; sessão e bypass; rotas diferentes; 390 × 844 em reduced-motion; recurso de abertura lento; falha de imagem com fallback seguro.

Relatório `test-results/home-loading-boot-report.json` com marcos de `performance.mark`:
`portal-mounted`, `home-render-ready`, `home-critical-resources-ready`, `portal-opening`, `portal-opened`, `home-animation-started`. Registra transferência conhecida, FCP quando suportado pelo navegador e durações. Não envia telemetria a terceiros.

O baseline da Hero V13 e a versão integrada devem ser comparados pela mesma máquina e condições; sem baseline reproduzível não há alegação de ganho real em LCP/CPU. O objetivo é garantir uma transição limpa sem esconder lentidão.

## Reversão

Reverter o squash merge da PR de Home Boot restaura a inicialização direta da V13, preservando os WebPs, o Component Lab V1 e o inventário versionado. Como proteção imediata sem alterar Git, o visitante pode usar `#/?portal=skip`.

**Padrão:** conforme o documento `LCR_ASSET_ORGANIZATION_STANDARD` acessado na etapa anterior: assets organizados em `public/assets/home/loading-portal/`, sem duplicar arte e sem apagar originais.
