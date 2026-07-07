(function registerSystemOverview() {
  window.workshopComponents = window.workshopComponents || {};

  const icons = {
    message:
      '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    phone:
      '<path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M13.8 16.6a1 1 0 0 0 1.2-.3l.4-.5A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.5.4a1 1 0 0 0-.3 1.2 14 14 0 0 0 6.4 6.4"/>',
    chat:
      '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    route:
      '<circle cx="6" cy="19" r="3"/><path d="M9 19h8a3 3 0 0 0 0-6H7a3 3 0 0 1 0-6h8"/><circle cx="18" cy="5" r="3"/>',
    server:
      '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    memory:
      '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M8 4h8"/><path d="M8 20h8"/><path d="M10 8h4"/><path d="M10 12h4"/><path d="M10 16h4"/>',
    bot:
      '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="3"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M10 17h4"/>',
    file:
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M9 18h4"/>',
    search:
      '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
  };

  function icon(name, className = "") {
    return `<svg class="overview-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  }

  window.workshopComponents["system-overview"] = function renderSystemOverview() {
    return `<section class="system-overview" aria-label="Multi-channel AI agent system overview">
      <div class="system-overview-header">
        <p class="chapter-kicker">System overview</p>
        <h3>One agent brain, multiple customer channels.</h3>
      </div>
      <svg class="system-overview-svg" viewBox="0 0 1000 500" role="img" aria-label="SMS, Voice, Web Chat, and other customer channels connect through the TAC Server to an LLM provider, with TAC retrieving context from Conversation Orchestrator and Conversation Memory.">
        <defs>
          <marker id="overviewArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8z" class="overview-arrow-head" />
          </marker>
          <filter id="overviewGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g class="overview-lines">
          <path class="overview-spoke" d="M190 88 H260" />
          <path class="overview-spoke" d="M190 200 H260" />
          <path class="overview-spoke" d="M190 312 H260" />
          <path class="overview-spoke" d="M190 424 H260" />
          <path class="overview-bus" d="M260 88 V424" />
          <path id="channelsToTac" class="overview-channel-flow" d="M260 200 H360" marker-end="url(#overviewArrow)" />
          <path id="tacToLlm" d="M620 200 H760" marker-end="url(#overviewArrow)" />
          <path id="llmToTac" class="overview-return" d="M760 226 H620" marker-end="url(#overviewArrow)" />
          <path id="tacToOrchestrator" d="M430 255 V320" marker-end="url(#overviewArrow)" />
          <path id="orchestratorToTac" class="overview-return" d="M505 320 V255" marker-end="url(#overviewArrow)" />
          <path id="tacToMemory" d="M545 255 C610 284 715 284 715 320" marker-end="url(#overviewArrow)" />
          <path id="memoryToTac" class="overview-return" d="M790 320 C790 268 638 268 570 255" marker-end="url(#overviewArrow)" />

          <text x="252" y="184">customer conversations</text>
          <text x="676" y="184">prompt</text>
          <text x="676" y="250">LLM response</text>
          <text x="398" y="288">conversation events</text>
          <text x="642" y="290">profile context</text>
        </g>

        <g class="overview-packets">
          <circle class="overview-packet overview-packet-forward" r="5">
            <animateMotion dur="2.6s" repeatCount="indefinite" path="M190 88 H260 V200 H360" />
          </circle>
          <circle class="overview-packet overview-packet-forward" r="5">
            <animateMotion dur="2.3s" begin="-0.8s" repeatCount="indefinite" path="M190 200 H360" />
          </circle>
          <circle class="overview-packet overview-packet-forward" r="5">
            <animateMotion dur="2.8s" begin="-1.4s" repeatCount="indefinite" path="M190 312 H260 V200 H360" />
          </circle>
          <circle class="overview-packet overview-packet-forward" r="5">
            <animateMotion dur="3s" begin="-2s" repeatCount="indefinite" path="M190 424 H260 V200 H360" />
          </circle>
          <circle class="overview-packet overview-packet-forward" r="5">
            <animateMotion dur="2.1s" begin="-0.4s" repeatCount="indefinite" path="M620 200 H760" />
          </circle>
          <circle class="overview-packet overview-packet-return" r="5">
            <animateMotion dur="2.3s" begin="-1s" repeatCount="indefinite" path="M760 226 H620" />
          </circle>
          <circle class="overview-packet overview-packet-down" r="5">
            <animateMotion dur="2.4s" begin="-0.8s" repeatCount="indefinite" path="M430 255 V320" />
          </circle>
          <circle class="overview-packet overview-packet-return" r="5">
            <animateMotion dur="2.4s" begin="-1.6s" repeatCount="indefinite" path="M505 320 V255" />
          </circle>
          <circle class="overview-packet overview-packet-down" r="5">
            <animateMotion dur="2.8s" begin="-1.3s" repeatCount="indefinite" path="M545 255 C610 284 715 284 715 320" />
          </circle>
          <circle class="overview-packet overview-packet-return" r="5">
            <animateMotion dur="2.8s" begin="-2.1s" repeatCount="indefinite" path="M790 320 C790 268 638 268 570 255" />
          </circle>
        </g>

        <g class="overview-node overview-channel" transform="translate(40 52)">
          <rect width="150" height="72" rx="16" />
          <foreignObject x="20" y="20" width="32" height="32">
            <div xmlns="http://www.w3.org/1999/xhtml" class="overview-icon-wrap">${icon("message")}</div>
          </foreignObject>
          <text x="96" y="45" text-anchor="middle">SMS</text>
        </g>

        <g class="overview-node overview-channel" transform="translate(40 164)">
          <rect width="150" height="72" rx="16" />
          <foreignObject x="20" y="20" width="32" height="32">
            <div xmlns="http://www.w3.org/1999/xhtml" class="overview-icon-wrap">${icon("phone")}</div>
          </foreignObject>
          <text x="96" y="45" text-anchor="middle">Voice</text>
        </g>

        <g class="overview-node overview-channel" transform="translate(40 276)">
          <rect width="150" height="72" rx="16" />
          <foreignObject x="20" y="20" width="32" height="32">
            <div xmlns="http://www.w3.org/1999/xhtml" class="overview-icon-wrap">${icon("chat")}</div>
          </foreignObject>
          <text x="96" y="45" text-anchor="middle">Web Chat</text>
        </g>

        <g class="overview-node overview-channel" transform="translate(40 388)">
          <rect width="150" height="72" rx="16" />
          <text x="75" y="45" text-anchor="middle">Other Channels</text>
        </g>

        <g class="overview-node overview-hot" transform="translate(360 145)" filter="url(#overviewGlow)">
          <rect width="260" height="110" rx="22" />
          <foreignObject x="112" y="18" width="36" height="36">
            <div xmlns="http://www.w3.org/1999/xhtml" class="overview-icon-wrap overview-icon-hot">${icon("server")}</div>
          </foreignObject>
          <text x="130" y="74" text-anchor="middle">TAC Server Runtime</text>
          <text x="130" y="98" text-anchor="middle">FastAPI + one message handler</text>
        </g>

        <g class="overview-node overview-support" transform="translate(330 320)">
          <rect width="245" height="92" rx="18" />
          <text x="122" y="42" text-anchor="middle">Conversation Orchestrator</text>
          <text x="122" y="62" text-anchor="middle">groups events into conversations</text>
        </g>

        <g class="overview-node overview-support" transform="translate(630 320)">
          <rect width="235" height="92" rx="18" />
          <text x="118" y="42" text-anchor="middle">Conversation Memory</text>
          <text x="118" y="62" text-anchor="middle">stores profile context</text>
        </g>

        <g class="overview-node overview-llm" transform="translate(760 159)">
          <rect width="150" height="82" rx="18" />
          <foreignObject x="59" y="10" width="32" height="32">
            <div xmlns="http://www.w3.org/1999/xhtml" class="overview-icon-wrap">${icon("bot")}</div>
          </foreignObject>
          <text x="75" y="55" text-anchor="middle">LLM</text>
          <text x="75" y="73" text-anchor="middle">e.g. OpenAI, Gemini</text>
        </g>
      </svg>
    </section>`;
  };
})();
