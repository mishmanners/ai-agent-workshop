---
title: Build Basic Agent
summary: Build inbound SMS and Voice around one shared TAC handler.
badge: 3
---

The build starts from `build/step1_voice_sms.py` and ends with the reference implementation in `final/step1_voice_sms.py`.


## Step: Create the Server

Create the smallest runnable TAC app first. At this point, the server can boot,
but it does not know how to respond to SMS or Voice yet.

1. Open `build/step1_voice_sms.py`.
2. Load environment variables and create a logger.

```python label="Setup"
load_dotenv()
logger = get_logger(__name__)
```

3. Add TAC client

```python label="Setup"
tac = TAC(config=TACConfig.from_env())
```

4. Start the local server.

```python label="Setup"
if __name__ == "__main__":
    server = TACFastAPIServer(
        tac=tac
    )
    server.start()
```

Run this command from the same terminal where `.venv` is active.

```bash label="Terminal"
python build/step1_voice_sms.py
```

If the setup is correct, Uvicorn should start on port 8000.

```text label="Expected output"
2026-06-26 21:47:42 - tac.tac.core.tac - INFO - TAC initialized with Conversation Orchestrator and Memory [configuration_id=conv_configuration_xxxxxxxx]
2026-06-26 21:47:42 - tac.tac.server.fastapi_server - WARNING - No channels configured — conversation webhook route disabled
2026-06-26 21:47:42 - tac.tac.server.fastapi_server - INFO - Starting TAC FastAPI Server on 0.0.0.0:8000
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

If the server does not start, fix `.env` or dependency setup before adding
channels. This checkpoint only proves the app can load configuration and boot.


## Step: Add SMS and Voice

SMS and Voice are two ways a user can reach your agent. TAC handles the
channel-specific details for each one, so your code can work with the same simple
shape: receive a plain text string and returns a reply.

`context.channel` tells your handler whether the message came from `sms`,
`voice`, or another channel. `memory_mode="always"` asks TAC to retrieve memory
on every SMS message and Voice utterance, which lets the agent remember something
learned over SMS when the same person calls later.

1. Add SMS and voice channels
```python label="Channels"
sms_channel = SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))
voice_channel = VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))
```

Start the server with both channels.

```python label="Server"
server = TACFastAPIServer(
    tac=tac,
    voice_channel=voice_channel,
    messaging_channels=[sms_channel],
)
server.start()
```

2. Configure Twilio webhooks in two places.

In the [Twilio Console](https://console.twilio.com/):

- Messaging: go to Conversation Orchestrator -> Conversation Configurations, open `tac-workshop`, set the webhook to `https://<ngrok-domain>/webhook`, and save.
- Voice: open your Twilio phone number's Voice settings and set the webhook to `https://<ngrok-domain>/twiml`.

> [!NOTE]
> Use `POST` for both webhook URLs. Do not point the raw Programmable SMS phone-number webhook directly at `/webhook`; TAC expects messaging traffic from Conversation Orchestrator.

Use these TAC server routes:

```text label="Webhooks"
Messaging webhook: https://<ngrok-domain>/webhook
Voice webhook:     https://<ngrok-domain>/twiml
Voice audio:       wss://<ngrok-domain>/ws
```

> [!NOTE]
> `TACFastAPIServer` creates these routes for you. `/webhook` is where incoming
> messages arrive, `/twiml` tells Twilio how to connect an inbound phone call to
> your app, and `/ws` is the live audio connection for Voice.


## Step: Write the handle_message_ready

The same function handles SMS messages and transcribed Voice input. TAC calls it
when a message is ready for your agent.


1. Add handle_message_ready

```python label="Handler"
async def handle_message_ready(
    user_message: str,
    context: ConversationSession,
    memory_response: TACMemoryResponse | None,
) -> str:
    conv_id = context.conversation_id
    channel = context.channel

    logger.info(
        "Processing message",
        conversation_id=conv_id,
        channel=channel,
        message_preview=user_message[:50],
    )

    return "Hello back"
```

`ConversationSession` tells you where the message came from. Use it to get the
stable `conversation_id`, check `context.channel`, and keep SMS and Voice in the
same handler.

`memory_response` contains memory TAC retrieved for this turn. In this step,
log the message and return a static response first. In the next step, you will
pass `memory_response` into OpenAI.


2. Register the handler with TAC.

```python label="Register"
tac.on_message_ready(handle_message_ready)
```

3. Test SMS and Voice connection

Using your own mobile phone or the Twilio dev phone, send a text or call to your agent and it should reply back with `Hello back`.

```text label="Test"
Hi, I'm <YOUR-NAME>.
```


## Step: Add OpenAI and TAC Memory

Now replace the static `"Hello back"` response with an OpenAI response that can
use TAC memory.

There are two kinds of context in this step:

- `conversation_history` keeps the recent OpenAI turns for the current conversation.
- TAC memory stores longer-lived observations, summaries, and preferences across turns and channels.

TAC handles [memory management](https://www.twilio.com/docs/conversations/agent-connect/core-concepts#memory-management) for you. When memory is configured, TAC retrieves relevant context and passes it into `handle_message_ready` as `memory_response`.

1. Add the OpenAI client and model name.

```python label="Python"
MODEL = os.environ.get("OPENAI_MODEL_NAME", "gpt-5.4-mini")
openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
```

2. Add system instructions.

```python label="Prompt"
SYSTEM_INSTRUCTIONS = """
You are a helpful trip planning assistant.

Help users plan trips by remembering destinations, dates, budgets, travelers,
and preferences. Be warm, concise, and ask one clarifying question at a time.

IMPORTANT - Response formatting by channel:
- For VOICE: responses are spoken aloud. Never use markdown, bullets, numbered
  lists, asterisks, dashes, emojis, or special formatting. Use natural speech.
- For SMS: keep responses short and plain. No markdown or special formatting.
"""
```

3. Replace the static response in `handle_message_ready`.

```python label="Handler"
try:
    history = conversation_history.setdefault(conv_id, [])
    history.append({"role": "user", "content": user_message})

    client = with_tac_memory(openai_client, memory_response, context)

    response = await client.responses.create(
        model=MODEL,
        instructions=SYSTEM_INSTRUCTIONS,
        input=history,
    )

    llm_response = str(response.output_text)
    history.append({"role": "assistant", "content": llm_response})
    
    logger.info(
        "Message processed",
        conversation_id=conv_id,
        channel=channel,
        message_preview=llm_response[:50],
    )

    return llm_response

except Exception as exc:
    logger.error(
        "Error processing inbound message",
        conversation_id=conv_id,
        channel=channel,
        error=str(exc),
    )
    return "Sorry, I encountered an error. Please try again."
```

`with_tac_memory(...)` injects `memory_response` into the OpenAI request, so you
do not need to manually build a memory prompt. Returning a string is enough for
SMS and Voice; TAC sends it back through the same channel the user came from.

> [!NOTE]
> TAC supports several [memory retrieval patterns](https://www.twilio.com/docs/conversations/agent-connect/memory-and-tool-patterns#memory-retrieval-patterns): automatic channel retrieval, manual retrieval inside your handler, and tool-based retrieval. This workshop uses automatic retrieval with `memory_mode="always"` and `with_tac_memory(...)`.

4. Test the OpenAI response

Restart your server and test the OpenAI response: 

```text label="Test"
Message 1: Hi, I'm <YOUR-NAME>. I'm planning a trip to Berlin.
Expected: The agent replies with a personalized trip-planning response.

Message 2: What city am I planning to visit?
Expected: The agent answers Berlin.
```

If Message 1 still returns `Hello back`, the handler has not been updated to call
OpenAI yet. 

If Message 2 does not mention Berlin, check that SMS reached
`handle_message_ready`, `conversation_history` is being updated, `memory_mode="always"`
is set, and the Conversation Configuration has a Memory Store attached.


## Step: Clean Up Local Conversation History

TAC memory can persist useful long-term context, but `conversation_history` is
only local short-term OpenAI context. Remove it when TAC marks the conversation
as ended.

1. Add a conversation-ended handler.

```python label="Cleanup"
async def handle_conversation_ended(context: ConversationSession) -> None:
    logger.info(
        "Conversation ended",
        conversation_id=context.conversation_id,
        channel=context.channel,
    )
    conversation_history.pop(context.conversation_id, None)
```

2. Register it with TAC.

```python label="Register cleanup"
tac.on_conversation_ended(handle_conversation_ended)
```


## Step: Test Cross-Channel Memory

Now call the same Twilio number and ask:

```text label="Voice"
Hi, do you know who I am?
```

Expected result: the agent should know the name you sent over SMS and respond naturally, for example, "Hey `<YOUR-NAME>`, thanks for calling."


## Quiz
Question: Which function receives both SMS text and transcribed Voice input?
- handle_message_ready *
- handle_conversation_ended
- server.start
