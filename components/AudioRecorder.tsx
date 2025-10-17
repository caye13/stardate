'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/trpc/client'

interface AudioRecorderProps {
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>
  entryType: string
  department?: string
}

export default function AudioRecorder({ setIsRecording: setExternalIsRecording, entryType: entryType, department: department }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0))
  const [internalTranscription, setInternalTranscription] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const communicatorBeepRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = () => {
    // If the audio element doesn't exist yet, create it
    if (!communicatorBeepRef.current) {
      communicatorBeepRef.current = new Audio('/communicatorbeep.mp3') // Put your MP3 in public folder
    }

    // Reset to start and play
    communicatorBeepRef.current.currentTime = 1
    communicatorBeepRef.current.play().catch(error => {
      console.error('Error playing audio:', error)
    })
  }
  const transcribeMutation = api.audio.transcribeBuffer.useMutation({
    onSuccess: (data) => {
      console.log('Transcription:', data)

      // Append to internal transcription
      const newText = data.text
      setInternalTranscription(prev => prev + (prev ? ' ' : '') + newText)


      // Set external recording state to false when done
      setExternalIsRecording(false)
    },
    onError: (error) => {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio')
      setExternalIsRecording(false)
    },
  })

  const toggleRecordingOn = async () => {
    if (!isRecording) {
      setIsRecording(true)
      setExternalIsRecording(true)
      startRecording()
    }
  }

  const startRecording = async () => {
    try {
      playAudio()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Set up audio visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      visualize()

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
      setIsRecording(false)
      setExternalIsRecording(false)
    }
  }

  const visualize = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyserRef.current!.getByteFrequencyData(dataArray)

      let levels = Array.from(dataArray.slice(0, 20)).map(v => v / 255)
      levels = levels.slice(0, 10).reverse().concat(levels.slice(0, 10))
      setAudioLevels(levels)
    }

    draw()
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

        // Transcribe in background
        handleTranscribeWithBlob(blob)

        // Clean up
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }

      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const handleTranscribeWithBlob = (blob: Blob) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      const base64Data = base64Audio.split(',')[1]

      transcribeMutation.mutate({
        audioData: base64Data,
        fileName: `recording-${Date.now()}.webm`,
        entryType: entryType,
        department: department
      })
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div
      onClick={!isRecording ? toggleRecordingOn : () => { }}
      className={`flex items-center bg-white/26 backdrop-blur-sm px-3 py-3 ${!isRecording ? 'cursor-pointer items-center justify-center w-14 h-14' : 'min-w-8 min-h-8'} rounded-full transition-all border border-gray-500/26 shadow-xl shadow-gray-800/50`}
    >
      {!isRecording && (
        <span className="" onClick={toggleRecordingOn}>🎙️</span>
      )}
      <button
        disabled={!isRecording}
        onClick={isPaused ? resumeRecording : pauseRecording}
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out ${isRecording ? 'cursor-pointer w-full' : 'w-0 opacity-0'} hover:text-gray-300 h-8 flex items-center justify-center`}
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>
      <div className={`flex transition-all duration-500 ${isRecording ? 'w-full p-4' : 'w-0'} items-center gap-1 h-8`}>
        {audioLevels.map((level, i) => (
          <div
            key={i}
            className="w-1 bg-gray-900 rounded-full transition-all duration-100"
            style={{
              height: `${Math.max(8, level * 32)}px`,
              opacity: isPaused ? 0.3 : 1,
            }}
          />
        ))}
      </div>
      <button
        disabled={!isRecording}
        onClick={stopRecording}
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out ${isRecording ? 'cursor-pointer w-full' : 'w-0 opacity-0'} hover:text-gray-300 h-8 flex items-center justify-center`}
      >
        ⏹️
      </button>
    </div>
  )
}
