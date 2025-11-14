import { redirect } from 'next/navigation'

export default function ProductEditorRedirect({ params }: { params: { id: string } }) {
  // Redirect legacy editor route to product detail page
  redirect(`/product/${params.id}`)
}
