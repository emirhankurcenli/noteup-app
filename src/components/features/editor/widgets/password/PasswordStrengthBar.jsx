import React from 'react';
import { calculatePasswordStrength } from './passwordUtils';

const PasswordStrengthBar = ({ password = '' }) => {
  if (!password) return null;
  const { score, label, color } = calculatePasswordStrength(password);
  const percentage = Math.min((score / 5) * 100, 100);

  return (
    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Şifre Gücü</span>
        <span style={{ fontSize: '0.7rem', color: color, fontWeight: 800 }}>{label}</span>
      </div>
      <div style={{
        height: '4px',
        borderRadius: '2px',
        background: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: color,
          transition: 'all 0.3s ease'
        }} />
      </div>
    </div>
  );
};

export default PasswordStrengthBar;
