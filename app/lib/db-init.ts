import { ensureSeedData } from './seed-checker';

// 전역 변수로 초기화 상태 추적 (개발환경에서 핫 리로드 대응)
const globalForInit = globalThis as unknown as {
  dbInitialized: boolean;
};

/**
 * API 라우트에서 호출하는 데이터베이스 초기화 함수
 * 한 번만 실행되고 이후 호출은 무시됩니다.
 */
export async function initDatabase() {
  // 이미 초기화된 경우 스킵
  if (globalForInit.dbInitialized) {
    return;
  }

  try {
    console.log('🔄 데이터베이스 초기화를 시작합니다...');

    // 시드 데이터 확인 및 생성
    await ensureSeedData();

    // 초기화 완료 플래그 설정
    globalForInit.dbInitialized = true;

    console.log('✅ 데이터베이스 초기화가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    // 에러가 발생해도 API 동작은 계속 진행
  }
}

/**
 * API 라우트에서 사용할 데이터베이스 초기화 래퍼
 * 모든 데이터베이스 관련 API 라우트의 맨 위에서 호출하세요.
 *
 * @example
 * export async function GET() {
 *   await withDbInit();
 *   // ... 나머지 API 로직
 * }
 */
export async function withDbInit() {
  await initDatabase();
}
