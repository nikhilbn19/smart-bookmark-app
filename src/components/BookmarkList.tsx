'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import BookmarkCard from './BookmarkCard'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

interface BookmarkListProps {
  initialBookmarks: Bookmark[]
  userId: string
  onAdd?: (bookmark: Bookmark) => void
}

const BookmarkList = forwardRef<{ addBookmark: (bookmark: Bookmark) => void }, BookmarkListProps>(
  ({ initialBookmarks, userId }, ref) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
    const supabase = createClient()

    // Expose the add handler to parent via ref
    useImperativeHandle(ref, () => ({
      addBookmark: (bookmark: Bookmark) => {
        setBookmarks((current) => {
          // Check if bookmark already exists (to avoid duplicates from realtime)
          const exists = current.some((b) => b.id === bookmark.id)
          if (exists) return current
          return [bookmark, ...current]
        })
      },
    }))

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime event:', payload)

          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => {
              // Check if bookmark already exists (to avoid duplicates from optimistic updates)
              const exists = current.some((b) => b.id === (payload.new as Bookmark).id)
              if (exists) return current
              return [payload.new as Bookmark, ...current]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((current) =>
              current.map((bookmark) =>
                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
              )
            )
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleDelete = (id: string) => {
    // Optimistically remove from UI (realtime will also trigger, but this is faster)
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700/50 text-center">
        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
        <p className="text-slate-400">Add your first bookmark to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {bookmarks.length} {bookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="h-full">
            <BookmarkCard bookmark={bookmark} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    </div>
  )
})

BookmarkList.displayName = 'BookmarkList'

export default BookmarkList
