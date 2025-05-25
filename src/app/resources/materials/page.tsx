// src/app/resources/materials/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Layout from '@/components/layout';

interface MaterialEntry {
  id: string;
  name: string;
  purchasePrice: number;
  type: string;
  measurementUnit: string;
  formula: string;
  supplier: string;
  notes: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MaterialEntry | null>(null);

  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [type, setType] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [formula, setFormula] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  const fetchMaterials = async () => {
    const q = query(collection(db, 'Materials'));
    const snapshot = await getDocs(q);
    const entries: MaterialEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<MaterialEntry, 'id'>;
      return { id: doc.id, ...data };
    });
    setMaterials(entries);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const clearForm = () => {
    setEditingEntry(null);
    setName('');
    setPurchasePrice('');
    setType('');
    setMeasurementUnit('');
    setFormula('');
    setSupplier('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const materialData = {
      name,
      purchasePrice: parseFloat(purchasePrice),
      type,
      measurementUnit,
      formula,
      supplier,
      notes,
      updatedAt: Timestamp.now(),
    };

    if (editingEntry) {
      await updateDoc(doc(db, 'Materials', editingEntry.id), materialData);
    } else {
      await addDoc(collection(db, 'Materials'), {
        ...materialData,
        createdAt: Timestamp.now(),
      });
    }

    clearForm();
    setOpen(false);
    fetchMaterials();
  };

  const handleEdit = (entry: MaterialEntry) => {
    setEditingEntry(entry);
    setName(entry.name);
    setPurchasePrice(entry.purchasePrice.toString());
    setType(entry.type);
    setMeasurementUnit(entry.measurementUnit);
    setFormula(entry.formula);
    setSupplier(entry.supplier);
    setNotes(entry.notes);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'Materials', id));
    fetchMaterials();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Materials</h1>
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) clearForm(); }}>
          <SheetTrigger asChild>
            <Button>+ Add Material</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingEntry ? 'Edit Material' : 'Add Material'}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <Label>Material</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Material Purchase Price</Label>
                <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
              </div>
              <div>
                <Label>Material Type</Label>
                <Input value={type} onChange={(e) => setType(e.target.value)} required />
              </div>
              <div>
                <Label>Material Measurement Unit</Label>
                <Input value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} required />
              </div>
              <div>
                <Label>Material Formula</Label>
                <Input value={formula} onChange={(e) => setFormula(e.target.value)} />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                {editingEntry ? 'Save Changes' : 'Save Material'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {materials.map((entry) => (
          <div
            key={entry.id}
            className="border rounded p-4 shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{entry.name}</p>
              <p className="text-sm text-muted-foreground">
                ${entry.purchasePrice.toFixed(2)} | {entry.type} | {entry.measurementUnit} | {entry.formula} | {entry.supplier}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(entry)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(entry.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </Layout>
  );
}