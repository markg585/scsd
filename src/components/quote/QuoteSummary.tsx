// src/components/quote/QuoteSummary.tsx

'use client';

import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LabourQuoteLine,
  EquipmentQuoteLine,
  MaterialQuoteLine,
} from '@/types/quote';

interface Props {
  labour: LabourQuoteLine[];
  equipment: EquipmentQuoteLine[];
  materials: MaterialQuoteLine[];
  onSave: () => void;
}

export default function QuoteSummary({
  labour,
  equipment,
  materials,
  onSave,
}: Props) {
  const [markup, setMarkup] = useState('0');

  const totals = useMemo(() => {
    const parseSafe = (value: number) => (isNaN(value) ? 0 : value);

    const labourTotal = labour.reduce(
      (sum, item) => sum + parseSafe(item.total),
      0
    );
    const equipmentTotal = equipment.reduce(
      (sum, item) => sum + parseSafe(item.total),
      0
    );
    const materialTotal = materials.reduce(
      (sum, item) => sum + parseSafe(item.charge),
      0
    );

    const costTotal = labourTotal + equipmentTotal + materialTotal;
    const markupRate = parseFloat(markup) / 100;
    const markupAmount = costTotal * markupRate;
    const subtotal = costTotal + markupAmount;
    const gst = subtotal * 0.1;
    const grandTotal = subtotal + gst;
    const profit = markupAmount;
    const margin = subtotal > 0 ? (profit / subtotal) * 100 : 0;

    return {
      labourTotal,
      equipmentTotal,
      materialTotal,
      costTotal,
      markupAmount,
      subtotal,
      gst,
      grandTotal,
      profit,
      margin,
    };
  }, [labour, equipment, materials, markup]);

  return (
    <div className="border-t pt-6 mt-10 space-y-4">
      <div className="max-w-sm">
        <Label>Markup (%)</Label>
        <Input
          type="number"
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
          placeholder="e.g. 20"
        />
      </div>

      <div className="text-right space-y-1">
        <p className="text-sm text-muted-foreground">
          Subtotal:{' '}
          <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          GST (10%):{' '}
          <span className="font-medium">${totals.gst.toFixed(2)}</span>
        </p>
        <p className="text-lg font-bold">
          Total: ${totals.grandTotal.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground italic">
          Cost Base: ${totals.costTotal.toFixed(2)} | Profit: $
          {totals.profit.toFixed(2)} | Margin: {totals.margin.toFixed(1)}%
        </p>
      </div>

      <Button className="w-full" onClick={onSave}>
        Save Quote
      </Button>
    </div>
  );
}
