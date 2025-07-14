import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * 서버 컴포넌트에서 인증된 사용자 정보를 가져오는 함수
 */
export async function getAuthenticatedUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * 서버 컴포넌트에서 인증 확인 후 리다이렉트하는 함수
 */
export async function requireAuth(redirectTo: string = '/auth/login') {
  const session = await auth();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

/**
 * 라이더 프로필이 있는지 확인하는 함수
 */
export async function requireRiderProfile(redirectTo: string = '/onboarding') {
  const session = await requireAuth();

  if (!session.user.riderProfile) {
    redirect(redirectTo);
  }

  return session;
}

/**
 * 이메일 유효성 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 유효성 검증
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  if (password.length > 50) {
    errors.push('비밀번호는 50자를 초과할 수 없습니다.');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('비밀번호는 최소 1개의 영문자를 포함해야 합니다.');
  }

  if (!/\d/.test(password)) {
    errors.push('비밀번호는 최소 1개의 숫자를 포함해야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 전화번호 유효성 검증 (한국)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  return phone;
}
