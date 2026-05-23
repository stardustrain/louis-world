# AGENTS.md

## Language

- 기본 응답 언어는 한국어로 한다.
- 사용자가 다른 언어를 명시적으로 요청하면 그 언어를 따른다.

## Commit Messages

When creating commits or proposing commit messages:

- Inspect recent commits first, e.g. `git log --oneline -n 5`.
- Use conventional commit subjects such as `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Match the style of recent commits in this repository.
- Keep the subject concise and describe the actual change.
- Output only the final commit message, with no explanation.

## Game Canon

- 게임 컨셉, 시나리오, 캐릭터, 세계관, 대사, 강아지 행동, 톤에 영향을 주는 작업 전에는 `docs/game/`의 관련 문서를 먼저 읽는다.
- 작업 결과가 게임의 정본 방향을 바꾸면 구현과 함께 관련 `docs/game/` 문서도 업데이트한다.
- `AGENTS.md`에는 게임 설정을 복사하지 않는다. 이 파일은 `docs/game/`을 가리키는 포인터 역할만 한다.
- `docs/game/` 업데이트가 반복적으로 많아지면 전용 스킬 생성을 검토한다.

## References

- [Game Canon](docs/game/)
- [Code Style Skill](.codex/skills/code-style/SKILL.md)
- [Test Code Style Skill](.codex/skills/test-code-style/SKILL.md)
