'use client';

import { getDateInfo, getCurrentDate, formatKoreanDateTime } from '../../utils/dateHelpers';

interface DateDisplayProps {
  showDebugInfo?: boolean;
}

export function DateDisplay({ showDebugInfo = false }: DateDisplayProps) {
  const dateInfo = getDateInfo();

  if (!showDebugInfo) {
    return <div className="text-sm text-gray-600">{formatKoreanDateTime(getCurrentDate())}</div>;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
      <h3 className="font-semibold text-yellow-800">🕐 날짜 정보</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <div>
          <strong>현재 날짜:</strong> {dateInfo.formattedDate}
        </div>
        <div>
          <strong>개발 모드:</strong> {dateInfo.isDev ? '✅ 예' : '❌ 아니오'}
        </div>
        <div>
          <strong>데모 모드:</strong> {dateInfo.isDemo ? '✅ 예 (고정 날짜 사용)' : '❌ 아니오 (실제 날짜 사용)'}
        </div>
        <div>
          <strong>Raw Date:</strong> {dateInfo.currentDate.toISOString()}
        </div>
        {dateInfo.isDemo && (
          <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
            💡 <strong>개발 환경</strong>에서는 Mock 데이터와의 일관성을 위해 <strong>2025-07-14</strong>로 고정됩니다.
            <br />
            프로덕션 배포 시 실제 현재 날짜가 사용됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
