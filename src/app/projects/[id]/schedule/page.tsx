'use client'

import { ProjectScheduleTab } from '@/components/projects/project-schedule-tab'

type ScheduleParams = {
  params: {
    id: string
  }
}

export default function ProjectScheduleDetailPage({ params }: ScheduleParams) {
  const USER_ID = 'anonymous'
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Schedule Items – Project {params.id}</h1>
          <p className="text-sm text-muted-foreground">
            Fokus eksekusi: cek prefix/kode, ubah unit, atau swap kode antar material yang valid.
          </p>
        </header>
        <ProjectScheduleTab userId={USER_ID} initialScheduleId={params.id} />
      </div>
    </div>
  )
}
