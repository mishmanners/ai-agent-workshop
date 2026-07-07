"""
Step 2: Add Web Chat to the Trip Planner Agent

Goal:
- Add Web Chat as a third TAC channel.
- Serve the browser chat UI.
- Generate Twilio Conversations access tokens with /token.
- Reuse one message handler across SMS, Voice, and Web Chat.
- Test shared memory across all three channels.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import ChatGrant

from tac import TAC, TACConfig
from tac.adapters.openai import with_tac_memory
from tac.channels.chat import ChatChannel, ChatChannelConfig
from tac.channels.sms import SMSChannel, SMSChannelConfig
from tac.channels.voice import VoiceChannel, VoiceChannelConfig
from tac.core.logging import get_logger
from tac.models.session import ConversationSession
from tac.models.tac import TACMemoryResponse
from tac.server import TACFastAPIServer

from openai import AsyncOpenAI

load_dotenv()
logger = get_logger(__name__)

# Initialize clients
tac = TAC(config=TACConfig.from_env())

openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = os.environ.get("OPENAI_MODEL_NAME", "gpt-5.4-mini")

# Channels
sms_channel = SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))
voice_channel = VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))

chat_channel = ChatChannel(tac, config=ChatChannelConfig(
    agent_address="ai-agent",
    memory_mode="always"
))

SYSTEM_INSTRUCTIONS = """
You are a helpful trip planning assistant.

Help users plan trips by remembering destinations, dates, budgets, travelers,
and preferences. Be warm, concise, and ask one clarifying question at a time.

IMPORTANT - Response formatting by channel:
- For VOICE: responses are spoken aloud. Never use markdown, bullets, numbered
  lists, asterisks, dashes, emojis, or special formatting. Use natural speech.
- For SMS: keep responses short and plain. No markdown or special formatting.
- For WEB CHAT: use rich formatting like markdown, emojis, and links.
"""

# Store conversation history per conversation
conversation_history: dict[str, list[dict]] = {}


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


async def handle_conversation_ended(context: ConversationSession) -> None:
    logger.info(
        "Conversation ended",
        conversation_id=context.conversation_id,
        channel=context.channel,
    )
    conversation_history.pop(context.conversation_id, None)

# Register TAC event handlers
tac.on_message_ready(handle_message_ready)
tac.on_conversation_ended(handle_conversation_ended)

if __name__ == "__main__":
    server = TACFastAPIServer(
        tac=tac,
        voice_channel=voice_channel,
        messaging_channels=[sms_channel, chat_channel],
    )

    static_dir = Path(__file__).parent / "public"
    server.app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


    @server.app.get("/")
    async def index() -> FileResponse:
        return FileResponse(str(static_dir / "index.html"))


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

    server.start()
