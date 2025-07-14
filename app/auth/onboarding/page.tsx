'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Target, Bike, CheckCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { onboardingSchema, type OnboardingFormData } from '@/app/lib/schemas';
import { ProtectedRoute } from '@/app/components';

function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
    getValues,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      preferredAreas: [],
      vehicleType: 'MOTORCYCLE',
      dailyGoal: 50000,
    },
  });

  const steps = [
    {
      id: 1,
      title: '운행 지역 설정',
      description: '주로 활동하실 지역들을 선택해주세요',
      icon: MapPin,
    },
    {
      id: 2,
      title: '운송 수단 선택',
      description: '사용하실 주요 운송 수단을 선택해주세요',
      icon: Bike,
    },
    {
      id: 3,
      title: '목표 설정',
      description: '일일 수익 목표를 설정해주세요',
      icon: Target,
    },
  ];

  const seoulDistricts = [
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ];

  const vehicleOptions = [
    { value: 'MOTORCYCLE', label: '오토바이', icon: '🏍️', description: '가장 빠른 배달이 가능합니다' },
    { value: 'BICYCLE', label: '자전거', icon: '🚲', description: '환경친화적이고 건강에 좋습니다' },
    { value: 'CAR', label: '자동차', icon: '🚗', description: '날씨에 관계없이 안전하게 배달할 수 있습니다' },
  ];

  // 지역 선택 토글
  const toggleArea = (area: string) => {
    const currentAreas = getValues('preferredAreas');
    const newAreas = currentAreas.includes(area) ? currentAreas.filter((a) => a !== area) : [...currentAreas, area];
    setValue('preferredAreas', newAreas);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 온보딩 완료 제출
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('root', {
          message: result.error || '온보딩 완료 중 오류가 발생했습니다.',
        });
        return;
      }

      // 온보딩 완료 - 메인 대시보드로 이동
      router.push('/?onboarding=completed');
    } catch (error) {
      console.error('온보딩 에러:', error);
      setError('root', {
        message: '온보딩 완료 중 오류가 발생했습니다.',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {seoulDistricts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => toggleArea(district)}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    watch('preferredAreas').includes(district)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
            {errors.preferredAreas && <p className="text-sm text-red-600">{errors.preferredAreas.message}</p>}
            <p className="text-sm text-gray-500">선택된 지역: {watch('preferredAreas').length}개</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {vehicleOptions.map((option) => (
              <label
                key={option.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  watch('vehicleType') === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...register('vehicleType')} type="radio" value={option.value} className="sr-only" />
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="dailyGoal" className="block text-sm font-medium text-gray-700 mb-2">
                일일 수익 목표
              </label>
              <div className="relative">
                <input
                  {...register('dailyGoal', { valueAsNumber: true })}
                  id="dailyGoal"
                  type="number"
                  min="0"
                  max="1000000"
                  step="10000"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dailyGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">원</span>
                </div>
              </div>
              {errors.dailyGoal && <p className="mt-2 text-sm text-red-600">{errors.dailyGoal.message}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">💡 추천 목표</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• 초보자: 3-5만원</div>
                <div>• 일반: 5-8만원</div>
                <div>• 숙련자: 8-15만원</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            {(() => {
              const IconComponent = steps[currentStep - 1].icon;
              return <IconComponent className="w-8 h-8 text-blue-600" />;
            })()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">라이더 프로필 설정</h1>
          <p className="mt-2 text-sm text-gray-600">AI 기반 맞춤형 서비스를 위해 몇 가지 정보를 설정해주세요</p>
        </div>

        {/* 진행 상황 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs text-gray-500 mt-1 text-center max-w-20">{step.title}</span>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-4 w-full h-0.5 -ml-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ left: '50%', width: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 에러 메시지 */}
          {errors.root && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 단계별 제목 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>

            {/* 단계별 내용 */}
            {renderStepContent()}

            {/* 버튼 영역 */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                } transition-colors`}
              >
                이전
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && watch('preferredAreas').length === 0) ||
                    (currentStep === 2 && !watch('vehicleType')) ||
                    (currentStep === 3 && (!watch('dailyGoal') || watch('dailyGoal') <= 0))
                  }
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center`}
                >
                  다음
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center`}
                >
                  {isSubmitting ? '완료 중...' : '완료'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 하단 정보 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">설정하신 정보는 언제든지 설정 페이지에서 변경하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
