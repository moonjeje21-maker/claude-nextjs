# CLAUDE.md 개선 계획 (/init)

- 날짜: 2026-10-04
- 프로젝트: claude-nextjs (브랜치 `main`, 커밋되지 않은 변경 없음)
- 상태: 완료 (2026-10-04, 커밋 전) — 결과는 맨 아래 "완료 기록" 참고

## Context (왜 하는가)

`/init`은 코드를 분석해 `CLAUDE.md`(Claude Code가 이 저장소에서 일할 때 먼저 읽는 안내 파일)를 만들거나, 이미 있으면 개선점을 제안하는 명령이다. 이 프로젝트에는 `CLAUDE.md`가 이미 있어서, 내용을 실제 코드와 하나씩 대조했다.

## 대조 결과

### 맞는 내용 (그대로 둔다)

- 스택 버전: Next.js 16.3.8, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, shadcn 4.21.1, ESLint 9.39.5 — 설치된 버전과 일치
- 명령: `next typegen`, `next upgrade`가 실제로 있음. `package.json`의 `lint`는 `eslint`
- 계층 규칙(`lib → ui → common → layout → features → app`): 아래층이 위층을 import하는 곳이 없음
- `error.tsx`의 `retry` prop, `use-mobile.ts`의 `useSyncExternalStore`, `utils.ts`의 `cn` 패키지, 글꼴 변수 `--font-sans`, `globals.css`의 테마 구조 — 모두 코드와 일치
- 파일 맨 위 고정 문구와 `@AGENTS.md` 불러오기 — 이미 있음

### 틀린 내용 (1곳)

- **npm audit 설명**: 문서는 "high 5개, ESLint 쪽 개발용 도구에서 나온다"라고 하지만, 지금은 **high 9개**이고 `shadcn` CLI 쪽(`@shadcn/registry`, `ts-morph`)에서도 나온다. 9개 모두 `fast-glob → micromatch → braces` 한 줄기다. `npm audit fix --force`는 eslint-config-next를 14로 내릴 뿐 아니라 shadcn도 1.0.0으로 내린다. 개수는 시간이 지나면 또 바뀌므로 숫자를 빼고 원인을 적는다.

### 빠진 내용 (PR #2, #3 이후 생긴 것과 이번에 확인한 것)

1. Playwright MCP가 `.mcp.json`에 등록됨. 기록은 `.playwright-mcp/`에 쌓이고 git이 무시함
2. `next.config.ts`의 `devIndicators.position: "bottom-right"`와 그 이유 (이유를 모르면 "필요 없는 설정"으로 보고 지울 수 있다)
3. 개발 서버를 켠 채로 `npm run build`를 돌려도 됨 (이번 세션에서 확인. dev는 `.next/dev`를 따로 쓴다)
4. 세미콜론: 문서는 "새 파일은 세미콜론 없음"이라고만 하는데, create-next-app이 만든 파일(`src/app/layout.tsx`, `next.config.ts`, `eslint.config.mjs`)은 세미콜론을 쓴다
5. git 흐름: PR #1~#3 모두 브랜치 → PR → 병합 커밋, 영어 메시지로 올렸다

### 해당 없음

- Cursor 규칙(`.cursor/`, `.cursorrules`), Copilot 규칙(`.github/copilot-instructions.md`): 없음
- Codex(`~/.codex`, `./.codex`), Gemini(`~/.gemini`, `./.gemini`, `GEMINI.md`) 설정: 없음 → 가져올 것 없음
- `README.md`의 중요한 내용(화면 목록, 폴더 구조, 설치 표)은 이미 `CLAUDE.md`에 요약돼 있거나 README를 가리키고 있음

## 고칠 내용

파일: `CLAUDE.md` 하나만 고친다. 구조와 나머지 문장은 그대로 둔다.

### 1. 맨 위 목록 — git 흐름 한 줄 추가

"이 폴더는 별도 git 저장소다 …" 줄 바로 아래에 추가:

```markdown
- `main`에 바로 커밋하지 않는다. 브랜치(`feat/…`, `fix/…`, `chore/…`) → PR → 병합 커밋(`gh pr merge --merge`) 순서로 올린다. 커밋 메시지와 PR은 영어로 쓴다
```

### 2. "명령" — 브라우저 확인 방법 2줄 추가

"테스트 도구는 없다. 변경 확인은 lint + build + 브라우저로 한다" 줄 바로 아래에 추가:

```markdown
- 개발 서버가 이미 켜져 있을 수 있다. 새로 켜기 전에 `lsof -nP -iTCP:3000 -sTCP:LISTEN`으로 확인한다. dev는 `.next/dev`를 쓰므로 서버를 켠 채로 build를 돌려도 된다
- 브라우저 확인은 Playwright MCP로 한다 (`.mcp.json`에 등록). 화면·콘솔 기록은 `.playwright-mcp/`에 쌓이고 git은 이 폴더를 무시한다. 스크린샷은 프로젝트 폴더 안에만 저장되므로 `.playwright-mcp/이름.png`로 저장한다. 없는 주소를 열 때 콘솔에 찍히는 404 오류 1건은 정상이다
```

### 3. "스타일과 테마" — Prettier 줄 보완

바꾸기 전:

```markdown
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)을 따른다
```

바꾼 후:

```markdown
- Prettier는 없다. 새 파일은 shadcn 스타일(큰따옴표, 세미콜론 없음)을 따른다. create-next-app이 만든 파일(`src/app/layout.tsx`, `next.config.ts`, `eslint.config.mjs`)은 세미콜론을 쓰므로, 고칠 때는 그 파일의 방식을 따른다
```

### 4. "주의" — npm audit 줄 바로잡기

바꾸기 전:

```markdown
- `npm audit`의 high 5개는 ESLint 쪽 개발용 도구에서 나온다. `npm audit fix --force`는 eslint-config-next를 14로 내리므로 쓰지 않는다
```

바꾼 후:

```markdown
- `npm audit`의 high 경고는 모두 `fast-glob → micromatch → braces` 한 줄기에서 나오고, `eslint-config-next`와 `shadcn` CLI가 끌어온다 (브라우저로 가는 코드가 아니다). `npm audit fix --force`는 eslint-config-next를 14로, shadcn을 1.0으로 내리므로 쓰지 않는다
```

### 5. "주의" — 개발 도구 버튼 위치 한 줄 추가

"주의" 목록 맨 아래에 추가:

```markdown
- `next.config.ts`의 `devIndicators.position: "bottom-right"`는 지우지 않는다. 기본 위치(왼쪽 아래)에서는 Next.js 개발 도구 버튼이 접힌 사이드바의 사용자 메뉴를 덮어 클릭이 막힌다. 대신 개발 서버에서는 토스트 오른쪽 모서리와 잠깐 겹친다 (배포본에는 이 버튼이 없다)
```

## 고치지 않는 것

- `README.md` (이번 요청은 `CLAUDE.md` 대상)
- `AGENTS.md` (`next dev`가 쓰고 다시 만드는 파일)
- `CLAUDE.md`의 나머지 문장과 구조

## 확인 방법

1. 고친 `CLAUDE.md`를 처음부터 끝까지 다시 읽어, 추가한 문장이 주변 문장과 겹치거나 어긋나지 않는지 본다
2. `git diff CLAUDE.md`로 위 5곳만 바뀌었는지 확인한다
3. 추가한 문장의 근거를 다시 확인한다: `.mcp.json` 내용, `.gitignore`의 `.playwright-mcp/`, `next.config.ts`의 `devIndicators`, `npm audit` 결과

마크다운 파일만 바뀌므로 lint와 build는 돌리지 않는다.

## 완료 기록 (2026-10-04)

- `CLAUDE.md`의 5곳을 계획대로 고쳤다 (6줄 추가, 2줄 바꿈)
- 확인: 파일 전체를 다시 읽었고, `git diff CLAUDE.md`에 위 5곳만 나왔다. 근거(`.mcp.json`, `.gitignore`의 `.playwright-mcp/`, `next.config.ts`의 `devIndicators`, 세 파일의 세미콜론, `.next/dev` 폴더, `npm audit` 결과)도 다시 확인했다

### 남은 작업

- 커밋하지 않았다. 바뀐 파일: `CLAUDE.md`, 이 계획 파일
- 커밋·푸시는 따로 요청받았을 때만, 올릴 내용을 먼저 보여 주고 확인받은 뒤에 한다 (브랜치 → PR 방식)
