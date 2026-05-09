"""Type definitions for the buddy companion subsystem."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class BuddyState(Enum):
    IDLE = 'idle'
    THINKING = 'thinking'
    HAPPY = 'happy'
    SLEEPING = 'sleeping'
    EXCITED = 'excited'
    ERROR = 'error'


class BuddyEventType(Enum):
    PROMPT_SUBMITTED = 'prompt_submitted'
    RESPONSE_RECEIVED = 'response_received'
    TOOL_CALLED = 'tool_called'
    ERROR_OCCURRED = 'error_occurred'
    SESSION_IDLE = 'session_idle'
    SESSION_STARTED = 'session_started'


@dataclass(frozen=True)
class BuddySprite:
    state: BuddyState
    frames: tuple[str, ...]


@dataclass(frozen=True)
class BuddyEvent:
    event_type: BuddyEventType
    payload: str = ''


@dataclass
class BuddyConfig:
    name: str = 'Clawd'
    enabled: bool = True
    animation_speed_ms: int = 500
    personality: str = 'cheerful and curious'


@dataclass(frozen=True)
class BuddyNotification:
    event: BuddyEvent
    message: str
    companion_state: BuddyState
    frame: str


@dataclass
class BuddyRenderResult:
    frame: str
    state: BuddyState
    label: str
    notification: BuddyNotification | None = None

    def as_text(self) -> str:
        lines = [self.frame, f'  [{self.label}]']
        if self.notification:
            lines.append(f'  ! {self.notification.message}')
        return '\n'.join(lines)
