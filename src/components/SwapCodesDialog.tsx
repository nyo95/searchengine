'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { type ScheduleItem } from '@/services/scheduleService';
import { ArrowLeftRight } from 'lucide-react';

interface SwapCodesDialogProps {
  items: ScheduleItem[];
  onSwap: (itemIdA: string, itemIdB: string) => Promise<void>;
  isLoading?: boolean;
}

export function SwapCodesDialog({ items, onSwap, isLoading }: SwapCodesDialogProps) {
  const [open, setOpen] = useState(false);
  const [itemIdA, setItemIdA] = useState<string>('');
  const [itemIdB, setItemIdB] = useState<string>('');

  const itemA = items.find((item) => item.id === itemIdA);
  const itemB = items.find((item) => item.id === itemIdB);

  const handleSwap = async () => {
    if (!itemIdA || !itemIdB || itemIdA === itemIdB) return;
    await onSwap(itemIdA, itemIdB);
    setItemIdA('');
    setItemIdB('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Swap Codes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap Schedule Codes</DialogTitle>
          <DialogDescription>
            Swap the codes between two schedule items
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Item A</Label>
            <Select value={itemIdA} onValueChange={setItemIdA}>
              <SelectTrigger>
                <SelectValue placeholder="Select first item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} - {item.product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {itemA && (
              <p className="text-sm text-muted-foreground">
                Current code: <span className="font-mono">{itemA.code}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Item B</Label>
            <Select value={itemIdB} onValueChange={setItemIdB}>
              <SelectTrigger>
                <SelectValue placeholder="Select second item" />
              </SelectTrigger>
              <SelectContent>
                {items
                  .filter((item) => item.id !== itemIdA)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} - {item.product.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {itemB && (
              <p className="text-sm text-muted-foreground">
                Current code: <span className="font-mono">{itemB.code}</span>
              </p>
            )}
          </div>

          {itemA && itemB && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-mono">{itemA.code}</span> →{' '}
                  <span className="font-mono">{itemB.code}</span>
                </p>
                <p>
                  <span className="font-mono">{itemB.code}</span> →{' '}
                  <span className="font-mono">{itemA.code}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSwap}
              disabled={isLoading || !itemIdA || !itemIdB || itemIdA === itemIdB}
            >
              {isLoading ? 'Swapping...' : 'Swap Codes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

