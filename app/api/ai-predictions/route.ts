import { NextResponse } from 'next/server';
import {
  AIPredictionsResponseSchema,
  HeatmapResponseSchema,
  HourlyPredictionsResponseSchema,
  GetAIPredictionsRequestSchema,
} from '@/app/types/dto';

const aiPredictions = [
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
        reasons: [],
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
        reasons: [],
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
        reasons: [],
      },
    ],
  },
];

const heatmapData = [
  {
    lat: 35.169,
    lng: 129.129,
    weight: 0.8,
    recentOrders: 24,
    avgWaitTime: 8,
    hourlyTrend: 'rising',
  },
  {
    lat: 35.158,
    lng: 129.059,
    weight: 0.9,
    recentOrders: 32,
    avgWaitTime: 5,
    hourlyTrend: 'rising',
  },
  {
    lat: 35.185,
    lng: 129.075,
    weight: 0.7,
    recentOrders: 18,
    avgWaitTime: 12,
    hourlyTrend: 'falling',
  },
  {
    lat: 35.152,
    lng: 129.118,
    weight: 0.6,
    recentOrders: 15,
    avgWaitTime: 6,
    hourlyTrend: 'stable',
  },
  {
    lat: 35.175,
    lng: 128.995,
    weight: 0.5,
    recentOrders: 12,
    avgWaitTime: 15,
    hourlyTrend: 'falling',
  },
  {
    lat: 35.135,
    lng: 129.095,
    weight: 0.4,
    recentOrders: 9,
    avgWaitTime: 10,
    hourlyTrend: 'stable',
  },
  {
    lat: 35.16,
    lng: 129.16,
    weight: 0.8,
    recentOrders: 22,
    avgWaitTime: 7,
    hourlyTrend: 'rising',
  },
  {
    lat: 35.17,
    lng: 129.17,
    weight: 0.7,
    recentOrders: 19,
    avgWaitTime: 9,
    hourlyTrend: 'stable',
  },
];

const hourlyPredictions = [
  {
    hour: 13,
    expectedOrders: 5,
    avgEarnings: 25000,
    busyAreas: ['센텀시티'],
    confidence: 80,
    recommendation: '센텀시티로 이동하세요',
  },
  {
    hour: 14,
    expectedOrders: 8,
    avgEarnings: 40000,
    busyAreas: ['서면', '센텀시티'],
    confidence: 85,
    recommendation: '서면 지역이 좋습니다',
  },
  {
    hour: 15,
    expectedOrders: 6,
    avgEarnings: 30000,
    busyAreas: ['해운대'],
    confidence: 78,
    recommendation: '해운대로 이동 추천',
  },
  { hour: 16, expectedOrders: 4, avgEarnings: 20000, busyAreas: [], confidence: 70, recommendation: '잠시 휴식하세요' },
  {
    hour: 17,
    expectedOrders: 7,
    avgEarnings: 35000,
    busyAreas: ['연산동'],
    confidence: 82,
    recommendation: '연산동 지역으로',
  },
  {
    hour: 18,
    expectedOrders: 12,
    avgEarnings: 60000,
    busyAreas: ['연산동', '광안리'],
    confidence: 95,
    recommendation: '저녁 시간 최적 지역',
  },
  {
    hour: 19,
    expectedOrders: 15,
    avgEarnings: 75000,
    busyAreas: ['서면', '연산동'],
    confidence: 98,
    recommendation: '가장 바쁜 시간대',
  },
  {
    hour: 20,
    expectedOrders: 10,
    avgEarnings: 50000,
    busyAreas: ['광안리'],
    confidence: 88,
    recommendation: '광안리 추천',
  },
  {
    hour: 21,
    expectedOrders: 6,
    avgEarnings: 30000,
    busyAreas: [],
    confidence: 75,
    recommendation: '주문량 감소 예상',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 요청 파라미터 검증 (null 값 허용)
  const queryParams = {
    type: searchParams.get('type'),
    time: searchParams.get('time'), // null 허용
    area: searchParams.get('area'), // null 허용
  };

  const validatedParams = GetAIPredictionsRequestSchema.parse(queryParams);

  switch (validatedParams.type) {
    case 'heatmap': {
      const response = {
        success: true,
        data: heatmapData,
      };
      const validatedResponse = HeatmapResponseSchema.parse(response);
      return NextResponse.json(validatedResponse);
    }
    case 'hourly': {
      const response = {
        success: true,
        data: hourlyPredictions,
      };
      const validatedResponse = HourlyPredictionsResponseSchema.parse(response);
      return NextResponse.json(validatedResponse);
    }
    case 'predictions':
    default: {
      const response = {
        success: true,
        data: aiPredictions,
      };
      const validatedResponse = AIPredictionsResponseSchema.parse(response);
      return NextResponse.json(validatedResponse);
    }
  }
}
