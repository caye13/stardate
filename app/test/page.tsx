'use client'

import AudioRecorder from "@/components/AudioRecorder";
import { EntryForm } from "@/components/EntryForm";
import { useState } from "react";


export default function TestPage() {
  const [transcription, setTranscription] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  return (
    <>
      <EntryForm transcription={transcription} isEditable={!isRecording} />
    </>
  )
}
