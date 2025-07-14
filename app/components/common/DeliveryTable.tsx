'use client';

import { useState, useMemo } from 'react';
import { Delivery } from '@/app/types';
import { formatCurrency } from '@/app/utils';

export interface DeliveryTableProps {
  deliveries: Delivery[];
  loading?: boolean;
}

type SortField = 'date' | 'completedAt' | 'earnings' | 'rating' | 'deliveryTime';
type SortDirection = 'asc' | 'desc';

export default function DeliveryTable({ deliveries, loading = false }: DeliveryTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 및 정렬 로직
  const filteredAndSortedDeliveries = useMemo(() => {
    let filtered = deliveries;

    // 검색 필터링 (출발지, 도착지 주소 기준)
    if (searchTerm) {
      filtered = deliveries.filter(
        (delivery) =>
          delivery.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 정렬
    return filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'date':
          aValue = new Date(`${a.date} ${a.completedAt}`);
          bValue = new Date(`${b.date} ${b.completedAt}`);
          break;
        case 'completedAt':
          aValue = a.completedAt;
          bValue = b.completedAt;
          break;
        case 'earnings':
          aValue = a.earnings.total;
          bValue = b.earnings.total;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'deliveryTime':
          aValue = a.deliveryTime;
          bValue = b.deliveryTime;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [deliveries, searchTerm, sortField, sortDirection]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 정렬 아이콘 컴포넌트
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // 주소에서 동/읍/면 추출 함수
  const extractDistrict = (address: string) => {
    const parts = address.split(' ');
    return parts.slice(1).join(' ') || address;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* 검색 바 스켈레톤 */}
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        {/* 테이블 헤더 스켈레톤 */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        {/* 테이블 행 스켈레톤 */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="출발지 또는 도착지로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600">총 {filteredAndSortedDeliveries.length}건의 배달 내역</div>
      </div>

      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-hidden bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>날짜</span>
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                onClick={() => handleSort('completedAt')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>완료 시간</span>
                  <SortIcon field="completedAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출발지</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">도착지</th>
              <th
                onClick={() => handleSort('earnings')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>수익금</span>
                  <SortIcon field="earnings" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rating')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>평점</span>
                  <SortIcon field="rating" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedDeliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(delivery.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.completedAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {extractDistrict(delivery.pickup.address)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {extractDistrict(delivery.dropoff.address)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatCurrency(delivery.earnings.total)}</span>
                    <span className="text-xs text-gray-500">
                      기본 {formatCurrency(delivery.earnings.base)}
                      {delivery.earnings.promo > 0 && ` + 프로모션 ${formatCurrency(delivery.earnings.promo)}`}
                      {delivery.earnings.tip > 0 && ` + 팁 ${formatCurrency(delivery.earnings.tip)}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{delivery.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 레이아웃 */}
      <div className="lg:hidden space-y-4">
        {filteredAndSortedDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {new Date(delivery.date).toLocaleDateString('ko-KR')} {delivery.completedAt}
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm">{delivery.rating}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-12">출발</span>
                <span className="text-gray-900">{extractDistrict(delivery.pickup.address)}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-12">도착</span>
                <span className="text-gray-900">{extractDistrict(delivery.dropoff.address)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div>
                <div className="font-medium text-lg">{formatCurrency(delivery.earnings.total)}</div>
                <div className="text-xs text-gray-500">
                  기본 {formatCurrency(delivery.earnings.base)}
                  {delivery.earnings.promo > 0 && ` + 프로모션 ${formatCurrency(delivery.earnings.promo)}`}
                  {delivery.earnings.tip > 0 && ` + 팁 ${formatCurrency(delivery.earnings.tip)}`}
                </div>
              </div>
              <div className="text-sm text-gray-500">{delivery.deliveryTime}분</div>
            </div>
          </div>
        ))}
      </div>

      {/* 데이터가 없을 때 */}
      {filteredAndSortedDeliveries.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">{searchTerm ? '검색 결과가 없습니다.' : '배달 내역이 없습니다.'}</div>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
              전체 내역 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
