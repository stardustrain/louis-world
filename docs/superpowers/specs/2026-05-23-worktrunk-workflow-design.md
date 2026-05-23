# Worktrunk 워크플로 설계

작성일: 2026-05-23

## 목적

이 저장소에 공유 Worktrunk 프로젝트 워크플로를 추가한다.

새 worktree를 빠르게 사용할 수 있게 만들고, `wt merge` 전에 README에
문서화된 품질 검증 의도를 로컬에서 강제한다.

## 현재 맥락

이 저장소는 `apps/game` 앱 하나를 가진 pnpm workspace다.

관련 루트 스크립트는 다음과 같다.

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

README는 변경 제출 전 `pnpm check` 통과를 요구한다. Worktrunk는 같은 의도를
`wt merge` 중 로컬에서 강제할 수 있다. 다만 실패 원인을 읽기 쉽게 하기 위해
검증 단계는 여러 명령으로 나눈다.

현재 `.config/wt.toml` 프로젝트 설정은 없다.

## 결정 사항

- 공유 프로젝트 설정 파일로 `.config/wt.toml`을 추가한다.
- 사용자별 Worktrunk 설정은 저장소에 넣지 않는다.
- 새 worktree 생성 시 반드시 끝나야 하는 준비 작업은 `pre-start`에 둔다.
- gitignored 파일 복사는 `post-start`에 둬서 백그라운드로 실행한다.
- merge 검증은 다음처럼 나눈다.
  - `pre-commit`: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`
  - `pre-merge`: `pnpm test`, `pnpm build`
- `pre-*` 훅은 Worktrunk 권장 pipeline 형식인 `[[pre-start]]`,
  `[[pre-commit]]`, `[[pre-merge]]`를 사용한다.
- 수동 전체 검증용 공유 alias로 `verify = "pnpm check"`를 추가한다.
- LLM 커밋 메시지 생성 설정은 추가하지 않는다.

## 하지 않을 것

- 이번 프로젝트 설정 변경에서 `~/.config/worktrunk/config.toml`은 편집하지
  않는다.
- 사용자를 대신해 Worktrunk 훅을 승인하지 않는다.
- 승인 prompt를 피하려고 `wt merge --yes`, `wt switch --yes`,
  `wt hook --yes`를 임의로 실행하지 않는다.
- 아직 dev server 자동 실행은 추가하지 않는다.
- LLM 커밋 메시지 생성 설정이나 prompt 지침은 추가하지 않는다.
- package script나 애플리케이션 코드는 바꾸지 않는다.

## 프로젝트 설정 형태

`.config/wt.toml`은 다음 역할을 가진다.

```toml
# 새 worktree를 사용자에게 넘기기 전에 의존성을 설치한다.
[[pre-start]]
deps = "pnpm install"

# worktree 생성 후 gitignored 파일을 복사해 cold start를 줄인다.
[post-start]
copy_ignored = "wt step copy-ignored"

# Worktrunk가 merge commit을 만들기 전에 빠른 정적 검사를 실행한다.
[[pre-commit]]
lint = "pnpm lint"
format = "pnpm format:check"
typecheck = "pnpm typecheck"

# target branch로 merge하기 전에 테스트와 production build를 검증한다.
[[pre-merge]]
test = "pnpm test"
build = "pnpm build"

[aliases]
verify = "pnpm check"
```

`pnpm install`은 `pre-start`에서 실행한다. 그래야 새 worktree가 후속 명령이나
에이전트에 넘어가기 전에 의존성을 가진 상태가 된다.

`wt step copy-ignored`는 유용하지만 navigation을 오래 막을 필요는 없으므로
`post-start`에서 백그라운드로 실행한다.

## Merge 검증

`wt merge`는 squash commit 생성 전 `pre-commit`을 실행하고, rebase 후 target
branch에 merge하기 전 `pre-merge`를 실행한다.

먼저 실행할 빠른 정적 검사는 다음과 같다.

- `pnpm lint`: lint 실패를 잡는다.
- `pnpm format:check`: formatting drift를 잡는다.
- `pnpm typecheck`: TypeScript 오류를 잡는다.

merge 직전에 실행할 runtime/build 검증은 다음과 같다.

- `pnpm test`: Vitest suite를 실행한다.
- `pnpm build`: TypeScript와 Vite production build를 검증한다.

전체 의도는 `pnpm check`와 같지만, 어느 단계에서 실패했는지 더 쉽게 볼 수
있도록 나눈다.

## 승인과 보안

Worktrunk는 프로젝트가 정의한 hook과 alias를 실행하기 전에 승인을 요구한다.
이 승인은 각 개발자가 로컬에서 내려야 하는 trust decision이다.

첫 사용 시 예상 흐름은 다음과 같다.

```bash
wt config approvals add
```

에이전트는 승인 prompt를 우회하기 위해 사용자를 대신해 `wt merge --yes`,
`wt switch --yes`, `wt hook --yes`를 실행하지 않는다.

## 검증 계획

구현 후 다음을 확인한다.

- `.config/wt.toml`이 존재한다.
- `wt hook show`로 Worktrunk가 설정된 hook을 읽는지 확인한다.
- 사용자가 일회성 승인 우회를 명시적으로 허용한 경우에만
  `wt hook pre-commit --yes`로 정적 검사를 검증한다.
- 그렇지 않으면 사용자에게 `wt config approvals add`로 hook을 승인하게 한 뒤
  `wt hook pre-commit`을 실행한다.
- `pnpm check`를 직접 실행해 저장소의 문서화된 전체 검증이 계속 통과하는지
  확인한다.
