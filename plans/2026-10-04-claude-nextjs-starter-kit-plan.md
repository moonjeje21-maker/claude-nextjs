# 웹개발 스타터 킷 (claude-nextjs) 계획

## Context (왜 하는가)

새 웹 프로젝트를 시작할 때마다 같은 설정을 반복하지 않도록, **바로 개발을 시작할 수 있는 기본 틀(스타터 킷)**을
`workspace1/claude-nextjs/`에 만든다. 지금 이 폴더는 비어 있다.
기술 스택: Next.js · TypeScript · Tailwind CSS · shadcn/ui · lucide-react.
각 단계마다 **공식 문서 기준 최신 버전인지 확인**하면서 진행한다.

사용자 결정 사항: 패키지 매니저 **npm** / TypeScript는 **create-next-app 기본값** / 코드는 **`src/` 폴더** 안에.

## 최신 버전 조사 결과 (2026-10-04, 공식 문서 + `npm view`)

| 기술 | 최신 버전 | 공식 설치 방법 요약 |
|---|---|---|
| Next.js | 16.3.8 (React 19.3.0) | `npx create-next-app@latest` · Node 20.9 이상 필요 (현재 v24.21.0 ✅) · Turbopack 기본 |
| TypeScript | 7.0.2 (Next.js 최소 5.1) | TS 7은 `experimental.useTypeScriptCli` 필요 → **create-next-app이 넣어 주는 버전 그대로 사용** |
| Tailwind CSS | 4.3.3 | Next.js는 Vite 플러그인이 아니라 **`@tailwindcss/postcss`** 방식 (Tailwind 공식 Next.js 가이드). create-next-app이 자동 설정 |
| shadcn/ui | CLI `shadcn` 4.21.1 | `npx shadcn@latest init -t next` → `components.json`, `src/lib/utils.ts`, `globals.css` 수정. Tailwind v4·React 19 지원 |
| lucide-react | 1.52.0 | shadcn 기본 아이콘. init 때 함께 설치됨 (안 되면 `npm i lucide-react`) |
| ESLint | 10.12.0 | Next.js 16부터 `next build`가 린트를 안 돌림 → `npm run lint`로 따로 실행 |

> 참고: 사용자가 준 Tailwind 링크는 **Vite용** 가이드다. 이 프로젝트는 Next.js라서 Tailwind의 **Next.js 전용 가이드**(PostCSS 방식)를 따른다.

## 실행 단계

각 단계 끝에 **[버전 확인]**: `npm ls <패키지>` 결과가 위 표의 최신 버전과 같은지 본다.

### 1단계. Next.js + TypeScript + Tailwind 뼈대 만들기
- `create-next-app`은 빈 폴더에서만 실행되므로, `plans/`를 잠시 scratchpad로 옮겼다가 끝나고 되돌린다.
- 실행 (`claude-nextjs/` 안에서):
  ```
  npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir --turbopack \
    --import-alias "@/*" --use-npm --disable-git --yes
  ```
  - `--disable-git`: 이미 `workspace1` 저장소 안이라 git을 따로 만들지 않는다.
  - 기본으로 `AGENTS.md`와 `CLAUDE.md`가 생긴다 (AI 코딩 도구용 안내 파일). 그대로 두고, 이 프로젝트 `CLAUDE.md`에 스택·실행 방법을 덧붙인다.
- [버전 확인] next, react, react-dom, typescript, tailwindcss, @tailwindcss/postcss, eslint
- `postcss.config.mjs`가 `@tailwindcss/postcss`를 쓰는지, `src/app/globals.css`에 `@import "tailwindcss";`가 있는지 확인한다.

### 2단계. shadcn/ui 설치
- `npx shadcn@latest init -t next` (기본 스타일, 기본 색 neutral, CSS 변수 사용, 기본 라이브러리는 CLI 기본값 Radix)
- 생기는 파일: `components.json`, `src/lib/utils.ts`(`cn()` 함수 = 클래스 이름을 합쳐 주는 도우미), `src/app/globals.css`의 테마 변수
- [버전 확인] shadcn CLI, lucide-react, 함께 설치되는 의존성(clsx, tailwind-merge 등)

### 3단계. 기본 컴포넌트 추가
- `npx shadcn@latest add button card input label badge separator`
- 파일 위치: `src/components/ui/*.tsx`

### 4단계. lucide-react 확인
- `package.json`에 lucide-react가 있는지 확인하고, 없으면 `npm i lucide-react@latest`

### 5단계. 스타터 시작 화면 만들기
- `src/app/page.tsx`: 기본 Next.js 예시 화면을 지우고, 스타터 킷 소개 화면으로 바꾼다
  - 스택 목록을 shadcn `Card` + lucide 아이콘으로 보여 주는 반응형 그리드 (모바일 1열 → 데스크톱 3열)
  - `Button`, `Input`, `Badge` 사용 예시 → 설치가 제대로 됐는지 한눈에 확인용
- 화면 조각은 `src/components/`에 작은 컴포넌트로 나눈다 (예: `stack-card.tsx`, `site-header.tsx`)
- `src/app/layout.tsx`: `lang`, 메타데이터(제목·설명) 정리
- 코드 규칙: 들여쓰기 2칸, camelCase / 컴포넌트 PascalCase, `any` 금지, 새 주석은 한국어

### 6단계. 문서 정리
- `README.md`: 스택과 버전, 설치·실행 명령(`npm install`, `npm run dev`, `npm run build`, `npm run lint`), 폴더 구조, 컴포넌트 추가 방법
- 프로젝트 `CLAUDE.md`: 위 내용 요약 + "버전 올리기: `npx next upgrade`, `npx shadcn@latest add`" 안내
- `.gitignore`는 create-next-app 기본값 사용 (`node_modules`, `.next` 등 제외)

### 7단계. 계획 파일 저장
- 승인된 이 계획을 `plans/2026-10-04-claude-nextjs-starter-kit-plan.md`로 저장하고, 작업 후 완료 상태·남은 작업을 적는다.

## 최종 폴더 구조 (예상)
```
claude-nextjs/
├─ src/
│  ├─ app/            layout.tsx, page.tsx, globals.css
│  ├─ components/     ui/(shadcn), stack-card.tsx, site-header.tsx
│  └─ lib/utils.ts
├─ public/
├─ plans/
├─ components.json · postcss.config.mjs · next.config.ts · tsconfig.json · eslint.config.mjs
└─ README.md · CLAUDE.md · AGENTS.md · package.json
```

## 검증 방법
1. `npm run lint` → 오류 0개
2. `npm run build` → 빌드 성공 (TypeScript 타입 검사 포함)
3. `npm run dev` → `http://localhost:3000`에서 시작 화면 확인
   - Tailwind 클래스가 적용됐는지, shadcn 버튼·카드 모양, lucide 아이콘 표시
   - 브라우저 창을 좁혀 모바일 레이아웃(1열) 확인
4. `npm ls next react typescript tailwindcss lucide-react` 결과를 README 버전 표와 대조

## 커밋
- 작업이 끝나면 `workspace1` 저장소에서 커밋할 파일 목록과 변경 요약을 먼저 보여 주고, 확인을 받은 뒤 커밋한다 (`node_modules`, `.next`는 제외).

## 범위 밖 (나중에 할 수 있는 것)
- 다크 모드 토글 (shadcn 문서 방식은 `next-themes` 라이브러리가 추가로 필요)
- Zustand, React Hook Form + Zod (CLAUDE.md의 React 스택이지만 이번 요청 범위에는 없음)

---

## 완료 상태 (2026-10-04)

**1~7단계 모두 완료.**

- 설치된 버전: Next.js 16.3.8 · React 19.3.0 · TypeScript 5.9.3 · Tailwind 4.3.3 · shadcn CLI 4.21.1 · lucide-react 1.52.0 · ESLint 9.39.5
- 계획과 달라진 점
  - React: create-next-app은 19.2.8을 넣었다 → 최신 19.3.0으로 올림 (Next.js 지원 범위 안)
  - ESLint: 최신은 10이지만 eslint-plugin-react가 10을 지원하지 않아 9 유지
  - shadcn: 프리셋 `nova`(Radix 기반) 선택. `clsx`·`tailwind-merge` 대신 shadcn 공식 `cn` 패키지가 설치됨
  - 글꼴: `globals.css`의 `--font-sans`가 자기 자신을 가리켜서 `layout.tsx`의 Geist 변수 이름을 `--font-sans`로 맞춤
  - 쓰지 않는 기본 SVG 5개(`public/`) 삭제, 스택 목록 데이터는 `src/lib/stack.ts`로 분리
- 검증: `npm run lint` 오류 0 · `npm run build` 성공 · 개발 서버 화면 확인 · 반응형 CSS(sm 2열, lg 3열) 확인
  - 브라우저 콘솔의 hydration 경고 1개는 ClickUp 크롬 확장이 `<body>`에 클래스를 붙여서 생긴 것 (코드 문제 아님)

## 남은 작업

- `npm audit` high 5개: ESLint 관련 개발용 도구(braces)에서 나온 것. 자동 수정은 eslint-config-next를 14로 내리는 것이라 적용하지 않음 → 상위 패키지 업데이트를 기다림
- ~~커밋~~ → 커밋·푸시 완료 (c9d11d7, 2026-10-04)
- 선택: 다크 모드 토글(next-themes), Zustand, React Hook Form + Zod
