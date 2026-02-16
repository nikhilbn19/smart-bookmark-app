'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Plus, X, Link as LinkIcon, AlertCircle } from 'lucide-react'

interface AddBookmarkProps {
  userId: string
  onBookmarkAdded?: (bookmark: any) => void
}

export default function AddBookmark({ userId, onBookmarkAdded }: AddBookmarkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !url.trim()) {
      setError('Please fill in both fields')
      return
    }

    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          title: title.trim(),
          url: url.trim(),
          user_id: userId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setTitle('')
      setUrl('')
      setIsOpen(false)
      if (data) onBookmarkAdded?.(data)
    } catch (err: any) {
      console.error('Error adding bookmark:', err)
      setError(err.message || 'Failed to add bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:hidden bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-500 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Desktop Add Button - rendered in Sidebar usually, but keeping here for fallback */}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                <Plus className="w-5 h-5" />
              </div>
              Add New Bookmark
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Portfolio"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1.5">
                  URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Bookmark
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger for Desktop - we'll handle this communication better via a context or prop later, 
          but for now let's expose a button we can click if sidebar button is clicked */}
      <button 
        id="open-add-bookmark-modal" 
        className="hidden" 
        onClick={() => setIsOpen(true)} 
      />
    </>
  )
}
