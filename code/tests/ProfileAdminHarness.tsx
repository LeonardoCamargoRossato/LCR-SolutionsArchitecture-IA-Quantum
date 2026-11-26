import { createRoot } from 'react-dom/client'
import { AboutAdminEditor } from '../src/components/admin/AboutAdminEditor'
import { ToastProvider } from '../src/providers/ToastProvider'
import { I18nProvider } from '../src/i18n/I18nProvider'
import { defaultContent } from '../src/data/defaultContent'
import '../src/styles/theme.css'
import '../src/styles/global.css'

const stale = {
  ...defaultContent.about,
  profileImage: { ...defaultContent.about.profileImage!, url: 'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/profile/legacy-profile.jpg' },
}
createRoot(document.getElementById('root')!).render(
  <I18nProvider><ToastProvider><AboutAdminEditor initial={stale} socials={defaultContent.socialLinks}
    onDirty={() => {}} refresh={async () => {}} /></ToastProvider></I18nProvider>,
)
