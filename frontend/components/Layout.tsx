import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass mb-6 flex items-center justify-between rounded-2xl px-5 py-3 shadow-neon"
      >
        <Link href="/" className="text-xl font-semibold tracking-wider text-neon">
          SHADOWGRAPH
        </Link>
        <nav className="flex gap-4 text-sm text-slate-200">
          <Link href="/setup">Identity Setup</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </motion.header>
      {children}
    </div>
  );
}
