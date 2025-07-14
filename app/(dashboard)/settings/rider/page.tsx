'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Target, Clock, MapPin, Bell, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RiderSettings {
  id: string;
  dailyGoal: number;
  monthlyGoal: number;
  minOrderAmount: number;
  workingHours: { start: number; end: number };
  maxDistance: number;
  autoAccept: boolean;
  pushNewOrder: boolean;
  pushGoalAchieve: boolean;
  pushPromotion: boolean;
  emailSummary: boolean;
  emailMarketing: boolean;
}

export default function RiderSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Partial<RiderSettings>>({});

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
    mutationFn: async (updates: Partial<RiderSettings>) => {
      const response = await fetch('/api/settings/rider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '설정 업데이트에 실패했습니다.');
      }
      return response.json();
    },
  });

  // 설정 데이터가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (
    field: keyof RiderSettings,
    value: string | number | boolean | { start: number; end: number },
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleWorkingHoursChange = (type: 'start' | 'end', value: number) => {
    const currentHours = formData.workingHours || { start: 9, end: 21 };
    const newHours = { ...currentHours, [type]: value };
    handleInputChange('workingHours', newHours);
  };

  const handleSave = async () => {
    if (!hasChanges || !settings) return;

    // 변경된 필드만 추출
    const updates: Partial<RiderSettings> = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof RiderSettings;
      const value = formData[field];
      if (value !== settings[field] && value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[field] = value;
      }
    });

    if (Object.keys(updates).length === 0) {
      setHasChanges(false);
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync(updates);
      await queryClient.invalidateQueries({ queryKey: ['rider-settings'] });
      setHasChanges(false);
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

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

  if (!settings || !formData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">라이더 설정을 불러올 수 없습니다.</p>
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
                value={formData.dailyGoal || 0}
                onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100000"
                min="0"
                step="10000"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">원</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">월간 목표 수익</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.monthlyGoal || 0}
                onChange={(e) => handleInputChange('monthlyGoal', parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3000000"
                min="0"
                step="100000"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">원</p>
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
                value={formData.minOrderAmount || 0}
                onChange={(e) => handleInputChange('minOrderAmount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5000"
                min="0"
                step="1000"
              />
              <p className="text-sm text-gray-500 mt-1">원</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최대 배달 거리</label>
              <input
                type="number"
                value={formData.maxDistance || 0}
                onChange={(e) => handleInputChange('maxDistance', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
                min="0"
                step="1"
              />
              <p className="text-sm text-gray-500 mt-1">km</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoAccept"
                checked={formData.autoAccept || false}
                onChange={(e) => handleInputChange('autoAccept', e.target.checked)}
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
                    value={formData.workingHours?.start || 9}
                    onChange={(e) => handleWorkingHoursChange('start', parseInt(e.target.value))}
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
                    value={formData.workingHours?.end || 21}
                    onChange={(e) => handleWorkingHoursChange('end', parseInt(e.target.value))}
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
                  checked={formData.pushNewOrder || false}
                  onChange={(e) => handleInputChange('pushNewOrder', e.target.checked)}
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
                  checked={formData.pushGoalAchieve || false}
                  onChange={(e) => handleInputChange('pushGoalAchieve', e.target.checked)}
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
                  checked={formData.pushPromotion || false}
                  onChange={(e) => handleInputChange('pushPromotion', e.target.checked)}
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
                  checked={formData.emailSummary || false}
                  onChange={(e) => handleInputChange('emailSummary', e.target.checked)}
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
                  checked={formData.emailMarketing || false}
                  onChange={(e) => handleInputChange('emailMarketing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">변경사항이 있습니다</p>
            <button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {updateSettingsMutation.isPending ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {updateSettingsMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{updateSettingsMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
