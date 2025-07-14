'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, ArrowLeft, User, Calendar, Package, DollarSign, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAccountStats, useAuth, useDeleteAccount } from '@/app/hooks';
import { QueryWrapper } from '@/app/components/common/DataWrapper';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 설정 훅들 사용
  const accountStatsQuery = useAccountStats();
  const deleteAccountMutation = useDeleteAccount();
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정을 삭제하겠습니다' || !password) {
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        password,
        confirmation: '계정을 삭제하겠습니다',
      });

      // 계정 삭제 성공 시 로그인 페이지로 이동 (세션은 서버에서 정리됨)
      logout();
      router.push('/auth/login?message=account-deleted');
    } catch (error) {
      console.error('계정 삭제 실패:', error);
    }
  };

  const resetDeleteForm = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/settings" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">계정 관리</h1>
          <p className="text-gray-600">계정 정보를 확인하고 관리하세요</p>
        </div>
      </div>

      {/* 계정 통계 - QueryWrapper 사용 */}
      <QueryWrapper
        query={accountStatsQuery}
        loadingMessage="계정 정보를 불러오는 중..."
        errorMessage="계정 정보를 불러오는데 실패했습니다"
        loadingSkeleton={
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        {(accountStats) => (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">계정 정보</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{accountStats.totalDeliveries}</div>
                <div className="text-sm text-blue-700">총 배달 건수</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {accountStats.deliveryRecords.toLocaleString()}건
                </div>
                <div className="text-sm text-green-700">배달 기록</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-900">
                  {new Date(accountStats.accountCreatedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-purple-700">가입일</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-900">{accountStats.activeSessions}개</div>
                <div className="text-sm text-orange-700">활성 세션</div>
              </div>
            </div>
          </div>
        )}
      </QueryWrapper>

      {/* 데이터 내보내기 */}
      {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">데이터 내보내기</h2>
        <p className="text-gray-600 mb-4">귀하의 배달 이력과 수익 데이터를 다운로드할 수 있습니다.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">데이터 내보내기</button>
      </div> */}

      {/* 계정 삭제 섹션 */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-medium text-red-900">위험 구역</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">계정 삭제</h3>
            <p className="text-sm text-gray-600 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 삭제되는 데이터에는 다음이
              포함됩니다:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
              <li>프로필 정보 및 설정</li>
              <li>배달 이력 및 수익 데이터</li>
              <li>AI 추천 데이터 및 통계</li>
              <li>모든 앱 내 설정 및 사용자 데이터</li>
            </ul>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              계정 삭제하기
            </button>
          ) : (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-3">계정 삭제 확인</h4>
              <p className="text-sm text-red-800 mb-4">정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-1">현재 비밀번호:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="비밀번호를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-1">
                    확인을 위해 &quot;계정을 삭제하겠습니다&quot;라고 입력하세요:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="계정을 삭제하겠습니다"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={
                      deleteConfirmText !== '계정을 삭제하겠습니다' || !password || deleteAccountMutation.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteAccountMutation.isPending ? '삭제 중...' : '영구 삭제'}
                  </button>
                  <button
                    onClick={resetDeleteForm}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 도움말 섹션 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 계정 관리 도움말</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 계정 삭제 전에 중요한 데이터를 백업하세요</li>
          <li>• 문제가 있다면 고객지원에 먼저 문의해 보세요</li>
          <li>• 일시적으로 서비스를 중단하려면 로그아웃만 하세요</li>
          <li>• 데이터 내보내기는 언제든지 무료로 이용 가능합니다</li>
        </ul>
      </div>

      {/* 에러 메시지 */}
      {deleteAccountMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{deleteAccountMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
