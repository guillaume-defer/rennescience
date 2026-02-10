import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount } = this.state;
      const canRetry = retryCount < 3;

      return (
        <div className="min-h-screen bg-palantir-bg flex items-center justify-center p-4">
          <div className="card-palantir max-w-lg w-full p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-palantir-text">
                  Une erreur est survenue
                </h1>
                <p className="text-sm text-palantir-text-muted">
                  L'application a rencontré un problème inattendu
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-palantir-bg-secondary rounded-lg p-4 mb-6 border border-palantir-border">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-palantir-text-muted" />
                <span className="text-xs font-medium text-palantir-text-muted uppercase tracking-wide">
                  Détails de l'erreur
                </span>
              </div>
              <p className="text-sm text-red-400 font-mono break-all">
                {error?.message || 'Erreur inconnue'}
              </p>
              {errorInfo?.componentStack && (
                <details className="mt-3">
                  <summary className="text-xs text-palantir-text-muted cursor-pointer hover:text-palantir-text">
                    Voir la trace
                  </summary>
                  <pre className="mt-2 text-xs text-palantir-text-muted overflow-auto max-h-32 p-2 bg-palantir-bg rounded">
                    {errorInfo.componentStack.slice(0, 500)}
                  </pre>
                </details>
              )}
            </div>

            {/* Retry count */}
            {retryCount > 0 && (
              <p className="text-xs text-palantir-text-muted mb-4">
                Tentative {retryCount}/3
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canRetry ? (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-palantir-accent hover:bg-palantir-accent-hover text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              ) : (
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-palantir-accent hover:bg-palantir-accent-hover text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>
              )}
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-palantir-border hover:bg-palantir-hover text-palantir-text rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-palantir-text-muted text-center mt-6">
              Si le problème persiste, contactez l'équipe technique.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// === Hook pour les erreurs dans les composants fonctionnels ===
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error('[useErrorHandler] Error:', error);
    throw error; // Re-throw pour que l'ErrorBoundary le capture
  };

  return { handleError };
}

export default ErrorBoundary;
