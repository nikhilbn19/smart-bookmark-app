import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <BookmarkManager initialBookmarks={bookmarks || []} userId={user.id} />
      </main>
    </div>
  )
}
