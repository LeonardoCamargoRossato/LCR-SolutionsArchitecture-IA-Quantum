
import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const CONTACT_EMAIL = 'leo.c.rossato@gmail.com'

export function ContactForm() {
  const { t } = useI18n()
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const subject = encodeURIComponent(
      form.subject.trim() || `Portfolio contact — ${form.name.trim()}`,
    )
    const body = encodeURIComponent(
      `${form.message.trim()}\n\nName: ${form.name.trim()}\nEmail: ${form.email.trim()}`,
    )

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        <span>{t('name')}</span>
        <input
          required
          autoComplete="name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </label>

      <label>
        <span>{t('email')}</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </label>

      <label className="contact-form-wide">
        <span>{t('subject')}</span>
        <input
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
        />
      </label>

      <label className="contact-form-wide">
        <span>{t('message')}</span>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
        />
      </label>

      <div className="contact-form-wide contact-form-actions">
        <button className="button" type="submit">{t('sendMessage')} ↗</button>
        <small>{t('contactNote')}</small>
      </div>
    </form>
  )
}
