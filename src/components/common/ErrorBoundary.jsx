import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: '#EF4444' }}>
            Bir Hata Oluştu
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '20px', maxWidth: '400px' }}>
            Beklenmeyen bir çalışma zamanı hatası yakalandı. Sorunlu kod bilgisi aşağıda yer almaktadır:
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            maxWidth: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: '#FCA5A5',
            marginBottom: '24px',
            wordBreak: 'break-word'
          }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
            {this.state.errorInfo && (
              <pre style={{ marginTop: '8px', fontSize: '0.72rem', whiteSpace: 'pre-wrap', color: '#94A3B8' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <button
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            🔄 Yeniden Başlat
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
