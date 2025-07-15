'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, type LoginFormData } from '@/app/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // URL 파라미터에서 회원가입 성공 메시지 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('message') === 'registration-success') {
      setShowSuccessMessage(true);
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', '/auth/login');
    }
  }, []);

  // 로그인 제출
  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('root', {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
      } else {
        // 로그인 성공
        router.push('/');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setError('root', {
        message: '로그인 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* 로고 및 제목 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Konnect AI에 로그인</h2>
            <p className="mt-2 text-sm text-gray-600">AI 기반 스마트 배달 대시보드로 돌아오신 것을 환영합니다</p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
            {/* 회원가입 성공 메시지 */}
            {showSuccessMessage && (
              <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">회원가입이 성공적으로 완료되었습니다! 이제 로그인해주세요.</p>
              </div>
            )}

            {/* 에러 메시지 */}
            {errors.root && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 주소
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="비밀번호를 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              {/* 비밀번호 찾기 링크
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link
                    href="/auth/reset-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
              </div> */}
              {/* 로그인 버튼 */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors`}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                  </span>
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </button>
              </div>
              {/* 회원가입 링크 */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  아직 계정이 없으신가요?{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    회원가입하기
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              로그인하시면{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                이용약관
              </Link>{' '}
              및{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
