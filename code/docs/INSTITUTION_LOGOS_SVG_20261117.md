# LCR Portfólio — Vetorização e ampliação das logos institucionais

**Data:** 17/11/2026  
**Repositório:** `LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum`  
**Branch:** `feat/institution-logos-svg-20261117`  
**Escopo:** logos das instituições vinculadas às páginas dos projetos; não confundir com ícones de navegação, avatares, ilustrações ou capas de projeto.

## Diagnóstico

O banco `public.project_institutions` contém **11 vínculos ativos**, distribuídos por **5 marcas únicas**: Instituto Pense+ (2), Instituto de Física/UFRGS (2), UFRGS (2), ITA (2), Instituto Foton (3).

Os cards antigos tinham 48px de altura, `padding: 7px 10px` e imagem limitada a 30px e 92px. Em marcas horizontais, como Pense+, a tipografia ficava quase ilegível. Além do CSS, algumas imagens raster continham margens internas e fundo branco.

## Implementação

- Geradas cinco logos SVG **verdadeiramente vetoriais**, com elementos `<path>`, sem PNG embutido e sem `<image>`, scripts, `foreignObject` ou URLs externas.
- Cada imagem foi traçada a partir de PNG já disponível no Drive e comparada visualmente ao original. São **vetorizações derivadas**, e não arquivos vetoriais oficiais fornecidos pelos titulares das marcas.
- O SVG não possui fundo de tela; os detalhes brancos **que fazem parte da marca do ITA** foram preservados.
- Os SVGs residem em `public/assets/institutions/svg/` e estão organizados também no Drive em `LCR Apps/LCR-SolutionsArchitecture-IA-Quantum/institution-logos/SVG/`.
- Catálogo único em `src/data/institutionLogoAssets.ts` conecta os cinco nomes legados de PNG aos novos SVGs somente quando a URL vem do bucket público conhecido do Supabase. URLs desconhecidas e novos uploads são mantidos como estão.
- `CaseInstitutionLogos.tsx` e `ProjectInstitutionsAdmin.tsx` exibem o SVG, mas em falhas voltam ao PNG original.
- CSS dimensiona cada card conforme sua proporção: extra-largo 174px, padrão 154px, compacto 78px, altura 64px, margem interna 3px/5px. O layout permite quebra de linha no mobile.
- O Supabase permanece a fonte dos registros editoriais e **não teve suas URLs alteradas**. O trabalho não deleta nem sobrescreve PNGs do Supabase.

## Fontes e inventário

Arquivo machine-readable: `docs/assets/institution-logos.json`.

| Marca | SVG do GitHub | Vínculos editoriais |
|---|---|---:|
| Instituto Pense+ | `instituto-pense-mais.svg` | 2 |
| Instituto de Física / UFRGS | `instituto-fisica-ufrgs.svg` | 2 |
| UFRGS | `ufrgs.svg` | 2 |
| ITA | `ita.svg` | 2 |
| Instituto Foton | `instituto-foton.svg` | 3 |

**Observação de proveniência:** o PNG da UFRGS encontrado no Drive é uma variante visual equivalente; não foi comprovada identidade binária com o arquivo de 206.724 bytes do Supabase. Portanto, não declarar equivalência pixel-a-pixel. Os PNGs do Supabase continuam intocados e acessíveis para revisão futura.

## Testes e qualidade

- `npm ci`, `npm run build`, teste de hashes/estruturas SVG, Playwright em desktop/mobile com as 11 referências e fallback PNG.
- Evidências publicadas como artefatos dos GitHub Actions.
- Validar a ausência de overflow horizontal, cards legíveis, carregamento HTTP e o comportamento do painel (prévia sem alterar edição e exclusão).
- Após o merge, executar teste de navegador no endereço publicado, além das regressões existentes do portfólio.

## Segurança e limites

Não aceitar upload SVG arbitrário no painel sem sanitização e política explícita; o formato aceito pelo formulário de upload permanece o anterior por segurança. Os cinco SVGs foram gerados de fontes curadas e validados por teste de conteúdo. Não inserir credenciais nem editar conteúdo confidencial.

## Reversão

Reverter a PR para restaurar o CSS e as URLs raster renderizadas, sem editar o banco, sem excluir os 11 arquivos PNG originais e sem tocar no Drive. Os novos SVGs permanecem versionados para auditoria até uma limpeza autorizada.

**LCR Workflow:** inventário, preservação, organização funcional, migração gradual, segurança, testes e revisão antes da publicação.
