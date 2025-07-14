'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Target, Clock, MapPin, Bell, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { riderSettingsSchema, type RiderSettingsFormData } from '@/app/lib/schemas';

interface RiderSettings extends RiderSettingsFormData {
  id: string;
}

export default function RiderSettingsPage() {
  const queryClient = useQueryClient();

  // React Hook Form 설정
  const form = useForm<RiderSettingsFormData>({
    resolver: zodResolver(riderSettingsSchema),
    mode: 'onChange',
    defaultValues: {
      dailyGoal: 0,
      monthlyGoal: 0,
      minOrderAmount: 0,
      maxDistance: 5,
      workingHours: { start: 9, end: 21 },
      autoAccept: false,
      pushNewOrder: true,
      pushGoalAchieve: true,
      pushPromotion: false,
      emailSummary: true,
      emailMarketing: false,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = form;

  // 실시간으로 목표 값들 감시
  const dailyGoal = watch('dailyGoal');
  const monthlyGoal = watch('monthlyGoal');
  const workingHours = watch('workingHours');

  // 라이더 설정 조회
  const { data: settings, isLoading } = useQuery({
    queryKey: ['rider-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings/rider');
      if (!response.ok) {
        throw new Error('라이더 설정을 불러오는데 실패했습니다.');
      }
      return response.json() as Promise<RiderSettings>;
    },
  });

  // 설정 업데이트 뮤테이션
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<RiderSettingsFormData>) => {
      const response = await fetch('/api/settings/rider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '설정 업데이트에 실패했습니다.');
      }
      return response.json();
    },
  });

  // 설정 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (settings) {
      reset({
        dailyGoal: settings.dailyGoal,
        monthlyGoal: settings.monthlyGoal,
        minOrderAmount: settings.minOrderAmount,
        maxDistance: settings.maxDistance,
        workingHours: settings.workingHours,
        autoAccept: settings.autoAccept,
        pushNewOrder: settings.pushNewOrder,
        pushGoalAchieve: settings.pushGoalAchieve,
        pushPromotion: settings.pushPromotion,
        emailSummary: settings.emailSummary,
        emailMarketing: settings.emailMarketing,
      });
    }
  }, [settings, reset]);

  // 폼 제출 처리
  const onSubmit = async (data: RiderSettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
      await queryClient.invalidateQueries({ queryKey: ['rider-settings'] });
      reset(data); // 성공 시 dirty 상태 초기화
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  // 시간 변경 핸들러
  const handleTimeChange = (type: 'start' | 'end', value: number) => {
    const currentHours = workingHours || { start: 9, end: 21 };
    setValue('workingHours', { ...currentHours, [type]: value }, { shouldValidate: true, shouldDirty: true });
  };

  // 목표 건의값 계산
  const suggestedDailyAmount = Math.round(monthlyGoal / 30);
  const suggestedMonthlyAmount = dailyGoal * 30;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
          <h1 className="text-2xl font-semibold text-gray-900">라이더 설정</h1>
          <p className="text-gray-600">운행 목표와 알림 설정을 관리하세요</p>
        </div>
      </div>

      {/* 성공 메시지 */}
      {updateSettingsMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">설정이 성공적으로 업데이트되었습니다!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 운행 목표 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">운행 목표</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">일일 목표 수익</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  {...register('dailyGoal', { valueAsNumber: true })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dailyGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="100000"
                  min="0"
                  step="10000"
                />
              </div>
              {errors.dailyGoal && <p className="mt-1 text-sm text-red-600">{errors.dailyGoal.message}</p>}
              {monthlyGoal > 0 && (
                <p className="mt-1 text-xs text-blue-600">
                  월간 목표 기준 권장: {suggestedDailyAmount.toLocaleString()}원
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">월간 목표 수익</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  {...register('monthlyGoal', { valueAsNumber: true })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.monthlyGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="3000000"
                  min="0"
                  step="100000"
                />
              </div>
              {errors.monthlyGoal && <p className="mt-1 text-sm text-red-600">{errors.monthlyGoal.message}</p>}
              {dailyGoal > 0 && (
                <p className="mt-1 text-xs text-blue-600">
                  일일 목표 기준 예상: {suggestedMonthlyAmount.toLocaleString()}원
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 운행 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-medium text-gray-900">운행 설정</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최소 주문 금액</label>
                <input
                  type="number"
                  {...register('minOrderAmount', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.minOrderAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5000"
                  min="0"
                  step="1000"
                />
                {errors.minOrderAmount && <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount.message}</p>}
                <p className="text-sm text-gray-500 mt-1">원</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최대 배달 거리</label>
                <input
                  type="number"
                  {...register('maxDistance', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.maxDistance ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5"
                  min="1"
                  max="50"
                  step="1"
                />
                {errors.maxDistance && <p className="mt-1 text-sm text-red-600">{errors.maxDistance.message}</p>}
                <p className="text-sm text-gray-500 mt-1">km</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoAccept"
                  {...register('autoAccept')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoAccept" className="ml-2 text-sm text-gray-700">
                  조건에 맞는 주문 자동 수락
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">선호 운행 시간</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작 시간</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={workingHours?.start || 9}
                      onChange={(e) => handleTimeChange('start', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료 시간</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={workingHours?.end || 21}
                      onChange={(e) => handleTimeChange('end', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {errors.workingHours && <p className="mt-2 text-sm text-red-600">{errors.workingHours.message}</p>}
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-medium text-gray-900">알림 설정</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">푸시 알림</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">새 주문 알림</span>
                    <p className="text-xs text-gray-500">새로운 배달 주문이 있을 때 알림을 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('pushNewOrder')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">목표 달성 알림</span>
                    <p className="text-xs text-gray-500">일일/월간 목표를 달성했을 때 알림을 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('pushGoalAchieve')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">프로모션 알림</span>
                    <p className="text-xs text-gray-500">이벤트 및 프로모션 정보를 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('pushPromotion')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">이메일 알림</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">요약 이메일</span>
                    <p className="text-xs text-gray-500">운행 결과 요약을 이메일로 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('emailSummary')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">마케팅 정보</span>
                    <p className="text-xs text-gray-500">서비스 업데이트 및 마케팅 정보를 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('emailMarketing')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
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

      {/* 에러 메시지 */}
      {updateSettingsMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{updateSettingsMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
