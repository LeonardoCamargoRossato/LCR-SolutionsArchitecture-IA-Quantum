import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  aboutGalleryService,
  mediaService,
} from '../../bootstrap/services'
import type {
  AboutGalleryItem,
  AboutGalleryLinkType,
} from '../../domain/models/AboutGallery'
import { useToast } from '../../providers/ToastProvider'
import { humanizeError } from '../../utils/errors'
import { AboutGalleryLightbox } from '../AboutGalleryLightbox'

const STORAGE_DASHBOARD_URL =
  'https://supabase.com/dashboard/project/wdjffhfnzydudmhhekmk/storage/files/buckets/portfolio-media'
const STORAGE_ADMIN_PATH = 'portfolio-media/about/gallery/'

function blankItem(): Omit<AboutGalleryItem, 'id'> {
  return {
    imageUrl: '',
    linkType: 'none',
    visible: true,
    sortOrder: 1,
  }
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  readOnly?: boolean
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function sortAndNormalize(items: AboutGalleryItem[]) {
  return items
    .slice()
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .map((item, index) => ({ ...item, sortOrder: index + 1 }))
}

export function AboutGalleryAdmin() {
  const toast = useToast()
  const [items, setItems] = useState<AboutGalleryItem[]>([])
  const [editing, setEditing] = useState<AboutGalleryItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string>()
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AboutGalleryItem | null>(null)
  const [editorLanguage, setEditorLanguage] = useState<'en-US' | 'pt-BR'>('en-US')

  const load = async () => {
    try {
      setItems(await aboutGalleryService.getAdminAboutGallery())
    } catch (error) {
      toast.error('Could not load About Gallery.', humanizeError(error))
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const normalized = useMemo(() => sortAndNormalize(items), [items])

  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    let asset
    try {
      mediaService.validateImage(file)
      asset = await mediaService.upload(file, 'About', 'about/gallery')
      const nextOrder =
        Math.max(0, ...items.map((item) => Number(item.sortOrder) || 0)) + 1
      const fallbackTitle = file.name.replace(/\.[^.]+$/, '')
      const created = await aboutGalleryService.createAboutGalleryItem({
        ...blankItem(),
        imageUrl: asset.url,
        storagePath: asset.path,
        titleEn: fallbackTitle,
        titlePt: fallbackTitle,
        sortOrder: nextOrder,
      })
      setItems((current) => [...current, created])
      setEditing(created)
      toast.success('Photo uploaded to About Gallery.')
    } catch (error) {
      if (asset) await mediaService.delete(asset).catch(() => undefined)
      toast.error('Could not upload gallery photo.', humanizeError(error))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!editing) return
    setBusyId(editing.id)
    try {
      const updated = await aboutGalleryService.updateAboutGalleryItem({
        ...editing,
        sortOrder: Math.max(1, Math.round(Number(editing.sortOrder) || 1)),
      })
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setEditing(updated)
      toast.success('Gallery item saved.')
    } catch (error) {
      toast.error('Could not save gallery item.', humanizeError(error))
    } finally {
      setBusyId(undefined)
    }
  }

  const persistOrder = async (next: AboutGalleryItem[]) => {
    const normalizedNext = sortAndNormalize(next)
    setItems(normalizedNext)
    await aboutGalleryService.reorderAboutGallery(
      normalizedNext.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
      })),
    )
  }

  const move = async (item: AboutGalleryItem, direction: -1 | 1) => {
    const list = [...normalized]
    const index = list.findIndex((candidate) => candidate.id === item.id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    try {
      await persistOrder(
        list.map((candidate, nextIndex) => ({
          ...candidate,
          sortOrder: nextIndex + 1,
        })),
      )
      toast.success('Gallery order updated.')
    } catch (error) {
      await load()
      toast.error('Could not reorder gallery.', humanizeError(error))
    }
  }

  const updateOrder = async (item: AboutGalleryItem, nextOrder: number) => {
    const list = normalized.filter((candidate) => candidate.id !== item.id)
    const safeOrder = Math.min(
      normalized.length,
      Math.max(1, Math.round(nextOrder || 1)),
    )
    list.splice(safeOrder - 1, 0, { ...item, sortOrder: safeOrder })
    try {
      await persistOrder(list)
      toast.success('Gallery order updated.')
    } catch (error) {
      await load()
      toast.error('Could not reorder gallery.', humanizeError(error))
    }
  }

  const toggleVisibility = async (item: AboutGalleryItem) => {
    const next = { ...item, visible: !item.visible }
    setBusyId(item.id)
    try {
      const updated = await aboutGalleryService.updateAboutGalleryItem(next)
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? updated : candidate,
        ),
      )
      if (editing?.id === item.id) setEditing(updated)
      toast.success(updated.visible ? 'Photo is visible.' : 'Photo is hidden.')
    } catch (error) {
      toast.error('Could not update visibility.', humanizeError(error))
    } finally {
      setBusyId(undefined)
    }
  }

  const deleteItem = async (item: AboutGalleryItem) => {
    setBusyId(item.id)
    try {
      await aboutGalleryService.deleteAboutGalleryItem(item.id)
      if (item.storagePath) {
        await mediaService
          .delete({
            id: item.storagePath,
            url: item.imageUrl,
            path: item.storagePath,
            name: item.titleEn || item.titlePt || 'about-gallery-image',
            mimeType: 'image/*',
            category: 'About',
          })
          .catch((error) =>
            console.warn(
              'Gallery record deleted, but Storage cleanup failed.',
              error,
            ),
          )
      }
      const remaining = items.filter(
        (candidate) => candidate.id !== item.id,
      )
      await persistOrder(remaining)
      if (editing?.id === item.id) setEditing(null)
      setConfirmDelete(null)
      toast.success('Gallery item deleted.')
    } catch (error) {
      toast.error('Could not delete gallery item.', humanizeError(error))
    } finally {
      setBusyId(undefined)
    }
  }

  const copyPath = async (path?: string) => {
    if (!path) return
    try {
      await navigator.clipboard.writeText(path)
      toast.success('Storage path copied.')
    } catch {
      toast.error('Could not copy the Storage path.')
    }
  }

  const localeIsPt = editorLanguage === 'pt-BR'

  return (
    <section className="form-section about-gallery-admin">
      <div className="about-gallery-admin-heading">
        <div>
          <div className="eyebrow">04 / Gallery</div>
          <h2>About Gallery</h2>
          <div className="about-gallery-storage-meta">
            <span>Storage path:</span>
            <code>{STORAGE_ADMIN_PATH}</code>
          </div>
        </div>
        <div className="about-gallery-admin-header-actions">
          <a
            className="button button-secondary"
            href={STORAGE_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Supabase Storage <ExternalLink size={15} />
          </a>
          <label className="button">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(event) => void upload(event.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      <div className="about-gallery-admin-list" role="table">
        <div className="about-gallery-admin-list-head" role="row">
          <span>Thumbnail</span>
          <span>Title / Description</span>
          <span>Location / Caption</span>
          <span>Visibility</span>
          <span>Order</span>
          <span>Actions</span>
        </div>

        {normalized.map((item, index) => (
          <article
            key={item.id}
            className={`about-gallery-admin-row ${
              item.visible ? '' : 'is-hidden'
            }`}
            role="row"
          >
            <button
              type="button"
              className="about-gallery-admin-thumb"
              onClick={() => setPreviewIndex(index)}
              aria-label={`Preview ${item.titleEn || item.titlePt || 'gallery image'}`}
            >
              <img
                src={item.imageUrl}
                alt={item.titleEn || item.titlePt || ''}
                loading="lazy"
              />
            </button>

            <div className="about-gallery-admin-primary">
              <strong>{item.titleEn || item.titlePt || 'Untitled photo'}</strong>
              <small>
                {item.descriptionEn ||
                  item.descriptionPt ||
                  'No description'}
              </small>
            </div>

            <div className="about-gallery-admin-secondary">
              <span>{item.locationEn || item.locationPt || '—'}</span>
              <small>{item.captionEn || item.captionPt || '—'}</small>
            </div>

            <button
              type="button"
              className={`admin-visibility-toggle ${
                item.visible ? 'is-visible' : ''
              }`}
              disabled={busyId === item.id}
              onClick={() => void toggleVisibility(item)}
              aria-pressed={item.visible}
            >
              <span aria-hidden="true" />
              {item.visible ? 'Visible' : 'Hidden'}
            </button>

            <div className="about-gallery-row-order">
              <input
                aria-label="Sort order"
                type="number"
                min="1"
                max={Math.max(1, normalized.length)}
                value={item.sortOrder}
                onChange={(event) => {
                  const raw = Number(event.target.value)
                  setItems((current) =>
                    current.map((candidate) =>
                      candidate.id === item.id
                        ? {
                            ...candidate,
                            sortOrder: Number.isFinite(raw)
                              ? raw
                              : candidate.sortOrder,
                          }
                        : candidate,
                    ),
                  )
                }}
                onBlur={(event) =>
                  void updateOrder(item, Number(event.target.value) || 1)
                }
              />
              <div>
                <button
                  type="button"
                  onClick={() => void move(item, -1)}
                  disabled={index === 0}
                  aria-label="Move Up"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => void move(item, 1)}
                  disabled={index === normalized.length - 1}
                  aria-label="Move Down"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            <div className="about-gallery-row-actions">
              <button
                type="button"
                onClick={() => {
                  setEditing(item)
                  setEditorLanguage('en-US')
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-danger"
                onClick={() => setConfirmDelete(item)}
                aria-label="Delete gallery item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}

        {!normalized.length && (
          <div className="about-gallery-admin-empty">
            No gallery photos yet. Use “Upload Photo” to add the first image.
          </div>
        )}
      </div>

      {editing && (
        <>
          <button
            type="button"
            className="admin-drawer-backdrop"
            aria-label="Close gallery editor"
            onClick={() => setEditing(null)}
          />
          <aside
            className="about-gallery-editor-drawer"
            aria-label="Edit gallery photo"
          >
            <div className="about-gallery-editor-header">
              <div>
                <div className="eyebrow">Gallery Item</div>
                <h3>{editing.titleEn || editing.titlePt || 'Untitled photo'}</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditing(null)}
                aria-label="Close editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="about-gallery-editor-scroll">
              <img
                className="about-gallery-editor-image"
                src={editing.imageUrl}
                alt={editing.titleEn || editing.titlePt || ''}
              />

              <div className="about-gallery-storage-path">
                <span>Storage path</span>
                <code>{editing.storagePath || 'External image / unavailable'}</code>
                {editing.storagePath && (
                  <button
                    type="button"
                    onClick={() => void copyPath(editing.storagePath)}
                  >
                    <Copy size={14} />
                    Copy path
                  </button>
                )}
              </div>

              <div className="admin-language-tabs">
                <button
                  className={editorLanguage === 'en-US' ? 'active' : ''}
                  type="button"
                  onClick={() => setEditorLanguage('en-US')}
                >
                  EN-US
                </button>
                <button
                  className={editorLanguage === 'pt-BR' ? 'active' : ''}
                  type="button"
                  onClick={() => setEditorLanguage('pt-BR')}
                >
                  PT-BR
                </button>
              </div>

              <Field
                label={localeIsPt ? 'Title PT' : 'Title EN'}
                value={
                  localeIsPt ? editing.titlePt ?? '' : editing.titleEn ?? ''
                }
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    ...(localeIsPt ? { titlePt: value } : { titleEn: value }),
                  })
                }
              />
              <TextArea
                label={localeIsPt ? 'Description PT' : 'Description EN'}
                value={
                  localeIsPt
                    ? editing.descriptionPt ?? ''
                    : editing.descriptionEn ?? ''
                }
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    ...(localeIsPt
                      ? { descriptionPt: value }
                      : { descriptionEn: value }),
                  })
                }
              />
              <Field
                label={localeIsPt ? 'Caption PT' : 'Caption EN'}
                value={
                  localeIsPt
                    ? editing.captionPt ?? ''
                    : editing.captionEn ?? ''
                }
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    ...(localeIsPt
                      ? { captionPt: value }
                      : { captionEn: value }),
                  })
                }
              />
              <Field
                label={localeIsPt ? 'Location PT' : 'Location EN'}
                value={
                  localeIsPt
                    ? editing.locationPt ?? ''
                    : editing.locationEn ?? ''
                }
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    ...(localeIsPt
                      ? { locationPt: value }
                      : { locationEn: value }),
                  })
                }
              />

              <div className="form-columns">
                <Field
                  label="Event Date"
                  type="date"
                  value={editing.eventDate ?? ''}
                  onChange={(value) =>
                    setEditing({ ...editing, eventDate: value })
                  }
                />
                <label className="form-field">
                  <span>Link Type</span>
                  <select
                    value={editing.linkType}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        linkType: event.target.value as AboutGalleryLinkType,
                      })
                    }
                  >
                    <option value="none">No Link</option>
                    <option value="speaker_portfolio">Speaker Portfolio</option>
                    <option value="instituto_pense_mais">Instituto Pense+</option>
                    <option value="custom">Custom URL</option>
                  </select>
                </label>
              </div>

              {editing.linkType === 'custom' && (
                <Field
                  label="External URL"
                  value={editing.externalUrl ?? ''}
                  onChange={(value) =>
                    setEditing({ ...editing, externalUrl: value })
                  }
                />
              )}

              <div className="form-columns">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editing.visible}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        visible: event.target.checked,
                      })
                    }
                  />
                  Visible
                </label>
                <Field
                  label="Sort Order"
                  type="number"
                  value={String(editing.sortOrder)}
                  onChange={(value) =>
                    setEditing({
                      ...editing,
                      sortOrder: Math.max(1, Number(value) || 1),
                    })
                  }
                />
              </div>
            </div>

            <div className="about-gallery-editor-footer">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="button"
                type="button"
                disabled={busyId === editing.id}
                onClick={() => void save()}
              >
                <Save size={16} />
                {busyId === editing.id ? 'Saving...' : 'Save Photo'}
              </button>
            </div>
          </aside>
        </>
      )}

      {confirmDelete && (
        <div className="admin-confirm-backdrop" role="presentation">
          <div className="admin-confirm-dialog" role="dialog" aria-modal="true">
            <h3>Are you sure?</h3>
            <p>
              This removes the database record and, when possible, the original
              file from Supabase Storage.
            </p>
            <div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button admin-danger-button"
                disabled={busyId === confirmDelete.id}
                onClick={() => void deleteItem(confirmDelete)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AboutGalleryLightbox
        items={normalized}
        index={previewIndex}
        locale="en-US"
        allowDownload
        onClose={() => setPreviewIndex(null)}
        onChange={setPreviewIndex}
      />
    </section>
  )
}
