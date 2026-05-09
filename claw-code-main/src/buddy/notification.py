"""Buddy notification system.

Mirrors `useBuddyNotification.tsx`: maps runtime events to human-readable
companion notifications and attaches them to a BuddyRenderResult.
"""

from __future__ import annotations

from .companion import BuddyCompanion
from .sprites import get_frame
from .types import BuddyEvent, BuddyEventType, BuddyNotification, BuddyRenderResult

_EVENT_MESSAGES: dict[BuddyEventType, str] = {
    BuddyEventType.SESSION_STARTED: 'Ready to help! Let\'s go!',
    BuddyEventType.PROMPT_SUBMITTED: 'On it! Thinking hard...',
    BuddyEventType.RESPONSE_RECEIVED: 'Here you go!',
    BuddyEventType.TOOL_CALLED: 'Using a tool, hang tight!',
    BuddyEventType.ERROR_OCCURRED: 'Uh oh, something broke...',
    BuddyEventType.SESSION_IDLE: 'Quiet for now... zzzz',
}


def notify(companion: BuddyCompanion, event: BuddyEvent) -> BuddyNotification:
    """Process an event, transition the companion, and return a notification."""
    companion.on_event(event)
    message = _EVENT_MESSAGES.get(event.event_type, f'Event: {event.event_type.value}')
    if event.payload:
        message = f'{message} ({event.payload})'
    return BuddyNotification(
        event=event,
        message=message,
        companion_state=companion.state,
        frame=companion.current_frame(),
    )


def notify_and_render(companion: BuddyCompanion, event: BuddyEvent) -> BuddyRenderResult:
    """Notify + produce a full render result with the notification attached."""
    notification = notify(companion, event)
    result = companion.render()
    return BuddyRenderResult(
        frame=result.frame,
        state=result.state,
        label=result.label,
        notification=notification,
    )
