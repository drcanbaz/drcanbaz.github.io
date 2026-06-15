# Updating the site content

**`data/profile.js` is the single source of truth.** Edit it (or have Claude
edit it) and both the classic site *and* the KaFa-1500 guide update — including
the stat counts, which are computed automatically.

## The easy way (no tools)
Drop your new `Resume.docx` in the repo root and ask Claude:
> "Update the site from my new resume."

Claude re-extracts the résumé into `data/profile.js`, shows you what changed,
and you commit. Nothing else to touch.

## Adding a new semester syllabus link
This is a one-line edit. In `data/profile.js`, find the course under `courses`
and add the new term to the **front** of its `semesters` list:

```js
{ code: "CINF 135", name: "Concepts of Artificial Intelligence", semesters: [
    { label: "Fall 2026", url: "https://github.com/mabdullahcanbaz/Teaching/blob/main/CINF135/FA_26" }, // ← new
    { label: "Spring 2026", url: "https://github.com/mabdullahcanbaz/Teaching/blob/main/CINF135/SP_26" },
    { label: "Fall 2025" },   // no url = shows as plain text (no live syllabus)
    ...
] }
```

- **With `url`** → the term becomes a clickable link to the live syllabus.
- **Without `url`** → it shows as a past offering (plain text).

That single change updates, automatically:
- the **classic site** → Teaching section (scroll to *Courses*, click the term),
- **KaFa-1500** → the *Classes & syllabi* chapter and any "what does he teach?" answer.

## What lives in `profile.js`
`publications`, `courses` (+ per-semester syllabus links), `funding`, `lab`,
`education`, `honors`, and auto-computed `stats` (paper count, total funding,
PhD count, federal grants).

## What is NOT in here (hand-written, intentionally)
KaFa's personality, the project-spotlight stories, and the interactive demos in
`js/story.js` are curated prose — they are not generated from the résumé.
