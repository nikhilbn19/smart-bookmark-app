import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'
import BookmarkManager from '@/components/BookmarkManager'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial bookmarks
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar user={user} />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <MobileHeader user={user} />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 md:hidden">
            <h1 className="text-2xl font-bold text-white">My Bookmarks</h1>
          </div>
          
          <BookmarkManager initialBookmarks={bookmarks || []} userId={user.id} />
        </main>
      </div>
    </div>
  )
}
