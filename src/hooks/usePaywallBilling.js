import { useState, useEffect } from "react";
import { Purchases } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { PLANS } from "../constants/paywallPlans";
import { getRevenueCatApiKey } from "../services/billing";

const usePaywallBilling = ({
  currentPlan,
  onSelectPlan,
  onClose,
  setSelectedPlan,
  billingCycle,
}) => {
  const [loading, setLoading] = useState(false);
  const [rawPackages, setRawPackages] = useState([]);
  const [packages, setPackages] = useState({
    pro_monthly: null,
    pro_annual: null,
    ultra_monthly: null,
    ultra_annual: null,
  });

  const [prices, setPrices] = useState({
    pro_monthly: "₺49,99",
    pro_monthly_orig: "₺79,99",
    pro_annual: "₺399,00",
    pro_annual_orig: "₺599,00",
    ultra_monthly: "₺129,99",
    ultra_monthly_orig: "₺199,99",
    ultra_annual: "₺999,00",
    ultra_annual_orig: "₺1.499,00",
    // Numeric values for dynamic discount calculation
    pro_monthly_num: 49.99,
    pro_annual_num: 399.00,
    ultra_monthly_num: 129.99,
    ultra_annual_num: 999.00,
  });

  useEffect(() => {
    async function loadOfferings() {
      if (!Capacitor.isNativePlatform()) return;
      try {
        setLoading(true);
        const apiKey = getRevenueCatApiKey();
        if (apiKey) {
          await Purchases.configure({ apiKey });
        }
        const offerings = await Purchases.getOfferings();

        if (
          offerings &&
          offerings.current &&
          offerings.current.availablePackages
        ) {
          const pkgs = offerings.current.availablePackages;
          setRawPackages(pkgs);

          const newPkgs = {};
          const newPrices = { ...prices };

          pkgs.forEach((pkg) => {
            const pkgId = (pkg.identifier || "").toLowerCase();
            const prodId = (pkg.product?.identifier || "").toLowerCase();

            if (
              pkgId === "$rc_monthly" ||
              prodId.includes("pro_monthly") ||
              pkgId.includes("pro_monthly")
            ) {
              newPkgs.pro_monthly = pkg;
              if (pkg.product?.priceString)
                newPrices.pro_monthly = pkg.product.priceString;
              if (pkg.product?.price)
                newPrices.pro_monthly_num = pkg.product.price;
            }
            if (
              pkgId === "$rc_annual" ||
              prodId.includes("pro_annual") ||
              pkgId.includes("pro_annual")
            ) {
              newPkgs.pro_annual = pkg;
              if (pkg.product?.priceString)
                newPrices.pro_annual = pkg.product.priceString;
              if (pkg.product?.price)
                newPrices.pro_annual_num = pkg.product.price;
            }
            if (
              pkgId.includes("ultra_monthly") ||
              prodId.includes("ultra_monthly")
            ) {
              newPkgs.ultra_monthly = pkg;
              if (pkg.product?.priceString)
                newPrices.ultra_monthly = pkg.product.priceString;
              if (pkg.product?.price)
                newPrices.ultra_monthly_num = pkg.product.price;
            }
            if (
              pkgId.includes("ultra_annual") ||
              prodId.includes("ultra_annual")
            ) {
              newPkgs.ultra_annual = pkg;
              if (pkg.product?.priceString)
                newPrices.ultra_annual = pkg.product.priceString;
              if (pkg.product?.price)
                newPrices.ultra_annual_num = pkg.product.price;
            }
          });

          setPackages(newPkgs);
          setPrices(newPrices);
        }
      } catch (err) {
        console.error("RevenueCat offerings load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOfferings();
  }, []);

  const handleCTAForPlan = async (planId, e) => {
    if (e) e.stopPropagation();
    if (loading) return;
    if (planId === currentPlan) return;

    setSelectedPlan(planId);

    if (planId === "lite") {
      // Lite'a geç: onay modali olmadan doğrudan uygula
      if (onSelectPlan) onSelectPlan("lite", false);
      if (onClose) onClose();
      return;
    }

    const packageKey = `${planId}_${billingCycle === "yearly" ? "annual" : "monthly"}`;
    let targetPackage = packages[packageKey];

    if (!targetPackage && rawPackages.length > 0) {
      targetPackage =
        rawPackages.find((p) => {
          const pId = (p.identifier || "").toLowerCase();
          const prodId = (p.product?.identifier || "").toLowerCase();
          return pId.includes(planId) || prodId.includes(planId);
        }) || rawPackages[0];
    }

    if (Capacitor.isNativePlatform()) {
      if (!targetPackage) {
        // Google Play ürünleri yüklenemedi, sessizce dön
        console.warn("[Paywall] Hedef paket bulunamadı:", planId);
        return;
      }
      try {
        setLoading(true);
        const result = await Purchases.purchasePackage({
          aPackage: targetPackage,
        });
        const customerInfo = result.customerInfo;

        const active = customerInfo?.entitlements?.active || {};
        let activePlan = "lite";
        if (
          active["ultra"] !== undefined ||
          active["NoteUp Ultra"] !== undefined ||
          active["Ultra"] !== undefined
        ) {
          activePlan = "ultra";
        } else if (
          active["pro"] !== undefined ||
          active["NoteUp Pro"] !== undefined ||
          active["Pro"] !== undefined
        ) {
          activePlan = "pro";
        }

        if (onSelectPlan) onSelectPlan(activePlan);
        if (onClose) onClose();
      } catch (err) {
        if (err && !err.userCancelled) {
          alert("Satın alma işlemi başarısız oldu: " + (err.message || err));
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (onSelectPlan) onSelectPlan(planId, true);
        if (onClose) onClose();
      }, 1000);
    }
  };

  const getPlanCtaLabel = (planId) => {
    if (planId === currentPlan) {
      return "Mevcut Planınız";
    }
    if (planId === "lite") {
      return "Lite Sürüme Geç";
    }
    const planName = PLANS[planId]?.name || "Pro";
    return `${planName}'a Geç — 7 Gün Ücretsiz Dene`;
  };

  return {
    loading,
    setLoading,
    prices,
    handleCTAForPlan,
    getPlanCtaLabel,
  };
};

export default usePaywallBilling;
