# LCR Loading Portal V1 — Integração isolada ao Test Component Lab

**Projeto:** LCR-SolutionsArchitecture-IA-Quantum  
**Etapa:** B, Component Lab — **sem Home Boot Coordinator** e **sem deploy à Home**.  
**Base auditada:** `main@1bbc0f817d62c8671a33241fca6407c42bb0294d` (Hero V13).  
**Fonte artística:** ZIP `LCR_Loading_Portal_V1_Arquivos(1).zip`, SHA-256
`20ffa802b5d06ad15301659fcd366336636204a10f07644e101883a30b8c62a0`.

## Conteúdo recebido, conferência e preservação

O pacote original possui 43 entradas: componente React/TypeScript/CSS; demo isolado; demo HTML self-contained; 8 quadros de portal; 2 camadas usadas na abertura; 3 WebPs de storyboard/referência e 11 PNGs originais. Os checksums `source_sha256` e `derived_sha256` do `assets/INVENTARIO.json` foram conferidos contra o arquivo ZIP: **nenhuma divergência**.

Nenhum PNG original, demo de captura de tela, storyboard ou código de renderização auxiliar integra a publicação. Os originais permanecem preservados no ZIP fornecido pelo responsável.

| Classe | Quantidade | Publicação |
| --- | ---: | --- |
| Keyframes `portal-*.webp` | 8 | Sim, cópias exatas |
| `door-open-base.webp` e `lock-core.webp` | 2 | Sim, cópias exatas |
| Storyboard e screenshot WebP | 3 | Não |
| PNG originais | 11 | Não |
| ZIP, demonstração HTML e scripts Drawer | Arquivo-fonte | Não |

**Inventário canônico da importação:** `ASSET_INVENTORY.json`. São **778.526 bytes de WebPs necessários** (antes de cache e headers).

## Etapa 1 — Implementação

1. O editor `Particle Wave` continua sendo a opção padrão, sem migração dos presets, IndexedDB ou esquema V2.
2. A opção independente `Loading Portal` pode ser selecionada no mesmo Lab. Ela desmonta a animação anterior e mantém seu estado de editor preservado.
3. Foram adicionados progresso manual de 0–100%, Play/Pause, Replay, Reset, Ready, velocidade, duração da abertura, espera, falha simulada e rede lenta simulada.
4. Proporções 16:9, 4:3 e 9:16, com stage responsivo. As artes de 1672×941 são cortadas pelo centro em portrait, sem esticar.
5. Os oito quadros originais são cruzados por opacidade; ao atingir 100% **e Ready**, duas folhas abrem e o núcleo acompanha a metade esquerda.
6. O Lab revela uma interface React de demonstração. **Não** usa screenshot estático como substituto da Home.
7. O catálogo de assets foi corrigido para `import.meta.env.BASE_URL`, adequado ao subdiretório do GitHub Pages.
8. O primeiro frame tem prioridade; frames adjacentes e as camadas de abertura são pré-carregados progressivamente, sem disputar a transferência com todo o site.
9. Timers de progresso, abertura e animação são limpos na desmontagem. Respeito a `prefers-reduced-motion`; sem Auth, Supabase ou Router duplicado.

## Segurança da migração

O script `scripts/import_loading_portal_assets.py` audita o ZIP original e copia somente os dez WebPs aprovados. Execução **não destrutiva**: usa hashes SHA-256 e não substitui arquivos de conteúdo divergente.

```bash
# Inspecionar o ZIP sem escrever nada:
python3 scripts/import_loading_portal_assets.py --zip "/caminho/LCR_Loading_Portal_V1_Arquivos(1).zip" --audit

# Copiar somente os dez WebPs de runtime:
python3 scripts/import_loading_portal_assets.py --zip "/caminho/LCR_Loading_Portal_V1_Arquivos(1).zip" --apply

# Verificar o inventário antes de aprovar o PR:
python3 scripts/import_loading_portal_assets.py --check
```

Não adicionar o ZIP de 19 MB ao `public/`. Nenhuma versão antiga de arte aprovada foi removida.

## Critérios de aceite, QA e pontos de controle

- [ ] Os 10 WebPs exatos estão no repositório, `public/assets/home/loading-portal/`, sem 404.
- [ ] Build e TypeScript `npm ci && npm run build`.
- [ ] CI `loading-portal-lab-ci.yml`, inclusive 10 hashes e browser em desktop/mobile.
- [ ] CI pré-existente de Component Lab V1/V2 sem regressão.
- [ ] Reprodução visual aprovada pelo responsável (primeiro frame, oito níveis, 2 folhas e núcleo).
- [ ] A PR específica do Lab foi revisada.

**Gate obrigatório:** não fazer merge nem deploy da animação na Home antes dessa aprovação. A etapa de Home Readiness será PR separada e implementará `initializing → loading → ready → opening → opened`, with `degraded`/`error`, tarefas reais mensuradas, fallback, bloqueio seguro de animações e validação de LCP/CLS/FCP/CPU.

### Limitação operacional do commit inicial

O conector atual de escrita GitHub aceita **texto UTF-8**, mas os dez WebPs requerem objetos binários. O código e o inventário foram integrados na branch; a verificação de assets **bloqueia o merge** enquanto os blobs binários originais ainda não estiverem presentes. Não substituir por arte aproximada nem maquiar o teste com placeholders.

O pacote do usuário segue disponível para importação exata. Após importar e confirmar o CI, apresentar o Lab ao responsável e aguardar aprovação da abertura antes de qualquer implantação na Home.

**Reversão:** fechar a PR ou reverter o commit específico. Nenhum dado de usuário, conteúdo Supabase, autenticação ou asset original foi modificado.
