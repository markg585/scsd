// src/app/quotes/new/page.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/layout';
import QuoteHeader from '@/components/quote/QuoteHeader';
import LabourQuoteItem from '@/components/quote/LabourQuoteItem';
import EquipmentQuoteItem from '@/components/quote/EquipmentQuoteItem';
import MaterialQuoteItem from '@/components/quote/MaterialQuoteItem';
import QuoteSummary from '@/components/quote/QuoteSummary';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  LabourQuoteLine,
  EquipmentQuoteLine,
  MaterialQuoteLine,
} from '@/types/quote';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
}

export default function NewQuotePage() {
  const [client, setClient] = useState<Client | null>(null);
  const [labourItems, setLabourItems] = useState<LabourQuoteLine[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<EquipmentQuoteLine[]>([]);
  const [materialItems, setMaterialItems] = useState<MaterialQuoteLine[]>([]);

  const handleSaveQuote = async () => {
    if (!client) {
      alert('Please select a client.');
      return;
    }

    const quoteId = uuidv4();
    const quoteRef = doc(db, 'Quotes', quoteId);

    const labourTotal = labourItems.reduce((sum, i) => sum + i.total, 0);
    const equipmentTotal = equipmentItems.reduce((sum, i) => sum + i.total, 0);
    const materialTotal = materialItems.reduce((sum, i) => sum + i.charge, 0);

    const costBase = labourTotal + equipmentTotal + materialTotal;
    const markup = 0.2; // Hardcoded for now
    const subtotal = costBase * (1 + markup);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;
    const profit = subtotal - costBase;
    const margin = (profit / subtotal) * 100;

    const header = {
      clientId: client.id,
      title: 'Untitled',
      summary: '',
      jobSiteAddress: '',
      status: 'Draft',
      dateCreated: new Date().toISOString(),
      totalArea: 0,
      notes: '',
      quoteNumber: quoteId.slice(0, 8),
      markup,
      gst,
      total,
      costBase,
      profit,
      margin,
    };

    await setDoc(quoteRef, header);

    const labourRef = collection(quoteRef, 'Labour');
    for (const item of labourItems) {
      await addDoc(labourRef, item);
    }

    const equipmentRef = collection(quoteRef, 'Equipment');
    for (const item of equipmentItems) {
      await addDoc(equipmentRef, item);
    }

    const materialRef = collection(quoteRef, 'Materials');
    for (const item of materialItems) {
      await addDoc(materialRef, item);
    }

    alert('✅ Quote saved successfully!');
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Create New Quote</h1>

      <div className="mb-10">
        <QuoteHeader onClientChange={setClient} />
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Labour</h2>
        <LabourQuoteItem items={labourItems} setItems={setLabourItems} />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Equipment</h2>
        <EquipmentQuoteItem items={equipmentItems} setItems={setEquipmentItems} />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Materials</h2>
        <MaterialQuoteItem items={materialItems} setItems={setMaterialItems} />
      </section>

      <QuoteSummary
        labour={labourItems}
        equipment={equipmentItems}
        materials={materialItems}
        onSave={handleSaveQuote}
      />
    </Layout>
  );
}
