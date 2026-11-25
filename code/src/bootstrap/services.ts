
import { AboutGalleryService } from '../application/services/AboutGalleryService'
import { AuthService } from '../application/services/AuthService'
import { ContentService } from '../application/services/ContentService'
import { CvService } from '../application/services/CvService'
import { MediaService } from '../application/services/MediaService'
import { ProjectService } from '../application/services/ProjectService'
import { ProjectInstitutionService } from '../application/services/ProjectInstitutionService'
import { SupabaseAboutGalleryRepository } from '../infrastructure/supabase/SupabaseAboutGalleryRepository'
import { SupabaseAuthRepository } from '../infrastructure/supabase/SupabaseAuthRepository'
import { SupabaseContentRepository } from '../infrastructure/supabase/SupabaseContentRepository'
import { SupabaseMediaRepository } from '../infrastructure/supabase/SupabaseMediaRepository'
import { SupabaseProjectRepository } from '../infrastructure/supabase/SupabaseProjectRepository'
import { SupabaseProjectInstitutionRepository } from '../infrastructure/supabase/SupabaseProjectInstitutionRepository'
import { isSupabaseConfigured } from '../infrastructure/supabase/supabaseClient'

const aboutGalleryRepository = new SupabaseAboutGalleryRepository()
const authRepository = new SupabaseAuthRepository()
const contentRepository = new SupabaseContentRepository()
const projectRepository = new SupabaseProjectRepository()
const projectInstitutionRepository = new SupabaseProjectInstitutionRepository()
const mediaRepository = new SupabaseMediaRepository()

export const aboutGalleryService = new AboutGalleryService(aboutGalleryRepository)
export const authService = new AuthService(authRepository)
export const contentService = new ContentService(contentRepository)
export const projectService = new ProjectService(projectRepository)
export const projectInstitutionService = new ProjectInstitutionService(projectInstitutionRepository)
export const mediaService = new MediaService(mediaRepository)
export const cvService = new CvService(contentRepository, mediaRepository)

export const runtimeInfo = {
  supabaseConfigured: isSupabaseConfigured,
}
