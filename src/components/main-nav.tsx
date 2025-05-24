// src/components/main-nav.tsx
// Top navigation bar using Shadcn UI

'use client';

import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu';
import Link from 'next/link';

const links = [
  { label: 'Dashboard', href: '/' },
  { label: 'Clients', href: '/clients' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Invoicing', href: '/invoicing' },
  { label: 'Quoting', href: '/quoting' }
];

export function MainNav() {
  return (
    <header className="border-b p-4 bg-white shadow-sm">
      <NavigationMenu>
        <NavigationMenuList className="flex gap-6">
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink asChild>
                <Link href={link.href} className="text-sm font-medium hover:underline">
                  {link.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
