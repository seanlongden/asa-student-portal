'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const publicPaths = ['/', '/reactivate'];

export default function Sidebar() {
  const pathname = usePathname();

  if (publicPaths.includes(pathname)) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', match: '/dashboard' },
    { href: '/training', label: 'Training', match: '/training' },
    { href: '/my-work', label: 'My Work', match: '/my-work' },
    { href: '/settings', label: 'Settings', match: '/settings' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h2>ASA</h2>
        <span>Student Portal</span>
      </div>
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname.startsWith(item.match) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="sidebar-footer">
        <a href="/api/auth/logout">Log Out</a>
      </div>
    </nav>
  );
}
