import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 클라이언트 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 사용 가능한 Gemini 모델 목록 (우선순위 순)
const AVAILABLE_MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.0-pro', 'gemini-pro'] as const;

// 429 에러 및 기타 에러 처리를 위한 재시도 로직
async function executeWithRetry<T>(
  operation: (modelName: string) => Promise<T>,
  maxRetries: number = AVAILABLE_MODELS.length,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries && i < AVAILABLE_MODELS.length; i++) {
    const modelName = AVAILABLE_MODELS[i];

    try {
      console.log(`Gemini API 요청 시도 (모델: ${modelName})`);
      const result = await operation(modelName);

      if (i > 0) {
        console.log(`${modelName} 모델로 성공적으로 처리됨`);
      }

      return result;
    } catch (error: unknown) {
      lastError = error as Error;
      const errorWithStatus = error as { status?: number; message?: string };

      // 429 에러 (Rate Limit) 또는 503 에러 (Service Unavailable) 시 다른 모델로 재시도
      if (errorWithStatus?.status === 429 || errorWithStatus?.status === 503) {
        console.warn(`모델 ${modelName}에서 ${errorWithStatus.status} 에러 발생, 다른 모델로 재시도...`);

        // 잠시 대기 후 다음 모델로 재시도
        if (i < AVAILABLE_MODELS.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }

      // 다른 종류의 에러이거나 마지막 모델인 경우 에러 처리
      if (i === maxRetries - 1 || i === AVAILABLE_MODELS.length - 1) {
        console.error(`모든 모델에서 실패: ${errorWithStatus.message || 'Unknown error'}`);
        throw error;
      }

      console.warn(
        `모델 ${modelName}에서 오류 발생, 다른 모델로 재시도: ${errorWithStatus.message || 'Unknown error'}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError || new Error('모든 모델에서 요청 실패');
}

// 좌표를 실제 주소명으로 변환하는 함수
export async function convertCoordinatesToAddress(lat: number, lng: number): Promise<string> {
  try {
    const result = await executeWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
부산 지역의 좌표 (위도: ${lat}, 경도: ${lng})를 실제 주소명으로 변환해주세요.
다음 형식으로 응답해주세요:
- 정확한 동명이나 대표 지역명
- 간단하고 이해하기 쉬운 형태

예시:
- 좌표: 35.1588, 129.1603 → "해운대 해수욕장"
- 좌표: 35.1579, 129.0594 → "서면 중심가"
- 좌표: 35.1372, 129.1013 → "경성대 부근"

현재 좌표에 대한 주소명만 반환해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    // 응답에서 실제 주소명만 추출
    const addressMatch = result.match(/→\s*"([^"]+)"/);
    if (addressMatch) {
      return addressMatch[1];
    }

    // 매칭되지 않으면 전체 응답에서 따옴표 안의 내용 찾기
    const quotedMatch = result.match(/"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // 그래도 없으면 깔끔하게 정리된 응답 반환
    return result.trim().replace(/["\n]/g, '');
  } catch (error) {
    console.error('주소 변환 오류:', error);
    // fallback: 기본 형태로 반환
    return `${lat.toFixed(3)}, ${lng.toFixed(3)} 지역`;
  }
}

// 배치로 여러 좌표를 한번에 변환
export async function convertMultipleCoordinates(
  coordinates: Array<{ lat: number; lng: number; id: string }>,
): Promise<Array<{ id: string; address: string }>> {
  const results = [];

  for (const coord of coordinates) {
    try {
      const address = await convertCoordinatesToAddress(coord.lat, coord.lng);
      results.push({ id: coord.id, address });

      // API 호출 제한을 위한 지연 (다중 모델 사용으로 인한 추가 보호)
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`좌표 변환 실패 (${coord.id}):`, error);
      results.push({
        id: coord.id,
        address: `${coord.lat.toFixed(3)}, ${coord.lng.toFixed(3)} 지역`,
      });
    }
  }

  return results;
}

// 지역별 특성 분석 (추가 기능)
export async function analyzeAreaCharacteristics(
  lat: number,
  lng: number,
  deliveryData: {
    avgEarnings: number;
    avgDeliveryTime: number;
    orderCount: number;
    timePattern: string;
  },
): Promise<string> {
  try {
    const result = await executeWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
부산 지역의 배달 데이터를 분석하여 지역 특성을 설명해주세요.

위치: 위도 ${lat}, 경도 ${lng}
데이터:
- 평균 수익: ${deliveryData.avgEarnings.toLocaleString()}원
- 평균 배달 시간: ${deliveryData.avgDeliveryTime}분
- 주문 건수: ${deliveryData.orderCount}건
- 시간대 패턴: ${deliveryData.timePattern}

다음 형식으로 분석해주세요:
1. 지역명
2. 지역 특성 (오피스가/주거지역/상업지역 등)
3. 배달 추천 포인트 (1-2줄)

간단하고 실용적인 정보로 작성해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    return result;
  } catch (error) {
    console.error('지역 특성 분석 오류:', error);
    return '지역 특성 분석을 완료하지 못했습니다.';
  }
}

// AI 기반 개인화 추천 생성
export async function generatePersonalizedRecommendations(
  riderProfile: {
    preferredAreas: string[];
    vehicleType: string;
    avgDeliveryTime: number;
    averageRating: number;
    workingHours: { start: number; end: number };
  },
  currentStats: {
    todayEarnings: number;
    todayDeliveries: number;
    currentHour: number;
    weatherCondition?: string;
  },
  availableZones: Array<{
    id: string;
    name: string;
    avgFee: number;
    expectedCalls: number;
    confidence: number;
    location: { lat: number; lng: number };
  }>,
): Promise<
  Array<{
    zoneId: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    reasoning: string;
    confidence: number;
  }>
> {
  try {
    const result = await executeWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
배달 라이더를 위한 개인화된 운행 지역 추천을 생성해주세요.

라이더 프로필:
- 선호 지역: ${riderProfile.preferredAreas.join(', ')}
- 차량 유형: ${riderProfile.vehicleType}
- 평균 배달 시간: ${riderProfile.avgDeliveryTime}분
- 평균 평점: ${riderProfile.averageRating}/5.0
- 근무 시간: ${riderProfile.workingHours.start}시 ~ ${riderProfile.workingHours.end}시

현재 상황:
- 오늘 수익: ${currentStats.todayEarnings.toLocaleString()}원
- 오늘 배달 건수: ${currentStats.todayDeliveries}건
- 현재 시간: ${currentStats.currentHour}시
- 날씨 상태: ${currentStats.weatherCondition || '정상'}

사용 가능한 지역들:
${availableZones
  .map(
    (zone) => `
- ${zone.name}: 평균 ${zone.avgFee.toLocaleString()}원/건, 예상 ${zone.expectedCalls}건/시, 신뢰도 ${(
      zone.confidence * 100
    ).toFixed(1)}%
`,
  )
  .join('')}

다음 JSON 형식으로 상위 3개 지역을 추천해주세요:
[
  {
    "zoneId": "지역ID",
    "priority": "HIGH/MEDIUM/LOW",
    "title": "간단한 제목",
    "description": "추천 이유 요약 (1-2줄)",
    "reasoning": "상세한 분석 및 추천 근거",
    "confidence": 0.8
  }
]

라이더의 선호도, 과거 성과, 현재 상황을 종합적으로 고려하여 추천해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    // JSON 파싱 시도
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return recommendations.slice(0, 3); // 최대 3개
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패:', parseError);
    }

    // 파싱 실패 시 기본 추천 반환
    return availableZones.slice(0, 3).map((zone) => ({
      zoneId: zone.id,
      priority: 'MEDIUM' as const,
      title: `${zone.name} 추천`,
      description: `평균 ${zone.avgFee.toLocaleString()}원/건, 예상 ${zone.expectedCalls}건/시`,
      reasoning: 'AI 분석 결과 수익성이 높은 지역입니다.',
      confidence: zone.confidence,
    }));
  } catch (error) {
    console.error('개인화 추천 생성 오류:', error);
    return [];
  }
}

// 배달 패턴 분석 및 인사이트 생성
export async function analyzeDeliveryPatterns(
  deliveryHistory: Array<{
    date: string;
    earnings: number;
    deliveries: number;
    avgDeliveryTime: number;
    areas: string[];
    weather?: string;
  }>,
): Promise<{
  insights: string[];
  recommendations: string[];
  trends: {
    earningsPattern: string;
    timePattern: string;
    areaPattern: string;
    weatherImpact: string;
  };
}> {
  try {
    const result = await executeWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
배달 라이더의 운행 패턴을 분석하고 인사이트를 제공해주세요.

최근 배달 기록:
${deliveryHistory
  .map(
    (record) => `
- ${record.date}: ${record.earnings.toLocaleString()}원 (${record.deliveries}건, 평균 ${record.avgDeliveryTime}분)
  주요 지역: ${record.areas.join(', ')}
  날씨: ${record.weather || '정상'}
`,
  )
  .join('')}

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "insights": [
    "주요 발견사항 1",
    "주요 발견사항 2",
    "주요 발견사항 3"
  ],
  "recommendations": [
    "구체적인 개선 제안 1",
    "구체적인 개선 제안 2",
    "구체적인 개선 제안 3"
  ],
  "trends": {
    "earningsPattern": "수익 패턴 분석",
    "timePattern": "시간대별 패턴 분석",
    "areaPattern": "지역별 패턴 분석",
    "weatherImpact": "날씨 영향 분석"
  }
}

실용적이고 실행 가능한 인사이트를 제공해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    // JSON 파싱 시도
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('패턴 분석 JSON 파싱 실패:', parseError);
    }

    // 파싱 실패 시 기본 분석 반환
    return {
      insights: ['배달 패턴을 분석 중입니다.'],
      recommendations: ['더 많은 데이터가 필요합니다.'],
      trends: {
        earningsPattern: '수익 패턴 분석 중',
        timePattern: '시간대별 패턴 분석 중',
        areaPattern: '지역별 패턴 분석 중',
        weatherImpact: '날씨 영향 분석 중',
      },
    };
  } catch (error) {
    console.error('배달 패턴 분석 오류:', error);
    return {
      insights: ['분석 중 오류가 발생했습니다.'],
      recommendations: ['나중에 다시 시도해주세요.'],
      trends: {
        earningsPattern: '분석 실패',
        timePattern: '분석 실패',
        areaPattern: '분석 실패',
        weatherImpact: '분석 실패',
      },
    };
  }
}

// 실시간 상황 분석 및 조언
export async function generateRealTimeAdvice(currentSituation: {
  currentLocation: { lat: number; lng: number; address: string };
  currentTime: number;
  todayStats: {
    earnings: number;
    deliveries: number;
    avgDeliveryTime: number;
  };
  availableOrders: Array<{
    distance: number;
    estimatedFee: number;
    estimatedTime: number;
    restaurantType: string;
  }>;
  weatherCondition?: string;
  trafficCondition?: string;
}): Promise<{
  advice: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  actionItems: string[];
}> {
  try {
    const result = await executeWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
배달 라이더의 현재 상황을 분석하고 실시간 조언을 제공해주세요.

현재 상황:
- 위치: ${currentSituation.currentLocation.address}
- 시간: ${currentSituation.currentTime}시
- 오늘 수익: ${currentSituation.todayStats.earnings.toLocaleString()}원
- 오늘 배달: ${currentSituation.todayStats.deliveries}건
- 평균 배달 시간: ${currentSituation.todayStats.avgDeliveryTime}분
- 날씨: ${currentSituation.weatherCondition || '정상'}
- 교통 상황: ${currentSituation.trafficCondition || '원활'}

현재 가능한 주문들:
${currentSituation.availableOrders
  .map(
    (order, index) => `
${index + 1}. ${order.restaurantType} - ${order.distance}km, 예상 ${order.estimatedFee.toLocaleString()}원, ${
      order.estimatedTime
    }분
`,
  )
  .join('')}

다음 JSON 형식으로 조언을 제공해주세요:
{
  "advice": "현재 상황에 대한 종합적인 조언",
  "urgency": "HIGH/MEDIUM/LOW",
  "actionItems": [
    "구체적인 행동 지침 1",
    "구체적인 행동 지침 2",
    "구체적인 행동 지침 3"
  ]
}

실시간 상황을 고려한 실용적인 조언을 제공해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    // JSON 파싱 시도
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('실시간 조언 JSON 파싱 실패:', parseError);
    }

    // 파싱 실패 시 기본 조언 반환
    return {
      advice: '현재 상황을 분석하여 최적의 조언을 준비하고 있습니다.',
      urgency: 'MEDIUM' as const,
      actionItems: ['가장 가까운 주문부터 확인해보세요.'],
    };
  } catch (error) {
    console.error('실시간 조언 생성 오류:', error);
    return {
      advice: '조언 생성 중 오류가 발생했습니다.',
      urgency: 'LOW' as const,
      actionItems: ['나중에 다시 시도해주세요.'],
    };
  }
}
