import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { apiMessage } from '@/api/client';

export const useBootstrapAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const markReady = useAuthStore((s) => s.markReady);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    // Skip the refresh probe entirely for first-time visitors so we don't
    // produce a noisy 401 in the console. The hint is set on login/refresh
    // success and cleared on logout/401.
    const hasHint = useAuthStore.getState().hasSessionHint;
    if (!hasHint) {
      markReady();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await authApi.refresh();
        if (cancelled) return;
        setAuth({ user: data.user, accessToken: data.accessToken });
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) markReady();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setAuth, markReady, clear]);
};

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken });
      qc.clear();
      const redirect = location.state?.from?.pathname || '/dashboard';
      navigate(redirect, { replace: true });
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}.`);
    },
    onError: (err) => toast.error(apiMessage(err, 'Sign-in failed')),
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken });
      qc.clear();
      navigate('/dashboard', { replace: true });
      toast.success('Your account is ready.');
    },
    onError: (err) => toast.error(apiMessage(err, 'Could not create account')),
  });
};

export const useLogout = () => {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      qc.clear();
      navigate('/login', { replace: true });
    },
  });
};
