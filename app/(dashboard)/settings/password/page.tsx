'use client';

import { Save, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { useChangePassword } from '@/app/hooks';
import { ChangePasswordRequestSchema, type ChangePasswordRequest } from '@/app/types/dto';

export default function PasswordSettingsPage() {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // React Hook Form 설정
  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(ChangePasswordRequestSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = form;

  // 실시간으로 비밀번호 값 감시
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  // 비밀번호 변경 훅 사용
  const changePasswordMutation = useChangePassword();

  // 비밀번호 강도 체크 함수
  const getPasswordStrength = (password: string) => {
    const checks = [{ check: password.length >= 8, text: '최소 8자 이상' }];
    return checks;
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: ChangePasswordRequest) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      reset(); // 성공 시 폼 초기화
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
    }
  };

  const passwordStrengthChecks = getPasswordStrength(newPassword || '');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/settings" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">비밀번호 변경</h1>
          <p className="text-gray-600">계정 보안을 위해 정기적으로 비밀번호를 변경하세요</p>
        </div>
      </div>

      {/* 성공 메시지 */}
      {changePasswordMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">비밀번호가 성공적으로 변경되었습니다!</p>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 폼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900">새 비밀번호 설정</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호 *</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                {...register('currentPassword')}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="현재 비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 *</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                {...register('newPassword')}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="새 비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}

            {/* 비밀번호 강도 표시 */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                <div className="space-y-1">
                  {passwordStrengthChecks.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {requirement.check ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-300" />
                      )}
                      <span className={requirement.check ? 'text-green-700' : 'text-gray-500'}>{requirement.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인 *</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>} */}

            {/* 비밀번호 일치 확인 */}
            {confirmPassword && newPassword && (
              <div className="mt-2">
                {newPassword === confirmPassword ? (
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>비밀번호가 일치합니다</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <XCircle className="w-3 h-3" />
                    <span>비밀번호가 일치하지 않습니다</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isValid || changePasswordMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </div>

      {/* 보안 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">🔒 보안 팁</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 다른 사이트와 동일한 비밀번호를 사용하지 마세요</li>
          <li>• 개인정보(이름, 생일 등)를 포함하지 마세요</li>
          <li>• 정기적으로 비밀번호를 변경하세요</li>
          <li>• 비밀번호는 안전한 곳에 보관하세요</li>
        </ul>
      </div>

      {/* 에러 메시지 */}
      {changePasswordMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{changePasswordMutation.error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
