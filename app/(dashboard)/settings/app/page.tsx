'use client';

import { Save, Palette, Globe, Map, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { useAppSettings, useUpdateAppSettings } from '@/app/hooks';
import { UpdateUserSettingsRequestSchema, type UpdateUserSettingsRequest } from '@/app/types/dto';
import { QueryWrapper } from '@/app/components/common/DataWrapper';

const themeOptions = [
  { value: 'LIGHT' as const, label: '라이트 모드', description: '밝은 테마' },
  { value: 'DARK' as const, label: '다크 모드', description: '어두운 테마' },
  { value: 'SYSTEM' as const, label: '시스템 설정', description: '기기 설정을 따름' },
];

const languageOptions = [
  { value: 'KOREAN' as const, label: '한국어', description: '대한민국' },
  { value: 'ENGLISH' as const, label: 'English', description: 'United States' },
];

export default function AppSettingsPage() {
  // 설정 훅들 사용
  const appSettingsQuery = useAppSettings();
  const updateSettingsMutation = useUpdateAppSettings();

  // React Hook Form 설정
  const form = useForm<UpdateUserSettingsRequest>({
    resolver: zodResolver(UpdateUserSettingsRequestSchema),
    mode: 'onChange',
    defaultValues: {
      theme: 'LIGHT',
      language: 'KOREAN',
      mapDefaultZoom: 12,
      mapDefaultLat: 37.5665,
      mapDefaultLng: 126.978,
      mapTrafficLayer: true,
      mapTransitLayer: false,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = form;

  // 실시간으로 값들 감시
  const theme = watch('theme');
  const language = watch('language');
  const mapDefaultZoom = watch('mapDefaultZoom');

  // 설정 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (appSettingsQuery.data) {
      const settings = appSettingsQuery.data;
      reset({
        theme: settings.theme,
        language: settings.language,
        mapDefaultZoom: settings.mapDefaultZoom,
        mapDefaultLat: settings.mapDefaultLat,
        mapDefaultLng: settings.mapDefaultLng,
        mapTrafficLayer: settings.mapTrafficLayer,
        mapTransitLayer: settings.mapTransitLayer,
      });
    }
  }, [appSettingsQuery.data, reset]);

  // 폼 제출 처리
  const onSubmit = async (data: UpdateUserSettingsRequest) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
      reset(data); // 성공 시 dirty 상태 초기화
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/settings" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">앱 환경 설정</h1>
          <p className="text-gray-600">테마, 언어, 지도 등 앱 환경을 설정하세요</p>
        </div>
      </div>

      {/* 성공 메시지 */}
      {updateSettingsMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">설정이 성공적으로 업데이트되었습니다!</p>
        </div>
      )}

      {/* 데이터 래퍼로 로딩/에러 처리 */}
      <QueryWrapper
        query={appSettingsQuery}
        loadingMessage="앱 설정을 불러오는 중..."
        errorMessage="앱 설정을 불러오는데 실패했습니다"
        loadingSkeleton={
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        }
      >
        {(settings) => (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 테마 설정 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-900">테마 설정</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">앱의 외관을 선택하세요</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <input
                        type="radio"
                        id={`theme-${option.value}`}
                        value={option.value}
                        {...register('theme')}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`theme-${option.value}`}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          theme === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.theme && <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>}
              </div>
            </div>

            {/* 언어 설정 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-900">언어 설정</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">앱에서 사용할 언어를 선택하세요</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languageOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <input
                        type="radio"
                        id={`language-${option.value}`}
                        value={option.value}
                        {...register('language')}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`language-${option.value}`}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          language === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>}
              </div>
            </div>

            {/* 지도 설정 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Map className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-medium text-gray-900">지도 설정</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">기본 줌 레벨</label>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    {...register('mapDefaultZoom', { valueAsNumber: true })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>8 (전체)</span>
                    <span>{mapDefaultZoom}</span>
                    <span>18 (상세)</span>
                  </div>
                  {errors.mapDefaultZoom && (
                    <p className="mt-1 text-sm text-red-600">{errors.mapDefaultZoom.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기본 위도</label>
                    <input
                      type="number"
                      step="0.0001"
                      {...register('mapDefaultLat', { valueAsNumber: true })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.mapDefaultLat ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="37.5665"
                    />
                    {errors.mapDefaultLat && (
                      <p className="mt-1 text-sm text-red-600">{errors.mapDefaultLat.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기본 경도</label>
                    <input
                      type="number"
                      step="0.0001"
                      {...register('mapDefaultLng', { valueAsNumber: true })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.mapDefaultLng ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="126.9780"
                    />
                    {errors.mapDefaultLng && (
                      <p className="mt-1 text-sm text-red-600">{errors.mapDefaultLng.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">교통정보 레이어</span>
                      <p className="text-xs text-gray-500">지도에 실시간 교통정보를 표시합니다</p>
                    </div>
                    <input
                      type="checkbox"
                      {...register('mapTrafficLayer')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">대중교통 레이어</span>
                      <p className="text-xs text-gray-500">지하철, 버스 등 대중교통 정보를 표시합니다</p>
                    </div>
                    <input
                      type="checkbox"
                      {...register('mapTransitLayer')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 개인정보 동의 (읽기 전용) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-medium text-gray-900">개인정보 및 약관</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-900">개인정보 처리방침</span>
                    <p className="text-xs text-gray-500">
                      동의 여부: {settings.privacyAccepted ? '동의함' : '미동의'}
                      {settings.privacyDate && (
                        <span className="block">동의일: {new Date(settings.privacyDate).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    보기
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">이용약관</span>
                    <p className="text-xs text-gray-500">
                      동의 여부: {settings.termsAccepted ? '동의함' : '미동의'}
                      {settings.termsDate && (
                        <span className="block">동의일: {new Date(settings.termsDate).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    보기
                  </button>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isDirty || !isValid || updateSettingsMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {updateSettingsMutation.isPending ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </form>
        )}
      </QueryWrapper>

      {/* 에러 메시지 */}
      {updateSettingsMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{updateSettingsMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
