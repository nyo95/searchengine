'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { type CreateProjectRequest, type UpdateProjectRequest } from '@/services/projectService'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientName: z.string().optional(),
  status: z.enum(['PLANNING', 'ONGOING', 'DONE']).default('PLANNING'),
  budget: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined)),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ProjectForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Submit' }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      clientName: defaultValues?.clientName || '',
      status: defaultValues?.status || 'PLANNING',
      budget: defaultValues?.budget ? String(defaultValues.budget) : '',
    },
  })

  const handleSubmit = async (data: ProjectFormValues) => {
    const cleanedData = {
      name: data.name,
      clientName: data.clientName || undefined,
      status: data.status,
      budget: data.budget ?? null,
    }
    await onSubmit(cleanedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Client name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 50000000" type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
