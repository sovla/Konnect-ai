'use client';

import { useState } from 'react';
import { Button } from '@tremor/react';
import { useDeliveryGenerate, deliveryGenerateHelpers } from '@/app/hooks/delivery';
import { RiAddLine, RiCalendarLine, RiUserLine } from '@remixicon/react';

export default function DeliveryDataGenerator() {
  const [selectedRider, setSelectedRider] = useState<string>('');
  const [count, setCount] = useState(10);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  const generateMutation = useDeliveryGenerate();

  const handleQuickGenerate = (type: 'today' | 'week' | 'month') => {
    let request;

    switch (type) {
      case 'today':
        request = deliveryGenerateHelpers.generateToday(5);
        break;
      case 'week':
        request = deliveryGenerateHelpers.generateThisWeek(20);
        break;
      case 'month':
        request = deliveryGenerateHelpers.generateThisMonth(100);
        break;
    }

    generateMutation.mutate(request);
  };

  const handleCustomGenerate = () => {
    let request;

    if (useCustomDate && customStartDate && customEndDate) {
      request = deliveryGenerateHelpers.generateForDateRange(
        customStartDate,
        customEndDate,
        count,
        selectedRider || undefined,
      );
    } else {
      request = selectedRider
        ? deliveryGenerateHelpers.generateForRider(selectedRider, count, dateRange)
        : deliveryGenerateHelpers.generateForAllRiders(count, dateRange);
    }

    generateMutation.mutate(request);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">배달 데이터 자동 생성</h3>
        <p className="text-sm text-gray-600 mt-1">테스트를 위한 임의의 배달 데이터를 생성합니다.</p>
      </div>

      {/* 빠른 생성 버튼들 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">빠른 생성</h4>
        <div className="flex gap-3">
          <Button
            onClick={() => handleQuickGenerate('today')}
            disabled={generateMutation.isPending}
            variant="light"
            size="sm"
            icon={RiCalendarLine}
          >
            오늘 데이터 (5개)
          </Button>
          <Button
            onClick={() => handleQuickGenerate('week')}
            disabled={generateMutation.isPending}
            variant="light"
            size="sm"
            icon={RiCalendarLine}
          >
            이번 주 데이터 (20개)
          </Button>
          <Button
            onClick={() => handleQuickGenerate('month')}
            disabled={generateMutation.isPending}
            variant="light"
            size="sm"
            icon={RiCalendarLine}
          >
            이번 달 데이터 (100개)
          </Button>
        </div>
      </div>

      {/* 상세 설정 */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">상세 설정</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 라이더 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RiUserLine className="inline w-4 h-4 mr-1" />
              라이더 선택
            </label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">모든 라이더</option>
              {/* 실제 라이더 목록은 별도 API에서 가져와야 함 */}
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
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 날짜 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RiCalendarLine className="inline w-4 h-4 mr-1" />
              날짜 범위
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* 생성 버튼 */}
        <div className="mt-6">
          <Button
            onClick={handleCustomGenerate}
            disabled={generateMutation.isPending || (useCustomDate && (!customStartDate || !customEndDate))}
            loading={generateMutation.isPending}
            size="sm"
            icon={RiAddLine}
          >
            {generateMutation.isPending ? '생성 중...' : '배달 데이터 생성'}
          </Button>
        </div>
      </div>

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
                총 {generateMutation.data.data.totalCreated}개 생성됨 | 대상 라이더:{' '}
                {generateMutation.data.data.targetRiders}명 | 날짜 범위: {generateMutation.data.data.dateRange.start} ~{' '}
                {generateMutation.data.data.dateRange.end}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {generateMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">{generateMutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
