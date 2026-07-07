const contentFiles = [
  "content/01-mission.md",
  "content/02-setup.md",
  "content/03-build-basic-agent.md",
  "content/04-extend-agent.md",
  "content/05-wrap-up.md"
];

const storageKey = "multi-channel-ai-agent-workshop-v1";
const state = loadState();
let chapters = [];
let activeChapter = state.activeChapter || 0;
let activeStep = state.activeStep || 0;

const chapterTabs = document.querySelector("#chapterTabs");
const stepList = document.querySelector("#stepList");
const chapterKicker = document.querySelector("#chapterKicker");
const chapterTitle = document.querySelector("#chapterTitle");
const chapterSummary = document.querySelector("#chapterSummary");
const chapterContent = document.querySelector("#chapterContent");
const content = document.querySelector("#content");
const progressFill = document.querySelector("#progressFill");
const progressLabel = document.querySelector("#progressLabel");
const prevStepButton = document.querySelector("#prevStep");
const nextStepButton = document.querySelector("#nextStep");
const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector("#themeIcon");
const resetProgressButton = document.querySelector("#resetProgress");
const resetDialog = document.querySelector("#resetDialog");
const cancelResetButton = document.querySelector("#cancelReset");
const confirmResetButton = document.querySelector("#confirmReset");

applyTheme(state.theme || "dark");

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      completed: parsed.completed || {},
      activeChapter: parsed.activeChapter || 0,
      activeStep: parsed.activeStep || 0,
      theme: parsed.theme === "light" ? "light" : "dark"
    };
  } catch {
    return { completed: {}, activeChapter: 0, activeStep: 0, theme: "dark" };
  }
}

function saveState() {
  state.activeChapter = activeChapter;
  state.activeStep = activeStep;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function applyTheme(theme) {
  state.theme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  if (!themeToggle || !themeIcon) return;

  const isLight = state.theme === "light";
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeIcon.textContent = isLight ? "🌙" : "☀️";
}

function showResetDialog() {
  resetDialog.hidden = false;
  confirmResetButton.focus();
}

function hideResetDialog() {
  resetDialog.hidden = true;
  resetProgressButton.focus();
}

function copyText(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).catch(() => copyTextWithSelection(text));
  }
  return copyTextWithSelection(text);
}

function copyTextWithSelection(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied ? Promise.resolve() : Promise.reject(new Error("Copy command failed"));
}

function selectCodeBlock(copyButton) {
  const code = copyButton.closest(".code-block").querySelector("code");
  if (!code) return false;

  const range = document.createRange();
  range.selectNodeContents(code);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeHref(value) {
  const href = String(value).trim();
  if (/^(https?:|mailto:|#|\.\/|\.\.\/|\/)/.test(href)) return href;
  return "#";
}

function renderInlineMarkdown(value) {
  const source = String(value);
  const inlinePattern = /(`[^`]+`)|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let html = "";
  let cursor = 0;

  for (const match of source.matchAll(inlinePattern)) {
    html += escapeHtml(source.slice(cursor, match.index));

    if (match[1]) {
      html += `<code>${escapeHtml(match[1].slice(1, -1))}</code>`;
    } else if (match[2]) {
      html += `<strong>${escapeHtml(match[2])}</strong>`;
    } else {
      html += `<a href="${escapeHtml(sanitizeHref(match[4]))}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[3])}</a>`;
    }

    cursor = match.index + match[0].length;
  }

  html += escapeHtml(source.slice(cursor));
  return html;
}

function parseNumberedList(lines) {
  const items = [];

  for (const line of lines) {
    if (/^\d+\.\s+/.test(line)) {
      items.push({
        text: line.replace(/^\d+\.\s+/, ""),
        bullets: []
      });
    } else if (line.startsWith("- ") && items.length) {
      items[items.length - 1].bullets.push(line.replace(/^- /, ""));
    }
  }

  return items;
}

function parseBulletList(lines) {
  const items = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      items.push(trimmed.replace(/^- /, ""));
    } else if (items.length) {
      items[items.length - 1] = `${items[items.length - 1]} ${trimmed}`;
    }
  }

  return items;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: markdown };

  const metadata = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { metadata, body: match[2] };
}

function parseQuiz(markdown) {
  const match = markdown.match(/^## Quiz\n([\s\S]*)$/m);
  if (!match) return null;

  const lines = match[1].trim().split("\n").map((line) => line.trim()).filter(Boolean);
  const questionLine = lines.find((line) => line.toLowerCase().startsWith("question:"));
  const optionLines = lines.filter((line) => line.startsWith("- "));
  const options = optionLines.map((line) => line.replace(/^- /, "").replace(/\s+\*$/, ""));
  const answerLine = optionLines.find((line) => /\s+\*$/.test(line));

  return {
    question: questionLine ? questionLine.replace(/^question:\s*/i, "") : "",
    options,
    answer: answerLine ? answerLine.replace(/^- /, "").replace(/\s+\*$/, "") : ""
  };
}

function parseCodeFence(block) {
  const match = block.match(/```([^\n]*)\n([\s\S]*?)```/);
  if (!match) return { codeLabel: "", codeLanguage: "", code: "", diagram: null, component: null };

  const info = match[1].trim();
  const type = info.split(/\s+/)[0] || "";
  const labelMatch = info.match(/label="([^"]+)"/) || info.match(/^[^\s]+\s+(.+)$/);
  const code = match[2].trim();
  if (type === "component") {
    const nameMatch = info.match(/name="([^"]+)"/) || info.match(/^[^\s]+\s+(.+)$/);
    return {
      codeLabel: "",
      codeLanguage: "",
      code: "",
      diagram: null,
      component: nameMatch ? nameMatch[1] : code
    };
  }

  if (type === "diagram") {
    return {
      codeLabel: "",
      codeLanguage: "",
      code: "",
      component: null,
      diagram: {
        label: labelMatch ? labelMatch[1] : "Diagram",
        nodes: code
          .split("\n")
          .map((line) => {
            const [title, ...description] = line.split("|");
            return {
              title: title.trim(),
              description: description.join("|").trim()
            };
          })
          .filter((node) => node.title)
      }
    };
  }

  return {
    codeLabel: labelMatch ? labelMatch[1] : "Code",
    codeLanguage: type || "text",
    code,
    diagram: null,
    component: null
  };
}

function parseMarkdownBlocks(markdown) {
  const blocks = [];
  const fencePattern = /```[^\n]*\n[\s\S]*?```/g;
  let cursor = 0;

  function addTextBlocks(text) {
    const chunks = text
      .trim()
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const rawLines = chunk.split("\n").filter((line) => line.trim());
      const lines = rawLines.map((line) => line.trim());
      if (!lines.length) continue;

      if (lines.every((line) => line.startsWith(">"))) {
        const quoteLines = lines.map((line) => line.replace(/^>\s?/, ""));
        const calloutMatch = quoteLines[0].match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i);
        blocks.push({
          type: "callout",
          variant: calloutMatch ? calloutMatch[1].toLowerCase() : "quote",
          title: calloutMatch ? calloutMatch[1].toUpperCase() : "",
          text: (calloutMatch ? quoteLines.slice(1) : quoteLines).join(" ")
        });
      } else if (lines.some((line) => /^\d+\.\s+/.test(line))) {
        blocks.push({
          type: "instructions",
          items: parseNumberedList(lines)
        });
      } else if (lines[0].startsWith("- ") && rawLines.every((line) => line.trim().startsWith("- ") || /^\s+\S/.test(line))) {
        blocks.push({
          type: "bullets",
          items: parseBulletList(rawLines)
        });
      } else {
        blocks.push({
          type: "paragraph",
          text: lines.join(" ")
        });
      }
    }
  }

  for (const match of markdown.matchAll(fencePattern)) {
    addTextBlocks(markdown.slice(cursor, match.index));
    const code = parseCodeFence(match[0]);

    if (code.component) {
      blocks.push({ type: "component", name: code.component });
    } else if (code.diagram) {
      blocks.push({ type: "diagram", diagram: code.diagram });
    } else if (code.code) {
      blocks.push({ type: "code", code });
    }

    cursor = match.index + match[0].length;
  }

  addTextBlocks(markdown.slice(cursor));
  return blocks;
}

function parseStep(section) {
  const lines = section.trim().split("\n");
  const title = lines.shift().trim();
  const body = lines.join("\n").trim();
  return { title, blocks: parseMarkdownBlocks(body) };
}

function parseChapterMarkdown(markdown) {
  const { metadata, body } = parseFrontmatter(markdown);
  const bodyWithoutQuiz = body.replace(/^## Quiz\n[\s\S]*$/m, "").trim();
  const sections = bodyWithoutQuiz.split(/^## Step:\s+/m);
  const intro = sections.shift().trim();

  return {
    title: metadata.title || "Untitled chapter",
    summary: metadata.summary || "",
    badge: metadata.badge || "",
    intro,
    steps: sections.map(parseStep),
    quiz: parseQuiz(body)
  };
}

function stepKey(chapterIndex, stepIndex) {
  return `${chapterIndex}:${stepIndex}`;
}

function isStepDone(chapterIndex, stepIndex) {
  return Boolean(state.completed[stepKey(chapterIndex, stepIndex)]);
}

function isChapterDone(chapterIndex) {
  return chapters[chapterIndex].steps.every((_, stepIndex) => isStepDone(chapterIndex, stepIndex));
}

function totalStepCount() {
  return chapters.reduce((sum, chapter) => sum + chapter.steps.length, 0);
}

function completedStepCount() {
  return Object.values(state.completed).filter(Boolean).length;
}

function renderChapterTabs() {
  chapterTabs.innerHTML = chapters
    .map((chapter, index) => {
      const active = index === activeChapter;
      const done = isChapterDone(index);
      return `<button class="chapter-tab ${active ? "is-active" : ""} ${done ? "is-done" : ""}" type="button" data-chapter="${index}" aria-current="${active}">
        <span class="chapter-number">${done ? "✓" : escapeHtml(chapter.badge || index + 1)}</span>
        <span class="chapter-tab-label">${escapeHtml(chapter.title)}</span>
      </button>`;
    })
    .join("");
}

function renderSideRail() {
  const chapter = chapters[activeChapter];
  chapterKicker.textContent = `Chapter ${activeChapter + 1}`;
  chapterTitle.textContent = chapter.title;
  chapterSummary.textContent = chapter.summary;
  stepList.innerHTML = chapter.steps
    .map((step, index) => {
      const current = index === activeStep ? "step" : "false";
      const done = isStepDone(activeChapter, index);
      return `<button class="step-link ${done ? "is-done" : ""}" type="button" data-step="${index}" aria-current="${current}">
        <span class="step-state">${done ? "✓" : index + 1}</span>
        <span>${escapeHtml(step.title)}</span>
      </button>`;
    })
    .join("");
}

function renderInstructions(instructions, startIndex = 0) {
  if (!instructions.length) return "";
  return `<div class="instruction-stack">${instructions
    .map(
      (item, index) => {
        const stepNumber = startIndex + index + 1;
        const text = typeof item === "string" ? item : item.text;
        const bullets = typeof item === "string" ? [] : item.bullets || [];
        return `<article class="instruction-card">
        <div class="instruction-marker">${stepNumber}</div>
        <div>
          <div class="step-kicker">Step ${stepNumber}</div>
          <strong class="instruction-text">${renderInlineMarkdown(text)}</strong>
          ${bullets.length ? renderBullets(bullets, "nested") : ""}
        </div>
      </article>`;
      }
    )
    .join("")}</div>`;
}

function renderBullets(bullets, variant = "") {
  if (!bullets.length) return "";
  return `<ul class="markdown-list ${variant ? `markdown-list-${variant}` : ""}">${bullets.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`;
}

function renderCallout(callout) {
  if (!callout || !callout.text) return "";
  const title = callout.title || "Note";
  return `<aside class="markdown-callout markdown-callout-${escapeHtml(callout.variant || "note")}">
    <div class="callout-title">${escapeHtml(title)}</div>
    <p>${renderInlineMarkdown(callout.text)}</p>
  </aside>`;
}

function renderCodeBlock(codeBlock) {
  if (!codeBlock || !codeBlock.code) return "";
  const code = escapeHtml(codeBlock.code);
  return `<figure class="code-block">
    <figcaption>
      <span class="code-title">${escapeHtml(codeBlock.codeLabel || "Code")}</span>
      <span class="code-language">${escapeHtml(codeBlock.codeLanguage || "text")}</span>
      <button class="copy-code" type="button" data-copy-code="${code}" aria-label="Copy ${escapeHtml(codeBlock.codeLabel || "code block")}">Copy</button>
    </figcaption>
    <pre><code>${code}</code></pre>
  </figure>`;
}

function renderDiagram(diagram) {
  if (!diagram || !diagram.nodes.length) return "";
  return `<figure class="architecture-diagram">
    <figcaption>${escapeHtml(diagram.label)}</figcaption>
    <div class="diagram-flow">
      ${diagram.nodes
        .map(
          (node, index) => `<article class="diagram-node">
            <div class="diagram-index">${index + 1}</div>
            <div>
              <h3>${renderInlineMarkdown(node.title)}</h3>
              ${node.description ? `<p>${renderInlineMarkdown(node.description)}</p>` : ""}
            </div>
          </article>`
        )
        .join("")}
    </div>
  </figure>`;
}

function renderComponent(name) {
  if (!name) return "";
  const renderer = window.workshopComponents && window.workshopComponents[name];
  if (!renderer) {
    return `<p class="component-error">Unknown component: ${escapeHtml(name)}</p>`;
  }
  return renderer();
}

function renderQuiz(chapter) {
  if (!chapter.quiz) return "";
  return `<section class="quiz-card">
    <p class="eyebrow">Check your understanding</p>
    <h3>${renderInlineMarkdown(chapter.quiz.question)}</h3>
    <div class="quiz-options">
      ${chapter.quiz.options.map((option) => `<button type="button" data-quiz-option="${escapeHtml(option)}">${renderInlineMarkdown(option)}</button>`).join("")}
    </div>
  </section>`;
}

function renderStepBlocks(blocks) {
  let paragraphCount = 0;
  let instructionCount = 0;
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        const className = paragraphCount === 0 ? "lesson-lead" : "lesson-paragraph";
        paragraphCount += 1;
        return `<p class="${className}">${renderInlineMarkdown(block.text)}</p>`;
      }
      if (block.type === "instructions") {
        const html = renderInstructions(block.items, instructionCount);
        instructionCount += block.items.length;
        return html;
      }
      if (block.type === "bullets") return renderBullets(block.items);
      if (block.type === "callout") return renderCallout(block);
      if (block.type === "component") return renderComponent(block.name);
      if (block.type === "diagram") return renderDiagram(block.diagram);
      if (block.type === "code") return renderCodeBlock(block.code);
      return "";
    })
    .join("");
}

function renderContent() {
  const chapter = chapters[activeChapter];
  const step = chapter.steps[activeStep];
  chapterContent.innerHTML = `<article class="lesson-card">
    <div class="lesson-header">
      <div>
        <p class="eyebrow">Step ${activeStep + 1}</p>
        <h2>${escapeHtml(step.title)}</h2>
      </div>
    </div>
    ${activeStep === 0 && chapter.intro ? `<p class="chapter-intro">${renderInlineMarkdown(chapter.intro)}</p>` : ""}
    ${renderStepBlocks(step.blocks)}
    ${activeStep === chapter.steps.length - 1 ? renderQuiz(chapter) : ""}
    <div class="complete-step-row">
      <button class="complete-step ${isStepDone(activeChapter, activeStep) ? "is-done" : ""}" type="button" data-complete-step="${activeStep}">
        ${isStepDone(activeChapter, activeStep) ? "Completed" : "Mark complete"}
      </button>
    </div>
  </article>`;
}

function renderProgress() {
  const complete = completedStepCount();
  const total = totalStepCount();
  const percent = total ? Math.round((complete / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = `Chapter ${activeChapter + 1} · Step ${activeStep + 1}/${chapters[activeChapter].steps.length} · ${percent}% complete`;
  prevStepButton.disabled = activeChapter === 0 && activeStep === 0;
  nextStepButton.disabled = activeChapter === chapters.length - 1 && activeStep === chapters[activeChapter].steps.length - 1;
}

function renderAll({ keepScroll = false } = {}) {
  renderChapterTabs();
  renderSideRail();
  renderContent();
  renderProgress();
  saveState();
  if (!keepScroll) {
    content.scrollTop = 0;
    content.focus({ preventScroll: true });
  }
}

function goToStep(chapter, step) {
  activeChapter = Math.max(0, Math.min(chapter, chapters.length - 1));
  activeStep = Math.max(0, Math.min(step, chapters[activeChapter].steps.length - 1));
  renderAll();
}

function getSiblingStep(direction) {
  if (direction < 0 && activeStep > 0) return { chapter: activeChapter, step: activeStep - 1 };
  if (direction < 0 && activeChapter > 0) return { chapter: activeChapter - 1, step: chapters[activeChapter - 1].steps.length - 1 };
  if (direction > 0 && activeStep < chapters[activeChapter].steps.length - 1) return { chapter: activeChapter, step: activeStep + 1 };
  if (direction > 0 && activeChapter < chapters.length - 1) return { chapter: activeChapter + 1, step: 0 };
  return null;
}

document.addEventListener("click", (event) => {
  const chapterButton = event.target.closest("[data-chapter]");
  if (chapterButton) goToStep(Number(chapterButton.dataset.chapter), 0);

  const stepButton = event.target.closest("[data-step]");
  if (stepButton) goToStep(activeChapter, Number(stepButton.dataset.step));

  const completeButton = event.target.closest("[data-complete-step]");
  if (completeButton) {
    const key = stepKey(activeChapter, Number(completeButton.dataset.completeStep));
    state.completed[key] = !state.completed[key];
    renderAll({ keepScroll: true });
  }

  const quizButton = event.target.closest("[data-quiz-option]");
  if (quizButton) {
    const answer = chapters[activeChapter].quiz.answer;
    quizButton.parentElement.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-correct", button.dataset.quizOption === answer);
      button.classList.toggle("is-wrong", button === quizButton && button.dataset.quizOption !== answer);
    });
  }

  const copyButton = event.target.closest("[data-copy-code]");
  if (copyButton) {
    const code = copyButton.dataset.copyCode || "";
    copyText(code)
      .then(() => {
        copyButton.textContent = "Copied";
        copyButton.classList.add("is-copied");
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.classList.remove("is-copied");
        }, 1400);
      })
      .catch(() => {
        const selected = selectCodeBlock(copyButton);
        copyButton.textContent = selected ? "Selected" : "Copy failed";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1400);
      });
  }
});

prevStepButton.addEventListener("click", () => {
  const previous = getSiblingStep(-1);
  if (previous) goToStep(previous.chapter, previous.step);
});

nextStepButton.addEventListener("click", () => {
  const next = getSiblingStep(1);
  if (next) goToStep(next.chapter, next.step);
});

themeToggle.addEventListener("click", () => {
  applyTheme(state.theme === "light" ? "dark" : "light");
  saveState();
});

resetProgressButton.addEventListener("click", () => {
  showResetDialog();
});

cancelResetButton.addEventListener("click", hideResetDialog);

confirmResetButton.addEventListener("click", () => {
  state.completed = {};
  renderAll({ keepScroll: true });
  hideResetDialog();
});

resetDialog.addEventListener("click", (event) => {
  if (event.target === resetDialog) hideResetDialog();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !resetDialog.hidden) hideResetDialog();
});

async function loadChapters() {
  try {
    const markdownFiles = await Promise.all(
      contentFiles.map(async (file) => {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Could not load ${file}`);
        return response.text();
      })
    );
    chapters = markdownFiles.map(parseChapterMarkdown);
    activeChapter = Math.min(activeChapter, chapters.length - 1);
    activeStep = Math.min(activeStep, chapters[activeChapter].steps.length - 1);
    renderAll();
  } catch (error) {
    chapterTitle.textContent = "Could not load workshop content";
    chapterSummary.textContent = "The markdown guide needs to be served over HTTP so the browser can fetch content files.";
    chapterContent.innerHTML = `<article class="lesson-card">
      <div class="lesson-header">
        <div>
          <p class="eyebrow">Local preview</p>
          <h2>Start the workshop server</h2>
        </div>
      </div>
      <p class="lesson-lead">Run this from the repository root, then open the workshop URL in your browser.</p>
      <figure class="code-block">
        <figcaption>Terminal</figcaption>
        <pre><code>python3 -m http.server 8765

http://localhost:8765/workshop/</code></pre>
      </figure>
      <pre class="error">${escapeHtml(error.message)}</pre>
    </article>`;
  }
}

loadChapters();
