import type { Project } from '../domain/models/Project'
import { ProjectCard } from './ProjectCard'

export function MoreProjectCard({ project }: { project: Project }) {
  return <ProjectCard project={project} variant="compact" />
}
