// app/stardate/[id]/page.tsx
'use client'

import { api } from '@/lib/trpc/client'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

// Helper to format the date
const formatStardate = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  return `${year}.${month}.${day} // ${time}`
}

export default function StardateDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: entry, isLoading } = api.journal.getById.useQuery({ id })

  // Style component with the new green glass theme and darker text
  const Style = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      
      body {
          font-family: 'Poppins', sans-serif;
          background-color: #f8fafc; /* slate-50 */
          overflow-x: hidden;
      }

      .background-shape {
          position: fixed;
          border-radius: 50%;
          filter: blur(180px);
          opacity: 0.5;
          z-index: -1;
      }

      .shape1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 44, 19, 0.15);
          top: -100px;
          left: -100px;
      }

      .shape2 {
          width: 350px;
          height: 350px;
          background: rgba(0, 44, 19, 0.1);
          bottom: -150px;
          right: -50px;
      }

      .green-glass-card {
          /* This is the new green glass effect */
          background: rgb(19, 51, 30, 0.7); /* emerald-50 with opacity */
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(0, 44, 19, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
      }

      /* Styles for the rendered content inside the card */
      .prose {
        /* This darkens the main content text for readability */
        color: rgb(210, 209, 208); /* gray-200 */
      }
      
      .prose p {
        margin-bottom: 1.25em;
      }
    `}</style>
  )

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center text-[#002c13]">
            <p className="animate-pulse">Loading Stardate...</p>
        </div>
    )
  }

  if (!entry) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-[#002c13]">
            <p className="text-xl mb-4">Stardate entry not found.</p>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#002c13] text-white rounded-lg hover:opacity-90 transition-opacity">
                <FaArrowLeft />
                Return to Log
            </Link>
        </div>
    )
  }

  return (
    <>
      <Style />
      <div className="background-shape shape1"></div>
      <div className="background-shape shape2"></div>

      <main className="min-h-screen font-sans p-4 sm:p-8 relative z-10">
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center gap-2.5 text-gray-500 hover:text-[#002c13] transition-colors group">
                    <div className="bg-white/50 group-hover:bg-white transition-colors border border-gray-200/80 rounded-full p-2">
                      <FaArrowLeft size={12} />
                    </div>
                    <span className="font-medium">Back to all Stardates</span>
                </Link>
            </div>
          
            {/* The main card now uses the new green-glass-card style */}
            <div className="green-glass-card rounded-2xl p-6 sm:p-10">
                <p className="text-lg font-semibold text-[#002c13] mb-2">{formatStardate(entry.createdAt)}</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">{entry.title}</h1>
                <div className="prose prose-lg max-w-none leading-relaxed">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                </div>
            </div>
        </div>
      </main>
    </>
  )
}