// Improved quote header layout for clean visual structure

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format } from 'date-fns';
import NewClientForm from './NewClientForm';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
}

interface Props {
  onClientChange: (client: Client | null) => void;
}

export default function QuoteHeader({ onClientChange }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState('Draft');
  const [quoteId, setQuoteId] = useState('QU-0399');

  const [sqm, setSqm] = useState('');
  const [preparation, setPreparation] = useState(false);
  const [asphalt, setAsphalt] = useState(false);
  const [twoCoatSeal, setTwoCoatSeal] = useState(false);
  const [profiling, setProfiling] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(db, 'Clients'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Client[];
      setClients(list);
    };

    const generateQuoteId = async () => {
      const snapshot = await getDocs(
        query(collection(db, 'Quotes'), orderBy('quoteNumber', 'desc'), limit(1))
      );
      const latest = snapshot.docs[0]?.data();
      const nextNumber = latest?.quoteNumber ? latest.quoteNumber + 1 : 399;
      setQuoteId(`QU-${String(nextNumber).padStart(4, '0')}`);
    };

    fetchClients();
    generateQuoteId();
  }, []);

  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClientId) || null;
    onClientChange(client);
  }, [selectedClientId]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{quoteId}</h2>
      </div>

      {/* Client + Add New */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Label className="font-semibold">Client</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Sheet open={showClientForm} onOpenChange={setShowClientForm}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">+ Add New</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Client</SheetTitle>
              </SheetHeader>
              <NewClientForm
                onCreated={(clientId) => setSelectedClientId(clientId)}
                onClose={() => setShowClientForm(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Title & Summary */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="font-semibold">Title</Label>
          <Input placeholder="e.g. Orion Stage 1" />
        </div>
        <div>
          <Label className="font-semibold">Summary</Label>
          <Input placeholder="Short summary" />
        </div>
      </div>

      {/* Date, Address, Status */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label className="font-semibold">Date Created</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="font-semibold">Job Site Address</Label>
          <Input placeholder="Address" />
        </div>
        <div>
          <Label className="font-semibold">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Total SQM */}
      <div className="max-w-sm">
        <Label className="font-semibold">Total Area (m²)</Label>
        <Input type="number" value={sqm} onChange={(e) => setSqm(e.target.value)} placeholder="e.g. 320" />
      </div>

      {/* Job Particulars */}
      <div>
        <Label className="text-lg font-semibold block mb-2">Job Particulars & Design</Label>
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox checked={preparation} onCheckedChange={(v) => setPreparation(!!v)} />
            <Label>Preparation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={asphalt} onCheckedChange={(v) => setAsphalt(!!v)} />
            <Label>Asphalt</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={twoCoatSeal} onCheckedChange={(v) => setTwoCoatSeal(!!v)} />
            <Label>Two Coat Seal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={profiling} onCheckedChange={(v) => setProfiling(!!v)} />
            <Label>Profiling</Label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="font-semibold">Notes</Label>
        <Textarea placeholder="Optional notes about this quote..." />
      </div>
    </div>
  );
}