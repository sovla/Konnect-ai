'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Target, Bike, CheckCircle, ArrowRight } from 'lucide-react';

import { ProtectedRoute } from '@/app/components';

interface OnboardingFormData {
  preferredAreas: string[];
  vehicleType: 'MOTORCYCLE' | 'BICYCLE' | 'CAR';
  dailyGoal: number;
}

interface FormErrors {
  [key: string]: string;
}

function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    preferredAreas: [],
    vehicleType: 'MOTORCYCLE',
    dailyGoal: 50000,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredAreas: prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter((a) => a !== area)
        : [...prev.preferredAreas, area],
    }));

    if (errors.preferredAreas) {
      setErrors((prev) => ({ ...prev, preferredAreas: '' }));
    }
  };

  const handleVehicleSelect = (vehicleType: 'MOTORCYCLE' | 'BICYCLE' | 'CAR') => {
    setFormData((prev) => ({ ...prev, vehicleType }));
  };

  const handleGoalChange = (goal: number) => {
    setFormData((prev) => ({ ...prev, dailyGoal: goal }));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1 && formData.preferredAreas.length === 0) {
      newErrors.preferredAreas = '최소 하나의 지역을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || '온보딩 완료 중 오류가 발생했습니다.' });
        return;
      }

      // 온보딩 완료 - 메인 대시보드로 이동
      router.push('/?onboarding=completed');
    } catch (error) {
      console.error('온보딩 에러:', error);
      setErrors({ general: '온보딩 완료 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">주로 활동하실 지역을 선택해주세요</h3>
            <p className="text-sm text-gray-600 mb-6">
              여러 지역을 선택할 수 있습니다. AI가 선택하신 지역의 데이터를 기반으로 맞춤형 추천을 제공합니다.
            </p>
            {errors.preferredAreas && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{errors.preferredAreas}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {seoulDistricts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => handleAreaToggle(district)}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    formData.preferredAreas.includes(district)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">선택된 지역: {formData.preferredAreas.length}개</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 운송 수단을 선택해주세요</h3>
            <p className="text-sm text-gray-600 mb-6">
              가장 자주 사용하실 운송 수단을 선택해주세요. 나중에 설정에서 변경할 수 있습니다.
            </p>
            <div className="space-y-3">
              {vehicleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVehicleSelect(option.value as 'MOTORCYCLE' | 'BICYCLE' | 'CAR')}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    formData.vehicleType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {formData.vehicleType === option.value && <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일일 수익 목표를 설정해주세요</h3>
            <p className="text-sm text-gray-600 mb-6">
              목표 수익을 설정하면 AI가 목표 달성을 위한 맞춤형 추천을 제공합니다.
            </p>
            <div className="space-y-4">
              {[30000, 50000, 70000, 100000].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalChange(goal)}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    formData.dailyGoal === goal ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{goal.toLocaleString()}원</span>
                    {formData.dailyGoal === goal && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  </div>
                </button>
              ))}
              <div className="border border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">직접 입력</label>
                <input
                  type="number"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={formData.dailyGoal}
                  onChange={(e) => handleGoalChange(parseInt(e.target.value) || 50000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="목표 금액을 입력하세요"
                />
                <p className="text-xs text-gray-500 mt-1">
                  월 예상 수익: {(formData.dailyGoal * 30).toLocaleString()}원
                </p>
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
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
          {errors.general && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {renderStepContent()}

          {/* 버튼 */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  완료 중...
                </>
              ) : currentStep === steps.length ? (
                <>
                  설정 완료
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  다음
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">설정하신 정보는 언제든지 설정 페이지에서 수정할 수 있습니다.</p>
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
