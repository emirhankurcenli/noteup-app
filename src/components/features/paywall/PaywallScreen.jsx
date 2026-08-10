import React, { useState, useEffect } from "react";
import PlanCard from "./PlanCard";
import PaywallHeader from "./PaywallHeader";
import { PLANS } from "../../../constants/paywallPlans";
import { paywallStyles as styles } from "./paywallStyles";
import usePaywallBilling from "../../../hooks/usePaywallBilling";

// ─── Paywall Screen Component ─────────────────────────────────────────────────
export default function PaywallScreen({
  currentPlan = "lite",
  onClose,
  onSelectPlan,
  lang = "tr",
  theme = "dark",
}) {
  const isLight = theme === "light";
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Scroll active plan into center view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById(`plan-card-${currentPlan}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPlan]);

  // Billing Hook
  const billing = usePaywallBilling({
    currentPlan,
    onSelectPlan,
    onClose,
    setSelectedPlan,
    billingCycle,
  });

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setTimeout(() => {
      document.getElementById(`plan-card-${planId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  return (
    <div
      style={{
        ...styles.overlay,
        background: isLight ? "rgba(15, 23, 42, 0.45)" : "rgba(0, 0, 0, 0.85)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          ...styles.container,
          background: isLight ? "#FFFFFF" : "#09090f",
          color: isLight ? "#0F172A" : "#FFFFFF",
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              ...styles.closeBtn,
              background: isLight
                ? "rgba(0,0,0,0.06)"
                : "rgba(255,255,255,0.08)",
              border: isLight
                ? "1px solid rgba(0,0,0,0.1)"
                : "1px solid rgba(255,255,255,0.12)",
              color: isLight ? "#475569" : "#9CA3AF",
            }}
            aria-label="Kapat"
            disabled={billing.loading}
          >
            ✕
          </button>
        )}

        {/* Header */}
        <PaywallHeader
          isLight={isLight}
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
          loading={billing.loading}
          styles={styles}
        />

        {/* Plan Cards */}
        <div style={styles.plansContainer}>
          {Object.values(PLANS).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              isCurrent={currentPlan === plan.id}
              isLight={isLight}
              billingCycle={billingCycle}
              prices={billing.prices}
              loading={billing.loading}
              handlePlanSelect={handlePlanSelect}
              handleCTAForPlan={billing.handleCTAForPlan}
              getPlanCtaLabel={billing.getPlanCtaLabel}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
