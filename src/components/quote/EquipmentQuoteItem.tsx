// src/components/quote/EquipmentQuoteItem.tsx

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
import { EquipmentQuoteLine } from '@/types/quote';

interface EquipmentEntry {
  id: string;
  name: string;
  category: string;
  chargeOutRate: number;
  nightRate: number;
  ownedOrHired: 'Owned' | 'Hired';
  supplier: string;
}

interface Props {
  items: EquipmentQuoteLine[];
  setItems: (items: EquipmentQuoteLine[]) => void;
}

export default function EquipmentQuoteItem({ items, setItems }: Props) {
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requiredFor, setRequiredFor] =
    useState<EquipmentQuoteLine['requiredFor'] | ''>('');
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      const q = query(collection(db, 'Equipment'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as EquipmentEntry)
      );
      setEquipmentOptions(list);
    };
    fetchEquipment();
  }, []);

  const handleAdd = () => {
    const equipment = equipmentOptions.find((e) => e.id === selectedId);
    if (!equipment || !quantity || !requiredFor) return;

    const qty = parseFloat(quantity);
    const rate = isNight ? equipment.nightRate : equipment.chargeOutRate;
    const total = qty * rate;

    const newItem: EquipmentQuoteLine = {
      equipmentId: equipment.id,
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
          <Label>Equipment</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipmentOptions.map((equipment) => (
                <SelectItem key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quantity (hrs or uses)</Label>
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
              setRequiredFor(val as EquipmentQuoteLine['requiredFor'])
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
            + Add Equipment
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => {
            const equipment = equipmentOptions.find((e) => e.id === item.equipmentId);
            return (
              <div
                key={index}
                className="border p-3 rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{equipment?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × ${item.chargeRate.toFixed(2)} = ${item.total.toFixed(2)} |{' '}
                    {item.requiredFor} | {item.isNight ? 'Night' : 'Day'}
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
