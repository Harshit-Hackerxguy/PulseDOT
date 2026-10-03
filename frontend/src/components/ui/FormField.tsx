import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
}

/** Frosted-glass input with leading icon, inline error and password visibility toggle. */
export function FormField({ id, label, icon: Icon, error, hint, type = 'text', ...rest }: FormFieldProps) {
  const [reveal, setReveal] = useState(false);
  const describedBy = useId();
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-white/60">
        {label}
      </label>
      <div className="group relative">
        <Icon
          className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            error ? 'text-red-400' : 'text-white/35 group-focus-within:text-neon'
          }`}
        />
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? describedBy : undefined}
          className={`input-glass ${isPassword ? 'pr-11' : ''} ${error ? 'input-error' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            id={`${id}-toggle-visibility`}
            onClick={() => setReveal((r) => !r)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 transition-colors hover:text-neon"
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={describedBy} className={`text-xs ${error ? 'text-red-400' : 'text-white/40'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
