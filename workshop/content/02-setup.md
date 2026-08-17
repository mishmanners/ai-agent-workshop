---
title: Setup & Environment
summary: Configure local dependencies, Twilio resources, OpenAI, and ngrok.
badge: 2
---


## Step: Clone Repository and Install Dependencies

Let's get the workshop code onto your machine, then install the Python packages the agent needs.

1. Clone the repository if you have not already done so:

```bash label="Terminal"
git clone git@github.com:kuroxx/multi-channel-ai-agent-workshop.git
cd multi-channel-ai-agent-workshop
```

If you already cloned it, open a terminal in your existing
`multi-channel-ai-agent-workshop` folder.

2. Create and activate a Python virtual environment:

```bash label="Terminal"
python3 -m venv .venv
source .venv/bin/activate
```

Use `python3` to create the virtual environment. After activation, use `python` and `python -m pip`; both commands will point to the Python 3 interpreter inside `.venv`. Note if you are using a Windows machine, you might need to use:

```bash label="Terminal"
python -m venv .venv
source .venv/bin/activate
```

3. Install the required Python packages

The command below will install the packages listed in `requirements.txt`, which are:

- [Twilio Agent Connect SDK](https://github.com/twilio/twilio-agent-connect-python): connects your app to Twilio channels, TAC memory, and the FastAPI server helpers.
- [OpenAI Python SDK](https://github.com/openai/openai-python): sends messages to the OpenAI Responses API.
- [python-dotenv](https://github.com/theskumar/python-dotenv): loads local values from `.env`.
- [HTTPX](https://www.python-httpx.org/): makes HTTP requests for startup checks and SDK internals.

```bash label="Terminal"
python -m pip install -r requirements.txt
```

When the install finishes, keep the virtual environment active for the rest of the workshop. Your terminal prompt may show `(.venv)` while it is active.


## Step: Configure Environment Variables

Create a local `.env` file and add your OpenAI API key first. Do this by:

1. Copy `.env.example` to `.env`.
2. Add your OpenAI API key.
3. Keep the file open for Twilio values.

```bash label="Terminal"
cp .env.example .env

# Add this in .env:
OPENAI_API_KEY=sk-proj-...
```

## Step: Configure Twilio Account

[Sign in to Twilio](https://console.twilio.com/) or [create a new account](https://www.twilio.com/try-twilio) before configuring the Twilio resources used by TAC.

1. Open the Twilio Console.
2. Upgrade your account using the workshop promo code.
3. [Create a Standard API Key](https://www.twilio.com/docs/iam/api-keys/keys-in-console#create-an-api-key-in-twilio-console) and copy your keys into `TWILIO_API_KEY` and `TWILIO_API_SECRET`.
4. [Copy your Account SID and Auth Token](https://help.twilio.com/articles/223136027-Auth-Tokens-and-How-to-Change-Them) into `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
5. [Buy a phone number](https://help.twilio.com/articles/223135247) with Voice and SMS capabilities. Copy the phone number into your .env

```env label=".env"
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your-api-secret
TWILIO_PHONE_NUMBER=+447700900123
```


## Step: Create Conversation Orchestrator

Create a [Conversation Configuration](https://www.twilio.com/docs/conversations/orchestrator/concepts/core) with memory enabled. This tells Twilio which phone number belongs to your agent, how to group messages and calls into conversations, and where to store conversation memory.

For this workshop, grouping by **Address** is important: SMS and Voice from the same phone number can resolve to the same participant context. Thus, the agent can remember something that is learned via SMS, and then also learn something about the person when that came person calls in later.

1. In [Twilio Console](https://console.twilio.com/), go to Products & Services -> Conversation Orchestrator -> Conversation Configurations.
2. Click top right button: `Create a Conversation configuration`.

Configure it with the following settings:

- Name: `tac-workshop`
- Description: **TAC workshop**
- Group by: **Address**
- Webhook: leave empty for now
- Messaging/Chat traffic: select your Twilio number
- Ingestion: **Capture automatically (passive ingestion)**
- Voice number: select your Twilio number
- Conversation lifecycle: **Basic**
- Closed timeout: SMS to **15 min**, Voice(calls) to **On hangup**
- Memory store: create and select a new memory store, such as `tac-workshop-memory`
- Turn on **Observations and summaries**

Review and click **Create Conversation configuration**.

3. Copy the configuration SID (`conv_configuration_...`) into `.env` as `TWILIO_CONVERSATION_CONFIGURATION_ID`.

```env label=".env"
TWILIO_CONVERSATION_CONFIGURATION_ID=conv_configuration_xxxxx
```

## Step: Start ngrok

Your agent runs on your laptop, but Twilio needs a public URL it can reach when someone sends a message or starts a phone call. ngrok creates a temporary public URL that forwards traffic to your local server, on port 8000.

Set `TWILIO_VOICE_PUBLIC_DOMAIN` to your public hostname so TAC can build the Voice WebSocket URL for Twilio to stream live call audio to your app. You can do this by following the steps below:

> [!IMPORTANT]
> Use ngrok only for local development and workshop testing. For production,
> deploy the agent to a real hosted environment and configure Twilio with that
> production domain.

1. Start ngrok against port 8000
2. Copy the hostname only into `TWILIO_VOICE_PUBLIC_DOMAIN` in `.env`. Do not include `https://`
3. Leave ngrok running while you test SMS, Voice, or Web Chat later in this workshop

```bash label="Terminal"
ngrok http 8000

# Example .env value:
TWILIO_VOICE_PUBLIC_DOMAIN=abc123.ngrok-free.app
```

## Step: Set Up Twilio Dev Phone (Optional)

The [Twilio Dev Phone](https://www.twilio.com/docs/labs/dev-phone) lets you make and receive calls from your browser without using your personal phone.

> [!NOTE]
> Dev Phone temporarily overwrites webhook configuration on the phone
> number it uses. If you want to use Dev Phone in this workshop, buy a second
> SMS and Voice capable Twilio number for Dev Phone. Do not use the same number as
> `TWILIO_PHONE_NUMBER`, because Dev Phone will overwrite the webhook settings
> needed by the TAC agent.

1. Install the Twilio CLI:

**macOS (Homebrew)**:
```bash label="macOS"
brew tap twilio/brew && brew install twilio
```

**npm (all platforms)**:
```bash label="npm"
npm install -g twilio-cli
```

2. Log in with your Account SID, API Key SID, and API Key Secret:

```bash label="Terminal"
twilio login
```

3. Install and start Dev Phone:

```bash label="Terminal"
twilio plugins:install @twilio-labs/plugin-dev-phone
twilio dev-phone
```

Dev Phone opens at `http://localhost:3001/` with a browser dial pad. Use it to make a browser-based test call. Press `Ctrl+C` in the terminal when you are done with Dev Phone. Note that you will need a separe Twilio phone number in order to use the Twilio Dev Phone.

## Step: Quiz 

## Quiz
Question: Why did we create a Conversation Configuration for this workshop?
- To group SMS and Voice traffic into conversations and connect them to memory *
- To replace the OpenAI API key
- To host the local FastAPI server
