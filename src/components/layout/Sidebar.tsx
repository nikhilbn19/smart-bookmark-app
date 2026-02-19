'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Home, LogOut, Plus, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: any
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { icon: Home, label: 'All Bookmarks', href: '/dashboard' },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-slate-900 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Bookmark className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">SmartMark</span>
        </div>

        <button 
          onClick={() => document.getElementById('open-add-bookmark-modal')?.click()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 group cursor-pointer"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">New Bookmark</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name}
              className="w-8 h-8 rounded-full border border-slate-600"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

