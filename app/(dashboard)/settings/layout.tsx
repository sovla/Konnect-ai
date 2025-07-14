'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Truck, Monitor, Key, Trash2, Settings } from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNavigation = [
  {
    name: '개요',
    href: '/settings',
    icon: Settings,
    description: '설정 개요 및 요약',
  },
  {
    name: '프로필',
    href: '/settings/profile',
    icon: User,
    description: '개인 정보 및 연락처',
  },
  {
    name: '라이더 설정',
    href: '/settings/rider',
    icon: Truck,
    description: '운행 설정 및 알림',
  },
  {
    name: '앱 환경',
    href: '/settings/app',
    icon: Monitor,
    description: '테마, 언어, 지도 설정',
  },
  {
    name: '비밀번호',
    href: '/settings/password',
    icon: Key,
    description: '비밀번호 변경',
  },
  {
    name: '계정 관리',
    href: '/settings/account',
    icon: Trash2,
    description: '계정 삭제',
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="pb-5 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">설정</h1>
          <p className="mt-2 text-sm text-gray-600">계정, 프로필, 운행 설정을 관리하세요.</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* 사이드바 */}
          <aside className="pb-6 px-2 sm:px-6 lg:col-span-3 lg:pb-0 lg:px-0">
            <nav className="space-y-1">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 border-blue-500 text-blue-700 border-l-4'
                          : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        flex-shrink-0 -ml-1 mr-3 h-6 w-6
                        ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                      aria-hidden="true"
                    />
                    <div className="truncate">
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate lg:hidden">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="lg:col-span-9">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
