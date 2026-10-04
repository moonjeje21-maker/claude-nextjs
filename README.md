# 웹개발 스타터 킷

Next.js · TypeScript · Tailwind CSS · shadcn/ui · lucide-react가 미리 설정된 시작용 프로젝트입니다.

## 기술 스택 (2026-10-04 기준)

| 기술 | 버전 | 비고 |
|---|---|---|
| Next.js | 16.3.8 | App Router, Turbopack |
| React | 19.3.0 | |
| TypeScript | 5.9.3 | create-next-app 기본값 (TS 7은 `experimental.useTypeScriptCli` 필요) |
| Tailwind CSS | 4.3.3 | `@tailwindcss/postcss` 방식 |
| shadcn/ui | CLI 4.21.1 | 프리셋 `radix-nova`, 기본 색 neutral |
| lucide-react | 1.52.0 | shadcn 기본 아이콘 |
| ESLint | 9.39.5 | eslint-plugin-react가 아직 ESLint 10을 지원하지 않아 9 유지 |

Node.js 20.9 이상이 필요합니다.

## 시작하기

```bash
npm install      # 라이브러리 설치
npm run dev      # 개발 서버 → http://localhost:3000
npm run build    # 배포용 빌드 (타입 검사 포함)
npm run start    # 빌드 결과 실행
npm run lint     # 코드 규칙 검사
```

`src/app/page.tsx`를 고치면 화면이 바로 바뀝니다.

## 폴더 구조

```
src/
├─ app/              페이지와 레이아웃 (layout.tsx, page.tsx, globals.css)
├─ components/
│  ├─ ui/            shadcn/ui 컴포넌트 (button, card, input, label, badge, separator)
│  ├─ site-header.tsx
│  ├─ stack-card.tsx
│  └─ component-demo.tsx
└─ lib/
   ├─ utils.ts       cn() — 클래스 이름 합치기 도우미
   └─ stack.ts       시작 화면의 기술 스택 목록
```

## 자주 쓰는 명령

```bash
npx shadcn@latest add dialog      # shadcn 컴포넌트 추가 (src/components/ui/ 에 생성)
npx next upgrade                  # Next.js 최신 버전으로 올리기
npm outdated                      # 오래된 라이브러리 확인
```

아이콘은 [lucide.dev](https://lucide.dev/icons)에서 찾아 `import { 이름 } from "lucide-react"`로 씁니다.
