'use client';

import { useState } from 'react';
import { Bell, Settings, User, Menu, LogOut, Loader2 } from 'lucide-react';
import { useAuth, useNotifications } from '../../hooks';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function Header({ onMenuClick, isMobile = false }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // 인증 및 알림 훅 사용
  const { user, riderInfo, logout, isLoggingOut } = useAuth();
  const { notifications, unreadCount } = useNotifications();

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      logout();
    }
    setShowProfile(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Konnect AI</h1>
            <p className="text-xs text-gray-500">Korea Connect - 스마트한 배달 연동</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 현재 상태 표시 */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
            riderInfo?.isOnline ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${riderInfo?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
          ></div>
          <span className={`text-sm font-medium ${riderInfo?.isOnline ? 'text-green-700' : 'text-gray-600'}`}>
            {riderInfo?.isOnline ? '온라인' : '오프라인'}
          </span>
        </div>

        {/* 알림 */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">알림</h3>
              </div>
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 bg-${notification.color}-500 rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">새로운 알림이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 설정 */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* 프로필 */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name || '사용자'}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{user?.name || '사용자'}</p>
                <p className="text-sm text-gray-500">{riderInfo ? `라이더 ID: ${riderInfo.riderId}` : user?.email}</p>
                {riderInfo && (
                  <div className="mt-1 text-xs text-gray-400">
                    {riderInfo.vehicleType} • 평점 {riderInfo.averageRating}
                  </div>
                )}
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  프로필 설정
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  환경 설정
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
