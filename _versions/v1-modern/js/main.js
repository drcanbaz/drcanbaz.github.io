/* =========================================================================
   M. Abdullah Canbaz — site interactions
   Vanilla JS, no dependencies. Theme, nav, scroll-spy, publication filtering.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var stored = localStorage.getItem("theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav__toggle");
  var navLinks = document.querySelector(".nav__links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () { navLinks.classList.toggle("open"); });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* ---------- Nav background on scroll + scroll-spy ---------- */
  var nav = document.querySelector(".nav");
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));

  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
    var pos = window.scrollY + 120;
    var current = "";
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= pos) current = sections[i].id;
    }
    navItems.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Publications ---------- */
  // type: journal | conference | chapter ; status: published | accepted | review
  var PUBS = [
    // ----- Journals -----
    { y: 2026, type: "journal", status: "published",
      title: "Machine Learning-Assisted DNA Origami Shape Sorting Using Fingerprinting Nanosensors and Feature Engineering",
      authors: "Singha, S., Demir, M. M., Morya, V., Halvorsen, K., <b>Canbaz, M. A.</b>, Chandrasekaran, A. R., & Yigit, M. V.",
      venue: "Analytical Chemistry (ACS)",
      link: "https://pubs.acs.org/doi/10.1021/acs.analchem.5c06210" },
    { y: 2025, type: "journal", status: "published",
      title: "CRISPR-Responsive Reprogrammable Label-Free Fluorescent Nanoclusters for ML-Assisted Pathogenic Genome Detection",
      authors: "Hanson, E. J., Kalla, E., Tharu, R. J., Demir, M., Tok, B., <b>Canbaz, M. A.</b>, & Yigit, M.",
      venue: "Small (Nanoscience & Nanotechnology)",
      link: "https://pubmed.ncbi.nlm.nih.gov/40033995/" },
    { y: 2025, type: "journal", status: "published",
      title: "Mapping Artificial Intelligence Bias: A Network-Based Framework for Analysis and Mitigation",
      authors: "Al Makinah, R., Goodarzi, M., Tok, B., & <b>Canbaz, M. A.</b>",
      venue: "AI and Ethics, Springer Nature",
      link: "https://link.springer.com/article/10.1007/s43681-024-00609-0" },
    { y: 2019, type: "journal", status: "published",
      title: "Investigating Characteristics of Internet Paths",
      authors: "<b>Canbaz, M. A.</b>, Bakhshaliyev, K., & Gunes, M. H.",
      venue: "ACM Transactions on Modeling and Performance Evaluation of Computing Systems (ToMPECS)",
      link: "https://dl.acm.org/doi/10.1145/3342286" },
    { y: 2019, type: "journal", status: "published",
      title: "Epileptic Seizure Detection Using Hybrid Machine Learning Methods",
      authors: "Subasi, A., <b>Canbaz, M. A.</b>, & Kevric, J.",
      venue: "Neural Computing and Applications",
      link: "https://link.springer.com/article/10.1007/s00521-017-3003-y" },
    { y: 2017, type: "journal", status: "published",
      title: "A Survey of Social Network Forensics",
      authors: "Karabiyik, U., <b>Canbaz, M. A.</b>, Tuna, T., Aksoy, A., Akbas, E., Gonen, B., & Aygun, R.",
      venue: "International Journal of Digital Crime and Forensics (IJDCF)",
      link: "https://commons.erau.edu/jdfsl/vol11/iss4/8/" },
    { y: 2016, type: "journal", status: "published",
      title: "User Characterization for Online Social Networks",
      authors: "Tuna, T., Aksoy, A., <b>Canbaz, M. A.</b>, Akbas, E., Karabiyik, U., Gonen, B., & Aygun, R.",
      venue: "Social Network Analysis and Mining (SNAM), Springer",
      link: "https://link.springer.com/article/10.1007/s13278-016-0412-3" },

    // ----- Book chapters -----
    { y: 2025, type: "chapter", status: "published",
      title: "Topology-Driven Mental Health Resilience: A Network Science Simulation Study",
      authors: "Al Makinah, R., & <b>Canbaz, M. A.</b>",
      venue: "Complex Networks & Their Applications XIV (COMPLEX NETWORKS 2025), Springer",
      link: "https://link.springer.com/chapter/10.1007/978-3-032-16719-4_21" },
    { y: 2025, type: "chapter", status: "published",
      title: "Quantum Network Science: Linking Graph Structure to Entanglement Performance",
      authors: "Al Makinah, R., & <b>Canbaz, M. A.</b>",
      venue: "First AAAI Symposium on Quantum Information & Machine Learning (QIML)",
      link: "https://ojs.aaai.org/index.php/AAAI-SS/article/view/36900" },
    { y: 2025, type: "chapter", status: "published",
      title: "Who Coordinates U.S. Cyber Defense? A Co-Authorship Network Analysis of Joint Cybersecurity Advisories (2024–2025)",
      authors: "<b>Canbaz, M. A.</b>, Otal, H. T., Unlu, T., Alhussein, N., & Nussbaum, B.",
      venue: "Complex Networks & Their Applications XIV (COMPLEX NETWORKS 2025), Springer",
      link: "https://link.springer.com/chapter/10.1007/978-3-032-16723-1_19" },
    { y: 2024, type: "chapter", status: "published",
      title: "A New Perspective on ADHD Research: Knowledge Graph Construction with LLMs and Network-Based Insights",
      authors: "Otal, H. T., Faraone, S., & <b>Canbaz, M. A.</b>",
      venue: "Complex Networks & Their Applications XIII (CNA 2024), Springer",
      link: "https://link.springer.com/chapter/10.1007/978-3-031-82427-2_28" },
    { y: 2024, type: "chapter", status: "published",
      title: "Exploring Consumer Bias Patterns in Fashion E-Commerce through LLM-Based Sentiment and Network Analysis",
      authors: "Goodarzi, M., & <b>Canbaz, M. A.</b>",
      venue: "Complex Networks & Their Applications XIII (CNA 2024), Springer",
      link: "https://link.springer.com/chapter/10.1007/978-3-031-82427-2_24" },
    { y: 2024, type: "chapter", status: "published",
      title: "Depression Detection from Wearables Using Machine Learning Techniques",
      authors: "Al Makinah, R., <b>Canbaz, M. A.</b>, & Subasi, A.",
      venue: "Digital Healthcare, Academic Press / Elsevier",
      link: "https://www.sciencedirect.com/science/article/abs/pii/B9780443301681000104" },
    { y: 2024, type: "chapter", status: "published",
      title: "Analysis of Gene Regulatory Networks from Gene Expression Using Graph Neural Networks",
      authors: "Otal, H. T., Subasi, A., Kurt, F., <b>Canbaz, M. A.</b>, & Uzun, Y.",
      venue: "Digital Healthcare, Academic Press / Elsevier",
      link: "https://www.sciencedirect.com/science/article/abs/pii/B9780443301681000116" },
    { y: 2023, type: "chapter", status: "published",
      title: "Untangling Emotional Threads: Hallucination Networks of Large Language Models",
      authors: "Goodarzi, M., Venkatarakrishnan, R., & <b>Canbaz, M. A.</b>",
      venue: "Complex Networks & Their Applications XII (CNA 2023), Springer",
      link: "https://link.springer.com/chapter/10.1007/978-3-031-53468-3_17" },
    { y: 2022, type: "chapter", status: "published",
      title: "Advanced Pattern Recognition Tools for Disease Diagnosis",
      authors: "Subasi, A., Panigrahi, S. S., Patil, B. S., <b>Canbaz, M. A.</b>, & Klén, R.",
      venue: "Intelligent Data-Centric Systems, Academic Press / Elsevier",
      link: "https://www.sciencedirect.com/science/article/abs/pii/B9780323905480000115" },

    // ----- Conferences (published) -----
    { y: 2025, type: "conference", status: "published",
      title: "Legal Argument Mining the TCA's Technology Undertaking Exception with Turkish BERT",
      authors: "Demir, M., & <b>Canbaz, M. A.</b>",
      venue: "1st Workshop on Data Mining and AI in Law (DMAIL 2025) @ IEEE ICDM 2025, Washington, DC",
      link: "https://ieeexplore.ieee.org/abstract/document/11415810" },
    { y: 2025, type: "conference", status: "published",
      title: "Validate Your Authority: Benchmarking LLMs on Multi-Label Precedent Treatment Classification",
      authors: "Demir, M. M., & <b>Canbaz, M. A.</b>",
      venue: "Natural Legal Language Processing Workshop 2025 (NLLP), ACL, Suzhou, China",
      link: "https://aclanthology.org/2025.nllp-1.13/" },
    { y: 2025, type: "conference", status: "published",
      title: "Modeling Bias Evolution in Fashion Recommender Systems: A System Dynamics Approach",
      authors: "Goodarzi, M., & <b>Canbaz, M. A.</b>",
      venue: "43rd International System Dynamics Conference, Boston, USA",
      link: "https://proceedings.systemdynamics.org/2025/papers/P1254.pdf" },
    { y: 2025, type: "conference", status: "published",
      title: "Heuristics and Biases in AI Decision-Making: Implications for Responsible AGI",
      authors: "Saeedi, P., Goodarzi, M., & <b>Canbaz, M. A.</b>",
      venue: "6th Intl. Conference on AI, Robotics, and Control (AIRC 2025), Savannah, USA",
      link: "https://ieeexplore.ieee.org/document/11077505" },
    { y: 2025, type: "conference", status: "published",
      title: "Federated Learning in Adversarial Environments: Testbed Design and Poisoning Resilience in Cybersecurity",
      authors: "Huang, H. J., Otal, H. T., & <b>Canbaz, M. A.</b>",
      venue: "IEEE International Conference on Communications (ICC), Montreal, Canada",
      link: "https://ieeexplore.ieee.org/abstract/document/11162297" },
    { y: 2025, type: "conference", status: "published",
      title: "BananaGuard: A Comparative Analysis of AI Models for Firearm Detection in Crowded Environments",
      authors: "Kara, R., Tok, B., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI), Los Angeles, USA",
      link: "https://ieeexplore.ieee.org/document/11050744" },
    { y: 2025, type: "conference", status: "published",
      title: "Enhancing Mental Health Support through Human-AI Collaboration: Toward Secure and Empathetic AI-Enabled Chatbots",
      authors: "Al Makinah, R., Norcini-Pala, A., Disney, L., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI), Los Angeles, USA",
      link: "https://ieeexplore.ieee.org/document/11050703" },
    { y: 2024, type: "conference", status: "published",
      title: "LLM Honeypot: Leveraging Large Language Models as Advanced Interactive Honeypot Systems",
      authors: "Otal, H. T., & <b>Canbaz, M. A.</b>",
      venue: "IEEE CNS Cyber Resilience Workshop, Taipei, Taiwan",
      link: "https://ieeexplore.ieee.org/document/10735607" },
    { y: 2024, type: "conference", status: "published",
      title: "AI-Powered Crisis Response: Streamlining Emergency Management with LLMs",
      authors: "Otal, H. T., & <b>Canbaz, M. A.</b>",
      venue: "IEEE WF-PST, Washington, DC, USA",
      link: "https://ieeexplore.ieee.org/document/10607148" },
    { y: 2024, type: "conference", status: "published",
      title: "Harnessing Deep Learning and Satellite Imagery for Post-Buyout Land Cover Mapping",
      authors: "Otal, H. T., Zavar, E., Binder, S. B., Greer, A., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI), Singapore",
      link: "https://ieeexplore.ieee.org/document/10605327" },
    { y: 2024, type: "conference", status: "published",
      title: "LLM-Assisted Crisis Management: Building Advanced LLM Platforms for Effective Emergency Response and Public Collaboration",
      authors: "Otal, H. T., Stern, E., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI), Singapore",
      link: "https://ieeexplore.ieee.org/document/10605553" },
    { y: 2024, type: "conference", status: "published",
      title: "Advancing Legal Intelligence: AI-Powered Semantic Knowledge Graph Construction — A Case Study on Immigration Law",
      authors: "Venkatarakrishnan, R., Tanyildizi, E., & <b>Canbaz, M. A.</b>",
      venue: "ACM Web Conference (WWW '24), Singapore",
      link: "https://dl.acm.org/doi/10.1145/3589335.3651557" },
    { y: 2023, type: "conference", status: "published",
      title: "Exploring Large Language Models' Emotion Detection Abilities: Use Cases from the Middle East",
      authors: "Venkatarakrishnan, R., Goodarzi, M., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI), San Francisco, USA",
      link: "https://ieeexplore.ieee.org/document/10195066" },
    { y: 2021, type: "conference", status: "published",
      title: "IoT Privacy and Security in Teaching Institutions: Inside the Classroom and Beyond",
      authors: "O'Hearon, K., McKee, M., Hossain, M. N., & <b>Canbaz, M. A.</b>",
      venue: "128th ASEE Annual Conference and Exposition, Los Angeles, USA",
      link: "https://peer.asee.org/iot-privacy-and-security-in-teaching-institutions-inside-the-classroom-and-beyond" },
    { y: 2018, type: "conference", status: "published",
      title: "On Correlating ISP Topologies to Their Businesses",
      authors: "Dey, P., <b>Canbaz, M. A.</b>, Yuksel, M., & Gunes, M. H.",
      venue: "IEEE ICC 2018, Kansas City, USA",
      link: "https://ieeexplore.ieee.org/document/8422620" },
    { y: 2018, type: "conference", status: "published",
      title: "Router-Level Topologies of Autonomous Systems",
      authors: "<b>Canbaz, M. A.</b>, Bakhshaliyev, K., & Gunes, M. H.",
      venue: "CompleNet 2018, Boston, USA",
      link: "https://link.springer.com/chapter/10.1007/978-3-319-73198-8_21" },
    { y: 2017, type: "conference", status: "published",
      title: "Analysis of Path Stability within Autonomous Systems",
      authors: "<b>Canbaz, M. A.</b>, Bakhshaliyev, K., & Gunes, M. H.",
      venue: "IEEE M&N 2017, Naples, Italy",
      link: "https://ieeexplore.ieee.org/document/8078364" },
    { y: 2017, type: "conference", status: "published",
      title: "Comparative Analysis of Internet Topology Datasets",
      authors: "<b>Canbaz, M. A.</b>, & Gunes, M. H.",
      venue: "IEEE GI 2017, Atlanta, USA",
      link: "https://ieeexplore.ieee.org/document/8116451" },
    { y: 2016, type: "conference", status: "published",
      title: "Efficient Network Topology Measurement Based on Ingress-to-Subnet Reachability",
      authors: "Coskun, I. E., <b>Canbaz, M. A.</b>, & Gunes, M. H.",
      venue: "IEEE WNM 2016, Dubai, UAE",
      link: "https://ieeexplore.ieee.org/document/7856142" },
    { y: 2016, type: "conference", status: "published",
      title: "Data-Driven Large-Scale Network-Layer Internet Simulation",
      authors: "<b>Canbaz, M. A.</b>",
      venue: "IEEE INFOCOM 2016, San Francisco, USA",
      link: "https://ieeexplore.ieee.org/document/7562257" },

    // ----- Accepted (forthcoming) -----
    { y: 2026, type: "conference", status: "accepted",
      title: "LegalGuardian: A Privacy-Preserving Framework for Secure Integration of LLMs in Legal Practice",
      authors: "Demir, M., & <b>Canbaz, M. A.</b>",
      venue: "11th Future Technologies Conference (FTC 2026), Berlin, Germany" },
    { y: 2026, type: "conference", status: "accepted",
      title: "When Citations Mislead? A Claim-Level Benchmark for Legal Hallucination Detection",
      authors: "Demir, M., & <b>Canbaz, M. A.</b>",
      venue: "20th International Conference on Artificial Intelligence and Law (ICAIL 2026), Singapore" },
    { y: 2026, type: "conference", status: "accepted",
      title: "AI in Complex Systems Lab @ COLIEE 2026: Hybrid NLP Methods for Legal Case Retrieval and Entailment",
      authors: "Demir, M. M., & <b>Canbaz, M. A.</b>",
      venue: "COLIEE 2026 @ ICAIL 2026, Singapore" },
    { y: 2026, type: "conference", status: "accepted",
      title: "Graph-Based Early Warning from Therapy Narratives: A System-of-Systems Copilot for Behavioral Health",
      authors: "Al Makinah, R., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Conference on Artificial Intelligence (CAI 2026), Granada, Spain" },

    // ----- Under review -----
    { y: 2026, type: "conference", status: "review",
      title: "Void-Aware RAG: A Topology-Driven Architecture for Safe and Grounded Generation",
      authors: "<b>Canbaz, M. A.</b>, & Hossain, M. N.",
      venue: "Intl. Conference on AI Models and Systems (iAIMS 2026), Barcelona, Spain" },
    { y: 2026, type: "conference", status: "review",
      title: "Reinforcement Learning-Driven Coordinated Cyber Deception for Satellite Edge Data Centers",
      authors: "Otal, H. T., Hossain, M. N., Alhussien, N. K., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Military Communications Conference (MILCOM 2026), San Diego, USA" },
    { y: 2026, type: "conference", status: "review",
      title: "DeceptiSwarm: Graph-Aware Multi-Agent Cyber Deception",
      authors: "Unlu, T., Otal, H. T., & <b>Canbaz, M. A.</b>",
      venue: "IEEE Military Communications Conference (MILCOM 2026), San Diego, USA" }
  ];

  var TYPE_LABEL = { journal: "Journal", conference: "Conference", chapter: "Book Chapter" };
  var STATUS_LABEL = { accepted: "Accepted", review: "Under Review" };

  function pubLinkSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  }

  function render(list) {
    var html = list.map(function (p) {
      var badges = '<span class="badge badge--' + p.type + '">' + TYPE_LABEL[p.type] + "</span>";
      if (p.status === "accepted") badges += '<span class="badge badge--status">Accepted</span>';
      if (p.status === "review") badges += '<span class="badge badge--review">Under Review</span>';
      var linkHtml = p.link
        ? '<a class="pub__link" target="_blank" rel="noopener" href="' + p.link + '">View ' + pubLinkSVG() + "</a>"
        : "";
      return (
        '<article class="pub">' +
          '<div class="pub__year">' + p.y + "</div>" +
          "<div>" +
            '<h3 class="pub__title">' + p.title + "</h3>" +
            '<p class="pub__authors">' + p.authors + "</p>" +
            '<p class="pub__venue">' + p.venue + "</p>" +
            '<div class="pub__meta">' + badges + linkHtml + "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
    listEl.innerHTML = html;
    emptyEl.style.display = list.length ? "none" : "block";
  }

  var listEl = document.getElementById("pub-list");
  var emptyEl = document.getElementById("pub-empty");

  if (listEl) {
    var sorted = PUBS.slice().sort(function (a, b) { return b.y - a.y; });
    var activeFilter = "all";
    var query = "";

    function apply() {
      var out = sorted.filter(function (p) {
        var okType = activeFilter === "all" || p.type === activeFilter;
        var okQ = !query ||
          (p.title + " " + p.authors + " " + p.venue).toLowerCase().indexOf(query) !== -1;
        return okType && okQ;
      });
      render(out);
    }

    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter");
        apply();
      });
    });

    var search = document.getElementById("pub-search");
    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim().toLowerCase();
        apply();
      });
    }

    apply();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
