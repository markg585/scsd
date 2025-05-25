// src/app/resources/labour/page.tsx

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

interface LabourEntry {
  id: string;
  name: string;
  role: 'General Labour' | 'Foreman';
  costRate: number;
  chargeOutRate: number;
  nightRate: number;
  notes: string;
}

export default function LabourPage() {
  const [labour, setLabour] = useState<LabourEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LabourEntry | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<'General Labour' | 'Foreman' | ''>('');
  const [costRate, setCostRate] = useState('');
  const [chargeOutRate, setChargeOutRate] = useState('');
  const [nightRate, setNightRate] = useState('');
  const [notes, setNotes] = useState('');

  const fetchLabour = async () => {
    const q = query(collection(db, 'Labour'));
    const snapshot = await getDocs(q);
    const entries: LabourEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<LabourEntry, 'id'>;
      return { id: doc.id, ...data };
    });
    setLabour(entries);
  };

  useEffect(() => {
    fetchLabour();
  }, []);

  const clearForm = () => {
    setEditingEntry(null);
    setName('');
    setRole('');
    setCostRate('');
    setChargeOutRate('');
    setNightRate('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const labourData = {
      name,
      role,
      costRate: parseFloat(costRate),
      chargeOutRate: parseFloat(chargeOutRate),
      nightRate: parseFloat(nightRate),
      notes,
      updatedAt: Timestamp.now(),
    };

    if (editingEntry) {
      await updateDoc(doc(db, 'Labour', editingEntry.id), labourData);
    } else {
      await addDoc(collection(db, 'Labour'), {
        ...labourData,
        createdAt: Timestamp.now(),
      });
    }

    clearForm();
    setOpen(false);
    fetchLabour();
  };

  const handleEdit = (entry: LabourEntry) => {
    setEditingEntry(entry);
    setName(entry.name);
    setRole(entry.role);
    setCostRate(entry.costRate.toString());
    setChargeOutRate(entry.chargeOutRate.toString());
    setNightRate(entry.nightRate.toString());
    setNotes(entry.notes);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'Labour', id));
    fetchLabour();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Labour</h1>
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) clearForm(); }}>
          <SheetTrigger asChild>
            <Button>+ Add Labour</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingEntry ? 'Edit Labour' : 'Add Labour'}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as LabourEntry['role'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Labour">General Labour</SelectItem>
                    <SelectItem value="Foreman">Foreman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Rate ($)</Label>
                  <Input type="number" value={costRate} onChange={(e) => setCostRate(e.target.value)} required />
                </div>
                <div>
                  <Label>Charge-Out Rate ($)</Label>
                  <Input type="number" value={chargeOutRate} onChange={(e) => setChargeOutRate(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Night Rate ($)</Label>
                <Input type="number" value={nightRate} onChange={(e) => setNightRate(e.target.value)} required />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                {editingEntry ? 'Save Changes' : 'Save Labour'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {labour.map((entry) => (
          <div
            key={entry.id}
            className="border rounded p-4 shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{entry.name}</p>
              <p className="text-sm text-muted-foreground">
                Role: {entry.role} | Cost: ${entry.costRate.toFixed(2)} | Charge: ${entry.chargeOutRate.toFixed(2)} | Night: ${entry.nightRate.toFixed(2)}
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
