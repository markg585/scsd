// src/app/resources/equipment/page.tsx

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

interface EquipmentEntry {
  id: string;
  name: string;
  category: string;
  chargeOutRate: number;
  nightRate: number;
  ownedOrHired: 'Owned' | 'Hired';
  supplier: string;
  notes: string;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EquipmentEntry | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [chargeOutRate, setChargeOutRate] = useState('');
  const [nightRate, setNightRate] = useState('');
  const [ownedOrHired, setOwnedOrHired] = useState<'Owned' | 'Hired' | ''>('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  const fetchEquipment = async () => {
    const q = query(collection(db, 'Equipment'));
    const snapshot = await getDocs(q);
    const entries: EquipmentEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<EquipmentEntry, 'id'>;
      return { id: doc.id, ...data };
    });
    setEquipment(entries);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const clearForm = () => {
    setEditingEntry(null);
    setName('');
    setCategory('');
    setChargeOutRate('');
    setNightRate('');
    setOwnedOrHired('');
    setSupplier('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipmentData = {
      name,
      category,
      chargeOutRate: parseFloat(chargeOutRate),
      nightRate: parseFloat(nightRate),
      ownedOrHired,
      supplier,
      notes,
      updatedAt: Timestamp.now(),
    };

    if (editingEntry) {
      await updateDoc(doc(db, 'Equipment', editingEntry.id), equipmentData);
    } else {
      await addDoc(collection(db, 'Equipment'), {
        ...equipmentData,
        createdAt: Timestamp.now(),
      });
    }

    clearForm();
    setOpen(false);
    fetchEquipment();
  };

  const handleEdit = (entry: EquipmentEntry) => {
    setEditingEntry(entry);
    setName(entry.name);
    setCategory(entry.category);
    setChargeOutRate(entry.chargeOutRate.toString());
    setNightRate(entry.nightRate.toString());
    setOwnedOrHired(entry.ownedOrHired);
    setSupplier(entry.supplier);
    setNotes(entry.notes);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'Equipment', id));
    fetchEquipment();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) clearForm(); }}>
          <SheetTrigger asChild>
            <Button>+ Add Equipment</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingEntry ? 'Edit Equipment' : 'Add Equipment'}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <Label>Equipment Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Charge Out Rate ($)</Label>
                  <Input type="number" value={chargeOutRate} onChange={(e) => setChargeOutRate(e.target.value)} required />
                </div>
                <div>
                  <Label>Night Rate ($)</Label>
                  <Input type="number" value={nightRate} onChange={(e) => setNightRate(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Owned or Hired</Label>
                <Select value={ownedOrHired} onValueChange={(v) => setOwnedOrHired(v as 'Owned' | 'Hired')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
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
                {editingEntry ? 'Save Changes' : 'Save Equipment'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {equipment.map((entry) => (
          <div
            key={entry.id}
            className="border rounded p-4 shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{entry.name}</p>
              <p className="text-sm text-muted-foreground">
                {entry.category} | ${entry.chargeOutRate.toFixed(2)} | Night: ${entry.nightRate.toFixed(2)} | {entry.ownedOrHired} | {entry.supplier}
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
