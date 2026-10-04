# 스타터 킷 보완 계획: 공통 컴포넌트 · 레이아웃 · 유틸리티

> 승인되면 이 파일 이름을 `2026-10-04-claude-nextjs-layout-components-plan.md`로 바꿔 둔다 (프로젝트 규칙).

## Context (왜 하는가)

지금 스타터 킷은 **페이지 1장 + shadcn 컴포넌트 6개**(button, card, input, label, badge, separator)뿐이다.
새 프로젝트를 시작하면 머리글·바닥글·모바일 메뉴·사이드바·다크 모드·알림·폼 검증·404 화면을 매번 다시 만들어야 한다.
이번 작업으로 **"어떤 웹에서도 쓰는 틀"을 미리 넣어 두고**, 컴포넌트를 계층으로 정리해서 어디에 무엇을 둘지 헷갈리지 않게 한다.

원칙: **DO NOT REINVENT THE WHEEL** — 직접 만들지 않고 검증된 것을 가져다 쓴다.
- UI 부품과 화면 틀 → shadcn/ui 공식 컴포넌트와 **공식 블록**(완성된 화면 예시 묶음: `sidebar-07`)
- 유틸리티 → 그 분야에서 가장 널리 쓰이는 라이브러리 (아래 표)

사용자 결정:
- 레이아웃은 **사이트형 + 대시보드형** 두 가지. 인증형(로그인 화면)은 만들지 않는다.
- 라이브러리는 **테마+알림**(next-themes, sonner)을 지금 설치. **폼 검증**(react-hook-form + zod)은 로그인 화면이 빠져 쓸 곳이 없으므로 설치를 미루고 README에 안내만 적는다.

## 1. 어떤 웹에서도 필요한 것 (정리)

| 분류 | 필요한 것 | 무엇으로 해결하나 |
|---|---|---|
| 화면 틀 | 머리글, 바닥글, 본문 폭 제한 | `site-header`, `site-footer` (직접 조립, 부품은 shadcn) |
| 이동 | 메뉴, 모바일 메뉴(작은 화면에서 옆에서 열리는 서랍), 현재 위치 표시 | shadcn `sheet`, `breadcrumb` |
| 앱 틀 | 왼쪽 사이드바 + 상단 바 | shadcn `sidebar` + 블록 `sidebar-07` |
| 테마 | 다크 모드 전환 | **next-themes** 0.4.6 (shadcn 공식 방식) |
| 피드백 | 토스트(구석에 잠깐 뜨는 알림), 확인 창, 로딩, 빈 상태 | **sonner** 2.0.8, shadcn `dialog`·`alert-dialog`·`skeleton`·`spinner`·`empty`·`alert` |
| 폼 부품 | 입력칸 묶음, 선택 상자 등 | shadcn `field`·`select`·`checkbox` 등 (부품만 설치) |
| _(이번엔 제외)_ 인증 화면 · 폼 검증 | 로그인 폼, 입력값 규칙 검사 | 필요할 때: 블록 `login-01`, **react-hook-form** 7.89 + **zod** 4.6 + `@hookform/resolvers` 5.9 |
| 상태 화면 | 404(없는 주소), 오류, 로딩 | Next.js 파일 규칙 `not-found.tsx`, `error.tsx`, `loading.tsx` |
| 설정 | 사이트 이름·메뉴 목록을 한곳에서 관리 | `src/lib/site.ts` |

버전은 2026-10-04 `npm view`로 확인했고, 모두 React 19를 지원한다.

## 2. 컴포넌트 계층 (아래층은 위층을 가져다 쓰지 않는다)

```
src/
├─ app/                      5층 · 페이지와 레이아웃 (주소 = 폴더)
│  ├─ layout.tsx             최상위: 글꼴, 테마, 토스트
│  ├─ not-found.tsx · error.tsx
│  ├─ (marketing)/           사이트형 틀: 머리글 + 본문 + 바닥글
│  │  ├─ layout.tsx
│  │  └─ page.tsx            지금의 시작 화면 (주소 /)
│  └─ (dashboard)/           대시보드형 틀: 사이드바 + 상단 바
│     ├─ layout.tsx
│     └─ dashboard/page.tsx · loading.tsx   (주소 /dashboard)
├─ components/
│  ├─ ui/                    1층 · 기본 부품 (shadcn CLI로만 추가)
│  ├─ common/                2층 · 여러 화면이 같이 쓰는 조합: logo, theme-toggle, page-header
│  ├─ layout/                3층 · 화면 틀 조각: site-header, site-footer, mobile-nav,
│  │                                app-sidebar, nav-main, nav-user, dashboard-header
│  ├─ features/              4층 · 한 기능 전용: home/(stack-card, component-demo)
│  └─ providers/             theme-provider (앱 전체를 감싸는 설정)
├─ hooks/                    use-mobile (shadcn이 만든다)
└─ lib/                      0층 · 데이터와 도우미: site.ts(새), stack.ts, utils.ts
```

- `(이름)` 폴더는 **route group**: 주소에는 나타나지 않고, 같은 틀을 쓰는 페이지를 묶는 용도다. 최상위 `layout.tsx`는 하나만 유지한다.
- 기존 `site-header.tsx`, `stack-card.tsx`, `component-demo.tsx`는 위 폴더로 옮긴다 (import 경로만 바뀜).

## 3. shadcn 컴포넌트 우선순위

| 순위 | 컴포넌트 | 쓰는 곳 |
|---|---|---|
| **P1 · 틀에 꼭 필요** | sheet, dropdown-menu, sidebar(+ tooltip, skeleton, use-mobile 자동 설치), breadcrumb, avatar, collapsible, sonner | 모바일 메뉴, 테마 토글, 사이드바, 사용자 메뉴, 토스트 |
| **P2 · 폼과 피드백** | field, textarea, select, checkbox, switch, dialog, alert-dialog, alert, tabs, table, empty, spinner | 404/오류 화면, 컴포넌트 미리보기, 이후 폼 작업의 기본 부품 |
| P3 · 필요할 때 (설치 안 함) | calendar, chart, command, combobox, carousel, drawer, pagination 등 | README에 `npx shadcn@latest add <이름>` 안내만 |

참고: shadcn의 옛 `form` 컴포넌트는 이 스타일(radix-nova)에서 비어 있다 → 나중에 폼 검증을 붙일 때는 새 공식 방식인 **`field` + react-hook-form** 을 쓴다.

## 4. 실행 단계

### 1단계. 설치
```bash
npx shadcn@latest add sheet dropdown-menu sidebar breadcrumb avatar collapsible sonner   # P1
npx shadcn@latest add field textarea select checkbox switch dialog alert-dialog alert tabs table empty spinner   # P2
npx shadcn@latest add sidebar-07    # 공식 블록 (사이드바 화면)
```
- `next-themes`, `sonner`는 `sonner` 컴포넌트를 추가할 때 shadcn이 함께 설치한다. 설치 후 `package.json`에서 확인한다.
- 이미 있는 `button`, `card` 등을 덮어쓸지 물으면 **덮어쓰지 않는다**.
- 블록이 만든 `src/app/dashboard/page.tsx`는 4단계에서 route group 안으로 옮긴다.

### 2단계. 기초 (0층 + 최상위 레이아웃)
- `src/lib/site.ts` (새): 사이트 이름·설명, 머리글 메뉴, 사이드바 메뉴, 바닥글 링크, 예시 사용자. 머리글·바닥글·사이드바·메타데이터가 모두 여기서 읽는다.
- `src/components/providers/theme-provider.tsx` (새): next-themes의 `ThemeProvider`를 감싼 `"use client"` 파일 (shadcn 문서 그대로).
- `src/app/layout.tsx` 수정: `<html suppressHydrationWarning>`, `ThemeProvider`(attribute="class", defaultTheme="system"), `<Toaster />`, 메타데이터 제목을 `{ default, template: "%s | 이름" }` 형태로.
- `src/components/common/theme-toggle.tsx` (새): dropdown-menu로 라이트/다크/시스템 선택. `logo.tsx`, `page-header.tsx`도 여기.

### 3단계. 사이트형 레이아웃 `(marketing)`
- `layout/site-header.tsx`: 기존 파일을 옮겨 확장 — 로고, 메뉴(데스크톱), `mobile-nav`(sheet, 모바일), 테마 토글.
- `layout/site-footer.tsx` (새): 저작권 + 링크.
- `(marketing)/layout.tsx`: 머리글 + `<main>` + 바닥글. `(marketing)/page.tsx`: 기존 `page.tsx`를 옮기고 머리글은 레이아웃으로 뺀다.
- `features/home/component-demo.tsx`: 토스트 버튼, dialog, tabs 예시를 조금 추가.

### 4단계. 대시보드형 레이아웃 `(dashboard)`
- `sidebar-07` 블록의 `page.tsx`에서 틀 부분(`SidebarProvider` + `AppSidebar` + `SidebarInset`)을 `(dashboard)/layout.tsx`로 분리.
- `layout/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`: 블록 파일을 옮기고 예시 데이터를 `site.ts`로 교체, 문구 한국어화. 쓰지 않는 `team-switcher.tsx`, `nav-projects.tsx`는 지운다.
- `layout/dashboard-header.tsx` (새): 사이드바 여닫기 버튼 + breadcrumb + 테마 토글.
- `(dashboard)/dashboard/page.tsx`: 카드 몇 장짜리 예시. `loading.tsx`: skeleton.

### 5단계. 상태 화면
- `src/app/not-found.tsx`: shadcn `empty` + 홈으로 가는 버튼.
- `src/app/error.tsx`: `"use client"`. **이 Next.js 버전은 다시 시도 함수 이름이 `reset`이 아니라 `retry`** (`node_modules/next/dist/docs/.../file-conventions/error.md` 확인).

### 6단계. 문서
- `README.md`: 버전 표(next-themes, sonner 추가), 폴더 구조·계층 설명, 설치된 컴포넌트 목록, P3 컴포넌트와 "필요할 때 설치" 안내(로그인 블록 `login-01`, react-hook-form + zod, zustand, date-fns, usehooks-ts, nuqs, TanStack Query/Table).
- `CLAUDE.md`: 구조 절 갱신, "다크 모드 토글 없음" 문장 수정. "Zustand, React Hook Form + Zod 미설치" 문장은 그대로 둔다.
- `src/lib/stack.ts`: next-themes, sonner 카드 추가 (6장 → 8장).
- 이 계획 파일에 완료 상태와 남은 작업 기록.

코드 규칙: 새 주석은 한국어, 큰따옴표·세미콜론 없음, `any` 금지, 색은 토큰 클래스만, `"use client"`는 필요한 파일에만.

## 검증 방법
1. `npm run lint` → 오류 0, `npm run build` → 성공 (타입 검사 포함).
2. `npm run dev` 후 브라우저에서:
   - `/` 머리글·바닥글, `/dashboard` 사이드바, `/없는주소` 404 화면
   - 테마 토글: 라이트/다크 전환, 새로고침해도 유지되고 깜빡임 없음
   - 창을 좁혀서(모바일 폭) 서랍 메뉴와 사이드바가 열리고 닫히는지
   - 컴포넌트 미리보기의 토스트 버튼을 누르면 알림이 뜨는지
3. 개발자 도구 콘솔에 오류가 없는지 확인. **위험 요소**: next-themes가 React 19에서 `<script>` 경고를 낼 수 있다. 나타나면 사용자에게 알리고, Next.js 공식 문서의 인라인 스크립트 방식(`preventing-flash-before-hydration.md`)으로 바꿀지 상의한다.

## 커밋
자동으로 커밋하지 않는다. 끝나면 바뀐 파일 목록과 요약을 보여 주고, 확인을 받은 뒤 커밋·푸시한다.

## 범위 밖
- 인증형 레이아웃과 로그인 화면, 실제 인증(로그인 처리, 세션), 데이터베이스, 다국어, `global-error.tsx`
- react-hook-form + zod, zustand, date-fns, usehooks-ts 설치 (README에 안내만)

---

## 완료 상태 (2026-10-04)

**1~6단계 모두 완료.**

- 설치: shadcn 컴포넌트 21개 추가(전체 27개) + `sidebar-07` 블록, next-themes 0.4.6, sonner 2.0.8
- 만든 화면: `/`(사이트형), `/dashboard`(대시보드형), 404, 오류 화면, 대시보드 로딩 화면
- 계획과 달라진 점
  - `src/hooks/use-mobile.ts`: shadcn 원본이 lint(`react-hooks/set-state-in-effect`)에 걸려 `useSyncExternalStore`로 고쳤다
  - 최상위 레이아웃에 `TooltipProvider`를 추가했다 (사이드바의 말풍선에 필요, shadcn 설치 안내)
  - `component-demo.tsx`는 토스트 버튼의 클릭 핸들러 때문에 `"use client"`가 됐다
  - 첫 build가 예전 개발 서버 캐시(`.next/dev/types`) 때문에 실패 → 캐시를 지우고 해결
- 검증: `npm run lint` 오류 0 · `npm run build` 성공 · 브라우저에서 확인
  - `/`, `/dashboard`, 없는 주소(404) 화면 표시
  - 테마 전환(라이트/다크)과 새로고침 후 유지, 토스트 표시
  - 폭 390 화면에서 서랍 메뉴와 사이드바 열림, 가로 넘침 없음
  - 콘솔 오류·경고 없음 (걱정했던 next-themes의 `<script>` 경고는 나타나지 않음)
  - 확인하지 못한 것: 오류 화면(`error.tsx`)은 일부러 오류를 내야 보여서 build 통과만 확인했다

## 남은 작업

- 커밋 (사용자 확인 후)
- 선택: 로그인 화면(`login-01` 블록) + react-hook-form + zod, `global-error.tsx`, zustand 등 (README의 "필요할 때 설치할 라이브러리" 표)
