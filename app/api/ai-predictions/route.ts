import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  AIPredictionsResponseSchema,
  HeatmapResponseSchema,
  HourlyPredictionsResponseSchema,
  GetAIPredictionsRequestSchema,
} from '@/app/types/dto';
import { getCurrentDate } from '@/app/utils/dateHelpers';

// 한글 hourlyTrend를 영어로 변환하는 함수
function convertHourlyTrend(koreanTrend: string): 'rising' | 'stable' | 'falling' {
  switch (koreanTrend) {
    case '증가':
    case '매우 증가':
      return 'rising';
    case '안정':
      return 'stable';
    case '감소':
    case '매우 감소':
      return 'falling';
    default:
      return 'stable'; // 기본값
  }
}

export async function GET(request: Request) {
  try {
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
        // DB에서 히트맵 데이터 조회
        const heatmapPoints = await prisma.heatmapPoint.findMany({
          orderBy: { weight: 'desc' },
          select: {
            lat: true,
            lng: true,
            weight: true,
            recentOrders: true,
            avgWaitTime: true,
            hourlyTrend: true,
          },
        });

        // 한글 hourlyTrend를 영어로 변환
        const formattedHeatmapPoints = heatmapPoints.map((point) => ({
          ...point,
          hourlyTrend: convertHourlyTrend(point.hourlyTrend),
        }));

        const response = {
          success: true,
          data: formattedHeatmapPoints,
        };
        const validatedResponse = HeatmapResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }

      case 'hourly': {
        // 일주일간 시간대별 예측 데이터 조회
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const today = getCurrentDate();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const hourlyPredictionsData = await prisma.aIZonePrediction.findMany({
          where: {
            predictionDate: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          include: {
            zone: true,
          },
          orderBy: { hour: 'asc' },
        });

        // 시간대별로 그룹화하여 집계
        const hourlyMap = new Map();
        hourlyPredictionsData.forEach((prediction) => {
          const hour = prediction.hour;
          if (!hourlyMap.has(hour)) {
            hourlyMap.set(hour, {
              hour,
              expectedOrders: 0,
              avgEarnings: 0,
              busyAreas: [],
              confidence: 0,
              count: 0,
            });
          }

          const hourData = hourlyMap.get(hour);
          hourData.expectedOrders += prediction.expectedCalls;
          hourData.avgEarnings += prediction.zone.avgFee * prediction.expectedCalls;
          hourData.confidence += prediction.confidence;
          hourData.count += 1;

          if (prediction.expectedCalls >= 5) {
            hourData.busyAreas.push(prediction.zone.name);
          }
        });

        console.log(hourlyMap);
        // 평균 계산 및 추천 메시지 생성
        const hourlyPredictions = Array.from(hourlyMap.values()).map((data) => ({
          hour: data.hour,
          expectedOrders: data.expectedOrders,
          avgEarnings: Math.round(data.avgEarnings),
          busyAreas: [...new Set(data.busyAreas)], // 중복 제거
          confidence: Math.round((data.confidence / data.count) * 100),
          recommendation:
            data.expectedOrders >= 10
              ? '가장 바쁜 시간대'
              : data.expectedOrders >= 6
              ? `${data.busyAreas[0] || '추천 지역'}으로 이동하세요`
              : data.expectedOrders >= 4
              ? '적당한 주문량 예상'
              : '잠시 휴식하세요',
        }));

        const response = {
          success: true,
          data: hourlyPredictions,
        };
        console.log(response);
        const validatedResponse = HourlyPredictionsResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }

      case 'predictions':
      default: {
        // DB에서 AI 예측 구역 데이터 조회 (dateHelpers 활용)
        const today = getCurrentDate();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const aiZones = await prisma.aIZone.findMany({
          where: { isActive: true },
          include: {
            recommendations: true,
            predictions: {
              where: {
                predictionDate: {
                  gte: startOfDay,
                  lt: endOfDay,
                },
              },
            },
          },
        });

        // 시간대별로 그룹화
        const timeSlots = [
          '00:00',
          '01:00',
          '02:00',
          '03:00',
          '04:00',
          '05:00',
          '06:00',
          '07:00',
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
          '19:00',
          '20:00',
          '21:00',
          '22:00',
          '23:00',
        ];
        const aiPredictions = timeSlots.map((time) => {
          const hour = parseInt(time.split(':')[0]);
          const polygons = aiZones
            .filter((zone) => zone.predictions.some((pred) => pred.hour === hour))
            .map((zone) => {
              const prediction = zone.predictions.find((pred) => pred.hour === hour);
              return {
                name: zone.name,
                coords: zone.coordinates as number[][],
                expectedCalls: prediction?.expectedCalls || zone.expectedCalls,
                avgFee: zone.avgFee,
                confidence: Math.round((prediction?.confidence || zone.confidence) * 100),
                reasons: zone.recommendations.map((rec) => ({
                  type: rec.type.toLowerCase(),
                  title: rec.title,
                  description: rec.description,
                  impact: rec.impact.toLowerCase(),
                  confidence: Math.round(rec.confidence * 100),
                })),
              };
            });
          return {
            time,
            polygons,
          };
        });
        const response = {
          success: true,
          data: aiPredictions,
        };
        const validatedResponse = AIPredictionsResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }
    }
  } catch (error) {
    console.error('AI 예측 데이터 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
