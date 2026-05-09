"""Python port of the archived `buddy` companion subsystem.

Original TypeScript modules:
  buddy/types.ts              -> types.py
  buddy/sprites.ts            -> sprites.py
  buddy/companion.ts          -> companion.py
  buddy/prompt.ts             -> prompt.py
  buddy/useBuddyNotification  -> notification.py
  buddy/CompanionSprite.tsx   -> render via BuddyCompanion.render()
"""

from __future__ import annotations

import json
from pathlib import Path

from .companion import BuddyCompanion
from .notification import notify, notify_and_render
from .prompt import build_companion_prompt, inject_personality
from .sprites import get_frame, get_sprite
from .types import (
    BuddyConfig,
    BuddyEvent,
    BuddyEventType,
    BuddyNotification,
    BuddyRenderResult,
    BuddySprite,
    BuddyState,
)

_SNAPSHOT_PATH = Path(__file__).resolve().parent.parent / 'reference_data' / 'subsystems' / 'buddy.json'
_SNAPSHOT = json.loads(_SNAPSHOT_PATH.read_text())

ARCHIVE_NAME: str = _SNAPSHOT['archive_name']
MODULE_COUNT: int = _SNAPSHOT['module_count']
SAMPLE_FILES: tuple[str, ...] = tuple(_SNAPSHOT['sample_files'])
PORTING_NOTE: str = f"Python port of '{ARCHIVE_NAME}' with {MODULE_COUNT} archived module references."

__all__ = [
    'ARCHIVE_NAME',
    'MODULE_COUNT',
    'PORTING_NOTE',
    'SAMPLE_FILES',
    'BuddyCompanion',
    'BuddyConfig',
    'BuddyEvent',
    'BuddyEventType',
    'BuddyNotification',
    'BuddyRenderResult',
    'BuddySprite',
    'BuddyState',
    'build_companion_prompt',
    'get_frame',
    'get_sprite',
    'inject_personality',
    'notify',
    'notify_and_render',
]
