'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Package, ShoppingCart, LayoutDashboard, PackageOpen } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Remessas', href: '/remessas', icon: Package },
  { name: 'Produtos', href: '/produtos', icon: PackageOpen },
  { name: 'Vendas', href: '/vendas', icon: ShoppingCart },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-bold text-primary">Loja Fashion</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
