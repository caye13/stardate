'use client'
import { api } from '@/lib/trpc/client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { FaMicrophone, FaTimes, FaSignOutAlt } from 'react-icons/fa'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('Stardates')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supabase = createClient()
  const utils = api.useUtils()
  const { data: userData } = api.auth.getUser.useQuery()

  const signUp = api.auth.signUp.useMutation({
    onSuccess: async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) utils.auth.getUser.invalidate()
    },
  })

  const { data: entries } = api.journal.list.useQuery(undefined, {
    enabled: !!userData?.user,
  })

  const createEntry = api.journal.create.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate()
      setTitle('')
      setContent('')
      setIsModalOpen(false)
    },
  })

  const deleteEntry = api.journal.delete.useMutation({
    onSuccess: () => utils.journal.list.invalidate(),
  })

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else utils.auth.getUser.invalidate()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    utils.auth.getUser.invalidate()
  }
  
  const formatStardate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    return `${year}.${month}.${day} // ${time}`
  }

// --- STYLE COMPONENT ---
const Style = () => (
<style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    
    body, #__next {
        font-family: 'Poppins', sans-serif;
        background-color: #f8fafc; /* slate-50 */
        color: #1f2937; /* gray-800 */
        overflow-x: hidden;
    }

    /* Neutral background shapes */
    .background-shape {
        position: fixed;
        border-radius: 50%;
        filter: blur(180px);
        opacity: 0.6;
        z-index: -1;
    }
    .shape1 {
        width: 400px;
        height: 400px;
        background: rgba(100, 116, 139, 0.15); /* slate-500 */
        top: -100px;
        left: -100px;
    }
    .shape2 {
        width: 350px;
        height: 350px;
        background: rgba(100, 116, 139, 0.1); /* slate-500 */
        bottom: -150px;
        right: -50px;
    }

    /* Base glass effect for nav and modal */
    .neutral-glass {
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
    }
    
    /* Enhanced glass effect for journal cards with hover state */
    .journal-glass-card {
        background: rgba(255, 255, 255, 0.45); /* More transparent initially */
        backdrop-filter: blur(10px); /* Stronger blur */
        -webkit-backdrop-filter: blur(40px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
        transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .journal-glass-card:hover {
        background: rgba(255, 255, 255, 0.7); /* Less transparent on hover */
        border-color: rgba(255, 255, 255, 1);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
    }

    /* Neutral button styles */
    .primary-button {
        background-color: #1e293b; /* slate-800 */
        color: white;
        transition: all 0.2s ease-in-out;
        font-weight: 500;
    }
    .primary-button:hover {
        background-color: #0f172a; /* slate-900 */
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2);
    }
    .primary-button:disabled {
        background-color: #a1a1aa; /* zinc-400 */
    }
    
    .nav-button {
        background: transparent;
        transition: all 0.3s ease;
        color: #64748b; /* slate-500 */
        font-weight: 500;
        border-radius: 9999px;
    }
    .nav-button:hover {
        background: rgba(15, 23, 42, 0.05); /* slate-900 */
        color: #0f172a;
    }
    .nav-button-active {
        background: rgba(15, 23, 42, 0.1);
        color: #0f172a;
        font-weight: 600;
        border-radius: 9999px;
    }
    .signout-button {
        background: rgba(241, 245, 249, 0.7); /* slate-100 */
        color: #475569; /* slate-600 */
    }
    .signout-button:hover {
        background: rgba(226, 232, 240, 0.9); /* slate-200 */
        color: #1e293b; /* slate-800 */
    }

    .styled-input, .styled-textarea {
        background-color: rgba(241, 245, 249, 0.8);
        border: 1px solid #cbd5e1;
        color: #1e293b;
    }
    .styled-input:focus, .styled-textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px #1e293b;
        border-color: #1e293b;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .stardate-card {
        animation: fadeIn 0.5s ease-out forwards;
    }
`}</style>
);

  // --- LOGIN/SIGNUP VIEW ---
  if (!userData?.user) {
    return (
      <>
        <Style />
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 rounded-2xl glass-container">
                <h1 className="text-4xl font-bold text-center text-[#002c13]">Stardate</h1>
                <p className="text-center text-gray-500">Log your journey, one entry at a time.</p>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg styled-input"/>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg styled-input"/>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={() => signUp.mutate({ email, password })} className="flex-1 py-3 rounded-lg primary-button">Sign Up</button>
                    <button onClick={handleSignIn} className="flex-1 py-3 rounded-lg primary-button">Sign In</button>
                </div>
            </div>
        </div>
      </>
    )
  }

  // --- MAIN LOGGED-IN VIEW ---
return (
<>
    <Style />
    <div className="relative min-h-screen w-full p-4 sm:p-6">
    <div className="background-shape shape1"></div>
    <div className="background-shape shape2"></div>
    
    {/* Header with Centered Navigation and Sign Out */}
    <header className="sticky top-4 z-50 max-w-5xl mx-auto mb-10">
        <div className="p-2 flex justify-between items-center rounded-full neutral-glass">
            {/* Left spacer to balance the signout button */}
            <div className="w-10 h-10"></div> 

            {/* Centered Navigation Tabs */}
            <nav className="flex-shrink-0 flex justify-center items-center gap-2">
                {['Personal Logs', 'Officers Logs', 'Tasks'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 sm:px-6 py-2 text-sm ${activeTab === tab ? 'nav-button-active' : 'nav-button'}`}>
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Sign Out Button */}
            <button onClick={handleSignOut} title="Sign Out" className="w-10 h-10 flex items-center justify-center rounded-full signout-button transition-all">
                <FaSignOutAlt size={16} />
            </button>
        </div>
    </header>

    <main className="max-w-3xl mx-auto z-10 pb-28">
        <div className="space-y-5">
            {entries?.map((entry, index) => (
            <div key={entry.id} className="stardate-card" style={{ animationDelay: `${index * 100}ms` }}>
                <Link href={`/stardate/${entry.id}`} className="block p-6 rounded-2xl journal-glass-card group">
                    <h3 className="text-base font-semibold text-slate-800 mb-1.5">{formatStardate(entry.createdAt)}</h3>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{entry.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                        {entry.content}
                    </p>
                </Link>
            </div>
            ))}
        </div>
    </main>
    
    {/* Centered Floating Action Button */}
    <div 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full primary-button cursor-pointer z-50 shadow-lg"
    >
        <FaMicrophone size={24} />
    </div>

    {/* New Entry Modal */}
    {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={() => setIsModalOpen(false)}>
            <div className="w-full max-w-lg p-6 rounded-2xl neutral-glass relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><FaTimes size={20} /></button>
                <h2 className="text-2xl font-semibold mb-4 text-slate-800">New Stardate Entry</h2>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 mb-3 rounded-lg styled-input" />
                <textarea placeholder="Write your thoughts..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full px-4 py-2 mb-4 rounded-lg styled-textarea" />
                <button onClick={() => createEntry.mutate({ title, content })} disabled={!title || !content} className="w-full py-3 rounded-lg primary-button">
                    Create Entry
                </button>
            </div>
        </div>
    )}
    </div>
</>
)
}