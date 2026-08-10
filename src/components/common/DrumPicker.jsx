import React, { useState, useEffect, useRef } from 'react';

// Safe helper to parse "YYYY-MM-DDTHH:mm" datetime string
const parseDateTimeString = (val) => {
  const now = new Date();
  if (!val || typeof val !== 'string') return now;
  const parts = val.split('T');
  if (parts.length !== 2) return now;
  const [datePart, timePart] = parts;
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minStr] = timePart.split(':');
  
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const h = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(day) || isNaN(h) || isNaN(min)) return now;
  return new Date(y, m, day, h, min);
};

const ITEM_H = 40;

function DrumColumn({ items, selectedIndex, onChange, label, triggerHaptic }) {
  const listRef = useRef(null);
  const scrollTimeout = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = selectedIndex * ITEM_H;
    }
    const timer = setTimeout(() => {
      setIsReady(true);
      if (el) {
        el.scrollTop = selectedIndex * ITEM_H;
      }
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const el = listRef.current;
    if (!el) return;
    const targetTop = selectedIndex * ITEM_H;
    if (Math.abs(el.scrollTop - targetTop) > 2) {
      el.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, [selectedIndex, isReady]);

  const handleScroll = (e) => {
    if (!isReady) return;
    const el = e.currentTarget;
    if (el.clientHeight === 0) return;
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      if (clamped !== selectedIndex) {
        triggerHaptic?.('light');
        onChange(clamped);
      }
    }, 100);
  };

  const handleItemClick = (idx) => {
    if (!isReady) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    onChange(idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      {label && (
        <span style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: 'var(--text-secondary)', 
          opacity: 0.8,
          letterSpacing: '0.06em', 
          textTransform: 'uppercase', 
          marginBottom: '8px' 
        }}>
          {label}
        </span>
      )}
      <div style={{ 
        position: 'relative', 
        height: `${ITEM_H * 3}px`, 
        width: '100%', 
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Selection overlay */}
        <div style={{
          position: 'absolute', 
          left: '6px', 
          right: '6px',
          top: `${ITEM_H}px`, 
          height: `${ITEM_H}px`,
          background: 'var(--btn-primary-bg)',
          opacity: 0.15,
          borderRadius: '10px',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        
        {/* Fade gradients */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, 
          height: `${ITEM_H}px`, 
          background: 'linear-gradient(to bottom, var(--bg-surface-elevated) 20%, transparent 100%)', 
          zIndex: 2, 
          pointerEvents: 'none' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: 0, left: 0, right: 0, 
          height: `${ITEM_H}px`, 
          background: 'linear-gradient(to top, var(--bg-surface-elevated) 20%, transparent 100%)', 
          zIndex: 2, 
          pointerEvents: 'none' 
        }} />

        {/* Scrollable list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="drum-scroll-container"
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>{`.drum-scroll-container::-webkit-scrollbar { display: none; }`}</style>
          <div style={{ height: `${ITEM_H}px`, shrink: 0 }} />
          
          {items.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={i}
                onClick={() => handleItemClick(i)}
                style={{
                  height: `${ITEM_H}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSelected ? '1.1rem' : '0.88rem',
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                  scrollSnapAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                {item.label}
              </div>
            );
          })}

          <div style={{ height: `${ITEM_H}px`, shrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

function DrumSeparator() {
  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: '20px', 
      fontSize: '1.4rem', 
      fontWeight: 800, 
      color: 'var(--primary)', 
      opacity: 0.6,
      flexShrink: 0,
      width: '12px'
    }}>:</div>
  );
}

const DrumPicker = ({ value, onChange, lang = 'tr', triggerHaptic }) => {
  const initial = parseDateTimeString(value);

  const monthNames = lang === 'tr'
    ? ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear + i;
    return { label: String(y), value: y };
  });
  const months = monthNames.map((m, i) => ({ label: m, value: i }));
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const hours = Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i }));

  const [selYear, setSelYear] = useState(() => {
    const idx = years.findIndex(y => y.value === initial.getFullYear());
    return idx >= 0 ? idx : 0;
  });
  const [selMonth, setSelMonth] = useState(initial.getMonth());
  const [selDay, setSelDay] = useState(() => initial.getDate() - 1);
  const [selHour, setSelHour] = useState(initial.getHours());
  const [selMinute, setSelMinute] = useState(initial.getMinutes());

  useEffect(() => {
    const parsed = parseDateTimeString(value);
    const idx = years.findIndex(y => y.value === parsed.getFullYear());
    setSelYear(idx >= 0 ? idx : 0);
    setSelMonth(parsed.getMonth());
    setSelDay(parsed.getDate() - 1);
    setSelHour(parsed.getHours());
    setSelMinute(parsed.getMinutes());
  }, [value]);

  const year = years[selYear]?.value ?? currentYear;
  const month = selMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1).padStart(2, '0'), value: i + 1 }));
  
  const clampedDay = Math.min(selDay, daysInMonth - 1);

  useEffect(() => {
    const d = clampedDay + 1;
    const h = selHour;
    const m = selMinute;
    const y = year;
    const mo = month;
    const dateStr = `${y}-${String(mo + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    if (dateStr !== value) {
      onChange(dateStr);
    }
  }, [selYear, selMonth, clampedDay, selHour, selMinute]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Date row */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'var(--bg-surface-elevated)', 
        borderRadius: '20px', 
        padding: '12px', 
        border: '1px solid var(--border-color)' 
      }}>
        <DrumColumn
          items={days}
          selectedIndex={clampedDay}
          onChange={(i) => setSelDay(i)}
          label={lang === 'tr' ? 'Gün' : 'Day'}
          triggerHaptic={triggerHaptic}
        />
        <DrumColumn
          items={months}
          selectedIndex={selMonth}
          onChange={(i) => setSelMonth(i)}
          label={lang === 'tr' ? 'Ay' : 'Month'}
          triggerHaptic={triggerHaptic}
        />
        <DrumColumn
          items={years}
          selectedIndex={selYear}
          onChange={(i) => setSelYear(i)}
          label={lang === 'tr' ? 'Yıl' : 'Year'}
          triggerHaptic={triggerHaptic}
        />
      </div>
      {/* Time row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        background: 'var(--bg-surface-elevated)', 
        borderRadius: '20px', 
        padding: '12px 24px', 
        border: '1px solid var(--border-color)', 
        justifyContent: 'center' 
      }}>
        <DrumColumn
          items={hours}
          selectedIndex={selHour}
          onChange={(i) => setSelHour(i)}
          label={lang === 'tr' ? 'Saat' : 'Hour'}
          triggerHaptic={triggerHaptic}
        />
        <DrumSeparator />
        <DrumColumn
          items={minutes}
          selectedIndex={selMinute}
          onChange={(i) => setSelMinute(i)}
          label={lang === 'tr' ? 'Dakika' : 'Minute'}
          triggerHaptic={triggerHaptic}
        />
      </div>
    </div>
  );
};

export default DrumPicker;
