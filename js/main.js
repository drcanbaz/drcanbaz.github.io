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
  // Publications come from the single source of truth: data/profile.js
  var PUBS = (window.PROFILE && window.PROFILE.publications) || [];

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

  /* ---------- Courses (with per-semester syllabus links) ---------- */
  var courseEl = document.getElementById("course-list");
  if (courseEl && window.PROFILE && window.PROFILE.courses) {
    courseEl.innerHTML = window.PROFILE.courses.map(function (c) {
      var terms = (c.semesters || []).map(function (s) {
        return s.url
          ? '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + " ↗</a>"
          : "<span>" + s.label + "</span>";
      });
      var sem = terms.length ? '<span class="course-terms">' + terms.join(' <i class="sep">·</i> ') + "</span>" : "";
      var note = c.note ? " <small>" + c.note + "</small>" : "";
      return '<li><span class="course-code">' + c.code + "</span>" +
             '<span class="course-name">' + c.name + note + sem + "</span></li>";
    }).join("");
  }

  /* ---------- Hero stats from PROFILE ---------- */
  if (window.PROFILE && window.PROFILE.stats) {
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      var v = window.PROFILE.stats[el.getAttribute("data-stat")];
      if (v != null) el.textContent = v;
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
