import type { ChatMessage, ChatModel, ChatConversation } from '@/types'

const MISTRAL_CHAT_URL = 'https://api.mistral.ai/v1/chat/completions'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000
const STORAGE_KEY = 'mistral-chat-conversations'
export const MAX_SAVED_CONVERSATIONS = 20

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not configured')
  }
  return apiKey
}

export function loadConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveConversations(conversations: ChatConversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, MAX_SAVED_CONVERSATIONS)))
}

export async function sendMistralChatMessage(
  messages: ChatMessage[],
  options: {
    model?: ChatModel
    systemPrompt?: string
    signal?: AbortSignal
    onStream?: (chunk: string) => void
  } = {},
): Promise<string> {
  const apiKey = getApiKey()
  const { model = 'mistral-small-latest', systemPrompt, signal, onStream } = options

  const requestMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  if (systemPrompt && systemPrompt.trim()) {
    requestMessages.push({ role: 'system', content: systemPrompt.trim() })
  }
  requestMessages.push(
    ...messages.map(({ role, content }) => ({ role, content })),
  )

  if (onStream) {
    let fullText = ''
    let cancelled = false

    signal?.addEventListener('abort', () => {
      cancelled = true
    })

    const response = await fetch(MISTRAL_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
        stream: true,
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Mistral API returned empty stream')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      if (cancelled) {
        reader.cancel()
        break
      }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]' || trimmed === '[DONE]') continue
        const match = trimmed.match(/^data:\s*(.+)$/)
        if (!match) continue
        try {
          const parsed = JSON.parse(match[1])
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            onStream(delta)
          }
        } catch {
          // ignore malformed JSON chunks
        }
      }
    }

    return fullText
  }

  let lastError: Error | null = null
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }
    try {
      const response = await fetch(MISTRAL_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
        }),
        signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content ?? ''
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error')
      if (signal?.aborted) {
        throw lastError
      }
      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_DELAY_MS * 2 ** attempt)
      }
    }
  }
  throw lastError ?? new Error('Failed to send message after retries')
}
