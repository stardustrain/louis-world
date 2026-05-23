# Louis World

Louis World는 Phaser, Vite, TypeScript로 만드는 브라우저 기반 2D 게임입니다.
현재 저장소는 게임 앱 하나를 가진 pnpm workspace이며, 이후 React UI나 공유
패키지가 필요해질 때 확장할 수 있도록 경계를 작게 잡아 둔 상태입니다.

이 문서는 기여자가 로컬 환경을 준비하고, 변경 범위를 정하고, 검증한 뒤 제출하는
데 필요한 내용을 빠르게 확인하기 위한 안내서입니다.

## 빠른 시작

필요한 도구:

- Node.js `24.x`
- pnpm `11.2.2`
- Git
- `fnm` 사용 권장 (`.node-version`은 `24.16.0`을 가리킵니다)

처음 받았을 때:

```bash
fnm use
pnpm install
pnpm check
```

개발 서버 실행:

```bash
pnpm dev
```

Vite가 출력하는 로컬 주소를 브라우저에서 열면 됩니다. 기본 포트는
`http://localhost:5173/`입니다.

## 프로젝트 구조

```text
.
├── apps/
│   └── game/
│       ├── index.html
│       ├── public/assets/
│       │   ├── audio/
│       │   ├── images/
│       │   ├── tilemaps/
│       │   └── tilesets/
│       └── src/
│           ├── main.ts
│           ├── style.css
│           ├── game/
│           │   ├── config.ts
│           │   ├── createGame.ts
│           │   ├── objects/
│           │   ├── scenes/
│           │   ├── systems/
│           │   └── utils/
│           └── test/
├── packages/
├── package.json
└── pnpm-workspace.yaml
```

`apps/game`이 현재 유일한 앱입니다. `packages/`는 나중에 실제 공유 코드가
필요해질 때 사용합니다. 한 번만 쓰이는 코드를 미리 패키지로 분리하지 마세요.

## 주요 명령어

루트에서 실행합니다.

```bash
pnpm dev            # 게임 앱 개발 서버
pnpm build          # 타입 검사 후 Vite production build
pnpm preview        # build 결과 preview
pnpm test           # Vitest
pnpm typecheck      # TypeScript 검사
pnpm lint           # oxlint
pnpm format         # oxfmt로 포맷 적용
pnpm format:check   # 포맷 검사
pnpm check          # lint, format, typecheck, test, build 전체 검증
```

변경을 제출하기 전에는 `pnpm check`가 통과해야 합니다.

## 개발 원칙

- 요청된 문제만 해결합니다. 추측성 기능, 설정, 추상화는 추가하지 마세요.
- 기존 파일의 스타일과 경계를 따릅니다.
- 변경한 코드에는 그 변경을 검증하는 테스트를 같이 두는 것을 기본으로 합니다.
- unrelated cleanup은 피합니다. 발견한 문제는 PR 설명이나 이슈로 남기고,
  현재 변경과 직접 관련된 부분만 수정하세요.
- 큰 변경은 여러 작은 PR로 나눕니다.

## Phaser 코드 경계

Phaser 관련 코드는 `apps/game/src/game` 아래에 둡니다.

- `config.ts`: Phaser game config와 게임 크기 상수
- `createGame.ts`: DOM 컨테이너 조회와 Phaser.Game 생성
- `scenes/`: scene 클래스
- `objects/`: gameplay object
- `systems/`: gameplay system
- `utils/`: 게임 로직용 작은 유틸리티

Scene이나 gameplay object 안에 DOM 접근을 흩뿌리지 마세요. 나중에 React UI가
추가될 수 있으므로, UI와 게임 사이의 통신은 명시적인 이벤트나 작은 adapter
함수로 연결하는 방향을 선호합니다.

초기 scene 흐름은 다음과 같습니다.

```text
BootScene -> PreloaderScene -> GameScene
```

공용 asset loading은 `PreloaderScene`에 두고, 특정 scene에만 필요한 asset은
그 scene이 소유하게 하세요.

## Asset 위치

정적 게임 asset은 `apps/game/public/assets` 아래에 둡니다.

- `images/`: 일반 이미지
- `audio/`: 효과음, 배경음
- `tilemaps/`: Tiled JSON map
- `tilesets/`: tileset 이미지

아직 샘플 Tiled map이나 실제 게임 asset은 없습니다. asset을 추가할 때는 어떤
scene이나 system이 소유하는지 같이 명확히 해 주세요.

## 테스트 작성

현재 테스트는 Vitest와 jsdom을 사용합니다.

```bash
pnpm test
pnpm --filter @louis-world/game test:watch
```

권장 방식:

- 버그 수정은 먼저 실패하는 테스트로 재현합니다.
- 새 gameplay behavior는 가능한 한 Phaser scene 전체보다 작은 단위로 검증합니다.
- Phaser import가 jsdom의 canvas 기능을 건드릴 수 있으므로, 테스트 환경 보정은
  `apps/game/src/test/setup.ts`에 모읍니다.

## 기여 흐름

1. 관련 이슈나 기존 작업이 있는지 먼저 확인합니다.
2. `main`에서 새 branch나 worktree를 만듭니다.
3. 작은 단위로 변경하고, 변경 범위에 맞는 테스트를 실행합니다.
4. 제출 전 루트에서 `pnpm check`를 실행합니다.
5. PR 설명에는 목적, 주요 변경점, 실행한 검증 명령을 적습니다.

PR에는 다음 내용을 포함해 주세요.

```md
## Summary

- 무엇을 바꿨는지
- 왜 필요한지

## Test Plan

- [ ] pnpm check
```

## Commit 메시지

명령형의 짧은 메시지를 사용합니다.

예시:

```text
feat: add player movement system
fix: handle missing game container
test: cover scene transition keys
docs: document asset workflow
chore: update workspace tooling
```

## 문서와 설계 기록

큰 방향이나 구조 결정은 `docs/superpowers/specs/`에 설계 문서로 남깁니다.
구현 계획이 필요한 작업은 `docs/superpowers/plans/`에 계획을 둡니다.

설계 문서와 계획 문서는 구현과 분리해서 읽을 수 있어야 합니다. 구현 세부사항이
바뀌면 문서도 같이 업데이트하세요.

## 라이선스

현재 저장소에는 별도 `LICENSE` 파일이 없습니다. 외부로 배포하거나 외부 asset을
추가하기 전에 라이선스 조건을 먼저 정해야 합니다.
