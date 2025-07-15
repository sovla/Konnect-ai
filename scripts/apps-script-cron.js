/**
 * Google Apps Script를 사용한 AI Dashboard 배치 시스템
 *
 * 배치 워크플로우:
 * 1. 배치 스케줄러 실행 (메인)
 * 2. 필요시 배달 데이터 생성 (개발환경용)
 * 3. 로그 확인 및 알림
 *
 * 사용법:
 * 1. https://script.google.com/ 접속
 * 2. 새 프로젝트 생성
 * 3. 이 코드를 복사/붙여넣기
 * 4. CONFIG 설정 수정
 * 5. setupTrigger() 함수 실행하여 트리거 설정
 */

// 환경 변수 설정
const CONFIG = {
  // 실제 배포된 도메인으로 변경하세요
  API_BASE_URL: 'https://konnect-ai.vercel.app',

  // 배치 설정
  ENVIRONMENT: 'production', // 'development' | 'production'
  ENABLE_DATA_GENERATION: false, // 개발환경에서만 true로 설정

  // 인증 설정 (필요한 경우)
  AUTH_TOKEN: '', // Bearer 토큰

  // 알림 설정
  SLACK_WEBHOOK_URL: '', // Slack 웹훅 URL
  EMAIL_ALERT: 'your-email@example.com', // 알림 이메일

  // 재시도 설정
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000, // 5초
};

/**
 * 메인 배치 실행 함수 - 30분마다 실행
 */
function runBatchSystem() {
  const executionId = `exec-${Date.now()}`;
  console.log(`[${executionId}] 배치 시스템 시작: ${new Date()}`);

  try {
    // 배치 워크플로우 실행
    const results = {
      executionId,
      timestamp: new Date(),
      dataGeneration: null,
      batchScheduler: null,
      logs: null,
      errors: [],
    };

    // 1. 배달 데이터 생성 (개발환경용)
    if (CONFIG.ENABLE_DATA_GENERATION) {
      results.dataGeneration = generateDeliveryData();
    }

    // 2. 메인 배치 스케줄러 실행
    results.batchScheduler = executeBatchScheduler();

    // 3. 배치 로그 확인 (선택사항)
    results.logs = getBatchLogs();

    // 4. 결과 로깅
    logBatchResults(results);

    console.log(`[${executionId}] 배치 시스템 완료`);
  } catch (error) {
    console.error(`[${executionId}] 배치 시스템 오류:`, error);
    sendErrorNotification('배치 시스템 실행 오류', error.toString());
  }
}

/**
 * 1. 배달 데이터 생성 (개발환경용)
 */
function generateDeliveryData() {
  console.log('배달 데이터 생성 시작...');

  try {
    const payload = {
      count: 20, // 생성할 데이터 개수
      dateRange: 'today', // 오늘 날짜 기준
    };

    const response = UrlFetchApp.fetch(`${CONFIG.API_BASE_URL}/api/deliveries/batch-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CONFIG.AUTH_TOKEN && { Authorization: `Bearer ${CONFIG.AUTH_TOKEN}` }),
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    const responseData = response.getContentText();

    if (responseCode === 200) {
      const result = JSON.parse(responseData);
      console.log('배달 데이터 생성 성공:', result.data?.count || 0, '건');
      return { success: true, data: result };
    } else {
      console.warn('배달 데이터 생성 실패:', responseCode, responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error('배달 데이터 생성 오류:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * 2. 메인 배치 스케줄러 실행
 */
function executeBatchScheduler() {
  console.log('배치 스케줄러 실행 시작...');

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`배치 스케줄러 실행 시도 ${attempt}/${CONFIG.MAX_RETRIES}`);

      // POST 요청으로 배치 스케줄러 실행 (Google Apps Script는 HEAD 메서드 미지원)
      const response = UrlFetchApp.fetch(`${CONFIG.API_BASE_URL}/api/batch-scheduler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CONFIG.AUTH_TOKEN && { Authorization: `Bearer ${CONFIG.AUTH_TOKEN}` }),
        },
        payload: JSON.stringify({
          type: 'ai-recommendation',
          immediate: true, // 즉시 실행 및 결과 반환
        }),
        muteHttpExceptions: true,
      });

      const responseCode = response.getResponseCode();
      const responseData = response.getContentText();

      if (responseCode === 200) {
        const result = JSON.parse(responseData);
        console.log('배치 스케줄러 실행 성공:', result.message);

        return {
          success: true,
          attempt,
          statusCode: responseCode,
          data: result,
        };
      } else {
        console.warn(`배치 스케줄러 실행 실패 (시도 ${attempt}): ${responseCode}`);
        console.warn('응답 내용:', responseData);

        if (attempt === CONFIG.MAX_RETRIES) {
          throw new Error(`배치 스케줄러 실행 최종 실패: ${responseCode} - ${responseData}`);
        }

        // 재시도 전 대기
        Utilities.sleep(CONFIG.RETRY_DELAY_MS);
      }
    } catch (error) {
      console.error(`배치 스케줄러 실행 오류 (시도 ${attempt}):`, error);

      if (attempt === CONFIG.MAX_RETRIES) {
        throw error;
      }

      Utilities.sleep(CONFIG.RETRY_DELAY_MS);
    }
  }
}

/**
 * 3. 배치 로그 조회
 */
function getBatchLogs() {
  console.log('배치 로그 조회 시작...');

  try {
    const response = UrlFetchApp.fetch(`${CONFIG.API_BASE_URL}/api/batch-scheduler?type=ai-recommendation&limit=5`, {
      method: 'GET',
      headers: {
        ...(CONFIG.AUTH_TOKEN && { Authorization: `Bearer ${CONFIG.AUTH_TOKEN}` }),
      },
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    const responseData = response.getContentText();

    if (responseCode === 200) {
      const result = JSON.parse(responseData);
      console.log('배치 로그 조회 성공:', result.data?.logs?.length || 0, '건');
      return { success: true, data: result.data };
    } else {
      console.warn('배치 로그 조회 실패:', responseCode, responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error('배치 로그 조회 오류:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * 배치 결과 로깅
 */
function logBatchResults(results) {
  const sheet = getLogSheet();
  const timestamp = new Date();

  // 실행 결과 요약
  const summary = {
    executionId: results.executionId,
    timestamp,
    dataGeneration: results.dataGeneration?.success || 'SKIPPED',
    batchScheduler: results.batchScheduler?.success || false,
    logsRetrieved: results.logs?.success || false,
    hasErrors: results.errors.length > 0,
  };

  // 스프레드시트에 로그 저장
  sheet.appendRow([
    timestamp,
    summary.executionId,
    summary.dataGeneration,
    summary.batchScheduler ? 'SUCCESS' : 'FAILED',
    summary.logsRetrieved ? 'SUCCESS' : 'FAILED',
    summary.hasErrors ? 'ERROR' : 'OK',
    JSON.stringify(results).substring(0, 1000), // 처음 1000자만 저장
  ]);

  // 성공 알림 (선택사항)
  if (summary.batchScheduler && !summary.hasErrors) {
    console.log('배치 시스템 정상 완료');
  } else {
    sendErrorNotification('배치 시스템 실행 문제', JSON.stringify(summary));
  }
}

/**
 * 에러 알림 발송
 */
function sendErrorNotification(title, error) {
  const sheet = getLogSheet();
  const timestamp = new Date();

  // 에러 로그 저장
  sheet.appendRow([timestamp, `ERROR-${Date.now()}`, 'ERROR', 'ERROR', 'ERROR', 'ALERT_SENT', `${title}: ${error}`]);

  // 이메일 알림
  if (CONFIG.EMAIL_ALERT) {
    try {
      MailApp.sendEmail({
        to: CONFIG.EMAIL_ALERT,
        subject: `🚨 [AI Dashboard] ${title}`,
        htmlBody: `
          <h3>AI Dashboard 배치 시스템 오류 알림</h3>
          <p><strong>시간:</strong> ${timestamp}</p>
          <p><strong>제목:</strong> ${title}</p>
          <p><strong>내용:</strong></p>
          <pre>${error}</pre>
          
          <hr>
          <p><small>이 알림은 Google Apps Script에서 자동으로 발송되었습니다.</small></p>
        `,
      });
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
    }
  }

  // Slack 알림
  if (CONFIG.SLACK_WEBHOOK_URL) {
    try {
      UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          text: `🚨 AI Dashboard 배치 시스템 오류`,
          attachments: [
            {
              color: 'danger',
              fields: [
                { title: '시간', value: timestamp.toString(), short: true },
                { title: '제목', value: title, short: true },
                { title: '내용', value: error, short: false },
              ],
            },
          ],
        }),
      });
    } catch (slackError) {
      console.error('Slack 알림 실패:', slackError);
    }
  }
}

/**
 * 로그 시트 관리
 */
function getLogSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('AI Dashboard Batch Logs');
  let sheet = spreadsheet.getSheetByName('BatchLogs');

  if (!sheet) {
    sheet = spreadsheet.insertSheet('BatchLogs');
    // 헤더 추가
    sheet.appendRow([
      'Timestamp',
      'ExecutionId',
      'DataGeneration',
      'BatchScheduler',
      'LogsRetrieved',
      'Status',
      'Details',
    ]);
  }

  return sheet;
}

/**
 * 트리거 설정 함수
 */
function setupTrigger() {
  // 기존 트리거 삭제
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((trigger) => {
    if (trigger.getHandlerFunction() === 'runBatchSystem') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 새 트리거 생성 (30분마다)
  ScriptApp.newTrigger('runBatchSystem').timeBased().everyMinutes(30).create();

  console.log('✅ 30분마다 실행되는 배치 시스템 트리거가 설정되었습니다.');
}

/**
 * 트리거 삭제 함수
 */
function deleteTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((trigger) => {
    if (trigger.getHandlerFunction() === 'runBatchSystem') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  console.log('✅ 배치 시스템 트리거가 삭제되었습니다.');
}

/**
 * 수동 테스트 함수
 */
function testBatchSystem() {
  console.log('🧪 배치 시스템 수동 테스트 실행');
  runBatchSystem();

  // 로그 확인
  const sheet = getLogSheet();
  const lastRow = sheet.getLastRow();
  const lastLog = sheet.getRange(lastRow, 1, 1, 7).getValues()[0];

  console.log('📋 최근 실행 로그:', lastLog);
}

/**
 * 설정 확인 함수
 */
function checkConfig() {
  console.log('⚙️ 현재 설정:');
  console.log('- API URL:', CONFIG.API_BASE_URL);
  console.log('- 환경:', CONFIG.ENVIRONMENT);
  console.log('- 데이터 생성:', CONFIG.ENABLE_DATA_GENERATION);
  console.log('- 이메일 알림:', CONFIG.EMAIL_ALERT);
  console.log('- Slack 알림:', CONFIG.SLACK_WEBHOOK_URL ? '설정됨' : '설정안됨');

  // 트리거 상태 확인
  const triggers = ScriptApp.getProjectTriggers();
  const batchTrigger = triggers.find((trigger) => trigger.getHandlerFunction() === 'runBatchSystem');

  console.log('- 트리거 상태:', batchTrigger ? '활성' : '비활성');

  if (batchTrigger) {
    console.log('- 트리거 유형:', batchTrigger.getEventType());
  }
}

/**
 * API 연결 테스트 함수
 */
function testApiConnection() {
  console.log('🔌 API 연결 테스트 시작...');

  try {
    // 단순 GET 요청으로 API 연결 테스트
    const response = UrlFetchApp.fetch(`${CONFIG.API_BASE_URL}/api/batch-scheduler?limit=1`, {
      method: 'GET',
      headers: {
        ...(CONFIG.AUTH_TOKEN && { Authorization: `Bearer ${CONFIG.AUTH_TOKEN}` }),
      },
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    const responseData = response.getContentText();

    console.log('📡 API 응답 코드:', responseCode);
    console.log('📡 API 응답 내용:', responseData.substring(0, 200));

    if (responseCode === 200) {
      console.log('✅ API 연결 성공!');
      return true;
    } else {
      console.log('❌ API 연결 실패:', responseCode);
      return false;
    }
  } catch (error) {
    console.error('❌ API 연결 오류:', error);
    return false;
  }
}
