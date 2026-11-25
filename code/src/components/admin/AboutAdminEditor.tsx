import { ExternalLink, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { contentService, mediaService } from '../../bootstrap/services'
import type { AboutContent, AboutContentBlock } from '../../domain/models/About'
import type { SocialLink } from '../../domain/models/SiteContent'
import { humanizeError } from '../../utils/errors'
import { useToast } from '../../providers/ToastProvider'
import { ImageUploader } from './ImageUploader'
import { AboutGalleryAdmin } from './AboutGalleryAdmin'

type EditLocale = 'en-US' | 'pt-BR'

function LanguageTabs({
  value,
  onChange,
}: {
  value: EditLocale
  onChange: (value: EditLocale) => void
}) {
  return (
    <div className="admin-language-tabs">
      <button
        className={value === 'en-US' ? 'active' : ''}
        onClick={() => onChange('en-US')}
        type="button"
      >
        EN-US
      </button>
      <button
        className={value === 'pt-BR' ? 'active' : ''}
        onClick={() => onChange('pt-BR')}
        type="button"
      >
        PT-BR
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  className = '',
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  rows?: number
}) {
  return (
    <label className={`form-field ${className}`.trim()}>
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function bioToText(value: unknown): string {
  return Array.isArray(value)
    ? value.filter((paragraph): paragraph is string => typeof paragraph === 'string').join('\n\n')
    : ''
}

function textToBio(value: string): string[] {
  return value
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function nextBlockOrder(blocks: AboutContentBlock[]) {
  return Math.max(0, ...blocks.map((block) => Number(block.order) || 0)) + 1
}

function createBlock(blocks: AboutContentBlock[]): AboutContentBlock {
  return {
    id: `about-block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    titlePt: '',
    titleEn: '',
    contentPt: '',
    contentEn: '',
    order: nextBlockOrder(blocks),
    visible: true,
  }
}

export function AboutAdminEditor({
  initial,
  socials,
  cvUrl,
  onDirty,
  refresh,
}: {
  initial: AboutContent
  socials: SocialLink[]
  cvUrl?: string
  onDirty: (value: boolean) => void
  refresh: () => Promise<void>
}) {
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [locale, setLocale] = useState<EditLocale>('en-US')
  const toast = useToast()

  useEffect(() => setValue(initial), [initial])

  const translated = value.translations?.['pt-BR'] ?? {}
  const current = locale === 'en-US'
    ? value
    : { ...value, ...translated }

  const bioText = useMemo(
    () => bioToText(locale === 'en-US' ? value.bio : translated.bio ?? value.bio),
    [locale, translated.bio, value.bio],
  )

  const changeLocalized = (patch: Partial<AboutContent>) => {
    if (locale === 'en-US') {
      setValue((currentValue) => ({ ...currentValue, ...patch }))
    } else {
      setValue((currentValue) => ({
        ...currentValue,
        translations: {
          ...currentValue.translations,
          'pt-BR': {
            ...(currentValue.translations?.['pt-BR'] ?? {}),
            ...patch,
          },
        },
      }))
    }
    onDirty(true)
  }

  const save = async () => {
    setBusy(true)
    try {
      await contentService.saveAbout(value)
      await refresh()
      onDirty(false)
      toast.success('About updated successfully.')
    } catch (error) {
      toast.error('Could not save About.', humanizeError(error))
    } finally {
      setBusy(false)
    }
  }

  const saveImage = async (file: File) => {
    setBusy(true)
    let asset
    try {
      mediaService.validateImage(file)
      asset = await mediaService.upload(file, 'About', 'profile')
      const old = value.profileImage
      const next = { ...value, profileImage: asset }
      await contentService.saveAbout(next)
      setValue(next)
      onDirty(false)
      await refresh()
      if (old) {
        mediaService.delete(old).catch((error) =>
          console.warn('Old media cleanup failed.', error),
        )
      }
      toast.success('Profile image saved.')
    } catch (error) {
      if (asset) await mediaService.delete(asset).catch(() => undefined)
      toast.error('Could not upload profile image.', humanizeError(error))
      throw error
    } finally {
      setBusy(false)
    }
  }

  const removeImage = async () => {
    setBusy(true)
    try {
      const old = value.profileImage
      const next = { ...value, profileImage: undefined }
      await contentService.saveAbout(next)
      setValue(next)
      onDirty(false)
      await refresh()
      if (old) await mediaService.delete(old).catch(() => undefined)
      toast.success('Profile image removed.')
    } catch (error) {
      toast.error('Could not remove profile image.', humanizeError(error))
    } finally {
      setBusy(false)
    }
  }

  const blocks = Array.isArray(value.contentBlocks) ? value.contentBlocks : []

  const updateBlock = (id: string, patch: Partial<AboutContentBlock>) => {
    setValue((currentValue) => ({
      ...currentValue,
      contentBlocks: (currentValue.contentBlocks ?? []).map((block) =>
        block.id === id ? { ...block, ...patch } : block,
      ),
    }))
    onDirty(true)
  }

  const addBlock = () => {
    setValue((currentValue) => {
      const currentBlocks = Array.isArray(currentValue.contentBlocks)
        ? currentValue.contentBlocks
        : []
      return {
        ...currentValue,
        contentBlocks: [...currentBlocks, createBlock(currentBlocks)],
      }
    })
    onDirty(true)
  }

  const removeBlock = (id: string) => {
    setValue((currentValue) => ({
      ...currentValue,
      contentBlocks: (currentValue.contentBlocks ?? []).filter(
        (block) => block.id !== id,
      ),
    }))
    onDirty(true)
  }

  return (
    <div className="admin-form cms-form about-admin-editor">
      <section className="form-section about-admin-profile">
        <div className="admin-section-heading">
          <div>
            <div className="eyebrow">01 / Profile</div>
            <h2>Profile</h2>
          </div>
          {cvUrl && (
            <a
              className="button button-secondary"
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={16} />
              Current CV
            </a>
          )}
        </div>

        <div className="about-admin-profile-grid">
          <div>
            <ImageUploader
              label="Profile Image"
              currentUrl={value.profileImage?.url}
              busy={busy}
              onSave={saveImage}
              onRemove={value.profileImage ? removeImage : undefined}
            />
          </div>

          <div className="about-admin-profile-fields">
            <LanguageTabs value={locale} onChange={setLocale} />
            <div className="form-columns">
              <Field
                label="Name"
                value={current.name ?? ''}
                onChange={(next) => changeLocalized({ name: next })}
              />
              <Field
                label="Email"
                type="email"
                value={current.email ?? ''}
                onChange={(next) => changeLocalized({ email: next })}
              />
            </div>
            <Field
              label="Professional Title"
              value={current.professionalTitle ?? current.headline ?? ''}
              onChange={(next) =>
                changeLocalized({
                  professionalTitle: next,
                  headline: next,
                })
              }
            />
            <p className="admin-note">
              CV upload/replacement remains available in the dedicated CV section.
            </p>
          </div>
        </div>
      </section>

      <section className="form-section about-admin-content">
        <div className="admin-section-heading">
          <div>
            <div className="eyebrow">02 / Content</div>
            <h2>About Content</h2>
          </div>
          <LanguageTabs value={locale} onChange={setLocale} />
        </div>

        <Field
          label="About Title"
          value={current.title ?? ''}
          onChange={(next) => changeLocalized({ title: next })}
        />

        <TextArea
          label={locale === 'pt-BR' ? 'Intro — PT-BR' : 'Intro — EN-US'}
          value={current.intro ?? ''}
          onChange={(next) => changeLocalized({ intro: next })}
          rows={4}
        />

        <TextArea
          label={locale === 'pt-BR' ? 'Bio — PT-BR' : 'Bio — EN-US'}
          value={bioText}
          onChange={(next) => changeLocalized({ bio: textToBio(next) })}
          className="about-bio-main-editor"
          rows={12}
        />
        <p className="admin-note about-bio-note">
          Separate paragraphs with one blank line. Existing paragraphs are preserved
          as individual paragraphs when saved.
        </p>

        <TextArea
          label={
            locale === 'pt-BR'
              ? 'Value Proposition — PT-BR'
              : 'Value Proposition — EN-US'
          }
          value={current.valueProposition ?? ''}
          onChange={(next) => changeLocalized({ valueProposition: next })}
          rows={4}
        />

        <div className="about-content-blocks">
          <div className="admin-section-heading compact">
            <div>
              <h3>Additional Content Blocks</h3>
              <p className="admin-note">
                Optional editorial blocks stored with About content. They do not
                replace the main Bio.
              </p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={addBlock}
            >
              <Plus size={16} />
              + Add content block
            </button>
          </div>

          {blocks
            .slice()
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((block) => (
              <article key={block.id} className="about-content-block-editor">
                <div className="about-content-block-toolbar">
                  <strong>Block {block.order}</strong>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={block.visible}
                      onChange={(event) =>
                        updateBlock(block.id, { visible: event.target.checked })
                      }
                    />
                    Visible
                  </label>
                  <label className="form-field inline-field">
                    <span>Order</span>
                    <input
                      type="number"
                      min="1"
                      value={block.order}
                      onChange={(event) =>
                        updateBlock(block.id, {
                          order: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
                    />
                  </label>
                  <button
                    className="icon-button text-danger"
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    aria-label="Delete content block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="form-columns">
                  <Field
                    label="Title EN"
                    value={block.titleEn ?? ''}
                    onChange={(next) => updateBlock(block.id, { titleEn: next })}
                  />
                  <Field
                    label="Title PT"
                    value={block.titlePt ?? ''}
                    onChange={(next) => updateBlock(block.id, { titlePt: next })}
                  />
                </div>
                <div className="form-columns">
                  <TextArea
                    label="Content EN"
                    value={block.contentEn ?? ''}
                    onChange={(next) =>
                      updateBlock(block.id, { contentEn: next })
                    }
                    rows={6}
                  />
                  <TextArea
                    label="Content PT"
                    value={block.contentPt ?? ''}
                    onChange={(next) =>
                      updateBlock(block.id, { contentPt: next })
                    }
                    rows={6}
                  />
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="form-section">
        <div className="admin-section-heading">
          <div>
            <div className="eyebrow">03 / Social Links</div>
            <h2>Social Links</h2>
          </div>
          <span className="admin-note">Managed in Social Links</span>
        </div>
        <div className="about-admin-social-summary">
          {[...socials]
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((social) => (
              <a
                key={social.id}
                href={social.url}
                target={social.url.startsWith('http') ? '_blank' : undefined}
                rel={
                  social.url.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className={social.visible ? '' : 'is-hidden'}
              >
                <span>{social.platform}</span>
                <small>{social.label}</small>
                <ExternalLink size={13} />
              </a>
            ))}
        </div>
      </section>

      <div className="about-admin-savebar">
        <button
          className="button admin-save"
          disabled={busy}
          onClick={() => void save()}
        >
          <Save size={16} />
          {busy ? 'Saving...' : 'Save About'}
        </button>
      </div>

      <AboutGalleryAdmin />
    </div>
  )
}
