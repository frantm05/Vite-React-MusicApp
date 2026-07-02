import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Last-resort catch so a render crash shows a message instead of a blank page. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-crash">
          <h1>Něco se pokazilo</h1>
          <p>Zkus stránku obnovit.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Obnovit
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
