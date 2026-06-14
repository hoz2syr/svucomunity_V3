import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: { componentStack: string }) {
    console.error('Admin app error:', _error, _errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h1 className="mb-3 text-2xl font-bold text-white">حدث خطأ غير متوقع</h1>
            <p className="mb-2 text-sm text-slate-400">
              واجه التطبيق مشكلة أثناء التحميل. يرجى المحاولة مرة أخرى.
            </p>
            <pre className="mb-6 overflow-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-red-300">
              {this.state.error?.message ?? 'Unknown error'}
            </pre>
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
