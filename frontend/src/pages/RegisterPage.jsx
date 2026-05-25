import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name').max(120),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
});

export default function RegisterPage() {
  const register$ = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (values) => register$.mutate(values);

  return (
    <div className="space-y-7 animate-slide-up">
      <header className="space-y-2">
        <p className="label">Create account</p>
        <h2 className="font-display text-[34px] leading-[1.1] tracking-tightest text-slate-50">
          Set up your workspace.
        </h2>
        <p className="text-[13.5px] text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in instead
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          id="name"
          icon={User}
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Field
          id="email"
          icon={Mail}
          type="email"
          label="Work email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          id="password"
          icon={Lock}
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button type="submit" className="btn-primary w-full" disabled={register$.isPending}>
          {register$.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-[11.5px] text-slate-500 text-center">
        By creating an account, you agree to the Terms of Service and Privacy Policy.
      </p>
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
