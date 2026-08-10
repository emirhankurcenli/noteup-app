import { triggerHaptic } from '../services/haptics';

// Confetti effect helper
export const triggerConfetti = (blockId) => {
  // Haptic feedback via Capacitor
  triggerHaptic('success');

  const targetEl = document.getElementById(`todo-header-check-${blockId}`);
  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const colors = ['#4A7FA5', '#2E5B80', '#10B981', '#E8501A', '#EF4444', '#C43E12'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 90 + 30;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 10;

    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');

    const duration = Math.random() * 0.5 + 0.5;
    particle.style.animation = `confetti-burst ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), duration * 1000);
  }
};
