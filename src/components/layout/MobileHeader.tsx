'use client'

import { Bookmark, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  user: any
}

export default function MobileHeader({ user }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="md:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">SmartMark</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white p-2 cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 shadow-xl">
          <div className="flex items-center gap-3 mb-6 p-2 bg-slate-800/50 rounded-lg">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="text-white font-medium">
                {user.user_metadata?.full_name}
              </p>
              <p className="text-slate-500 text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 py-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  )
}
