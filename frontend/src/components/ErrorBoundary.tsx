import React, { Component, ErrorInfo, ReactNode } from 'react';
import { notify } from '../services/notificationService'; // Adjust path if necessary

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });

    // Use a more descriptive message, possibly extracting from error object
    // Customize this message as needed
    let displayMessage = 'An unexpected application error occurred.';
    if (error.message) {
      // Avoid overly technical messages if error.message is not user-friendly
      // For now, we'll include it but this might need refinement based on typical error messages
      displayMessage += ` Details: ${error.message}`;
    }
    notify.error(displayMessage, { autoClose: 10000 }); // Keep critical errors visible longer
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#fff0f0', 
          border: '1px solid #ffc0c0', 
          borderRadius: '8px', 
          margin: '20px auto',
          maxWidth: '600px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#d32f2f' }}>Oops! Something went wrong.</h2>
          <p>We've encountered an issue. Please try refreshing the page.</p>
          <p>If the problem persists, you can contact support or check back later.</p>
          <details style={{ marginTop: '15px', whiteSpace: 'pre-wrap', textAlign: 'left', color: '#555' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d32f2f' }}>Error Details</summary>
            {this.state.error && <p><strong>Error:</strong> {this.state.error.toString()}</p>}
            {this.state.errorInfo && <p><strong>Stack Trace:</strong><br />{this.state.errorInfo.componentStack}</p>}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
