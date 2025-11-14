import { ProjectScheduleClient } from '@/components/projects/project-schedule-client'

type PageProps = { params: { id: string } }

export default function ProjectSchedulePage({ params }: PageProps) {
  return <ProjectScheduleClient scheduleId={params.id} />
}
