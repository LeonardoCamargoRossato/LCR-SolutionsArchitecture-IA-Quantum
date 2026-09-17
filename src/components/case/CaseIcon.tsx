import {
  Activity,
  CheckCircle2,
  CircleDot,
  Code2,
  Cpu,
  Download,
  Eye,
  FileText,
  Github,
  GraduationCap,
  Layers,
  Lightbulb,
  Monitor,
  Network,
  Plug,
  Target,
  User,
  Wifi,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  overview: Eye,
  challenge: Target,
  academic: GraduationCap,
  solution: Lightbulb,
  approach: Workflow,
  architecture: Network,
  hardware: Cpu,
  embedded: Code2,
  software: Code2,
  web: Monitor,
  integration: Plug,
  network: Wifi,
  results: CheckCircle2,
  technologies: Layers,
  github: Github,
  documentation: FileText,
  download: Download,
  role: User,
  status: CircleDot,
  activity: Activity,
}

export function CaseIcon({
  name,
  size = 18,
}: {
  name: keyof typeof iconMap | string
  size?: number
}) {
  const Icon = iconMap[name] ?? CircleDot
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
