# LCR Portfolio | Hero V13 — Particle Wave do Test Component Lab

**Data:** 2026-11-23  
**Escopo:** página `Home`, capa/hero do LCR Portfolio; React/TypeScript, Canvas 2D.  
**Base:** Hero V12 (`2569b61`), três cenas AI Graph → Code → Hamlet AI.

## Decisão de implementação

A composição aprovada no LCR Test Component Lab V2 deve produzir uma **onda animada de partículas no fundo real da Hero**, sem rasterizar a própria página ou copiar o screenshot do laboratório.

- **Renderer reaproveitado sem duplicação:** `src/components/test-component-lab/particle-wave/ParticleWave.tsx` e os tipos e o CSS do mesmo diretório. Este componente continua atendendo ao Lab e agora também é usado no site.
- **Configuração declarativa/validada:** `src/config/heroParticleWave.ts`. Esta é a projeção para runtime dos parâmetros aprovados.
- **Adaptador de integração:** `src/components/hero/HeroParticleWave.tsx`.
- **Camada de estilo:** `src/components/hero/hero-particle-wave-v13.css`, importada após a V12, para não alterar os outros módulos.
- **Fonte JSON auditável:** `docs/hero-v13/reference/lcr-composition-v2.json`.

Não foi criada outra implementação Canvas, não se alterou a lógica de autenticação/Supabase e não se adicionou pacote npm. A composição de screenshot/editor do Lab não deve aparecer no bundle de publicação.

## Parâmetros e geometria preservados do export V2

| Parâmetro | Valor |
|---|---|
| Canvas de referência | 1600 × 900, 16:9 |
| Partículas | 900 |
| Amplitude / frequência | 1.65 / 2.35 |
| Velocidade / tamanho | 0.72 / 0.60 |
| Profundidade | 1.80 |
| Cor das partículas | `#45bfff` |
| Fundo armazenado no JSON | `#f6f9ff` (não desenhado; Canvas transparente) |
| Interação de mouse | `true` (desktop); desativada no mobile para preservar gestos |
| Direção / execução | `forward` / running por padrão |
| X, Y, largura, altura | -25.15489467162331 / -100.24783147459728 / 1773.2342007434943 / 997.2242874845106 |
| Transformação | rotation 0, flipX true, flipY false |

As coordenadas do editor são convertidas em percentuais em relação ao plano 1600 × 900. O espelhamento afeta **somente a onda**, não os textos, CTAs ou qualquer outra parte do site.

## Composição de camadas

1. **Camada existente**: SVG estático V7/V8 (mantido e escolhido conforme tema).
2. **Nova camada**: Canvas 2D transparente de partículas, 900 pontos e a transformação exportada.
3. **Cenas anteriores**: grafo, código e Hamlet AI, preservadas na frente da onda.
4. **Conteúdo principal**: título, descrição e botões continuam clicáveis e acessíveis.

O Canvas respeita `prefers-reduced-motion`, pausa ao sair da janela/viewport e responde ao controle de Play/Pause existente. Usa um único loop de `requestAnimationFrame`, sem `setInterval` ou atualizações React a cada frame. Renderização limitada pelo código-fonte já aprovado: 36 fps desktop, 24 fps mobile.

## Inventário dos materiais de entrada

| ID | Material | Estado |
|---|---|---|
| hero-v13-composition | `lcr-composition-v2.json` · SHA-256 `eae2954c4981f78e1c1f1d08e53c7d80b5e225920255318897e0b237b4c7be92` | Referência textual versionada em `docs/hero-v13/reference/` |
| hero-v13-source-package | `lcr-particle-wave-component-v2.zip` · SHA-256 `3a78c6d2485e5a4ab1283cf321eda3124e5aa5839ad5362b01c629904d9a364d` | Referência fornecida no chat; renderer-fonte já presente no repositório |
| hero-v13-preview | `lcr-composition-preview-v2.png` · SHA-256 `24c5cb634cb66723d2a9a42f401b87c80e059506ce9d30c6466a4edd251fba17` | Evidência visual externa; **não** publicada |
| hero-v13-background-original | `assets/background-original.png` no ZIP · SHA-256 `b41438585efef922d6680c977caac7566a85dea1eb27efd4f2ffe52e296a68aa` | Print para referência do editor, não asset necessário ao site |
| hero-v13-renderer | `src/components/test-component-lab/particle-wave/ParticleWave.tsx` | Código compartilhado usado no Lab e na Hero |
| hero-v13-existing-background | `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg` e `...v8-light-navy.svg` | Preservados sem alteração |

A fonte de verdade de runtime é o Git; o arquivo-fonte JSON e o inventário documentam a origem. O ZIP e os screenshots da conversa não foram adicionados à publicação do site, evitando duplicação e aumento de carregamento.

## Validação / critérios de aceite

- [ ] `npm run build` e orçamento de assets da Hero.
- [ ] `tests/hero-v13-particle-wave-smoke.mjs`: Canvas real (pixels visíveis), quantidade 900, geometria, espelhamento, sobreposição, links clicáveis, tema escuro/claro, desktop/mobile, Play/Pause e reduced motion.
- [ ] Suite V5–V12: cenas, animações, controles, tradução, tags, header, screenshots e ausência de overflow.
- [ ] Testes existentes de Lab, galerias, carrosséis e projetos.
- [ ] PR com CI verde, merge controlado na `main`, deploy Pages e verificações pós-publicação.

**Reversão:** reverter o commit da V13. O renderer Lab, os assets V7/V8 e a Hero V12 permanecem intactos. Nenhuma exclusão de arquivo de origem foi executada.

**Diretriz de assets:** alinhado ao `LCR_ASSET_ORGANIZATION_STANDARD` consultado no Drive (organização por funcionalidade, preservação de originais, inventário e validação gradual).
