import React from 'react';

const LoginScreen = ({ isLoggingIn, handleLogin }) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo-transparent.png" alt="NoteUp" className="login-app-logo" />
        <h1 className="login-title">NoteUp</h1>
        <p className="login-subtitle">Güvenli ve gerçek zamanlı<br/>not defteri deneyimi</p>

        <div className="login-btn-container">
          {isLoggingIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', margin: '16px 0', color: 'var(--primary)' }}>
              <div className="spinner"></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Giriş yapılıyor...</span>
            </div>
          ) : (
            <>
              <button className="login-btn login-btn-google" onClick={() => handleLogin('google')}>
                <span className="login-btn-logo">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.31l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </span>
                Google ile Giriş Yap
              </button>

              <button className="login-btn login-btn-apple" onClick={() => handleLogin('apple')}>
                <span className="login-btn-logo">
                  <svg viewBox="0 0 170 170" width="18" height="18" fill="#FFFFFF">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.64-3.08-7.7-7.91-12.18-14.49-5.74-8.47-10.22-17.75-13.43-27.84-3.21-10.09-4.82-19.86-4.82-29.3 0-13.62 3.52-24.69 10.56-33.2 7.04-8.51 15.62-12.87 25.74-13.08 4.67 0 9.87 1.25 15.6 3.75 5.73 2.5 9.82 3.86 12.28 4.09 2.21 0 6.47-1.42 12.78-4.26 6.31-2.84 11.66-4.14 16.05-3.9 8.27.37 15.39 3.03 21.36 7.98-10.73 6.49-15.96 15.54-15.68 27.15.28 9.09 3.87 16.6 10.78 22.53 4.29 3.74 9.17 6.33 14.65 7.78-2.3 6.77-5.46 13.88-9.48 21.33zm-27.69-106.84c0 5.61-2.02 10.87-6.07 15.78-4.96 5.86-10.97 9.17-17.38 8.84-.13-.77-.19-1.54-.19-2.31 0-5.48 2.19-10.88 6.57-16.2 2.19-2.66 4.96-4.88 8.31-6.66 3.35-1.78 6.5-2.73 9.46-2.85.13.78.2 1.58.2 2.4z"/>
                  </svg>
                </span>
                Apple ile Giriş Yap
              </button>
            </>
          )}
        </div>

        <p className="login-footer-text">
          Oturum açarak Kullanım Koşulları'nı ve<br/>Gizlilik Politikası'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
