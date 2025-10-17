'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function BackgroundImageManager({ children }: { children: React.ReactNode }) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showBackground, setShowBackground] = useState(false)

  // Load background from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('backgroundImage')
    if (saved) {
      setBackgroundImage(saved)
      // Preload the image
      const img = new window.Image()
      img.src = saved
      img.onload = () => {
        setImageLoaded(true)
        setIsLoading(false)
        // Trigger fade-in after a brief delay
        setTimeout(() => setShowBackground(true), 50)
      }
      img.onerror = () => {
        // If image fails to load, remove it and show content anyway
        localStorage.removeItem('backgroundImage')
        setBackgroundImage(null)
        setIsLoading(false)
      }
    } else {
      // No background image, show content immediately
      setIsLoading(false)
    }
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Convert image to base64 for localStorage
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setBackgroundImage(base64String)
      localStorage.setItem('backgroundImage', base64String)
      setImageLoaded(true)
      setIsUploading(false)
      // Trigger fade-in for newly uploaded image
      setTimeout(() => setShowBackground(true), 50)
    }
    reader.readAsDataURL(file)
  }

  const removeBackground = () => {
    setShowBackground(false)
    // Wait for fade-out before removing
    setTimeout(() => {
      setBackgroundImage(null)
      setImageLoaded(false)
      localStorage.removeItem('backgroundImage')
    }, 500)
  }

  return (
    <>
      {/* Background Image with Fade */}
      {backgroundImage && imageLoaded && (
        <div
          className={`fixed inset-0 -z-10 transition-opacity duration-1300 ${showBackground ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          {/* Optional overlay for better readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Show children only after loading completes */}
      {!isLoading && children}

      {/* Upload Button - Bottom Right */}
      {!isLoading && (
        <div className="fixed bottom-2 right-2 flex flex-col gap-1 z-50">
          <label className="cursor-pointer bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full shadow-lg border border-gray-500/30 transition-all flex items-center justify-center w-8 h-8">
            {isUploading ? (
              <span className="text-sm">⏳</span>
            ) : (
              <span className="text-sm">🖼️</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          {backgroundImage && (
            <button
              onClick={removeBackground}
              className="bg-red-500/20 backdrop-blur-md hover:bg-red-500/30 text-white p-2 rounded-full shadow-lg border border-red-500/30 transition-all w-8 h-8 flex items-center justify-center"
            >
              <span className="text-sm">🗑️</span>
            </button>
          )}
        </div>
      )}
    </>
  )
}
