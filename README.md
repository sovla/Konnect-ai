# 딜버 라이더를 위한 AI 기반 수익 & 효율 관리 대시보드

라이더의 운행 데이터를 시각화하고 AI 기반 예측 정보를 제공하여, '감'이 아닌 '데이터'에 기반한 스마트한 운행을 지원하는 웹 애플리케이션입니다.

## 🎯 프로젝트 목표

- 라이더의 수익 증대와 업무 만족도 향상
- 실시간 데이터 기반의 운행 의사결정 지원
- AI 예측을 통한 효율적인 운행 구역 추천

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **상태관리**: Zustand + React Query
- **UI/차트**: Tremor, Tailwind CSS, Lucide Icons
- **날짜처리**: date-fns
- **개발도구**: ESLint, TypeScript

## 📅 날짜 설정 정보

### 개발 환경

- **고정 날짜**: 2025년 7월 14일
- **목적**: Mock 데이터와의 일관성 유지, 데모 시연 시 안정적인 데이터 표시
- **설정 위치**: `app/utils/dateHelpers.ts`

### 프로덕션 환경

- **실시간 날짜**: 실제 현재 날짜 사용
- **자동 전환**: `NODE_ENV=production` 시 자동으로 실제 날짜로 변경

### 환경별 날짜 제어

```typescript
// 개발 환경: 2025-07-14 (고정)
// 프로덕션: 실제 현재 날짜
const currentDate = getCurrentDate();

// 수동으로 데모 모드 제어 (환경변수)
NEXT_PUBLIC_DEMO_MODE = true; // 강제로 데모 모드 활성화
```

## 🚀 시작하기

### 설치

```bash
npm install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

## 📂 프로젝트 구조

```
app/
├── api/              # Next.js API 라우트 (Mock 데이터)
├── components/       # 재사용 가능한 컴포넌트들
├── constants/        # 전역 상수들
├── hooks/           # 커스텀 훅들 (React Query)
├── providers/       # Provider 컴포넌트들
├── store/           # Zustand 상태 관리
├── types/           # TypeScript 타입 정의들
└── utils/           # 유틸리티 함수들
```

## 🎨 주요 기능

### 메인 대시보드

- 오늘의 성과 요약
- AI 추천 핫스팟 미니맵
- 시간대별 콜 예측
- 주요 공지사항

### AI 추천 운행 존

- 실시간 히트맵
- AI 예측 폴리곤
- 지도 인터랙션 (클릭, 필터)

### 상세 수익 분석

- 기간별 수익 트렌드
- 수익 구성 분석 (기본료/프로모션/팁)
- 요일별 평균 수익

## 🔧 개발 설정

### 환경변수

```env
# 데모 모드 강제 활성화 (선택사항)
NEXT_PUBLIC_DEMO_MODE=true

# API 기본 URL (기본값: /api)
NEXT_PUBLIC_API_BASE_URL=/api
```

### 날짜 디버그 정보 확인

개발 중 현재 사용되는 날짜 정보를 확인하려면:

```typescript
import { getDateInfo } from './app/utils/dateHelpers';
console.log(getDateInfo());
```

## 📱 반응형 지원

- **모바일**: 1열 레이아웃
- **태블릿**: 2열 레이아웃
- **데스크톱**: 2열 레이아웃

## 🎭 데모 데이터

모든 Mock 데이터는 2025년 7월 14일을 기준으로 작성되어 있습니다:

- 배달 내역, 수익 데이터
- AI 예측 정보
- 공지사항 및 프로모션

## 📄 라이선스

이 프로젝트는 포트폴리오 목적으로 제작되었습니다.
