import { useCallback, useEffect } from 'react'
import { XCircle, RotateCcw } from 'lucide-react'
import { useJobStatus } from '../hooks/useOCR'
import { uploadImage, downloadFile } from '../services/api'
import type { UploadResponse, ProcessingStep, ProcessingStepStatus } from '../types'
import { PROCESSING_STEPS } from '../constants/ocr'
import { UploadView } from '@/components/ocr/UploadView'
import { ProcessingView } from '@/components/ocr/ProcessingView'
import { ResultView } from '@/components/ocr/ResultView'
import { SettingsPanel } from '@/components/ocr/SettingsPanel'
import { useFileUploadState } from '../hooks/useFileUploadState'
import { useAutoSave } from '../hooks/useAutoSave'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onSendToChat?: (text: string) => void
}

export function FileUpload({ onSendToChat }: FileUploadProps) {
  const {
    state,
    setViewMode,
    setJobId,
    setUploading,
    setUploadError,
    setCopied,
    setActiveTab,
    setZoom,
    setCurrentPage,
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
    setSidebar,
    reset,
    handleFileSelect,
  } = useFileUploadState()

  const { jobId, isUploading, uploadError, copied, activeTab, zoom, currentPage, uploadedFile, uploadedFileUrl, uploadedFileType, model, pages, includeHeaderFooter, includeImages, tableFormat, confidenceScores, preprocess, preprocessEnhance, preprocessDeskew, saveError, sidebarOpen } = state

  useAutoSave(jobId, state.editedMarkdown)

  const { status, error: processError } = useJobStatus(jobId)

  useEffect(() => {
    if (status?.status === 'completed' && status.result) {
      if (status.result.edited_markdown) {
        setEditedMarkdown(status.result.edited_markdown)
      } else if (status.result.raw_markdown) {
        setEditedMarkdown(status.result.raw_markdown)
      }
      setViewMode('result')
      setActiveTab('markdown')
    }
  }, [status?.status, status?.result, setEditedMarkdown, setViewMode, setActiveTab])

  const toggleSidebar = useCallback(() => {
    setSidebar(!sidebarOpen)
  }, [sidebarOpen, setSidebar])

  const handleReset = useCallback(() => {
    if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl)
    reset()
  }, [uploadedFileUrl, reset])

  const handleDownload = useCallback(async (format: 'markdown' | 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!jobId || !status?.result) return
    try {
      const blob = await downloadFile(jobId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `result.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [jobId, status])

  const handleCopy = useCallback(async () => {
    const textToCopy = state.editedMarkdown ?? status?.result?.raw_markdown
    if (!textToCopy) return
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [status, state.editedMarkdown, setCopied])

  const handleDeleteImage = useCallback((imagePath: string) => {
    if (!state.editedMarkdown) return
    const escapedPath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`!\\[.*?\\]\\(${escapedPath}\\)\\s*\\n?`, 'g')
    setEditedMarkdown(state.editedMarkdown.replace(regex, ''))
  }, [state.editedMarkdown, setEditedMarkdown])

  const handleStartExtraction = useCallback(async () => {
    if (!uploadedFile) return
    setUploading(true)
    setViewMode('processing')

    try {
      const data: UploadResponse = await uploadImage(uploadedFile, {
        pages: pages || undefined,
        include_header_footer: includeHeaderFooter,
        include_images: includeImages,
        table_format: tableFormat,
        confidence_scores: confidenceScores,
        preprocess,
        preprocess_enhance: preprocessEnhance,
        preprocess_deskew: preprocessDeskew,
      })
      setJobId(data.job_id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع الملف. حاول مرة أخرى.'
      setUploadError(message)
      setViewMode('uploaded')
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [uploadedFile, pages, includeHeaderFooter, includeImages, tableFormat, confidenceScores, preprocess, preprocessEnhance, preprocessDeskew, setUploading, setViewMode, setJobId, setUploadError])

  const handleRetry = useCallback(async () => {
    if (!uploadedFile) return
    setUploadError(null)
    setViewMode('uploaded')
    await handleStartExtraction()
  }, [uploadedFile, handleStartExtraction, setUploadError, setViewMode])

  const handleModelChange = useCallback((value: string | null) => {
    if (value) setModel(value)
  }, [setModel])

  const handleTableFormatChange = useCallback((value: string | null) => {
    if (value) setTableFormat(value as 'markdown' | 'html')
  }, [setTableFormat])

  const handleConfidenceChange = useCallback((value: string | null) => {
    if (value) setConfidenceScores(value)
  }, [setConfidenceScores])

  const handlePreprocessChange = useCallback((checked: boolean) => {
    setPreprocess(checked)
  }, [setPreprocess])

  const handlePreprocessEnhanceChange = useCallback((checked: boolean) => {
    setPreprocessEnhance(checked)
  }, [setPreprocessEnhance])

  const handlePreprocessDeskewChange = useCallback((checked: boolean) => {
    setPreprocessDeskew(checked)
  }, [setPreprocessDeskew])

  const handleIncludeImagesChange = useCallback((checked: boolean) => {
    setIncludeImages(checked)
  }, [setIncludeImages])

  const handleIncludeHeaderFooterChange = useCallback((checked: boolean) => {
    setIncludeHeaderFooter(checked)
  }, [setIncludeHeaderFooter])

  const getProcessingSteps = (): ProcessingStep[] => {
    if (!status) {
      return PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' as ProcessingStepStatus }))
    }

    if (status.status === 'queued') {
      return [
        { ...PROCESSING_STEPS[0], status: 'completed' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[1], status: 'pending' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[2], status: 'pending' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[3], status: 'pending' as ProcessingStepStatus },
      ]
    }

    if (status.status === 'processing') {
      const progress = status.progress || 0
      if (progress < 30) {
        return [
          { ...PROCESSING_STEPS[0], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[1], status: 'active' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[2], status: 'pending' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[3], status: 'pending' as ProcessingStepStatus },
        ]
      } else if (progress < 80) {
        return [
          { ...PROCESSING_STEPS[0], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[1], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[2], status: 'active' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[3], status: 'pending' as ProcessingStepStatus },
        ]
      } else {
        return [
          { ...PROCESSING_STEPS[0], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[1], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[2], status: 'completed' as ProcessingStepStatus },
          { ...PROCESSING_STEPS[3], status: 'active' as ProcessingStepStatus },
        ]
      }
    }

    if (status.status === 'completed') {
      return PROCESSING_STEPS.map(s => ({ ...s, status: 'completed' as ProcessingStepStatus }))
    }

    if (status.status === 'failed') {
      return [
        { ...PROCESSING_STEPS[0], status: 'completed' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[1], status: 'error' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[2], status: 'pending' as ProcessingStepStatus },
        { ...PROCESSING_STEPS[3], status: 'pending' as ProcessingStepStatus },
      ]
    }

    return PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' as ProcessingStepStatus }))
  }

  const processingSteps = getProcessingSteps()
  const errorStep = processingSteps.find(s => s.status === 'error')

  const showError = (uploadError || processError) && state.viewMode !== 'uploaded'

  return (
    <div className="flex text-foreground">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        aria-label={sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
        aria-expanded={sidebarOpen}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Settings Panel - responsive */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "translate-x-full",
        "lg:block"
      )}>
        <SettingsPanel
          uploadedFile={uploadedFile}
          onFileSelect={handleFileSelect}
          onReset={handleReset}
          isUploading={isUploading}
          uploadError={uploadError}
          model={model}
          onModelChange={handleModelChange}
          pages={pages}
          onPagesChange={(value) => setPages(value)}
          includeHeaderFooter={includeHeaderFooter}
          onIncludeHeaderFooterChange={handleIncludeHeaderFooterChange}
          includeImages={includeImages}
          onIncludeImagesChange={handleIncludeImagesChange}
          tableFormat={tableFormat}
          onTableFormatChange={handleTableFormatChange}
          confidenceScores={confidenceScores}
          onConfidenceScoresChange={handleConfidenceChange}
          preprocess={preprocess}
          onPreprocessChange={handlePreprocessChange}
          preprocessEnhance={preprocessEnhance}
          onPreprocessEnhanceChange={handlePreprocessEnhanceChange}
          preprocessDeskew={preprocessDeskew}
          onPreprocessDeskewChange={handlePreprocessDeskewChange}
          onStartExtraction={handleStartExtraction}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 overflow-auto p-6">
          {showError && (
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-4 animate-in">
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-sm text-destructive flex-1">{uploadError || processError}</span>
              {(uploadError || processError) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isUploading}
                  className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  إعادة المحاولة
                </Button>
              )}
            </div>
          )}

          {state.viewMode === 'idle' && (
            <UploadView
              viewMode="idle"
              uploadedFile={null}
              uploadedFileUrl={null}
              uploadedFileType=""
              isUploading={isUploading}
              uploadError={uploadError}
              onFileSelect={handleFileSelect}
              onStartExtraction={handleStartExtraction}
              onReset={handleReset}
            />
          )}

          {state.viewMode === 'uploaded' && (
            <UploadView
              viewMode="uploaded"
              uploadedFile={uploadedFile}
              uploadedFileUrl={uploadedFileUrl}
              uploadedFileType={uploadedFileType}
              isUploading={isUploading}
              uploadError={uploadError}
              onFileSelect={handleFileSelect}
              onStartExtraction={handleStartExtraction}
              onReset={handleReset}
            />
          )}

          {state.viewMode === 'processing' && (
            <ProcessingView
              steps={processingSteps}
              progress={status?.progress}
              errorStep={errorStep}
              onReset={handleReset}
              onRetry={handleRetry}
            />
          )}

          {state.viewMode === 'result' && status?.result && (
            <ResultView
              rawMarkdown={status.result.raw_markdown || ''}
              editedMarkdown={state.editedMarkdown || undefined}
              previewImageUrl={uploadedFileUrl || ''}
              uploadedFileType={uploadedFileType}
              uploadedFileName={uploadedFile?.name}
              status={status}
              zoom={zoom}
              currentPage={currentPage}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              onZoomChange={(zoom) => setZoom(zoom)}
              onPageChange={(page) => setCurrentPage(page)}
              onCopy={handleCopy}
              onDownload={handleDownload}
              copied={copied}
              jobId={jobId!}
              isSaving={state.isSaving}
              saveError={saveError}
              onDeleteImage={handleDeleteImage}
              onSendToChat={onSendToChat}
            />
          )}

          {status?.status === 'failed' && state.viewMode === 'idle' && (
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl animate-in">
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-sm text-destructive flex-1">فشلت المعالجة: {status.error || 'خطأ غير معروف'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                disabled={isUploading}
                className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                إعادة المحاولة
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
