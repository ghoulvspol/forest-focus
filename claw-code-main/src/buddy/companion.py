"""Core BuddyCompanion state machine.

Mirrors the logic of the original `companion.ts`:
- Tracks current BuddyState and animation frame
- Transitions state in response to BuddyEvents
- Renders the current sprite frame
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .sprites import get_frame
from .types import BuddyConfig, BuddyEvent, BuddyEventType, BuddyRenderResult, BuddyState

# Map each event type to the target companion state
_EVENT_TRANSITIONS: dict[BuddyEventType, BuddyState] = {
    BuddyEventType.SESSION_STARTED: BuddyState.HAPPY,
    BuddyEventType.PROMPT_SUBMITTED: BuddyState.THINKING,
    BuddyEventType.RESPONSE_RECEIVED: BuddyState.HAPPY,
    BuddyEventType.TOOL_CALLED: BuddyState.EXCITED,
    BuddyEventType.ERROR_OCCURRED: BuddyState.ERROR,
    BuddyEventType.SESSION_IDLE: BuddyState.SLEEPING,
}

_STATE_LABELS: dict[BuddyState, str] = {
    BuddyState.IDLE: 'idle',
    BuddyState.THINKING: 'thinking...',
    BuddyState.HAPPY: 'happy!',
    BuddyState.SLEEPING: 'zzz',
    BuddyState.EXCITED: 'excited!',
    BuddyState.ERROR: 'oh no...',
}


@dataclass
class BuddyCompanion:
    config: BuddyConfig = field(default_factory=BuddyConfig)
    state: BuddyState = BuddyState.IDLE
    frame_index: int = 0
    event_log: list[BuddyEvent] = field(default_factory=list)

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def on_event(self, event: BuddyEvent) -> None:
        """Process a BuddyEvent and transition state accordingly."""
        self.event_log.append(event)
        target = _EVENT_TRANSITIONS.get(event.event_type)
        if target is not None and target != self.state:
            self.state = target
            self.frame_index = 0
        else:
            self.advance_frame()

    def advance_frame(self) -> None:
        """Step to the next animation frame without changing state."""
        self.frame_index += 1

    def reset(self) -> None:
        """Return to idle state."""
        self.state = BuddyState.IDLE
        self.frame_index = 0

    # ------------------------------------------------------------------
    # Rendering
    # ------------------------------------------------------------------

    def current_frame(self) -> str:
        return get_frame(self.state, self.frame_index)

    def label(self) -> str:
        return f'{self.config.name} · {_STATE_LABELS.get(self.state, self.state.value)}'

    def render(self) -> BuddyRenderResult:
        return BuddyRenderResult(
            frame=self.current_frame(),
            state=self.state,
            label=self.label(),
        )

    # ------------------------------------------------------------------
    # Convenience factory
    # ------------------------------------------------------------------

    @classmethod
    def create(cls, name: str = 'Clawd', enabled: bool = True) -> 'BuddyCompanion':
        return cls(config=BuddyConfig(name=name, enabled=enabled))
