import type { Project } from '../domain/models/Project'
import { ProjectCard } from './ProjectCard'

export function MoreProjectCard({ project, revealDelay = 0 }: { project: Project; revealDelay?: number }) {
  return <ProjectCard project={project} variant="compact" reveal="left" revealDelay={revealDelay} />
}
