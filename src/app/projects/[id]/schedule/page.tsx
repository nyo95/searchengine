import { use } from 'react'
import { ProjectScheduleClient } from '@/components/projects/project-schedule-client'

type PageParams = { id: string }
type PageProps = { params: Promise<PageParams> }

export default function ProjectSchedulePage({ params }: PageProps) {
  const { id } = use(params)
  return <ProjectScheduleClient scheduleId={id} />
}
