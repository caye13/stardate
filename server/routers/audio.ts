// src/server/routers/audio.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { AssemblyAI } from 'assemblyai'
import { journalRouter } from './journal'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

export const audioRouter = router({
  // Upload audio file and get transcription
  transcribe: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string().url(), // URL to audio file
      })
    )
    .mutation(async ({ input }) => {
      const transcript = await client.transcripts.transcribe({
        audio: input.audioUrl,
      })

      return {
        id: transcript.id,
        text: transcript.text,
        status: transcript.status,
        words: transcript.words,
      }
    }),

  // Upload audio buffer directly
  transcribeBuffer: protectedProcedure
    .input(
      z.object({
        audioData: z.string(), // Base64 encoded audio
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Decode base64 to buffer
      const buffer = Buffer.from(input.audioData, 'base64')

      // Upload to AssemblyAI
      const uploadUrl = await client.files.upload(buffer)

      // Start transcription
      const transcript = await client.transcripts.transcribe({
        audio: uploadUrl,
      })


      return {
        id: transcript.id,
        text: transcript.text,
        status: transcript.status,
        uploadUrl,
      }
    }),

  // Get transcription status
  getTranscript: protectedProcedure
    .input(z.object({ transcriptId: z.string() }))
    .query(async ({ input }) => {
      const transcript = await client.transcripts.get(input.transcriptId)

      return {
        id: transcript.id,
        text: transcript.text,
        status: transcript.status,
        words: transcript.words,
      }
    }),

  // List all transcriptions
  listTranscripts: protectedProcedure.query(async () => {
    const transcripts = await client.transcripts.list()
    return transcripts.transcripts
  }),
}
