'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, BarChart3, History, Settings, HelpCircle, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const menuItems = [
  {
    id: 'dashboard',
    label: '메인 대시보드',
    icon: LayoutDashboard,
    href: '/',
    description: '오늘의 성과와 주요 정보',
  },
  {
    id: 'ai-zones',
    label: 'AI 추천 운행 존',
    icon: Map,
    href: '/ai-zones',
    description: '실시간 히트맵과 예측 정보',
  },
  {
    id: 'analytics',
    label: '상세 수익 분석',
    icon: BarChart3,
    href: '/analytics',
    description: '수익 데이터 분석과 트렌드',
  },
  {
    id: 'history',
    label: '운행 이력',
    icon: History,
    href: '/history',
    description: '과거 배달 내역 조회',
  },
];

const bottomMenuItems = [
  {
    id: 'settings',
    label: '설정',
    icon: Settings,
    href: '/settings',
    description: '앱 설정 및 환경설정',
  },
  {
    id: 'help',
    label: '도움말',
    icon: HelpCircle,
    href: '/help',
    description: '사용법과 자주 묻는 질문',
  },
];

export default function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* 모바일 헤더 */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">딜</span>
            </div>
            <span className="font-semibold text-gray-900">메뉴</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* 메인 메뉴 */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">메인 메뉴</h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isActive ? 'text-blue-700' : ''}`}>{item.label}</p>
                    {hoveredItem === item.id && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                  {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">기타</h3>
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isActive ? 'text-blue-700' : ''}`}>{item.label}</p>
                    {hoveredItem === item.id && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">딜버 파트너 대시보드</p>
          <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* 모바일 오버레이 */}
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

        {/* 모바일 사이드바 */}
        <div
          className={`
          fixed left-0 top-0 bottom-0 w-80 z-50 transform transition-transform duration-300 lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <SidebarContent />
        </div>
      </>
    );
  }

  // 데스크톱 사이드바
  return (
    <div
      className={`
      transition-all duration-300 ease-in-out
      ${isOpen ? 'w-64' : 'w-0'}
    `}
    >
      {isOpen && (
        <div className="w-64 h-full">
          <SidebarContent />
        </div>
      )}
    </div>
  );
}
