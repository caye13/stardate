'use client'
import { api } from '@/lib/trpc/client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaMicrophone, FaTimes, FaSignOutAlt } from 'react-icons/fa'
import AudioRecorder from '@/components/AudioRecorder'
import { useRouter } from 'next/router'
import Link from 'next/link'

const departments = ['Engineering', 'Medical', 'Operations', 'Security', 'Command', 'Sciences']
// const getDepartmentColor = (dept: string) => {
//     const colors: Record<string, string> = {
//       'Engineering': '#FFD700',
//       'Command': '#FF6B6B',
//       'Operations': '#FFA500',
//       'Sciences': '#4169E1',
//       'Medical': '#00CED1',
//       'Security': '#DC143C'
//     }
//     return colors[dept] || '#023020'
//   }
const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    'Engineering': 'bg-red-200 text-red-800 border-red-300',
    'Medical': 'bg-sky-50 text-sky-700 border-sky-200',
    'Sciences': 'bg-blue-500 text-white border-blue-600',
    'Security': 'bg-red-800 text-white border-red-900',
    'Command': 'bg-yellow-400 text-yellow-900 border-yellow-500',
    'Operations': 'bg-blue-200 text-blue-800 border-blue-300'
  }
  return colors[department] || 'bg-gray-200 text-gray-800 border-gray-300'
}

export default function OfficersLog() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [department, setDepartment] = useState(departments[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [isSliding, setIsSliding] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'in' | 'out'>('in')
  const [transcription, setTranscription] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState('officers-log')
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false)

  const supabase = createClient()
  const utils = api.useUtils()
  const { data: userData, isLoading } = api.auth.getUser.useQuery()

  const signUp = api.auth.signUp.useMutation({
    onSuccess: async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) utils.auth.getUser.invalidate()
    },
  })

  const { data: entries } = api.officer.list.useQuery(undefined, {
    enabled: !!userData?.user,
  })

  const createEntry = api.officer.create.useMutation({
    onSuccess: () => {
      utils.officer.list.invalidate()
      setTitle('')
      setContent('')
      setIsModalOpen(false)
    },
  })

  const deleteEntry = api.officer.delete.useMutation({
    onSuccess: () => utils.officer.list.invalidate(),
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

  const selectedEntry = entries?.find(e => e.id === selectedEntryId)

  const handleEntryClick = (entryId: string) => {
    setSlideDirection('in')
    setIsSliding(true)
    setSelectedEntryId(entryId)
  }

  const handleBackClick = () => {
    setSlideDirection('out')
    setTimeout(() => {
      setSelectedEntryId(null)
      setIsSliding(false)
    }, 500)
  }

  useEffect(() => {
    if (!isRecording) {
      utils.officer.list.invalidate()
    }
  }, [isRecording])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.department-dropdown')) {
        setIsDepartmentDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const savedDepartment = localStorage.getItem('selectedDepartment')
    if (savedDepartment && departments.includes(savedDepartment)) {
      setDepartment(savedDepartment)
    }
  }, [])
  // --- STYLE COMPONENT ---
  const Style = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    
    body, #__next {
        font-family: 'Poppins', sans-serif;
        background-color: #ffffff;
        color: #1f2937;
        overflow-x: hidden;
    }
      //   .department-tag {
      //   display: inline-block;
      //   padding: 4px 8px;
      //   border-radius: 16px;
      //   font-size: 12px;
      //   font-weight: 500;
      //   margin-bottom: 8px;
      // }

    /* Green background shapes (when no custom background) */
    .background-shape {
        position: fixed;
        border-radius: 50%;
        filter: blur(200px);
        opacity: 0.3;
        z-index: 0;
    }
    .shape1 {
        width: 500px;
        height: 500px;
        background: rgba(2, 48, 32, 0.4);
        top: -150px;
        left: -150px;
    }
    .shape2 {
        width: 400px;
        height: 400px;
        background: rgba(2, 48, 32, 0.3);
        bottom: -100px;
        right: -100px;
    }
    .shape3 {
        width: 350px;
        height: 350px;
        background: rgba(2, 48, 32, 0.25);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    /* Glass effect */
    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.1);
        transition: all 0.3s ease;
    }
    
    .glass-card:hover {
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.15);
    }
    
    /* Glossy navbar */
    .glossy-nav {
        background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.85) 50%,
            rgba(255, 255, 255, 0.95) 100%);
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 1);
        box-shadow: 
            0 8px 32px 0 rgba(2, 48, 32, 0.15),
            0 2px 8px 0 rgba(255, 255, 255, 0.8) inset,
            0 -2px 8px 0 rgba(2, 48, 32, 0.05) inset;
    }

    /* Very transparent entry cards - UPDATED TO MATCH PERSONAL LOGS */
    .entry-glass {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(10, 48, 36, 0.13);
        box-shadow: 0 4px 16px 0 rgba(2, 48, 32, 0.05);
        transition: all 0.3s ease;
    }
    
    .entry-glass:hover {
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(10, 48, 36, 0.3);
        box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.15);
        transform: translateY(-2px);
    }
    
    .entry-glass-selected {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(2, 48, 32, 0.3);
        box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.2);
    }

    .glass-button {
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        transition: all 0.3s ease;
    }
    
    .glass-button:hover {
        background: rgba(255, 255, 255, 0.75);
        border-color: rgba(2, 48, 32, 0.3);
    }
    
    .glass-button-active {
        background: rgba(2, 48, 32, 0.2);
        border-color: rgba(2, 48, 32, 0.4);
        font-weight: 600;
    }

    .primary-button {
        background: linear-gradient(135deg, #023020 0%, #034d33 100%);
        color: white;
        transition: all 0.3s ease;
        font-weight: 500;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .primary-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(2, 48, 32, 0.3);
    }
    .primary-button:disabled {
        background: rgba(156, 163, 175, 0.5);
        cursor: not-allowed;
    }

    .styled-input, .styled-textarea {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(2, 48, 32, 0.2);
        color: #023020;
        backdrop-filter: blur(10px);
    }
    .styled-input:focus, .styled-textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(2, 48, 32, 0.3);
        border-color: #023020;
        background: rgba(255, 255, 255, 0.95);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .entry-card {
        // animation: fadeIn 0.4s ease-out forwards;
    }
    
    @keyframes slideInRight {
        from { 
            opacity: 0;
            transform: translateX(100%);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from { 
            opacity: 1;
            transform: translateX(0);
        }
        to { 
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .slide-in {
        animation: slideInRight 0.4s ease-out forwards;
    }
    
    .slide-out {
        animation: slideOutRight 0.5s ease-in-out forwards;
    }
    
    .list-expand {
        transition: width 0.5s ease-in-out, max-width 0.5s ease-in-out;
    }

    .split-divider {
        width: 1px;
        background: linear-gradient(to bottom, 
            rgba(2, 48, 32, 0) 0%,
            rgba(2, 48, 32, 0.2) 50%,
            rgba(2, 48, 32, 0) 100%
        );
    }
`}</style>
  );

  // --- LOADING VIEW ---
  if (isLoading) {
    return (
      <>
        <Style />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="background-shape shape1"></div>
          <div className="background-shape shape2"></div>
          <div className="background-shape shape3"></div>
          <div className="text-center relative z-10">
            <p className="font-bold text-2xl">To boldly go where no one has gone before</p>
          </div>
        </div>
      </>
    )
  }

  // --- LOGIN/SIGNUP VIEW ---
  if (!userData?.user) {
    return (
      <>
        <Style />
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="background-shape shape1"></div>
          <div className="background-shape shape2"></div>
          <div className="w-full max-w-md p-8 space-y-6 rounded-2xl glass-card relative z-10">
            <h1 className="text-4xl font-bold text-center" style={{ color: '#023020' }}>Stardate</h1>
            <p className="text-center text-gray-600">Log your journey, one entry at a time.</p>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg styled-input" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg styled-input" />
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
      <div className="relative min-h-screen w-full">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>
        <div className="background-shape shape3"></div>

        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4">
          <div className="max-w-max mx-auto flex items-center gap-2 px-2 py-2 rounded-full glossy-nav">
            <Link href="/">
              <button
                className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
                style={{ color: '#4b5563' }}
              >
                Personal Logs
              </button>
            </Link>
            <Link href="/officers-log">
              <button
                className="px-4 py-2 rounded-full text-sm font-medium glass-button-active transition-all"
                style={{ color: '#023020' }}
              >
                Officers Logs
              </button>
            </Link>
            <Link href="/tasks">
              <button
                className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
                style={{ color: '#4b5563' }}
              >
                Tasks
              </button>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
              style={{ color: '#4b5563' }}
            >
              Sign Out
            </button>

            {/* Department Dropdown */}
            <div className="relative department-dropdown">
              <button
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all flex items-center gap-2"
                style={{ color: '#023020' }}
              >
                <span className={`w-2 h-2 rounded-full ${getDepartmentColor(department).split(' ')[0]}`}></span>
                {department}
                <svg
                  className={`fill-current h-4 w-4 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </button>

              {isDepartmentDropdownOpen && (
                <div
                  className="absolute top-full mt-2 right-0 min-w-[180px] rounded-2xl overflow-hidden glass-card shadow-xl"
                  style={{
                    animation: 'fadeIn 0.2s ease-out',
                    zIndex: 1000
                  }}
                >
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setDepartment(dept)
                        localStorage.setItem('selectedDepartment', dept)
                        setIsDepartmentDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-all flex items-center gap-3 ${department === dept
                        ? 'bg-white/50'
                        : 'hover:bg-white/30'
                        }`}
                      style={{ color: '#023020' }}
                    >
                      <span className={`w-3 h-3 rounded-full ${getDepartmentColor(dept).split(' ')[0]}`}></span>
                      {dept}
                      {department === dept && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex h-screen pt-24">
          {/* Left Side - Entry List */}
          <div className={`${selectedEntryId ? 'w-1/2' : 'w-full max-w-xl mx-auto'} list-expand overflow-y-auto p-6 pb-28`}>
            <div className="space-y-1 relative z-10">
              {entries?.map((entry, index) => (
                <div
                  key={entry.id}
                  className="entry-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => handleEntryClick(entry.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${selectedEntryId === entry.id ? 'entry-glass-selected' : 'entry-glass'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold" style={{ color: '#023020' }}>
                        {formatStardate(entry.createdAt)}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDepartmentColor(entry.department)}`}>
                        {entry.department}
                      </span>
                    </div>
                    <p className='text-xs w-full overflow-hidden line-clamp-1'>{entry.content.substring(0, 100)}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          {selectedEntryId && <div className="split-divider" style={{ opacity: slideDirection === 'out' ? 0 : 1, transition: 'opacity 0.5s' }}></div>}

          {/* Right Side - Expanded Entry View */}
          {selectedEntryId && selectedEntry && (
            <div className={`w-1/2 overflow-y-auto p-6 pb-28 relative z-10 ${slideDirection === 'in' ? 'slide-in' : 'slide-out'}`}>
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleBackClick}
                  className="mb-6 px-4 py-2 rounded-lg glass-button text-sm font-medium"
                  style={{ color: '#023020' }}
                >
                  ← Back to List
                </button>

                <div className="glass-card p-8 rounded-2xl">
                  <span className={` absolute top-4 right-4 px-2 py-1 rounded-full text-sm font-medium border ${getDepartmentColor(selectedEntry.department)}`}>
                        {selectedEntry.department}
                  </span>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#023020' }}>
                    {formatStardate(selectedEntry.createdAt)}
                  </h2>
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">
                    {selectedEntry.title}
                  </h3>
                  <div className="prose prose-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Entry Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-lg p-6 rounded-2xl glass-card relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#023020' }}>
                New Officers Log Entry
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 mb-3 rounded-lg styled-input"
              />
              <textarea
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 mb-4 rounded-lg styled-textarea"
              />
              <button
                onClick={() => createEntry.mutate({ title, content, department })}
                disabled={!title || !content}
                className="w-full py-3 rounded-lg primary-button"
              >
                Create Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Centered Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <AudioRecorder setIsRecording={setIsRecording} entryType="officer" department={department} />
      </div>
    </>
  )
}
