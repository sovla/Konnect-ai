import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 authorize 함수 시작, credentials:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ credentials 누락');
          return null;
        }

        try {
          console.log('🔍 사용자 조회 시작:', credentials.email);

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            include: {
              riderProfile: true,
            },
          });

          console.log('👤 사용자 조회 결과:', {
            found: !!user,
            hasPassword: !!user?.password,
            userId: user?.id,
          });

          if (!user) {
            console.log('❌ 사용자를 찾을 수 없음');
            return null;
          }

          if (user.password == null) {
            console.log('❌ 사용자 비밀번호가 null');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
          console.log('🔑 비밀번호 검증 결과:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ 비밀번호 불일치');
            return null;
          }

          console.log('✅ 인증 성공, 사용자 정보 반환');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            riderProfile: user.riderProfile,
          };
        } catch (error) {
          console.error('💥 인증 중 오류 발생:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.riderProfile = user.riderProfile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
        session.user.riderProfile = token.riderProfile as typeof session.user.riderProfile;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
