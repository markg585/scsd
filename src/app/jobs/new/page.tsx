// src/app/jobs/new/page.tsx
// Job form using Shadcn UI components

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
} from 'firebase/firestore';

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

export default function NewJobPage() {
  const [jobName, setJobName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDates, setJobDates] = useState<string[]>([]);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const q = query(collection(db, 'Clients'));
      const snapshot = await getDocs(q);
      const clientList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
        createdAt: Timestamp.now(),
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
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Add New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <Label htmlFor="jobName">Job Name</Label>
          <Input
            id="jobName"
            placeholder="Job Name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="siteAddress">Site Address</Label>
          <Input
            id="siteAddress"
            placeholder="Site Address"
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional job notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="client">Client</Label>
          <Select
            onValueChange={(value) => setClientId(value)}
            value={clientId}
          >
            <SelectTrigger id="client">
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

        <div>
          <Label>Job Dates</Label>
          <div className="space-y-2">
            {jobDates.map((date, index) => (
              <Input
                key={index}
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e, index)}
              />
            ))}
            <Button type="button" variant="outline" onClick={addAnotherDate}>
              + Add Another Date
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Job'}
        </Button>

        {success && (
          <p className="text-green-600 text-sm">✅ Job saved successfully!</p>
        )}
      </form>
    </div>
  );
}
