import React from "react";
import { PlanBadgeIcon } from "../../common/PlanIcons";

// Feature Icons Map
const FeatureIcon = ({ featureKey, color, included }) => {
  const iconColor = included ? color : "#94A3B8";

  switch (featureKey) {
    case "storage":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case "devices":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "sharing":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "encryption":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "deviceMgmt":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="12" x="3" y="4" rx="2" />
          <line x1="2" x2="22" y1="20" y2="20" />
        </svg>
      );
    case "noAds":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "avatar":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case "exportPdf":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 12h4" />
          <path d="M10 16h4" />
        </svg>
      );
    case "audioToText":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      );
    case "ultraShare":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v10H4V12" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    default:
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const PlanCard = ({
  plan,
  isSelected,
  isCurrent,
  isLight,
  billingCycle,
  prices,
  loading,
  handlePlanSelect,
  handleCTAForPlan,
  getPlanCtaLabel,
}) => {
  let displayedPrice = "Ücretsiz";
  let originalPrice = "";
  let discountBadge = "";
  let displayedYearlyLabel = "";

  // Para birimini ve üzeri çizili fiyatı sabit indirim oranına göre dinamik hesaplama
  const formatOrigPrice = (numPrice, discountPercent, priceStr) => {
    if (!numPrice || numPrice <= 0) return "";
    const origNum = numPrice / (1 - discountPercent / 100);
    let symbol = "₺";
    if (priceStr && typeof priceStr === "string") {
      const match = priceStr.match(/^[^\d\s]+/);
      if (match) symbol = match[0];
    }
    const parts = origNum.toFixed(2).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${symbol}${intPart},${parts[1]}`;
  };

  if (plan.id === "pro") {
    if (billingCycle === "yearly") {
      displayedPrice = prices.pro_annual;
      originalPrice = formatOrigPrice(prices.pro_annual_num, 33, prices.pro_annual);
      discountBadge = "🎉 %33 İNDİRİM";
      displayedYearlyLabel = `Yıllık ${prices.pro_annual} · %33 Tasarruf Avantajı`;
    } else {
      displayedPrice = prices.pro_monthly;
      originalPrice = formatOrigPrice(prices.pro_monthly_num, 37, prices.pro_monthly);
      discountBadge = "🔥 %37 İNDİRİM";
    }
  } else if (plan.id === "ultra") {
    if (billingCycle === "yearly") {
      displayedPrice = prices.ultra_annual;
      originalPrice = formatOrigPrice(prices.ultra_annual_num, 31, prices.ultra_annual);
      discountBadge = "👑 %31 İNDİRİM";
      displayedYearlyLabel = `Yıllık ${prices.ultra_annual} · %31 Tasarruf Avantajı`;
    } else {
      displayedPrice = prices.ultra_monthly;
      originalPrice = formatOrigPrice(prices.ultra_monthly_num, 35, prices.ultra_monthly);
      discountBadge = "🔥 %35 İNDİRİM";
    }
  }

  let cardBg = plan.gradient;
  if (isLight) {
    if (plan.id === "pro") cardBg = isSelected ? "#EFF6FF" : "#F8FAFC";
    else if (plan.id === "ultra") cardBg = isSelected ? "#FFFBEB" : "#F8FAFC";
    else cardBg = isSelected ? "#F1F5F9" : "#FFFFFF";
  }

  return (
    <div
      id={`plan-card-${plan.id}`}
      onClick={() => handlePlanSelect(plan.id)}
      style={{
        position: "relative",
        borderRadius: "24px",
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: cardBg,
        border: isSelected
          ? `2px solid ${plan.color}`
          : isLight
          ? "1px solid #E2E8F0"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isSelected
          ? `0 12px 32px ${plan.borderGlow}`
          : isLight
          ? "0 4px 12px rgba(0,0,0,0.03)"
          : "none",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* Badge row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {plan.badge ? (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: plan.badgeColor,
              color: "#FFFFFF",
              boxShadow: `0 2px 8px ${plan.borderGlow}`,
            }}
          >
            {plan.badge}
          </span>
        ) : <div />}

        {discountBadge && (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.72rem",
              fontWeight: 700,
              background: "rgba(239, 68, 68, 0.15)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {discountBadge}
          </span>
        )}
      </div>

      {/* Plan Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PlanBadgeIcon plan={plan.id} size={24} />
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: isLight ? "#0F172A" : "white" }}>
            {plan.name}
          </h3>
          {isCurrent && (
            <span
              style={{
                fontSize: "0.7rem",
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontWeight: 700,
              }}
            >
              Aktif
            </span>
          )}
        </div>

        {/* Pricing Area */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
          <span style={{ fontSize: "2.1rem", fontWeight: 900, color: plan.color }}>
            {displayedPrice}
          </span>
          {originalPrice && (
            <span style={{ textDecoration: "line-through", color: isLight ? "#94A3B8" : "#6B7280", fontSize: "1.1rem" }}>
              {originalPrice}
            </span>
          )}
          {plan.id !== "lite" && (
            <span style={{ fontSize: "0.85rem", color: isLight ? "#64748B" : "#9CA3AF" }}>
              /{billingCycle === "yearly" ? "yıl" : "ay"}
            </span>
          )}
        </div>

        {displayedYearlyLabel && (
          <p style={{ fontSize: "0.78rem", color: isLight ? "#64748B" : "#9CA3AF", marginTop: "4px" }}>
            {displayedYearlyLabel}
          </p>
        )}
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "2px" }}>
        {plan.features.map((feat, idx) => {
          const isInc = feat.included;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: isInc ? 1 : 0.4,
              }}
            >
              {/* Checkmark / Cross Badge */}
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isInc
                    ? isLight
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(16, 185, 129, 0.2)"
                    : isLight
                    ? "rgba(148, 163, 184, 0.12)"
                    : "rgba(255, 255, 255, 0.08)",
                  border: isInc
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                {isInc ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#94A3B8" : "#64748B"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>

              {/* Feature Icon + Text */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <FeatureIcon featureKey={feat.key} color={plan.color} included={isInc} />
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: isInc ? 600 : 400,
                    color: isLight
                      ? isInc ? "#1E293B" : "#64748B"
                      : isInc ? "#F8FAFC" : "#94A3B8",
                  }}
                >
                  {feat.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <button
        disabled={loading || isCurrent}
        onClick={(e) => handleCTAForPlan(plan.id, e)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "16px",
          border: "none",
          fontWeight: 800,
          fontSize: "0.95rem",
          cursor: isCurrent ? "default" : "pointer",
          transition: "all 0.2s ease",
          marginTop: "6px",
          background: isCurrent
            ? isLight
              ? "#E2E8F0"
              : "rgba(255,255,255,0.08)"
            : plan.id === "ultra"
            ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            : plan.id === "pro"
            ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
            : isLight
            ? "#F1F5F9"
            : "rgba(255,255,255,0.1)",
          color: isCurrent
            ? isLight
              ? "#94A3B8"
              : "#6B7280"
            : plan.id === "lite"
            ? isLight
              ? "#475569"
              : "#9CA3AF"
            : "#FFFFFF",
          boxShadow: isSelected && !isCurrent ? `0 6px 20px ${plan.borderGlow}` : "none",
        }}
      >
        {getPlanCtaLabel(plan.id)}
      </button>
    </div>
  );
};

export default PlanCard;
