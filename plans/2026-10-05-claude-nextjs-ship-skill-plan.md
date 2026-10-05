# `/ship` 스킬 계획 — 커밋부터 브랜치 삭제까지 한 번에

## Context (왜 하는가)

지금은 변경을 올릴 때마다 브랜치 만들기 → 커밋 → 푸시 → PR → 병합 → 브랜치 삭제 → `main` 최신화를 하나씩 요청한다. 순서는 매번 같고, 지난 기록(PR #8·#9, #10·#11)을 보면 "계획 파일 완료 표시"만 담은 PR이 작업 PR 뒤에 한 번씩 더 올라가 작업 하나에 PR이 2개씩 생긴다.

이 순서를 `/ship` 한 번으로 실행하게 만든다. 사람 확인은 커밋 직전 한 번만 받고, 계획 파일 완료 표시는 같은 PR에 넣어 작업 하나에 PR이 1개만 생기게 한다.

## 용어 설명

- **스킬(skill)**: Claude Code에서 `/이름`으로 부르는 작업 순서 설명서. `.claude/skills/<이름>/SKILL.md` 파일 하나다. 부르면 Claude가 그 내용을 읽고 순서대로 실행한다.
- **frontmatter**: 파일 맨 위 `---` 사이에 적는 설정 칸. 스킬의 이름과 옵션을 여기에 적는다.
- **`disable-model-invocation: true`**: Claude가 스스로 이 스킬을 실행하지 못하게 하는 옵션. 사용자가 `/ship`을 입력할 때만 실행된다. 공식 문서가 `/commit`, `/deploy`처럼 부작용이 있는 작업에 쓰라고 안내하는 옵션이다.
- **PR(Pull Request)**: 브랜치의 변경을 `main`에 합쳐 달라고 GitHub에 올리는 요청.

## 단계별 판단 (이렇게 정한 이유)

| 순서 | 따져 본 것 | 결정 | 근거 |
|---|---|---|---|
| 1 | 무엇으로 자동화할까 | 스킬 | 커밋 메시지·PR 본문은 변경 내용을 읽고 써야 해서 셸 스크립트로는 안 된다. hook은 "막는 용도"라 병합 같은 실행에 쓰면 확인 없이 돌아간다 |
| 2 | 검증된 방식인가 | PR 만들기까지는 검증됨, 병합은 덧붙인 부분 | Anthropic 공식 플러그인 `commit-commands`의 `/commit-push-pr`이 커밋 → 푸시 → PR을 한 번에 한다. 병합은 하지 않는다. 이 저장소는 CI가 없고 지금도 PR 직후 직접 병합하므로 안전 수준은 지금과 같다 |
| 3 | 사람 확인을 몇 번 둘까 | 1번 (커밋 직전) | 전역 규칙이 커밋·푸시 전 확인을 요구한다. 이때 브랜치 이름, 파일 목록, 커밋 메시지, PR 제목을 한꺼번에 보여 주면 뒤 단계는 새로 결정할 것이 없다 |
| 4 | 확인을 브랜치 만들기 전에 받을까 뒤에 받을까 | 전에 | 거절하면 브랜치도 커밋도 없는 원래 상태 그대로 남는다 |
| 5 | 병합·삭제 명령 | `gh pr merge --merge --delete-branch` | `gh` 2.101.0 도움말에서 로컬·원격 브랜치를 함께 지우는 것을 확인했다. GitHub의 "브랜치 자동 삭제" 설정은 같은 일을 해서 켜지 않는다 |
| 6 | 기존 hook과 충돌하는가 | 충돌 없음, hook은 그대로 둔다 | hook에 가짜 명령을 넣어 시험했다. 흐름에 필요한 명령은 모두 통과하고, `main`에서 브랜치 만들기와 커밋을 한 줄로 묶을 때만 막힌다. 그래서 스킬에 "명령을 하나씩 따로 실행한다"를 적는다 |
| 7 | 권한 요청 창을 미리 없앨까 | 없애지 않는다 | 스킬의 `allowed-tools` 허용은 사용자가 다음 메시지를 보내면 풀린다(공식 문서). 확인에 답하는 순간 풀리므로 커밋 뒤 단계에는 효과가 없다. 대신 처음 쓸 때 권한 창에서 "다시 묻지 않기"를 믿는 명령부터 하나씩 고르면 된다. 전부 허용해도 `main` 차단 hook은 허용 목록보다 먼저 동작한다 |
| 8 | 검사와 리뷰를 넣을까 | 넣되, 문서·설정만 바뀌면 건너뛴다 | CI가 없어 `npm run lint` + `npm run build`가 유일한 검사다. `src/`가 바뀌면 이미 있는 `code-reviewer` 에이전트(`.claude/agents/code-reviewer.md`)를 부른다 |
| 9 | 중간에 실패하면 | 멈추고 보고, 다시 부르면 이어서 | 시작할 때 상태(변경 유무, 브랜치, 열린 PR)를 읽어 어느 단계부터 할지 고른다. 강제 옵션은 쓰지 않는다 |
| 10 | `CLAUDE.md`를 고칠까 | 한 문장 추가 (지난 답변에서 "고치지 않는다"고 한 것을 바꾼다) | `/ship` 대신 "올려 줘"라고 말로 요청하면 Claude가 예전 방식대로 해서 완료 표시 PR이 다시 따로 생긴다. 올리는 순서의 기준을 스킬 파일 하나로 모은다 |

## 바꾸는 파일 (2개)

| 파일 | 내용 |
|---|---|
| `.claude/skills/ship/SKILL.md` (새로 만듦) | `/ship` 스킬 본문 |
| `CLAUDE.md` (한 문장 추가) | 올리는 순서의 기준이 스킬 파일이라는 안내 |

`README.md`는 `.claude/` 안의 내용을 다루지 않아 고치지 않는다. hook, `settings.json`, `settings.local.json`도 고치지 않는다.

### 1. `.claude/skills/ship/SKILL.md`

```markdown
---
name: ship
description: 지금 작업한 변경을 브랜치 → 커밋 → 푸시 → PR → 병합 → 브랜치 삭제까지 한 번에 올린다
disable-model-invocation: true
argument-hint: "[변경 설명 (선택)]"
---

작업 폴더의 변경을 `main`에 올린다. 아래 6단계를 순서대로 실행하고, 사용자 확인은 4단계에서 한 번만 받는다.

사용자가 덧붙인 설명: $ARGUMENTS

## 지킬 것

- 단계가 실패하면 그 자리에서 멈추고 보고한다: 멈춘 단계, 지금 브랜치, 푸시 여부, PR 번호. 원인을 고친 뒤 `/ship`을 다시 부르면 1단계가 상태를 읽고 이어서 진행한다
- 실패를 강제 옵션으로 넘기지 않는다. `--force`, `--no-verify`, `--admin`, `git reset --hard`, `git branch -D`를 쓰지 않는다
- 명령은 하나씩 따로 실행한다. `.claude/hooks/block-main-commit.sh`는 명령 글자에 `git commit`·`git push`가 있으면 `main`에서 막으므로, 브랜치 만들기와 커밋을 `&&`로 묶으면 막힌다

## 1. 상태 확인 (읽기만)

`git status --short`, `git branch --show-current`, `git fetch origin` 뒤 `git log --oneline HEAD..origin/main`과 `git log --oneline origin/main..HEAD`를 본다. 작업 브랜치에 있으면 `gh pr list --head <브랜치> --state open`도 본다.

| 상태 | 할 일 |
|---|---|
| 변경도 없고 올릴 커밋도 없다 | 올릴 것이 없다고 알리고 끝낸다 |
| `main`이 `origin/main`보다 뒤처져 있다 | `git pull --ff-only`로 맞추고 계속한다 |
| `main`에 푸시하지 않은 커밋이 있다 | 멈추고 보고한다 |
| 커밋하지 않은 변경이 있다 | 2단계부터 |
| 작업 브랜치에 커밋만 있고 PR이 없다 | 4단계 확인 뒤 5단계의 푸시부터 |
| 열린 PR이 이미 있다 | 4단계 확인 뒤 5단계의 병합부터 |

## 2. 검사

바뀐 파일이 `.md` 파일과 `.claude/` 아래뿐이면 건너뛴다.

1. `npm run lint`와 `npm run build`를 실행한다. 이 대화에서 마지막 수정 뒤에 둘 다 통과했으면 다시 돌리지 않는다
2. `src/` 아래가 바뀌었으면 `code-reviewer` 에이전트를 부른다. 바뀐 파일 경로, 변경 의도, `git diff` 결과, lint·build 결과를 넘긴다. 결론이 "승인"이 아니면 멈추고 리뷰 내용을 사용자에게 전한다

## 3. 계획 파일

이 작업의 계획 파일이 `plans/`에 있으면 진행 상태(완료한 것, 남은 작업)를 지금 적어 같은 PR에 넣는다. 완료 표시만 담은 PR을 따로 만들지 않는다. PR 번호는 아직 없으므로 적지 않는다.

## 4. 확인 (한 번)

아래를 한 번에 보여 주고 답을 기다린다. 승인 전에는 브랜치를 만들지 않고 커밋도 하지 않는다.

- 브랜치 이름: `feat/…`, `fix/…`, `chore/…` 뒤에 짧은 영어 kebab-case. 이미 작업 브랜치에 있으면 그 이름
- 올릴 파일 목록과 변경 요약. 이 작업과 무관해 보이는 파일은 따로 표시하고 뺄지 묻는다
- 커밋 메시지와 PR 제목 (영어)
- 승인하면 병합과 브랜치 삭제까지 진행한다는 안내

## 5. 올리기

1. `main`에 있으면 `git switch -c <브랜치>`
2. `git add <확인받은 파일>` (`git add -A`, `git add .`은 쓰지 않는다)
3. `git commit`
4. `git push -u origin <브랜치>`
5. `gh pr create --base main` (본문은 영어로 `## Summary`와 `## Testing`)
6. `gh pr merge --merge --delete-branch`

## 6. 마무리 확인과 보고

1. `main`이 아니면 `git switch main`, 이어서 `git pull --ff-only`
2. `gh pr view <번호> --json state,url`이 `MERGED`인지, `git status --short`가 비어 있는지, `git branch --list <브랜치>`와 `git ls-remote --heads origin <브랜치>`가 비어 있는지 본다
3. PR 주소와 결과를 한두 줄로 알린다. 어긋난 것이 있으면 그것을 먼저 적는다
```

### 2. `CLAUDE.md` — 기존 줄 끝에 한 문장 추가

```diff
-- `main`에 바로 커밋하지 않는다. 브랜치(`feat/…`, `fix/…`, `chore/…`) → PR → 병합 커밋(`gh pr merge --merge`) 순서로 올린다. 커밋 메시지와 PR은 영어로 쓴다
+- `main`에 바로 커밋하지 않는다. 브랜치(`feat/…`, `fix/…`, `chore/…`) → PR → 병합 커밋(`gh pr merge --merge`) 순서로 올린다. 커밋 메시지와 PR은 영어로 쓴다. 올려 달라는 요청을 받으면 `.claude/skills/ship/SKILL.md`의 순서를 따른다 (사용자는 `/ship`으로 부른다)
```

## 작업 순서

1. 이 계획 파일 이름을 `plans/2026-10-05-claude-nextjs-ship-skill-plan.md`로 바꾼다 (프로젝트 규칙).
2. `.claude/skills/ship/SKILL.md`를 위 내용으로 만든다.
3. `CLAUDE.md`에 한 문장을 추가한다.
4. 아래 "확인 방법" 1~2번을 실행한다.
5. 이 계획 파일에 진행 상태를 적는다 (같은 PR에 넣기 위해 올리기 전에 적는다).
6. 사용자가 `/reload-skills` → `/ship`을 입력해 이 변경 자체를 올린다 (확인 방법 3~4번).

## 확인 방법

1. **hook 시험 (실행 없음)**: 스킬에 적은 명령 문자열을 `block-main-commit.sh`에 넣어 종료 코드를 본다. `main`에서 `git switch -c`, `git add`, `git pull --ff-only`, `gh pr view`는 0(통과), `git commit`과 `git push`는 2(차단)여야 한다. 지난 점검에서 쓴 시험 스크립트를 scratchpad에서 다시 쓴다.
2. **파일 형식**: `SKILL.md` 맨 위 frontmatter가 `---`로 열리고 닫히는지 본다.
3. **스킬 불러오기**: `.claude/skills/` 폴더가 이번에 처음 생기므로, 공식 문서 안내대로 사용자가 `/reload-skills`를 한 번 입력한다. 그 뒤 `/` 메뉴에 `ship`이 보이는지 확인한다.
4. **실제 실행**: 사용자가 `/ship`을 입력해 이 변경(스킬 파일, `CLAUDE.md`, 계획 파일)을 올린다. 볼 것:
   - 확인이 한 번만 나오고, 승인 전에는 브랜치가 없다
   - PR이 1개만 생기고 계획 파일 진행 상태가 그 안에 들어 있다
   - 끝난 뒤 `main`에 있고, 작업 브랜치가 로컬·원격 모두 없고, `git status`가 깨끗하다

이번 실행은 `.md`와 `.claude/` 파일만 바뀌므로 2단계(lint·build·리뷰)는 건너뛴다. 그 경로는 다음에 `src/` 코드를 고칠 때 처음 확인된다.

## 알아 둘 것

- 스킬은 Claude가 읽고 따르는 설명서라 순서가 프로그램처럼 100% 보장되지는 않는다. `main` 차단 hook, 권한 요청 창, 4단계 확인이 함께 안전망 역할을 한다.
- 처음 실행할 때는 명령마다 권한 요청 창이 뜬다. 믿는 명령부터 "다시 묻지 않기"를 고르면 다음부터 줄어든다.
- `main` 차단 hook은 명령 글자만 보기 때문에 `main`에서 `git commit`이라는 글자가 든 검색 명령도 막는다. `/ship` 흐름과는 무관해 이번에는 고치지 않는다.

## 진행 상태 (2026-10-05)

완료:

- [x] 1단계: 계획 파일 이름을 `plans/2026-10-05-claude-nextjs-ship-skill-plan.md`로 변경
- [x] 2단계: `.claude/skills/ship/SKILL.md` 작성
- [x] 3단계: `CLAUDE.md`에 한 문장 추가
- [x] 4단계: 확인 방법 1~2번 통과
  - hook 시험: 스킬에 적은 명령 21개를 `main`에서 넣어 모두 예상대로 나왔다. `git commit`, `git push`, 브랜치 만들기와 커밋을 `&&`로 묶은 명령 3개는 종료 코드 2(차단), 나머지 18개는 0(통과)
  - `SKILL.md` frontmatter가 `---`로 열리고 닫히는 것을 확인
- [x] 5단계: 이 진행 상태 작성
- [x] 6단계: `/reload-skills` 뒤 `/ship`으로 이 변경을 올림 (이 파일이 든 PR)

남은 작업:

- `/ship`의 2단계(lint·build·`code-reviewer`)는 이번 변경이 `.md`와 `.claude/` 파일뿐이라 실행되지 않았다. 다음에 `src/` 코드를 고쳐 올릴 때 처음 확인한다
