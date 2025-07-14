'use client';

import Link from 'next/link';
import { User, Truck, Monitor, Key, Trash2, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAppSettings, useRiderSettings, useUserProfile } from '@/app/hooks';
import { QueryWrapper } from '@/app/components/common/DataWrapper';

export default function SettingsOverviewPage() {
  const profileQuery = useUserProfile();
  const riderQuery = useRiderSettings();
  const appQuery = useAppSettings();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">설정 개요</h2>
        <p className="mt-1 text-sm text-gray-600">계정과 앱 설정 상태를 한눈에 확인하세요.</p>
      </div>

      {/* 설정 카드 그리드 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 프로필 설정 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">프로필</h3>
                  <p className="text-sm text-gray-500">개인 정보</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <QueryWrapper
              query={profileQuery}
              loadingMessage="프로필 정보 로딩 중..."
              errorMessage="프로필 데이터 로드 실패"
              loadingSize="sm"
              loadingSkeleton={
                <div className="mt-4 space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              }
            >
              {(profileData) => (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">이름</span>
                    <span className="font-medium">{profileData.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">이메일</span>
                    <div className="flex items-center">
                      {profileData.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="font-medium truncate max-w-24">{profileData.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">전화번호</span>
                    <span className="font-medium">{profileData.phone || '미등록'}</span>
                  </div>
                </div>
              )}
            </QueryWrapper>

            <Link
              href="/settings/profile"
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              프로필 편집
            </Link>
          </div>
        </div>

        {/* 라이더 설정 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">라이더 설정</h3>
                  <p className="text-sm text-gray-500">운행 및 알림</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <QueryWrapper
              query={riderQuery}
              loadingMessage="라이더 설정 로딩 중..."
              errorMessage="라이더 데이터 로드 실패"
              loadingSize="sm"
              loadingSkeleton={
                <div className="mt-4 space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              }
            >
              {(riderData) => (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">일일 목표</span>
                    <span className="font-medium">{new Intl.NumberFormat('ko-KR').format(riderData.dailyGoal)}원</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">차량 유형</span>
                    <span className="font-medium">
                      {riderData.vehicleType === 'MOTORCYCLE'
                        ? '오토바이'
                        : riderData.vehicleType === 'BICYCLE'
                        ? '자전거'
                        : '자동차'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">푸시 알림</span>
                    <div className="flex items-center">
                      {riderData.pushNewOrder ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="font-medium">{riderData.pushNewOrder ? '활성화' : '비활성화'}</span>
                    </div>
                  </div>
                </div>
              )}
            </QueryWrapper>

            <Link
              href="/settings/rider"
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              라이더 설정 편집
            </Link>
          </div>
        </div>

        {/* 앱 환경 설정 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Monitor className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">앱 환경</h3>
                  <p className="text-sm text-gray-500">테마 및 설정</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <QueryWrapper
              query={appQuery}
              loadingMessage="앱 설정 로딩 중..."
              errorMessage="앱 설정 데이터 로드 실패"
              loadingSize="sm"
              loadingSkeleton={
                <div className="mt-4 space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              }
            >
              {(appData) => (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">테마</span>
                    <span className="font-medium">
                      {appData.theme === 'LIGHT' ? '밝음' : appData.theme === 'DARK' ? '어둠' : '시스템'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">언어</span>
                    <span className="font-medium">{appData.language === 'KOREAN' ? '한국어' : '영어'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">지도 레이어</span>
                    <div className="flex items-center">
                      {appData.mapTrafficLayer ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="font-medium">{appData.mapTrafficLayer ? '교통정보' : '기본'}</span>
                    </div>
                  </div>
                </div>
              )}
            </QueryWrapper>

            <Link
              href="/settings/app"
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              앱 설정 편집
            </Link>
          </div>
        </div>
      </div>

      {/* 보안 설정 섹션 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">보안 설정</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 비밀번호 변경 */}
          <Link
            href="/settings/password"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-sm transition-shadow border border-gray-200"
          >
            <Key className="h-8 w-8 text-orange-600" />
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900">비밀번호 변경</h4>
              <p className="text-sm text-gray-500">계정 보안을 위해 정기적으로 변경하세요</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          {/* 계정 관리 */}
          <Link
            href="/settings/account"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-sm transition-shadow border border-gray-200"
          >
            <Trash2 className="h-8 w-8 text-red-600" />
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900">계정 관리</h4>
              <p className="text-sm text-gray-500">계정 삭제 및 데이터 관리</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* 마지막 업데이트 정보 */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">설정 업데이트 안내</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>설정 변경사항은 즉시 적용됩니다. 문제가 발생하면 고객센터로 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
