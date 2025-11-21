'use client';

import { type ScheduleItem } from '@/services/scheduleService';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScheduleRow } from './ScheduleRow';
import { type UpdateScheduleItemRequest } from '@/services/scheduleService';

interface ScheduleTableProps {
  items: ScheduleItem[];
  onUpdate: (itemId: string, data: UpdateScheduleItemRequest) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ScheduleTable({
  items,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: ScheduleTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No schedule items yet. Add your first item to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Area</TableHead>
          <TableHead>Location Note</TableHead>
          <TableHead>Usage Note</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <ScheduleRow
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        ))}
      </TableBody>
    </Table>
  );
}

