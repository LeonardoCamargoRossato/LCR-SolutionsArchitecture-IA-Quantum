# LCR Portfolio — Gallery photo PNG/WebP conversion

**Operation:** 17 Nov 2026. The owner requested storage-only conversion for all 12 existing public speaking/gallery JPG photos.

## Scope

- **Source (preserved):** `portfolio-media/about/gallery/*.jpg`
- **First phase:** `portfolio-media/about/gallery/PNG/*.png` — PNG versions of all 12 JPGs; same visible pixels, respecting EXIF orientation and color profile when available.
- **Second phase:** `portfolio-media/about/gallery/WebP/*.webp` — WebP versions generated from the PNGs, preserving dimensions.
- **No changes:** existing `about_gallery.image_url`, image order, website cards or lightbox, repository main, JPG originals, institutional logos.

## Governance and verification

- Use `scripts/migrate_about_gallery_jpg_png_webp.py` via protected GitHub Actions secret.
- Validate exactly 12 source records before uploading; refuse overwrites if destination bytes diverge.
- Upload all PNGs before generating/publishing any WebPs.
- Read back both formats, validate SHA-256 checksums, dimensions and file signatures; verify originals remain unchanged.
- Save full report to workflow artifact `gallery-jpg-png-webp-audit`.
- Idempotent reruns accepted only when existing output bytes match.
- Completion is declared **only after** independent read-back and database inventory checks.

## Evidence

See [GitHub Actions — gallery conversion](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/workflows/about-gallery-jpg-png-webp.yml) for the run report and outcomes.

Supabase bucket: [portfolio-media](https://supabase.com/dashboard/project/wdjffhfnzydudmhhekmk/storage/files/buckets/portfolio-media).

**Execution status:** pending confirmation from the workflow and Supabase.
