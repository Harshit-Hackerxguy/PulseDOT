import type { ReactNode } from 'react';
import { Logo } from '../ui/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Pitch-black stage with drifting neon ambient glows and a centered frosted card. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-black px-4 py-12">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] animate-float rounded-full bg-neon/25 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[32rem] w-[32rem] animate-float-slow rounded-full bg-neon-600/20 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[100px]" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <section className="relative w-full max-w-md animate-fade-in-up">
        {/* Glowing border wrapper */}
        <div className="rounded-3xl bg-gradient-to-b from-neon/40 via-white/5 to-transparent p-px shadow-glow-lg">
          <div className="rounded-3xl bg-base-850/60 px-8 py-10 backdrop-blur-2xl sm:px-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <Logo size="lg" />
              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm text-white/50">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-white/50">{footer}</div>
      </section>
    </main>
  );
}
