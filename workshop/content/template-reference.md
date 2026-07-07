---
title: Template Reference
summary: Copy patterns from this file when authoring workshop chapters.
badge: X
---

This file is an authoring reference only. It is not listed in `workshop/app.js`, so the workshop UI does not render it.

## Step: Basic Step Content

Use `## Step:` headings to create steps inside a chapter. The first paragraph after the heading becomes the main step body.

1. Ordered lists render as full-width Step cards.
2. Each ordered item gets a red `Step N` label.
3. Use ordered lists for instructions or workshop actions.

```text label="Plain Text"
This is a regular code block.
The label comes from label="Plain Text".
```

## Step: Regular Bullet Lists

Use unordered bullets when you want a normal markdown-style list instead of Step cards.

- Bullet lists render as simple inline list content.
- This is useful for facts, caveats, or non-sequential notes.
- Quiz answer options also use bullet syntax.

```bash label="Terminal"
python3 -m http.server 8765
open http://localhost:8765/workshop/
```

## Step: System Overview

The workshop guide renders this from a markdown `component` code fence. The detailed UI lives in `workshop/app.js`, while markdown only references the component by name.

```component name="system-overview"
```

## Step: Code Blocks

Use fenced code blocks for commands, config, code snippets, URLs, and examples.

1. Put the language after the opening backticks.
2. Add `label="..."` to control the code block caption.
3. Keep snippets focused on the current step.

```python label="app.py"
async def handle_message_ready(user_message, context, memory_response):
    return "Hello from the agent"
```

```env label=".env"
OPENAI_API_KEY=sk-proj-...
TWILIO_PHONE_NUMBER=+15551234567
```

## Step: Architecture Diagrams

Use a fenced `diagram` block to render a responsive architecture diagram. Each line becomes one node. Use `Title | Description`.

```diagram label="Architecture"
Customer | Sends a message by SMS, Voice, or Web Chat
Twilio Channels | Normalize channel-specific events
Twilio Agent Connect | Routes conversations and retrieves memory
FastAPI App | Runs one shared message handler
OpenAI Responses API | Generates the agent response
```

## Step: Referenced UI Components

Use a fenced `component` block when the UI should render a purpose-built component from `workshop/app.js`. This is best for richer visuals that would be awkward to maintain directly in markdown.

1. Add a standalone component file in `workshop/components/`.
2. Register it on `window.workshopComponents`.
3. Reference it from markdown with `name="..."`.
4. Remove or comment out the `component` fence to hide it from the UI.

```component name="system-overview"
```

## Step: Quiz Format

Put a quiz at the end of a chapter with `## Quiz`. Mark the correct answer by adding `*` at the end of that option.

1. Keep quiz questions short.
2. Use three answer options when possible.
3. Only one option should include the trailing `*`.

## Quiz
Question: Which markdown list becomes Step cards?
- Unordered bullets
- Ordered lists *
- Fenced code blocks
