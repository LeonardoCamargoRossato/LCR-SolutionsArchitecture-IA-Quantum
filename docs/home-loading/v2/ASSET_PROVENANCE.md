# Loading Portal V2 — approved asset provenance
Source: user-provided LCR_Loading_Portal_V2_Handoff_Completo ZIP. Original archives and PNGs remain in the supplied handoff; no original deleted or published.
- Canonical master SHA-256: 0a053f4ce21bf53adc571104c8be8fbf5311f8806312f0addad04523edd5d56c.
- Six static WebPs: exact Git blob matches, PR #37 merged.
- 4:3 additive reference and 21 mechanical WebPs: Drawer generator reproduced all 22 bytes-identically in the Builder's temporary environment (Pillow 12.3.0, WebP 1.6.0, NumPy 2.3.5). The repository generator fails closed unless all expected hashes, dimensions, bounds and native recomposition match. Catalog contains expected SHA-256 for each file.
- 19 path coordinates, delays and duration factors from Drawer circuit JSON; variant geometry consolidated into the mechanical catalog (visual center 839.5,445.5; mechanical split separate).
- PR #37's historical metadata is retained; the unified V2 runtime catalog is `src/components/loading-portal/v2/portal-door-geometry.json`.
- Source archive hashes (SHA-256): V1 20ffa802b5d06ad15301659fcd366336636204a10f07644e101883a30b8c62a0; first static 5c0d1f360de48fa53807f9adcf8986cdf6cbf5b64d415953e01b3c8d924fe1c4; responsive b4e315b3d81b187124a5dbecb9f0aeff06b3dc0d94e5abd5e7c6ebbc68479f79; lights e4b343f87db01a7bae099e41fdf41251862a2f235c699d95c8c828602f9f5eb2; mechanical 1cf10140de23dcae5fd3dc6bde6ca5cd5e785f6b43697bace7543ed220284530.
- Runtime paths: existing background folder, mechanical/{variant}/door-{left,right,core}.webp. No previews, ZIPs, or PNG originals copied to public.
- Gate: visual approval of shared component in Lab before any V2 Home replacement. No Home change in this stage.
