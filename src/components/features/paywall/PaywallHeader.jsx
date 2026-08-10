import React from "react";

const PaywallHeader = ({
  isLight,
  billingCycle,
  setBillingCycle,
  loading,
  styles,
}) => {
  return (
    <div
      style={{
        ...styles.header,
        background: isLight
          ? "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)"
          : "linear-gradient(180deg, #0d0d1a 0%, #09090f 100%)",
      }}
    >
      <div style={styles.logoRow}>
        <img
          src="/logo-transparent.png"
          alt="NoteUp Logo"
          style={{
            width: "42px",
            height: "42px",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 14px rgba(249, 115, 22, 0.45))",
          }}
        />
        <span
          style={{
            ...styles.logoText,
            color: isLight ? "#0F172A" : "white",
          }}
        >
          NoteUp
        </span>
      </div>
      <h1 style={{ ...styles.title, color: isLight ? "#0F172A" : "white" }}>
        Sınırsız Güce Geç
      </h1>
      <p
        style={{
          ...styles.subtitle,
          color: isLight ? "#475569" : "#9CA3AF",
        }}
      >
        İlk 7 gün tamamen ücretsiz dene, istediğin zaman iptal et
      </p>

      {/* Billing Toggle */}
      <div
        style={{
          ...styles.billingToggle,
          background: isLight ? "#E2E8F0" : "rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => setBillingCycle("monthly")}
          style={{
            ...styles.toggleBtn,
            color:
              billingCycle === "monthly"
                ? isLight
                  ? "#0F172A"
                  : "white"
                : isLight
                  ? "#64748B"
                  : "#6B7280",
            background:
              billingCycle === "monthly"
                ? isLight
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.1)"
                : "none",
            boxShadow:
              billingCycle === "monthly" && isLight
                ? "0 2px 6px rgba(0,0,0,0.08)"
                : "none",
          }}
          disabled={loading}
        >
          Aylık
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          style={{
            ...styles.toggleBtn,
            color:
              billingCycle === "yearly"
                ? isLight
                  ? "#0F172A"
                  : "white"
                : isLight
                  ? "#64748B"
                  : "#6B7280",
            background:
              billingCycle === "yearly"
                ? isLight
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.1)"
                : "none",
            boxShadow:
              billingCycle === "yearly" && isLight
                ? "0 2px 6px rgba(0,0,0,0.08)"
                : "none",
          }}
          disabled={loading}
        >
          Yıllık
        </button>
      </div>
    </div>
  );
};

export default PaywallHeader;
