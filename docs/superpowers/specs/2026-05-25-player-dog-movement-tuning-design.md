# 플레이어와 강아지 이동 튜닝 설계

작성일: 2026-05-25

## 목적

플레이어 이동 속도를 조금 높여 마당 이동의 답답함을 줄이고, 강아지가 그 변화에
맞춰 자연스럽게 따라오게 한다.

이번 작업은 강아지 AI 확장이 아니다. 이미 구현된 직선 따라오기 시스템의 수치만
조정해, 플레이어가 더 빠르게 움직여도 강아지가 뒤처진 오브젝트처럼 느껴지지
않게 하는 것이 목표다.

## 정본 문맥

`docs/game/vision.md`는 강아지가 살아있는 존재처럼 느껴져야 한다고 정의한다.
`docs/game/characters.md`는 강아지의 감정을 이동, 거리감, 반응 속도, 자세 같은
행동으로 표현한다고 정의한다.

이번 튜닝은 다음 방향을 따른다.

- 플레이어 이동은 기존보다 조금 가볍고 빠르게 느껴져야 한다.
- 강아지는 플레이어 속도 변화에 맞춰 동행감을 유지해야 한다.
- 강아지가 너무 멀어진 뒤에야 반응하는 느낌을 줄인다.
- 추적 로직의 구조와 행동 범위는 키우지 않는다.

## 확정 결정

- `PLAYER_MOVEMENT_SPEED`는 `120px/s`에서 `140px/s`로 높인다.
- `DOG_FOLLOW_SPEED`는 기존 플레이어 대비 비율 `0.75`를 유지해 `90px/s`에서
  `105px/s`로 높인다.
- `DOG_FOLLOW_START_DISTANCE`는 `96px`에서 `80px`로 낮춘다.
- `DOG_FOLLOW_STOP_DISTANCE`는 `56px`로 유지한다.
- `DOG_FOLLOW_TARGET_OFFSET`은 `48px`로 유지한다.
- 강아지의 목표 위치 선택, 충돌 정책, 상태 전환 구조는 유지한다.

## 하지 않을 것

- 강아지 경로 탐색, 막힘 감지, 자동 재배치를 추가하지 않는다.
- 강아지 mood나 반응 상태에 따라 속도를 다르게 만들지 않는다.
- 플레이어 이동 입력 체계를 바꾸지 않는다.
- 쓰다듬기 상호작용 거리나 프롬프트 조건을 바꾸지 않는다.
- 게임 정본 문서의 세계관, 캐릭터, 하루 루프 방향을 바꾸지 않는다.

## 영향 파일

이번 구현의 주요 변경 대상은 두 순수 로직 모듈이다.

```text
apps/game/src/game/systems/playerMovement/playerMovement.ts
apps/game/src/game/systems/dogFollow/dogFollow.ts
```

테스트는 같은 디렉터리의 기존 테스트를 새 수치에 맞춘다.

```text
apps/game/src/game/systems/playerMovement/playerMovement.test.ts
apps/game/src/game/systems/playerMovement/PlayerKeyboardController.test.ts
apps/game/src/game/systems/dogFollow/dogFollow.test.ts
```

## 동작 계약

플레이어 이동 의도 계산은 기존과 같은 방식으로 동작한다. 방향 입력이 있으면
입력 축을 정규화하고, 속도 크기가 항상 `140px/s`가 되도록 velocity를 만든다.
대각선 이동도 한 방향 이동과 같은 속도 크기를 유지한다.

강아지 따라오기는 기존 상태 머신을 유지한다.

```text
previous settled + player distance >= 80px
-> following

previous following + player distance <= 56px
-> settled

previous following + player distance > 56px
-> following 유지

previous settled + player distance < 80px
-> settled 유지
```

`following` 상태의 velocity 크기는 `105px/s`다. 이 값은 기존 `120:90` 비율을
새 플레이어 속도 `140`에 적용한 결과다.

```text
90 / 120 = 0.75
140 * 0.75 = 105
```

## 테스트 기준

플레이어 이동 테스트는 다음을 확인한다.

- 한 방향 입력 velocity가 `PLAYER_MOVEMENT_SPEED` 상수를 따른다.
- 대각선 입력 velocity 크기가 `140px/s`로 정규화된다.
- 대각선 입력의 각 축 값은 `140 / sqrt(2)`에 해당한다.
- 키보드 컨트롤러가 새 플레이어 속도를 그대로 적용한다.

강아지 따라오기 테스트는 다음을 확인한다.

- 안정 상태에서 주인과 `80px` 이상 멀어지면 따라오기 시작한다.
- 안정 상태에서 주인과 `80px`보다 가까우면 안정 상태를 유지한다.
- 따라오는 velocity 크기는 `105px/s`다.
- 기존 목표 위치 선택, 정지 거리, zero velocity 보호 동작은 유지된다.

## 성공 기준

- 플레이어 기본 이동 속도는 `140px/s`다.
- 강아지 따라오기 속도는 `105px/s`다.
- 강아지는 안정 상태에서 주인과 `80px` 이상 벌어졌을 때 따라오기 시작한다.
- 기존 추적 정지 거리와 목표 위치 선택 규칙은 변하지 않는다.
- 관련 테스트가 새 수치와 새 기대 동작을 검증한다.
