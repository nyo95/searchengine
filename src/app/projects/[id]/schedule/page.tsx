import { redirect } from 'next/navigation'

type PageParams = { id: string }
type PageProps = { params: Promise<PageParams> }

export default async function ProjectSchedulePage({ params }: PageProps) {
  const { id } = await params
  redirect(`/?tab=schedule&scheduleId=${id}`)
}
