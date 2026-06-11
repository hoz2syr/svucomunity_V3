import { Component, type ReactNode } from 'react';
import type { ErrorInfo } from 'react';

function generateErrorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `err_${Date.now()}_${Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(36).padStart(2, '0')).join('')}`;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorReportUrl?: string;
}

interface State {
  hasError: boolean;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(_error: Error): Pick<State, 'hasError' | 'errorId'> {
    return { hasError: true, errorId: generateErrorId() };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', this.state.errorId, error.message, errorInfo);
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const payload = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    };
    try {
      if (this.props.errorReportUrl) {
        await fetch(this.props.errorReportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // العبء الأمني: عدم كشف أخطاء reporting للمستخدم
    }
  }

  handleRetry(): void {
    this.setState({ hasError: false, errorId: '' });
  }

  handleReload(): void {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" dir="rtl" lang="ar">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">حدث خطأ ما</h2>
            <p className="text-slate-400 text-sm">
              حدث خطأ غير متوقع. يمكنك تحديث الصفحة أو المحاولة مرة أخرى.
            </p>
            <p className="text-slate-600 text-xs" dir="ltr">
              Error ID: {this.state.errorId}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                محاولة مرة أخرى
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
