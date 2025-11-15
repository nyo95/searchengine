'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Upload, Edit, Save, X, ExternalLink } from 'lucide-react';
import { useProjects } from '@/hooks/api/use-projects';
import { useScheduleItems } from '@/hooks/api/use-schedule-items';
import { useProducts } from '@/hooks/api/use-products';
import { useBrands } from '@/hooks/api/use-brands';
import { useProductTypes } from '@/hooks/api/use-product-types';

export function ProjectSchedule() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempBrandFilter, setTempBrandFilter] = useState<string>('');
  const [tempProductTypeFilter, setTempProductTypeFilter] = useState<string>('');
  
  const { projects, createProject } = useProjects();
  
  // Get the selected project and schedule
  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedScheduleData = selectedProjectData?.schedules.find(s => s.id === selectedSchedule);
  
  const { scheduleItems, createScheduleItem, updateScheduleItem } = useScheduleItems(selectedSchedule);
  const { products } = useProducts();
  const { brands } = useBrands();
  const { productTypes } = useProductTypes();

  const handleAddProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const newProject = await createProject({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        client: formData.get('client') as string,
        location: formData.get('location') as string,
      });
      
      setIsAddProjectDialogOpen(false);
      setSelectedProject(newProject.id);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleAddScheduleItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      await createScheduleItem({
        code: formData.get('code') as string,
        description: formData.get('description') as string,
        quantity: parseFloat(formData.get('quantity') as string) || undefined,
        unit: formData.get('unit') as string,
        notes: formData.get('notes') as string,
        productId: (formData.get('productId') as string) || undefined,
        scheduleId: selectedSchedule,
      });
      
      setIsAddItemDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create schedule item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, field: string, value: any) => {
    try {
      await updateScheduleItem(itemId, { [field]: value });
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const filteredProducts = tempBrandFilter || tempProductTypeFilter 
    ? products.filter(p => 
        (!tempBrandFilter || p.brandId === tempBrandFilter) &&
        (!tempProductTypeFilter || p.productTypeId === tempProductTypeFilter)
      )
    : products;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Projects Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project for scheduling.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input id="projectName" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input id="client" name="client" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddProjectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Project</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${
                    selectedProject === project.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedProject(project.id);
                    if (project.schedules.length > 0) {
                      setSelectedSchedule(project.schedules[0].id);
                    }
                  }}
                >
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  {project.client && <p className="text-xs text-muted-foreground">{project.client}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs capitalize">{project.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {project.schedules.reduce((sum, s) => sum + s._count.scheduleItems, 0)} items
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Schedule</CardTitle>
                <CardDescription>
                  {selectedProjectData 
                    ? `Manage materials and products for ${selectedProjectData.name}`
                    : 'Select a project to manage its schedule'
                  }
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={!selectedSchedule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Schedule Item</DialogTitle>
                      <DialogDescription>
                        Add a new item to the project schedule.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddScheduleItem} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="code">Item Code</Label>
                          <Input id="code" name="code" required />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input id="quantity" name="quantity" type="number" step="0.01" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit">Unit</Label>
                          <Input id="unit" name="unit" placeholder="pcs, m, kg, etc" />
                        </div>
                        <div>
                          <Label htmlFor="productId">Link to Product</Label>
                          <Select name="productId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select product (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Item</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedSchedule ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No project selected</p>
                <p className="text-sm text-muted-foreground">Select a project from the sidebar to manage its schedule.</p>
              </div>
            ) : scheduleItems.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No schedule items</p>
                <p className="text-sm text-muted-foreground">Add your first item to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-sm">Code</th>
                      <th className="text-left p-3 font-medium text-sm">Material Type</th>
                      <th className="text-left p-3 font-medium text-sm">Brand</th>
                      <th className="text-left p-3 font-medium text-sm">SKU</th>
                      <th className="text-left p-3 font-medium text-sm">Description</th>
                      <th className="text-left p-3 font-medium text-sm">Qty</th>
                      <th className="text-left p-3 font-medium text-sm">Unit</th>
                      <th className="text-left p-3 font-medium text-sm">Status</th>
                      <th className="text-left p-3 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm font-mono">{item.code}</td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Select 
                              value={item.product?.productType.id || ''} 
                              onValueChange={(value) => {
                                // Find a product with this product type and update productId
                                const productWithSameType = products.find(p => p.productTypeId === value);
                                if (productWithSameType) {
                                  handleUpdateItem(item.id, 'productId', productWithSameType.id);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {productTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={item.product ? '' : 'text-muted-foreground italic'}>
                              {item.product?.productType.name || 'Not selected'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Select 
                              value={item.product?.brand.id || ''} 
                              onValueChange={(value) => {
                                // Find a product with this brand and update productId
                                const productWithSameBrand = products.find(p => p.brandId === value);
                                if (productWithSameBrand) {
                                  handleUpdateItem(item.id, 'productId', productWithSameBrand.id);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select brand..." />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={item.product ? '' : 'text-muted-foreground italic'}>
                              {item.product?.brand.name || 'Not selected'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Select 
                              value={item.productId || ''} 
                              onValueChange={(value) => handleUpdateItem(item.id, 'productId', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select SKU..." />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.sku}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={item.product ? '' : 'text-muted-foreground italic'}>
                              {item.product?.sku || 'Not linked'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Input 
                              defaultValue={item.description || ''} 
                              className="w-40"
                              onBlur={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            />
                          ) : (
                            <span>{item.description || '-'}</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Input 
                              type="number"
                              defaultValue={item.quantity || ''} 
                              className="w-16"
                              onBlur={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || null)}
                            />
                          ) : (
                            <span>{item.quantity || '-'}</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {editingItem === item.id ? (
                            <Input 
                              defaultValue={item.unit || ''} 
                              className="w-16"
                              onBlur={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            />
                          ) : (
                            <span>{item.unit || '-'}</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant={item.productId ? "default" : "secondary"} className="text-xs">
                            {item.productId ? "Linked" : "Unlinked"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center space-x-1">
                            {editingItem === item.id ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingItem(item.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {item.product && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    title="View Product Details"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}