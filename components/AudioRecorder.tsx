'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { start } from 'repl'

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const transcribeMutation = api.audio.transcribeBuffer.useMutation({
    onSuccess: (data) => {
      console.log('Transcription:', data)
      alert(`Transcription: ${data.text}`)
    },
    onError: (error) => {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio')
    },
  })

  const toggleRecordingOn = async () => {
    if (!isRecording) {
      setIsRecording(true);
      startRecording();
    }
  }
  const startRecording = async () => {
    try {
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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
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
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      const base64Data = base64Audio.split(',')[1]

      transcribeMutation.mutate({
        audioData: base64Data,
        fileName: `recording-${Date.now()}.webm`,
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

  if (audioBlob && !isRecording) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleTranscribe}
          disabled={transcribeMutation.isPending}
          className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 disabled:opacity-50 font-semibold"
        >
          {transcribeMutation.isPending ? 'Transcribing...' : 'Transcribe Recording'}
        </button>
        <button
          onClick={() => setAudioBlob(null)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Record Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-green-500 px-4 py-3 rounded-full transition-all border border-gray-800">
      {!isRecording && (
        <span onClick={toggleRecordingOn}>Record</span>
      )}
      <button
        disabled={!isRecording}
        onClick={isPaused ? resumeRecording : pauseRecording}
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out ${isRecording ? 'w-full' : 'w-0'} hover:text-gray-300 h-8 flex items-center justify-center`}
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>
      <div className={`flex transition-all duration-500 ease-in-out ${isRecording ? 'w-full p-4' : 'w-0 overflow-hidden'} items-center gap-1 h-8`}>
        {audioLevels.map((level, i) => (
          <div
            key={i}
            className="w-1 bg-red-500 rounded-full transition-all duration-100"
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
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out ${isRecording ? 'w-full' : 'w-0'} hover:text-gray-300 h-8 flex items-center justify-center`}
      >
        ⏹️
      </button>

    </div>
  )
  return (
    <div className="flex items-center justify-center">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 flex items-center gap-2 font-semibold transition-all"
        >
          <span>🎤</span>
          <span>Record</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-gray-900 px-4 py-3 rounded-full transition-all">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>

          <div className="flex items-center gap-1 h-8 px-4">
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(8, level * 32)}px`,
                  opacity: isPaused ? 0.3 : 1,
                }}
              />
            ))}
          </div>

          <button
            onClick={stopRecording}
            className="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center"
          >
            ⏹️
          </button>
        </div>
      )}
    </div>
  )
}
