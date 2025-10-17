'use client'
import { api } from '@/lib/trpc/client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AudioRecorder from '@/components/AudioRecorder'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const supabase = createClient()
  const utils = api.useUtils()
  const { data: userData } = api.auth.getUser.useQuery()
  const signUp = api.auth.signUp.useMutation({
    onSuccess: async () => {
      // After successful signup, sign in on client to set cookies
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error) {
        utils.auth.getUser.invalidate()
      }
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
    },
  })

  const deleteEntry = api.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate()
    },
  })

  // Handle sign in on client
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      utils.auth.getUser.invalidate()
    }
  }

  // Handle sign out on client
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    utils.auth.getUser.invalidate()
  }

  // style component
  const Style = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        body, #__next {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
            min-height: 100vh;
        }

        .glass-container {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.15);
        }

        .glass-button {
            background: rgba(2, 48, 32, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(2, 48, 32, 0.3);
            transition: background 0.3s ease, transform 0.2s ease;
            color: white;
        }

        .glass-button:hover {
            background: rgba(2, 48, 32, 0.9);
            transform: scale(1.05);
        }

        .glass-button:active {
            transform: scale(0.98);
        }
        
        .glass-button-red {
            background: rgba(185, 28, 28, 0.7); /* red-700 */
             border: 1px solid rgba(185, 28, 28, 0.3);
        }
        .glass-button-red:hover {
            background: rgba(185, 28, 28, 0.9);
        }


        .background-shape {
            position: fixed; /* Use fixed to keep them in place during scroll */
            border-radius: 50%;
            filter: blur(150px);
            opacity: 0.6;
            z-index: -1;
        }

        .shape1 {
            width: 400px;
            height: 400px;
            background: rgba(2, 48, 32, 0.3);
            top: -100px;
            left: -100px;
        }

        .shape2 {
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.8);
            bottom: -50px;
            right: -50px;
        }

        .styled-input, .styled-textarea {
            background-color: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.7);
            color: #1f2937; /* gray-800 */
            transition: all 0.2s ease-in-out;
        }
        
        .styled-input::placeholder, .styled-textarea::placeholder {
            color: #6b7280; /* gray-500 */
        }

        .styled-input:focus, .styled-textarea:focus {
            outline: none;
            box-shadow: 0 0 0 2px #023020; /* Ring effect */
            border-color: transparent;
        }
    `}</style>
  );
  if (!userData?.user) {
    return (
      <>
        <Style />
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4">
          <div className="background-shape shape1"></div>
          <div className="background-shape shape2"></div>

          <div className="w-full max-w-md p-8 space-y-6 rounded-2xl glass-container z-10">
            <h1 className="text-3xl font-bold text-center text-[#023020]">
              Stardate Logging App
            </h1>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-md styled-input"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-md styled-input"
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => signUp.mutate({ email, password })}
                className="flex-1 py-3 rounded-md glass-button font-semibold"
              >
                Sign Up
              </button>
              <button
                onClick={handleSignIn}
                className="flex-1 py-3 rounded-md glass-button font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Style />
      <div className="relative min-h-screen w-full p-4 sm:p-8 overflow-hidden">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>

        <div className="max-w-4xl mx-auto z-10">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 rounded-2xl glass-container">
            <AudioRecorder />
            <h1 className="text-3xl font-bold text-[#023020]">My Journal</h1>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-gray-800 text-sm font-medium">{userData.user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-md font-semibold glass-button glass-button-red"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main>
            <div className="p-6 rounded-2xl shadow-md mb-8 glass-container">
              <h2 className="text-2xl font-semibold mb-4 text-[#023020]">New Entry</h2>

              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 mb-3 border rounded-md styled-input"
              />

              <textarea
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 mb-3 border rounded-md styled-textarea"
              />

              <button
                onClick={() => createEntry.mutate({ title, content })}
                disabled={!title || !content}
                className="px-6 py-2 rounded-md font-semibold glass-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Entry
              </button>
            </div>

            <div className="space-y-4">
              {entries?.map((entry) => (
                <div key={entry.id} className="p-6 rounded-2xl shadow-md glass-container">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#023020]">{entry.title}</h3>
                    <button
                      onClick={() => deleteEntry.mutate({ id: entry.id })}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-800 mb-2">{entry.content}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
