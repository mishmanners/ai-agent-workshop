# Workshop: Build a Multi-Channel AI Agent

## Overview

This repository contains the materials and steps for the **Build a Multi-Channel AI Agent** workshop. You will build an agent accessible via Web Chat, SMS, and Voice with shared conversation memory across channels using [Twilio Agent Connect (TAC)](https://github.com/twilio/twilio-agent-connect-python) and [OpenAI](https://developers.openai.com/).


## Requirements

You will need:

- Python 3.10+. If you don't have Python, head to the [download page](https://www.python.org/downloads/release).
- [ngrok](https://ngrok.com/) or similar for local webhook testing
- [Upgraded Twilio account](https://help.twilio.com/articles/223183208-Upgrading-to-a-paid-Twilio-Account) and [new Twilio Console access](https://www.twilio.com/en-us/changelog/new-twilio-console-is-now-generally-available) (you will create these during this workshop)
- OpenAI API key (we'll provide one for you to use in the workshop)


> [!TIP]
> **Bring your own AI**: This workshop uses OpenAI, but Twilio Agent Connect is LLM agnostic. You can swap the LLM provider by changing the message handler logic.


## Workshop Agenda (120 min)

1. Intro + demo (15 min)
2. Setup & Environment (30 min)
3. Build Basic Agent (30 min)
4. Extend Agent (30 min)
5. Wrap-Up (15 min)


## Repository Structure

- [workshop/](./workshop/): Browser-based workshop guide generated from markdown content at runtime.
- [slides/](./slides/): Workshop slides.
- [requirements.txt](./requirements.txt): Python dependencies.
- [.env.example](./.env.example): Required environment variable template.
- [build/](./build/): Starter templates used during the workshop.
- [final/](./final/): Complete reference implementation.


## Start Here

Use the browser workshop guide if you want the guided UI:

```bash
python -m http.server 8765
```

Then open [http://localhost:8765/workshop/](http://localhost:8765/workshop/).

If you prefer plain markdown, read the content files directly in [workshop/content/](./workshop/content/). Start with [01-mission.md](./workshop/content/01-mission.md), then continue in order.

Use [build/](./build/) while following the workshop. These files are starter templates with TODOs that you complete step by step.

Use [final/](./final/) as the reference implementation when you want to compare your work or see the completed version.


## Feedback

If you want, please share any feedback to help us improve this workshop. Use [this form](https://forms.gle/UVynw9wwdoKZkRp57), it only takes a minute.

## License

MIT License
