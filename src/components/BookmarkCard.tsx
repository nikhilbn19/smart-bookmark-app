'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { ExternalLink, Trash2, Calendar, Globe } from 'lucide-react'

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Delete this bookmark?')) return

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
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      return null
    }
  }

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 bg-slate-900/80 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg backdrop-blur-sm transition-colors"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 p-2 flex items-center justify-center shrink-0">
          <img
            src={getFaviconUrl(bookmark.url) || ''}
            alt=""
            className="w-6 h-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <Globe className="w-5 h-5 text-slate-400 hidden" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
            {bookmark.title}
          </h3>
          <p className="text-sm text-slate-400 truncate mt-1">
            {new URL(bookmark.url).hostname}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(bookmark.created_at)}</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  )
}
