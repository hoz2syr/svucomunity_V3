import { useCallback, useReducer } from 'react'

type ViewMode = 'idle' | 'uploaded' | 'processing' | 'result'

export interface FileUploadState {
  viewMode: ViewMode
  jobId: string | null
  isUploading: boolean
  uploadError: string | null
  copied: boolean
  activeTab: 'split' | 'preview' | 'markdown' | 'tables' | 'images'
  zoom: number
  currentPage: number
  uploadedFile: File | null
  uploadedFileUrl: string | null
  uploadedFileType: string
  model: string
  pages: string
  includeHeaderFooter: boolean
  includeImages: boolean
  tableFormat: 'markdown' | 'html'
  confidenceScores: string
  preprocess: boolean
  preprocessEnhance: boolean
  preprocessDeskew: boolean
  editedMarkdown: string | null
  isSaving: boolean
  saveError: string | null
  sidebarOpen: boolean
}

type Action =
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_JOB_ID'; jobId: string | null }
  | { type: 'SET_UPLOADING'; uploading: boolean }
  | { type: 'SET_UPLOAD_ERROR'; error: string | null }
  | { type: 'SET_COPIED'; copied: boolean }
  | { type: 'SET_ACTIVE_TAB'; tab: 'split' | 'preview' | 'markdown' | 'tables' | 'images' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_CURRENT_PAGE'; page: number }
  | { type: 'SET_UPLOADED_FILE'; file: File | null; url: string | null; fileType: string }
  | { type: 'SET_MODEL'; model: string }
  | { type: 'SET_PAGES'; pages: string }
  | { type: 'SET_INCLUDE_HEADER_FOOTER'; value: boolean }
  | { type: 'SET_INCLUDE_IMAGES'; value: boolean }
  | { type: 'SET_TABLE_FORMAT'; format: 'markdown' | 'html' }
  | { type: 'SET_CONFIDENCE_SCORES'; value: string }
  | { type: 'SET_PREPROCESS'; value: boolean }
  | { type: 'SET_PREPROCESS_ENHANCE'; value: boolean }
  | { type: 'SET_PREPROCESS_DESKEW'; value: boolean }
  | { type: 'SET_EDITED_MARKDOWN'; markdown: string | null }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_SAVE_ERROR'; error: string | null }
  | { type: 'SET_SIDEBAR'; open: boolean }
  | { type: 'RESET' }

const initialState: FileUploadState = {
  viewMode: 'idle',
  jobId: null,
  isUploading: false,
  uploadError: null,
  copied: false,
  activeTab: 'preview',
  zoom: 100,
  currentPage: 1,
  uploadedFile: null,
  uploadedFileUrl: null,
  uploadedFileType: '',
  model: 'mistral-ocr-latest',
  pages: '',
  includeHeaderFooter: false,
  includeImages: true,
  tableFormat: 'markdown',
  confidenceScores: 'none',
  preprocess: false,
  preprocessEnhance: true,
  preprocessDeskew: true,
  editedMarkdown: null,
  isSaving: false,
  saveError: null,
  sidebarOpen: true,
}

function reducer(state: FileUploadState, action: Action): FileUploadState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    case 'SET_JOB_ID':
      return { ...state, jobId: action.jobId }
    case 'SET_UPLOADING':
      return { ...state, isUploading: action.uploading }
    case 'SET_UPLOAD_ERROR':
      return { ...state, uploadError: action.error }
    case 'SET_COPIED':
      return { ...state, copied: action.copied }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.page }
    case 'SET_UPLOADED_FILE':
      return {
        ...state,
        uploadedFile: action.file,
        uploadedFileUrl: action.url,
        uploadedFileType: action.fileType,
      }
    case 'SET_MODEL':
      return { ...state, model: action.model }
    case 'SET_PAGES':
      return { ...state, pages: action.pages }
    case 'SET_INCLUDE_HEADER_FOOTER':
      return { ...state, includeHeaderFooter: action.value }
    case 'SET_INCLUDE_IMAGES':
      return { ...state, includeImages: action.value }
    case 'SET_TABLE_FORMAT':
      return { ...state, tableFormat: action.format }
    case 'SET_CONFIDENCE_SCORES':
      return { ...state, confidenceScores: action.value }
    case 'SET_PREPROCESS':
      return { ...state, preprocess: action.value }
    case 'SET_PREPROCESS_ENHANCE':
      return { ...state, preprocessEnhance: action.value }
    case 'SET_PREPROCESS_DESKEW':
      return { ...state, preprocessDeskew: action.value }
    case 'SET_EDITED_MARKDOWN':
      return { ...state, editedMarkdown: action.markdown }
    case 'SET_SAVING':
      return { ...state, isSaving: action.saving }
    case 'SET_SAVE_ERROR':
      return { ...state, saveError: action.error }
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.open }
    case 'RESET':
      return { ...initialState, viewMode: state.viewMode === 'result' ? 'idle' : state.viewMode, sidebarOpen: state.sidebarOpen }
    default:
      return state
  }
}

export function useFileUploadState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setViewMode = useCallback((mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', mode }), [])
  const setJobId = useCallback((jobId: string | null) => dispatch({ type: 'SET_JOB_ID', jobId }), [])
  const setUploading = useCallback((uploading: boolean) => dispatch({ type: 'SET_UPLOADING', uploading }), [])
  const setUploadError = useCallback((error: string | null) => dispatch({ type: 'SET_UPLOAD_ERROR', error }), [])
  const setCopied = useCallback((copied: boolean) => dispatch({ type: 'SET_COPIED', copied }), [])
  const setActiveTab = useCallback((tab: 'split' | 'preview' | 'markdown' | 'tables' | 'images') => dispatch({ type: 'SET_ACTIVE_TAB', tab }), [])
  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', zoom }), [])
  const setCurrentPage = useCallback((page: number) => dispatch({ type: 'SET_CURRENT_PAGE', page }), [])
  const setUploadedFile = useCallback((file: File | null, url: string | null, fileType: string) =>
    dispatch({ type: 'SET_UPLOADED_FILE', file, url, fileType }), [])
  const setModel = useCallback((model: string) => dispatch({ type: 'SET_MODEL', model }), [])
  const setPages = useCallback((pages: string) => dispatch({ type: 'SET_PAGES', pages }), [])
  const setIncludeHeaderFooter = useCallback((value: boolean) => dispatch({ type: 'SET_INCLUDE_HEADER_FOOTER', value }), [])
  const setIncludeImages = useCallback((value: boolean) => dispatch({ type: 'SET_INCLUDE_IMAGES', value }), [])
  const setTableFormat = useCallback((format: 'markdown' | 'html') => dispatch({ type: 'SET_TABLE_FORMAT', format }), [])
  const setConfidenceScores = useCallback((value: string) => dispatch({ type: 'SET_CONFIDENCE_SCORES', value }), [])
  const setPreprocess = useCallback((value: boolean) => dispatch({ type: 'SET_PREPROCESS', value }), [])
  const setPreprocessEnhance = useCallback((value: boolean) => dispatch({ type: 'SET_PREPROCESS_ENHANCE', value }), [])
  const setPreprocessDeskew = useCallback((value: boolean) => dispatch({ type: 'SET_PREPROCESS_DESKEW', value }), [])
  const setEditedMarkdown = useCallback((markdown: string | null) => dispatch({ type: 'SET_EDITED_MARKDOWN', markdown }), [])
  const setSaving = useCallback((saving: boolean) => dispatch({ type: 'SET_SAVING', saving }), [])
  const setSaveError = useCallback((error: string | null) => dispatch({ type: 'SET_SAVE_ERROR', error }), [])
  const setSidebar = useCallback((open: boolean) => dispatch({ type: 'SET_SIDEBAR', open }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file, URL.createObjectURL(file), file.type)
    setViewMode('uploaded')
    setJobId(null)
    setActiveTab('preview')
    setZoom(100)
    setCurrentPage(1)
    setEditedMarkdown(null)
    setSaving(false)
    setSaveError(null)
    setUploadError(null)
  }, [setUploadedFile, setViewMode, setJobId, setActiveTab, setZoom, setCurrentPage, setEditedMarkdown, setSaving, setSaveError, setUploadError])

  return {
    state,
    dispatch,
    setViewMode,
    setJobId,
    setUploading,
    setUploadError,
    setCopied,
    setActiveTab,
    setZoom,
    setCurrentPage,
    setUploadedFile,
    setModel,
    setPages,
    setIncludeHeaderFooter,
    setIncludeImages,
    setTableFormat,
    setConfidenceScores,
    setPreprocess,
    setPreprocessEnhance,
    setPreprocessDeskew,
    setEditedMarkdown,
    setSaving,
    setSaveError,
    setSidebar,
    reset,
    handleFileSelect,
  }
}
