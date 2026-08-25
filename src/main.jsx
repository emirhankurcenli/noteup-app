import React, { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { supabase } from "./supabaseClient";
import { LanguageProvider } from "./context/LanguageContext";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isReporting: false, reportSent: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      "Uncaught React Error caught by ErrorBoundary:",
      error,
      errorInfo,
    );
  }

  async handleReloadAndReport() {
    try {
      this.setState({ isReporting: true });
      let localUser = null;
      try {
        localUser = JSON.parse(localStorage.getItem("s23_user") || "null");
      } catch (e) {}

      const errorPayload = {
        error_name: this.state.error?.name || "RuntimeError",
        error_message: this.state.error?.message || this.state.error?.toString() || "Bilinmeyen Hata",
        error_stack: this.state.error?.stack || this.state.errorInfo?.componentStack || "",
        user_id: localUser?.uid || "guest",
        user_email: localUser?.email || localUser?.name || "Misafir Kullanıcı",
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile App",
        created_at: new Date().toISOString()
      };

      await supabase.from("error_logs").insert([errorPayload]);
    } catch (err) {
      console.warn("Failed to report crash error log to Supabase:", err);
    } finally {
      this.setState({ hasError: false, error: null });
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#0B132B",
            color: "#FFFFFF",
            padding: "24px",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#FFFFFF",
              marginBottom: "8px",
              letterSpacing: "0.3px"
            }}
          >
            Bir Şeyler Yanlış Gitti
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "#E2E8F0",
              marginBottom: "16px",
              maxWidth: "360px",
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            Uygulama çalışırken bir hata oluştu. Hata detayı:
          </p>
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1.5px solid rgba(239, 68, 68, 0.7)",
              borderRadius: "14px",
              padding: "14px 16px",
              maxWidth: "92%",
              width: "360px",
              maxHeight: "180px",
              overflowY: "auto",
              textAlign: "left",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "0.82rem",
              color: "#FCA5A5",
              marginBottom: "24px",
              wordBreak: "break-word",
              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.15)"
            }}
          >
            <strong>{this.state.error && this.state.error.toString()}</strong>
          </div>

          <button
            onClick={() => this.handleReloadAndReport()}
            disabled={this.state.isReporting}
            style={{
              padding: "14px 24px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.15s ease",
              opacity: this.state.isReporting ? 0.7 : 1
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {this.state.isReporting
              ? "Hata Logu Gönderiliyor..."
              : "Yeniden Başlat ve Hata Logunu Gönder"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  // Unregister existing service workers to avoid Capacitor WebView cache conflicts
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
  // Clear any existing caches
  if ("caches" in window) {
    caches.keys().then((names) => {
      for (let name of names) caches.delete(name);
    });
  }
}

// Lock screen orientation to portrait
try {
  if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
    window.screen.orientation.lock('portrait').catch(() => {});
  }
} catch (e) {}
