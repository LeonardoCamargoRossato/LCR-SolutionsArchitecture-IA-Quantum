# LCR Code Root Migration — recuperação (Etapa 03)

Data: 2026-11-26. Estado: preparação e backup remoto verificados; implementação e aprovação pendentes.

## Pontos de recuperação verificados

- Main: `67e8877b02fc23352306f75c04a40f4085b1f716`.
- Branch `backup/pre-code-migration-20261126` criada e relida no mesmo SHA.
- Deploy saudável: [Actions 45625400834](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45625400834). Todos os 12 jobs reportados concluíram com sucesso; os artefatos do run associam o SHA acima à main. O PR #54 também registra o merge e o deploy.
- Head de migração antes desta rodada: `55d3cea24c161a9f6b772f31536582e0513b663b`.
- Base comum: `dd7010ab95cc3c763a9069e30452ecede2da8485`. A migração estava 12 commits à frente e 1 atrás da main.
- A listagem do run saudável retornou nove artefatos de QA não expirados, mas nenhum artefato compilado de Pages. Não foi feita uma cópia local do build.
- Tag `stable-pre-code-migration-20261126` ainda não criada: o conector não expõe criação de tags, e o executor Git não alcançou github.com (DNS). Não confundir branch com tag.

## Tag e bundle — executar em clone completo autenticado

```bash
set -euo pipefail
SHA=67e8877b02fc23352306f75c04a40f4085b1f716
BACKUP=backup/pre-code-migration-20261126
TAG=stable-pre-code-migration-20261126
git fetch origin --tags
git fetch origin "refs/heads/$BACKUP:refs/remotes/origin/$BACKUP"
test "$(git rev-parse "origin/$BACKUP")" = "$SHA"
test "$(git rev-parse --is-shallow-repository)" = false
if git show-ref --verify --quiet "refs/tags/$TAG"; then
  test "$(git rev-parse "$TAG^{commit}")" = "$SHA"
else
  git tag -a "$TAG" "$SHA" -m "LCR stable pre-code migration 2026-11-26"
fi
git push origin "refs/tags/$TAG"
test "$(git ls-remote origin "refs/tags/$TAG^{}" | cut -f1)" = "$SHA" || \
  test "$(git ls-remote origin "refs/tags/$TAG" | cut -f1)" = "$SHA"
umask 077
BUNDLE="$HOME/lcr-portfolio-stable-20261126.bundle"
test ! -e "$BUNDLE"
git bundle create "$BUNDLE" "refs/tags/$TAG"
git bundle verify "$BUNDLE"
git bundle list-heads "$BUNDLE"
sha256sum "$BUNDLE" > "$BUNDLE.sha256"
sha256sum -c "$BUNDLE.sha256"
RESTORE="$(mktemp -d)"
git clone --no-checkout "$BUNDLE" "$RESTORE/repo"
git -C "$RESTORE/repo" checkout --detach "$TAG"
test "$(git -C "$RESTORE/repo" rev-parse HEAD)" = "$SHA"
git -C "$RESTORE/repo" fsck --full
```

Guardar bundle e checksum em armazenamento privado aprovado, fora da árvore pública. Não incluir variáveis de ambiente, credenciais ou arquivos privados. O bundle cobre o histórico alcançável pelo SHA estável, não os dados do Supabase.

## Rollback operacional

Antes do merge: parar a promoção; manter main e branch backup intactas. Depois de eventual merge autorizado: identificar o commit de merge ou squash exato, criar branch de reversão da main atual, revisar alterações concorrentes, executar revert (com `-m 1` somente para merge commit), abrir PR, rodar gates isolados e obter aprovação humana. Não usar reset/force push. Confirmar que os conteúdos do checkout revertido correspondem ao SHA saudável, exceto alterações posteriores autorizadas. Publicar pelo pipeline normal e verificar SHA do deploy e smoke limitado. Não reverter dados do Supabase nem apagar assets originais. Se o pipeline estiver impedido de publicar, escalar ao responsável sem substituir controles por deploy manual não aprovado.

## Estado dos gates

A Etapa 04 permanece bloqueada até aprovação independente, autorização humana, merge da Etapa 03 e novo deploy saudável. Não há autorização de cutover ou remoção de workflows nesta rodada.
