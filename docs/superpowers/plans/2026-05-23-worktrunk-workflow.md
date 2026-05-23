# Worktrunk Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `.config/wt.toml`을 추가해 새 worktree 초기 세팅과 `wt merge` 검증을 공유 프로젝트 설정으로 관리한다.

**Architecture:** Worktrunk 프로젝트 설정은 단일 TOML 파일인 `.config/wt.toml`에 둔다. `pre-*` 훅은 Worktrunk 권장 pipeline 형식을 사용하고, `post-start`는 백그라운드 table 형식으로 둔다. LLM 커밋 메시지 생성 설정은 포함하지 않는다.

**Tech Stack:** Worktrunk `wt`, TOML, pnpm `11.2.2`, Node `24.x`

---

## 파일 구조

- Create: `.config/wt.toml`
  - Worktrunk 프로젝트 hook과 alias를 정의한다.
  - 새 worktree 생성 시 `pnpm install`을 blocking으로 실행한다.
  - 새 worktree 생성 후 `wt step copy-ignored`를 background로 실행한다.
  - `wt merge` 중 static check와 runtime/build check를 나누어 실행한다.
  - 수동 전체 검증 alias로 `verify = "pnpm check"`를 제공한다.
- Modify: 없음
- Test: Worktrunk CLI와 기존 pnpm scripts를 직접 실행해 검증한다.

커밋은 사용자가 직접 처리한다.

### Task 1: Worktrunk 프로젝트 설정 추가

**Files:**
- Create: `.config/wt.toml`

- [ ] **Step 1: 현재 설정 부재 확인**

Run:

```bash
wt hook show
```

Expected:

```text
PROJECT HOOKS @ ~/workspace/louis-world/.config/wt.toml
↳ (not found)
```

- [ ] **Step 2: `.config/wt.toml` 생성**

Create `.config/wt.toml` with exactly this content:

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

- [ ] **Step 3: Worktrunk가 hook을 읽는지 확인**

Run:

```bash
wt hook show
```

Expected output includes:

```text
PROJECT HOOKS @ ~/workspace/louis-world/.config/wt.toml
```

Expected output also lists these project commands:

```text
pre-start deps:
pnpm install

post-start copy_ignored:
wt step copy-ignored

pre-commit lint:
pnpm lint

pre-commit format:
pnpm format:check

pre-commit typecheck:
pnpm typecheck

pre-merge test:
pnpm test

pre-merge build:
pnpm build
```

- [ ] **Step 4: 수동 alias 인식 확인**

Run:

```bash
wt config alias show
```

Expected output includes:

```text
verify
pnpm check
```

If `wt config alias show` is not supported by the installed Worktrunk version, run:

```bash
wt config --help
```

Expected: `alias` appears in the `wt config` subcommands list.

### Task 2: 설정 검증

**Files:**
- Verify: `.config/wt.toml`

- [ ] **Step 1: 위험한 command가 없는지 확인**

Run:

```bash
rg -n "rm -rf|sudo|curl |DROP TABLE" .config/wt.toml
```

Expected: no output, exit code `1`.

- [ ] **Step 2: 기존 전체 검증 명령 실행**

Run:

```bash
pnpm check
```

Expected: exit code `0`.

- [ ] **Step 3: hook 실행 승인 방식 결정**

Do not run `wt hook --yes` unless the user explicitly approves the one-shot bypass.

Preferred local flow:

```bash
wt config approvals add
wt hook pre-commit
wt hook pre-merge
```

Expected:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Each command exits with code `0`.

- [ ] **Step 4: 변경 상태 확인**

Run:

```bash
git status --short
```

Expected output includes:

```text
?? .config/wt.toml
```

Existing unrelated untracked files, such as `.pnpm-store/`, may still appear and should not be changed.
