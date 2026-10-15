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
  document.querySelector("#part-of-speech").textContent = [data.level, data.part].filter(Boolean).join(" · ") || "英文单词";
  document.querySelector("#chinese-definition").textContent = data.meaning || "暂无中文释义";
  const exampleBox = document.querySelector("#example-box");
  exampleBox.classList.toggle("is-hidden", !data.example);
  document.querySelector("#example-text").textContent = data.example || "";
  currentAudio = data.audio || "";
  currentWord = word;
  card.classList.remove("is-hidden");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
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
