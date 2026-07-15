import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';

// ─── Settings ───
export function useSettings() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });

  const settings = {
    id: 1,
    defaultResponseHours: 72,
    admissionFee: 100,
    removalFee: 500,
    whatsappNumber: '+1 901 860 4456',
    telegramLink: '',
    ...data,
  };

  const updateSettings = useCallback((updates: Record<string, unknown>) => {
    // Filter out null values to match Zod schema
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== null) cleanUpdates[key] = val;
    }
    updateMutation.mutate(cleanUpdates as Parameters<typeof updateMutation.mutate>[0]);
  }, [updateMutation]);

  return { settings, updateSettings, isLoading };
}

// ─── Challenges ───
export function useChallenges() {
  const utils = trpc.useUtils();
  const { data: challenges = [], isLoading } = trpc.challenges.list.useQuery();
  const createMutation = trpc.challenges.create.useMutation({
    onSuccess: () => utils.challenges.list.invalidate(),
  });
  const updateMutation = trpc.challenges.update.useMutation({
    onSuccess: () => utils.challenges.list.invalidate(),
  });
  const deleteMutation = trpc.challenges.delete.useMutation({
    onSuccess: () => utils.challenges.list.invalidate(),
  });
  const deleteBulkMutation = trpc.challenges.deleteBulk.useMutation({
    onSuccess: () => utils.challenges.list.invalidate(),
  });
  const acceptMutation = trpc.challenges.accept.useMutation({
    onSuccess: () => utils.challenges.list.invalidate(),
  });
  const expireMutation = trpc.challenges.expire.useMutation({
    onSuccess: () => {
      utils.challenges.list.invalidate();
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });

  const activeChallenges = challenges.filter(c => c.status === 'pending');
  const confirmedChallenges = challenges.filter(c => c.status === 'confirmed');

  const addChallenge = useCallback((challenge: unknown) => {
    createMutation.mutate(challenge as Parameters<typeof createMutation.mutate>[0]);
  }, [createMutation]);

  const updateChallenge = useCallback((id: number, updates: unknown) => {
    const u = updates as Record<string, unknown>;
    updateMutation.mutate({ id, ...u });
  }, [updateMutation]);

  const deleteChallenge = useCallback((id: number) => {
    deleteMutation.mutate({ id });
  }, [deleteMutation]);

  const deleteChallengesBulk = useCallback((ids: number[]) => {
    deleteBulkMutation.mutate({ ids });
  }, [deleteBulkMutation]);

  const moveToConfirmed = useCallback((id: number) => {
    acceptMutation.mutate({ id });
  }, [acceptMutation]);

  const moveToExpired = useCallback((id: number) => {
    expireMutation.mutate({ id });
  }, [expireMutation]);

  return {
    challenges,
    activeChallenges,
    confirmedChallenges,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    deleteChallengesBulk,
    moveToConfirmed,
    moveToExpired,
    isLoading,
  };
}

// ─── Shame ───
export function useShame() {
  const utils = trpc.useUtils();
  const { data: shameEntries = [], isLoading } = trpc.shame.list.useQuery();
  const createMutation = trpc.shame.create.useMutation({
    onSuccess: () => {
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });
  const updateMutation = trpc.shame.update.useMutation({
    onSuccess: () => {
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });
  const deleteMutation = trpc.shame.delete.useMutation({
    onSuccess: () => {
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });
  const deleteBulkMutation = trpc.shame.deleteBulk.useMutation({
    onSuccess: () => {
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });
  const markPaidMutation = trpc.shame.markPaid.useMutation({
    onSuccess: () => {
      utils.shame.list.invalidate();
      utils.shame.listUnpaid.invalidate();
    },
  });

  const addShameEntry = useCallback((entry: unknown) => {
    createMutation.mutate(entry as Parameters<typeof createMutation.mutate>[0]);
  }, [createMutation]);

  const updateShameEntry = useCallback((id: number, updates: unknown) => {
    const u = updates as Record<string, unknown>;
    updateMutation.mutate({ id, ...u });
  }, [updateMutation]);

  const deleteShameEntry = useCallback((id: number) => {
    deleteMutation.mutate({ id });
  }, [deleteMutation]);

  const deleteShameEntriesBulk = useCallback((ids: number[]) => {
    deleteBulkMutation.mutate({ ids });
  }, [deleteBulkMutation]);

  const markAsPaid = useCallback((id: number) => {
    markPaidMutation.mutate({ id });
  }, [markPaidMutation]);

  return {
    shameEntries,
    addShameEntry,
    updateShameEntry,
    deleteShameEntry,
    deleteShameEntriesBulk,
    markAsPaid,
    isLoading,
  };
}

// ─── Admin Auth ───
export function useAdminAuth() {
  const [adminState, setAdminState] = useState<{
    isLoggedIn: boolean;
    email: string;
    loginAttempts: number;
  }>(() => {
    try {
      const stored = localStorage.getItem('witc_admin');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { isLoggedIn: false, email: 'ali.jasser@aol.com', loginAttempts: 0 };
  });

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        const newState = { isLoggedIn: true, email: 'ali.jasser@aol.com', loginAttempts: 0 };
        setAdminState(newState);
        localStorage.setItem('witc_admin', JSON.stringify(newState));
      } else {
        const newState = { ...adminState, loginAttempts: adminState.loginAttempts + 1 };
        setAdminState(newState);
        localStorage.setItem('witc_admin', JSON.stringify(newState));
      }
    },
  });

  const login = useCallback((email: string, password: string) => {
    if (adminState.loginAttempts >= 3) return false;
    loginMutation.mutate({ email, password });
    return true; // async, will update state on success
  }, [loginMutation, adminState.loginAttempts]);

  const logout = useCallback(() => {
    const newState = { isLoggedIn: false, email: 'ali.jasser@aol.com', loginAttempts: 0 };
    setAdminState(newState);
    localStorage.setItem('witc_admin', JSON.stringify(newState));
  }, []);

  const resetAttempts = useCallback(() => {
    const newState = { ...adminState, loginAttempts: 0 };
    setAdminState(newState);
    localStorage.setItem('witc_admin', JSON.stringify(newState));
  }, [adminState]);

  return {
    adminState,
    login,
    logout,
    resetAttempts,
    isLockedOut: adminState.loginAttempts >= 3,
    remainingAttempts: Math.max(0, 3 - adminState.loginAttempts),
  };
}
