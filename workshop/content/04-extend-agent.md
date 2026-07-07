---
title: Extend Agent
summary: Add Web Chat and test memory across SMS, Voice, and Chat.
badge: 4
---

In this chapter, add Web Chat as a third channel on the same TAC handler. Use the same phone number identity in Web Chat that you use for SMS and Voice so TAC can resolve the same user memory.


## Step: Create Conversations Service

Web Chat uses a [Twilio Conversations (classic) Service](https://www.twilio.com/docs/conversations-classic/api). This is separate from Conversation
Orchestrator: the service powers browser chat, while the [Conversation
Configuration](https://www.twilio.com/docs/conversations/orchestrator/concepts/core) connects that chat traffic to [TAC](https://www.twilio.com/docs/conversations/agent-connect/overview).

1. Go to Twilio Console -> Products & Services -> Conversations (classic) -> Services.
2. Create a Conversations Service named `tac-workshop`.
3. Copy the Service SID (`IS...`) into `.env`.

```env label=".env"
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step: Configure Chat Traffic

Connect the Conversations Service you created in this chapter to the same
Conversation Configuration used by SMS and Voice.

1. Go to Twilio Console -> Conversation Orchestrator -> Conversation Configurations.
2. Open `tac-workshop`.
3. Under Channel traffic, add messaging and chat traffic for your Conversations Service.
4. Enable `Connect Conversations (classic) service or Flex`
5. Select the Conversation (classic) service you created before
6. Save the configuration.


## Step: Add the Chat Channel

Start from `build/step2_add_chat.py`. Web Chat uses Twilio Conversations in the browser, but TAC still routes messages into the same `handle_message_ready(...)` callback.


1. Create the Chat channel alongside SMS and Voice.

```python label="Channels"
sms_channel = SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))
voice_channel = VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))
chat_channel = ChatChannel(tac, config=ChatChannelConfig(
    agent_address="ai-agent",
    memory_mode="always"
))
```

2. Register Chat as a messaging channel.

```python label="Server"
server = TACFastAPIServer(
    tac=tac,
    voice_channel=voice_channel,
    messaging_channels=[sms_channel, chat_channel],
)
```

> [!NOTE]
> SMS and Chat both use TAC messaging routes. Voice still uses `/twiml` and `/ws`.


## Step: Serve the Web Chat UI

The browser chat UI is a normal static page in `build/public/index.html`. Add
these routes after `server = TACFastAPIServer(...)` because that object owns the
FastAPI app where both TAC routes and custom routes live.

1. Mount the `public` directory before `server.start()`.

```python label="Static files"
static_dir = Path(__file__).parent / "public"
server.app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
```

2. Serve the chat page from `/` on the same FastAPI app.

```python label="Home route"
@server.app.get("/")
async def index() -> FileResponse:
    return FileResponse(str(static_dir / "index.html"))
```

3. Start the app, then open the chat UI.

```text label="Browser"
http://localhost:8000
```

## Step: Add Browser Authentication

The browser cannot use your Twilio credentials directly. Add `/token` after the
UI routes so the server can mint a short-lived Twilio Conversations access token
for the selected chat identity.

1. Add the `/token` route before `server.start()`.

```python label="Token route"
@server.app.post("/token")
async def generate_token(request: Request) -> JSONResponse:
    """Generate a Conversations SDK access token."""
    body = await request.json()
    identity = body.get("identity")
    if not identity:
        return JSONResponse({"error": "Identity is required"}, status_code=400)

    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    api_key = os.environ.get("TWILIO_API_KEY")
    api_secret = os.environ.get("TWILIO_API_SECRET")
    service_sid = os.environ.get("TWILIO_CONVERSATIONS_SERVICE_SID")
    if not all([account_sid, api_key, api_secret, service_sid]):
        return JSONResponse({"error": "Missing Twilio credentials"}, status_code=500)

    token = AccessToken(account_sid, api_key, api_secret, identity=identity, ttl=3600)
    token.add_grant(ChatGrant(service_sid=service_sid))
    jwt = token.to_jwt()
    if isinstance(jwt, bytes):
        jwt = jwt.decode("utf-8")
    return JSONResponse({"token": jwt})
```

> [!NOTE]
> The token grants browser access only to the Conversations Service in `TWILIO_CONVERSATIONS_SERVICE_SID`. Use a [E.164 phone number](https://www.twilio.com/docs/glossary/what-e164) as the Web Chat identity, such as your phone number or the twilio dev-phone number you have been using to test from, so chat can line up with the same person who texts or calls from that number.


## Step: Test All Three Channels

Use the same phone number identity across SMS, Voice, and Web Chat.

1. Send SMS with your name and trip destination.
2. Call from the same phone number and add a preference.
3. Open Web Chat and use the same phone number as your identity.
4. Ask the agent what it remembers.

```text label="Scenario"
SMS: Hi, I'm <YOUR-NAME>. I'm planning a trip to Berlin.
Voice: I prefer boutique hotels.
Web Chat: What do you remember about my trip?

Expected: The agent remembers your name, Berlin, and boutique hotels.
```

If Web Chat does not share memory, check that the browser identity matches your phone number, the Conversation Configuration includes chat traffic, and `TWILIO_CONVERSATIONS_SERVICE_SID` is set.


## Quiz
Question: Why should Web Chat use the user's phone number as its identity?
- So TAC can connect Web Chat to the same user memory as SMS and Voice *
- So the browser can skip token generation
- So Voice no longer needs `/ws`
