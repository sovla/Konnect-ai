'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordSchema, type ResetPasswordFormData } from '@/app/lib/schemas';
import { RedirectIfAuthenticated } from '@/app/components';

function ResetPasswordContent() {
  const [isEmailSent, setIsEmailSent] = useState(false);

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  // 비밀번호 재설정 제출
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('root', {
          message: result.error || '비밀번호 재설정 중 오류가 발생했습니다.',
        });
        return;
      }

      // 이메일 발송 성공
      setIsEmailSent(true);
    } catch (error) {
      console.error('비밀번호 재설정 에러:', error);
      setError('root', {
        message: '비밀번호 재설정 중 오류가 발생했습니다.',
      });
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">이메일이 발송되었습니다</h2>
            <p className="mt-2 text-sm text-gray-600">입력하신 이메일 주소로 비밀번호 재설정 링크를 발송했습니다.</p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">이메일을 확인해주세요</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• 이메일이 도착하지 않은 경우 스팸함을 확인해주세요</p>
                  <p>• 링크는 24시간 동안 유효합니다</p>
                  <p>• 문제가 지속될 경우 고객센터에 문의해주세요</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  다시 보내기
                </button>

                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h2>
          <p className="mt-2 text-sm text-gray-600">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
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
                  placeholder="가입하신 이메일을 입력하세요"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* 재설정 버튼 */}
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
                  <Key className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                {isSubmitting ? '발송 중...' : '재설정 링크 보내기'}
              </button>
            </div>

            {/* 돌아가기 링크 */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <ResetPasswordContent />
    </RedirectIfAuthenticated>
  );
}
