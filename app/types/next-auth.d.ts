import { DefaultSession, DefaultUser } from 'next-auth';
import { RiderProfile } from '@/app/generated/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      phone?: string | null;
      riderProfile?: RiderProfile | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    riderProfile?: RiderProfile | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    riderProfile?: RiderProfile | null;
  }
}
