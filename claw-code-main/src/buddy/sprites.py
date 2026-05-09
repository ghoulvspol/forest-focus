"""ASCII sprite frame definitions for each BuddyState.

Each sprite is a tuple of animation frames displayed in sequence.
Frames are designed for a monospace terminal (80-column safe).
"""

from __future__ import annotations

from .types import BuddySprite, BuddyState

_IDLE_FRAMES = (
    r"""
  /\_/\
 ( o.o )
  > ^ <
 (_____)""",
    r"""
  /\_/\
 ( -.- )
  > ^ <
 (_____)""",
)

_THINKING_FRAMES = (
    r"""
  /\_/\
 ( o.o ) ...
  > ~ <
 (_____)""",
    r"""
  /\_/\
 ( ^.^ ) ...
  > ~ <
 (_____)""",
    r"""
  /\_/\
 ( o.o ) ....
  > ~ <
 (_____)""",
)

_HAPPY_FRAMES = (
    r"""
  /\_/\
 ( ^v^ )  ♪
  > w <
 (_____)""",
    r"""
  /\_/\
 ( ^v^ ) ♪
  > w <
 (~~~~~)""",
)

_SLEEPING_FRAMES = (
    r"""
  /\_/\
 ( -.- )  z
  > _ <
 (_____)""",
    r"""
  /\_/\
 ( -.- )   z
  > _ <
 (_____)""",
    r"""
  /\_/\
 ( -.- )  zz
  > _ <
 (_____)""",
)

_EXCITED_FRAMES = (
    r"""
  /\_/\
 ( *o* ) !!
  > A <
 (~~~~~)""",
    r"""
  /\_/\
 ( *O* ) !!
  > A <
 (~~~~~)""",
)

_ERROR_FRAMES = (
    r"""
  /\_/\
 ( x.x )
  > _ <
 (_____)""",
)

SPRITES: dict[BuddyState, BuddySprite] = {
    BuddyState.IDLE: BuddySprite(
        state=BuddyState.IDLE,
        frames=tuple(f.strip('\n') for f in _IDLE_FRAMES),
    ),
    BuddyState.THINKING: BuddySprite(
        state=BuddyState.THINKING,
        frames=tuple(f.strip('\n') for f in _THINKING_FRAMES),
    ),
    BuddyState.HAPPY: BuddySprite(
        state=BuddyState.HAPPY,
        frames=tuple(f.strip('\n') for f in _HAPPY_FRAMES),
    ),
    BuddyState.SLEEPING: BuddySprite(
        state=BuddyState.SLEEPING,
        frames=tuple(f.strip('\n') for f in _SLEEPING_FRAMES),
    ),
    BuddyState.EXCITED: BuddySprite(
        state=BuddyState.EXCITED,
        frames=tuple(f.strip('\n') for f in _EXCITED_FRAMES),
    ),
    BuddyState.ERROR: BuddySprite(
        state=BuddyState.ERROR,
        frames=tuple(f.strip('\n') for f in _ERROR_FRAMES),
    ),
}


def get_sprite(state: BuddyState) -> BuddySprite:
    return SPRITES[state]


def get_frame(state: BuddyState, frame_index: int) -> str:
    sprite = SPRITES[state]
    return sprite.frames[frame_index % len(sprite.frames)]
