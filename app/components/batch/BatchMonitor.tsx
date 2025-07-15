'use client';

import { useState } from 'react';
import { useBatchDashboard, useBatchUtils } from '@/app/hooks/batch/useBatchQueries';
import { formatDate } from '@/app/utils/dateHelpers';

interface BatchMonitorProps {
  className?: string;
}

export function BatchMonitor({ className }: BatchMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { stats, successRate, isLoading, logs } = useBatchDashboard();
  const {
    executeAIRecommendationNow,
    executeAIRecommendationBackground,
    isExecuting,
    lastExecutionResult,
    executionError,
  } = useBatchUtils();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-900">AI 추천 배치 시스템</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>성공률: {successRate}%</span>
              <span>•</span>
              <span>총 실행: {stats.totalRuns}회</span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? '⬆️' : '⬇️'}
          </button>
        </div>
      </div>

      {/* 실행 상태 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.runningCount}</div>
            <div className="text-sm text-gray-500">실행 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
            <div className="text-sm text-gray-500">완료</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
            <div className="text-sm text-gray-500">실패</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.totalRuns}</div>
            <div className="text-sm text-gray-500">총 실행</div>
          </div>
        </div>

        {/* 실행 버튼 */}
        <div className="flex space-x-2">
          <button
            onClick={executeAIRecommendationNow}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isExecuting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isExecuting ? '실행 중...' : '즉시 실행'}
          </button>
          <button
            onClick={executeAIRecommendationBackground}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isExecuting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            백그라운드 실행
          </button>
        </div>

        {/* 실행 결과 표시 */}
        {lastExecutionResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">✅ {lastExecutionResult.message}</div>
          </div>
        )}

        {executionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">❌ 실행 중 오류: {executionError.message}</div>
          </div>
        )}
      </div>

      {/* 상세 로그 (확장 시) */}
      {isExpanded && (
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">최근 실행 로그</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">실행 로그가 없습니다.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(log.status)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.type === 'ai-recommendation' ? 'AI 추천 배치' : log.type}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(log.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status === 'running' ? '실행 중' : log.status === 'completed' ? '완료' : '실패'}
                    </span>
                    {log.status === 'completed' && log.result?.data && (
                      <span className="text-xs text-gray-500">{Object.keys(log.result.data).length}개 항목 처리</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
