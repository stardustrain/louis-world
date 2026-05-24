# Game Canon Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/game/` 아래에 한국어 게임 정본 문서 4개를 만들고, 루트 `AGENTS.md`가 이 문서들을 참조하도록 업데이트한다.

**Architecture:** 문서는 코드와 분리된 `docs/game/` 아래에 둔다. `vision.md`, `world.md`, `characters.md`, `scenario.md`는 각각 하나의 책임만 가진다. 루트 `AGENTS.md`에는 설정 내용을 복사하지 않고, 관련 작업 전에 `docs/game/` 문서를 읽으라는 짧은 포인터만 둔다.

**Tech Stack:** Markdown, Git, 기존 pnpm/Phaser 프로젝트 구조.

---

## File Map

- Create: `docs/game/vision.md` — 게임의 핵심 방향, 감정 목표, 루프, 초기 범위 기준.
- Create: `docs/game/world.md` — 별나라의 톤, 첫 공간, 표현 규칙, 피해야 할 방향.
- Create: `docs/game/characters.md` — 주인공, 강아지, 관계 변화, NPC 추가 기준.
- Create: `docs/game/scenario.md` — 프롤로그와 첫날 플레이 흐름.
- Modify: `AGENTS.md` — 게임 관련 작업 전 `docs/game/` 문서를 읽는 참조 규칙 추가.

## Reference Material

- Read: `docs/superpowers/specs/2026-05-23-game-docs-design.md`
- Read: `/Users/lucashan/Documents/dog-starland-design-brief.md`

The external brief is source material only. Do not copy it into the repository.

---

### Task 1: Create `vision.md`

**Files:**

- Create: `docs/game/vision.md`

- [ ] **Step 1: Create the `docs/game` directory**

Run:

```bash
mkdir -p docs/game
```

Expected: command exits with status 0.

- [ ] **Step 2: Create `vision.md`**

Create `docs/game/vision.md` with exactly this content:

````md
# 게임 비전

이 문서는 게임의 핵심 방향을 정리하는 정본 문서다.

새로운 기능, 시나리오, 캐릭터, 세계관, 강아지 행동을 논의할 때 가장 먼저 확인한다.

## 한 줄 설명

주인공과 강아지가 알 수 없는 별빛에 휩쓸려 낯선 별나라에 도착하고, 작은 집과 마당에서 하루하루를 함께 보내며 서로에게 가장 안전한 존재가 되어가는 따뜻한 생활 게임.

## 플레이어가 느껴야 하는 감정

이 게임은 강아지를 효율적으로 관리하는 게임이 아니다.

플레이어가 느껴야 하는 핵심 감정은 낯선 세계에서 강아지와 함께 적응해가는 따뜻함이다.

- 강아지가 살아있는 존재처럼 느껴져야 한다.
- 강아지와 함께 있는 시간이 따뜻해야 한다.
- 반복 행동이 귀찮은 일이 아니라 애정 표현처럼 느껴져야 한다.
- 하루가 끝날 때 작지만 분명한 만족감이 있어야 한다.
- 별나라는 낯설지만 무섭기보다 포근해야 한다.

## 핵심 하루 루프

초기 프로토타입은 짧은 하루를 반복하는 감각을 중심으로 한다.

```text
아침에 깨어남
-> 강아지 반응 관찰
-> 밥 주기
-> 마당에서 놀기
-> 쓰다듬기와 안정감 회복
-> 저녁이 됨
-> 강아지와 함께 잠듦
-> 작은 하루 보상
```
````

반복의 핵심은 보상 크기가 아니라 강아지의 반응 변화다.

## 초기 프로토타입 성공 기준

초기 프로토타입은 다음을 만족하면 성공으로 본다.

- 플레이어가 강아지의 움직임을 보고 살아있다고 느낀다.
- 밥 주기, 공놀이, 쓰다듬기가 서로 다른 감정으로 느껴진다.
- 하루 종료 연출이 작지만 만족스럽다.
- 별나라 배경이 과하지 않고 따뜻한 분위기를 만든다.
- 플레이어가 다음 날 강아지가 어떤 반응을 보일지 궁금해한다.

## 초기 범위에서 만들지 않을 것

초기에는 강아지와 하루를 보내는 감각을 먼저 검증한다.

다음은 초기 범위에서 제외한다.

- 복잡한 전투
- 강한 생존 압박
- 질병, 죽음, 방치 페널티 중심 시스템
- 대규모 오픈월드
- 복잡한 경제와 상점 시스템
- 많은 NPC 관계도
- 농장 경영 전체 시스템
- 어두운 서사 중심 전개

## 판단 기준

선택이 어려울 때는 다음 질문으로 판단한다.

- 이 선택이 강아지를 더 살아있는 존재처럼 느끼게 하는가?
- 이 선택이 강아지와 함께 있는 시간을 더 따뜻하게 만드는가?
- 이 선택이 반복 행동을 노동이 아니라 애정 표현처럼 만드는가?
- 이 선택이 하루의 끝에 작은 만족감을 주는가?
- 이 선택이 초기 프로토타입 범위를 불필요하게 키우지 않는가?

````

- [ ] **Step 3: Verify `vision.md` exists and has the expected title**

Run:

```bash
sed -n '1,20p' docs/game/vision.md
````

Expected: output starts with `# 게임 비전`.

- [ ] **Step 4: Commit `vision.md`**

Run:

```bash
git add docs/game/vision.md
git commit -m "docs: add game vision"
```

Expected: commit succeeds and includes only `docs/game/vision.md`.

---

### Task 2: Create `world.md`

**Files:**

- Create: `docs/game/world.md`

- [ ] **Step 1: Create `world.md`**

Create `docs/game/world.md` with exactly this content:

````md
# 세계관

이 문서는 별나라의 톤, 첫 공간, 표현 규칙, 피해야 할 방향을 정리하는 정본 문서다.

세계관은 강아지와의 관계를 돕기 위한 배경이다. 큰 판타지 설정이 게임의 중심이 되면 안 된다.

## 세계의 한 줄 설명

별나라는 낯설지만 안전한 장소다. 주인공과 강아지는 별빛이 스며드는 작은 집과 마당에서 첫 하루를 시작한다.

## 기본 인상

이 세계는 처음 보는 곳이지만 무섭지 않아야 한다.

중요한 키워드는 다음과 같다.

- 별빛
- 작은 집
- 달빛 정원
- 반짝이는 풀
- 잠자는 별
- 유성 공
- 따뜻한 밤
- 조용한 신비함
- 포근한 낯섦

## 첫 공간

초기 배경은 별나라의 외딴 작은 집과 마당이다.

집 안에는 침대, 강아지 방석, 밥그릇, 창문, 문이 있다.

마당에는 공놀이를 할 수 있는 공간, 반짝이는 풀, 작은 별나무, 아직 갈 수 없는 길이 있다.

하늘에는 커다란 달과 천천히 흐르는 별구름이 있다. 이 공간은 넓은 모험지보다 둘이 함께 적응하는 첫 보금자리처럼 느껴져야 한다.

## 시간의 분위기

- 아침: 연한 푸른 별빛
- 낮: 따뜻한 금빛
- 저녁: 보라색 하늘
- 밤: 은은한 별자리와 작은 조명

시간 변화는 압박이 아니라 하루가 지나간다는 감정적 리듬을 만든다.

## 현실 행동의 별나라식 표현

현실의 강아지 돌봄 행동은 별나라의 신비한 표현으로 바꿀 수 있다.

| 현실 행동 | 별나라식 표현                             |
| --------- | ----------------------------------------- |
| 밥 주기   | 별빛 알갱이나 따뜻한 별죽을 밥그릇에 채움 |
| 공 던지기 | 작은 유성 공을 마당에 던짐                |
| 산책      | 달빛 풀밭, 구름다리, 반짝이는 언덕을 걷기 |
| 쓰다듬기  | 강아지 털 주변에 작은 별빛이 피어남       |
| 잠자기    | 하늘에 둘만의 작은 별자리가 생김          |
| 장난감    | 유성 조각, 구름 솜뭉치, 달조개 방울       |
| 물그릇    | 별샘에서 뜬 물                            |
| 집        | 별빛이 새어 들어오는 작은 오두막          |

## 표현해도 되는 것

- 따뜻함
- 조용함
- 안전한 신비함
- 어린아이 같은 동화성
- 외로움이 있더라도 포근하게 마무리되는 분위기
- 강아지와 함께 있으면 괜찮다는 느낌

## 피해야 할 것

- 공포
- 잔혹함
- 질병이나 죽음 중심의 이야기
- 과도한 생존 압박
- 어둡고 우울한 세계관
- 너무 거대한 신화 설정
- 설명이 많은 판타지 용어
- 강아지를 위험에 노출하는 연출
- 플레이어에게 죄책감을 주는 돌봄 실패 연출

## 비중 기준

초기에는 다음 비중을 기준으로 한다.

```text
강아지와의 관계: 70%
별나라의 신비함: 20%
스토리와 미스터리: 10%
```
````

별나라는 강아지와 보내는 하루를 특별하게 만드는 장소여야 한다.

## 아직 정하지 않은 것

- 별나라의 정식 이름
- 이곳이 실제 외부 세계인지, 꿈과 현실 사이인지
- 주인공과 강아지가 돌아가고 싶어 하는지
- 다른 주민이 언제 등장하는지
- 별자리가 단순 연출인지, 수집이나 진행 시스템인지

````

- [ ] **Step 2: Verify `world.md` exists and has the expected title**

Run:

```bash
sed -n '1,20p' docs/game/world.md
````

Expected: output starts with `# 세계관`.

- [ ] **Step 3: Commit `world.md`**

Run:

```bash
git add docs/game/world.md
git commit -m "docs: add game world canon"
```

Expected: commit succeeds and includes only `docs/game/world.md`.

---

### Task 3: Create `characters.md`

**Files:**

- Create: `docs/game/characters.md`

- [ ] **Step 1: Create `characters.md`**

Create `docs/game/characters.md` with exactly this content:

````md
# 캐릭터

이 문서는 주인공, 강아지, 둘의 관계, 이후 NPC 추가 기준을 정리하는 정본 문서다.

초기에는 캐릭터 수를 적게 유지한다. 게임의 중심은 주인공과 강아지의 관계다.

## 주인공

주인공은 플레이어의 분신이자 강아지의 보호자다.

구체적인 이름, 성별, 나이, 외형은 아직 정하지 않는다.

주인공의 역할은 세계를 설명하는 것이 아니라, 낯선 세계에서 강아지와 함께 반응하고 적응하는 것이다.

### 주인공의 톤

- 조용하고 다정하다.
- 강아지를 먼저 챙긴다.
- 낯선 세계를 무서워할 수 있지만 강아지 앞에서는 침착하려 한다.
- 말보다 행동으로 애정을 표현한다.
- 대사는 짧고 부드럽다.

### 대사 톤 예시

```text
괜찮아, 나 여기 있어.
천천히 가보자.
배고팠구나.
처음 보는 곳인데도 잘했어.
오늘은 여기서 쉬자.
```
````

## 강아지

강아지는 게임의 가장 중요한 캐릭터다.

강아지는 단순한 펫 오브젝트가 아니라, 낯선 별나라를 함께 느끼는 동반자다.

### 강아지의 역할

- 플레이어의 동반자
- 감정의 중심
- 낯선 세계를 탐색하는 안내자
- 플레이어 행동에 반응하는 존재
- 이 세계가 안전한지 몸짓으로 보여주는 존재

### 강아지의 성격 방향

- 다정하다.
- 호기심이 많다.
- 처음에는 조금 조심스럽다.
- 보호자를 신뢰한다.
- 낯선 것에 겁먹기도 하지만 금방 다시 다가간다.
- 밥, 공놀이, 쓰다듬기에 각기 다른 반응을 보인다.

### 행동 표현

강아지는 말을 하지 않아도 된다.

감정은 표정, 이동, 소리, 거리감, 반응 속도, 자세, 작은 자율 행동으로 표현한다.

사용할 수 있는 행동 예시는 다음과 같다.

- 꼬리 흔들기
- 고개 갸웃하기
- 밥그릇 근처에서 기다리기
- 별풀 냄새 맡기
- 공을 물고 돌아오기
- 주인공 뒤에 살짝 숨기
- 주인공 옆에 기대앉기
- 잠들기 전 둥글게 말기
- 처음 본 빛을 발로 톡 건드리기

## 관계 변화

핵심 관계는 다음 흐름으로 잡는다.

```text
보호자와 반려견
-> 낯선 세계의 동료
-> 서로에게 가장 안전한 존재
```

관계가 깊어졌다는 느낌은 대사보다 행동으로 표현한다.

예시는 다음과 같다.

- 처음에는 강아지가 주인공 근처에만 머문다.
- 익숙해지면 마당을 먼저 탐색하고 돌아온다.
- 잠들기 전 더 가까운 위치에 눕는다.
- 플레이어가 부르면 반응 속도가 달라진다.
- 특정 행동 후 강아지가 먼저 다가온다.

## NPC 추가 기준

초기 프로토타입에는 NPC가 없어도 된다.

NPC를 추가한다면 설명을 많이 하는 존재보다, 주인공과 강아지의 관계를 살짝 돕는 환경적 존재가 좋다.

가능한 방향은 다음과 같다.

| NPC 유형      | 역할                      | 톤                 |
| ------------- | ------------------------- | ------------------ |
| 말하는 별나무 | 첫 공간의 조용한 안내자   | 느리고 따뜻함      |
| 달빛 우체통   | 짧은 편지나 튜토리얼 전달 | 짧고 귀여움        |
| 별나비 무리   | 강아지 호기심 유발        | 말 없음            |
| 졸린 달토끼   | 이후 만나는 주민          | 느긋함             |
| 구름 상인     | 장난감이나 장식 판매      | 밝지만 과하지 않음 |

## NPC가 지켜야 할 선

- NPC가 강아지와 플레이어의 관계를 방해하면 안 된다.
- NPC가 세계관 설명을 길게 떠맡으면 안 된다.
- 초기에는 NPC보다 강아지의 반응이 더 중요하다.
- NPC는 짧은 반응이나 작은 도움으로 충분하다.

## 아직 정하지 않은 것

- 주인공의 이름, 성별, 나이, 외형
- 강아지의 이름
- 강아지의 최종 2D 비율과 애니메이션 스타일
- 첫 NPC를 실제로 넣을지 여부

````

- [ ] **Step 2: Verify `characters.md` exists and has the expected title**

Run:

```bash
sed -n '1,20p' docs/game/characters.md
````

Expected: output starts with `# 캐릭터`.

- [ ] **Step 3: Commit `characters.md`**

Run:

```bash
git add docs/game/characters.md
git commit -m "docs: add game characters canon"
```

Expected: commit succeeds and includes only `docs/game/characters.md`.

---

### Task 4: Create `scenario.md`

**Files:**

- Create: `docs/game/scenario.md`

- [ ] **Step 1: Create `scenario.md`**

Create `docs/game/scenario.md` with exactly this content:

````md
# 시나리오

이 문서는 이야기의 시작과 첫 플레이 하루를 정리하는 정본 문서다.

초기 목표는 장편 시나리오를 확정하는 것이 아니다. 프롤로그와 첫날 플레이 흐름을 명확히 하는 것이다.

## 시작 상황

어느 밤, 주인공과 강아지는 알 수 없는 별빛에 휩쓸린다.

둘은 낯선 별나라의 작은 집에서 깨어난다. 돌아갈 방법은 아직 모른다.

당장 중요한 것은 이 세계를 설명하는 것이 아니라, 강아지를 안심시키고 첫 하루를 함께 보내는 것이다.

## 프롤로그 흐름

프롤로그는 짧고 조용해야 한다.

```text
1. 주인공이 밤에 강아지와 함께 있다.
2. 창밖에서 이상하게 밝은 별이 보인다.
3. 강아지가 먼저 별빛을 보고 반응한다.
4. 주인공이 강아지를 따라가거나 강아지를 안으려는 순간 별빛이 번진다.
5. 둘이 낯선 별나라의 작은 침대 옆에서 깨어난다.
6. 강아지가 먼저 일어나 주인공에게 다가와 꼬리를 흔든다.
7. 여기서 첫 플레이가 시작된다.
```
````

프롤로그는 큰 위기보다 낯섦과 안심감을 남겨야 한다.

## 첫날 플레이 흐름

### 1. 깨어남

감정 목표:

- 낯선 곳임을 보여준다.
- 하지만 무섭지 않게 연출한다.
- 강아지가 곁에 있다는 사실로 안심감을 준다.

연출 방향:

```text
희미한 별빛이 창문으로 들어온다.
방은 처음 보는 곳이지만 따뜻하다.
강아지가 방석 위에서 몸을 일으킨다.
강아지가 주인공에게 다가와 꼬리를 흔든다.
```

### 2. 첫 밥 주기

감정 목표:

- 기본 상호작용을 알려준다.
- 강아지가 플레이어 행동에 반응한다는 것을 보여준다.
- 밥 주기를 자원 소모가 아니라 돌봄으로 느끼게 한다.

연출 방향:

```text
낯선 밥그릇이 은은하게 빛난다.
플레이어가 별빛 알갱이나 따뜻한 별죽을 담는다.
강아지가 조심스럽게 냄새를 맡는다.
먹고 나면 꼬리를 작게 흔든다.
```

### 3. 마당으로 나가기

감정 목표:

- 별나라의 첫 인상을 준다.
- 강아지의 조심스러움과 호기심을 보여준다.

연출 방향:

```text
문을 열면 보라색 하늘과 반짝이는 풀이 보인다.
강아지는 처음에는 문가에서 멈춘다.
플레이어가 가까이 있으면 천천히 따라 나온다.
```

### 4. 공놀이

감정 목표:

- 강아지가 즐거워하는 모습을 보여준다.
- 낯선 공간이 점점 안전한 장소로 바뀌는 느낌을 준다.

연출 방향:

```text
작은 유성 공을 던진다.
강아지가 처음에는 망설이다가 뛰어간다.
공을 물고 돌아오며 더 활발해진다.
```

### 5. 쓰다듬기

감정 목표:

- 하루 중 정서적 핵심 상호작용이 된다.
- 강아지의 안정감을 회복한다.
- 플레이어와 강아지 사이의 거리감을 줄인다.

연출 방향:

```text
강아지가 주인공 가까이 다가온다.
쓰다듬으면 눈을 감거나 몸을 기댄다.
털 주변에 작은 별빛이 피어난다.
```

### 6. 저녁과 잠

감정 목표:

- 하루를 따뜻하게 마무리한다.
- 작은 만족감을 준다.
- 다음 날을 기대하게 만든다.

연출 방향:

```text
하늘이 보라색에서 짙은 남색으로 바뀐다.
강아지가 피곤해하며 집 쪽으로 향한다.
둘이 잠들면 하늘에 작은 별자리가 생긴다.
별자리는 오늘 함께한 행동을 은은하게 상징한다.
```

## 첫날의 감정 곡선

```text
낯섦
-> 안심
-> 조심스러운 돌봄
-> 호기심
-> 즐거움
-> 안정
-> 따뜻한 마무리
```

## 피해야 할 전개

- 첫날부터 큰 위기를 넣는 것
- 강아지가 위험에 처하는 장면
- 강한 튜토리얼 텍스트
- 세계관 설명 과다
- 플레이어에게 즉시 목표나 퀘스트를 많이 주는 것
- 돌아가야 한다는 압박을 강하게 주는 것
- 슬픔이나 상실감으로 시작하는 것

## 장기 확장 후보

장기 확장은 첫날 루프가 따뜻하게 작동한 뒤에 고려한다.

- 집 주변의 닫힌 길이 하루하루 조금씩 열린다.
- 강아지가 특정 장소에 반응하며 새로운 구역을 발견한다.
- 둘만의 별자리가 늘어나며 추억이 쌓인다.
- 별나라의 주민들이 아주 천천히 등장한다.
- 돌아가는 방법보다 여기서 함께 살아가는 방법이 먼저 중요해진다.
- 마지막에는 돌아갈지 머물지보다, 둘이 어디에 있든 안전하다는 감정이 중요하다.

## 아직 정하지 않은 것

- 첫날 전에 프롤로그를 플레이 가능한 장면으로 만들지 여부
- 별자리가 시스템인지 연출인지 여부
- 장기적으로 돌아가는 방법을 찾는 이야기를 넣을지 여부

````

- [ ] **Step 2: Verify `scenario.md` exists and has the expected title**

Run:

```bash
sed -n '1,20p' docs/game/scenario.md
````

Expected: output starts with `# 시나리오`.

- [ ] **Step 3: Commit `scenario.md`**

Run:

```bash
git add docs/game/scenario.md
git commit -m "docs: add game scenario canon"
```

Expected: commit succeeds and includes only `docs/game/scenario.md`.

---

### Task 5: Update Agent Guidance

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: Read the current `AGENTS.md`**

Run:

```bash
sed -n '1,160p' AGENTS.md
```

Expected: output includes the existing `# AGENTS.md` title and `## Language` section.

- [ ] **Step 2: Add a `Game Canon` section**

Modify `AGENTS.md` so it becomes exactly:

```md
# AGENTS.md

## Language

- 기본 응답 언어는 한국어로 한다.
- 사용자가 다른 언어를 명시적으로 요청하면 그 언어를 따른다.

## Game Canon

- 게임 컨셉, 시나리오, 캐릭터, 세계관, 대사, 강아지 행동, 톤에 영향을 주는 작업 전에는 `docs/game/`의 관련 문서를 먼저 읽는다.
- 작업 결과가 게임의 정본 방향을 바꾸면 구현과 함께 관련 `docs/game/` 문서도 업데이트한다.
- `AGENTS.md`에는 게임 설정을 복사하지 않는다. 이 파일은 `docs/game/`을 가리키는 포인터 역할만 한다.
- `docs/game/` 업데이트가 반복적으로 많아지면 전용 스킬 생성을 검토한다.
```

- [ ] **Step 3: Verify the new section exists**

Run:

```bash
rg -n "Game Canon|docs/game" AGENTS.md
```

Expected: output includes `## Game Canon` and at least one `docs/game/` reference.

- [ ] **Step 4: Commit `AGENTS.md`**

Run:

```bash
git add AGENTS.md
git commit -m "docs: point agents to game canon"
```

Expected: commit succeeds and includes only `AGENTS.md`.

---

### Task 6: Final Verification

**Files:**

- Verify: `docs/game/vision.md`
- Verify: `docs/game/world.md`
- Verify: `docs/game/characters.md`
- Verify: `docs/game/scenario.md`
- Verify: `AGENTS.md`

- [ ] **Step 1: Confirm all game docs exist**

Run:

```bash
find docs/game -maxdepth 1 -type f | sort
```

Expected output:

```text
docs/game/characters.md
docs/game/scenario.md
docs/game/vision.md
docs/game/world.md
```

- [ ] **Step 2: Confirm each doc has the expected title**

Run:

```bash
rg -n "^# (게임 비전|세계관|캐릭터|시나리오)$" docs/game
```

Expected: output includes one matching title from each of the four files.

- [ ] **Step 3: Confirm unresolved items are explicit where present**

Run:

```bash
rg -n "아직 정하지 않은 것" docs/game
```

Expected: output includes `world.md`, `characters.md`, and `scenario.md`. `vision.md` does not need this section.

- [ ] **Step 4: Confirm no placeholder markers were added**

Run:

```bash
rg -n "(TB[D])|(PLACEHOLDE[R])|(FIXM[E])|\\[\\]" docs/game AGENTS.md
```

Expected: command exits with status 1 and prints no matches.

- [ ] **Step 5: Confirm root agent guidance points to `docs/game/`**

Run:

```bash
rg -n "Game Canon|docs/game" AGENTS.md
```

Expected: output includes `## Game Canon` and `docs/game/`.

- [ ] **Step 6: Confirm working tree status**

Run:

```bash
git status --short
```

Expected: no output.
