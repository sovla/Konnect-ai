'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Save, Loader } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

// API 함수들
const fetchUserProfile = async () => {
  const res = await fetch('/api/settings/profile');
  if (!res.ok) throw new Error('프로필 조회 실패');
  return res.json();
};

const updateUserProfile = async (data: Partial<ProfileFormData>) => {
  const res = await fetch('/api/settings/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '프로필 업데이트 실패');
  }
  return res.json();
};

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
  });

  // 프로필 데이터 조회
  const profileQuery = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: fetchUserProfile,
  });

  // 프로필 데이터가 로드되면 폼 데이터 설정
  useEffect(() => {
    if (profileQuery.data?.user) {
      const profile = {
        name: profileQuery.data.user.name || '',
        email: profileQuery.data.user.email || '',
        phone: profileQuery.data.user.phone || '',
      };
      setFormData(profile);
      setOriginalData(profile);
    }
  }, [profileQuery.data]);

  // 프로필 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] }); // 설정 개요 페이지도 업데이트
      setHasChanges(false);

      // 성공 토스트 메시지 (실제로는 토스트 라이브러리 사용)
      alert(data.message || '프로필이 성공적으로 업데이트되었습니다.');
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // 변경사항 체크
    const hasChanged = Object.keys(newFormData).some(
      (key) => newFormData[key as keyof ProfileFormData] !== originalData[key as keyof ProfileFormData],
    );
    setHasChanges(hasChanged);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    // 변경된 필드만 전송
    const changedData: Partial<ProfileFormData> = {};
    Object.keys(formData).forEach((key) => {
      const typedKey = key as keyof ProfileFormData;
      if (formData[typedKey] !== originalData[typedKey]) {
        changedData[typedKey] = formData[typedKey];
      }
    });

    updateMutation.mutate(changedData);
  };

  // 변경사항 취소
  const handleCancel = () => {
    setFormData(originalData);
    setHasChanges(false);
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (profileQuery.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">프로필 데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>
        <p className="mt-1 text-sm text-gray-600">개인 정보를 관리하고 업데이트하세요.</p>
      </div>

      {/* 프로필 정보 카드 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
          <p className="mt-1 text-sm text-gray-600">이름, 이메일, 전화번호를 업데이트하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            {profileQuery.data?.user?.emailVerified ? (
              <p className="mt-1 text-sm text-green-600">✓ 인증된 이메일</p>
            ) : (
              <p className="mt-1 text-sm text-orange-600">! 이메일 인증이 필요합니다</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              전화번호
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="010-1234-5678"
                pattern="010-\d{4}-\d{4}"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">형식: 010-1234-5678</p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <button type="button" onClick={handleCancel} className="text-sm text-gray-600 hover:text-gray-800">
                  취소
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!hasChanges || updateMutation.isPending}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                ${
                  hasChanges && !updateMutation.isPending
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 라이더 통계 정보 (읽기 전용) */}
      {profileQuery.data?.user?.riderProfile && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">라이더 정보</h3>
            <p className="mt-1 text-sm text-gray-600">라이더 활동 통계입니다.</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">가입일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(profileQuery.data.user?.riderProfile?.joinDate || '').toLocaleDateString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">총 배달건수</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(profileQuery.data.user?.riderProfile?.totalDeliveries || 0).toLocaleString()}건
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">평균 평점</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(profileQuery.data.user?.riderProfile?.averageRating || 0).toFixed(1)}점
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수락률</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(profileQuery.data.user?.riderProfile?.acceptanceRate || 0).toFixed(1)}%
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
