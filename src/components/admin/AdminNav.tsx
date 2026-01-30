'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'

interface User {
  id: string
  email: string
  name?: string | null
  role: string
}

interface AdminNavProps {
  user: User
}

const navigation = [
  { name: 'Р”Р°С€Р±РѕСЂРґ', href: '/admin/dashboard' },
  { name: 'РўРѕРІР°СЂС‹', href: '/admin/products' },
  { name: 'BMHOME синхронизация', href: '/admin/bmhome-sync' },
]

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Koenig Carpet РђРґРјРёРЅ
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-700 mr-4">
                {user.name || user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Р’С‹Р№С‚Рё
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

