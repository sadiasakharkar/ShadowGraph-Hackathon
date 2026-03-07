'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function GlowButton({ children, onClick, className = '', type = 'button' }: { children: ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(46,230,255,0.42)' }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border border-cyan-300/60 bg-cyan-300/10 px-6 py-3 text-sm font-semibold tracking-[0.16em] text-cyan-100 transition ${className}`}
    >
      {children}
    </motion.button>
  );
}
