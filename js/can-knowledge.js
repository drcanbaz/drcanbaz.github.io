/* =========================================================================
   CAN — knowledge base
   Plain-English answers about Dr. Canbaz that CAN draws on when a visitor
   TYPES a question. Edit freely: each item is { id, kw, ... }.
     kw    : trigger substrings (keep them distinctive; avoid bare "ai")
     to    : jump straight to a story scene  (s_legal, stories, contact, …)
     act   : 'surprise' = CAN picks a random lab story
     lines : what CAN says (supports **bold**, //hl//, ^^gold^^, {name})
     choices: follow-up buttons ({label, to} | {label, url})
   More specific intents should come first (matcher prefers the best score).
   ========================================================================= */
window.CAN_KB = [

  /* ---- conversational ---- */
  { id: "greet", kw: ["hello", "hey", "hi ", "hiya", "howdy", "good morning", "good evening", "good afternoon", "greetings"],
    lines: ["{name}. We meet (or meet again — I genuinely can't tell). Ask me anything about Dr. Canbaz, or tap an option."],
    choices: [{ label: "What does he research?", to: "stories" }, { label: "What is Creative AI?", to: "creative" }, { label: "How do I reach him?", to: "contact" }] },

  { id: "thanks", kw: ["thank", "thanks", "thx", "appreciate", "cheers"],
    lines: ["Don't mention it, {name}. Literally — I won't remember this. Keep exploring?"],
    choices: [{ label: "Tell me a lab story", to: "stories" }, { label: "Make something with me", to: "play_world" }, { label: "Back to start", to: "hub" }] },

  { id: "whoareyou", kw: ["who are you", "what are you", "your name", "are you ai", "are you real", "you a bot", "what is kafa", "who is kafa", "kafa-1500", "kafa 1500", "super agent", "the vision", "your story", "the dream", "about you"], to: "about_kafa" },

  { id: "namemeaning", kw: ["tightrope", "canbaz mean", "meaning of", "turkish", "acrobat", "why kafa", "what does canbaz mean", "what does kafa", "kafa bir milyon", "fried"],
    lines: ["Language trivia: //kafa// means ‘**head / mind**’ in Turkish, and the slang //“kafa bir milyon”// describes a mind that's wonderfully **fried** — overloaded with ideas. I'm **KaFa-1500**: same vibe, humbly dialed down to 1500.",
      "And ‘**Canbaz**’? Turkish for a **tightrope-walker** — fitting for someone who balances bold AI with real ^^responsibility^^."],
    choices: [{ label: "Tell me the whole KaFa story", to: "about_kafa" }, { label: "Show me his work", to: "projects" }] },

  /* ---- the person ---- */
  { id: "education", kw: ["education", "degree", "phd from", "study where", "where did he study", "graduate", "alma mater", "reno", "nevada", "iupui", "fatih", "doctorate"],
    lines: ["**Ph.D.** in Computer Science & Engineering — University of Nevada, Reno (2018), with the **Best Dissertation Award**.",
      "Before that: an **M.S.** at IUPUI (Indianapolis) and a **B.S.** at Fatih University (Istanbul)."],
    choices: [{ label: "More about him", to: "about" }, { label: "His research", to: "stories" }] },

  { id: "honors", kw: ["honor", "award", "ieee", "fellow", "recognition", "senior member", "achievement", "prize", "accolade"],
    lines: ["He's an **IEEE Senior Member** and an inaugural **AI & Society Research Fellow**.",
      "He's also won **Excellence in Research** (2024) and a **Best Dissertation** award for his PhD."],
    choices: [{ label: "More about him", to: "about" }, { label: "By the numbers", to: "numbers" }] },

  { id: "location", kw: ["where is", "located", "location", "office", "albany", "what city", "campus", "find him", "based"],
    lines: ["He's at the **University at Albany (SUNY)** — ETEC building, Room 260M, in Albany, New York."],
    choices: [{ label: "How do I reach him?", to: "contact" }, { label: "Back to start", to: "hub" }] },

  /* ---- research: general + domains ---- */
  { id: "research", kw: ["research", "what does he study", "areas", "his focus", "work on", "specializ", "expert", "field", "topics", "what does he do"],
    lines: ["He works where **AI meets messy, real-world systems** — six areas in all:",
      "legal AI, mental-health AI, cybersecurity, crisis response, network science, and responsible AI.",
      "Want the story behind one?"],
    choices: [{ label: "🔬 Pick a story", to: "stories" }, { label: "What is Creative AI?", to: "creative" }] },

  { id: "legal", kw: ["legal", "law", "court", "lawyer", "attorney", "litig", "legaltech", "case law", "judicial"], to: "s_legal" },
  { id: "health", kw: ["mental", "health", "therap", "depress", "wellbe", "psych", "mood", "behavioral", "suicide", "counsel"], to: "s_health" },
  { id: "cyber", kw: ["cyber", "hack", "honeypot", "security", "malware", "deception", "attacker", "intrusion", "defense"], to: "s_cyber" },
  { id: "crisis", kw: ["crisis", "emergenc", "disaster", "first responder", "satellite", "firearm", "shooter", "public safety", "rescue"], to: "s_crisis" },
  { id: "network", kw: ["network science", "topolog", "graph", "internet", "complex system", "quantum", "node", "connectom"], to: "s_network" },
  { id: "bias", kw: ["bias", "fair", "ethic", "responsib", "govern", "hallucinat", "trustworth", "safe ai"], to: "s_fair" },

  /* ---- flagship projects, demos, problem-solving ---- */
  { id: "projects", kw: ["project", "flagship", "what has he built", "what did he build", "systems", "his work", "built", "products", "tools he"], to: "projects" },
  { id: "demos", kw: ["demo", "try it", "interactive", "play with", "game", "show me how", "hands on", "experience"], to: "demos" },
  { id: "problem", kw: ["i have a problem", "my problem", "help me with", "how would he", "tackle", "solve", "i'm working on", "i am working on", "my idea", "advice", "approach"], to: "problem" },
  { id: "honeypot", kw: ["honeypot", "honey pot", "trap hacker", "decoy"], to: "p_honeypot" },
  { id: "aera", kw: ["aera", "psychological first aid", "pfa", "first aid"], to: "p_aera" },
  { id: "banana", kw: ["banana", "firearm detect", "gun detect", "active shooter", "weapon detect"], to: "p_banana" },

  /* ---- output: papers, money, teaching, people ---- */
  { id: "pubs", kw: ["publication", "paper", "journal", "article", "conference", "how many paper", "published", "citation", "preprint", "google scholar"],
    lines: ["He's published **" + ((window.PROFILE && window.PROFILE.stats.pubsPlus) || "35+") + "** peer-reviewed papers in AI, machine learning, network science, and cybersecurity —",
      "in venues like **IEEE, ACM, ACL, and Springer**. Recent work covers legal hallucination benchmarks, AI honeypots, and mental-health copilots."],
    choices: [{ label: "Tell me about one", to: "stories" }, { label: "See the full list ↗", url: "classic.html#publications" }] },

  { id: "funding", kw: ["fund", "grant", "money", "budget", "nsf", "usda", "nih", "sponsor", "financ", "how much"], to: "numbers" },

  { id: "teaching", kw: ["teach", "course", "class", "cinf", "syllab", "lecture", "what does he teach", "creative ai course", "syllabus", "semester"], to: "teaching" },

  { id: "lab", kw: ["lab", "student", "phd student", "advise", "mentor", "team", "who works", "researcher", "group", "members"],
    lines: ["The **AI in Complex Systems Lab** has six PhD researchers, plus master's and undergraduate students.",
      "They work on cyber deception, agentic-AI assurance, AI governance, recommender bias, behavioral-health AI, and legal knowledge graphs."],
    choices: [{ label: "Hear what they build", to: "stories" }, { label: "Can I join / collaborate?", to: "_intent:collab" }] },

  /* ---- intent: collaborate / hire / apply ---- */
  { id: "collab", kw: ["collaborat", "work with", "join", "apply", "phd position", "opening", "available", "hire", "internship", "advisor", "supervis", "prospective", "recruit"],
    lines: ["He welcomes **students, collaborators, and the simply-curious**.",
      "If you're thinking PhD, research, or partnership — the best move is a short, specific email about what you'd like to do."],
    choices: [{ label: "✉️ Email him", url: "mailto:mcanbaz@albany.edu" }, { label: "🌐 Faculty page ↗", url: "https://www.albany.edu/cehc/faculty/m-abdullah-canbaz" }] },

  /* ---- sensitive: keep consulting clients private ---- */
  { id: "consult", kw: ["consult", "client", "company he", "industry partner", "advise for", "who does he advise", "corporate"],
    lines: ["For partnership or consulting questions, it's best to reach out to him directly — he'll take it from there."],
    choices: [{ label: "✉️ Email him", url: "mailto:mcanbaz@albany.edu" }, { label: "Back to start", to: "hub" }] },

  /* ---- make something / surprise / help ---- */
  { id: "make", kw: ["make something", "generate", "create idea", "let's play", "build me", "brainstorm", "spark", "play"], to: "play_world" },

  { id: "surprise", kw: ["surprise", "random", "anything", "whatever", "you choose", "you pick", "recommend", "something cool"], act: "surprise" },

  { id: "help", kw: ["help", "what can i ask", "what can you", "options", "menu", "lost", "examples", "suggest", "how does this work", "confused"],
    lines: ["You can ask me things in plain English, {name} — for example:",
      "//“what does he research?”// · //“how many papers?”// · //“can I do a PhD with him?”// · //“what's creative AI?”//",
      "Or just tap one of these:"],
    choices: [{ label: "🔬 His research", to: "stories" }, { label: "📊 By the numbers", to: "numbers" }, { label: "🎨 Make something", to: "play_world" }, { label: "📨 Reach out", to: "contact" }] }
];
