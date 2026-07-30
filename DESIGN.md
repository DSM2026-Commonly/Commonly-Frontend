# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-22
- Primary product surfaces: 사용자용 경력증명서 발급, 경력사항 개별·통합 등록, 관리자용 사용자 목록·업무 이력 조회, 공통 헤더·푸터
- Evidence reviewed: Figma `Commonly` nodes `107:15370`, `107:13996`, `107:16269`, `107:16348`; `apps/user-web/src/router/index.tsx`; `apps/admin-web/src/router/index.tsx`; `packages/ui/src/registration`; `packages/ui/src/user-management`; `packages/ui/src/work-history`; `packages/ui/src/header`; `packages/ui/src/layout`

## Brand
- Personality: 신뢰할 수 있고 명료한 공공 업무 서비스
- Trust signals: 유성구 표기, 일관된 경력관리 용어, KRDS 컴포넌트와 토큰
- Avoid: 장식 위주의 표현, 낮은 대비, 서비스별로 다른 입력 규칙

## Product goals
- Goals: 관리자가 업무 담당자 계정을 빠르게 조회하고 경력 대상자와 경력 정보를 오류 없이 단계별 관리하도록 돕는다.
- Non-goals: 이 저장소에서 주소·중복 확인용 실제 행정 API를 정의하지 않는다.
- Success signals: 사용자 목록과 페이지 위치를 쉽게 파악할 수 있고, 등록 단계 이동이 명확하며 필수 입력 및 확인 전 제출이 방지된다.

## Personas and jobs
- Primary personas: 유성구 경력관리 관리자, 등록 업무 담당자
- User jobs: 업무 담당자 계정 조회, 대상자 확인, 경력 입력, 대량 파일 등록, 등록 결과 확인
- Key contexts of use: 데스크톱 업무 환경 중심, 모바일에서는 핵심 폼 조작 가능

## Information architecture
- Primary navigation: 경력증명서 발급, 경력사항 등록, 경력사항 수정, 사용자 관리, 업무 이력 조회
- Core routes/screens: `/career/register`, `/career/register/individual/*`, `/career/register/bulk/*`, `/accounts`, `/accounts/list`, `/history`
- Content hierarchy: 페이지 제목 → 목록 또는 단계 제목 → 표·입력·안내 카드 → 페이지 이동 또는 이전·다음 행동

## Design principles
- Principle 1: 저장소의 KRDS 컴포넌트와 토큰을 우선 사용한다.
- Principle 2: 단계별로 필요한 정보만 노출하고 완료 조건을 명시적으로 제어한다.
- Tradeoffs: 등록 흐름은 Figma의 792px 본문 폭, 업무 이력 표는 980px 폭을 유지하되 작은 화면에서는 표를 가로 스크롤로 제공한다.

## Visual language
- Color: KRDS light 토큰의 기본 텍스트, primary blue, gray border/surface 사용
- Typography: Pretendard GOV 우선, 시스템 한글 폰트 대체
- Spacing/layout rhythm: 8px 기반, 주요 섹션 40~48px, 카드 내부 24~40px
- Shape/radius/elevation: 입력 8px, 카드 12px, 그림자 없이 경계선 중심
- Motion: 필수 동작에만 사용하며 감소된 모션 환경을 존중한다.
- Imagery/iconography: 기존 브랜드 자산과 KRDS 아이콘만 사용한다.

## Components
- Existing components to reuse: KRDS Button, TextInput, Select, Radio/RadioGroup, Checkbox, StepIndicator, FileUpload
- New/changed components: `IndividualRegistrationSubject` 대상자 입력 단계, `IndividualRegistrationComplete` 개별 등록 완료 결과, `UserList` 사용자 표·페이지 이동, `WorkHistory` 업무 이력 표·페이지 이동
- Variants and states: 기본, 비활성, 유효성 미충족, 중복 확인 완료, 사용자 목록 페이지 선택, 반응형 단일 열/표 가로 스크롤
- Token/component ownership: 공통 UI는 `packages/ui`, 라우트 연결은 `apps/user-web`와 `apps/admin-web`

## Accessibility
- Target standard: KRDS 기본 접근성 및 WCAG 2.1 AA 수준 지향
- Keyboard/focus behavior: 모든 입력과 버튼은 키보드 순서와 기본 focus-visible을 유지한다.
- Contrast/readability: KRDS 텍스트·경계 토큰 사용, 15px 미만 본문 금지
- Screen-reader semantics: fieldset/legend, label, aria-live, 단계 제목 구조 사용
- Reduced motion and sensory considerations: 색상만으로 완료 여부를 전달하지 않는다.

## Responsive behavior
- Supported breakpoints/devices: 1200px 데스크톱 기준, 900px 이하 헤더 적층, 767px 이하 폼 적층
- Layout adaptations: 792px 고정 최대 폭에서 모바일 전체 폭 단일 열로 전환
- Touch/hover differences: 모바일 버튼은 전체 폭, 최소 56px 높이 유지

## Interaction states
- Loading: 향후 API 연결 시 버튼 내 진행 상태와 중복 실행 방지 필요
- Empty: 입력 placeholder와 비활성 다음 버튼으로 안내
- Error: 필드 인접 오류 메시지 사용
- Success: 중복 확인 결과를 aria-live 텍스트로 함께 제공하고, 개별 등록 완료 시 대상자와 담당 업무를 요약해 표시한다.
- Disabled: 필수값·중복 확인 완료 전 다음 버튼 비활성
- Offline/slow network, if applicable: 주소·중복 확인 API 연결 시 재시도 상태 필요

## Content voice
- Tone: 간결한 존댓말과 업무 용어
- Terminology: “대상자 입력”, “경력사항 입력”, “중복 확인”을 일관되게 사용
- Microcopy rules: 행동 버튼은 동사 중심, 입력 조건은 레이블 또는 필드 인접 설명으로 제공

## Implementation constraints
- Framework/styling system: React 19, TypeScript, Emotion styled, React Router, KRDS React
- Design-token constraints: 원시 색상보다 `--krds-*` 토큰을 우선하고 fallback만 병기
- Performance constraints: 신규 UI 의존성을 추가하지 않는다.
- Compatibility constraints: 현재 Vite 및 workspace 패키지 경계를 유지한다.
- Test/screenshot expectations: 컴포넌트 SSR 테스트, 해당 앱 build/lint, Figma 1920px 기준 시각 비교

## Open questions
- [ ] 실제 주소 검색 서비스 연동 방식 / 백엔드 담당 / 검색 결과 확정 동작에 영향
- [ ] 대상자 중복 확인 API 계약 / 백엔드 담당 / 다음 단계 활성화 조건에 영향
