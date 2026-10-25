/* Cambridge IELTS 16 materials supplied by the site owner. */
(function () {
  const root = "assets/cambridge16";
  const page = (number) => `${root}/pages/page-${String(number).padStart(3, "0")}.jpg`;
  const pages = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => page(start + index));
  const audioParts = (test) => [1, 2, 3, 4].map((part) => ({
    title: `Part ${part}`,
    range: `${(part - 1) * 10 + 1}–${part * 10}题`,
    src: `${root}/audio-web/test-${test}-part-${part}.ogg`
  }));
  const testTitle = (test, module) => `Test ${test} · ${module}`;
  const meta = (test, detail) => `剑桥雅思 16 · Academic · Test ${test} · ${detail}`;

  const answerPages = {
    1: pages(123, 124),
    2: pages(125, 126),
    3: pages(127, 128),
    4: pages(129, 130)
  };

  window.IELTS_CONTENT = {
    listening: [
      { title: testTitle(1, "Listening"), meta: meta(1, "40 题"), audioParts: audioParts(1), questionPages: pages(12, 17), transcriptPages: pages(100, 105), answerPages: answerPages[1], answerCount: 40 },
      { title: testTitle(2, "Listening"), meta: meta(2, "40 题"), audioParts: audioParts(2), questionPages: pages(34, 39), transcriptPages: pages(106, 111), answerPages: answerPages[2], answerCount: 40 },
      { title: testTitle(3, "Listening"), meta: meta(3, "40 题"), audioParts: audioParts(3), questionPages: pages(57, 62), transcriptPages: pages(112, 116), answerPages: answerPages[3], answerCount: 40 },
      { title: testTitle(4, "Listening"), meta: meta(4, "40 题"), audioParts: audioParts(4), questionPages: pages(78, 83), transcriptPages: pages(117, 122), answerPages: answerPages[4], answerCount: 40 }
    ],
    reading: [
      { title: testTitle(1, "Reading"), meta: meta(1, "3 篇文章 · 40 题"), questionPages: pages(18, 30), answerPages: answerPages[1], answerCount: 40 },
      { title: testTitle(2, "Reading"), meta: meta(2, "3 篇文章 · 40 题"), questionPages: pages(40, 53), answerPages: answerPages[2], answerCount: 40 },
      { title: testTitle(3, "Reading"), meta: meta(3, "3 篇文章 · 40 题"), questionPages: pages(63, 74), answerPages: answerPages[3], answerCount: 40 },
      { title: testTitle(4, "Reading"), meta: meta(4, "3 篇文章 · 40 题"), questionPages: pages(84, 96), answerPages: answerPages[4], answerCount: 40 }
    ],
    writing: [
      {
        title: "Test 1 · Writing Task 1", meta: meta(1, "Task 1 · Band 5.0 范文"), promptPages: [page(31)], modelAnswerPages: pages(131, 132),
        analysis: {
          structure: "有开头和主体段，但总览不够突出。建议先用一段明确概括三类家电总体上升、家务时间总体下降，再按共同趋势和差异分组比较。",
          vocabulary: "能使用表示变化的词，但部分搭配和数值表达不够准确。优先掌握 rose steadily、remained stable、reached a peak、by contrast 等图表词组。",
          language: "句式以简单句为主，主谓一致、冠词和介词错误影响清晰度。可以用 while、whereas 和 respectively 组织可靠的比较句。",
          logic: "信息选择不够均衡，部分关键年份和显著特征没有形成对照。写每个主体段前先确定该段要比较的两到三个核心数据。",
          expressions: "高分写法方向：先写清晰 overview，再使用 remained comparatively stable、saw the most dramatic increase、fell consistently 等精确表达。"
        }
      },
      {
        title: "Test 1 · Writing Task 2", meta: meta(1, "Task 2 · Band 6.0 范文"), promptPages: [page(32)], modelAnswerPages: pages(133, 134),
        analysis: {
          structure: "文章能够回应‘原因’和‘调查方法’两个问题，段落基本完整；若将两部分各自设为独立主体段，并在开头直接概括答案，结构会更清楚。",
          vocabulary: "话题词汇范围尚可，但有重复与不自然搭配。可围绕 identity、historical records、local archives、previous occupants 建立词汇链。",
          language: "复杂句有尝试，但长句控制不稳定。减少一个句子里并列过多观点的情况，并检查从句边界与标点。",
          logic: "主要观点相关，但部分解释停留在概括层面。每种调查方式都应补充‘在哪里查、能获得什么信息、为什么可靠’。",
          expressions: "可用表达：trace the history of a property、consult municipal archives、shed light on、satisfy one’s curiosity about。"
        }
      },
      {
        title: "Test 2 · Writing Task 1", meta: meta(2, "Task 1 · Band 6.0 范文"), promptPages: [page(54)], modelAnswerPages: [page(135)],
        analysis: {
          structure: "流程顺序基本完整，也包含概述。更好的组织方式是先说明这是一个线性过程和起止点，再按生产阶段分成两组。",
          vocabulary: "能使用流程词，但个别用词重复。可轮换使用 is harvested、is crushed、is purified、is evaporated、is separated 等被动结构。",
          language: "时态总体应保持一般现在时，被动语态是核心。注意冠词、单复数以及步骤之间的连接。",
          logic: "主要步骤基本覆盖，但某些阶段的目的与先后关系可以更明确，避免只罗列图中标签。",
          expressions: "高分写法方向：The process begins with… and culminates in…；The resulting juice is then…；Once purified, the liquid…"
        }
      },
      {
        title: "Test 2 · Writing Task 2", meta: meta(2, "Task 2 · Band 4.5 范文"), promptPages: [page(55)], modelAnswerPages: [page(136)],
        analysis: {
          structure: "有基本段落，但立场和论证推进不清晰。应在引言明确同意程度，并分别讨论标签、教育或监管等解决方式。",
          vocabulary: "词汇范围有限且重复，部分词义选择不准确。建议围绕 excessive consumption、mandatory labelling、public awareness、health consequences 积累搭配。",
          language: "语法错误密度较高，影响理解。先确保简单句准确，再使用 because、therefore、although 扩展论证。",
          logic: "论点与例子联系较弱，部分内容偏离‘是否应贴标签’这一核心。每段开头都要直接回应题目。",
          expressions: "可用表达：make informed choices、display clear nutritional warnings、place the responsibility on、reduce excessive intake。"
        }
      },
      {
        title: "Test 3 · Writing Task 1", meta: meta(3, "Task 1 · Band 6.5 范文"), promptPages: [page(75)], modelAnswerPages: [page(137)],
        analysis: {
          structure: "能够描述主要改建并形成总体概括。若按‘航站楼内部’和‘外部交通/登机设施’分组，会比逐项描述更紧凑。",
          vocabulary: "地点与变化词较丰富，但可进一步提高精确度，如 be relocated、be extended、make way for、remain unchanged。",
          language: "复杂句整体可读，仍需减少个别语法和指代问题。描述规划图时保持将来时或计划表达一致。",
          logic: "关键变化基本覆盖，对比明确；可再突出机场容量扩张这一贯穿所有改造的主线。",
          expressions: "高分写法方向：is set to undergo substantial redevelopment、will be replaced by、on either side of、the most noticeable change is…"
        }
      },
      {
        title: "Test 3 · Writing Task 2", meta: meta(3, "Task 2 · Band 7.0 范文"), promptPages: [page(76)], modelAnswerPages: [page(138)],
        analysis: {
          structure: "立场明确，主体段围绕标签的局限与可能作用展开，结论能回扣观点。可以让每段首句更直接概括该段论点。",
          vocabulary: "话题词汇和搭配较自然，能区分消费者、制造商与监管者的责任。少数用词仍可更精确。",
          language: "句型有变化，复杂结构总体控制良好。应继续检查长句中的标点和修饰关系，避免偶发的不顺畅表达。",
          logic: "论证相关且有发展，能够承认标签的价值后说明其局限，体现让步与权衡。若加入更具体的机制或例子，说服力会更强。",
          expressions: "值得学习：serve as a deterrent、raise consumer awareness、address the root cause、a combination of regulation and education。"
        }
      },
      {
        title: "Test 4 · Writing Task 1", meta: meta(4, "Task 1 · Band 5.5 范文"), promptPages: [page(97)], modelAnswerPages: [page(139)],
        analysis: {
          structure: "能够按流程顺序描述，但概述和阶段分组较弱。建议把九个步骤概括为收集分拣、加工处理、制成新产品三阶段。",
          vocabulary: "使用了一些流程词，但重复较多且个别搭配不准确。可使用 be sorted、be compressed、be crushed、be melted、be moulded。",
          language: "被动语态是本题关键，需保持主语和动词形式一致，并减少逗号拼接句。",
          logic: "大部分步骤都被提到，但步骤之间的因果和产物变化不够清楚。每一步都说明材料经过什么处理、变成什么。",
          expressions: "高分写法方向：After being sorted, the bottles are…；The raw material is subsequently…；The cycle can then begin again。"
        }
      },
      {
        title: "Test 4 · Writing Task 2", meta: meta(4, "Task 2 · Band 4.0 范文"), promptPages: [page(98)], modelAnswerPages: [page(140)],
        analysis: {
          structure: "虽然有分段和最终立场，但大部分段落讨论的是人们需要出行或喜欢车辆，没有直接比较无人驾驶车辆的利弊。应按优势、风险、权衡结论组织。",
          vocabulary: "拼写、词形和搭配错误密集，限制了表达。先掌握 autonomous vehicles、road safety、job displacement、mobility for the elderly 等核心词组。",
          language: "句型范围有限，主谓一致、冠词、复数和从句结构问题较多。先用准确的短句表达一个完整观点，再逐步合并。",
          logic: "中心问题是‘优势是否超过劣势’，文章却缺少针对性比较。每个主体段应包含观点、解释、例子以及与题目立场的连接。",
          expressions: "改进表达：reduce accidents caused by human error、improve access to transport、pose a threat to employment、the benefits outweigh the drawbacks。"
        }
      }
    ],
    speaking: [
      { title: testTitle(1, "Speaking"), meta: meta(1, "Parts 1–3"), questionPages: [page(33)] },
      { title: testTitle(2, "Speaking"), meta: meta(2, "Parts 1–3"), questionPages: [page(56)] },
      { title: testTitle(3, "Speaking"), meta: meta(3, "Parts 1–3"), questionPages: [page(77)] },
      { title: testTitle(4, "Speaking"), meta: meta(4, "Parts 1–3"), questionPages: [page(99)] }
    ]
  };
})();
