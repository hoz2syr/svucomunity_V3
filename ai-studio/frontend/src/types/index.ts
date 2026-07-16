export type TableFormat = 'markdown' | 'html'
export type ViewMode = 'idle' | 'uploaded' | 'processing' | 'result'
export type TabType = 'split' | 'preview' | 'markdown' | 'tables' | 'images'
export type ProcessingStepStatus = 'pending' | 'active' | 'completed' | 'error'

export interface ProcessingStep {
  key: string
  label: string
  description: string
  status: ProcessingStepStatus
}

export interface JobStatus {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: {
    markdown_path: string
    pdf_path?: string | null
    docx_path?: string | null
    txt_path?: string | null
    html_path?: string | null
    page_count: number
    preview: string
    raw_markdown?: string
    edited_markdown?: string
    extracted_images?: string[]
    image_count?: number
    ocr_settings?: {
      pages?: string
      include_header_footer?: boolean
      include_images?: boolean
      table_format?: string
      confidence_scores?: string
      preprocess?: boolean
      preprocess_enhance?: boolean
      preprocess_deskew?: boolean
    }
    pages_data?: Array<{
      index: number
      markdown: string
      images: Array<{
        id: string
        base64?: string
        bbox?: {
          x: number
          y: number
          width: number
          height: number
        }
      }>
    }>
  }
  error?: string
}

export interface UploadResponse {
  job_id: string
  status: string
  message: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
}

export type ChatModel = 'mistral-small-latest' | 'mistral-large-latest' | 'mistral-medium-latest'

export const AVAILABLE_MODELS: { value: ChatModel; label: string }[] = [
  { value: 'mistral-small-latest', label: 'Mistral Small' },
  { value: 'mistral-large-latest', label: 'Mistral Large' },
  { value: 'mistral-medium-latest', label: 'Mistral Medium' },
]
