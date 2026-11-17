import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import typescript from 'typescript'

const source = await readFile('src/infrastructure/supabase/aboutGalleryMedia.ts', 'utf8')
const { outputText } = typescript.transpileModule(source, {
  compilerOptions: { module: typescript.ModuleKind.ESNext, target: typescript.ScriptTarget.ES2022 },
  fileName: 'aboutGalleryMedia.ts',
})
const { resolveAboutGalleryMedia: resolve } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
)
const root = 'https://wdjffhfnzydudmhhekmk.supabase.co/storage/v1/object/public/portfolio-media/'
const jpg = root + 'about/gallery/123-photo-9.jpg'
const r = resolve(jpg, 'about/gallery/123-photo-9.jpg')
assert.equal(r.card, root + 'about/gallery/WebP/123-photo-9.webp')
assert.equal(r.full, root + 'about/gallery/PNG/123-photo-9.png')
assert.equal(r.original, jpg)
assert.equal(r.hasVariants, true)

const withQuery = resolve(jpg + '?download=1')
assert(withQuery.card.endsWith('.webp?download=1'))
assert(withQuery.full.endsWith('.png?download=1'))

const external = 'https://example.org/photo.jpg'
assert.equal(resolve(external).card, external)
assert.equal(resolve(external).full, external)
assert.equal(resolve(external).hasVariants, false)

const tamperedPath = resolve(jpg, 'about/gallery/a-different.jpg')
assert.equal(tamperedPath.card, jpg)
assert.equal(tamperedPath.hasVariants, false)

const unrelated = root + 'projects/foton-hub/cover.png'
assert.equal(resolve(unrelated).full, unrelated)

const alreadyPng = root + 'about/gallery/PNG/123-photo-9.png'
assert.equal(resolve(alreadyPng).card, alreadyPng)

const encoded = resolve(root + 'about/gallery/photo%20number.jpg')
assert(encoded.card.endsWith('/photo%20number.webp'))

console.log('PASS: central gallery resolver, JPG->WebP/PNG mapping, unmatched and external fallbacks')
