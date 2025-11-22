"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from "@/hooks/useBrands";
import { Loader2, Save, Trash2 } from "lucide-react";

export default function AdminBrandsPage() {
  const { data: brands, isLoading, refetch } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()

  const [form, setForm] = useState({ name: '', salesContactName: '', salesContactPhone: '' })

  const handleCreate = async () => {
    await createBrand.mutateAsync(form)
    setForm({ name: '', salesContactName: '', salesContactPhone: '' })
    refetch()
  }

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Brand</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Brand name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Sales contact name"
              value={form.salesContactName}
              onChange={(e) => setForm((p) => ({ ...p, salesContactName: e.target.value }))}
            />
            <Input
              placeholder="Sales contact phone"
              value={form.salesContactPhone}
              onChange={(e) => setForm((p) => ({ ...p, salesContactPhone: e.target.value }))}
            />
            <div className="md:col-span-3 flex justify-end">
              <Button onClick={handleCreate} disabled={createBrand.isPending}>
                {createBrand.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Brand
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sales Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(brands || []).map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <Input
                            defaultValue={brand.name}
                            onBlur={(e) =>
                              updateBrand.mutateAsync({ id: brand.id, data: { name: e.target.value } }).then(refetch)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={brand.salesContactName}
                            onBlur={(e) =>
                              updateBrand
                                .mutateAsync({ id: brand.id, data: { salesContactName: e.target.value } })
                                .then(refetch)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={brand.salesContactPhone}
                            onBlur={(e) =>
                              updateBrand
                                .mutateAsync({ id: brand.id, data: { salesContactPhone: e.target.value } })
                                .then(refetch)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive gap-2"
                            onClick={() => deleteBrand.mutateAsync(brand.id).then(refetch)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
