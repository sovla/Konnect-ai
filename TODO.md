# Konnect AI 프론트엔드 개발 TODO

## 📋 진행 상황

- **전체 작업**: 31개
- **완료**: 26개
- **진행 중**: 0개
- **대기 중**: 5개

---

## 🚀 개발 계획

### 1단계: 프로젝트 기반 구축

- [x] **프로젝트 기본 설정 및 의존성 설치** `(완료)`

  - ✅ Zustand (클라이언트 상태관리)
  - ✅ @tanstack/react-query (서버 상태관리)
  - ✅ @tremor/react (대시보드 차트 라이브러리)
  - ✅ json-server (Mock 데이터)
  - 의존성: 없음

- [x] **프로젝트 폴더 구조 생성** `(완료)`

  - ✅ /app/components - 재사용 가능한 컴포넌트들
  - ✅ /app/apis - API 함수들 (fetch 래퍼 포함)
  - ✅ /app/constants - 전역 상수들 (색상, 상태, 설정 등)
  - ✅ /app/hooks - 커스텀 훅들
  - ✅ /app/store - Zustand 스토어들
  - ✅ /app/types - TypeScript 타입 정의들 (완전한 타입 시스템)
  - 의존성: 프로젝트 기본 설정

- [x] **공통 레이아웃 컴포넌트 구현** `(완료)`
  - ✅ Header, Sidebar, DashboardLayout, DashboardCard 구현
  - ✅ 반응형 모바일/데스크톱 지원
  - ✅ 네비게이션 및 상태 관리
  - 의존성: 폴더 구조 생성

---

### 2단계: 데이터 및 상태 관리

- [x] **Mock 데이터 및 Next.js API 라우트 설정** `(완료)`

  - ✅ 배달 내역, 라이더 프로필, AI 예측 데이터 생성
  - ✅ Next.js API 라우트로 Mock 데이터 제공 (/api/deliveries, /api/rider-profile 등)
  - ✅ TypeScript 타입 정의 완료
  - ✅ API 클라이언트 함수 구현
  - 의존성: 폴더 구조 생성

- [x] **Zustand 상태 관리 및 React-Query 설정** `(완료)`

  - ✅ Zustand: 클라이언트 상태 (기간 선택, UI 상태 등)
  - ✅ React-Query: 서버 상태 관리 (API 캐싱, 동기화)
  - ✅ UI 상태 관리 스토어 (사이드바, 필터, 날짜 범위)
  - ✅ 대시보드 데이터 상태 관리 스토어
  - ✅ 지도 관련 상태 관리 스토어
  - ✅ React-Query Provider 및 커스텀 훅들 구현
  - 의존성: 프로젝트 기본 설정

- [x] **데이터베이스 마이그레이션 (JSON Server → Prisma + PostgreSQL)** `(완료)`

  - ✅ Prisma ORM 설정 및 스키마 설계
  - ✅ Prisma 클라이언트 생성 및 타입 안전성 확보
  - ✅ 완전한 관계형 데이터베이스 모델 설계 (User, RiderProfile, Delivery, AIZone 등)
  - ✅ 데이터베이스 유틸리티 파일 생성 (app/lib/prisma.ts)
  - ✅ npm 스크립트 추가 (db:generate, db:push, db:migrate 등)
  - ✅ PostgreSQL 데이터베이스 연결 설정 (Supabase 완료)
  - ✅ 기존 Mock 데이터를 PostgreSQL로 마이그레이션 (시드 데이터 생성)
  - ✅ 프로젝트 시작시 자동 시드 데이터 체크 및 생성 시스템 구축
  - ✅ 시드 데이터 스크립트 구현 (prisma/seed.ts)
  - ✅ 자동 초기화 시스템 구현 (app/lib/seed-checker.ts, db-init.ts)
  - 의존성: Mock 데이터 설정

- [x] **사용자 인증 시스템 구현** `(완료)`

  - ✅ NextAuth.js v5 + Prisma Adapter 통합 (Credentials Provider)
  - ✅ NextAuth 표준 데이터베이스 스키마 설계 (Account, Session, VerificationToken)
  - ✅ 로그인/로그아웃/회원가입 API 엔드포인트 구현
  - ✅ 이메일/비밀번호 유효성 검증 및 bcrypt 해싱
  - ✅ 인증 상태 관리 (Zustand + SessionProvider)
  - ✅ 보호된 경로 미들웨어 및 자동 리다이렉트
  - ✅ TypeScript 완전 지원 (NextAuth 타입 확장)
  - ✅ 자동 라이더 프로필 생성 (트랜잭션)
  - 의존성: 데이터베이스 마이그레이션

---

### 3단계: 핵심 기능 개발

- [x] **메인 대시보드 4개 위젯 구현** `(완료)`

  - ✅ 오늘의 성과 위젯 (실시간 수입, 완료 건수, 온라인 시간, 목표 달성률)
  - ✅ AI 추천 핫스팟 위젯 (지역별 예상 콜 수 및 평균료)
  - ✅ 시간대별 콜 예측 위젯 (3시간 예측 정보)
  - ✅ 주요 공지 위젯 (프로모션, 공지사항, 인센티브)
  - ✅ React Query를 통한 실시간 데이터 연동
  - 의존성: 공통 레이아웃, Mock 데이터

- [x] **카카오맵 API 연동 및 기본 지도 컴포넌트** `(완료)`

  - ✅ react-kakao-maps-sdk 라이브러리 도입
  - ✅ useKakaoLoader 훅을 통한 안정적인 API 로딩
  - ✅ TypeScript 완전 지원 (kakao.maps.d.ts)
  - ✅ 기본 지도 컴포넌트 (KakaoMap.tsx) 구현
  - ✅ Zustand 상태 관리 연동 (중심 좌표, 줌 레벨)
  - 의존성: 프로젝트 기본 설정

- [x] **AI 추천 운행 존 페이지 기본 구현** `(완료)`

  - ✅ /ai-zones 페이지 생성 및 라우팅
  - ✅ 실시간/AI 예측 탭 전환 기능
  - ✅ 필터 토글 (실시간 히트맵, AI 예측 폴리곤)
  - ✅ 시간대 슬라이더 (13:00~22:00)
  - ✅ 반응형 디자인 및 범례 표시
  - ✅ 기본 지도 컴포넌트 통합
  - 의존성: 카카오맵 연동

- [x] **히트맵 & 폴리곤 데이터 연동** `(완료)`

  - ✅ 실시간 히트맵 데이터 표시 기능 (원형 오버레이, 가중치 기반 색상/크기)
  - ✅ AI 예측 폴리곤 표시 기능 (시간대별 필터링, 초록색 다각형)
  - ✅ 폴리곤 클릭 이벤트 및 상세 정보 팝업 (지역명, 예상 콜 수, 평균 배달료, 신뢰도)
  - ✅ 필터 토글 연동 (실시간 히트맵 ON/OFF, AI 예측 폴리곤 ON/OFF)
  - ✅ React Query를 통한 실시간 데이터 연동
  - 의존성: AI 추천 운행 존 페이지, Mock 데이터

- [x] **지도 인터랙션 고급 기능** `(완료)`

  - ✅ 폴리곤 클릭 이벤트 및 상세 정보 팝업
  - ✅ 마커 클릭 이벤트 처리 (히트맵 마커 클릭 시 실시간 주문 현황 팝업)
  - ✅ 지도 줌/드래그 이벤트 최적화 (디바운싱, 메모이제이션)
  - ✅ 추천 이유 정보 추가 (AI 추천 구역별 상세 근거 데이터 및 UI)
  - ✅ useDebounce 커스텀 훅 구현 및 지도 컴포넌트 리팩터링
  - 의존성: 히트맵 & 폴리곤 데이터 연동

- [x] **상세 수익 분석 페이지** `(완료)`

  - ✅ 기간 선택 (주간/월간 토글)
  - ✅ 수익 요약 통계 (총 수익, 배달 건수, 평균 수익 등)
  - ✅ 주간/월간 분석 뷰 구분
  - ✅ 수익 구성 상세 정보 (기본료, 프로모션, 팁)
  - ✅ React Query를 통한 실시간 데이터 연동
  - ✅ 반응형 레이아웃 및 로딩/에러 상태 처리
  - 🔄 차트 영역은 플레이스홀더로 구현 (필요시 Tremor 차트 추가)
  - 의존성: Mock 데이터

- [x] **수익 분석 상세 내역 테이블** `(완료)`

  - ✅ 정렬, 검색 기능 포함된 테이블 (날짜, 완료 시간, 수익금, 평점별 정렬)
  - ✅ 출발지/도착지 주소 기반 검색 기능
  - ✅ 반응형 디자인 (데스크톱 테이블, 모바일 카드 레이아웃)
  - ✅ 수익 구성 상세 정보 표시 (기본료, 프로모션, 팁)
  - ✅ 운행 이력 페이지(/history)에 정확히 위치
  - ✅ 운행 이력 요약 통계 추가 (총 배달건수, 총 수익, 건당 평균, 평균 평점)
  - 의존성: 수익 분석 페이지

- [x] **차트 컴포넌트 구현** `(완료)`

  - ✅ 라인차트, 도넛차트, 바차트 (Tremor 활용)
  - ✅ TailwindCSS와 완벽 호환되는 대시보드 특화 라이브러리
  - ✅ 상세 수익 분석 페이지에 실제 차트 적용
  - ✅ 재사용 가능한 차트 컴포넌트 구조
  - 의존성: 프로젝트 기본 설정

- [x] **사용자 인증 페이지 구현** `(완료)`

  - ✅ 로그인 페이지 (/auth/login) 디자인 및 폼 구현
  - ✅ 회원가입 페이지 (/auth/register) 및 유효성 검증 UI
  - ✅ 로그아웃 기능 및 세션 관리
  - ✅ 비밀번호 재설정 페이지 (/auth/reset-password)
  - ✅ 라이더 온보딩 플로우 (프로필 설정, 운행 지역 선택)
  - ✅ 인증 가드 컴포넌트 (ProtectedRoute, RedirectIfAuthenticated)
  - 의존성: 사용자 인증 시스템

---

### 4단계: 완성도 향상

- [ ] **반응형 디자인 구현**

  - PC/태블릿/모바일 대응
  - 의존성: 메인 대시보드, 지도 인터랙션, 수익 테이블

- [ ] **API 연동 함수 구현**

  - 데이터 페칭 로직 적용
  - 의존성: 상태 관리

- [ ] **성능 최적화**

  - 이미지 최적화, 코드 스플리팅, 메모이제이션
  - 의존성: API 연동

- [x] **스켈레톤 UI 및 데이터 래퍼 시스템** `(완료)`

  - ✅ 재사용 가능한 스켈레톤 컴포넌트 (Skeleton, SkeletonText, SkeletonCircle 등)
  - ✅ 위젯별 전용 스켈레톤 (TodayStats, Hotspot, Prediction, Announcement)
  - ✅ DataWrapper/QueryWrapper 컴포넌트 (Suspense + Error Boundary 통합)
  - ✅ react-error-boundary 패키지 도입
  - 의존성: 메인 대시보드 위젯

- [x] **에러 처리 및 로딩 상태 관리** `(완료)`

  - ✅ 에러 핸들링 및 스켈레톤 UI 구현
  - ✅ 로딩/에러/데이터 없음 상태 일관된 처리
  - ✅ 재시도 기능 포함된 에러 UI
  - ✅ 개발 환경에서 상세 에러 정보 표시
  - 의존성: API 연동

- [x] **설정 페이지를 위한 데이터베이스 스키마 확장** `(완료)`

  - ✅ RiderProfile 모델에 운행 관련 설정 필드 추가 (최소 주문 금액, 선호 운행 시간, 최대 배달 거리, 자동 수락)
  - ✅ RiderProfile 모델에 알림 설정 필드 추가 (푸시 알림, 이메일 설정)
  - ✅ UserSettings 모델 신규 생성 (테마, 언어, 지도 설정, 개인정보 동의)
  - ✅ Theme, Language enum 타입 추가
  - ✅ 데이터베이스 마이그레이션 및 시드 데이터 업데이트
  - 의존성: 사용자 인증 시스템

- [x] **설정 페이지를 위한 API 엔드포인트 구현** `(완료)`

  - ✅ zod validation 라이브러리 추가 및 완전한 입력 검증
  - ✅ /api/settings - 사용자 앱 환경 설정 (테마, 언어, 지도 설정, 개인정보 동의)
  - ✅ /api/settings/rider - 라이더 운행/알림 설정 (목표, 선호 지역, 알림 토글)
  - ✅ /api/settings/profile - 사용자 프로필 정보 (이름, 이메일, 전화번호)
  - ✅ /api/settings/password - 비밀번호 변경 (현재 비밀번호 확인, 보안 검증)
  - ✅ /api/settings/account - 계정 삭제 (데이터 통계 조회, 안전한 트랜잭션 삭제)
  - ✅ 인증, 권한, 에러 처리 완비
  - 의존성: 설정 페이지를 위한 데이터베이스 스키마 확장

- [x] **설정 페이지 구현** `(완료)`

  - ✅ 사용자 프로필 설정 (/settings/profile)
  - ✅ 운행 설정 (목표 수익, 선호 지역, 알림 설정)
  - ✅ 앱 환경 설정 (테마, 언어, 지도 설정)
  - ✅ 계정 관리 (비밀번호 변경, 계정 삭제)
  - ✅ 설정 데이터 백엔드 연동 및 실시간 상태 관리
  - ✅ React Query를 통한 완전한 데이터 동기화
  - 의존성: 설정 페이지를 위한 API 엔드포인트 구현

- [ ] **도움말 및 FAQ 페이지 구현**

  - 사용법 가이드 (/help/guide) - 기능별 튜토리얼
  - 자주 묻는 질문 (/help/faq) - 카테고리별 FAQ
  - 문의하기 페이지 (/help/contact) - 이메일/채팅 지원
  - 앱 버전 정보 및 업데이트 내역
  - 라이더 커뮤니티 가이드라인
  - 검색 기능이 포함된 도움말 시스템
  - 의존성: 설정 페이지

- [x] **배달 데이터 자동 생성 API 구현** `(완료)`

  - ✅ 배달 데이터 자동 생성 API 엔드포인트 (POST /api/deliveries/batch-generate)
  - ✅ 서울 30개 + 부산 50개 주요 지역 실제 주소 데이터 (총 80개)
  - ✅ 라이더별 데이터 생성 지원 (특정 라이더/모든 라이더)
  - ✅ 다양한 날짜 범위 지원 (오늘/이번주/이번달/사용자 지정)
  - ✅ React Query 기반 커스텀 훅 (useDeliveryGenerate)
  - ✅ 개발자 도구 페이지 UI 컴포넌트 (/settings/dev)
  - ✅ 거리 기반 배달 시간 계산 및 현실적인 수익 구조
  - ✅ 완전한 문서화 (docs/DELIVERY_DATA_GENERATOR.md)
  - 의존성: 데이터베이스 마이그레이션, 사용자 인증 시스템

- [ ] **UI/UX 개선 및 애니메이션**

  - 사용자 경험 향상을 위한 UI 폴리싱
  - 의존성: 반응형 디자인

- [ ] **테스트 및 배포 준비**
  - Vercel 배포, 환경변수 설정
  - 의존성: 에러 처리, UI 개선

## �� AI 추천 시스템 DB 연동 계획 (핵심 기능)

### 5단계: AI 추천 로직 데이터베이스 연동 (간소화 버전)

#### 5.1. Mock 데이터를 DB로 이전

- [x] **Mock 데이터를 DB로 마이그레이션** `(완료)`

  - ✅ 목표: 현재 하드코딩된 데이터를 실제 DB 테이블로 이전
  - ✅ 기존 deliveries Mock 데이터 → Delivery 테이블로 시드 데이터 생성
  - ✅ AI 예측 Mock 데이터 → AIZone, AIZonePrediction 테이블로 이전
  - ✅ 히트맵 Mock 데이터 → HeatmapPoint 테이블로 이전
  - ✅ 폴리곤 렌더링을 위한 시간대별 예측 데이터 생성 로직 추가
  - ✅ dateHelpers와 일관성을 위한 날짜 수정 (2025-01-14 → 2025-07-14)
  - 의존성: 없음

#### 5.2. DB 기반 API로 변경

- [x] **배달 API를 DB 기반으로 변경** `(완료)`

  - ✅ /api/deliveries에서 Mock 배열 대신 Prisma로 DB 조회
  - ✅ 날짜 필터, 페이지네이션 등 기존 기능 유지 및 개선
  - ✅ 실제 DB 데이터로 통계 계산 (총 수익, 건수, 평균 등)
  - ✅ 검색 기능 추가 (출발지/도착지 주소 기반)
  - ✅ 완전한 페이지네이션 지원 (page, limit, offset)
  - ✅ 상세 통계 정보 제공 (총 수익, 평균 평점, 평균 배달시간 등)
  - 의존성: Mock 데이터 DB 이전

#### 5.3. 간단한 통계 기반 AI 추천

- [ ] **간단한 통계 기반 AI 추천 구현** `(대기 중)`

  - 📈 복잡한 머신러닝 대신 SQL 집계함수로 패턴 분석
  - 🕐 시간대별 평균 주문량: `SELECT hour, AVG(count) FROM deliveries GROUP BY hour`
  - 📍 지역별 평균 수익: `SELECT area, AVG(totalEarnings) FROM deliveries GROUP BY area`
  - 🎯 단순 규칙 기반 추천: "지난주 이 시간에 여기서 주문이 많았어요"
  - 의존성: DB 기반 API 완성

#### 5.4. 히트맵을 DB 데이터 기반으로 변경

- [ ] **DB 기반 히트맵 구현** `(대기 중)`

  - 🗺️ 실제 배달 완료 위치 데이터로 히트맵 포인트 생성
  - 📊 최근 1시간 배달 건수로 weight 계산
  - 🔄 /api/ai-predictions에서 실제 DB 조회로 히트맵 데이터 반환
  - 의존성: 통계 기반 추천 완성

### 💡 간소화된 기술 스택

**Database**: PostgreSQL + Prisma (현재 스택 유지)
**AI Logic**: SQL 집계함수 + 간단한 JavaScript 계산
**API**: Next.js API Routes (현재 구조 유지)

> 💭 **핵심 아이디어**: 복잡한 AI/ML 없이도 실제 데이터 기반으로 의미있는 추천을 제공할 수 있습니다. 통제된 환경에서 핵심 기능부터 완성하고, 필요시 점진적으로 고도화하는 방식입니다.

---

## 📝 작업 진행 방법

1. 각 작업을 완료하면 체크박스를 `[x]`로 변경
2. 의존성이 있는 작업은 선행 작업 완료 후 진행
3. 각 작업별 세부 내용은 상세기획서.md 참고
4. 이슈나 변경사항은 이 파일에 메모로 추가

---

## 개선 사항

- 운행이력 Pagination Infinity Scroll 적용
- AI 예측 폴리곤을 시간대로 지정해서 보고 있는데 좀더 개선해줘 처음부터 다 표시되도록

## 🔄 변경 이력

- 2025-07-14: 초기 TODO 리스트 생성
- 2025-07-14: 상태관리 라이브러리를 Recoil → Zustand + React-Query로 변경
- 2025-07-14: 차트 라이브러리를 Tremor로 확정
- 2025-07-14: 프로젝트 폴더 구조 생성 완료
- 2025-07-14: 공통 레이아웃 컴포넌트 구현 완료 (Header, Sidebar, DashboardLayout, DashboardCard)
- 2025-07-14: Mock 데이터 및 Next.js API 라우트 설정 완료 (JSON Server 대신 Next.js API 라우트 사용)
- 2025-07-14: Zustand 상태 관리 및 React-Query 설정 완료 (uiStore, dashboardStore, mapStore, QueryProvider, 커스텀 훅들)
- 2025-07-14: date-fns 활용한 날짜 계산 개선 (dateHelpers 유틸리티, 상수 정리, 타입 안전성 향상)
- 2025-07-14: 메인 대시보드 4개 위젯 구현 완료 (실제 API 데이터 연동, 실시간 갱신)
- 2025-07-14: 스켈레톤 UI 시스템 구축 완료 (DataWrapper, QueryWrapper, 위젯별 스켈레톤)
- 2025-07-14: 에러 처리 및 로딩 상태 관리 완료 (react-error-boundary, formatCurrency 추가)
- 2025-07-14: AI 예측 API 타입 안전성 향상 (조건부 타입 활용)
- 2025-07-14: 카카오맵 API 연동 완료 (react-kakao-maps-sdk 라이브러리 도입, TypeScript 완전 지원)
- 2025-07-14: AI 추천 운행 존 페이지 기본 구현 완료 (/ai-zones, 탭 전환, 필터 토글, 시간대 슬라이더)
- 2025-07-14: 히트맵 & 폴리곤 데이터 연동 완료 (react-kakao-maps-sdk Polygon/CustomOverlayMap 활용, 클릭 이벤트, 필터 연동)
- 2025-07-14: 상세 수익 분석 페이지 구현 완료 (/analytics, 주간/월간 분석, 수익 요약, formatHelpers 유틸리티 추가)
- 2025-07-14: 차트 컴포넌트 구현 완료 (LineChart, DonutChart, BarChart 컴포넌트, 수익 분석 페이지에 실제 차트 적용)
- 2025-07-14: 수익 분석 상세 내역 테이블 구현 완료 (DeliveryTable 컴포넌트, 정렬/검색/반응형 기능, 운행 이력 페이지(/history) 통합)
- 2025-07-14: 운행 이력 페이지(/history) 신규 생성 (배달 내역 테이블, 요약 통계, 기간 필터 UI)
- 2025-07-14: 프로젝트명을 Konnect AI로 변경 (Korea Connect - AI를 활용한 한국의 거리 효율적 연동 플랫폼)
- 2025-07-14: 새로운 작업 4개 추가 - 데이터베이스 마이그레이션(Prisma+PostgreSQL), 사용자 인증 시스템, 인증 페이지, 설정 페이지, 도움말 페이지 (전체 작업 20개 → 24개)
- 2025-07-14: Prisma ORM 설정 완료 (스키마 설계, 클라이언트 생성, 관계형 DB 모델링, 유틸리티 파일 및 npm 스크립트 추가)
- 2025-07-14: 시드 데이터 시스템 구축 완료 (기존 Mock 데이터 변환, 자동 초기화 시스템, 프로젝트 시작시 자동 체크)
- 2025-07-14: 사용자 인증 시스템 구현 완료 (NextAuth.js v5 + Prisma Adapter, Credentials Provider, bcrypt 해싱, 세션 관리)
- 2025-07-14: 사용자 인증 페이지 구현 완료 (로그인/회원가입/비밀번호 재설정 페이지, 라이더 온보딩 플로우, 인증 가드 컴포넌트)
- 2025-07-14: Layout Group 구조 도입 (app/(dashboard) 그룹 생성, 자동 DashboardLayout 적용, 코드 중복 제거, 유지보수성 향상)
- 2025-07-14: Edge Runtime 호환성 문제 해결 (prisma.ts의 process.on 완전 제거, middleware.ts에 Node.js 런타임 명시, Next.js 15 호환성 향상)
- 2025-07-14: NextAuth 로그인 디버깅 강화 (auth.ts에 상세 로깅 추가, CredentialsSignin 에러 추적을 위한 단계별 검증 로그)
- 2025-07-14: Header 로그아웃 기능 및 인증 훅 구현 (useAuth/useNotifications 커스텀 훅 추가, react-query 뮤테이션 기반 로그아웃, 실제 사용자 정보 표시)
- 2025-07-14: 설정 페이지를 위한 데이터베이스 스키마 확장 완료 (RiderProfile에 운행/알림 설정 필드 추가, UserSettings 모델 신규 생성, Theme/Language enum 추가, 마이그레이션 및 시드 데이터 업데이트)
- 2025-07-14: 설정 페이지를 위한 API 엔드포인트 구현 완료 (zod validation 적용, 5개 API 엔드포인트 생성, 완전한 인증/권한/에러 처리, 보안 강화)
- 2025-07-14: 설정 페이지 전체 구현 완료 (라이더/앱환경/비밀번호/계정관리 페이지, React Query 기반 실시간 데이터 연동, 변경사항 추적, 폼 유효성 검증)
- 2025-07-14: React Hook Form과 zod를 모든 설정 페이지에 적용 (실시간 유효성 검증, 렌더링 최적화, 타입 안전성 확보, 복잡한 폼 로직 간소화)
- 2025-07-15: Mock 데이터를 실제 DB 연동으로 마이그레이션 완료 (AIZone, AIZonePrediction, HeatmapPoint, Delivery 테이블 시드 데이터 생성, 폴리곤 렌더링 문제 해결, dateHelpers와 날짜 일관성 확보)
- 2025-07-15: 배달 API를 완전한 DB 기반으로 개선 완료 (통계 계산 추가, 페이지네이션 완전 지원, 검색 기능 API 레벨 구현, DeliveriesResponse DTO 확장, useDeliveries 훅 파라미터 확장)
- 2025-07-15: API 404 에러 수정 완료 (라이더 프로필 없는 경우 빈 데이터 200 응답으로 변경, /api/deliveries, /api/today-stats, /api/analytics 수정)
- 2025-07-15: 카카오 미니맵 구현 완료 (메인 대시보드 AI 추천 핫스팟 위젯에 실제 카카오맵 연동, miniMode 지원, 현재 시간대 상위 3개 핫스팟 표시, 인터랙션 최적화)
- 2025-07-15: 배달 데이터 자동 생성 API 구현 완료 (POST /api/deliveries/batch-generate, 서울+부산 80개 지역 주소, 라이더별 데이터 생성, React Query 훅, 개발자 도구 페이지, 완전한 문서화)

---
