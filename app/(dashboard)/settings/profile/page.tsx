'use client';

import { Save, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { profileSchema, type ProfileFormData } from '@/app/lib/schemas';
import { useUserProfile, useUpdateProfile } from '@/app/hooks';

export default function ProfileSettingsPage() {
  // React Hook Form 설정
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // 실시간 유효성 검증
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = form;

  // 사용자 프로필 조회
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // 라이더 통계 조회

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useUpdateProfile();

  // 프로필 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  // 폼 제출 처리
  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      reset(data); // 성공 시 dirty 상태 초기화
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/settings" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">프로필 설정</h1>
          <p className="text-gray-600">개인 정보를 관리하고 라이더 통계를 확인하세요</p>
        </div>
      </div>

      {/* 성공 메시지 */}
      {updateProfileMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">프로필이 성공적으로 업데이트되었습니다!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 편집 폼 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* 이메일 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* 전화번호 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      const formattedValue = value.replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3');
                      e.target.value = formattedValue;
                      register('phone').onChange(e);
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="010-0000-0000"
                    maxLength={13}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              {/* 제출 버튼 */}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isDirty || !isValid || updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {updateProfileMutation.isPending ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 라이더 통계 */}
        <div className="space-y-6 grid grid-rows-1">
          {/* 계정 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">가입일</span>
                <span className="font-medium">{profile ? new Date(profile.createdAt).toLocaleDateString() : '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">계정 ID</span>
                <span className="font-medium font-mono text-xs ">{profile?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {updateProfileMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{updateProfileMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
