'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

function SpeakerOn() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 8H7L12 3V19L7 14H3V8Z"
        stroke="#3BEA3B" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(59,234,59,0.08)" />
      <path d="M15 7.5C16.5 9 16.5 13 15 14.5"
        stroke="#3BEA3B" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17.5 5C20 7.5 20 14.5 17.5 17"
        stroke="#3BEA3B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 8H7L12 3V19L7 14H3V8Z"
        stroke="#555" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="15" y1="8" x2="20" y2="14" stroke="#555" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="8" x2="15" y2="14" stroke="#555" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AudioToggle() {
  const { enabled, toggle } = useAudio();

  return (
    <div
      className="audio-toggle-wrap"
      style={{
        position: 'fixed',
        bottom: 96,
        right: 24,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <style>{`
        @keyframes audio-active-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @media (max-width: 480px) {
          .audio-toggle-wrap { bottom: 88px !important; right: 16px !important; }
          .backtotop-btn { bottom: 16px !important; left: 16px !important; }
        }
      `}</style>

      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5rem',
          letterSpacing: '0.16em',
          color: enabled ? 'rgba(59,234,59,0.7)' : 'rgba(100,100,100,0.6)',
          textTransform: 'uppercase',
          transition: 'color 300ms',
          userSelect: 'none',
        }}
      >
        {enabled ? 'SFX ON' : 'SFX OFF'}
      </span>

      {/* Button */}
      <div style={{ position: 'relative' }}>
        {/* Pulse ring when active */}
        {enabled && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              border: '1px solid rgba(59,234,59,0.5)',
              animation: 'audio-active-ring 1.6s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        <motion.button
          onClick={toggle}
          aria-label={enabled ? 'Desactivar audio' : 'Activar audio'}
          whileTap={{ scale: 0.88 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, type: 'spring', stiffness: 180 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: enabled
              ? 'rgba(8,8,8,0.95)'
              : 'rgba(14,14,14,0.9)',
            border: enabled
              ? '1.5px solid rgba(59,234,59,0.55)'
              : '1.5px solid rgba(80,80,80,0.4)',
            cursor: 'crosshair',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            outline: 'none',
            boxShadow: enabled
              ? '0 0 18px rgba(59,234,59,0.22), 0 0 40px rgba(59,234,59,0.06), inset 0 0 10px rgba(59,234,59,0.04)'
              : '0 0 12px rgba(0,0,0,0.4)',
            transition: 'border-color 300ms, box-shadow 300ms, background 300ms',
          }}
        >
          <AnimatePresence mode="wait">
            {enabled ? (
              <motion.span
                key="on"
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <SpeakerOn />
              </motion.span>
            ) : (
              <motion.span
                key="off"
                initial={{ opacity: 0, scale: 0.6, rotate: 15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: -15 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <SpeakerOff />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
