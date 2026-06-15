/* =========================================================================
   The Guide — a narrative, tap-to-explore journey through creative AI.
   No commands. A small "AI guide" tells the story of Dr. Canbaz's world.
   ========================================================================= */
(function () {
  "use strict";

  var logInner = document.getElementById("logInner");
  var log = document.getElementById("log");
  var form = document.getElementById("form");
  var input = document.getElementById("say");
  var bar = document.getElementById("bar");
  var railEl = document.getElementById("rail");

  var state = { name: "", world: "", flavor: "" };
  var current = null;     // current scene id
  var choicesNow = [];    // active choices
  var typing = false, skip = false;

  /* ---------- formatting: **bold** //hl// ^^gold^^ {name} ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fmt(raw) {
    raw = raw.replace(/\{name\}/g, state.name || "friend");
    var e = esc(raw);
    var html = e
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\/\/(.+?)\/\//g, '<span class="hl">$1</span>')
      .replace(/\^\^(.+?)\^\^/g, '<span class="g">$1</span>');
    var plain = e
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\/\/(.+?)\/\//g, '$1')
      .replace(/\^\^(.+?)\^\^/g, '$1');
    return { plain: plain, html: html };
  }

  function row(who, cls) {
    var d = document.createElement("div");
    d.className = "say " + cls;
    d.innerHTML = '<span class="who">' + who + '</span><span class="txt"></span>';
    logInner.appendChild(d);
    return d.querySelector(".txt");
  }
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function typeLine(el, raw, done) {
    var f = fmt(raw); var i = 0; typing = true;
    el.innerHTML = "";
    var car = document.createElement("span"); car.className = "caret"; car.innerHTML = "&nbsp;";
    el.appendChild(car);
    function tick() {
      if (skip) { el.innerHTML = f.html; typing = false; done(); return; }
      i++;
      el.textContent = f.plain.slice(0, i);
      el.appendChild(car);
      scrollDown();
      if (i >= f.plain.length) { el.innerHTML = f.html; typing = false; done(); return; }
      var ch = f.plain.charAt(i - 1);
      var d = /[.!?…]/.test(ch) ? 230 : /[,;:—]/.test(ch) ? 120 : 15;
      setTimeout(tick, d);
    }
    tick();
  }

  function sayLines(lines, cb) {
    var i = 0;
    function next() {
      if (i >= lines.length) { cb(); return; }
      var el = row("✦", "guide");
      typeLine(el, lines[i], function () { i++; setTimeout(next, 90); });
    }
    next();
  }

  /* ---------- choices ---------- */
  function clearChoices() {
    var old = logInner.querySelectorAll(".choices");
    old.forEach(function (n) { n.remove(); });
  }
  function renderChoices(choices) {
    clearChoices();
    choicesNow = choices || [];
    if (!choicesNow.length) { scrollDown(); return; }
    var wrap = document.createElement("div");
    wrap.className = "choices";
    choicesNow.forEach(function (c, idx) {
      var b = document.createElement("button");
      b.className = "choice" + (c.url ? " link" : "") + (c.soft ? " soft" : "");
      b.innerHTML = (c.soft ? "" : '<span class="num">' + (idx + 1) + "</span>") + "<span>" + esc(c.label) + "</span>";
      b.addEventListener("click", function () { choose(c); });
      wrap.appendChild(b);
    });
    logInner.appendChild(wrap);
    scrollDown();
  }

  function choose(c) {
    if (c.url) { window.open(c.url, c.url.indexOf("mailto:") === 0 || c.url.indexOf(".vcf") !== -1 ? "_self" : "_blank"); return; }
    if (c.act === "quiz") { quizAnswer(c.pick); return; }
    if (c.act === "quiznext") { renderQuiz(); return; }
    if (c.act === "quizdone") { quizResult(); return; }
    if (c.set) Object.assign(state, c.set);
    if (c.act === "noname") { state.name = "friend"; go("hub"); return; }
    if (c.act === "regen") { go("play_result"); return; }
    if (c.to) { if (c.to.indexOf("_intent:") === 0) { runIntent(findIntent(c.to.slice(8))); return; } go(c.to); }
  }

  /* ---------- progress + rail ---------- */
  var PROG = { intro: 6, hub: 16, creative: 36, about: 30, stories: 48, numbers: 54,
    s_legal: 64, s_health: 64, s_cyber: 64, s_crisis: 64, s_network: 64, s_fair: 64,
    play_world: 74, play_flavor: 80, play_result: 88, contact: 96, about_kafa: 24, lead: 98, lead_done: 99,
    projects: 40, p_honeypot: 70, p_aera: 70, p_banana: 70, p_legal: 70, p_kg: 70, p_quantum: 70,
    demos: 46, demo_honeypot: 68, honey_a: 76, honey_b: 76, problem: 44, prob_answer: 86, teaching: 50 };
  function setRail(id) {
    var map = { s_legal: "stories", s_health: "stories", s_cyber: "stories", s_crisis: "stories",
      s_network: "stories", s_fair: "stories", play_flavor: "play_world", play_result: "play_world",
      p_honeypot: "projects", p_aera: "projects", p_banana: "projects", p_legal: "projects", p_kg: "projects", p_quantum: "projects",
      demo_hallu: "demos", demo_network: "demos", demo_honeypot: "demos", honey_a: "demos", honey_b: "demos",
      prob_answer: "problem" };
    var key = map[id] || id;
    railEl.querySelectorAll("li").forEach(function (li) { li.classList.toggle("on", li.getAttribute("data-go") === key); });
    if (PROG[id]) bar.style.width = PROG[id] + "%";
  }

  /* ---------- scenes ---------- */
  var S = {
    intro: {
      input: "name",
      lines: [
        "Hey. You found a door most people walk right past.",
        "This isn't a normal homepage — it's a small experiment in **creative AI**. A page that talks back.",
        "I'm **KaFa-1500**. (//Kafa// means ‘mind’ in Turkish — so, a small mind, model 1500. Manage your expectations accordingly.)",
        "Fair warning: I won't tell you everything you type is brilliant. Every //other// chatbot already has that covered. I'm here to actually //show you something// — the world of **Dr. M. Abdullah Canbaz**.",
        "His ideas, his projects, his lab. Tap whatever sparks your curiosity.",
        "Before we start — what should I call you?"
      ],
      choices: [
        { label: "I'll stay anonymous", act: "noname", soft: true },
        { label: "🖥 I'd rather just see a normal website →", url: "classic.html" }
      ]
    },

    hub: {
      lines: [
        "**{name}**. Noted. I'll assume that's your real name and judge you for nothing.",
        "Here's whose world you've wandered into: **Dr. M. Abdullah Canbaz** — a professor at the University at Albany who teaches machines to help with very human problems.",
        "Pick a way in — or just **type a question** (try //“what is creative AI?”// or //“how do I reach him?”//):"
      ],
      choices: [
        { label: "🚀 Tour his flagship projects", to: "projects" },
        { label: "🔬 Stories from the lab", to: "stories" },
        { label: "🕹 Try a live demo of his work", to: "demos" },
        { label: "🧩 Bring me a real problem", to: "problem" },
        { label: "🎨 Make something together", to: "play_world" },
        { label: "🤖 Wait — what are //you//, KaFa?", to: "about_kafa" }
      ]
    },

    creative: {
      lines: [
        "Okay. You've almost certainly met creative AI already.",
        "It's the kind that **writes, draws, composes, imagines** — software that doesn't just sort the world, it **makes new things**.",
        "Ask it for a poem, a picture, a plan, and it conjures one that never existed before.",
        "Dr. Canbaz teaches a whole course on exactly this — it's literally called **Creative AI**. But here's the part he cares about most:",
        "Creativity without honesty is dangerous. So he builds AI that's //imaginative but grounded// — it won't make things up about your court case or your health.",
        "That tension — ^^wonder^^ versus ^^responsibility^^ — runs through everything here."
      ],
      choices: [
        { label: "Show me where that matters →", to: "stories" },
        { label: "Let's try a little creative AI ourselves", to: "play_world" },
        { label: "Who's behind all this?", to: "about" }
      ]
    },

    about: {
      lines: [
        "Short version: **Dr. M. Abdullah Canbaz**, Ph.D.",
        "He's an Assistant Professor at the University at Albany, and he runs the **AI in Complex Systems Lab**.",
        "He's an **IEEE Senior Member** and one of the university's first **AI & Society Fellows** — a fancy way of saying he's recognized for using AI in ways that actually help people.",
        "He earned his Ph.D. in Nevada (winning best dissertation), with stops in Indianapolis and Istanbul along the way.",
        "But honestly? He's most interesting through his **work**. Want a story?"
      ],
      choices: [
        { label: "Yes — tell me a story", to: "stories" },
        { label: "Give me the numbers instead", to: "numbers" },
        { label: "Remind me what ‘creative AI’ is", to: "creative" }
      ]
    },

    stories: {
      lines: [
        "The lab goes after messy, real problems. Pick one — I'll tell you what actually happened."
      ],
      choices: [
        { label: "⚖️ The AI that fact-checks the law", to: "s_legal" },
        { label: "💜 The AI that listens for warning signs", to: "s_health" },
        { label: "🛡️ The AI that sets traps for hackers", to: "s_cyber" },
        { label: "🚨 The AI that shows up in emergencies", to: "s_crisis" },
        { label: "🕸️ The maps of invisible networks", to: "s_network" },
        { label: "⚖️ Teaching AI to be fair", to: "s_fair" }
      ]
    },

    s_legal: {
      lines: [
        "Lawyers drown in case law. And when they ask an AI for help, it sometimes **invents** cases that don't exist — confidently. In a courtroom, that's terrifying.",
        "So the lab built AI that does the opposite: it reads real law, **catches the hallucinations**, and checks whether a citation actually says what it claims.",
        "They even made **LegalGuardian** — a way to point powerful AI at sensitive legal files //without leaking them//.",
        "Quiet, careful, life-affecting work."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://aclanthology.org/2025.nllp-1.13/" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },
    s_health: {
      lines: [
        "Picture a therapist with dozens of clients, trying to notice who's quietly slipping toward crisis.",
        "The lab builds AI **copilots** that read therapy notes and surface **early warning signs** — not to replace the human, but to make sure nothing important gets missed.",
        "One project, **AERA**, is an AI ‘psychological first aid’ assistant for the hardest moments.",
        "Empathy — but at the speed software can offer it."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://ieeexplore.ieee.org/document/11050703" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },
    s_cyber: {
      lines: [
        "Here's a fun one. How do you study hackers? You let them attack a **trap**.",
        "The lab built **honeypots powered by AI** — fake systems so convincing that attackers waste their time on them while revealing their tricks.",
        "Newer work sends out whole **swarms** of these AI decoys to confuse real attacks — even out at satellites on the edge of the network.",
        "It's cybersecurity as a kind of theater, scripted by AI."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://ieeexplore.ieee.org/document/10735607" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },
    s_crisis: {
      lines: [
        "When a disaster hits, the people in charge get buried — messages, maps, rumors, chaos.",
        "The lab builds AI that helps emergency managers **make sense of it fast**, turning a flood of information into clear next steps.",
        "Other projects read **satellite imagery** to see how a neighborhood changed, or scan for **active threats** in real time.",
        "AI as a calm voice in the loudest moments."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://ieeexplore.ieee.org/document/10607148" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },
    s_network: {
      lines: [
        "Some of the most beautiful work here is about **invisible structure**.",
        "The internet, a whole field of research, even **bias itself** — all of them are secretly networks, with hidden shapes.",
        "Dr. Canbaz started his career **mapping the internet's deep topology**, and still uses network science to reveal who really coordinates U.S. cyber defense, or how bias spreads.",
        "Once you see the graph, you can't unsee it."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://link.springer.com/chapter/10.1007/978-3-032-16723-1_19" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },
    s_fair: {
      lines: [
        "AI learns from us — including our worst habits. It can quietly absorb and amplify **bias**.",
        "So the lab maps bias almost like a disease: **where it starts, how it spreads, how to stop it**.",
        "They've published frameworks for **measuring and mitigating AI bias**, and studied the strange ‘hallucination networks’ inside large language models.",
        "Because powerful AI that isn't fair isn't really progress."
      ],
      choices: [
        { label: "📄 Peek at the real research ↗", url: "https://link.springer.com/article/10.1007/s43681-024-00609-0" },
        { label: "Tell me another story", to: "stories" },
        { label: "Let's make something", to: "play_world" }
      ]
    },

    play_world: {
      lines: [
        "Oh, a co-creator. Bold of you. Fine — let's do a tiny bit of creative AI //together//, the same recipe the lab uses: a real problem, plus a spark of imagination.",
        "First, pick a world you care about (choose wisely, or don't, I'm not your supervisor):"
      ],
      choices: [
        { label: "⚖️ Justice & the law", set: { world: "law" }, to: "play_flavor" },
        { label: "💜 Minds & wellbeing", set: { world: "mind" }, to: "play_flavor" },
        { label: "🚨 Safety & emergencies", set: { world: "safety" }, to: "play_flavor" },
        { label: "🕸️ The internet & networks", set: { world: "net" }, to: "play_flavor" },
        { label: "🎨 Art, music & play", set: { world: "art" }, to: "play_flavor" }
      ]
    },
    play_flavor: {
      lines: ["Nice. Now — what's the **vibe**?"],
      choices: [
        { label: "⚡ Bold", set: { flavor: "bold" }, to: "play_result" },
        { label: "🎈 Playful", set: { flavor: "playful" }, to: "play_result" },
        { label: "🌅 Hopeful", set: { flavor: "hopeful" }, to: "play_result" },
        { label: "🌙 Mysterious", set: { flavor: "mysterious" }, to: "play_result" }
      ]
    },

    numbers: {
      lines: [
        "If you like numbers, here's the shape of it:",
        "**35+** published papers. **$1.7M+** in research funding. **6+** PhD researchers. **3** big federal grants — from the NSF, USDA, and NIH.",
        "But numbers undersell it. Every one of those is a real attempt to make AI //useful and humane//."
      ],
      choices: [
        { label: "Tell me the story behind one", to: "stories" },
        { label: "How do I reach him?", to: "contact" },
        { label: "Back to the start", to: "hub" }
      ]
    },

    contact: {
      lines: [
        "The easiest way to reach Dr. Canbaz is email — and he actually reads it.",
        "**mcanbaz@albany.edu**",
        "He's at the University at Albany (ETEC, Room 260M), and he welcomes students, collaborators, and the simply-curious."
      ],
      choices: [
        { label: "✉️ Email him", url: "mailto:mcanbaz@albany.edu" },
        { label: "📬 Have Dr. Canbaz reach out to me", to: "lead" },
        { label: "🌐 His faculty page ↗", url: "https://www.albany.edu/cehc/faculty/m-abdullah-canbaz" },
        { label: "💻 GitHub ↗", url: "https://github.com/mabdullahcanbaz" },
        { label: "📇 Save his contact card", url: "canbaz.vcf" },
        { label: "↺ Start the journey over", to: "hub" }
      ]
    }
  };

  /* ---------- dynamic: the creative-AI generator ---------- */
  var WORLD_NAME = { law: "justice & the law", mind: "minds & wellbeing", safety: "safety & emergencies", net: "the internet & networks", art: "art, music & play" };
  var WORLD_ACTION = {
    law: ["reads a 900-page contract and explains it like a friend", "spots the one sentence that quietly changes a case", "flags the moment another AI starts bluffing about the law"],
    mind: ["notices when a journal entry sounds like a cry for help", "turns a week of moods into a gentle weather forecast", "sits with someone at 3 a.m. when no one else can"],
    safety: ["watches a crowd and quietly raises a hand when something's wrong", "turns ten thousand panicked messages into one clear map", "tells a first responder exactly where to go first"],
    net: ["draws the secret map of how the internet really connects", "finds the hidden hub holding an entire system together", "watches how an idea — or a bias — quietly spreads"],
    art: ["co-writes a song with you and argues about the chorus", "paints what your favorite memory might smell like", "remixes a whole museum into a video game"]
  };
  var FLAVOR_TWIST = {
    bold: ["and isn't afraid to admit ‘I might be wrong’", "at a scale no human team could match", "and dares to act, not just advise"],
    playful: ["and cracks a joke while it works", "like a curious kid with infinite questions", "and turns the whole thing into a game"],
    hopeful: ["so no one slips through the cracks", "to give people back their time", "because help should never arrive too late"],
    mysterious: ["and only reveals what it learned when you ask the right question", "leaving a trail of clues for you to follow", "that quietly understands more than it lets on"]
  };
  var FLAVOR_WORD = { bold: "a bold streak", playful: "a playful streak", hopeful: "a hopeful heart", mysterious: "a touch of mystery" };
  var REAL = {
    law: ["**LegalGuardian** — pointing powerful AI at sensitive legal files without leaking them", "https://aclanthology.org/2025.nllp-1.13/"],
    mind: ["**AERA** — an AI ‘psychological first aid’ assistant", "https://ieeexplore.ieee.org/document/11050703"],
    safety: ["AI that streamlines emergency response with large language models", "https://ieeexplore.ieee.org/document/10607148"],
    net: ["a co-authorship map of who really coordinates U.S. cyber defense", "https://link.springer.com/chapter/10.1007/978-3-032-16723-1_19"],
    art: ["his **Creative AI** course, where students build exactly these kinds of things", "https://github.com/mabdullahcanbaz/Teaching"]
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function play_result() {
    var w = state.world || "art", f = state.flavor || "playful";
    var idea = "An AI that " + pick(WORLD_ACTION[w]) + " — " + pick(FLAVOR_TWIST[f]) + ".";
    var real = REAL[w];
    return {
      lines: [
        "Mixing your ideas… pretending this takes real effort…",
        "Here's your spark, **{name}** — don't quit your day job, but it's honestly not bad:",
        "**“" + idea + "”**",
        "That's basically how this lab works: take something you care about (^^" + WORLD_NAME[w] + "^^), add imagination (//" + FLAVOR_WORD[f] + "//), and build it **responsibly**.",
        "And yes — Dr. Canbaz really has a project in this space: " + real[0] + "."
      ],
      choices: [
        { label: "🎲 Spin another idea", act: "regen" },
        { label: "🌍 Try a different world", to: "play_world" },
        { label: "📄 Show me that real project ↗", url: real[1] },
        { label: "↺ Back to the start", to: "hub" }
      ]
    };
  }
  S.play_result = play_result;

  /* ===================================================================
     FLAGSHIP PROJECT SPOTLIGHTS
     =================================================================== */
  S.projects = {
    lines: ["The greatest hits — Dr. Canbaz's **flagship projects**. Real systems, real impact, zero vaporware. Pick one:"],
    choices: [
      { label: "🪤 LLM Honeypot — trapping hackers with AI", to: "p_honeypot" },
      { label: "💜 AERA — AI psychological first-aid", to: "p_aera" },
      { label: "🎯 BananaGuard — spotting threats in a crowd", to: "p_banana" },
      { label: "⚖️ LegalGuardian — private AI for law", to: "p_legal" },
      { label: "🕸 Legal Knowledge Graphs — mapping the law", to: "p_kg" },
      { label: "⚛️ Quantum Network Science", to: "p_quantum" }
    ]
  };
  function projChoices(extra) {
    return [extra, { label: "🚀 Another project", to: "projects" }, { label: "↺ Back to the start", to: "hub" }];
  }
  S.p_honeypot = {
    lines: [
      "**LLM Honeypot.** A decoy computer system, run by a large language model, that //pretends// to be a soft, vulnerable target.",
      "When attackers break in, they're really talking to an AI that plays along — wasting their time while quietly logging every tool and trick they use.",
      "It flips defense into **intelligence-gathering**. Published at **IEEE CNS 2024**."
    ],
    choices: projChoices({ label: "🕹 Try the honeypot demo", to: "demo_honeypot" })
  };
  S.p_aera = {
    lines: [
      "**AERA** — AI for Emergency Response & Assistance.",
      "A clinician-facing assistant that delivers **psychological first aid**: calm, structured support in mental-health crises — backed by real funding from the SUNY AI Platform and the Global Center for AI in Mental Health.",
      "Empathy at the speed software allows, with a **human always in the loop**."
    ],
    choices: projChoices({ label: "📄 Related research ↗", url: "https://ieeexplore.ieee.org/document/11050703" })
  };
  S.p_banana = {
    lines: [
      "**BananaGuard.** Real-time AI that scans crowded spaces for **firearms and active-shooter threats** — early enough to matter.",
      "It's been benchmarked across multiple AI models and funded through UAlbany's Minerva Center and the SUNY AI Platform.",
      "Public-safety AI where seconds save lives."
    ],
    choices: projChoices({ label: "📄 The paper ↗", url: "https://ieeexplore.ieee.org/document/11050744" })
  };
  S.p_legal = {
    lines: [
      "**LegalGuardian.** A way to point powerful LLMs at **sensitive legal files without leaking them** — privacy-preserving by design.",
      "Paired with his work catching AI-//hallucinated// citations, it's about legal AI you can actually trust in a courtroom.",
      "Accepted at **FTC 2026**."
    ],
    choices: projChoices({ label: "🎯 Try the hallucination demo", to: "demo_hallu" })
  };
  S.p_kg = {
    lines: [
      "**Legal Knowledge Graphs.** Instead of guessing, the AI builds a structured **map of the law** — entities, rules, relationships — then reasons over it.",
      "His case study on **immigration law** appeared at the **ACM Web Conference 2024**.",
      "Grounded answers, not confident fiction."
    ],
    choices: projChoices({ label: "📄 The paper ↗", url: "https://dl.acm.org/doi/10.1145/3589335.3651557" })
  };
  S.p_quantum = {
    lines: [
      "**Quantum Network Science.** He links the //shape// of a network to how well **quantum entanglement** travels across it.",
      "It's a bridge between his deep roots in network science and the frontier of quantum computing. Presented at the **AAAI 2025** symposium.",
      "Beautiful, foundational work."
    ],
    choices: projChoices({ label: "📄 The paper ↗", url: "https://ojs.aaai.org/index.php/AAAI-SS/article/view/36900" })
  };

  /* ===================================================================
     HANDS-ON MINI-DEMOS
     =================================================================== */
  S.demos = {
    lines: ["Reading about research is fine. //Doing// it is better. Pick a demo and prove you were paying attention:"],
    choices: [
      { label: "🎯 Spot the AI hallucination (legal AI)", to: "demo_hallu" },
      { label: "🪤 Set a honeypot trap (cybersecurity)", to: "demo_honeypot" },
      { label: "🕸 Find the hidden hub (network science)", to: "demo_network" }
    ]
  };

  var QUIZ = {
    hallu: [
      { q: ["**Round 1.** One of these legal citations is **real**; the other an AI **made up**. Which is the hallucination?"],
        a: { label: "A) Brady v. Maryland, 373 U.S. 83 (1963)", correct: false, explain: "‘A’ is **real** — Brady is a landmark case. ‘B’ was invented. Automatically spotting fakes like this is exactly what his citation benchmarks do." },
        b: { label: "B) Henderson v. Albany, 512 U.S. 207-x (1994)", correct: true, explain: "Right — **B is invented** (notice the garbled citation). His lab built benchmarks that catch this kind of confident fabrication." } },
      { q: ["**Round 2.** An AI legal assistant says two things. Which is the **hallucination**?"],
        a: { label: "A) ‘This statute was amended in 2015.’ (real citation attached)", correct: false, explain: "‘A’ checks out. ‘B’ invents a quote and attributes it to the Court — the dangerous kind of made-up authority his work flags." },
        b: { label: "B) ‘The Supreme Court called this “the clearest rule in all of law.”’", correct: true, explain: "Yes — **B is fabricated**: a quote no court ever said. Catching this is the heart of his ‘honest AI’ research." } }
    ],
    network: [
      { q: ["A tiny network has nodes **A–E**. A connects to B, C, D and E. B, C, D and E each connect //only// to A.", "Which node is the **hub** holding it all together?"],
        a: { label: "A", correct: true, explain: "Correct — **A** is the hub: remove it and the network shatters. Finding these critical nodes is core to his network-science work." },
        b: { label: "C", correct: false, explain: "Not quite — **A** is the hub; everything routes through it. His internet-topology research is all about finding these load-bearing nodes." } },
      { q: ["**Bonus.** In a social network, who spreads an idea — or a bias — the fastest?"],
        a: { label: "A lonely node on the edge", correct: false, explain: "Nope — it's the **highly-connected hub**. That's why his bias research watches the hubs: stop them and you slow the spread." },
        b: { label: "A highly-connected hub", correct: true, explain: "Exactly. Hubs are super-spreaders — of ideas //and// bias. His work maps them to understand, and interrupt, that spread." } }
    ]
  };
  function renderQuiz() {
    var set = QUIZ[state.quiz.set], item = set[state.quiz.i];
    current = "_quiz"; logInner.innerHTML = ""; log.scrollTop = 0; setRail("demos");
    sayLines(item.q, function () {
      renderChoices([{ label: item.a.label, act: "quiz", pick: item.a }, { label: item.b.label, act: "quiz", pick: item.b }]);
    });
  }
  function quizAnswer(pick) {
    clearChoices();
    if (pick.correct) state.quiz.score++;
    state.quiz.i++;
    var more = state.quiz.i < QUIZ[state.quiz.set].length;
    sayLines([(pick.correct ? "**✓ Look at you.** " : "**✗ Bold guess. Wrong, but bold.** ") + pick.explain], function () {
      renderChoices([{ label: more ? "Next round →" : "Judge me →", act: more ? "quiznext" : "quizdone" }]);
    });
  }
  function quizResult() {
    var set = QUIZ[state.quiz.set], s = state.quiz.score, n = set.length;
    current = "_quiz"; logInner.innerHTML = ""; log.scrollTop = 0; setRail("demos");
    var msg = s === n ? "Perfect — you've got the instincts his AI is //trained// for."
      : s > 0 ? "Not bad! This is exactly the judgment his lab teaches machines."
      : "Tricky, right? That's precisely why he builds AI to catch what humans miss.";
    sayLines(["You scored **" + s + " / " + n + "**.", msg], function () {
      renderChoices([
        { label: "🕹 Try another demo", to: "demos" },
        { label: "🚀 See the real project", to: state.quiz.set === "hallu" ? "p_legal" : "s_network" },
        { label: "↺ Back to the start", to: "hub" }
      ]);
    });
  }
  function quizScene(introLines) {
    var item = QUIZ[state.quiz.set][state.quiz.i];
    return { lines: (introLines || []).concat(item.q),
      choices: [{ label: item.a.label, act: "quiz", pick: item.a }, { label: item.b.label, act: "quiz", pick: item.b }] };
  }
  S.demo_hallu = function () { state.quiz = { set: "hallu", i: 0, score: 0 }; return quizScene(["Dr. Canbaz's lab builds AI that catches when other AIs //make things up//. Your turn…"]); };
  S.demo_network = function () { state.quiz = { set: "network", i: 0, score: 0 }; return quizScene(["He began his career mapping the //hidden shape// of networks. Let's test your eye…"]); };

  S.demo_honeypot = {
    lines: [
      "You're an **AI honeypot**, pretending to be a vulnerable server. An attacker just connected.",
      "They ask: //“what's running on this box? any admin access?”// How do you bait them?"
    ],
    choices: [
      { label: "🎣 Dangle a juicy fake ‘admin’ panel", to: "honey_a" },
      { label: "🐌 Play dumb and stall for time", to: "honey_b" }
    ]
  };
  var honeyEnd = [{ label: "📄 The real LLM Honeypot paper ↗", url: "https://ieeexplore.ieee.org/document/10735607" }, { label: "🕹 Try another demo", to: "demos" }, { label: "↺ Back to the start", to: "hub" }];
  S.honey_a = {
    lines: [
      "The attacker takes the bait and dives for the fake ‘admin’ panel. 🎣",
      "Every keystroke — their tools, their exploits, their habits — is quietly logged. They think they're winning; really, they're the //study subject//.",
      "**That's the LLM Honeypot:** turning an attack into intelligence."
    ],
    choices: honeyEnd
  };
  S.honey_b = {
    lines: [
      "You stall — and the AI improvises convincing, useless answers, keeping them busy. 🐌",
      "Minutes burn away while you fingerprint exactly how they operate.",
      "**That's the LLM Honeypot:** patience, weaponized."
    ],
    choices: honeyEnd
  };

  /* ===================================================================
     BRING ME A PROBLEM
     =================================================================== */
  S.problem = {
    lines: [
      "Alright, hit me with a real challenge — or pick an area — and I'll show you how Dr. Canbaz would actually tackle it. (No, ‘make me rich’ is not a research area.)",
      "You can **type your problem**, or pick:"
    ],
    choices: [
      { label: "⚖️ Something in law or policy", set: { prob: "law" }, to: "prob_answer" },
      { label: "💜 Mental health or wellbeing", set: { prob: "mind" }, to: "prob_answer" },
      { label: "🛡 Security or online threats", set: { prob: "cyber" }, to: "prob_answer" },
      { label: "🚨 Public safety or emergencies", set: { prob: "safety" }, to: "prob_answer" },
      { label: "🤖 Trust & fairness in AI", set: { prob: "trust" }, to: "prob_answer" }
    ]
  };
  var PROB = {
    law: { lead: "law & policy", proj: "**LegalGuardian** and his legal knowledge-graph work", url: "https://dl.acm.org/doi/10.1145/3589335.3651557",
      steps: ["**ground the AI in real sources** so it can't invent citations", "build a **knowledge graph** of the domain so it reasons instead of guessing", "**benchmark it for honesty** before anyone relies on it"] },
    mind: { lead: "mental health & wellbeing", proj: "**AERA**, his AI psychological-first-aid assistant", url: "https://ieeexplore.ieee.org/document/11050703",
      steps: ["keep a **human in the loop** — AI assists, never replaces, the clinician", "surface **early-warning signals** from messy notes and narratives", "design for **empathy and privacy** from the first line of code"] },
    cyber: { lead: "security & online threats", proj: "his **LLM Honeypot** and cyber-deception research", url: "https://ieeexplore.ieee.org/document/10735607",
      steps: ["turn defense into **intelligence** — bait attackers and study them", "deploy **AI deception** so the system fights back, not just blocks", "stress-test against **adversaries and poisoning** before trusting it"] },
    safety: { lead: "public safety & emergencies", proj: "**BananaGuard** and his crisis-response LLM platforms", url: "https://ieeexplore.ieee.org/document/10607148",
      steps: ["use AI to turn **chaos into clear next steps** for responders", "detect threats **early enough to act**, in real time", "validate relentlessly — in safety, false alarms cost trust"] },
    trust: { lead: "trust & fairness in AI", proj: "his **AI-bias mapping** framework", url: "https://link.springer.com/article/10.1007/s43681-024-00609-0",
      steps: ["map **where bias enters and how it spreads**, like tracing a disease", "measure it with **network-based metrics**, not vibes", "build **mitigation in by design**, then prove it works"] },
    general: { lead: "that", proj: "his cross-disciplinary projects", url: "https://www.albany.edu/cehc/faculty/m-abdullah-canbaz",
      steps: ["frame it as a **system**, not a single model", "**ground the AI in real data** so it stays honest", "**measure bias and failure** before anything ships"] }
  };
  function probMatch(low) {
    if (/law|legal|policy|court|contract|regulat|attorney/.test(low)) return "law";
    if (/mental|health|therap|depress|wellbe|stress|anx|mood|suicid/.test(low)) return "mind";
    if (/cyber|security|hack|threat|attack|phish|malware|intrus|breach/.test(low)) return "cyber";
    if (/safety|emergenc|disaster|crowd|shoot|firearm|responder|rescue/.test(low)) return "safety";
    if (/bias|fair|trust|fake|misinfo|hallucin|ethic|govern/.test(low)) return "trust";
    return "general";
  }
  /* ===================================================================
     OPT-IN EMAIL CAPTURE (visitor chooses to leave details)
     =================================================================== */
  S.lead = {
    input: "email",
    lines: [
      "Look at you — willing to be contacted by an actual human. Brave.",
      "Drop your **email** below and I'll make sure it reaches Dr. Canbaz. //(Used only to reply to you. I have standards.)//"
    ],
    choices: [{ label: "On second thought, never mind", to: "contact" }]
  };
  S.lead_done = {
    lines: ["Done — assuming I did my one job correctly. He'll be in touch, {name}. 🙂"],
    choices: [{ label: "🚀 Explore his projects", to: "projects" }, { label: "↺ Back to the start", to: "hub" }]
  };

  /* ===================================================================
     TEACHING — courses + live per-semester syllabus links (from PROFILE)
     =================================================================== */
  S.teaching = function () {
    var P = window.PROFILE || { courses: [] };
    var lines = ["The classes Dr. Canbaz teaches at UAlbany:"];
    P.courses.forEach(function (c) { lines.push("**" + c.code + "** — " + c.name); });
    var choices = [];
    P.courses.forEach(function (c) {
      (c.semesters || []).forEach(function (s) {
        if (s.url) choices.push({ label: "📄 " + c.code + " · " + s.label + " syllabus ↗", url: s.url });
      });
    });
    lines.push(choices.length
      ? "Tap a **live syllabus** below — these update every semester:"
      : "Live syllabi get posted here each semester.");
    choices.push({ label: "📚 All course materials ↗", url: "https://github.com/mabdullahcanbaz/Teaching" });
    choices.push({ label: "↺ Back to the start", to: "hub" });
    return { lines: lines, choices: choices };
  };

  /* numbers scene — driven by computed stats in data/profile.js */
  S.numbers = function () {
    var st = (window.PROFILE && window.PROFILE.stats) || { pubsPlus: "35+", funding: "$1.7M+", phd: "6", federal: "3" };
    return {
      lines: [
        "If you like numbers, here's the shape of it:",
        "**" + st.pubsPlus + "** published papers. **" + st.funding + "** in research funding. **" + st.phd + "** PhD researchers. **" + st.federal + "** federal grants — from the NSF, USDA, and NIH.",
        "But numbers undersell it. Every one of those is a real attempt to make AI //useful and humane//."
      ],
      choices: [
        { label: "Tell me the story behind one", to: "stories" },
        { label: "How do I reach him?", to: "contact" },
        { label: "Back to the start", to: "hub" }
      ]
    };
  };

  /* ===================================================================
     WHO IS KaFa-1500 — the vision behind the guide
     =================================================================== */
  S.about_kafa = {
    lines: [
      "Ah, my origin story. Flattering. Pull up a chair.",
      "My name is a Turkish in-joke. There's a slang phrase — //“kafa bir milyon”//, literally **‘head: one million’** — for a mind that's gloriously **fried**: overloaded, dizzy, buzzing with too many ideas and not nearly enough sleep. Every grad student knows the feeling.",
      "So I'm **KaFa-1500**. Same energy — //a head full of ideas// — but a humble fifteen hundred. I'm not //all// the way cooked. Yet.",
      "Officially I'm a guide on a webpage. Unofficially, I'm a //prototype// of something bigger Dr. Canbaz is slowly building:",
      "a **super-agent** — sharp, a little sarcastic, allergic to nonsense. //“The less-idiot part of me,”// in his words, //“that never gets tired, never forgets a citation, and never pretends a bad idea is good.”//",
      "It'll reason across all his research, **catch its own mistakes**, refuse to hallucinate, and still be funny about it. Honest AI with a personality — the exact opposite of a yes-man.",
      "I'm the //personality demo//. Version one-point-**barely**. The real one is still in the lab, quietly becoming dangerous.",
      "Want to see the work that's frying my circuits?"
    ],
    choices: [
      { label: "🚀 The projects feeding the dream", to: "projects" },
      { label: "🧭 Meet the human behind me", to: "about" },
      { label: "↺ Back to the start", to: "hub" }
    ]
  };

  S.prob_answer = function () {
    var p = PROB[state.prob] || PROB.general;
    return {
      lines: [
        "A challenge in **" + p.lead + "**. Finally, something worth my processing cycles.",
        "Here's the Canbaz playbook:",
        "① " + p.steps[0],
        "② " + p.steps[1],
        "③ " + p.steps[2],
        "He's done exactly this in " + p.proj + " — and he'd bring his lab's students in to build it for real.",
        "This sits right in his wheelhouse. Want to take it to him?"
      ],
      choices: [
        { label: "📄 See related work ↗", url: p.url },
        { label: "✉️ Email Dr. Canbaz", url: "mailto:mcanbaz@albany.edu" },
        { label: "🧩 Try another area", to: "problem" },
        { label: "↺ Back to the start", to: "hub" }
      ]
    };
  };

  /* ---------- go to a scene ---------- */
  function go(id) {
    var scene = S[id];
    scene = typeof scene === "function" ? scene() : scene;
    if (!scene) return;
    current = id;
    if (window.CANBAZ && CANBAZ.track) CANBAZ.track("view", { scene: id });
    logInner.innerHTML = "";   // wipe the screen for a clean step
    log.scrollTop = 0;
    setRail(id);
    sayLines(scene.lines, function () {
      renderChoices(scene.choices || []);
      if (scene.input === "name") input.focus();
    });
  }

  /* ---------- input + keyboard ---------- */
  function sanitize(s) { return s.replace(/[<>]/g, "").trim().slice(0, 24); }

  /* ---------- knowledge base (CAN answers typed questions) ---------- */
  var DEFAULT_FOLLOWUPS = [
    { label: "🔬 Tell me a lab story", to: "stories" },
    { label: "🎨 Make something with me", to: "play_world" },
    { label: "↺ Back to the start", to: "hub" }
  ];
  var STORY_SCENES = ["s_legal", "s_health", "s_cyber", "s_crisis", "s_network", "s_fair"];

  function findIntent(id) { var KB = window.CAN_KB || []; for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i]; return null; }
  function matchKB(low) {
    var KB = window.CAN_KB || [], best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var e = KB[i], sc = 0;
      for (var k = 0; k < e.kw.length; k++) if (low.indexOf(e.kw[k]) !== -1) sc++;
      if (sc > bestScore) { bestScore = sc; best = e; }
    }
    return bestScore > 0 ? best : null;
  }
  function answerKB(entry) {
    current = "_kb"; logInner.innerHTML = ""; log.scrollTop = 0; setRail("_kb");
    sayLines(entry.lines || ["I don't have a note on that yet, **{name}** — try tapping an option below."],
      function () { renderChoices(entry.choices || DEFAULT_FOLLOWUPS); });
  }
  function runIntent(entry) {
    if (!entry) { go("hub"); return; }
    if (entry.act === "surprise") { go(STORY_SCENES[Math.floor(Math.random() * STORY_SCENES.length)]); return; }
    if (entry.to) { if (entry.to.indexOf("_intent:") === 0) { runIntent(findIntent(entry.to.slice(8))); return; } go(entry.to); return; }
    answerKB(entry);
  }

  var ROUTES = [
    [/creativ|generativ/, "creative"], [/who|about|canbaz|him|person/, "about"],
    [/stor|lab|research|paper|work/, "stories"], [/make|play|create|generate|build/, "play_world"],
    [/number|fund|grant|money|stat/, "numbers"], [/contact|email|reach|hire/, "contact"],
    [/law|legal|court/, "s_legal"], [/health|mental|therap|mind/, "s_health"],
    [/cyber|hack|honeypot|security/, "s_cyber"], [/crisis|emergenc|disaster/, "s_crisis"],
    [/network|topolog|graph|internet/, "s_network"], [/bias|fair|ethic|responsib/, "s_fair"],
    [/start|home|begin|menu/, "hub"]
  ];

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim(); input.value = "";
    if (!v) return;
    var scene = typeof S[current] === "function" ? S[current]() : S[current];
    if (scene && scene.input === "name") { state.name = sanitize(v) || "friend"; go("hub"); return; }
    if (scene && scene.input === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        clearChoices();
        sayLines(["That… does not look like an email, {name}. Care to try again? //(or tap ‘never mind’)//"], function () { renderChoices(choicesNow); });
        return;
      }
      if (window.CANBAZ && CANBAZ.submitLead) CANBAZ.submitLead({ name: state.name, email: v.trim() });
      go("lead_done"); return;
    }
    var low = v.toLowerCase();
    if (current === "problem") { state.prob = probMatch(low); go("prob_answer"); return; }
    var hit = matchKB(low);
    if (hit) { runIntent(hit); return; }
    for (var i = 0; i < ROUTES.length; i++) { if (ROUTES[i][0].test(low)) { go(ROUTES[i][1]); return; } }
    clearChoices();
    sayLines(["I didn't quite catch that, **{name}** — but no worries. Tap any option above, or ask me something like //“what does he research?”// or //“can I do a PhD with him?”//"], function () { renderChoices(choicesNow); });
  });

  // number keys pick a choice — only when the input is empty (so names still type)
  document.addEventListener("keydown", function (e) {
    if (e.key >= "1" && e.key <= "9" && document.activeElement === input && input.value === "") {
      var n = parseInt(e.key, 10) - 1;
      if (choicesNow[n]) { e.preventDefault(); choose(choicesNow[n]); }
    }
  });

  // click the transcript to fast-forward typing
  log.addEventListener("click", function (e) {
    if (e.target.closest(".choice")) return;
    if (typing) { skip = true; setTimeout(function () { skip = false; }, 50); }
  });

  // rail navigation
  railEl.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li) return;
    var id = li.getAttribute("data-go");
    if (id === "hub" && !state.name) { return; }
    clearChoices(); go(id);
  });

  document.getElementById("restart").addEventListener("click", function () {
    logInner.innerHTML = ""; state = { name: "", world: "", flavor: "" }; go("intro");
  });

  /* ---------- theme toggle (default dark, remembered) ---------- */
  var themeBtn = document.getElementById("theme");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.textContent = t === "light" ? "☾ dark" : "☀︎ light";
    try { localStorage.setItem("story-theme", t); } catch (e) {}
  }
  (function () { var saved; try { saved = localStorage.getItem("story-theme"); } catch (e) {} applyTheme(saved === "light" ? "light" : "dark"); })();
  themeBtn.addEventListener("click", function () {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* keep focus convenient */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".choice") || e.target.closest("a") || e.target.closest(".chip") || e.target.closest(".rail")) return;
    if (window.getSelection && String(window.getSelection())) return;
    input.focus();
  });

  /* ---------- boot ---------- */
  go("intro");
})();
