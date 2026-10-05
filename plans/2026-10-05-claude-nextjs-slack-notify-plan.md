# Claude Code → 슬랙 모바일 알림 설정 계획

## Context (왜 하는가)

Claude Code가 작업하는 동안 자리를 비우면, 권한을 물어보고 멈춰 있거나 작업이 끝난 것을 모르고 지나친다. 아래 두 경우에 슬랙으로 메시지를 보내 휴대폰에서 알림을 받게 한다.

1. Claude Code가 **권한을 요청할 때**
2. **작업이 완료되었을 때** (30초 이상 걸린 작업만)

정한 내용: 적용 범위는 **claude-nextjs 프로젝트만**, 웹훅 주소는 **이미 받음**, 완료 알림은 **30초 이상 걸린 작업만**.

## 용어 설명

- **hook(훅)**: Claude Code에서 특정한 일이 일어날 때 자동으로 실행되는 명령.
- **슬랙 Incoming Webhook(웹훅)**: 슬랙이 발급한 주소. 이 주소로 글을 보내면 정해 둔 채널에 메시지가 올라온다. 주소를 아는 사람은 누구나 그 채널에 글을 쓸 수 있으므로 **비밀번호처럼 다룬다.**
- **settings.local.json**: 이 프로젝트에서 나만 쓰는 Claude Code 설정 파일. git이 무시하므로 GitHub에 올라가지 않는다 (확인함).

## 동작 방식

```
[프롬프트 입력]  → UserPromptSubmit                → 시작 시각을 임시 파일에 기록 (전송 없음)
[권한 요청]      → Notification(permission_prompt) → 슬랙 "🔐 [claude-nextjs] 권한 요청 — …"
[응답 완료]      → Stop                            → 30초 이상 걸렸으면 슬랙 "✅ [claude-nextjs] 작업 완료 (2분 13초)"
```

세 hook이 같은 스크립트 하나를 실행하고, 스크립트는 Claude Code가 넘겨주는 JSON의 `hook_event_name`을 보고 할 일을 고른다.

## 만들거나 고치는 파일 (3개)

| 파일 | 내용 | git |
|---|---|---|
| `~/.claude/slack-webhook-url` (새로 만듦) | 웹훅 주소 한 줄, 권한 `600`(나만 읽기) | 저장소 밖 |
| `~/.claude/hooks/slack-notify.sh` (새로 만듦) | 슬랙으로 보내는 스크립트 (약 25줄) | 저장소 밖 |
| `claude-nextjs/.claude/settings.local.json` (수정) | `hooks` 항목 추가, 기존 내용 유지 | git이 무시 |

웹훅 주소와 스크립트를 프로젝트 밖에 두므로 비밀 주소가 커밋될 일이 없고, 추적되는 파일이 바뀌지 않아 브랜치·PR이 필요 없다. 알림 범위는 `hooks`를 등록한 위치(이 프로젝트의 settings.local.json)가 정한다.

## 단계별 작업

### 1단계. 계획 파일 이름 바꾸기

이 파일을 `plans/2026-10-05-claude-nextjs-slack-notify-plan.md`로 바꾼다 (프로젝트 규칙). **웹훅 주소는 이 파일에 적지 않는다.**

### 2단계. 웹훅 주소 저장

대화에서 받은 주소를 `~/.claude/slack-webhook-url`에 한 줄로 저장하고 `chmod 600`(나만 읽을 수 있게)을 적용한다.

### 3단계. 스크립트 작성 — `~/.claude/hooks/slack-notify.sh`

```bash
#!/bin/bash
# Claude Code 알림을 슬랙으로 보내는 hook 스크립트
MIN_SECONDS=30  # 이 시간(초) 이상 걸린 작업만 완료 알림을 보낸다

# Claude Code가 표준 입력으로 넘겨주는 JSON을 읽는다
input=$(cat)
event=$(jq -r '.hook_event_name' <<<"$input")
project=$(basename "$(jq -r '.cwd' <<<"$input")")
start_file="${TMPDIR:-/tmp}/claude-slack-notify-$(jq -r '.session_id' <<<"$input")"

case "$event" in
  UserPromptSubmit)  # 작업 시작 시각만 적어 둔다 (아무것도 출력하지 않는다)
    date +%s > "$start_file"
    exit 0 ;;
  Notification)      # 권한 요청
    text="🔐 [$project] 권한 요청 — $(jq -r '.message' <<<"$input")" ;;
  Stop)              # 응답 완료: 오래 걸린 작업만 알린다
    [ -f "$start_file" ] || exit 0
    elapsed=$(( $(date +%s) - $(cat "$start_file") ))
    [ "$elapsed" -ge "$MIN_SECONDS" ] || exit 0
    text="✅ [$project] 작업 완료 ($((elapsed / 60))분 $((elapsed % 60))초)" ;;
  *) exit 0 ;;
esac

# 웹훅 주소 파일이 없으면 조용히 끝낸다
url=$(cat ~/.claude/slack-webhook-url 2>/dev/null) || exit 0
jq -n --arg text "$text" '{text: $text}' |
  curl -s -m 10 -H 'Content-Type: application/json' -d @- "$url" >/dev/null
exit 0
```

- `jq -n --arg`로 JSON을 만들기 때문에 메시지에 따옴표나 줄바꿈이 있어도 깨지지 않는다.
- 어떤 경우에도 종료 코드 0으로 끝나므로 슬랙 전송이 실패해도 Claude Code 작업을 막지 않는다.
- `UserPromptSubmit`에서 아무것도 출력하지 않는 이유: 이 hook의 출력은 Claude의 대화 맥락에 들어가기 때문이다.

### 4단계. 스크립트 단독 시험 (hook 등록 전)

가짜 JSON을 넣어 슬랙에 실제로 오는지 본다.

```bash
# 권한 요청 알림 → 슬랙에 도착해야 한다
echo '{"hook_event_name":"Notification","message":"테스트: Bash 권한 필요","session_id":"test","cwd":"/Users/ky.moon/workspace1/claude-nextjs"}' | bash ~/.claude/hooks/slack-notify.sh; echo "exit=$?"

# 시작 기록 직후의 Stop → 30초 미만이라 오지 않아야 한다
echo '{"hook_event_name":"UserPromptSubmit","session_id":"test","cwd":"/Users/ky.moon/workspace1/claude-nextjs"}' | bash ~/.claude/hooks/slack-notify.sh
echo '{"hook_event_name":"Stop","session_id":"test","cwd":"/Users/ky.moon/workspace1/claude-nextjs"}' | bash ~/.claude/hooks/slack-notify.sh; echo "exit=$?"

# 시작 시각을 40초 전으로 바꾼 뒤의 Stop → "작업 완료 (0분 40초)"가 와야 한다
echo $(( $(date +%s) - 40 )) > "${TMPDIR:-/tmp}/claude-slack-notify-test"
echo '{"hook_event_name":"Stop","session_id":"test","cwd":"/Users/ky.moon/workspace1/claude-nextjs"}' | bash ~/.claude/hooks/slack-notify.sh; echo "exit=$?"
```

### 5단계. hook 등록 — `.claude/settings.local.json`

기존 `permissions`, `enabledMcpjsonServers`, `enableAllProjectMcpServers`는 그대로 두고 `hooks`만 더한다.

```json
"hooks": {
  "UserPromptSubmit": [
    { "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/slack-notify.sh" }] }
  ],
  "Notification": [
    {
      "matcher": "permission_prompt",
      "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/slack-notify.sh", "async": true }]
    }
  ],
  "Stop": [
    { "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/slack-notify.sh", "async": true }] }
  ]
}
```

- `matcher: "permission_prompt"`: 여러 알림 종류 가운데 권한 요청만 고른다.
- `async: true`: 슬랙 전송을 뒤에서 실행해 Claude Code가 기다리지 않게 한다.
- 등록 후 `jq`로 JSON 문법을 검사한다 (JSON이 깨지면 그 파일의 설정 전체가 조용히 무시된다).

### 6단계. 실제 동작 확인 + 휴대폰 설정

1. **권한 요청**: Claude가 허용 목록에 없는 명령을 실행해 권한 창을 띄운다 → "🔐 권한 요청" 도착.
2. **긴 작업**: 35초쯤 걸리는 작업(`sleep 35`)을 시킨다 → "✅ 작업 완료 (0분 35초)" 도착.
3. **짧은 작업**: 짧은 질문을 한다 → 알림이 오지 않는다.
4. **휴대폰 푸시**: 위 메시지가 휴대폰에 푸시로 뜨는지 본다. 채널에는 올라오는데 푸시가 없으면 슬랙에서 아래를 바꾼다 (사용자가 직접).
   - 해당 채널 → 채널 이름 → 알림 → **"모든 새 메시지"**
   - 나 → 알림 → 모바일 알림 시점을 **"즉시"**로 (컴퓨터에서 슬랙이 켜져 있어도 받기)
5. 알림이 아예 안 오면 Claude Code에서 `/hooks`를 한 번 열어 설정을 다시 읽게 한 뒤, 4단계 명령을 직접 실행해 오류를 본다.

### 7단계. 마무리

이 계획 파일에 완료 상태와 남은 작업을 적는다. 추적되는 파일은 바뀌지 않으며, 새로 생기는 계획 파일은 요청하면 브랜치 → PR로 올린다 (올리기 전에 내용을 먼저 보여 준다).

## 끄는 방법

`settings.local.json`의 `hooks` 항목을 지운다. 잠깐만 끄려면 `~/.claude/slack-webhook-url` 파일 이름을 바꾼다 (스크립트가 조용히 끝난다).

## 간결화 검토 (첫 설계에서 뺀 것)

| 뺀 것 | 이유 |
|---|---|
| 응답 미리보기 200자, `PREVIEW_CHARS` 설정값 | 요청은 "알림"이었다. 빼면 글자 자르기, 슬랙 특수문자 처리, 민감 내용 전송 걱정이 함께 없어진다 |
| 실패 로그 파일 | 문제가 생기면 4단계 명령을 직접 실행하면 된다 |
| hook별 `timeout` | `curl -m 10`이 10초에서 스스로 끊는다 |
| 임시 폴더 만들기 | 세션마다 파일 하나로 충분하다 |
| 나중에 바꿀 수 있는 방법 안내 | 지금 하지 않을 일이다 |

유지한 것과 이유:

- **hook 3개**: `Stop`에는 걸린 시간이 들어 있지 않아, 시작 시각을 적는 `UserPromptSubmit`이 있어야 "30초 이상"을 판단할 수 있다. 세 hook은 서로 다른 순간에 실행되어 겹치지 않는다.
- **웹훅 주소를 별도 파일에**: 한 줄 비용으로 스크립트에 비밀값이 남지 않는다.
- **`async: true`**: 슬랙이 느릴 때 Claude Code가 기다리지 않는다.

## 알아 둘 점

- 사용자가 Esc로 중단하면 `Stop`이 실행되지 않아 완료 알림이 없다.
- 걸린 시간에는 권한 창에서 답을 기다린 시간도 포함된다.
- hook을 등록한 직후의 첫 응답은 시작 기록이 없어 완료 알림이 오지 않는다. 다음 프롬프트부터 정상 동작한다.
- 웹훅 주소는 이 컴퓨터의 Claude Code 대화 기록에도 남아 있다. 주소가 밖으로 새었다고 의심되면 슬랙에서 새로 발급받아 `~/.claude/slack-webhook-url`만 바꾸면 된다.

## 진행 상태 (2026-10-05)

완료:

- [x] 1단계: 계획 파일 이름 변경
- [x] 2단계: 웹훅 주소를 `~/.claude/slack-webhook-url`에 저장 (권한 600)
- [x] 3단계: `~/.claude/hooks/slack-notify.sh` 작성
- [x] 4단계: 스크립트 단독 시험 통과 — 웹훅 응답 HTTP 200, 권한 요청·40초 완료 메시지 전송, 30초 미만 완료와 시작 기록 없는 완료는 전송하지 않음, 모든 경우 종료 코드 0·출력 없음
- [x] 5단계: `.claude/settings.local.json`에 hook 3개 등록, `jq` 검사 통과, 기존 설정 유지

- [x] 6단계: 실제 hook 동작 확인 (스크립트에 임시 기록 줄을 넣어 확인한 뒤 원본으로 되돌림)
  - `UserPromptSubmit`: 프롬프트를 입력하면 시작 시각 파일이 만들어진다
  - `Notification`: 실제 권한 창이 떴을 때 `permission_prompt` 이벤트가 오고 슬랙이 HTTP 200으로 응답했다 (메시지 내용은 "Claude needs your permission")
  - `Stop`: 실제 응답이 끝났을 때 이벤트가 오고 슬랙이 HTTP 200으로 응답했다

시험하며 알게 된 점:

- **auto 모드**(안전하다고 판단한 명령을 묻지 않고 실행하는 모드)에서는 권한 창이 거의 뜨지 않아 권한 요청 알림도 드물다. 시험할 때는 `permissions.ask` 규칙을 잠깐 넣어 권한 창을 띄웠고, 시험 후 지웠다.
- 뒤에서 돌던 작업이 끝나 Claude가 다시 호출될 때도 `UserPromptSubmit`이 실행되어 시작 시각이 새로 적힌다.

남은 작업 (사용자 확인 필요):

- [x] 휴대폰에 푸시가 뜨는지 (2026-10-05 사용자가 휴대폰에서 확인)
- [x] 이 계획 파일 커밋 (PR #8로 병합, 작업 브랜치 삭제)
