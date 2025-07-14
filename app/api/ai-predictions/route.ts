import { AIPrediction, HourlyPrediction } from '@/app/types';
import { NextResponse } from 'next/server';

const aiPredictions: AIPrediction[] = [
  {
    time: '14:00',
    polygons: [
      {
        name: '센텀시티 주변',
        coords: [
          [35.169, 129.129],
          [35.175, 129.135],
          [35.165, 129.14],
          [35.16, 129.125],
        ],
        expectedCalls: 8,
        avgFee: 4500,
        confidence: 85,
        reasons: [
          {
            type: 'historical_data',
            title: '과거 데이터 분석',
            description: '지난 4주간 이 시간대 평균 8.2건의 주문이 발생했습니다.',
            impact: 'high',
            confidence: 92,
          },
          {
            type: 'restaurant_density',
            title: '음식점 밀집도',
            description: '반경 500m 내 24개의 음식점이 위치해 있습니다.',
            impact: 'medium',
            confidence: 88,
          },
        ],
      },
      {
        name: '서면 상권',
        coords: [
          [35.158, 129.059],
          [35.162, 129.065],
          [35.155, 129.068],
          [35.152, 129.055],
        ],
        expectedCalls: 12,
        avgFee: 4200,
        confidence: 92,
        reasons: [
          {
            type: 'time_pattern',
            title: '점심 시간대 패턴',
            description: '평일 점심시간에 주문량이 급증하는 지역입니다.',
            impact: 'high',
            confidence: 95,
          },
          {
            type: 'event',
            title: '특별 프로모션',
            description: '서면 지역 음식점 할인 이벤트가 진행중입니다.',
            impact: 'medium',
            confidence: 85,
          },
        ],
      },
    ],
  },
  {
    time: '15:00',
    polygons: [
      {
        name: '해운대 해변가',
        coords: [
          [35.158, 129.16],
          [35.165, 129.168],
          [35.162, 129.175],
          [35.155, 129.165],
        ],
        expectedCalls: 6,
        avgFee: 3800,
        confidence: 78,
      },
    ],
  },
  {
    time: '18:00',
    polygons: [
      {
        name: '연산동 주거지역',
        coords: [
          [35.185, 129.075],
          [35.192, 129.085],
          [35.188, 129.09],
          [35.18, 129.078],
        ],
        expectedCalls: 15,
        avgFee: 4800,
        confidence: 95,
      },
      {
        name: '광안리 상권',
        coords: [
          [35.152, 129.118],
          [35.157, 129.125],
          [35.148, 129.128],
          [35.145, 129.115],
        ],
        expectedCalls: 10,
        avgFee: 5200,
        confidence: 88,
      },
    ],
  },
];

const heatmapData = [
  {
    lat: 35.169,
    lng: 129.129,
    weight: 0.8,
    id: 'heatmap-1',
    recentOrders: 24,
    avgWaitTime: 8,
    hourlyTrend: '증가',
  },
  {
    lat: 35.158,
    lng: 129.059,
    weight: 0.9,
    id: 'heatmap-2',
    recentOrders: 32,
    avgWaitTime: 5,
    hourlyTrend: '매우 증가',
  },
  {
    lat: 35.185,
    lng: 129.075,
    weight: 0.7,
    id: 'heatmap-3',
    recentOrders: 18,
    avgWaitTime: 12,
    hourlyTrend: '감소',
  },
  {
    lat: 35.152,
    lng: 129.118,
    weight: 0.6,
    id: 'heatmap-4',
    recentOrders: 15,
    avgWaitTime: 6,
    hourlyTrend: '안정',
  },
  {
    lat: 35.175,
    lng: 128.995,
    weight: 0.5,
    id: 'heatmap-5',
    recentOrders: 12,
    avgWaitTime: 15,
    hourlyTrend: '감소',
  },
  {
    lat: 35.135,
    lng: 129.095,
    weight: 0.4,
    id: 'heatmap-6',
    recentOrders: 9,
    avgWaitTime: 10,
    hourlyTrend: '안정',
  },
  {
    lat: 35.16,
    lng: 129.16,
    weight: 0.8,
    id: 'heatmap-7',
    recentOrders: 22,
    avgWaitTime: 7,
    hourlyTrend: '증가',
  },
  {
    lat: 35.17,
    lng: 129.17,
    weight: 0.7,
    id: 'heatmap-8',
    recentOrders: 19,
    avgWaitTime: 9,
    hourlyTrend: '안정',
  },
];

const hourlyPredictions: HourlyPrediction[] = [
  { hour: 13, expectedCalls: 5, confidence: 80 },
  { hour: 14, expectedCalls: 8, confidence: 85 },
  { hour: 15, expectedCalls: 6, confidence: 78 },
  { hour: 16, expectedCalls: 4, confidence: 70 },
  { hour: 17, expectedCalls: 7, confidence: 82 },
  { hour: 18, expectedCalls: 12, confidence: 95 },
  { hour: 19, expectedCalls: 15, confidence: 98 },
  { hour: 20, expectedCalls: 10, confidence: 88 },
  { hour: 21, expectedCalls: 6, confidence: 75 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'predictions', 'heatmap', 'hourly'

  switch (type) {
    case 'heatmap':
      return NextResponse.json({
        success: true,
        data: heatmapData,
      });
    case 'hourly':
      return NextResponse.json({
        success: true,
        data: hourlyPredictions,
      });
    case 'predictions':
    default:
      return NextResponse.json({
        success: true,
        data: aiPredictions,
      });
  }
}
