'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function PageTransitions({ pageKey, children }: { pageKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
