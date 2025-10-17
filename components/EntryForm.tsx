'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/trpc/client'

interface EntryFormProps {
  transcription: string
  isEditable: boolean
  onSuccess?: () => void
}

export function EntryForm({ transcription, isEditable, onSuccess }: EntryFormProps) {
  const title = `Personal Log | Stardate: ${new Date().toLocaleDateString()}`
  const [content, setContent] = useState(transcription)
  const utils = api.useUtils()

  // Update content when transcription changes
  useEffect(() => {
    setContent(transcription)
  }, [transcription])

  const createEntry = api.journal.create.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate()
      setContent('')
      onSuccess?.()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    createEntry.mutate({
      title: title.trim(),
      content: content.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          {title}
        </label>
      </div>

      {/* Content Input */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
          Content
        </label>
        {isEditable ? (
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your log entry..."
            rows={10}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-gray-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
            required
          />
        ) : (
          <div className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-gray-500/20 rounded-lg text-white min-h-[240px] whitespace-pre-wrap">
            {content || 'No content yet...'}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={createEntry.isPending}
        className="w-full bg-blue-500/20 backdrop-blur-md hover:bg-blue-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg shadow-lg border border-blue-500/30 transition-all flex items-center justify-center gap-2"
      >
        {createEntry.isPending ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Saving...</span>
          </>
        ) : (
          <span>Submit Entry</span>
        )}
      </button>

      {/* Error Display */}
      {createEntry.error && (
        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg px-4 py-3 text-red-200">
          Error: {createEntry.error.message}
        </div>
      )}
    </form>
  )
}
