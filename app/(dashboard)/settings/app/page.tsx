'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Palette, Globe, Map, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AppSettings {
  id: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: 'KOREAN' | 'ENGLISH';
  mapType: string;
  showTraffic: boolean;
  autoZoom: boolean;
  privacyPolicyAcceptedAt: string | null;
  termsAcceptedAt: string | null;
}

export default function AppSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Partial<AppSettings>>({});

  // 앱 설정 조회
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('앱 설정을 불러오는데 실패했습니다.');
      }
      return response.json() as Promise<AppSettings>;
    },
  });

  // 설정 업데이트 뮤테이션
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AppSettings>) => {
      const response = await fetch('/api/settings', {
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

  const handleInputChange = (field: keyof AppSettings, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || !settings) return;

    // 변경된 필드만 추출
    const updates: Partial<AppSettings> = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof AppSettings;
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
      await queryClient.invalidateQueries({ queryKey: ['app-settings'] });
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
            {[1, 2, 3, 4].map((i) => (
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
          <p className="text-gray-500">앱 설정을 불러올 수 없습니다.</p>
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
          <h1 className="text-2xl font-semibold text-gray-900">앱 환경 설정</h1>
          <p className="text-gray-600">테마, 언어, 지도 등 앱 환경을 설정하세요</p>
        </div>
      </div>

      {/* 테마 설정 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-medium text-gray-900">테마 설정</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">앱의 외관을 선택하세요</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'LIGHT', label: '라이트 모드', description: '밝은 테마' },
              { value: 'DARK', label: '다크 모드', description: '어두운 테마' },
              { value: 'SYSTEM', label: '시스템 설정', description: '기기 설정을 따름' },
            ].map((theme) => (
              <div key={theme.value} className="relative">
                <input
                  type="radio"
                  id={`theme-${theme.value}`}
                  name="theme"
                  value={theme.value}
                  checked={formData.theme === theme.value}
                  onChange={(e) => handleInputChange('theme', e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM')}
                  className="sr-only"
                />
                <label
                  htmlFor={`theme-${theme.value}`}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.theme === theme.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{theme.label}</div>
                  <div className="text-sm text-gray-500">{theme.description}</div>
                </label>
              </div>
            ))}
          </div>
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
            {[
              { value: 'KOREAN', label: '한국어', description: '대한민국' },
              { value: 'ENGLISH', label: 'English', description: 'United States' },
            ].map((language) => (
              <div key={language.value} className="relative">
                <input
                  type="radio"
                  id={`language-${language.value}`}
                  name="language"
                  value={language.value}
                  checked={formData.language === language.value}
                  onChange={(e) => handleInputChange('language', e.target.value as 'KOREAN' | 'ENGLISH')}
                  className="sr-only"
                />
                <label
                  htmlFor={`language-${language.value}`}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.language === language.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{language.label}</div>
                  <div className="text-sm text-gray-500">{language.description}</div>
                </label>
              </div>
            ))}
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-3">지도 타입</label>
            <select
              value={formData.mapType || 'normal'}
              onChange={(e) => handleInputChange('mapType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="normal">일반 지도</option>
              <option value="satellite">위성 지도</option>
              <option value="hybrid">하이브리드</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">교통정보 표시</span>
                <p className="text-xs text-gray-500">지도에 실시간 교통정보를 표시합니다</p>
              </div>
              <input
                type="checkbox"
                checked={formData.showTraffic || false}
                onChange={(e) => handleInputChange('showTraffic', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">자동 줌 조정</span>
                <p className="text-xs text-gray-500">배달 경로에 따라 자동으로 지도를 확대/축소합니다</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoZoom || false}
                onChange={(e) => handleInputChange('autoZoom', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 개인정보 동의 */}
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
                동의일:{' '}
                {formData.privacyPolicyAcceptedAt
                  ? new Date(formData.privacyPolicyAcceptedAt).toLocaleDateString()
                  : '미동의'}
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">보기</button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm font-medium text-gray-900">이용약관</span>
              <p className="text-xs text-gray-500">
                동의일: {formData.termsAcceptedAt ? new Date(formData.termsAcceptedAt).toLocaleDateString() : '미동의'}
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">보기</button>
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
