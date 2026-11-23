# LCR Test Component Lab V2 — Visual Composition & Animation Editor

**Data:** 2026-11-23  
**Status:** implementação em branch; conclusão apenas após PR, testes e deploy bem-sucedidos.  
**Projeto:** LCR Portfolio / `#/test-component-lab`

## Propósito

Evoluir o Particle Wave V1 para um editor visual de composição, mantendo **o renderizador Canvas 2D e seus controles da V1**. A Hero e os outros projetos não foram modificados.

## Workflow do usuário

1. **Add Background**: botão na toolbar → modal com Browse Files / Drag & Drop / Ctrl+V; extensão PNG/JPG/JPEG/WebP, máximo de 12 MB, imagem até 8192 px e até 36 MP. Conferir miniatura e dimensões → **Apply Background**. Também é possível soltar ou colar a imagem na área central, com confirmação de substituição. O original é preservado em IndexedDB sem upload. Ajustar Fit / Fill / Original Ratio / Opacity / Remove Background em Appearance.
2. **Canvas**: proporções 16:9 (1600×900), 16:4 (1600×400), 4:3 (1200×900), 1:1 (1000×1000) e Custom. Largura/altura virtuais são independentes do zoom. Grade e réguas externas podem ser desligadas; unidades Grid, px ou %. Em 16:9, 16 unidades horizontais correspondem a 100 px cada e as 9 verticais ocupam 900 px.
3. **Composição**: duplo clique na onda para pausar e selecionar; oito alças de resize e alça superior para rotação. Arrastar para mover. Controles numéricos X/Y/Largura/Altura/Ângulo, bloqueios X/Y/proporções, Flip Horizontal/Vertical. Wave Direction Reverse altera o tempo de propagação, não a orientação espacial. Clique **Play** para retomar mantendo a transformação.
4. **Text Overlay**: adicionar Title, Subtitle ou Free Text; mover e redimensionar; editar conteúdo, fonte, tamanho, cor, alinhamento e coordenadas. Botão ilustrativo **LCR Hero** carrega o título, subtítulo e descrição aprovados, como textos estáticos, sem efeito de digitação.
5. **Layers**: fundo, onda, textos e guias com visibilidade, travamento e avanço/recuo dos objetos editáveis.
6. **Save Preset**: nomear, salvar, carregar, renomear, duplicar e excluir localmente. A imagem é mantida no armazenamento IndexedDB por referência estável (e não incorporada ao JSON).
7. **Configuração**: Copy Configuration e Download Configuration produzem `schemaVersion: 2`. Import Configuration aceita JSON V2 e migra o formato legado V1 `{componentId,preset,surface,settings}`. Campos e limites são validados antes da aplicação.
8. **Import Animation**: três campos independentes Component (.tsx obrigatório), Style (.css opcional) e Types (.ts opcional), cada um com Browse Files e Drag & Drop. Drop geral distribui arquivos quando não ambíguos; duplicatas requerem escolha. **Info** explica os formatos. Limite de 1 MB por arquivo. Estado `Awaiting Review`; arquivos são tratados como dados binários de origem não confiável.
9. **Download Component Package**: ZIP STORE local contendo cópias literais dos módulos existentes `ParticleWave.tsx`, `particle-wave.css`, `particle-wave-types.ts`, `composition.json`, README e uploads originais que foram importados, sem executar código não confiável. A transformação permanece declarada no JSON, não codificada no TSX.
10. **Export Preview PNG**: rasteriza a composição virtual e inclui screenshot, ondas e textos (se visíveis). Grid, réguas, seleção e UI ficam de fora. A prévia PNG não executa nem publica qualquer componente enviado pelo usuário.

## Arquitetura

```text
src/pages/TestComponentLab.tsx                  # Orquestra a experiência
src/features/test-component-lab/
  editor/document-model.ts                       # Contrato V2 + migração V1 + limites
  editor/coordinates.ts                          # Grid/px/% + resize matemático
  editor/VisualEditor.tsx                        # Canvas, réguas, grid, pointer gestures
  editor/EditorProperties.tsx                    # Transform, text, layers, aparência
  background/image-validation.ts                # Validação raster/magic bytes/dimensões
  background/AddBackgroundDialog.tsx             # Browse / Drop / Paste
  import/ImportAnimationDialog.tsx               # TSX/CSS/TS somente como dados
  presets/local-store.ts                         # IndexedDB local e blobs originais
  presets/PresetManager.tsx                      # Save / Load / Rename / Duplicate / Delete
  export/zip-store.ts                             # ZIP sem dependência externa
  export/composition-export.ts                    # JSON / PNG / package
  styles/editor-v2.css                            # CSS limitado à superfície V2
src/components/test-component-lab/particle-wave/ # Renderizador V1 preservado
```

A rota permanece lazy em `src/RootRouteGate.tsx`; o laboratório não monta providers de autenticação nem consulta Supabase. O CSS V1 continua isolado, e o CSS V2 complementa os novos componentes.

## Limitações explícitas

- **Código TSX/TS importado não é compilado nem executado.** Reutilização só após revisão manual do Builder; a plataforma não declara que um upload está pronto para preview.
- O ZIP contém **fontes originais**, sem reescrever automaticamente os imports ou compilar o arquivo do usuário. A composição visual depende de um wrapper que leia o JSON validado.
- O PNG registra o frame atual e não contém alças/guias. A qualidade depende do frame e do número efetivo de partículas escolhido; o background é raster local e não possui requisitos de CORS externo.
- O IndexedDB é armazenamento local do navegador; pode ser limpo pelo usuário. Ao importar JSON em outro computador, o `background.id` precisa ser associado ao arquivo original novamente. O pacote ZIP inclui uma cópia do original, quando carregado.
- Não há renderização WebGL, sandbox de código, banco remoto nem autenticação nesta V2.

## Segurança, cache e manutenção

Uploads são limitados por extensão, MIME, assinatura de bytes e dimensões. Recursos temporários de imagens são liberados via `URL.revokeObjectURL`, mesmo ao substituir ou desmontar. Importações de código não fazem `eval`, `new Function` ou bundling dinâmico.

O Vite usa chunks JS/CSS com hash, atualizados em cada deploy. O hash route continua funcional após refresh. Capturas de tela e logs do CI ficam em artefatos do GitHub Actions. Usuários podem atualizar o cache com `Ctrl + Shift + R` se persistir uma versão antiga.

## Inventário e rastreabilidade

- Fontes: repositório GitHub, `src/components/test-component-lab/particle-wave/` (não duplicadas em `public/assets`).
- Assets do usuário: arquivos binários preservados em IndexedDB, exportados explicitamente por download; nunca publicados no Git.
- Derivados: screenshot PNG e ZIP apenas sob comando do usuário.
- Proveniência: referência CodePen é somente inspiração, código não copiado.
- Alinhamento com `LCR_ASSET_ORGANIZATION_STANDARD` consultado no Drive (16/11/2026): organização por funcionalidade, originais preservados, inventário e operações reversíveis.

## Gates de aceite

`npm ci && npm run build`, testes Playwright V2, regressão V1, automações existentes, screenshots desktop/tablet/mobile, download de PNG/ZIP, segurança do importador e sucesso do GitHub Pages no SHA pós-merge. Todos devem ser verificados; a presença desta documentação sozinha não comprova execução.
