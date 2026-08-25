import React from 'react';

const StarIcon = ({ filled = false, color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRatingSelector = ({ rating, setRating, triggerHaptic, isLight }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        const color = isFilled ? '#F59E0B' : (isLight ? '#CBD5E1' : '#334155');
        return (
          <button
            key={star}
            type="button"
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setRating(star);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              transform: isFilled ? 'scale(1.15)' : 'scale(1)'
            }}
          >
            <StarIcon filled={isFilled} color={color} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingSelector;
