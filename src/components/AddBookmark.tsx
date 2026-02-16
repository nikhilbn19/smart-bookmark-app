'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface AddBookmarkProps {
  userId: string
  onBookmarkAdded?: () => void
}

export default function AddBookmark({ userId, onBookmarkAdded }: AddBookmarkProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!title.trim() || !url.trim()) {
      setError('Please fill in both fields')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setIsLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          title: title.trim(),
          url: url.trim(),
          user_id: userId,
        })

      if (insertError) throw insertError

      // Clear form
      setTitle('')
      setUrl('')
      onBookmarkAdded?.()
    } catch (err: any) {
      console.error('Error adding bookmark:', err)
      setError(err.message || 'Failed to add bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">Add New Bookmark</h3>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-white/90 text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Favorite Website"
            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-white/90 text-sm font-medium mb-2">
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white hover:bg-white/90 text-purple-600 font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Bookmark</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
