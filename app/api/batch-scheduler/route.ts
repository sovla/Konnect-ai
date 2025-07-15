import { NextResponse } from 'next/server';

// 배치 작업 로그 저장을 위한 간단한 메모리 스토리지 (실제 환경에서는 DB 사용)
const batchLogs: Array<{
  id: string;
  timestamp: Date;
  type: string;
  status: 'running' | 'completed' | 'failed';
  result?: {
    success: boolean;
    data?: Record<string, unknown>;
    message?: string;
  };
  error?: string;
}> = [];

// AI 추천 배치 계산 실행
async function executeAIRecommendationBatch() {
  const batchId = `batch-${Date.now()}`;
  const startTime = new Date();

  batchLogs.push({
    id: batchId,
    timestamp: startTime,
    type: 'ai-recommendation',
    status: 'running',
  });

  try {
    // AI 추천 배치 계산 API 호출
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/ai-predictions/batch-calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error(`배치 계산 실패: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 성공 로그 업데이트
    const logIndex = batchLogs.findIndex((log) => log.id === batchId);
    if (logIndex !== -1) {
      batchLogs[logIndex] = {
        ...batchLogs[logIndex],
        status: 'completed',
        result,
      };
    }

    return result;
  } catch (error) {
    // 실패 로그 업데이트
    const logIndex = batchLogs.findIndex((log) => log.id === batchId);
    if (logIndex !== -1) {
      batchLogs[logIndex] = {
        ...batchLogs[logIndex],
        status: 'failed',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }

    throw error;
  }
}

// 배치 스케줄러 실행 (POST)
export async function POST(request: Request) {
  try {
    const { type, immediate } = await request.json();

    if (type === 'ai-recommendation') {
      if (immediate) {
        // 즉시 실행
        const result = await executeAIRecommendationBatch();

        return NextResponse.json({
          success: true,
          message: 'AI 추천 배치 계산이 완료되었습니다.',
          data: result,
        });
      } else {
        // 백그라운드 실행 (비동기)
        executeAIRecommendationBatch().catch((error) => {
          console.error('배치 작업 실행 중 오류:', error);
        });

        return NextResponse.json({
          success: true,
          message: 'AI 추천 배치 계산이 백그라운드에서 실행되고 있습니다.',
        });
      }
    }

    return NextResponse.json({ error: '지원하지 않는 배치 타입입니다.' }, { status: 400 });
  } catch (error) {
    console.error('배치 스케줄러 오류:', error);
    return NextResponse.json({ error: '배치 스케줄러 실행 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 배치 로그 조회 (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    let filteredLogs = batchLogs;

    if (type) {
      filteredLogs = batchLogs.filter((log) => log.type === type);
    }

    // 최신 로그부터 정렬
    const sortedLogs = filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        logs: sortedLogs,
        total: filteredLogs.length,
      },
    });
  } catch (error) {
    console.error('배치 로그 조회 오류:', error);
    return NextResponse.json({ error: '배치 로그 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 자동 실행을 위한 health check (운영 환경에서 cron job이 호출)
export async function HEAD() {
  try {
    executeAIRecommendationBatch().catch((error) => {
      console.error('자동 배치 실행 중 오류:', error);
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('자동 배치 스케줄러 오류:', error);
    return new Response(null, { status: 500 });
  }
}
