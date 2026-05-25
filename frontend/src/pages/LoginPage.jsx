import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'ada@demo.dev', password: 'Password123!' },
  });

  const onSubmit = (values) => login.mutate(values);

  return (
    <div className="space-y-7 animate-slide-up">
      <header className="space-y-2">
        <p className="label">Sign in</p>
        <h2 className="font-display text-[34px] leading-[1.1] tracking-tightest text-slate-50">
          Welcome back.
        </h2>
        <p className="text-[13.5px] text-slate-400">
          New to Cobalt?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Create an account
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <button type="submit" className="btn-primary w-full" disabled={login.isPending}>
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="rounded-lg border border-white/[0.05] bg-surface-925/70 p-3.5 text-[12px] text-slate-400 space-y-1">
        <p className="font-medium text-slate-300 mb-1">Demo accounts (after seeding)</p>
        <p><span className="font-mono">ada@demo.dev</span> · <span className="font-mono">Password123!</span></p>
        <p><span className="font-mono">grace@demo.dev</span> · <span className="font-mono">Password123!</span></p>
      </div>
    </div>
  );
}

const Field = forwardRef(({ id, icon: Icon, label, error, ...props }, ref) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="label">{label}</label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
      <input id={id} ref={ref} className="input pl-9" {...props} />
    </div>
    {error && <p className="text-[11.5px] text-rose-400">{error}</p>}
  </div>
));
Field.displayName = 'Field';
