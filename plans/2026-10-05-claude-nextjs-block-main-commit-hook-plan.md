# main 브랜치 직접 커밋·푸시 차단 hook 계획

## Context (왜 하는가)

`CLAUDE.md`에 "`main`에 바로 커밋하지 않는다"는 규칙이 있지만 글로만 적혀 있어, Claude가 실수로 어길 수 있다. Claude가 `main` 브랜치에서 `git commit` / `git push`를 실행하려 하면 **실행 전에 자동으로 막는** hook을 건다.

## 용어 설명

- **hook(훅)**: Claude Code에서 특정한 일이 일어날 때 자동으로 실행되는 명령.
- **PreToolUse**: Claude가 도구(여기서는 터미널 명령을 실행하는 `Bash`)를 쓰기 **직전**에 실행되는 hook. 여기서 실행을 막을 수 있다.
- **종료 코드 2**: 스크립트가 끝나며 돌려주는 숫자. PreToolUse hook이 2로 끝나면 Claude Code가 그 명령을 실행하지 않고, 스크립트가 남긴 문구를 Claude에게 전달한다. 0이면 그대로 통과한다.

## 동작 방식

```
[Claude가 Bash 명령 실행 직전] → PreToolUse(Bash) → block-main-commit.sh
   ├─ git commit / git push가 아님  → 통과 (종료 코드 0)
   ├─ 현재 브랜치가 main이 아님     → 통과 (종료 코드 0)
   └─ main에서 commit / push        → 차단 (종료 코드 2) + "브랜치를 먼저 만드세요"
```

## 만드는 파일 (2개, 둘 다 git에 올린다)

| 파일 | 내용 |
|---|---|
| `.claude/hooks/block-main-commit.sh` (새로 만듦) | 차단 스크립트 (12줄) |
| `.claude/settings.json` (새로 만듦) | hook 등록. 프로젝트 공용 설정 파일 |

규칙이 이 프로젝트의 `CLAUDE.md`에 있으므로, hook도 프로젝트와 함께 다니도록 저장소 안에 둔다 (스타터 킷을 복제하면 hook도 따라온다). 슬랙 알림 hook이 있는 `settings.local.json`(나만 쓰는 설정)은 건드리지 않는다. 두 파일의 hook은 함께 동작한다.

## 단계별 작업

### 1단계. 준비

- 이 계획 파일 이름을 `plans/2026-10-05-claude-nextjs-block-main-commit-hook-plan.md`로 바꾼다 (프로젝트 규칙).
- 브랜치 `chore/block-main-commit-hook`을 만든다.

### 2단계. 스크립트 작성 — `.claude/hooks/block-main-commit.sh`

```bash
#!/bin/bash
# main 브랜치에서 Claude가 git commit / git push를 실행하지 못하게 막는 hook 스크립트

# Claude Code가 표준 입력으로 넘겨주는 JSON에서 명령을 꺼내, git commit·push가 아니면 통과시킨다
jq -r '.tool_input.command' | grep -qE 'git[[:space:]]+(commit|push)' || exit 0

# 현재 브랜치가 main이 아니면 통과시킨다
[ "$(git branch --show-current)" = "main" ] || exit 0

# 종료 코드 2 = 실행을 막고, 아래 문구를 Claude에게 전달한다
echo "main 브랜치에서는 commit/push를 하지 않습니다. 브랜치(feat/…, fix/…, chore/…)를 먼저 만드세요." >&2
exit 2
```

`jq`(JSON에서 값을 꺼내는 도구)는 이미 설치되어 있다. 브랜치는 hook이 실행되는 폴더(이 프로젝트)에서 `git branch --show-current`로 확인한다.

### 3단계. 스크립트 단독 시험 (hook 등록 전)

가짜 JSON을 넣어 종료 코드를 본다. `main` 상황은 임시 폴더(scratchpad)에 `git init -b main`으로 만든 빈 저장소 안에서 스크립트를 실행해 시험한다.

| 넣는 값 | 기대 결과 |
|---|---|
| 임시 main 저장소 + `git commit -m x` | 종료 코드 2 + 안내 문구 |
| 임시 main 저장소 + `git push` | 종료 코드 2 + 안내 문구 |
| 임시 main 저장소 + `npm run lint` | 종료 코드 0 |
| 이 저장소(`chore/…` 브랜치) + `git commit -m x` | 종료 코드 0 |

### 4단계. hook 등록 — `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-main-commit.sh"
          }
        ]
      }
    ]
  }
}
```

- `matcher: "Bash"`: 터미널 명령을 실행할 때만 이 hook을 돌린다.
- `$CLAUDE_PROJECT_DIR`: Claude Code가 넣어 주는 프로젝트 폴더 경로. 어느 폴더에서 명령을 실행해도 스크립트를 찾는다.
- 등록 후 `jq`로 JSON 문법을 검사한다.

### 5단계. 커밋 → PR → 병합

1. 커밋할 파일과 변경 요약을 먼저 보여 주고 **확인을 받은 뒤** 커밋·푸시한다 (메시지는 영어).
2. PR을 만들고 `gh pr merge --merge`로 병합한다.
   - `chore/…` 브랜치에서 커밋·푸시가 막히지 않는 것이 "통과" 경로의 실제 확인이 된다.

### 6단계. 실제 차단 확인

병합 후 `main`으로 돌아와 `git commit --dry-run`을 실행한다 → hook이 막고 안내 문구가 나와야 한다. (`--dry-run`은 실제로 커밋하지 않는 옵션이라, hook이 동작하지 않더라도 `main`에 아무것도 남지 않는다.)
안 막히면 Claude Code에서 `/hooks`를 한 번 열어 설정을 다시 읽게 한 뒤 다시 시험한다.

### 7단계. 마무리

이 계획 파일에 완료 상태와 남은 작업을 적는다.

## 넣지 않는 것 (오버하지 않기)

| 뺀 것 | 이유 |
|---|---|
| `git push origin main`처럼 다른 브랜치에서 main으로 보내는 경우 검사 | `main`에서 커밋을 못 하면 보낼 것이 없다 |
| `--force` 푸시, `git reset --hard` 등 다른 위험 명령 차단 | 요청 범위는 "main 직접 커밋·푸시"뿐이다 |
| 차단 기록 로그, 슬랙 알림 연동 | 막힌 사실은 화면에 바로 보인다 |
| 예외 허용 스위치 | 끄고 싶으면 설정 한 줄을 지우면 된다 |

## 알아 둘 점

- **Claude가 실행하는 명령만** 막는다. 내가 터미널에서 직접 치는 `git commit`은 막지 않는다.
- 브랜치는 명령을 실행하기 **직전** 기준으로 본다. `main`에서 `git checkout -b feat/x && git commit …`처럼 한 줄로 이으면 막힌다 → 브랜치 만들기와 커밋을 따로 실행하면 된다.
- 명령 글자에 `git commit`이 들어 있기만 해도 걸린다 (예: `main`에서 `echo "git commit"`). `main`에서만 생기는 드문 일이라 그대로 둔다.

## 끄는 방법

`.claude/settings.json`의 `hooks` 항목을 지운다.

## 간결화 검토 (2026-10-05, 커밋 전)

| 검토한 것 | 결정 |
|---|---|
| 스크립트의 변수 3개(`input`, `command`, `branch`)와 `.cwd` 읽기 | **줄임.** `jq` 결과를 바로 `grep`에 넘기고, 브랜치는 실행 폴더에서 바로 확인한다 (17줄 → 12줄, `jq` 호출 2번 → 1번) |
| 스크립트 파일 없이 `settings.json`에 한 줄 명령으로 넣기 | 안 함. 파일은 하나 줄지만 따옴표를 겹겹이 써야 해서 읽고 고치기 어렵다 |
| hook 설정의 `if` 조건으로 명령 고르기 | 안 함. commit·push를 따로 등록해야 해서 설정이 오히려 길어진다 |
| `settings.json` | 그대로. 이미 필요한 항목만 있다 |

## 진행 상태 (2026-10-05)

완료:

- [x] 1단계: 계획 파일 이름 변경, 브랜치 `chore/block-main-commit-hook` 생성
- [x] 2단계: `.claude/hooks/block-main-commit.sh` 작성 (간결화 검토 후 12줄)
- [x] 3단계: 스크립트 단독 시험 통과 — 임시 main 저장소에서 `git commit`·`git push`는 종료 코드 2 + 안내 문구, `npm run lint`는 0, `chore/…` 브랜치의 `git commit`은 0
- [x] 4단계: `.claude/settings.json`에 hook 등록, `jq` 검사 통과
- [x] 6단계(커밋 전에 앞당겨 실행): 실제 Claude Code에서 확인
  - `main`에서 `git commit --dry-run` → hook이 막고 안내 문구 표시
  - `main`에서 `git push --dry-run` → hook이 막고 안내 문구 표시
  - `main`에서 `git checkout …` → 통과
  - `chore/…` 브랜치에서 `git commit --dry-run` → 통과

- [x] 5단계: PR #10으로 병합, 작업 브랜치 삭제. 병합 후 `main`에서 `git commit --dry-run`이 막히는 것을 다시 확인

남은 작업: 없음
