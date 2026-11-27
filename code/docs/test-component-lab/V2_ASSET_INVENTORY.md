# Test Component Lab V2 — inventário de fontes e derivados

Data: 23/11/2026 · Diretório funcional: `test-component-lab`.  
Seguindo o padrão LCR de não duplicar arquivos-fonte e preservar recursos originais.

| asset_id | Função | Arquivo fonte | Derivado / destino | Origem | Estado |
| --- | --- | --- | --- | --- | --- |
| particle-wave-react-v1 | Renderer Canvas 2D React/TSX | `src/components/test-component-lab/particle-wave/ParticleWave.tsx` | Incluído **sem alteração** em pacote ZIP gerado sob demanda | Código registrado V1 | Preservado, suporte direcional opcional |
| particle-wave-style-v1 | Estilo visual | `src/components/test-component-lab/particle-wave/particle-wave.css` | ZIP sob demanda | Código registrado V1 | Preservado |
| particle-wave-types-v1 | Tipos, limites e presets | `src/components/test-component-lab/particle-wave/particle-wave-types.ts` | ZIP sob demanda | Código registrado V1 | Preservado; propriedade `direction?` adicionada |
| visual-composition-v2 | Parâmetros, layers, referências e textos | JSON validado na sessão | `composition.json`, `lcr-composition-v2.json` | Usuário/Editor | Schema V2 |
| background-original-local | Imagem PNG/JPEG/WebP da pessoa | File/Blob em IndexedDB `images` | PNG de composição e pasta `assets/` do ZIP | Upload local do usuário | Privado à sessão/navegador, não publicado |
| imported-component-source | Arquivo TSX/CSS/TS enviado | Arquivo original em memória da sessão | `imported-original/` no ZIP | Upload local não confiável | Awaiting Review; não executado |
| preview-png-v2 | Imagem estática da composição | Canvas compositado em runtime | `lcr-composition-preview-v2.png` | Derivado local | Exportado sob demanda |
| package-zip-v2 | Reuso sob revisão | Fontes V1 + JSON + uploads originais | `lcr-particle-wave-component-v2.zip` | Derivado local | Exportado sob demanda |

**Sem recursos terceiros novos, sem ferramentas de IA na criação do renderer, sem publicação de uploads.**  
Porcentagem/grid/unidades são conversões de coordenadas e não cópias divergentes dos dados. A composição no ZIP é um wrapper *declarativo*, não um componente TSX pré-transformado.
