// src/components/quote/LabourQuoteItem.tsx

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LabourQuoteLine } from '@/types/quote';

interface LabourEntry {
  id: string;
  name: string;
  role: string;
  costRate: number;
  chargeOutRate: number;
  nightRate: number;
}

interface Props {
  items: LabourQuoteLine[];
  setItems: (items: LabourQuoteLine[]) => void;
}

export default function LabourQuoteItem({ items, setItems }: Props) {
  const [labourOptions, setLabourOptions] = useState<LabourEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requiredFor, setRequiredFor] =
    useState<LabourQuoteLine['requiredFor'] | ''>('');
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const fetchLabour = async () => {
      const q = query(collection(db, 'Labour'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as LabourEntry)
      );
      setLabourOptions(list);
    };
    fetchLabour();
  }, []);

  const handleAdd = () => {
    const labour = labourOptions.find((l) => l.id === selectedId);
    if (!labour || !quantity || !requiredFor) return;

    const qty = parseFloat(quantity);
    const rate = isNight ? labour.nightRate : labour.chargeOutRate;
    const total = qty * rate;

    const newItem: LabourQuoteLine = {
      labourId: labour.id,
      quantity: qty,
      chargeRate: rate,
      total,
      requiredFor,
      isNight,
    };

    setItems([...items, newItem]);
    setSelectedId('');
    setQuantity('');
    setRequiredFor('');
    setIsNight(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 items-end">
        <div>
          <Label>Labour</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select labour" />
            </SelectTrigger>
            <SelectContent>
              {labourOptions.map((labour) => (
                <SelectItem key={labour.id} value={labour.id}>
                  {labour.name} ({labour.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantity (hrs)</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Required For</Label>
          <Select
            value={requiredFor}
            onValueChange={(val) =>
              setRequiredFor(val as LabourQuoteLine['requiredFor'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Preparation">Preparation</SelectItem>
              <SelectItem value="Seal">Seal</SelectItem>
              <SelectItem value="Asphalt">Asphalt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="pt-6">
          <Label className="block mb-1">Night Work</Label>
          <Checkbox checked={isNight} onCheckedChange={(v) => setIsNight(!!v)} />
        </div>
        <div>
          <Button type="button" onClick={handleAdd} className="mt-1 w-full">
            + Add Labour
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => {
            const labour = labourOptions.find((l) => l.id === item.labourId);
            return (
              <div
                key={index}
                className="border p-3 rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {labour?.name} ({labour?.role})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} hrs – {item.requiredFor} –{' '}
                    {item.isNight ? 'Night' : 'Day'} – ${item.chargeRate.toFixed(2)} = $
                    {item.total.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
