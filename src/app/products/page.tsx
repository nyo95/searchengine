import { redirect } from 'next/navigation'

export default function ProductsEntry() {
  // Redirect legacy /products entry to home; editor removed per spec
  redirect('/')
}
