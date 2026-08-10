import React, { useState, useEffect } from "react";
import { CryptoService } from "../../../services/cryptoService";

/**
 * PasswordBlock — Encrypted Password Vault Block Component
 */
export const PasswordBlock = ({
  block,
  userId,
  onUpdateBlock,
  onDeleteBlock,
  triggerHaptic,
  t = (key) => key,
}) => {
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const rawPasswordVal = block.passwordVal || "";
  const title = block.title || "";
  const username = block.username || "";

  // Decrypt password on demand if encrypted with AES-256-GCM
  useEffect(() => {
    let isMounted = true;
    if (rawPasswordVal.startsWith("ENC:v1:")) {
      CryptoService.decrypt(
        rawPasswordVal,
        userId || "NoteUp_Guest_Vault",
      ).then((dec) => {
        if (isMounted) setDecryptedPassword(dec || "");
      });
    } else {
      setDecryptedPassword(rawPasswordVal);
    }
    return () => {
      isMounted = false;
    };
  }, [rawPasswordVal, userId]);

  const handleCopy = async (field, text) => {
    if (!text) return;
    const textToCopy = text.startsWith("ENC:v1:")
      ? await CryptoService.decrypt(text, userId || "NoteUp_Guest_Vault")
      : text;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField(field);
    if (triggerHaptic) triggerHaptic("success");
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handlePasswordChange = async (newVal) => {
    setDecryptedPassword(newVal);
    if (!newVal) {
      onUpdateBlock(block.id, { passwordVal: "" });
      return;
    }
    try {
      const encrypted = await CryptoService.encrypt(newVal, userId || "NoteUp_Guest_Vault");
      onUpdateBlock(block.id, { passwordVal: encrypted });
    } catch (e) {
      onUpdateBlock(block.id, { passwordVal: newVal });
    }
  };

  return (
    <div className="password-widget">
      {/* Header */}
      <div className="password-widget-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {t("pwdTitle") || "Şifre Kasası"}
          </span>
        </div>
        {onDeleteBlock && (
          <button
            className="block-delete-btn"
            onClick={() => onDeleteBlock(block.id)}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Title Field */}
      <div className="password-field-group">
        <label className="password-field-label">
          {t("pwdName") || "Hesap / Başlık"}
        </label>
        <input
          className="password-field-input"
          type="text"
          placeholder={t("pwdNamePlaceholder") || "Örn: Google, Netflix"}
          value={title}
          onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
        />
      </div>

      {/* Username / Email Field */}
      <div className="password-field-group">
        <label className="password-field-label">
          {t("pwdUser") || "Kullanıcı Adı / E-posta"}
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            className="password-field-input"
            type="text"
            placeholder={t("pwdUserPlaceholder") || "kullanici@mail.com"}
            value={username}
            onChange={(e) =>
              onUpdateBlock(block.id, { username: e.target.value })
            }
          />
          <button
            className={`password-action-btn ${copiedField === "username" ? "copied" : ""}`}
            onClick={() => handleCopy("username", username)}
          >
            {copiedField === "username" ? "✓" : "Kopyala"}
          </button>
        </div>
      </div>

      {/* Password Field (AES-256 E2EE Protected) */}
      <div className="password-field-group">
        <label className="password-field-label">
          {t("pwdPass") || "Şifre"}
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            className="password-field-input"
            type={isVisible ? "text" : "password"}
            placeholder={t("pwdPassPlaceholder") || "••••••••"}
            value={decryptedPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              className="password-action-btn"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? "Gizle" : "Göster"}
            </button>
            <button
              className={`password-action-btn ${copiedField === "password" ? "copied" : ""}`}
              onClick={() => handleCopy("password", decryptedPassword)}
            >
              {copiedField === "password" ? "✓" : "Kopyala"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordBlock;
