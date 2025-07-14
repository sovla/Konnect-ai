import { create } from 'zustand';
import { Session } from 'next-auth';
import { RiderProfile } from '@/app/generated/prisma';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  user: Session['user'] | null;
  riderProfile: RiderProfile | null;
  isLoading: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateRiderProfile: (profile: RiderProfile) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  session: null,
  isAuthenticated: false,
  user: null,
  riderProfile: null,
  isLoading: true,

  // Actions
  setSession: (session) => {
    set({
      session,
      isAuthenticated: !!session,
      user: session?.user || null,
      riderProfile: session?.user?.riderProfile || null,
      isLoading: false,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearAuth: () => {
    set({
      session: null,
      isAuthenticated: false,
      user: null,
      riderProfile: null,
      isLoading: false,
    });
  },

  updateRiderProfile: (profile) => {
    const { session } = get();
    if (session?.user) {
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          riderProfile: profile,
        },
      };
      set({
        session: updatedSession,
        riderProfile: profile,
      });
    }
  },
}));
