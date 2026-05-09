"""Companion prompt generation.

Mirrors `prompt.ts`: builds a short personality note about the companion
that can be injected into a system prompt or rendered alongside a turn.
"""

from __future__ import annotations

from .companion import BuddyCompanion
from .types import BuddyState

_STATE_FLAVOR: dict[BuddyState, str] = {
    BuddyState.IDLE: 'Your companion is quietly waiting beside you.',
    BuddyState.THINKING: 'Your companion is deep in thought, ears perked.',
    BuddyState.HAPPY: 'Your companion is delighted by the progress!',
    BuddyState.SLEEPING: 'Your companion dozed off. Try not to wake them.',
    BuddyState.EXCITED: 'Your companion bounces with excitement at the tool activity!',
    BuddyState.ERROR: 'Your companion looks worried. Something went wrong.',
}


def build_companion_prompt(companion: BuddyCompanion) -> str:
    """Return a short companion personality blurb for the current state."""
    flavor = _STATE_FLAVOR.get(companion.state, '')
    return (
        f'[Companion: {companion.config.name}] '
        f'Personality: {companion.config.personality}. '
        f'{flavor}'
    )


def inject_personality(base_prompt: str, companion: BuddyCompanion) -> str:
    """Prepend the companion note to an existing prompt string."""
    note = build_companion_prompt(companion)
    return f'{note}\n\n{base_prompt}'
