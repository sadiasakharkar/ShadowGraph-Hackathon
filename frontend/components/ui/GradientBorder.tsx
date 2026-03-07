import { ReactNode } from 'react';

export default function GradientBorder({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-cyan-400/35 via-blue-500/10 to-pink-500/30 p-[1px] ${className}`}>
      <div className="rounded-2xl bg-slate-950/70">{children}</div>
    </div>
  );
}
