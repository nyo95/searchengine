'use client';

import { useState } from 'react';
import { type ScheduleItem } from '@/services/scheduleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, Save, X } from 'lucide-react';
import { type UpdateScheduleItemRequest } from '@/services/scheduleService';

interface ScheduleRowProps {
  item: ScheduleItem;
  onUpdate: (itemId: string, data: UpdateScheduleItemRequest) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ScheduleRow({
  item,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: ScheduleRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(item.code);
  const [area, setArea] = useState(item.area || '');
  const [locationNote, setLocationNote] = useState(item.locationNote || '');
  const [usageNote, setUsageNote] = useState(item.usageNote || '');

  const handleSave = async () => {
    await onUpdate(item.id, {
      code: code !== item.code ? code : undefined,
      area: area !== (item.area || '') ? area || null : undefined,
      locationNote: locationNote !== (item.locationNote || '') ? locationNote || null : undefined,
      usageNote: usageNote !== (item.usageNote || '') ? usageNote || null : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCode(item.code);
    setArea(item.area || '');
    setLocationNote(item.locationNote || '');
    setUsageNote(item.usageNote || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm"
            disabled={isUpdating}
          />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <p className="font-medium text-sm">{item.product.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.product.sku} • {item.product.brand.name}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Area"
            disabled={isUpdating}
          />
        </TableCell>
        <TableCell>
          <Input
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
            placeholder="Location note"
            disabled={isUpdating}
          />
        </TableCell>
        <TableCell>
          <Textarea
            value={usageNote}
            onChange={(e) => setUsageNote(e.target.value)}
            placeholder="Usage note"
            rows={2}
            disabled={isUpdating}
            className="resize-none"
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-sm font-medium">{item.code}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-sm">{item.product.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.product.sku} • {item.product.brand.name}
          </p>
        </div>
      </TableCell>
      <TableCell>{item.area || <span className="text-muted-foreground">-</span>}</TableCell>
      <TableCell>{item.locationNote || <span className="text-muted-foreground">-</span>}</TableCell>
      <TableCell>{item.usageNote || <span className="text-muted-foreground">-</span>}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

