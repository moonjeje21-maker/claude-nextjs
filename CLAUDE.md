# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# claude-nextjs (웹개발 스타터 킷)

- 스택: Next.js 16.3 (App Router) · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3 · shadcn/ui (radix-nova) · lucide-react
- 패키지 매니저: npm (Node.js 20.9 이상). 코드는 `src/` 아래, import 별칭은 `@/*`
- 계획 파일: `plans/`
- 이 폴더는 별도 git 저장소다 (github.com/moonjeje21-maker/claude-nextjs). git 명령은 이 폴더 안에서 쓴다

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/page.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사. Next.js 16부터 build는 lint를 돌리지 않으므로 확인할 때는 lint와 build를 둘 다 실행한다
- 타입 검사만: `npx next typegen && npx tsc --noEmit` (`LayoutProps` 같은 전역 타입과 `next-env.d.ts`는 git에 없고 dev/build/typegen이 만든다)
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저로 한다
- 버전 올리기: `npx next upgrade`, `npm outdated`. 버전이 바뀌면 `src/lib/stack.ts`(시작 화면에 보이는 버전)와 `README.md`의 버전 표도 함께 고친다

## 구조

- `src/app/` — 라우트. 지금은 `layout.tsx`(글꼴·메타데이터) + `page.tsx` 한 장
- `src/components/ui/` — shadcn이 만든 컴포넌트. 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가한다 (설정: `components.json`)
- `src/components/*.tsx` — 화면 조각. 파일 이름은 kebab-case, 컴포넌트는 PascalCase named export
- `src/lib/` — 컴포넌트 밖으로 뺀 데이터와 도우미 (`stack.ts`, `utils.ts`)
- 컴포넌트는 서버 컴포넌트가 기본이다. 상태나 이벤트 핸들러가 필요한 파일에만 `"use client"`를 붙인다

## 스타일과 테마

- Tailwind 4라서 `tailwind.config` 파일이 없다. 테마는 전부 `src/app/globals.css`에 있다: `:root` / `.dark`의 CSS 변수 → `@theme inline`이 `--color-*`로 연결 → `bg-background`, `text-muted-foreground` 같은 클래스. 색은 직접 적지 말고 이 토큰 클래스를 쓴다
- 글꼴: `layout.tsx`의 Geist `variable: "--font-sans"`와 `globals.css`의 `--font-sans`는 이름이 같아야 한다. 한쪽만 바꾸면 글꼴이 빠진다
- `.dark` 변수는 정의돼 있지만 토글은 없다 (어디에도 `dark` 클래스를 붙이지 않는다). 추가하려면 `next-themes`가 필요하다
- `cn()`은 `clsx` + `tailwind-merge`가 아니라 shadcn의 `cn` 패키지에서 온다 (`src/lib/utils.ts`). `globals.css`가 `shadcn/tailwind.css`를 import하므로 `shadcn`과 `cn`은 `dependencies`에 둔다
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)을 따른다

## 주의

- ESLint는 9 유지 (eslint-plugin-react가 ESLint 10 미지원). TypeScript 7로 올리려면 `next.config.ts`에 `experimental.useTypeScriptCli: true` 필요
- `npm audit`의 high 5개는 ESLint 쪽 개발용 도구에서 나온다. `npm audit fix --force`는 eslint-config-next를 14로 내리므로 쓰지 않는다
- Zustand, React Hook Form + Zod는 아직 설치돼 있지 않다. 처음 필요해질 때 설치한다
