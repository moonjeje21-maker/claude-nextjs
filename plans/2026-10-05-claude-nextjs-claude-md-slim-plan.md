# CLAUDE.md 줄이기 + 나누기 계획 (/init 두 번째 점검)

- 날짜: 2026-10-05
- 프로젝트: claude-nextjs (브랜치 `main`, 커밋되지 않은 변경 없음)
- 상태: 완료 (2026-10-05, 커밋 전) — 결과는 맨 아래 "완료 기록" 참고

## Context (왜 하는가)

`CLAUDE.md`는 Claude Code가 **대화를 시작할 때마다 통째로 읽는** 안내 파일이다. 길수록 컨텍스트(Claude가 한 번에 기억할 수 있는 글의 양)를 많이 쓰고, 공식 문서에 따르면 지시를 따르는 정확도도 떨어진다. 지금 파일은 6,360바이트(약 3.1k 토큰)다.

`/init` 점검에서 틀린 문장 1곳과 빠진 규칙 몇 가지를 찾았는데, 그대로 더하면 파일이 더 길어진다. 그래서 방향을 바꿔 **먼저 덜어내고, 특정 파일을 만질 때만 필요한 내용은 따로 떼어 낸 뒤, 꼭 필요한 것만 짧게 더한다.**

목표: 매번 읽히는 양을 **6,360바이트 → 3,461바이트(약 45% 줄임, 아래 초안을 직접 잰 값)**. 내용은 잃지 않는다. 떼어 낸 규칙 파일 2개(1,810 + 797바이트)는 해당 파일을 만질 때만 읽힌다.

## 나누는 방법 (공식 문서로 확인함)

Claude Code 공식 문서(code.claude.com/docs/en/memory)에서 확인한 사실:

| 방법 | 컨텍스트가 줄어드는가 |
|---|---|
| `@파일` 불러오기 (지금 `@AGENTS.md`가 이 방식) | **줄지 않는다.** 시작할 때 함께 읽힌다 |
| `.claude/rules/*.md` + 맨 위에 `paths:` 적기 | **줄어든다.** Claude가 그 경로의 파일을 읽거나 고칠 때만 읽힌다 |
| `.claude/rules/*.md` (`paths:` 없음) | 줄지 않는다. 시작할 때 읽힌다 |

그래서 `paths:`를 적은 규칙 파일(이하 "경로 규칙")을 쓴다. 예를 들어 `package.json`을 열 때만 읽히는 "의존성 주의" 파일을 만드는 식이다.

**`src/` 전체에 걸린 규칙은 나누지 않는다.** 이 프로젝트의 작업은 거의 다 `src/`를 만지므로, 나눠도 매번 읽혀서 얻는 것이 없고 파일만 늘어난다. 나누는 것은 "가끔만 필요한 내용" 두 묶음뿐이다.

## 지금 내용을 어떻게 처리하는가

### 지운다 (다른 곳에 이미 있다)

| 지우는 내용 | 이미 있는 곳 |
|---|---|
| 계획 파일은 `plans/`, 별도 git 저장소 설명 | 상위 `~/CLAUDE.md` |
| 세부 버전 숫자(16.3, 19.3, 5.9, 4.3), Node.js 20.9, lucide·next-themes·sonner 나열 | `README.md` 버전 표, `package.json` |
| `common/`·`layout/`·`features/`·`providers/`의 파일 이름 나열 | 폴더를 보면 안다. `README.md`의 폴더 그림에도 있다 |
| "사이드바는 shadcn `sidebar-07` 블록 기반" | `app-sidebar.tsx`, `nav-user.tsx`의 주석 |
| 세미콜론을 쓰는 파일 3개의 이름 | "기존 파일은 그 파일의 방식을 따른다" 한 문장으로 줄인다 |

세부 버전을 빼면 버전을 올릴 때 함께 고칠 곳이 3곳(`stack.ts`, `README.md`, `CLAUDE.md`)에서 2곳으로 준다.

### 옮긴다 (문장은 그대로, 필요할 때만 읽히게)

| 옮기는 내용 | 새 파일 | 읽히는 때 |
|---|---|---|
| ESLint 9 유지, TypeScript 7 조건, `npm audit`, `shadcn`·`cn` 패키지, 아직 설치 안 한 라이브러리, 버전 올리기, `devIndicators`, `.next/dev/types` 캐시 | `.claude/rules/dependencies.md` | `package.json`, `package-lock.json`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`을 읽거나 고칠 때 |
| 테마 변수 연결 구조, 글꼴 변수 이름 맞추기, 다크 모드 방식, 최상위 layout은 하나 | `.claude/rules/theme.md` | `src/app/globals.css`, `src/app/layout.tsx`를 읽거나 고칠 때 |

경로 규칙은 파일을 열 때만 읽히므로, `npm i zustand`처럼 명령만 치는 경우에는 읽히지 않는다. 그래서 `CLAUDE.md`에 "설치·버전 작업 전에 이 파일을 읽는다"는 안내 한 줄을 남긴다.

### 바로잡는다 (1곳)

- **"error 컴포넌트는 `reset`이 아니라 `retry` prop을 쓴다"** — 설치된 Next.js 문서(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`)를 보면 `reset`은 없어지지 않았다. `retry()`는 데이터를 다시 불러온 뒤 다시 그리고(16.3부터 정식, 권장), `reset()`은 다시 불러오지 않고 다시 그리기만 한다. `src/app/error.tsx`의 주석 "예전 이름은 reset"도 같은 이유로 틀렸다.

### 짧게 더한다 (파일 여러 개를 읽어야 알 수 있는 것만)

- 대시보드 페이지를 추가하면 `site.ts`의 `sidebarNav`에도 넣어야 한다. 상단 바 제목(`dashboard-header.tsx`)과 사이드바 메뉴 강조(`nav-main.tsx`)가 `sidebarNav`에서 주소가 같은 항목을 찾기 때문이다. 빠뜨리면 제목이 "대시보드"로 나온다
- 페이지에는 `<main>`(본문 영역을 뜻하는 HTML 태그)을 넣지 않는다. 화면 틀이 이미 그린다 (대시보드는 shadcn `SidebarInset`이 `<main>`이다)
- shadcn 컴포넌트를 추가하면 `README.md`의 컴포넌트 목록에도 적는다 (지금 27개로 실제와 일치)
- 화면 문구는 한국어로만 쓴다. 상위 `~/CLAUDE.md`의 `{ ko, en }` 쌍 규칙(정적 사이트용)과 헷갈리지 않게 한다
- 계층 순서에 `hooks`를 넣는다 (`ui/sidebar.tsx`가 `use-mobile`을 쓰므로 맨 아래층)

## 고칠 내용

### 1. `CLAUDE.md` — 전체를 아래 내용으로 바꾼다

````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# claude-nextjs (웹개발 스타터 킷)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (radix-nova) · npm. 코드는 `src/` 아래, import 별칭은 `@/*`. 정확한 버전, 화면 목록, 폴더 그림, 설치된 shadcn 컴포넌트는 `README.md`에 있다.

- `main`에 바로 커밋하지 않는다. 브랜치(`feat/…`, `fix/…`, `chore/…`) → PR → 병합 커밋(`gh pr merge --merge`) 순서로 올린다. 커밋 메시지와 PR은 영어로 쓴다
- 라이브러리 설치, 버전 올리기, `npm audit`, 설정 파일 수정 전이나 build가 캐시 오류를 낼 때는 `.claude/rules/dependencies.md`를 읽는다 (`package.json` 같은 설정 파일을 열면 자동으로 읽힌다)

## 명령

- `npm run dev` — 개발 서버 (http://localhost:3000). 이미 켜져 있을 수 있으니 먼저 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다
- `npm run lint` — 전체 lint. 파일 하나만: `npx eslint src/app/layout.tsx`
- `npm run build` — 배포용 빌드 + 타입 검사. lint는 돌리지 않으므로 확인할 때는 lint와 build를 둘 다 실행한다. dev 서버를 켠 채로 돌려도 된다
- 타입 검사만: `npx next typegen && npx tsc --noEmit` (typegen이 `LayoutProps` 같은 전역 타입을 만든다)
- 테스트 도구는 없다. 변경 확인은 lint + build + 브라우저(Playwright MCP)로 한다. 스크린샷은 `.playwright-mcp/이름.png`로 저장한다 (git이 무시하는 폴더). 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다

## 구조

- 계층: `lib`·`hooks` → `components/ui` → `common`(여러 화면 공용) → `layout`(화면 틀 조각) → `features/<기능>`(한 기능 전용) → `app`. 아래층은 위층을 import하지 않는다
- `components/ui/`는 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가하고, `README.md`의 컴포넌트 목록에도 적는다. 단 `hooks/use-mobile.ts`는 lint 규칙 때문에 고쳐 둔 파일이므로 `--overwrite`로 덮어쓰지 않는다
- 화면 틀은 둘이다: `app/(marketing)/`(머리글 + 바닥글)과 `app/(dashboard)/`(사이드바 + 상단 바). 새 페이지는 쓸 틀의 폴더 안에 만들고, `<main>`은 틀이 이미 그리므로 넣지 않는다
- 사이트 이름과 메뉴는 `lib/site.ts`에서만 고친다. 대시보드 페이지를 추가하면 `sidebarNav`에도 넣는다 (상단 바 제목과 사이드바 메뉴 강조가 여기서 주소가 같은 항목을 찾는다)
- error 컴포넌트의 "다시 시도"는 `retry` prop을 쓴다 (`reset`은 다시 불러오지 않고 다시 그리기만 한다)
- 파일 이름은 kebab-case, 컴포넌트는 PascalCase named export. 서버 컴포넌트가 기본이고, 상태나 이벤트 핸들러가 필요한 파일에만 `"use client"`를 붙인다
- 화면 문구는 한국어로만 쓴다 (정적 사이트의 `{ ko, en }` 쌍 규칙은 쓰지 않는다)

## 스타일

- 색은 직접 적지 말고 토큰 클래스(`bg-background`, `text-muted-foreground` 등)를 쓴다. 토큰은 `src/app/globals.css`에 있다 (Tailwind 4라서 `tailwind.config` 파일이 없다)
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)로 쓰고, 기존 파일을 고칠 때는 그 파일의 방식을 따른다
````

### 2. 새 파일 `.claude/rules/dependencies.md`

맨 위 `---` 사이의 `paths:`가 "이 파일들을 열 때만 읽어라"는 표시다. 본문은 지금 `CLAUDE.md`의 문장을 그대로 옮긴다.

````markdown
---
paths:
  - "package.json"
  - "package-lock.json"
  - "next.config.ts"
  - "eslint.config.mjs"
  - "tsconfig.json"
---

# 의존성·설정 파일 주의

- 버전 올리기: `npx next upgrade`, `npm outdated`. 버전이 바뀌면 `src/lib/stack.ts`(시작 화면에 보이는 버전)와 `README.md`의 버전 표도 함께 고친다
- ESLint는 9 유지 (eslint-plugin-react가 ESLint 10 미지원). TypeScript 7로 올리려면 `next.config.ts`에 `experimental.useTypeScriptCli: true` 필요
- `npm audit`의 high 경고는 모두 `fast-glob → micromatch → braces` 한 줄기에서 나오고, `eslint-config-next`와 `shadcn` CLI가 끌어온다 (브라우저로 가는 코드가 아니다). `npm audit fix --force`는 eslint-config-next를 14로, shadcn을 1.0으로 내리므로 쓰지 않는다
- `cn()`은 `clsx` + `tailwind-merge`가 아니라 shadcn의 `cn` 패키지에서 온다 (`src/lib/utils.ts`). `globals.css`가 `shadcn/tailwind.css`를 import하므로 `shadcn`과 `cn`은 `dependencies`에 둔다
- Zustand, React Hook Form + Zod는 아직 설치돼 있지 않다. 처음 필요해질 때 설치한다 (설치 명령은 `README.md`의 "필요할 때 설치할 라이브러리" 표)
- `next.config.ts`의 `devIndicators.position: "bottom-right"`는 지우지 않는다. 기본 위치(왼쪽 아래)에서는 Next.js 개발 도구 버튼이 접힌 사이드바의 사용자 메뉴를 덮어 클릭이 막힌다. 대신 개발 서버에서는 토스트 오른쪽 모서리와 잠깐 겹친다 (배포본에는 이 버튼이 없다)
- `next-env.d.ts`는 git에 없고 dev/build/typegen이 만든다
- 폴더를 옮긴 뒤 build가 `.next/dev/types/validator.ts`에서 없는 파일을 찾으면 예전 개발 서버가 남긴 캐시다. `.next/dev/types`를 지우고 다시 실행한다
````

### 3. 새 파일 `.claude/rules/theme.md`

````markdown
---
paths:
  - "src/app/globals.css"
  - "src/app/layout.tsx"
---

# 테마·글꼴 주의

- 테마는 전부 `src/app/globals.css`에 있다: `:root` / `.dark`의 CSS 변수 → `@theme inline`이 `--color-*`로 연결 → `bg-background`, `text-muted-foreground` 같은 클래스
- 글꼴: `layout.tsx`의 Geist `variable: "--font-sans"`와 `globals.css`의 `--font-sans`는 이름이 같아야 한다. 한쪽만 바꾸면 글꼴이 빠진다
- 다크 모드는 `next-themes`가 `<html>`에 `dark` 클래스를 붙이는 방식이다 (`layout.tsx`의 `ThemeProvider attribute="class"`, 그래서 `<html>`에 `suppressHydrationWarning`이 있다). 토글은 `common/theme-toggle.tsx`
- 최상위 `layout.tsx`(글꼴·메타데이터·ThemeProvider·TooltipProvider·Toaster)는 하나만 둔다
````

### 4. `src/app/error.tsx` — 주석 1줄 바로잡기

동작은 바뀌지 않는다. 주석(코드 설명 글)만 고친다.

```tsx
// 바꾸기 전
  // Next.js 16.3: 다시 불러와서 다시 그리는 함수 (예전 이름은 reset)
// 바꾼 후
  // Next.js 16.3: 다시 불러와서 다시 그리는 함수 (reset은 다시 불러오지 않고 다시 그리기만 한다)
```

## 고치지 않는 것

- `README.md`, `AGENTS.md`(`next dev`가 쓰고 다시 만드는 파일. `@AGENTS.md` 불러오기도 그대로 둔다)
- 상위 `~/CLAUDE.md`(약 1.2k 토큰)도 이 프로젝트에서 매번 읽히고, 그 안의 "기존 프로젝트 (정적 사이트)" 부분은 여기서 쓰이지 않는다. 다른 저장소의 파일이므로 이번에는 건드리지 않는다. 원하면 따로 줄일 수 있다
- 커밋·푸시는 하지 않는다. 따로 요청받으면 올릴 내용을 먼저 보여 주고 확인받은 뒤, 브랜치 → PR 방식으로 한다. `.claude/rules/`는 git이 무시하지 않으므로 새 파일 2개도 함께 올라간다 (`.claude/settings.local.json`만 무시된다)

## 확인 방법

1. **크기**: `wc -c CLAUDE.md`로 6,360바이트에서 얼마나 줄었는지 잰다. 새 대화에서 `/context`를 치면 "Memory files" 표에서 토큰 수를 직접 볼 수 있다
2. **빠진 내용이 없는지**: 예전 `CLAUDE.md`(`git show HEAD:CLAUDE.md`)를 한 줄씩 보며, 각 줄이 ① 새 `CLAUDE.md` ② 규칙 파일 2개 ③ 위 "지운다" 표 중 한 곳에 있는지 대조한다
3. **경로 규칙이 실제로 읽히는지**: 파일을 만든 뒤 `package.json`과 `src/app/globals.css`를 읽어서 규칙 내용이 따라 들어오는지 본다. 이 대화에서 확인이 안 되면 새 대화의 `/memory` 목록으로 확인하는 방법을 알려 드린다
4. **lint**: `npx eslint src/app/error.tsx` (주석만 바꿨지만 `.tsx` 파일이므로 한 번 돌린다)
5. `git status`로 바뀐 파일이 4개(`CLAUDE.md`, 규칙 파일 2개, `error.tsx`)와 계획 파일뿐인지 확인한다

## 완료 기록 (2026-10-05)

- 계획대로 4곳을 고쳤다: `CLAUDE.md` 전체 교체, `.claude/rules/dependencies.md`·`.claude/rules/theme.md` 새로 만듦, `src/app/error.tsx` 주석 1줄
- 크기: `CLAUDE.md` 6,360바이트(58줄) → 3,461바이트(35줄), 약 45% 줄었다
- 빠진 내용 확인: 예전 `CLAUDE.md`의 모든 줄이 새 `CLAUDE.md`, 규칙 파일 2개, "지운다" 표 중 한 곳에 있다. 표에 없이 함께 빠진 자잘한 것: GitHub 주소(`git remote -v`로 보인다), `.mcp.json`에 등록돼 있다는 말, `use-mobile.ts`를 고친 방법(그 파일의 주석에 있다)
- 경로 규칙 확인: 이 대화에서 `package.json`을 읽자 `dependencies.md`가, `src/app/globals.css`를 읽자 `theme.md`가 자동으로 따라 읽혔다
- `npx eslint src/app/error.tsx` 오류 없음. 고치기 전에 돌린 `npm run lint`, `npx next typegen && npx tsc --noEmit`, `npm run build`도 모두 통과했다

### 남은 작업

- 커밋하지 않았다. 바뀐 파일: `CLAUDE.md`, `src/app/error.tsx`, `.claude/rules/dependencies.md`, `.claude/rules/theme.md`, 이 계획 파일
- 커밋·푸시는 따로 요청받았을 때만, 올릴 내용을 먼저 보여 주고 확인받은 뒤에 한다 (브랜치 → PR 방식)
- 줄어든 토큰 수는 새 대화에서 `/context`의 "Memory files" 표로 볼 수 있다 (이 대화의 숫자는 시작할 때 읽은 예전 파일 기준이다)
- 상위 `~/CLAUDE.md`의 정적 사이트 부분은 이 프로젝트에서도 매번 읽힌다. 줄이려면 따로 계획한다
