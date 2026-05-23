# AGENTS.md

`apps/game`용 게임 앱 지침입니다.

## 적용 범위

- 이 파일은 전체 `apps/game` 앱에 적용됩니다.
- 더 구체적인 중첩 지침이 우선합니다. `src` 아래 소스 파일을 다룰 때는
  `src/AGENTS.md`도 읽으세요.
- 이 앱은 Phaser + Vite + TypeScript 게임 형태를 유지하세요. 작업에서
  명시적으로 요구하지 않는 한 React, 라우팅, 앱 셸 상태, 공유 패키지를
  도입하지 마세요.

## 폴더별 책임

- `index.html`: HTML 호스트 페이지와 게임 컨테이너.
- `public/assets`: Vite가 직접 제공하고 Phaser가 `assets/...` 경로로 로드하는 정적 런타임 에셋.
- `public/assets/images`: 이미지 파일.
- `public/assets/audio`: 효과음과 음악.
- `public/assets/tilemaps`: Tiled JSON 파일 같은 타일맵 데이터.
- `public/assets/tilesets`: 타일셋 이미지.
- `src/main.ts`: 앱 부트스트랩. 전역 CSS를 import하고 Phaser 게임을 생성하는 정도로 작게 유지하세요.
- `src/style.css`: 페이지와 캔버스 레이아웃 스타일만 둡니다. 게임플레이 상태나 씬별 동작을 여기에 넣지 마세요.
- `src/game/config.ts`: Phaser 게임 설정, 논리 크기, 물리 기본값, 스케일 모드, 씬 등록.
- `src/game/createGame.ts`: DOM 컨테이너 조회와 `Phaser.Game` 생성.
- `src/game/scenes`: Phaser 씬 클래스. 명확한 씬 소유권과 안정적인 씬 키를 유지하세요.
- `src/game/objects`: 재사용 가능한 게임플레이 객체.
- `src/game/systems`: 동작을 조율하는 게임플레이 시스템 또는 매니저.
- `src/game/utils`: 작은 게임 전용 헬퍼.
- `src/test`: 테스트 설정과 환경 shim.
- `dist`: 생성된 빌드 출력. 직접 수정하지 마세요.

## Phaser 및 Vite 규칙

- Phaser Vite 템플릿의 경계를 따르세요. `index.html`은 게임을 호스팅하고, `public/assets`는 정적 런타임 에셋을 담으며, `src/game`은 Phaser 코드를 소유합니다.
- 공유 게임 에셋은 `PreloaderScene`에서 로드하는 것을 선호하세요. 한 씬만 소유하는 에셋은 해당 씬에서 로드해도 됩니다.
- DOM 접근은 부트스트랩 근처나 작은 어댑터 함수에 두세요. 씬, 객체, 시스템 전반에 DOM 읽기나 쓰기를 흩뿌리지 마세요.
- Phaser 게임 로직은 향후 프레임워크 UI와 독립적으로 유지하세요. 미래의 UI가 게임 상태를 필요로 한다면 명시적 이벤트나 좁은 어댑터 함수를 선호하세요.
- 게임 크기 상수, 물리 기본값, 씬 키, 씬 순서, 부트스트랩 동작을 변경할 때는 테스트를 업데이트하세요.

## 변경 원칙

- 기존 구조에 맞는 외과적인 변경만 하세요.
- 추측성 폴더, 추상화, 로더, 에셋 파이프라인, 프레임워크 통합을 추가하지 마세요.
- 새 게임플레이 코드는 역할에 맞는 가장 좁은 기존 폴더에 넣으세요.
- 어떤 동작을 전체 Phaser 씬 밖에서 테스트할 수 있다면 더 작은 테스트 경계를 선호하세요.

## 검증

작업에서 달리 지시하지 않는 한 저장소 루트에서 명령을 실행하세요.

- `pnpm --filter @louis-world/game typecheck`
- `pnpm --filter @louis-world/game test`
- `pnpm --filter @louis-world/game build`
- 더 넓은 변경을 제출하기 전에는 `pnpm check`를 실행하세요.
