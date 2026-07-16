import axios from 'axios'
import type { UploadResponse, JobStatus } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

export const uploadImage = async (
  file: File,
  settings?: {
    pages?: string
    include_header_footer?: boolean
    include_images?: boolean
    table_format?: string
    confidence_scores?: string
    preprocess?: boolean
    preprocess_enhance?: boolean
    preprocess_deskew?: boolean
  },
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  if (settings) {
    if (settings.pages) formData.append('pages', settings.pages)
    formData.append('include_header_footer', String(settings.include_header_footer ?? false))
    formData.append('include_images', String(settings.include_images ?? true))
    formData.append('table_format', settings.table_format || 'markdown')
    formData.append('confidence_scores', settings.confidence_scores || 'none')
    formData.append('preprocess', String(settings.preprocess ?? false))
    formData.append('preprocess_enhance', String(settings.preprocess_enhance ?? true))
    formData.append('preprocess_deskew', String(settings.preprocess_deskew ?? true))
  }

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail
      if (detail) {
        throw new Error(detail)
      }

      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        throw new Error('انتهت مهلة الاتصال. يرجى التحقق من الاتصال والمحاولة مرة أخرى')
      }

      if (err.code === 'ERR_NETWORK') {
        throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من أن الخادم يعمل')
      }

      if (err.response?.status === 413) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 50MB')
      }

      if (err.response?.status === 500) {
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً')
      }
    }

    throw err
  }
}

export const getJobStatus = async (jobId: string, signal?: AbortSignal): Promise<JobStatus> => {
  const response = await api.get(`/jobs/${jobId}`, { signal })
  return response.data
}

export const downloadFile = async (jobId: string, format: 'markdown' | 'pdf' | 'docx' | 'txt' | 'html'): Promise<Blob> => {
  const response = await api.get(`/download/${jobId}/${format}`, {
    responseType: 'blob',
  })
  return response.data
}

export const saveEditedMarkdown = async (jobId: string, markdown: string, signal?: AbortSignal): Promise<void> => {
  await api.put(`/jobs/${jobId}/edit`, { markdown }, { signal })
}
