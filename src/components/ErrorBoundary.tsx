import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional context label so the user knows which area failed (e.g., "Profile Score"). */
  area?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  private autoRetried = false;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    const msg = (error?.message || '').toLowerCase();
    const transient =
      msg.includes('chunk') ||
      msg.includes('dynamically imported module') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror');
    if (transient && !this.autoRetried) {
      this.autoRetried = true;
      setTimeout(() => this.setState({ hasError: false, error: null }), 600);
    }
  }

  private handleRetry = () => {
    this.autoRetried = false;
    this.setState({ hasError: false, error: null });
  };

  private friendlyCause(message: string): string {
    const m = message.toLowerCase();
    if (m.includes('network') || m.includes('failed to fetch') || m.includes('load')) {
      return "We couldn't load part of this page — usually a network hiccup or a slow connection.";
    }
    if (m.includes('chunk') || m.includes('dynamically imported module')) {
      return "A new version of the app was deployed while you were here. A refresh will fix it.";
    }
    if (m.includes('undefined') || m.includes('null') || m.includes('cannot read')) {
      return "Some data this view expected wasn't ready yet — usually a missing profile field or a slow API.";
    }
    if (m.includes('json') || m.includes('parse')) {
      return "We received a response we couldn't read. The server may be busy.";
    }
    return "An unexpected error occurred while rendering this section.";
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const cause = this.state.error?.message || 'Unknown error';
      const why = this.friendlyCause(cause);

      return (
        <div className="surface-premium rounded-2xl ring-1 ring-destructive/20" role="alert">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="eyebrow text-destructive">{this.props.area ?? 'Something broke'}</p>
                <h3 className="text-base font-display font-semibold tracking-tight">
                  This section couldn't render
                </h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">Why: </span>{why}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">What to try: </span>
                  Press Try again, or refresh the page if it keeps failing.
                </p>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground/80 hover:text-foreground transition-colors select-none inline-flex items-center gap-1.5">
                <Bug className="h-3 w-3" /> Technical details
              </summary>
              <pre className="mt-2 text-[11px] leading-relaxed bg-muted/40 border border-border/60 rounded-lg p-2.5 overflow-auto max-h-32 text-muted-foreground">
                {cause}
              </pre>
            </details>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={this.handleRetry} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
              <Button asChild variant="outline" className="gap-2 rounded-xl">
                <a href="/dashboard"><Home className="h-4 w-4" /> Back to dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
