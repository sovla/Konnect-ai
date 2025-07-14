'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';

import { ResetPasswordFormData, FormErrors } from '@/app/types';
import { validateEmail, validateRequired } from '@/app/utils';
import { RedirectIfAuthenticated } from '@/app/components';

function ResetPasswordContent() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 실시간 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.email)) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 비밀번호 재설정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || '비밀번호 재설정 요청 중 오류가 발생했습니다.' });
        return;
      }

      // 이메일 전송 성공
      setIsEmailSent(true);
    } catch (error) {
      console.error('비밀번호 재설정 에러:', error);
      setErrors({ general: '비밀번호 재설정 요청 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 다시 이메일 전송
  const handleResendEmail = () => {
    setIsEmailSent(false);
    setErrors({});
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* 성공 메시지 */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">이메일을 확인하세요</h2>
            <p className="mt-2 text-sm text-gray-600">
              비밀번호 재설정 링크를 <span className="font-medium text-blue-600">{formData.email}</span>로 전송했습니다.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
            <div className="space-y-6">
              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">이메일 확인이 필요합니다</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>이메일이 도착하지 않았다면 스팸 폴더를 확인해보세요.</li>
                        <li>링크는 24시간 동안 유효합니다.</li>
                        <li>이메일을 받지 못했다면 아래 버튼을 클릭하여 다시 요청할 수 있습니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 다시 전송 버튼 */}
              <div>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="w-full flex justify-center py-3 px-4 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  이메일 다시 전송
                </button>
              </div>

              {/* 로그인으로 돌아가기 */}
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
            <Key className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h2>
          <p className="mt-2 text-sm text-gray-600">
            계정에 연결된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
          {/* 에러 메시지 */}
          {errors.general && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="계정 이메일을 입력하세요"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* 재설정 링크 전송 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    전송 중...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    재설정 링크 전송
                  </>
                )}
              </button>
            </div>

            {/* 로그인/회원가입 링크 */}
            <div className="text-center space-y-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                로그인으로 돌아가기
              </Link>
              <p className="text-sm text-gray-600">
                아직 계정이 없으신가요?{' '}
                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  회원가입하기
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* 도움말 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            계정에 문제가 있으시면{' '}
            <Link href="/help/contact" className="text-blue-600 hover:text-blue-500">
              고객지원팀
            </Link>
            에 문의해주세요.
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
