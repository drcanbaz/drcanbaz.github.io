/* =========================================================================
   Lightweight, privacy-conscious instrumentation for KaFa-1500.
   Works with ZERO setup (logs locally so you can inspect), and lights up
   real analytics / lead capture the moment you fill in the CONFIG below.

   ┌── HOW TO TURN IT ON ───────────────────────────────────────────────┐
   │ 1) AGGREGATE ANALYTICS (time, approx. location, pages, clicks):     │
   │    • Cloudflare Web Analytics (free, cookie-less, no banner needed) │
   │      → create a site at dash.cloudflare.com → Web Analytics,        │
   │        copy the token, paste into cloudflareToken below.            │
   │    • OR Plausible: set plausibleDomain to "drcanbaz.com".           │
   │                                                                     │
   │ 2) EMAIL OPT-IN (name + email a visitor chooses to leave):          │
   │    • Deploy a Google Apps Script web app bound to a Google Sheet,   │
   │      or create a Formspree form, then paste its URL into            │
   │      leadEndpoint below. Until then, opt-ins are stored locally so  │
   │      nothing is lost during setup.                                  │
   └─────────────────────────────────────────────────────────────────────┘
   Note: aggregate analytics are anonymous. The email step is OPT-IN and
   should only be used to reply to the visitor.
   ========================================================================= */
window.CANBAZ = window.CANBAZ || {};
(function () {
  "use strict";

  var CONFIG = {
    cloudflareToken: "",   // e.g. "abc123..."  → enables Cloudflare Web Analytics
    plausibleDomain: "",   // e.g. "drcanbaz.com" → enables Plausible (alternative)
    leadEndpoint: "",      // e.g. Apps Script "/exec" URL or Formspree endpoint
    debug: false           // true → console.log every event
  };
  window.CANBAZ.CONFIG = CONFIG;

  /* ---- load a cloud analytics provider if configured ---- */
  if (CONFIG.cloudflareToken) {
    var cf = document.createElement("script");
    cf.defer = true;
    cf.src = "https://static.cloudflareinsights.com/beacon.min.js";
    cf.setAttribute("data-cf-beacon", JSON.stringify({ token: CONFIG.cloudflareToken }));
    document.head.appendChild(cf);
  }
  if (CONFIG.plausibleDomain) {
    var pl = document.createElement("script");
    pl.defer = true;
    pl.setAttribute("data-domain", CONFIG.plausibleDomain);
    pl.src = "https://plausible.io/js/script.tagged-events.js";
    document.head.appendChild(pl);
  }

  /* ---- event API ---- */
  function track(event, props) {
    props = props || {};
    try { if (window.plausible) window.plausible(event, { props: props }); } catch (e) {}
    // local rolling log — works with zero setup; inspect via localStorage 'canbaz_events'
    try {
      var log = JSON.parse(localStorage.getItem("canbaz_events") || "[]");
      log.push({ event: event, props: props, t: new Date().toISOString() });
      if (log.length > 500) log = log.slice(-500);
      localStorage.setItem("canbaz_events", JSON.stringify(log));
    } catch (e) {}
    if (CONFIG.debug) console.log("[track]", event, props);
  }
  window.CANBAZ.track = track;

  /* ---- opt-in lead capture (name + email the visitor chooses to share) ---- */
  window.CANBAZ.submitLead = function (data) {
    data = Object.assign({ t: new Date().toISOString(), source: "kafa-1500" }, data || {});
    track("lead_optin", { has_email: !!data.email });
    if (CONFIG.leadEndpoint) {
      return fetch(CONFIG.leadEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).catch(function () {});
    }
    // no endpoint yet → keep locally so nothing is lost during setup
    try {
      var leads = JSON.parse(localStorage.getItem("canbaz_leads") || "[]");
      leads.push(data);
      localStorage.setItem("canbaz_leads", JSON.stringify(leads));
    } catch (e) {}
    return Promise.resolve();
  };

  track("pageview", { page: "kafa-1500" });
})();
