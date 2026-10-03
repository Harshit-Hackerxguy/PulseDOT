import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';

interface AlertProps {
  variant: 'error' | 'success';
  children: ReactNode;
}

export function Alert({ variant, children }: AlertProps) {
  const isError = variant === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex animate-fade-in-up items-start gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-xl ${
        isError
          ? 'border-red-500/30 bg-red-500/10 text-red-200'
          : 'border-neon/30 bg-neon/10 text-neon-100 shadow-glow-xs'
      }`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? 'text-red-400' : 'text-neon'}`} />
      <span>{children}</span>
    </div>
  );
}
