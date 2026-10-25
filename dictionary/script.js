const localWords = {
  hello: { phonetic: "/həˈləʊ/", meaning: "你好；喂；哈罗", part: "感叹词", example: "Hello, how are you today?" },
  dream: { phonetic: "/driːm/", meaning: "梦；梦想；做梦", part: "名词 / 动词", example: "Never stop chasing your dream." },
  courage: { phonetic: "/ˈkʌrɪdʒ/", meaning: "勇气；胆量", part: "名词", example: "It takes courage to begin again." },
  serendipity: { phonetic: "/ˌserənˈdɪpəti/", meaning: "意外发现美好事物的幸运；机缘巧合", part: "名词", example: "Meeting her was pure serendipity." },
  love: { phonetic: "/lʌv/", meaning: "爱；热爱；喜爱", part: "名词 / 动词", example: "Love makes ordinary moments meaningful." },
  beautiful: { phonetic: "/ˈbjuːtɪfəl/", meaning: "美丽的；美好的；出色的", part: "形容词", example: "What a beautiful morning!" },
  learn: { phonetic: "/lɜːn/", meaning: "学习；得知；认识到", part: "动词", example: "We learn something new every day." },
  freedom: { phonetic: "/ˈfriːdəm/", meaning: "自由；自主", part: "名词", example: "Education gives us the freedom to choose." },
  kindness: { phonetic: "/ˈkaɪndnəs/", meaning: "善良；友好；体贴", part: "名词", example: "A little kindness can change someone's day." },
  future: { phonetic: "/ˈfjuːtʃə/", meaning: "未来；将来；未来的", part: "名词 / 形容词", example: "The future begins with what we do today." },
  study: { phonetic: "/ˈstʌdi/", meaning: "学习；研究；功课", part: "名词 / 动词", example: "I study English every evening." },
  book: { phonetic: "/bʊk/", meaning: "书；书籍；预订", part: "名词 / 动词", example: "This book is easy to understand." },
  apple: { phonetic: "/ˈæpəl/", meaning: "苹果", part: "名词", example: "She eats an apple every morning." },
  friend: { phonetic: "/frend/", meaning: "朋友；友人", part: "名词", example: "A good friend listens to you." },
  happy: { phonetic: "/ˈhæpi/", meaning: "快乐的；幸福的；满意的", part: "形容词", example: "I am happy to see you." },
  school: { phonetic: "/skuːl/", meaning: "学校；上学", part: "名词", example: "The children walk to school." },
  teacher: { phonetic: "/ˈtiːtʃə/", meaning: "教师；老师", part: "名词", example: "Our teacher makes every lesson interesting." },
  student: { phonetic: "/ˈstjuːdənt/", meaning: "学生；大学生", part: "名词", example: "Every student has a notebook." },
  water: { phonetic: "/ˈwɔːtə/", meaning: "水；给……浇水", part: "名词 / 动词", example: "Please drink more water." },
  computer: { phonetic: "/kəmˈpjuːtə/", meaning: "计算机；电脑", part: "名词", example: "I use a computer for my work." }
};

const form = document.querySelector("#search-form");
const input = document.querySelector("#word-input");
const message = document.querySelector("#form-message");
const card = document.querySelector("#result-card");
const soundButton = document.querySelector("#sound-button");
let currentAudio = "";
let currentWord = "";
let latestSearch = 0;

function setLoading(isLoading) {
  const button = form.querySelector("button[type='submit']");
  button.disabled = isLoading;
  button.innerHTML = isLoading ? "查询中…" : "查询单词 <span aria-hidden='true'>→</span>";
}

function showResult(word, data) {
  document.querySelector("#result-word").textContent = word;
  document.querySelector("#phonetic").textContent = data.phonetic || "暂无音标";
  const { meanings, parts } = parseDictionaryEntry(data);
  document.querySelector("#part-of-speech").textContent = data.level || "英文单词";
  renderMeanings(meanings, parts);
  const exampleBox = document.querySelector("#example-box");
  exampleBox.classList.toggle("is-hidden", !data.example);
  document.querySelector("#example-text").textContent = data.example || "";
  currentAudio = data.audio || "";
  currentWord = word;
  card.classList.remove("is-hidden");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

const partNames = {
  n: "名词", v: "动词", vt: "及物动词", vi: "不及物动词",
  adj: "形容词", a: "形容词", adv: "副词", prep: "介词",
  conj: "连词", pron: "代词", num: "数词", art: "冠词",
  int: "感叹词", aux: "助动词", modal: "情态动词"
};

function parseDictionaryEntry(data) {
  const source = String(data.meaning || "暂无中文释义")
    .replace(/\\n|\n/g, "；")
    .replace(/\s+/g, " ")
    .trim();
  const detectedParts = [];
  const partPattern = /(?:^|[；;,]\s*)(n|v|vt|vi|adj|a|adv|prep|conj|pron|num|art|int|aux|modal)\./gi;
  let match;
  while ((match = partPattern.exec(source))) {
    const name = partNames[match[1].toLowerCase()];
    if (name && !detectedParts.includes(name)) detectedParts.push(name);
  }
  String(data.part || "").split(/\s*\/\s*|、/).forEach((part) => {
    const normalized = part.trim();
    if (normalized && normalized !== "英文单词" && !detectedParts.includes(normalized)) detectedParts.push(normalized);
  });

  const meanings = source
    .split(/[；;](?=\s*(?:(?:n|v|vt|vi|adj|a|adv|prep|conj|pron|num|art|int|aux|modal)\.)?)/i)
    .flatMap((group) => {
      const cleaned = group.replace(/^\s*(?:n|v|vt|vi|adj|a|adv|prep|conj|pron|num|art|int|aux|modal)\.\s*/i, "").trim();
      return cleaned.split(/[,，](?=\s*[^0-9])/).map((item) => item.trim());
    })
    .filter(Boolean);

  return { meanings: [...new Set(meanings)], parts: detectedParts };
}

function renderMeanings(meanings, parts) {
  const container = document.querySelector("#meaning-list");
  container.replaceChildren();
  meanings.forEach((meaning, index) => {
    const item = document.createElement("div");
    item.className = "meaning-item";
    item.dataset.index = String(index + 1).padStart(2, "0");
    const text = document.createElement("span");
    text.textContent = meaning;
    item.append(text);
    container.append(item);
  });
  if (parts.length) {
    const chips = document.createElement("div");
    chips.className = "pos-chips";
    parts.forEach((part) => {
      const chip = document.createElement("span");
      chip.className = "pos-chip";
      chip.textContent = part;
      chips.append(chip);
    });
    container.append(chips);
  }
}

async function fetchWithTimeout(url, timeout = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function queryOnline(word) {
  const dictionaryUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`;
  const [dictionaryResult, translationResult] = await Promise.allSettled([
    fetchWithTimeout(dictionaryUrl),
    fetchWithTimeout(translationUrl)
  ]);

  const dictionaryResponse = dictionaryResult.status === "fulfilled" ? dictionaryResult.value : null;
  const translationResponse = translationResult.status === "fulfilled" ? translationResult.value : null;
  if (!dictionaryResponse?.ok && !translationResponse?.ok) {
    throw new Error("联网词典暂时无法访问。你可以先查询下方推荐词，或把新单词加入离线词库。" );
  }

  const dictionaryData = dictionaryResponse?.ok ? await dictionaryResponse.json() : [];
  const translationData = translationResponse?.ok ? await translationResponse.json() : null;
  const entry = dictionaryData[0] || {};
  const phoneticItem = entry.phonetics?.find((item) => item.text || item.audio) || {};
  const meaning = entry.meanings?.[0];
  const definition = meaning?.definitions?.find((item) => item.example) || meaning?.definitions?.[0];
  const translated = translationData?.responseData?.translatedText;

  return {
    phonetic: entry.phonetic || phoneticItem.text || "暂无音标",
    meaning: translated && translated.toLowerCase() !== word ? translated : "中文翻译暂不可用",
    part: meaning?.partOfSpeech || "英文单词",
    example: definition?.example || "",
    audio: entry.phonetics?.find((item) => item.audio)?.audio || ""
  };
}

async function search(rawWord) {
  const searchId = ++latestSearch;
  const word = rawWord.trim().toLowerCase();
  message.textContent = "";
  if (!word) {
    message.textContent = "请先输入一个英文单词。";
    input.focus();
    return;
  }
  if (!/^[a-z]+(?:[-'][a-z]+)*$/i.test(word)) {
    message.textContent = "请输入正确的英文单词，只需输入字母。";
    input.focus();
    return;
  }

  setLoading(true);
  try {
    const data = localWords[word] || window.WORD_DATABASE?.[word] || await queryOnline(word);
    if (searchId !== latestSearch) return;
    showResult(word, data);
  } catch (error) {
    if (searchId !== latestSearch) return;
    card.classList.add("is-hidden");
    message.textContent = navigator.onLine ? error.message : "当前处于离线状态，这个词不在离线词库中。";
  } finally {
    if (searchId === latestSearch) setLoading(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search(input.value);
});

document.querySelectorAll("[data-word]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.word;
    search(button.dataset.word);
  });
});

soundButton.addEventListener("click", () => {
  if (currentAudio) {
    new Audio(currentAudio).play().catch(() => speakWord(currentWord));
  } else {
    speakWord(currentWord);
  }
});

function speakWord(word) {
  if (!("speechSynthesis" in window) || !word) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

if (window.location.protocol === "file:") {
  message.textContent = "提示：离线词可以直接查询；查询其他单词请在 VS Code 中使用 Live Server 打开本页。";
}

input.focus();

const moduleLabels = {
  listening: { zh: "听力", en: "Listening", hint: "音频、题目、听力原文与答案" },
  reading: { zh: "阅读", en: "Reading", hint: "文章、题目与难词侧栏释义" },
  writing: { zh: "写作", en: "Writing", hint: "题目、范文、答案对照与四维分析" },
  speaking: { zh: "口语", en: "Speaking", hint: "话题卡、问题、参考回答与表达分析" }
};
const ieltsContent = window.IELTS_CONTENT || { listening: [], reading: [], writing: [], speaking: [] };
const materialList = document.querySelector("#material-list");
const practicePanel = document.querySelector("#practice-panel");
let activeModule = "listening";

function renderIeltsModule(moduleName) {
  activeModule = moduleName;
  document.querySelectorAll(".module-tab").forEach((tab) => {
    const active = tab.dataset.module === moduleName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  const items = Array.isArray(ieltsContent[moduleName]) ? ieltsContent[moduleName] : [];
  materialList.replaceChildren();
  if (!items.length) {
    const note = document.createElement("p");
    note.className = "practice-meta";
    note.textContent = `${moduleLabels[moduleName].zh}资料尚未导入`;
    materialList.append(note);
    renderEmptyState(moduleName);
    return;
  }
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `material-item${index === 0 ? " is-active" : ""}`;
    button.textContent = item.title || `${moduleLabels[moduleName].zh} ${index + 1}`;
    button.addEventListener("click", () => {
      materialList.querySelectorAll(".material-item").forEach((entry) => entry.classList.remove("is-active"));
      button.classList.add("is-active");
      renderPractice(moduleName, item);
    });
    materialList.append(button);
  });
  renderPractice(moduleName, items[0]);
}

function renderEmptyState(moduleName) {
  const label = moduleLabels[moduleName];
  practicePanel.innerHTML = `
    <div class="empty-state">
      <div>
        <span class="empty-icon">${escapeHtml(label.en.slice(0, 1))}</span>
        <h3>等待导入${escapeHtml(label.zh)}资料</h3>
        <p>导入后这里将显示${escapeHtml(label.hint)}。当前没有放入演示题或受版权保护的教材内容。</p>
      </div>
    </div>`;
}

function renderPractice(moduleName, item) {
  const title = escapeHtml(item.title || moduleLabels[moduleName].zh);
  const meta = escapeHtml(item.meta || item.test || "学习资料");
  let body = `<h3 class="practice-title">${title}</h3><p class="practice-meta">${meta}</p>`;

  if (moduleName === "listening") {
    body += renderAudioParts(item.audioParts || []);
    body += renderPageGallery(item.questionPages || [], "听力题目");
    body += renderAnswerSheet(item.answerCount || 40, `${item.title}-listening`);
    body += revealPages("查看听力原文", "听力原文", item.transcriptPages || []);
    body += revealPages("查看答案", "答案", item.answerPages || []);
  } else if (moduleName === "reading") {
    body += `<div class="reading-layout"><div>${renderPageGallery(item.questionPages || [], "阅读文章与题目")}</div>${renderVocabularyHelper()}</div>`;
    body += renderAnswerSheet(item.answerCount || 40, `${item.title}-reading`);
    body += revealPages("查看答案", "阅读答案", item.answerPages || []);
  } else if (moduleName === "writing") {
    body += renderPageGallery(item.promptPages || [], "写作题目");
    body += `<div class="practice-section"><strong>我的作文</strong><textarea class="answer-input writing-draft" data-draft-key="${escapeAttribute(item.title)}" placeholder="在这里写下你的答案…"></textarea></div>`;
    body += revealPages("查看参考文章", "参考文章与考官点评", item.modelAnswerPages || []);
    body += renderAnalysis(item.analysis);
  } else {
    body += renderPageGallery(item.questionPages || [], "口语题目");
    body += `<div class="practice-section"><strong>回答提纲</strong><textarea class="answer-input writing-draft" data-draft-key="${escapeAttribute(item.title)}" placeholder="记录你的回答要点…"></textarea></div>`;
    body += renderAnalysis(item.analysis);
  }
  practicePanel.innerHTML = body;
  bindPracticeActions();
}

function renderAudioParts(parts) {
  if (!parts.length) return "";
  return `<section class="practice-section"><strong>分段音频</strong><div class="audio-list">${parts.map((part) => `
    <div class="audio-part"><div><b>${escapeHtml(part.title)}</b><small>${escapeHtml(part.range || "")}</small></div>
    <audio controls preload="metadata" src="${escapeAttribute(part.src)}"></audio></div>`).join("")}</div></section>`;
}

function renderPageGallery(images, title) {
  if (!images.length) return "";
  return `<section class="practice-section document-section"><strong>${escapeHtml(title)}</strong><p class="document-tip">点击页面可在新窗口查看原图。</p><div class="document-pages">${images.map((src, index) => `
    <a href="${escapeAttribute(src)}" target="_blank" rel="noopener" aria-label="查看${escapeAttribute(title)}第 ${index + 1} 页原图">
      <img src="${escapeAttribute(src)}" loading="lazy" alt="${escapeAttribute(title)}第 ${index + 1} 页" />
    </a>`).join("")}</div></section>`;
}

function renderAnswerSheet(count, storageKey) {
  const inputs = Array.from({ length: count }, (_, index) => `<label><span>${index + 1}</span><input type="text" data-answer-number="${index + 1}" autocomplete="off" /></label>`).join("");
  return `<section class="practice-section answer-sheet" data-storage-key="${escapeAttribute(storageKey)}"><div class="answer-sheet-heading"><strong>我的答案</strong><small>答案会保存在当前浏览器</small></div><div class="answer-grid">${inputs}</div></section>`;
}

function revealPages(buttonText, title, images) {
  if (!images.length) return "";
  const id = `reveal-${Math.random().toString(36).slice(2)}`;
  return `<div class="practice-actions"><button type="button" data-reveal="${id}">${escapeHtml(buttonText)}</button></div>
    <section class="practice-section is-hidden reveal-document" id="${id}">${renderPageGallery(images, title)}</section>`;
}

function renderVocabularyHelper() {
  return `<aside class="vocab-helper"><strong>阅读词汇助手</strong><p>在文章中看到难词时，输入英文单词即可在旁边查看中文意思。</p><div class="vocab-search"><input type="text" id="reading-vocab-input" placeholder="输入难词" autocomplete="off" /><button type="button" id="reading-vocab-button">查询</button></div><div class="vocab-result" id="vocab-side-note">等待查询</div></aside>`;
}

function renderQuestions(questions) {
  if (!questions.length) return "";
  return `<div class="practice-section"><strong>题目</strong>${questions.map((question, index) => `
    <label class="question-row"><span>${index + 1}. ${escapeHtml(question.prompt || "")}</span>
    <input type="text" data-question="${index}" autocomplete="off" placeholder="输入答案" /></label>`).join("")}</div>`;
}

function formatAnswers(questions, answers) {
  if (answers) return typeof answers === "string" ? answers : answers.join("\n");
  return questions.map((question, index) => `${index + 1}. ${question.answer || ""}${question.explanation ? ` — ${question.explanation}` : ""}`).join("\n");
}

function revealBlock(buttonText, title, content) {
  if (!content) return "";
  const id = `reveal-${Math.random().toString(36).slice(2)}`;
  return `<div class="practice-actions"><button type="button" data-reveal="${id}">${escapeHtml(buttonText)}</button></div>
    <section class="practice-section is-hidden" id="${id}"><strong>${escapeHtml(title)}</strong>${renderParagraphs(content)}</section>`;
}

function renderAnalysis(analysis) {
  if (!analysis) return "";
  const dimensions = [["structure", "结构"], ["vocabulary", "词汇"], ["language", "语言"], ["logic", "逻辑"]];
  const cards = dimensions.filter(([key]) => analysis[key]).map(([key, label]) => `<div class="analysis-card"><h4>${label}</h4>${renderParagraphs(analysis[key])}</div>`).join("");
  const expressions = analysis.expressions ? `<div class="practice-section"><strong>好表达与高分表达</strong>${renderParagraphs(analysis.expressions)}</div>` : "";
  return cards ? `<div class="practice-section"><strong>范文分析</strong><div class="analysis-grid">${cards}</div>${expressions}</div>` : expressions;
}

function renderReadingText(text, vocabulary) {
  const escaped = escapeHtml(String(text)).replace(/\n/g, "</p><p>");
  const marked = Object.entries(vocabulary).reduce((result, [word, meaning]) => {
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    return result.replace(pattern, (matched) => `<button type="button" data-vocab-meaning="${escapeAttribute(meaning)}">${matched}</button>`);
  }, escaped);
  return `<p>${marked}</p>`;
}

function renderParagraphs(content) {
  const value = Array.isArray(content) ? content.join("\n") : String(content || "");
  return value.split(/\n+/).filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function bindPracticeActions() {
  practicePanel.querySelectorAll("[data-reveal]").forEach((button) => {
    button.addEventListener("click", () => document.getElementById(button.dataset.reveal)?.classList.toggle("is-hidden"));
  });
  practicePanel.querySelectorAll("[data-vocab-meaning]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = document.querySelector("#vocab-side-note");
      if (note) note.textContent = `${button.textContent}：${button.dataset.vocabMeaning}`;
    });
  });
  const vocabularyButton = practicePanel.querySelector("#reading-vocab-button");
  const vocabularyInput = practicePanel.querySelector("#reading-vocab-input");
  const lookupVocabulary = () => {
    const word = vocabularyInput?.value.trim().toLowerCase();
    const note = practicePanel.querySelector("#vocab-side-note");
    if (!word || !note) return;
    const entry = localWords[word] || window.WORD_DATABASE?.[word];
    if (!entry) {
      note.textContent = `暂未在离线词库中找到 “${word}”`;
      return;
    }
    const parsed = parseDictionaryEntry(entry);
    note.innerHTML = `<b>${escapeHtml(word)}</b><span>${escapeHtml(entry.phonetic || "")}</span><p>${escapeHtml(parsed.meanings.join("；"))}</p>`;
  };
  vocabularyButton?.addEventListener("click", lookupVocabulary);
  vocabularyInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") lookupVocabulary();
  });

  practicePanel.querySelectorAll(".answer-sheet").forEach((sheet) => {
    const key = `ielts-answers:${sheet.dataset.storageKey}`;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { saved = {}; }
    sheet.querySelectorAll("[data-answer-number]").forEach((field) => {
      field.value = saved[field.dataset.answerNumber] || "";
      field.addEventListener("input", () => {
        saved[field.dataset.answerNumber] = field.value;
        localStorage.setItem(key, JSON.stringify(saved));
      });
    });
  });

  practicePanel.querySelectorAll("[data-draft-key]").forEach((field) => {
    const key = `ielts-draft:${field.dataset.draftKey}`;
    field.value = localStorage.getItem(key) || "";
    field.addEventListener("input", () => localStorage.setItem(key, field.value));
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}
function escapeAttribute(value) { return escapeHtml(value); }
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

document.querySelectorAll(".module-tab").forEach((tab) => tab.addEventListener("click", () => renderIeltsModule(tab.dataset.module)));
const totalMaterials = Object.values(ieltsContent).reduce((total, items) => total + (Array.isArray(items) ? items.length : 0), 0);
document.querySelector("#content-status").textContent = `${totalMaterials} 个训练单元`;
renderIeltsModule(activeModule);
