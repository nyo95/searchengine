"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSubcategories, useCreateSubcategory, useUpdateSubcategory } from "@/hooks/useSubcategories";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { data: subcategories, refetch } = useSubcategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()

  const [form, setForm] = useState({ name: '', prefix: '', template: '[]' })

  const handleCreate = async () => {
    try {
      const templateJson = form.template ? JSON.parse(form.template) : []
      await createSubcategory.mutateAsync({ name: form.name, prefix: form.prefix, defaultAttributesTemplate: templateJson })
      setForm({ name: '', prefix: '', template: '[]' })
      refetch()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create subcategory')
    }
  }

  const handleUpdate = async (id: string, field: 'prefix' | 'defaultAttributesTemplate', value: any) => {
    await updateSubcategory.mutateAsync({ id, data: { [field]: value } })
    refetch()
  }

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Subcategory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="Prefix"
                value={form.prefix}
                onChange={(e) => setForm((p) => ({ ...p, prefix: e.target.value }))}
              />
            </div>
            <Textarea
              value={form.template}
              onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))}
              placeholder='[ { "name": "Finish", "type": "select", "options": ["Matte", "Glossy"] } ]'
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={handleCreate}>Save Subcategory</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prefix & Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Default Attributes Template</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(subcategories || []).map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell>
                        <Input
                          defaultValue={subcategory.prefix}
                          onBlur={(e) => handleUpdate(subcategory.id, 'prefix', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          defaultValue={JSON.stringify(subcategory.defaultAttributesTemplate || [], null, 2)}
                          rows={6}
                          onBlur={(e) => {
                            try {
                              const parsed = e.target.value ? JSON.parse(e.target.value) : []
                              handleUpdate(subcategory.id, 'defaultAttributesTemplate', parsed)
                            } catch (error) {
                              toast.error('Template must be valid JSON')
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
