# Migração das capas do LCR Portfólio — 17/11/2026

## Estado real
- **Inventário e mapeamento:** concluídos (9 PNGs).
- **Script de cópia e conversão:** criado, **não executado no Supabase**.
- **Novas pastas no Storage:** ainda não confirmadas / não publicadas.
- **URLs editoriais no Supabase:** permanecem inalteradas.
- **Site público:** segue usando os PNGs originais. Nenhuma exclusão.
- **Migração:** pendente de execução controlada e validação independente.

## Organização proposta (bucket `portfolio-media`)

```text
projects/
  <slug>/
    PNG/<nome-original>.png
    WebP/<nome-original>.webp
```

Cada projeto conserva o caminho legado `projects/<slug>/<nome-original>.png` até autorização expressa para limpeza. O campo editorial `projects.cover_url` ou `more_projects.image_url` será atualizado para `PNG/`; a camada `mediaAssetFromUrl` expõe `cardUrl` como WebP e `fullUrl` como PNG, com compatibilidade para caminhos antigos. A edição administrativa deve preservar o PNG como URL canônica.

## Escopo e referências
| Projeto | Tabela | Coluna |
|---|---|---|
| Cities Comparing | `projects` (`city-comparing`) | `cover_url` |
| Embedded Control Platform | `more_projects` | `image_url` |
| Foton Hub | `projects` | `cover_url` |
| Hamlet | `projects` | `cover_url` |
| PDF Frequency Analyzer | `more_projects` | `image_url` |
| Quantum Education Apps | `more_projects` | `image_url` |
| Scientific Analysis Toolkit | `more_projects` | `image_url` |
| Speaker Portfolio | `projects` | `cover_url` |
| WebSeer | `more_projects` | `image_url` |

## Execução segura
Exige Python 3, Pillow e acesso de rede ao Supabase. Não adicionar credenciais ao Git nem ao frontend.

```bash
python -m pip install -r scripts/requirements-migration.txt
python scripts/migrate_portfolio_covers.py
# Revisar o relatório e o backup dos campos CMS antes de prosseguir.
SUPABASE_SERVICE_ROLE_KEY='<definir apenas no ambiente seguro>' python scripts/migrate_portfolio_covers.py --apply
```

A linha com `SUPABASE_SERVICE_ROLE_KEY` acima é ilustrativa: a credencial real deve ser gerida por um cofre ou secret manager, nunca digitada em um shell registrado em histórico nem inserida em código público. O script confere o projeto correto, os hashes das cópias PNG, dimensões e formato WebP, não sobrescreve destino diferente, atualiza URLs somente após copiar os 18 arquivos e nunca apaga originais. Concluída a execução, fazer leitura de volta do Storage e CMS, testes de card, case, mobile, carrossel e zoom, inspeção de 404, e build. Falhas parciais exigem reconciliação pelo relatório antes de retentar.

## Critérios de aceite
- 9 cópias `PNG/` com SHA-256 igual ao original legado.
- 9 derivados `WebP/` com mesma resolução e formato válido.
- 9 registros editoriais apontando para `PNG/`.
- Card usa WebP; ampliação usa PNG; edição/admin salva URL canônica PNG.
- Inventário com caminhos, bytes, hashes, código afetado e estados.
- Testes e auditoria de outra pessoa antes de merge e limpeza.

Base: LCR_ASSET_ORGANIZATION_STANDARD, consultado no Drive em 17/11/2026. Não confundir **script preparado** com **migração concluída**.
