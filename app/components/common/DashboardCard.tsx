'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  loading?: boolean;
}

export default function DashboardCard({
  title,
  children,
  icon: Icon,
  action,
  className = '',
  loading = false,
}: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* 카드 헤더 */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>

      {/* 카드 컨텐츠 */}
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
