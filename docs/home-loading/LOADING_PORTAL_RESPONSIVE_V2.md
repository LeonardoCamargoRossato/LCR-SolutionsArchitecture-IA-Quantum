# LCR Loading Portal — fundos estáticos responsivos V2

**Projeto:** LCR-SolutionsArchitecture-IA-Quantum
**Status:** assets para revisão independente; não altera o carregamento atual da Home.

## Fonte canônica
O asset public/assets/home/loading-portal/portal-000.webp (1672 × 941) já existe no repositório e tem o círculo interno sem percentual. Ele é preservado integralmente. Os PNG originais da V1 permanecem no pacote LCR_Loading_Portal_V1_Arquivos.zip. Os demais assets da V1 também são mantidos.

## Variantes

Todas ficam em public/assets/home/loading-portal/.

| Arquivo | Pixels | Aplicação | Tratamento |
| --- | ---: | --- | --- |
| loading-portal-base-16x9.webp | 1672 × 941 | Desktop padrão | Cópia exata da fonte |
| loading-portal-base-16x10.webp | 1600 × 1000 | Notebook alto | Recorte horizontal |
| loading-portal-base-21x9.webp | 2520 × 1080 | Ultrawide | Porta completa com extensão atmosférica lateral |
| loading-portal-base-3x4.webp | 900 × 1200 | Tablet vertical | Recorte central |
| loading-portal-base-9x16.webp | 1080 × 1920 | Celular convencional | Recorte central |
| loading-portal-base-9x19_5.webp | 1080 × 2340 | Celular alto | Recorte central |

A composição permanece estática e os recortes não deformam a porta. Em celular, o foco é o núcleo e o encontro das duas folhas; não é possível mostrar a porta horizontal completa ocupando toda a altura de um celular sem comprometer o tamanho dos detalhes.

## Referência geométrica
- Fonte: 1672 × 941 px.
- Eixo central: x = 835.5 px.
- Centro visual do anel: (835.5, 440.0) px.
- O arquivo loading-portal-variants.metadata.json documenta crop, escala, translação, projeção do centro, dimensões e SHA-256 de cada versão.
- Todas as futuras camadas vetoriais devem utilizar exatamente a transformação correspondente ao fundo ativo.

## Integração posterior
Esta etapa NÃO altera HomeBootCoordinator, o contador ou a animação de abertura. A seleção via picture / media query por proporção precisa ser implementada e validada separadamente, com apenas a variante necessária carregada em cada dispositivo. Usar a imagem 16x9 como fallback.

## Regeneração e checagem
Com Pillow disponível:

    python scripts/generate-loading-portal-static-assets.py
    python scripts/check-loading-portal-static-assets.py

## Governança LCR
Preservar os assets originais e seus hashes, não substituir arquivos V1, manter as variantes vinculadas à função home/loading-portal, testar o alinhamento e submeter revisão visual antes de integrar no site.
