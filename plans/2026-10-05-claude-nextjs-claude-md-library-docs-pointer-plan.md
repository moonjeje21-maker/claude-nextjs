# CLAUDE.md 네 번째 점검 계획 (/init)

- 날짜: 2026-10-05
- 프로젝트: claude-nextjs (브랜치 `main`, 커밋되지 않은 변경 없음)
- 상태: 완료 (2026-10-05) — 브랜치 `chore/claude-md-library-docs-pointer`에서 PR로 올림. 결과는 맨 아래 "완료 기록" 참고

## Context (왜 하는가)

`/init`은 저장소를 읽고 `CLAUDE.md`(Claude Code가 대화를 시작할 때마다 읽는 안내 파일)를 만들거나, 이미 있으면 고칠 점을 제안하는 명령이다. 이 파일은 오늘 이미 세 번 점검했으므로, 이번에는 **지난 점검(커밋 `c935f6c`) 뒤로 바뀐 것**만 대조했다.

결론: **틀린 내용은 없고, 덧붙일 것이 한 줄 있다.** 오늘 만든 문서 확인 규칙(`.claude/rules/library-docs.md`)을 `CLAUDE.md`가 가리키지 않아서, 규칙이 읽히지 않는 경우가 하나 생긴다.

## 점검 결과

| 확인한 것 | 결과 |
| --- | --- |
| 지난 점검 뒤 `src/`, `package.json`, 설정 파일, `README.md`, `AGENTS.md`가 바뀌었나 | 바뀌지 않았다. 지난 점검에서 확인한 명령·구조·계층 설명이 그대로 유효하다 (lint·build는 다시 돌리지 않았다) |
| 지난 점검 뒤 새로 생긴 것 | `/ship` 스킬, `main` 커밋을 막는 훅, 문서 확인 규칙 |
| `/ship` 스킬 | `CLAUDE.md` 11행이 이미 가리킨다 |
| `main` 커밋을 막는 훅 | 적지 않아도 된다. "`main`에 바로 커밋하지 않는다"가 이미 있고, 훅이 막을 때 이유를 직접 알려 준다 |
| 문서 확인 규칙 | `CLAUDE.md`, `dependencies.md` 어디에서도 가리키지 않는다 → 아래에서 보완 |
| Cursor · Copilot · Codex · Gemini 설정 | 없다. 가져올 것이 없다 |

### 보완할 곳 1곳

- 문서 확인 규칙은 `src/` 아래 코드나 `package.json`을 **열 때** 자동으로 읽힌다
- 그런데 `CLAUDE.md` 12행은 설치·버전 올리기 전에 `dependencies.md`를 읽으라고만 한다. 이 안내대로 `dependencies.md`만 읽고 `npm i …`나 `npx next upgrade`를 실행하면, 맞는 파일을 연 적이 없어서 문서 확인 규칙이 읽히지 않는다
- 생길 수 있는 실수: 새 라이브러리를 설치하거나 버전을 올릴 때 "업그레이드 안내를 먼저 읽는다", "공식 문서를 확인한다"를 건너뛴다

## 고칠 내용 — `CLAUDE.md`에 한 줄 추가 (다른 파일은 건드리지 않는다)

12행(`dependencies.md` 안내) 바로 아래에 다음 줄을 넣는다.

```markdown
- 처음 쓰는 API를 쓰거나 라이브러리를 설치·업그레이드할 때는 `.claude/rules/library-docs.md`의 순서로 문서를 먼저 확인한다 (`src/` 아래 코드나 `package.json`을 열면 자동으로 읽힌다)
```

규칙의 내용(확인 순서, 예외 목록)은 옮겨 적지 않는다. 같은 내용을 두 곳에 두면 한쪽만 고쳐져 어긋나기 때문이다.

## 고치지 않는 것

- **`theme.md` 안내**: `globals.css`·`layout.tsx`를 열어야만 하는 작업에 쓰이므로 항상 자동으로 읽힌다. 가리킬 필요가 없다
- **훅의 `&&` 주의점** (브랜치 만들기와 커밋을 한 명령으로 묶으면 막힌다): `/ship` 스킬에 이미 적혀 있다
- **`code-reviewer` 에이전트 안내**: 앞선 계획에서 "자동으로 발견되므로 적지 않는다"고 정했다
- `README.md`, `AGENTS.md`, `.claude/rules/`, 상위 `~/CLAUDE.md`

## 작업 순서

1. 이 계획 파일 이름을 바꾼다: `plans/2026-10-05-claude-nextjs-claude-md-library-docs-pointer-plan.md`
2. 브랜치를 만든다: `chore/claude-md-library-docs-pointer`
3. `CLAUDE.md` 12행 아래에 위 한 줄을 넣는다
4. 아래 방법으로 확인하고, 계획 파일에 완료 상태와 남은 작업을 적는다
5. 커밋·PR은 사용자가 `/ship`으로 요청하면 그때 진행한다

## 확인 방법

1. `git diff CLAUDE.md` — 추가된 줄이 정확히 1줄이고 다른 줄은 그대로인지 본다
2. `ls .claude/rules/library-docs.md` — 가리키는 파일이 실제로 있는지 본다
3. `wc -c CLAUDE.md` — 얼마나 늘었는지 잰다
4. `git status --short` — 바뀐 파일이 `CLAUDE.md`와 계획 파일뿐인지 본다
5. lint·build는 돌리지 않는다 (md 파일만 바뀐다)

## 완료 기록 (2026-10-05)

- 계획대로 `CLAUDE.md` 12행 아래에 한 줄을 넣었다. 다른 파일은 고치지 않았다
- `git diff CLAUDE.md`: 추가 1줄, 삭제 0줄
- 가리키는 파일 `.claude/rules/library-docs.md`: 있다
- 크기: 3,787바이트 → 4,022바이트 (235바이트 늘었다)
- `git status --short`: 바뀐 파일은 `CLAUDE.md`와 이 계획 파일뿐이다
- lint·build는 돌리지 않았다 (md 파일만 바뀌었다)

## 남은 작업

- 없음
