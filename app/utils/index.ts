// 다른 유틸리티 파일들 re-export
export * from './auth';
export * from './chartUtils';
export * from './dateHelpers';
export * from './formatHelpers';

// 폼 검증 유틸리티 함수들
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};
