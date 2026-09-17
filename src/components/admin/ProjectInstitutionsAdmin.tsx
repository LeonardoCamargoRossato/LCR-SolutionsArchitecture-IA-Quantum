import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  mediaService,
  projectInstitutionService,
} from '../../bootstrap/services'
import type {
  ProjectInstitution,
  ProjectInstitutionSource,
} from '../../domain/models/ProjectInstitution'
import { humanizeError } from '../../utils/errors'
import { useToast } from '../../providers/ToastProvider'

export function ProjectInstitutionsAdmin({
  projectId,
  projectSource,
}: {
  projectId: string
  projectSource: ProjectInstitutionSource
}) {
  const toast = useToast()
  const [items, setItems] = useState<ProjectInstitution[]>([])
  const [editing, setEditing] = useState<ProjectInstitution>()
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      setItems(await projectInstitutionService.getAdmin(projectId, projectSource))
    } catch (error) {
      toast.error('Could not load project institutions.', humanizeError(error))
    }
  }

  useEffect(() => {
    void load()
  }, [projectId, projectSource])

  const ordered = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  )

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    let asset
    try {
      mediaService.validateImage(file)
      const prefix = projectSource === 'projects'
        ? `projects/${projectId}/institutions`
        : `more-projects/${projectId}/institutions`
      asset = await mediaService.upload(file, 'Icons', prefix)

      const created = await projectInstitutionService.create({
        projectId,
        projectSource,
        institutionName: file.name.replace(/\.[^.]+$/, ''),
        institutionLogoUrl: asset.url,
        institutionUrl: undefined,
        sortOrder: ordered.length + 1,
        visible: true,
      })
      setItems((current) => [...current, created])
      setEditing(created)
      toast.success('Institution logo uploaded.')
    } catch (error) {
      if (asset) await mediaService.delete(asset).catch(() => undefined)
      toast.error('Could not upload institution logo.', humanizeError(error))
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!editing) return
    setBusy(true)
    try {
      const updated = await projectInstitutionService.update({
        ...editing,
        institutionName: editing.institutionName.trim(),
        sortOrder: Math.max(1, Math.round(editing.sortOrder || 1)),
      })
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditing(updated)
      toast.success('Institution saved.')
    } catch (error) {
      toast.error('Could not save institution.', humanizeError(error))
    } finally {
      setBusy(false)
    }
  }

  const persistOrder = async (next: ProjectInstitution[]) => {
    const normalized = next.map((item, index) => ({ ...item, sortOrder: index + 1 }))
    setItems(normalized)
    await projectInstitutionService.reorder(
      normalized.map((item) => ({ id: item.id, sortOrder: item.sortOrder })),
    )
  }

  const move = async (item: ProjectInstitution, direction: -1 | 1) => {
    const next = [...ordered]
    const index = next.findIndex((candidate) => candidate.id === item.id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await persistOrder(next)
    } catch (error) {
      await load()
      toast.error('Could not reorder institutions.', humanizeError(error))
    }
  }

  const toggleVisible = async (item: ProjectInstitution) => {
    try {
      const updated = await projectInstitutionService.update({
        ...item,
        visible: !item.visible,
      })
      setItems((current) => current.map((candidate) => candidate.id === updated.id ? updated : candidate))
    } catch (error) {
      toast.error('Could not update visibility.', humanizeError(error))
    }
  }

  const remove = async (item: ProjectInstitution) => {
    if (!window.confirm(`Delete institution "${item.institutionName}"?`)) return
    setBusy(true)
    try {
      await projectInstitutionService.delete(item.id)
      if (item.institutionLogoUrl) {
        try {
          const marker = '/storage/v1/object/public/portfolio-media/'
          const url = new URL(item.institutionLogoUrl)
          const markerIndex = url.pathname.indexOf(marker)
          const storagePath = markerIndex >= 0
            ? decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
            : undefined

          if (storagePath) {
            await mediaService.delete({
              id: storagePath,
              url: item.institutionLogoUrl,
              path: storagePath,
              name: item.institutionName,
              mimeType: 'image/*',
              category: 'Icons',
            })
          }
        } catch (error) {
          console.warn('Institution record deleted; Storage cleanup failed.', error)
        }
      }
      const remaining = ordered.filter((candidate) => candidate.id !== item.id)
      await persistOrder(remaining)
      if (editing?.id === item.id) setEditing(undefined)
      toast.success('Institution deleted.')
    } catch (error) {
      toast.error('Could not delete institution.', humanizeError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="form-section project-institutions-admin">
      <div className="project-institutions-admin-header">
        <div>
          <h2>Case-related Institutions</h2>
          <p className="admin-note">Ícones / Instituições vinculadas ao Case</p>
        </div>
        <label className="button button-secondary">
          <Upload size={16} />
          {busy ? 'Uploading...' : 'Upload Logo'}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(event) => void upload(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="project-institutions-admin-list">
        {ordered.map((item) => (
          <article
            key={item.id}
            className={`project-institution-admin-row ${item.visible ? '' : 'is-hidden'}`}
          >
            <div className="project-institution-admin-logo">
              {item.institutionLogoUrl
                ? <img src={item.institutionLogoUrl} alt="" />
                : <span>{item.institutionName.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="project-institution-admin-copy">
              <strong>{item.institutionName || 'Untitled institution'}</strong>
              {item.institutionUrl && (
                <a href={item.institutionUrl} target="_blank" rel="noopener noreferrer">
                  {item.institutionUrl} <ExternalLink size={12} />
                </a>
              )}
            </div>
            <button
              type="button"
              className="button button-secondary project-institution-visibility"
              onClick={() => void toggleVisible(item)}
            >
              {item.visible ? 'Visible' : 'Hidden'}
            </button>
            <span className="project-institution-order">{item.sortOrder}</span>
            <div className="project-institution-actions">
              <button type="button" onClick={() => void move(item, -1)} aria-label="Move institution up">
                <ChevronUp size={15} />
              </button>
              <button type="button" onClick={() => void move(item, 1)} aria-label="Move institution down">
                <ChevronDown size={15} />
              </button>
              <button type="button" onClick={() => setEditing(item)}>Edit</button>
              <button type="button" onClick={() => void remove(item)} disabled={busy}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="project-institution-editor admin-card">
          <h3>Edit Institution</h3>
          <label className="form-field">
            <span>Institution Name</span>
            <input
              value={editing.institutionName}
              onChange={(event) => setEditing({ ...editing, institutionName: event.target.value })}
            />
          </label>
          <label className="form-field">
            <span>Institution URL</span>
            <input
              type="url"
              value={editing.institutionUrl ?? ''}
              onChange={(event) => setEditing({ ...editing, institutionUrl: event.target.value || undefined })}
            />
          </label>
          <label className="form-field">
            <span>Sort Order</span>
            <input
              type="number"
              min="1"
              value={editing.sortOrder}
              onChange={(event) => setEditing({
                ...editing,
                sortOrder: Math.max(1, Number(event.target.value) || 1),
              })}
            />
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={editing.visible}
              onChange={(event) => setEditing({ ...editing, visible: event.target.checked })}
            />
            Visible
          </label>
          <button className="button" type="button" onClick={() => void save()} disabled={busy}>
            <Save size={15} />
            {busy ? 'Saving...' : 'Save Institution'}
          </button>
        </div>
      )}
    </section>
  )
}
