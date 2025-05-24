// src/app/clients/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
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
import Layout from '@/components/layout';
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

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  notes: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');

  const fetchClients = async () => {
    const q = query(collection(db, 'Clients'));
    const snapshot = await getDocs(q);
    const clientList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];
    setClients(clientList);
    setFilteredClients(clientList);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredClients(
      clients.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lower)
      )
    );
  }, [search, clients]);

  const openSheetForEdit = (client: Client) => {
    setEditingClient(client);
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setEmail(client.email);
    setPhone(client.phone);
    setType(client.type);
    setNotes(client.notes);
    setOpen(true);
  };

  const clearForm = () => {
    setEditingClient(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setType('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      const ref = doc(db, 'Clients', editingClient.id);
      await updateDoc(ref, {
        firstName,
        lastName,
        email,
        phone,
        type,
        notes,
      });
    } else {
      await addDoc(collection(db, 'Clients'), {
        firstName,
        lastName,
        email,
        phone,
        type,
        notes,
        createdAt: Timestamp.now(),
      });
    }

    clearForm();
    setOpen(false);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'Clients', id));
    fetchClients();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) clearForm(); }}>
          <SheetTrigger asChild>
            <Button>+ Add New Client</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Client Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                {editingClient ? 'Save Changes' : 'Save Client'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Input
        placeholder="Search clients by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      <div className="space-y-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="border rounded p-4 shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {client.firstName} {client.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                📞 {client.phone} · ✉️ {client.email}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openSheetForEdit(client)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(client.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </Layout>
  );
}