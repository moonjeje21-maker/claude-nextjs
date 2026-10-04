# claude-nextjs `CLAUDE.md` 개선 계획 (/init)

## Context (왜 하는가)

`/init`은 저장소를 분석해서 `CLAUDE.md`(Claude Code가 작업을 시작할 때마다 읽는 안내 파일)를 만들거나, 이미 있으면 고칠 점을 제안하는 명령이다.
이 저장소에는 이미 `CLAUDE.md`가 있고 내용도 정확하다. 다만 코드를 여러 파일 읽어야만 알 수 있는 내용 몇 가지가 빠져 있어서, 그 부분만 보탠다.

고치는 파일은 **`CLAUDE.md` 하나**다. 코드(`src/`)와 `AGENTS.md`, `README.md`는 건드리지 않는다.

## 조사 결과 요약

- Cursor 규칙, Copilot 규칙, Codex·Gemini 설정은 없다 → 가져올 것 없음.
- `README.md`의 핵심(스택, 명령, 폴더 구조)은 이미 `CLAUDE.md`에 요약돼 있다.
- 테스트 도구는 설치돼 있지 않다 (`package.json`에 `test` 스크립트 없음).
- `next dev`는 `AGENTS.md`만 다시 쓰고 `CLAUDE.md`는 건드리지 않는다 (`node_modules/next/dist/server/lib/generate-agent-files.js` 확인). 그래서 `@AGENTS.md` 줄을 아래로 옮겨도 안전하다.

## 지금 `CLAUDE.md`에 빠져 있는 것

| 빠진 내용 | 근거 |
|---|---|
| `/init`이 요구하는 머리말 2줄 | 현재 파일은 `@AGENTS.md`로 바로 시작한다 |
| 파일 하나만 lint 하는 법, 타입 검사만 하는 법 | `lint` 스크립트가 `eslint`뿐이라 `npx eslint <파일>`로 가능. 타입 검사는 Next 문서의 `next typegen && tsc --noEmit` |
| `next build`가 lint를 안 돌린다는 점 | Next 16 업그레이드 문서: "`next build` no longer runs linting" |
| 테스트 도구가 없다는 점 | `package.json` |
| 색·글꼴이 CSS 변수로 연결되는 구조 | `src/app/globals.css` ↔ `src/app/layout.tsx` (Tailwind 4는 `tailwind.config` 파일이 없다) |
| `shadcn`, `cn` 패키지가 실행에 필요하다는 점 | `globals.css`가 `shadcn/tailwind.css`를 import, `src/lib/utils.ts`가 `cn`을 다시 내보냄 |
| 서버 컴포넌트가 기본이라는 점 | `"use client"`는 `ui/label.tsx`, `ui/separator.tsx`에만 있다 |
| 버전을 올릴 때 같이 고칠 곳 | `src/lib/stack.ts`(화면에 보이는 버전)와 `README.md` 버전 표 |
| 아직 설치 안 된 것, 하면 안 되는 것 | 이전 계획 파일의 "남은 작업": 다크 모드 토글·Zustand·RHF+Zod 미설치, `npm audit fix --force` 금지 |

## 바꿀 내용: `CLAUDE.md` 전체를 아래로 교체

기존 9줄의 내용은 모두 살리고(순서만 정리), 위 표의 빠진 내용을 보탠다.

```markdown
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
```

### 낱말 풀이

- **lint**: 코드를 실행하지 않고 규칙 위반(안 쓰는 변수 등)을 찾아 주는 검사.
- **타입 검사**: TypeScript가 "숫자 자리에 글자를 넣었다" 같은 실수를 찾는 검사.
- **typegen**: Next.js가 라우트(주소)에 맞는 타입 파일을 `.next/` 안에 만들어 주는 명령. 이 파일이 없으면 `tsc`가 `LayoutProps`를 모른다고 오류를 낸다.
- **서버 컴포넌트 / `"use client"`**: Next.js 컴포넌트는 기본적으로 서버에서 그려진다. 클릭 처리나 상태(`useState`)가 필요한 파일만 맨 위에 `"use client"`를 적어 브라우저에서 돌게 한다.
- **토큰 클래스**: `bg-background`처럼 색 이름 대신 "역할"로 부르는 클래스. 테마 색을 바꾸면 한 번에 따라 바뀐다.

## 실행 순서

1. 이 계획 파일 이름을 규칙에 맞게 바꾼다: `plans/quiet-snacking-raccoon.md` → `plans/2026-10-04-claude-nextjs-claude-md-plan.md`
2. `CLAUDE.md`를 위 내용으로 교체한다.
3. 아래 검증을 한다. 통과하지 못한 명령은 `CLAUDE.md`에서 고치거나 뺀다.
4. 계획 파일 끝에 완료 상태와 남은 작업을 적는다.
5. 커밋은 자동으로 하지 않는다. 커밋할 파일 목록과 변경 요약을 먼저 보여 주고 확인을 받는다.

## 검증 방법

`CLAUDE.md`에 적은 명령이 실제로 동작하는지 하나씩 돌려 본다.

1. `npx eslint src/app/page.tsx` → 오류 없이 끝나는지
2. `npx next typegen && npx tsc --noEmit` → 오류 없이 끝나는지
3. `npm run lint` → 오류 0개
4. `git status` → 바뀐 파일이 `CLAUDE.md`와 `plans/` 안의 계획 파일뿐인지

---

## 완료 상태 (2026-10-04)

**1~4단계 완료.**

- `CLAUDE.md`를 계획한 내용 그대로 교체했다. 계획과 달라진 점은 없다.
- 계획 파일 이름을 `plans/2026-10-04-claude-nextjs-claude-md-plan.md`로 바꿨다.
- 검증: `npx eslint src/app/page.tsx` 오류 0 · `npx next typegen && npx tsc --noEmit` 오류 0 · `npm run lint` 오류 0
- `git status`: 바뀐 파일은 `CLAUDE.md`(수정)와 이 계획 파일(새 파일)뿐이다.

## 남은 작업

- 커밋·푸시: 아직 하지 않았다. 파일 목록과 변경 요약을 확인받은 뒤에 한다.
