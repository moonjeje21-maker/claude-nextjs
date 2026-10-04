@AGENTS.md

# claude-nextjs (웹개발 스타터 킷)

- 스택: Next.js 16.3 (App Router) · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3 · shadcn/ui (radix-nova) · lucide-react
- 패키지 매니저: npm. 코드는 `src/` 아래, import 별칭은 `@/*`
- 실행: `npm run dev` / 확인: `npm run lint`, `npm run build`
- shadcn 컴포넌트는 직접 쓰지 말고 `npx shadcn@latest add <이름>`으로 추가한다 (`src/components/ui/`)
- `cn()`은 shadcn의 `cn` 패키지에서 온다 (`src/lib/utils.ts`)
- ESLint는 9 유지 (eslint-plugin-react가 ESLint 10 미지원). TypeScript 7로 올리려면 `next.config.ts`에 `experimental.useTypeScriptCli: true` 필요
- 버전 올리기: `npx next upgrade`, `npm outdated`
- 계획 파일: `plans/`
- 이 폴더는 별도 git 저장소다 (github.com/moonjeje21-maker/claude-nextjs). git 명령은 이 폴더 안에서 쓴다
