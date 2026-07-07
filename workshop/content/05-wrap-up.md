---
title: Wrap-Up
summary: Recap what you built and choose extensions for production.
badge: 5
---


## Step: Mission Complete

You built one AI Agent that can keep contextual memory across SMS, Voice, and Web Chat.
Even though those channels work differently, your app uses one shared handler: `handle_message_ready(...)`.

TAC turns each incoming message or voice utterance into text for your handler.
Your handler sends that text to OpenAI, uses TAC memory for helpful context, and
returns a reply through the same channel the user came from.

```text label="Core pattern"
User contacts the agent
-> TAC turns the channel event into text
-> handle_message_ready receives text plus memory
-> OpenAI creates a response
-> TAC sends the reply back on SMS, Voice, or Web Chat
```

**Major Takeaways**

- How to connect one LLM-powered agent to multiple communication channels.
- Why an orchestration layer saves development time by handling channel plumbing.
- How built-in conversation memory reduces custom state management.
- When a managed conversation platform is a good fit for multi-channel AI projects.

## Step: What's Next?

From here, you can expand on this workshop agent into a more capable product experience.

1. Add function calling capabilities.

   Let the agent call tools for hotel search, flight lookup, weather, restaurant
   recommendations, or booking handoff. 
   
   Start with the [OpenAI Function Calling](https://developers.openai.com/api/docs/guides/function-calling)
   and add tools around the external APIs your app needs.

2. Add more communication channels.

   The same handler pattern can expand beyond SMS, Voice, and Web Chat. 
   
- [Add RCS example](https://github.com/twilio/twilio-agent-connect-python/blob/main/getting_started/examples/features/rcs.py)
- [Add WhatsApp example](https://github.com/twilio/twilio-agent-connect-python/blob/main/getting_started/examples/features/whatsapp.py)

   Explore the [TAC Python SDK](https://github.com/twilio/twilio-agent-connect-python)
   and [TAC examples](https://github.com/twilio/twilio-agent-connect-python/tree/main/getting_started/examples)
   to see how other channels fit into the same architecture.

3. Stream responses for lower Voice latency.

   For phone calls, streaming can make the agent feel more natural because the
   caller hears the first words sooner. 

   Use [TAC examples](https://github.com/twilio/twilio-agent-connect-python/tree/main/getting_started/examples) as a starting point for streaming patterns.

4. Add Conversation Intelligence

    Analyze live or completed conversations to extract insights such as sentiment, language, intent, topics, summaries, and next-best actions. Use these signals to improve agent responses, trigger escalation, update memory, or understand common customer needs.

    Explore using [Conversation Intelligence](https://www.twilio.com/docs/conversations/intelligence) in relation to [Conversation Orchestrator](https://www.twilio.com/docs/conversations/intelligence/create-intelligence-configuration#why-use-conversation-orchestrator-with-conversation-intelligence).  

5. Deploy the agent to production.

   See the [AWS Fargate](https://www.twilio.com/docs/conversations/agent-connect/integrations/aws/deploy) and [Azure Container Apps](https://www.twilio.com/docs/conversations/agent-connect/integrations/microsoft-foundry/deploy) deployment guides.

6. Explore other ways to build 

- [TAC Python Claude.md](https://github.com/twilio/twilio-agent-connect-python/blob/main/CLAUDE.md): Use this when working with a coding assistant so it understands TAC concepts and project conventions.
- [TAC TypeScript SDK](https://github.com/twilio/twilio-agent-connect-typescript): Use this if your production agent will be built in TypeScript instead of Python.



## Step: Leave Your Feedback (~1 min)

If you want, let us know how this workshop experience was by [filling in this form](https://forms.gle/UVynw9wwdoKZkRp57).
