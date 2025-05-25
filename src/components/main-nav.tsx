'use client';

import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  return (
    <header className="border-b p-4 bg-white shadow-sm">
      <NavigationMenu>
        <NavigationMenuList className="flex gap-6 items-center">
          {/* Standard navigation links */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/clients" className="text-sm font-medium hover:underline">
                Clients
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/jobs" className="text-sm font-medium hover:underline">
                Jobs
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/invoicing" className="text-sm font-medium hover:underline">
                Invoicing
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/quoting" className="text-sm font-medium hover:underline">
                Quoting
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Resources dropdown using DropdownMenu */}
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:underline px-2 py-1 rounded-md focus:outline-none">
                  Resources
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/resources/labour">Labour</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/equipment">Equipment</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/materials">Materials</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
