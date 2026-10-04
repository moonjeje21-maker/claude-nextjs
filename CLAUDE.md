# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# claude-nextjs (웹개발 스타터 킷)

- 스택: Next.js 16.3 (App Router) · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3 · shadcn/ui (radix-nova) · lucide-react · next-themes · sonner
- 패키지 매니저: npm (Node.js 20.9 이상). 코드는 `src/` 아래, import 별칭은 `@/*`
- 계획 파일: `plans/`
- 이 폴더는 별도 git 저장소다 (github.com/moonjeje21-maker/claude-nextjs). git 명령은 이 폴더 안에서 쓴다
- `main`에 바로 커밋하지 않는다. 브랜치(`feat/…`, `fix/…`, `chore/…`) → PR → 병합 커밋(`gh pr merge --merge`) 순서로 올린다. 커밋 메시지와 PR은 영어로 쓴다

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/layout.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사. Next.js 16부터 build는 lint를 돌리지 않으므로 확인할 때는 lint와 build를 둘 다 실행한다
- 타입 검사만: `npx next typegen && npx tsc --noEmit` (`LayoutProps` 같은 전역 타입과 `next-env.d.ts`는 git에 없고 dev/build/typegen이 만든다)
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저로 한다
- 개발 서버가 이미 켜져 있을 수 있다. 새로 켜기 전에 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다. dev는 `.next/dev`를 쓰므로 서버를 켠 채로 build를 돌려도 된다
- 브라우저 확인은 Playwright MCP로 한다 (`.mcp.json`에 등록). 화면·콘솔 기록은 `.playwright-mcp/`에 쌓이고 git은 이 폴더를 무시한다. 스크린샷은 프로젝트 폴더 안에만 저장되므로 `.playwright-mcp/이름.png`로 저장한다. 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다
- 버전 올리기: `npx next upgrade`, `npm outdated`. 버전이 바뀌면 `src/lib/stack.ts`(시작 화면에 보이는 버전)와 `README.md`의 버전 표도 함께 고친다

## 구조

컴포넌트는 계층으로 나눈다. 아래층은 위층을 import하지 않는다 (`lib` → `ui` → `common` → `layout` → `features` → `app`).

- `src/app/` — 라우트. 최상위 `layout.tsx`(글꼴·메타데이터·ThemeProvider·TooltipProvider·Toaster)는 하나만 둔다
  - `(marketing)/` — 사이트형 틀(머리글 + 본문 + 바닥글). 시작 화면 `/`
  - `(dashboard)/` — 대시보드형 틀(사이드바 + 상단 바). `/dashboard`
  - `not-found.tsx`, `error.tsx` — 404·오류 화면. 이 Next.js 버전의 error 컴포넌트는 `reset`이 아니라 `retry` prop을 쓴다
- `src/components/ui/` — shadcn이 만든 컴포넌트. 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가한다 (설정: `components.json`)
- `src/components/common/` — 여러 화면이 같이 쓰는 조합 (`logo`, `theme-toggle`, `page-header`)
- `src/components/layout/` — 화면 틀 조각 (`site-header`, `site-footer`, `mobile-nav`, `app-sidebar`, `nav-main`, `nav-user`, `dashboard-header`). 사이드바는 shadcn `sidebar-07` 블록 기반
- `src/components/features/<기능>/` — 한 기능 전용 컴포넌트 (`home/`)
- `src/components/providers/` — 앱 전체를 감싸는 클라이언트 설정 (`theme-provider`)
- `src/hooks/use-mobile.ts` — shadcn이 만든 훅이지만 lint 규칙(`react-hooks/set-state-in-effect`) 때문에 `useSyncExternalStore`로 고쳤다. `shadcn add --overwrite`로 덮어쓰지 않는다
- `src/lib/` — 컴포넌트 밖으로 뺀 데이터와 도우미. 사이트 이름과 메뉴는 `site.ts`에서만 고친다 (`stack.ts`, `utils.ts`)
- 파일 이름은 kebab-case, 컴포넌트는 PascalCase named export
- 컴포넌트는 서버 컴포넌트가 기본이다. 상태나 이벤트 핸들러가 필요한 파일에만 `"use client"`를 붙인다

## 스타일과 테마

- Tailwind 4라서 `tailwind.config` 파일이 없다. 테마는 전부 `src/app/globals.css`에 있다: `:root` / `.dark`의 CSS 변수 → `@theme inline`이 `--color-*`로 연결 → `bg-background`, `text-muted-foreground` 같은 클래스. 색은 직접 적지 말고 이 토큰 클래스를 쓴다
- 글꼴: `layout.tsx`의 Geist `variable: "--font-sans"`와 `globals.css`의 `--font-sans`는 이름이 같아야 한다. 한쪽만 바꾸면 글꼴이 빠진다
- 다크 모드는 `next-themes`가 `<html>`에 `dark` 클래스를 붙이는 방식이다 (`layout.tsx`의 `ThemeProvider attribute="class"`, 그래서 `<html>`에 `suppressHydrationWarning`이 있다). 토글은 `common/theme-toggle.tsx`
- `cn()`은 `clsx` + `tailwind-merge`가 아니라 shadcn의 `cn` 패키지에서 온다 (`src/lib/utils.ts`). `globals.css`가 `shadcn/tailwind.css`를 import하므로 `shadcn`과 `cn`은 `dependencies`에 둔다
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)을 따른다. create-next-app이 만든 파일(`src/app/layout.tsx`, `next.config.ts`, `eslint.config.mjs`)은 세미콜론을 쓰므로, 고칠 때는 그 파일의 방식을 따른다

## 주의

- ESLint는 9 유지 (eslint-plugin-react가 ESLint 10 미지원). TypeScript 7로 올리려면 `next.config.ts`에 `experimental.useTypeScriptCli: true` 필요
- `npm audit`의 high 경고는 모두 `fast-glob → micromatch → braces` 한 줄기에서 나오고, `eslint-config-next`와 `shadcn` CLI가 끌어온다 (브라우저로 가는 코드가 아니다). `npm audit fix --force`는 eslint-config-next를 14로, shadcn을 1.0으로 내리므로 쓰지 않는다
- Zustand, React Hook Form + Zod는 아직 설치돼 있지 않다. 처음 필요해질 때 설치한다 (설치 명령은 `README.md`의 "필요할 때 설치할 라이브러리" 표)
- 폴더를 옮긴 뒤 build가 `.next/dev/types/validator.ts`에서 없는 파일을 찾으면 예전 개발 서버가 남긴 캐시다. `.next/dev/types`를 지우고 다시 실행한다
- `next.config.ts`의 `devIndicators.position: "bottom-right"`는 지우지 않는다. 기본 위치(왼쪽 아래)에서는 Next.js 개발 도구 버튼이 접힌 사이드바의 사용자 메뉴를 덮어 클릭이 막힌다. 대신 개발 서버에서는 토스트 오른쪽 모서리와 잠깐 겹친다 (배포본에는 이 버튼이 없다)
