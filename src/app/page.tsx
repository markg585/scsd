// src/app/page.tsx
// Main dashboard homepage

import Layout from '@/components/layout';

export default function DashboardPage() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Welcome to the SCSD Dashboard</h1>
      <p className="text-muted-foreground">Use the top menu to manage clients, jobs, quotes, and invoices.</p>
    </Layout>
  );
}
