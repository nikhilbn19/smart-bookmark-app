'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
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
}

export default function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()

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
            setBookmarks((current) => [payload.new as Bookmark, ...current])
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
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
        <svg
          className="w-16 h-16 text-white/30 mx-auto mb-4"
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
        <h3 className="text-xl font-semibold text-white/80 mb-2">No bookmarks yet</h3>
        <p className="text-white/60">Add your first bookmark to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {bookmarks.length} {bookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
        </h3>
      </div>
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={handleDelete} />
      ))}
    </div>
  )
}
