"""
Step 1: Inbound SMS + Voice Trip Planner Agent

Goal:
- Initialize Twilio Agent Connect.
- Add inbound SMS and Voice channels.
- Reuse one message handler for both channels.
- Call OpenAI with TAC memory.
"""

import os
from dotenv import load_dotenv

from tac import TAC, TACConfig
from tac.adapters.openai import with_tac_memory
from tac.channels.sms import SMSChannel, SMSChannelConfig
from tac.channels.voice import VoiceChannel, VoiceChannelConfig
from tac.core.logging import get_logger
from tac.models.session import ConversationSession
from tac.models.tac import TACMemoryResponse
from tac.server import TACFastAPIServer

from openai import AsyncOpenAI


# TODO: load environment variables and initialize logger


# TODO: Initialize TAC client


# TODO: Initialize OpenAI client and model


# TODO: Add channels with memory enabled


# TODO: Add system instructions for the OpenAI model


# TODO: Store short-term OpenAI conversation history by TAC conversation ID.


# TODO: Add handle_message_ready


# TODO: Add handle_conversation_ended


# TODO: Register the handler callback with TAC


# TODO: Start a TAC FastAPI server

