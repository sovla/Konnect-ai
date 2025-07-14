import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Konnect AI - 사용자 인증',
  description: 'Konnect AI 로그인 및 회원가입',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
