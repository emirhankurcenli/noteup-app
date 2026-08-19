import React from 'react';

const StarRatingSelector = ({ rating, setRating, triggerHaptic, isLight }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
      {[1, 2, 3, 4, 5].map((star) => (
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
            fontSize: '1.8rem',
            cursor: 'pointer',
            padding: '4px',
            color: star <= rating ? '#F59E0B' : (isLight ? '#CBD5E1' : '#334155'),
            transition: 'transform 0.15s ease, color 0.15s ease',
            transform: star <= rating ? 'scale(1.15)' : 'scale(1)'
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRatingSelector;
