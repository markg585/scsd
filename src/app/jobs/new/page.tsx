// src/app/jobs/new/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Client {
  id: string;
  ['First Name']: string;
  ['Last Name']: string;
}

export default function NewJobPage() {
  const [jobName, setJobName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDates, setJobDates] = useState<string[]>([]);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const q = query(collection(db, 'Clients'));
      const snapshot = await getDocs(q);
      const clientList: Client[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];
      setClients(clientList);
    };
    fetchClients();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedDates = [...jobDates];
    updatedDates[index] = e.target.value;
    setJobDates(updatedDates);
  };

  const addAnotherDate = () => {
    setJobDates([...jobDates, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'jobs'), {
        jobName,
        siteAddress,
        notes,
        jobDates,
        clientId,
        createdAt: Timestamp.now()
      });
      setSuccess(true);
      setJobName('');
      setSiteAddress('');
      setNotes('');
      setJobDates([]);
      setClientId('');
    } catch (err) {
      alert('Error saving job: ' + err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Job Name"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Site Address"
          value={siteAddress}
          onChange={(e) => setSiteAddress(e.target.value)}
        />
        <Textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div>
          <Label>Client</Label>
          <Select
            onValueChange={(value) => setClientId(value)}
            value={clientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client['First Name']} {client['Last Name']}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {jobDates.map((date, i) => (
            <Input
              key={i}
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e, i)}
            />
          ))}
          <Button type="button" variant="outline" onClick={addAnotherDate}>
            + Add Another Date
          </Button>
        </div>

        <Button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Job'}
        </Button>

        {success && <p className="text-green-600">✅ Job saved!</p>}
      </form>
    </div>
  );
}
