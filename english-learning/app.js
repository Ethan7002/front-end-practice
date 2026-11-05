const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  user: JSON.parse(localStorage.getItem("shiguang-user") || "null"),
  step: 0,
  audioContext: null,
};

const wordNotes = {
  sacrifice: { phonetic: "/ˈsækrɪfaɪs/ · v.", meaning: "牺牲；舍弃", note: "指因为忙碌而主动减少或放弃睡眠时间。" },
  essential: { phonetic: "/ɪˈsenʃl/ · adj.", meaning: "必不可少的；极其重要的", note: "表示睡眠是人体必需的生理过程，而不是可有可无的休息。" },
  consolidates: { phonetic: "/kənˈsɒlɪdeɪts/ · v.", meaning: "巩固；使加强", note: "这里指大脑在睡眠中整理并加强新形成的记忆。" },
  resilience: { phonetic: "/rɪˈzɪliəns/ · n.", meaning: "恢复力；适应力；韧性", note: "指面对压力或困难后恢复稳定状态的能力。" },
  beneficial: { phonetic: "/ˌbenɪˈfɪʃl/ · adj.", meaning: "有益的；有帮助的", note: "常用搭配：be beneficial to，对……有益。" },
  conditions: { phonetic: "/kənˈdɪʃənz/ · n.", meaning: "条件；环境", note: "本文指能够让良好睡眠更容易发生的生活环境和习惯。" },
};

const levelContent = {
  A1: ["基础问候练习", "看视频学日常动作", "认识身边的 8 个词"],
  A2: ["咖啡店情景对话", "3 分钟生活短片", "读懂一封简单邮件"],
  B1: ["表达观点的聊天练习", "TED-Ed 精选短片", "精读：睡眠的力量"],
  B2: ["讨论科技与生活", "新闻英语深度听力", "精读：注意力经济"],
  C1: ["学术话题观点辩论", "原速访谈与笔记", "精读：行为与决策"],
  C2: ["高阶修辞与表达", "无字幕演讲分析", "评论文章批判性阅读"],
};

function showScreen(id) {
  $$(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === id));
  window.scrollTo(0, 0);
}

function sound(type = "tap") {
  try {
    state.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = state.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const map = { tap: [430, .035], next: [560, .06], success: [720, .11], error: [185, .1], complete: [880, .18] };
    const [frequency, duration] = map[type] || map.tap;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (type === "success" || type === "complete") osc.frequency.exponentialRampToValueAtTime(frequency * 1.45, ctx.currentTime + duration);
    osc.type = type === "error" ? "sawtooth" : "sine";
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.055, ctx.currentTime + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration + .02);
  } catch (_) {}
}

function speak(word) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-GB"; utterance.rate = .82;
  speechSynthesis.speak(utterance);
}

$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault(); sound("next");
  state.user = { name: $("#login-name").value.trim(), email: $("#login-email").value.trim() };
  showScreen("onboarding-screen"); updateStep();
});

function updateStep() {
  $$(".onboarding-step").forEach((el, index) => el.classList.toggle("is-active", index === state.step));
  $("#step-label").textContent = `0${state.step + 1} / 03`;
  $("#progress-bar").style.width = `${((state.step + 1) / 3) * 100}%`;
  $("#prev-step").classList.toggle("is-hidden", state.step === 0);
  $("#next-step").innerHTML = state.step === 2 ? "生成我的学习空间 <span>✦</span>" : "继续 <span>→</span>";
}

$("#next-step").addEventListener("click", () => {
  const current = $(`.onboarding-step[data-step="${state.step}"]`);
  const required = $("input[required]", current);
  if (required && !$( `input[name="${required.name}"]:checked`, current)) {
    sound("error"); current.animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"none"}], {duration:260}); return;
  }
  if (state.step < 2) { state.step += 1; sound("next"); updateStep(); return; }
  const data = new FormData($("#profile-form"));
  state.user = { ...state.user, age: data.get("age"), level: data.get("level"), goals: data.getAll("goal"), ielts: $("#ielts-score").value };
  localStorage.setItem("shiguang-user", JSON.stringify(state.user));
  sound("complete"); setupDashboard(); showScreen("dashboard-screen");
});

$("#prev-step").addEventListener("click", () => { state.step = Math.max(0, state.step - 1); sound("tap"); updateStep(); });
$$('.choice-grid input').forEach((input) => input.addEventListener("change", () => sound("tap")));

function setupDashboard() {
  const user = state.user || { name: "学习者", level: "B1", age: "18–24岁", goals: [] };
  const level = user.level || "B1";
  $("#sidebar-name").textContent = user.name;
  $("#sidebar-avatar").textContent = (user.name || "L").slice(0, 1).toUpperCase();
  $("#sidebar-level").textContent = `${level} · 学习中`;
  $("#greeting").textContent = `${greeting()}，${user.name}`;
  $("#level-pill").textContent = `${level} · ${levelName(level)}`;
  $("#article-level").textContent = `${level} · 约 6 分钟`;
  $("#profile-summary").textContent = `${user.age || ""}${user.ielts ? ` · IELTS ${user.ielts}` : ""}`;
  $("#plan-copy").textContent = `根据你的 ${level} 水平和“${(user.goals || []).join("、") || "综合英语"}”目标，我们准备了约 25 分钟的内容。`;
  $("#today-date").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date()).toUpperCase();
  const modules = ["chat", "video", "intensive"];
  $("#recommendation-grid").innerHTML = levelContent[level].map((title, index) => `
    <article class="recommend-card" data-icon="${["✦","▶","Aa"][index]}">
      <div class="card-top"><span>${["英语聊天","视频学习","精细阅读"][index]}</span><span class="time">${["8","6","11"][index]} 分钟</span></div>
      <h4>${title}</h4><p>${["在模拟情景中练习自然表达，随时查看建议。","短视频、关键词和跟读训练组合学习。","边读边查词，把文章真正读懂。 "][index]}</p>
      <button data-open="${modules[index]}">开始 →</button>
    </article>`).join("");
}

function greeting() { const h = new Date().getHours(); return h < 11 ? "早上好" : h < 18 ? "下午好" : "晚上好"; }
function levelName(level) { return ({A1:"BEGINNER",A2:"ELEMENTARY",B1:"INTERMEDIATE",B2:"UPPER INTERMEDIATE",C1:"ADVANCED",C2:"PROFICIENT"})[level]; }

function openView(name) {
  $$(".view").forEach((view) => view.classList.remove("is-active"));
  $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === name));
  if (name === "home") $("#home-view").classList.add("is-active");
  else if (name === "intensive") $("#intensive-view").classList.add("is-active");
  else { $("#module-view").classList.add("is-active"); renderModule(name); }
  $(".sidebar").classList.remove("is-open"); window.scrollTo(0, 0); sound("tap");
}

document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open]"); if (opener) openView(opener.dataset.open);
});
$$('.nav-item').forEach((button) => button.addEventListener("click", () => openView(button.dataset.view)));
$("#back-home").addEventListener("click", () => openView("home"));
$("#reader-back").addEventListener("click", () => { closeWord(); openView("home"); });
$("#mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("is-open"));
$("#logout-button").addEventListener("click", () => { closeWord(); showScreen("auth-screen"); });
$$('[data-speak]').forEach((button) => button.addEventListener("click", () => { sound("tap"); speak(button.dataset.speak); }));

const moduleData = {
  chat: ["英语聊天", "让表达变成一种习惯", ["餐厅点餐：自然提出要求", "表达不同意见，但保持礼貌", "一分钟自我介绍挑战"]],
  video: ["视频学习", "听懂真实语速里的英语", ["预习 6 个关键词", "观看 3 分钟精选短片", "逐句跟读并录下自己的声音"]],
  reading: ["英文读物", "从适合你的故事开始", ["分级短篇：The Last Leaf", "人物传记：A Curious Mind", "科普阅读：How Trees Talk"]],
  words: ["背诵单词", "不只记住，还要真正会用", ["今日新词 10 个", "昨日复习 8 个", "易错词收藏夹"]],
  quiz: ["单词挑战", "用一场小游戏检验记忆", []],
};

function renderModule(name) {
  const [title, subtitle, cards] = moduleData[name] || moduleData.chat;
  if (name === "quiz") {
    $("#module-content").innerHTML = `<div class="module-hero"><p class="eyebrow">WORD CHALLENGE</p><h2>${title}</h2><p>${subtitle}。答对会获得经验值和清脆提示音。</p></div><article class="activity-card quiz-box"><span class="pill">1 / 5</span><div class="quiz-word">resilient</div><p>/rɪˈzɪliənt/ · adjective</p><div class="quiz-options"><button data-answer="wrong">华丽的</button><button data-answer="correct">有韧性的</button><button data-answer="wrong">谨慎的</button><button data-answer="wrong">短暂的</button></div></article>`;
    $$("[data-answer]").forEach((button) => button.addEventListener("click", quizAnswer)); return;
  }
  $("#module-content").innerHTML = `<div class="module-hero"><p class="eyebrow">${name.toUpperCase()} PRACTICE</p><h2>${title}</h2><p>${subtitle}。内容已经根据你的 ${state.user?.level || "B1"} 水平进行调整。</p></div><div class="activity-grid">${cards.map((card,index)=>`<article class="activity-card"><span class="pill">${String(index+1).padStart(2,"0")}</span><h3>${card}</h3><p>${index===0?"今天的推荐任务，完成后获得 20 XP。":"可随时开始，学习进度会自动保存。"}</p><button>${name === "video" ? "▶ 播放" : "开始练习"}</button></article>`).join("")}</div>`;
  $$(".activity-card button").forEach(button => button.addEventListener("click", () => { sound("success"); button.textContent = "✓ 已加入今日计划"; button.style.background = "#db8b69"; }));
}

function quizAnswer(event) {
  const correct = event.currentTarget.dataset.answer === "correct";
  event.currentTarget.classList.add(correct ? "correct" : "wrong"); sound(correct ? "success" : "error");
  if (correct) { const xp = document.createElement("span"); xp.className = "xp-burst"; xp.textContent = "+10 XP"; xp.style.left = `${event.clientX}px`; xp.style.top = `${event.clientY}px`; document.body.append(xp); setTimeout(()=>xp.remove(),1000); }
}

function openWord(button) {
  const word = button.dataset.word; const data = wordNotes[word]; if (!data) return;
  $("#popover-word").textContent = word; $("#popover-phonetic").textContent = data.phonetic; $("#popover-meaning").textContent = data.meaning; $("#popover-note").textContent = data.note;
  const rect = button.getBoundingClientRect(); const popover = $("#word-popover"); popover.classList.add("is-open"); document.body.classList.add("word-open");
  const width = Math.min(360, window.innerWidth - 30); let left = rect.left + rect.width / 2 - width / 2; left = Math.max(15, Math.min(left, window.innerWidth - width - 15));
  let top = rect.bottom + 14; if (top + 340 > window.innerHeight) top = Math.max(15, rect.top - 330);
  popover.style.left = `${left}px`; popover.style.top = `${top}px`; popover.dataset.word = word; sound("tap");
}
function closeWord() { $("#word-popover").classList.remove("is-open"); document.body.classList.remove("word-open"); }
$$('.word').forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openWord(button); }));
$("#reading-paper").addEventListener("click", (event) => { if (!event.target.closest(".word")) closeWord(); });
$("#popover-close").addEventListener("click", closeWord);
$("#popover-audio").addEventListener("click", () => speak($("#word-popover").dataset.word));
window.addEventListener("resize", closeWord);

if (state.user?.level) { setupDashboard(); showScreen("dashboard-screen"); } else { showScreen("auth-screen"); }
