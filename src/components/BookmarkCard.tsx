'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete?: (id: string) => void
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id)

      if (error) throw error
      onDelete?.(bookmark.id)
    } catch (err: any) {
      console.error('Error deleting bookmark:', err)
      alert('Failed to delete bookmark')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-lg mb-1 truncate">
            {bookmark.title}
          </h4>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 text-sm break-all line-clamp-2 transition-colors"
          >
            {bookmark.url}
          </a>
          <p className="text-white/50 text-xs mt-2">
            Added {formatDate(bookmark.created_at)}
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-shrink-0 text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-500/20"
          title="Delete bookmark"
        >
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
