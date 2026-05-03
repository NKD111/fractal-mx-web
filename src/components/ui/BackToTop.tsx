'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 2);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver al inicio"
          className="backtotop-btn"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 96,
            zIndex: 999,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(8,8,8,0.9)',
            border: '1px solid rgba(59,234,59,0.2)',
            cursor: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            backdropFilter: 'blur(10px)',
            outline: 'none',
            transition: 'border-color 250ms, box-shadow 250ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,234,59,0.5)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(59,234,59,0.15)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,234,59,0.2)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 12 L8 4 M4 8 L8 4 L12 8"
              stroke="#3BEA3B" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontSize: 7,
            color: '#3BEA3B',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px',
            lineHeight: 1,
          }}>
            TOP
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
