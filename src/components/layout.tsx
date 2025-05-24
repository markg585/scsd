// src/components/layout.tsx
// Wraps each page with header and spacing

import { MainNav } from './main-nav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      <main className="p-6">{children}</main>
    </>
  );
}
