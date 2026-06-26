import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface Props {
  children: ReactNode;
  showErrorDetails?: boolean;
}

function logErrorToService(error: Error, errorInfo: ErrorInfo) {
  const payload = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  };
  if (typeof globalThis !== 'undefined' && 'console' in globalThis) {
    console.error('[ErrorBoundary]', payload);
  }
  if (typeof Sentry !== 'undefined' && typeof Sentry.captureException === 'function') {
    try {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    } catch {
      // ignore Sentry transport failures
    }
  }
  return payload;
}

export class ErrorBoundary extends Component<Props, BoundaryState> {
  public state: BoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logErrorToService(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--color-bg-primary)]/80 backdrop-blur-md rounded-2xl border border-red-500/20 text-center m-4">
          <h2 className="text-2xl font-bold text-red-400 mb-4">عذراً، حدث خطأ غير متوقع.</h2>
          <p className="text-slate-400">نحن نعمل على حل هذه المشكلة.</p>
          <button
            type="button"
            className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
            onClick={this.handleRetry}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}


