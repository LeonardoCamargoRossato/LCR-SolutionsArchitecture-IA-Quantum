import { useMemo, useState } from 'react'
import { getLocalAboutGallery } from '../../data/aboutGallery'
import { AboutGalleryLightbox } from '../AboutGalleryLightbox'
import { SafeImage } from '../SafeImage'
import { resolveAboutGalleryMedia } from '../../assets/public/aboutGalleryMedia'

export function AboutGalleryAdmin() {
  const items = useMemo(() => getLocalAboutGallery(true), [])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  return (
    <section className="form-section about-gallery-admin" data-testid="versioned-about-gallery">
      <div className="about-gallery-admin-heading">
        <div>
          <div className="eyebrow">04 / Gallery</div>
          <h2>About Gallery</h2>
          <p className="admin-note">Gallery versioned on GitHub — read only. Update the catalogue and assets through the repository. Legacy Supabase records and files are preserved.</p>
          <div className="about-gallery-storage-meta"><span>Repository path:</span><code>code/public/assets/about/gallery/</code></div>
        </div>
      </div>
      <div className="about-gallery-admin-list" role="table">
        <div className="about-gallery-admin-list-head" role="row">
          <span>Thumbnail</span><span>Title / Description</span><span>Location / Caption</span><span>Visibility</span><span>Order</span><span>Actions</span>
        </div>
        {items.map((item,index) => (
          <article key={item.id} className={'about-gallery-admin-row '+(item.visible ? '' : 'is-hidden')} role="row" data-photo-number={item.photoNumber}>
            <button type="button" className="about-gallery-admin-thumb" onClick={() => setPreviewIndex(index)} aria-label={'Preview '+item.titleEn}>
              <SafeImage src={resolveAboutGalleryMedia(item).card} alt={item.titleEn || ''} loading="lazy" />
            </button>
            <div className="about-gallery-admin-primary"><strong>{item.titleEn}</strong><small>{item.descriptionEn || 'No description'}</small></div>
            <div className="about-gallery-admin-secondary"><span>{item.locationEn || '—'}</span><small>{item.captionEn || '—'}</small></div>
            <span className={'admin-visibility-toggle '+(item.visible ? 'is-visible' : '')}>{item.visible ? 'Visible' : 'Hidden'}</span>
            <span>{item.visible ? item.sortOrder : '—'}</span><span className="admin-note">Read only</span>
          </article>
        ))}
      </div>
      <AboutGalleryLightbox items={items} index={previewIndex} locale="en-US" allowDownload onClose={() => setPreviewIndex(null)} onChange={setPreviewIndex} />
    </section>
  )
}
