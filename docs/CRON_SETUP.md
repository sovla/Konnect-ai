# AI Dashboard 배치 시스템 설정 가이드

## 배치 시스템 구조

### 1. 배치 워크플로우

```
Google Apps Script (30분마다)
    ↓
1. [선택사항] 배달 데이터 생성 (/api/deliveries/batch-generate)
    ↓
2. 배치 스케줄러 실행 (/api/batch-scheduler)
    ↓
3. AI 예측 계산 실행 (/api/ai-predictions/batch-calculate)
    ↓
4. 로그 확인 및 알림
```

### 2. 현재 Vercel 설정 (백업용)

- **스케줄**: 하루 2번 (오전 9시, 오후 9시)
- **경로**: `/api/ai-predictions/batch-calculate`
- **제한사항**: Hobby 플랜 하루 2번 제한

### 3. Google Apps Script 설정 (메인)

- **무료 사용 가능**
- **30분마다 실행**
- **완전한 워크플로우 관리**
- **상세한 로그 및 알림**

## Google Apps Script 설정 방법

### 1. 스크립트 생성

1. [Google Apps Script](https://script.google.com/) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: `AI Dashboard Batch System`
4. `scripts/apps-script-cron.js` 파일 내용을 복사/붙여넣기

### 2. 설정 수정

```javascript
const CONFIG = {
  // 실제 배포된 도메인으로 변경
  API_BASE_URL: 'https://your-project.vercel.app',

  // 환경 설정
  ENVIRONMENT: 'production', // 운영환경
  ENABLE_DATA_GENERATION: false, // 운영환경에서는 false

  // 인증 (필요한 경우)
  AUTH_TOKEN: '', // Bearer 토큰

  // 알림 설정
  EMAIL_ALERT: 'your-email@example.com',
  SLACK_WEBHOOK_URL: '', // Slack 웹훅 URL

  // 재시도 설정
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
};
```

### 3. 개발환경 설정 (선택사항)

개발환경에서 테스트 데이터가 필요한 경우:

```javascript
const CONFIG = {
  // ...
  ENVIRONMENT: 'development',
  ENABLE_DATA_GENERATION: true, // 매번 실행시 20건 생성
  // ...
};
```

### 4. 트리거 설정

1. Apps Script 에디터에서 함수 선택: `setupTrigger`
2. 실행 버튼 클릭 (▶️)
3. 권한 승인 (처음 실행시)

또는 수동으로 트리거 설정:

1. 왼쪽 메뉴에서 "트리거" 선택
2. "+ 트리거 추가" 클릭
3. 설정:
   - 실행할 함수: `runBatchSystem`
   - 이벤트 소스: 시간 기반
   - 시간 간격: 30분마다

### 5. 권한 승인

처음 실행시 Google 계정 권한 승인:

- **Gmail**: 오류 알림 발송
- **Google Sheets**: 로그 저장
- **외부 서비스**: API 호출

### 6. 테스트 실행

1. 함수 선택: `testBatchSystem`
2. 실행 버튼 클릭
3. 로그 확인 (실행 로그 탭)

### 7. 설정 확인

- 함수 실행: `checkConfig`
- 현재 설정 상태 확인
- 트리거 활성화 상태 확인

## 로그 및 모니터링

### 1. Google Sheets 로그

- **자동 생성**: `AI Dashboard Batch Logs`
- **시트명**: `BatchLogs`
- **기록 항목**:
  - 실행 시간
  - 실행 ID
  - 각 단계별 성공/실패 상태
  - 상세 정보

### 2. 이메일 알림

- **발송 조건**: 오류 발생시
- **내용**: 시간, 오류 제목, 상세 내용
- **형식**: HTML 이메일

### 3. Slack 알림

- **설정**: Slack 웹훅 URL 필요
- **발송 조건**: 오류 발생시
- **형식**: 구조화된 메시지

## 다른 대안들

### 1. GitHub Actions (무료)

```yaml
name: AI Dashboard Batch
on:
  schedule:
    - cron: '*/30 * * * *' # 30분마다
jobs:
  batch-system:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Batch
        run: |
          curl -X HEAD https://your-project.vercel.app/api/batch-scheduler
```

### 2. Uptime Robot (무료)

- **설정**: 웹사이트 모니터링으로 API 호출
- **간격**: 5분마다 가능
- **제한**: 무료 플랜 50개 모니터

### 3. Railway/Render Cron Jobs

- **Railway**: 무료 tier cron job 지원
- **Render**: 스케줄된 잡 기능

### 4. 서버리스 플랫폼

- **Vercel Pro**: 무제한 cron job ($20/월)
- **Netlify**: 스케줄된 함수 지원
- **AWS Lambda**: CloudWatch Events 트리거

## 추천 운영 전략

### 단계별 구축

1. **1단계**: Google Apps Script만 사용
2. **2단계**: Vercel cron을 백업으로 추가
3. **3단계**: 알림 시스템 구축
4. **4단계**: 로그 분석 및 최적화

### 이중화 전략

- **메인**: Google Apps Script (30분마다)
- **백업**: Vercel Cron (하루 2번)
- **모니터링**: 둘 다 실패시 알림

### 장애 대응

1. **자동 재시도**: 최대 3번 시도
2. **이메일 알림**: 실패시 즉시 알림
3. **수동 실행**: 필요시 `testBatchSystem()` 실행
4. **로그 분석**: Google Sheets에서 패턴 분석

## 비용 비교

| 솔루션             | 비용   | 실행 빈도 | 장점            | 단점          |
| ------------------ | ------ | --------- | --------------- | ------------- |
| Google Apps Script | 무료   | 30분마다  | 무료, 안정적    | 복잡한 설정   |
| Vercel Hobby       | 무료   | 하루 2번  | 간단한 설정     | 제한적        |
| Vercel Pro         | $20/월 | 무제한    | 무제한 실행     | 유료          |
| GitHub Actions     | 무료   | 30분마다  | 무료, 코드 관리 | 복잡한 설정   |
| Uptime Robot       | 무료   | 5분마다   | 매우 자주 실행  | 모니터링 용도 |

이 설정으로 안정적이고 비용 효율적인 30분마다 배치 시스템을 구축할 수 있습니다!
