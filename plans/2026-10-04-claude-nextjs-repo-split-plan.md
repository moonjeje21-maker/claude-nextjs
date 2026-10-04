# claude-nextjs 별도 저장소 분리 계획

## Context (왜 하는가)

스타터 킷(`claude-nextjs/`)은 지금 `workspace1` 저장소 안에 커밋되어 있다 (c9d11d7, 6788134).
`friends-fortune/`처럼 **독립된 git 저장소**로 분리해서, 스타터 킷만 따로 복제(clone)해 쓸 수 있게 한다.
사용자 결정: 새 GitHub 저장소 `moonjeje21-maker/claude-nextjs`, **공개(public)**.

> 용어: 저장소(repository) = 파일과 변경 기록을 함께 보관하는 곳. `git init` = 폴더를 새 저장소로 만드는 명령.

## 단계

### 1단계. claude-nextjs를 새 저장소로 만들고 초기 커밋
- `claude-nextjs/` 안에서 `git init -b main`
- `git add .` (`.gitignore` 덕분에 `node_modules`, `.next`는 빠짐) → 파일 목록 확인
- 커밋 메시지: `Initial commit: Next.js starter kit (Next 16, Tailwind 4, shadcn/ui, lucide-react)`
  - 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- 변경 기록은 새로 시작한다 (workspace1의 이전 기록은 workspace1에 그대로 남음)

### 2단계. GitHub 저장소 만들고 푸시
- `gh repo create moonjeje21-maker/claude-nextjs --public --source=. --remote=origin`
- `git push -u origin main`

### 3단계. workspace1에서 추적 해제 (friends-fortune과 같은 방식)
- `workspace1/.gitignore`에 추가 (기존 friends-fortune 항목 아래):
  ```
  # 별도 저장소라 workspace1에서는 추적하지 않음
  friends-fortune/
  claude-nextjs/
  ```
- `git rm -r --cached claude-nextjs` → 내 컴퓨터의 파일은 그대로 두고, workspace1의 추적 목록에서만 뺀다
- 커밋 메시지: `Move claude-nextjs to its own repository` → workspace1 `main`에 푸시
- `workspace1/CLAUDE.md`(추적 안 된 파일)는 이번에도 건드리지 않는다

### 4단계. 문서 정리
- `claude-nextjs/CLAUDE.md`에 "이 폴더는 별도 저장소 (github.com/moonjeje21-maker/claude-nextjs), git 명령은 이 폴더 안에서" 한 줄 추가 → 1단계 커밋에 포함
- 이 계획을 `claude-nextjs/plans/2026-10-04-claude-nextjs-repo-split-plan.md`로 저장하고 완료 상태를 적는다 → 1단계 커밋에 포함
- 홈 폴더 `~/CLAUDE.md`의 Git 주의("friends-fortune은 별도 저장소…")에 claude-nextjs도 추가 → 이건 `home-config` 저장소라 **파일만 고치고 커밋은 따로 물어본다**

## 커밋·푸시 전 확인
- 사용자 규칙에 따라 1단계·3단계 커밋 전, 그리고 푸시 전에 **파일 목록과 요약을 보여 주고 확인을 받는다**.

## 검증
- `git -C claude-nextjs log --oneline` → 초기 커밋 1개, `git -C claude-nextjs remote -v` → 새 GitHub 주소
- `gh repo view moonjeje21-maker/claude-nextjs` → 공개 저장소, 파일 보임
- `git -C workspace1 status` → claude-nextjs가 목록에 안 나옴, `ls claude-nextjs/src` → 파일 그대로 있음
- `npm run dev`가 계속 정상 동작 (http://localhost:3000 응답 200)
