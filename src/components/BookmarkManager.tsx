'use client'

import { useRef } from 'react'
import AddBookmark from './AddBookmark'
import BookmarkList from './BookmarkList'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

interface BookmarkManagerProps {
  initialBookmarks: Bookmark[]
  userId: string
}

export default function BookmarkManager({ initialBookmarks, userId }: BookmarkManagerProps) {
  const listRef = useRef<{ addBookmark: (bookmark: Bookmark) => void }>(null)

  const handleBookmarkAdded = (bookmark: Bookmark) => {
    // Optimistically add to list immediately
    if (listRef.current) {
      listRef.current.addBookmark(bookmark)
    }
  }

  return (
    <div className="space-y-6">
      <AddBookmark userId={userId} onBookmarkAdded={handleBookmarkAdded} />
      <BookmarkList ref={listRef} initialBookmarks={initialBookmarks} userId={userId} />
    </div>
  )
}
