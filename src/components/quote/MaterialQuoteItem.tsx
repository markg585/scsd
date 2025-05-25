// src/components/quote/MaterialQuoteItem.tsx

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
import { MaterialQuoteLine } from '@/types/quote';

interface MaterialEntry {
  id: string;
  name: string;
  purchasePrice: number;
  type: 'Bitumen' | 'Asphalt' | 'Roadbase' | 'Stone';
  measurementUnit: string;
  supplier: string;
  formula?: number;
}

interface Props {
  items: MaterialQuoteLine[];
  setItems: (items: MaterialQuoteLine[]) => void;
}

export default function MaterialQuoteItem({ items, setItems }: Props) {
  const [materials, setMaterials] = useState<MaterialEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [sqm, setSqm] = useState('');
  const [depth, setDepth] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      const q = query(collection(db, 'Materials'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MaterialEntry)
      );
      setMaterials(list);
    };
    fetchMaterials();
  }, []);

  const calculateQuantity = (
    type: string,
    sqm: number,
    depth: number,
    formula: number
  ): number => {
    if (type === 'Bitumen') return (sqm * depth) / formula;
    if (type === 'Asphalt' || type === 'Roadbase') return sqm * depth * formula;
    if (type === 'Stone') return (sqm / depth) * formula;
    return 0;
  };

  const getLabel = (type: string) => {
    return type === 'Bitumen' || type === 'Stone' ? 'spray rate' : 'depth';
  };

  const getUnit = (type: string) => {
    return type === 'Bitumen' ? 'litres' : 'tonnes';
  };

  const handleAdd = () => {
    const mat = materials.find((m) => m.id === selectedId);
    if (!mat || !sqm || !depth || !sellPrice) return;

    const sqmValue = parseFloat(sqm);
    const depthValue = parseFloat(depth);
    const priceValue = parseFloat(sellPrice);
    const formula = mat.formula ?? 1;

    const quantity = calculateQuantity(mat.type, sqmValue, depthValue, formula);
    const charge = quantity * priceValue;

    const newItem: MaterialQuoteLine = {
      materialId: mat.id,
      materialType: mat.type,
      sqm: sqmValue,
      depth: depthValue,
      quantity,
      sellPrice: priceValue,
      charge,
    };

    setItems([...items, newItem]);
    setSelectedId('');
    setSqm('');
    setDepth('');
    setSellPrice('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 items-end">
        <div>
          <Label>Material</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((mat) => (
                <SelectItem key={mat.id} value={mat.id}>
                  {mat.name} ({mat.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sqm</Label>
          <Input
            type="number"
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
          />
        </div>
        <div>
          <Label>Spray Rate / Depth</Label>
          <Input
            type="number"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
          />
        </div>
        <div>
          <Label>Sell Price ($)</Label>
          <Input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </div>
        <div>
          <Button type="button" onClick={handleAdd} className="mt-1 w-full">
            + Add Material
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => {
            const mat = materials.find((m) => m.id === item.materialId);
            const label = getLabel(item.materialType);
            const unit = getUnit(item.materialType);
            return (
              <div
                key={index}
                className="border p-3 rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{mat?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.materialType} | {item.sqm} m² @ {item.depth} {label} →{' '}
                    {item.quantity.toFixed(2)} {unit} × ${item.sellPrice.toFixed(2)} = ${item.charge.toFixed(2)}
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
