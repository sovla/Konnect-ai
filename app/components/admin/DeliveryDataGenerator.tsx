'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@tremor/react';
import {
  RiAddLine,
  RiCalendarLine,
  RiUserLine,
  RiPlayLine,
  RiRefreshLine,
  RiDatabaseLine,
  RiCodeLine,
  RiBarChartLine,
  RiHistoryLine,
} from '@remixicon/react';

import { useDeliveryGenerate } from '@/app/hooks/delivery';
import { useBatchScheduler, useBatchLogs, batchSchedulerHelpers } from '@/app/hooks/batch/useBatchQueries';
import { useRiderProfile } from '@/app/hooks';
import { BatchGenerateDeliveryRequestSchema } from '@/app/types/dto/delivery.dto';
import { type BatchLog } from '@/app/types/dto/common.dto';
import { z } from 'zod';

type FormData = z.infer<typeof BatchGenerateDeliveryRequestSchema>;

export default function DeliveryDataGenerator() {
  const [activeTab, setActiveTab] = useState<'generate' | 'batch'>('generate');
  const [useCustomDate, setUseCustomDate] = useState(false);

  // 폼 설정
  const form = useForm({
    resolver: zodResolver(BatchGenerateDeliveryRequestSchema),
    defaultValues: {
      count: 10,
      dateRange: 'week',
    },
  });

  // 훅들
  const generateMutation = useDeliveryGenerate();
  const batchSchedulerMutation = useBatchScheduler();
  const { data: riderData } = useRiderProfile();
  const { data: batchLogs, isLoading: batchLogsLoading } = useBatchLogs({ limit: 10 });

  // 폼 제출 핸들러
  const onSubmit = (data: FormData) => {
    const riderId = riderData?.data?.riderProfile.id;

    // 현재 라이더 선택 시 riderId 설정
    if (data.riderId === 'current' && riderId) {
      data.riderId = riderId;
    }

    generateMutation.mutate(data);
  };

  // 빠른 생성 핸들러
  const handleQuickGenerate = (count: number, dateRange: 'today' | 'week' | 'month') => {
    const riderId = riderData?.data?.riderProfile.id;

    generateMutation.mutate({
      count,
      dateRange,
      riderId: riderId || undefined,
    });
  };

  // 배치 처리 핸들러
  const handleBatchExecution = (type: 'ai-recommendation' | 'data-cleanup' | 'analytics-update') => {
    const request =
      batchSchedulerHelpers[
        type === 'ai-recommendation'
          ? 'runAiRecommendation'
          : type === 'data-cleanup'
          ? 'runDataCleanup'
          : 'runAnalyticsUpdate'
      ]();

    batchSchedulerMutation.mutate(request);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">데이터 관리 및 배치 처리</h3>
        <p className="text-sm text-gray-600 mt-1">배달 데이터 생성 및 시스템 배치 작업을 관리합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RiDatabaseLine className="inline w-4 h-4 mr-1" />
            데이터 생성
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'batch'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RiPlayLine className="inline w-4 h-4 mr-1" />
            배치 처리
          </button>
        </nav>
      </div>

      {/* 데이터 생성 탭 */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* 빠른 생성 버튼들 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">빠른 생성</h4>
            <div className="flex gap-3">
              <Button
                onClick={() => handleQuickGenerate(5, 'today')}
                disabled={generateMutation.isPending}
                variant="light"
                size="sm"
                icon={RiCalendarLine}
              >
                오늘 데이터 (5개)
              </Button>
              <Button
                onClick={() => handleQuickGenerate(20, 'week')}
                disabled={generateMutation.isPending}
                variant="light"
                size="sm"
                icon={RiCalendarLine}
              >
                이번 주 데이터 (20개)
              </Button>
              <Button
                onClick={() => handleQuickGenerate(100, 'month')}
                disabled={generateMutation.isPending}
                variant="light"
                size="sm"
                icon={RiCalendarLine}
              >
                이번 달 데이터 (100개)
              </Button>
            </div>
          </div>

          {/* 상세 설정 폼 */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">상세 설정</h4>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 라이더 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <RiUserLine className="inline w-4 h-4 mr-1" />
                    라이더 선택
                  </label>
                  <select
                    {...form.register('riderId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">모든 라이더</option>
                    <option value="current">현재 라이더만</option>
                  </select>
                </div>

                {/* 생성 개수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <RiAddLine className="inline w-4 h-4 mr-1" />
                    생성 개수
                  </label>
                  <input
                    type="number"
                    {...form.register('count', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.formState.errors.count && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.count.message}</p>
                  )}
                </div>

                {/* 날짜 범위 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <RiCalendarLine className="inline w-4 h-4 mr-1" />
                    날짜 범위
                  </label>
                  <select
                    {...form.register('dateRange')}
                    disabled={useCustomDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="today">오늘</option>
                    <option value="week">이번 주</option>
                    <option value="month">이번 달</option>
                  </select>
                </div>

                {/* 사용자 지정 날짜 토글 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useCustomDate"
                    checked={useCustomDate}
                    onChange={(e) => setUseCustomDate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useCustomDate" className="ml-2 block text-sm text-gray-700">
                    사용자 지정 날짜 사용
                  </label>
                </div>
              </div>

              {/* 사용자 지정 날짜 입력 */}
              {useCustomDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                    <input
                      type="date"
                      {...form.register('startDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.startDate && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                    <input
                      type="date"
                      {...form.register('endDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.endDate && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 생성 버튼 */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || generateMutation.isPending}
                  loading={generateMutation.isPending}
                  size="sm"
                  icon={RiAddLine}
                >
                  배달 데이터 생성
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => form.reset()}
                  disabled={form.formState.isSubmitting || generateMutation.isPending}
                >
                  초기화
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 배치 처리 탭 */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          {/* 배치 작업 실행 버튼들 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">배치 작업 실행</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleBatchExecution('ai-recommendation')}
                disabled={batchSchedulerMutation.isPending}
                loading={batchSchedulerMutation.isPending}
                size="sm"
                icon={RiPlayLine}
                className="w-full"
              >
                <div className="text-left">
                  <div className="font-medium">AI 추천 배치</div>
                  <div className="text-xs text-gray-500">AI 구역 추천 업데이트</div>
                </div>
              </Button>

              <Button
                onClick={() => handleBatchExecution('data-cleanup')}
                disabled={batchSchedulerMutation.isPending}
                loading={batchSchedulerMutation.isPending}
                size="sm"
                icon={RiCodeLine}
                variant="secondary"
                className="w-full"
              >
                <div className="text-left">
                  <div className="font-medium">데이터 정리</div>
                  <div className="text-xs text-gray-500">오래된 데이터 정리</div>
                </div>
              </Button>

              <Button
                onClick={() => handleBatchExecution('analytics-update')}
                disabled={batchSchedulerMutation.isPending}
                loading={batchSchedulerMutation.isPending}
                size="sm"
                icon={RiBarChartLine}
                variant="secondary"
                className="w-full"
              >
                <div className="text-left">
                  <div className="font-medium">분석 업데이트</div>
                  <div className="text-xs text-gray-500">통계 데이터 갱신</div>
                </div>
              </Button>
            </div>
          </div>

          {/* 배치 실행 로그 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                <RiHistoryLine className="inline w-4 h-4 mr-1" />
                최근 배치 실행 로그
              </h4>
              <Button
                variant="light"
                size="sm"
                icon={RiRefreshLine}
                onClick={() => window.location.reload()}
                disabled={batchLogsLoading}
              >
                새로고침
              </Button>
            </div>

            {batchLogsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">로그를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchLogs?.data?.logs?.map((log: BatchLog) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{log.type}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : log.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.executedAt).toLocaleString()}
                        {log.duration && ` • ${log.duration}ms`}
                      </p>
                      {log.error && <p className="text-xs text-red-600 mt-1">{log.error}</p>}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <p>배치 실행 로그가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 결과 메시지 */}
      {generateMutation.data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RiAddLine className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{generateMutation.data.message}</p>
              <div className="text-xs text-green-600 mt-1">
                총 {generateMutation.data.data?.totalCreated}개 생성됨 | 대상 라이더:{' '}
                {generateMutation.data.data?.targetRiders}명 | 날짜 범위: {generateMutation.data.data?.dateRange.start}{' '}
                ~ {generateMutation.data.data?.dateRange.end}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배치 실행 결과 메시지 */}
      {batchSchedulerMutation.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RiPlayLine className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">{batchSchedulerMutation.data.message}</p>
              <div className="text-xs text-blue-600 mt-1">
                작업 ID: {batchSchedulerMutation.data.data?.jobId} | 상태: {batchSchedulerMutation.data.data?.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {(generateMutation.error || batchSchedulerMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">
            {generateMutation.error?.message || batchSchedulerMutation.error?.message}
          </p>
        </div>
      )}
    </div>
  );
}
