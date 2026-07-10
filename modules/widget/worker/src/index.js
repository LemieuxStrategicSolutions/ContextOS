/**
 * OS dashboard — Cloudflare Worker
 *
 * Serves a compact JSON summary of trackers/TASKS.md + the Top 3 from SOUL.md,
 * parsed live from your PRIVATE context repo. Designed to feed the Scriptable
 * iPhone widget (../scriptable/os-widget.js).
 *
 * Privacy: the repo is private. The GitHub token lives ONLY as a Worker secret —
 * never on the phone, never in this repo. The endpoint itself is gated by a shared
 * secret key (?key=...). No key, no data.
 *
 * Required secrets (set via `wrangler secret put`):
 *   GITHUB_TOKEN  — fine-grained PAT, read-only "Contents" on YOUR private repo only
 *   WIDGET_KEY    — long random string the widget sends as ?key=
 *
 * Required vars (wrangler.toml [vars]):
 *   GITHUB_REPO   — "your-github-user/your-context-repo"
 *   GITHUB_BRANCH — default "main"
 *   TASKS_PATH    — default "trackers/TASKS.md"
 *   SOUL_PATH     — default "SOUL.md"
 */

const DEFAULTS = {
  GITHUB_REPO: "your-github-user/your-context-repo", // override in wrangler.toml [vars]
  GITHUB_BRANCH: "main",
  TASKS_PATH: "trackers/TASKS.md",
  SOUL_PATH: "SOUL.md",
};

// Sections that are archival logs, not live work — kept out of the active counts.
const EXCLUDE_SECTION = /^(💤|Someday)/i;

// Sections that may hold 🔴/🚨 items but are NEVER fires: things in someone
// else's court (Waiting On), freshly-captured inbox to-dos, and standing context.
// Their tasks still count toward open totals — they just can't light the widget red.
const NO_FIRE_SECTION = /^(⏳|Waiting [Oo]n|📥|Operating Rhythms)/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return json({ ok: true, hint: "GET /dashboard?key=… or GET /board/view?key=…" }, 200);
    }
    if (url.pathname === "/board/view") {
      return new Response(boardPage(), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (url.pathname !== "/dashboard" && url.pathname !== "/board") {
      return json({ error: "not found" }, 404);
    }

    // --- auth gate -------------------------------------------------------
    const key = url.searchParams.get("key");
    if (!env.WIDGET_KEY || !key || !timingSafeEqual(key, env.WIDGET_KEY)) {
      return json({ error: "unauthorized" }, 401);
    }
    if (!env.GITHUB_TOKEN) {
      return json({ error: "worker not configured: missing GITHUB_TOKEN" }, 500);
    }

    const cfg = { ...DEFAULTS, ...pickVars(env) };

    // --- short edge cache so taps don't hammer GitHub --------------------
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    if (!url.searchParams.has("fresh")) {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    }

    try {
      const [tasksMd, soulMd] = await Promise.all([
        ghRaw(cfg.GITHUB_REPO, cfg.TASKS_PATH, cfg.GITHUB_BRANCH, env.GITHUB_TOKEN),
        ghRaw(cfg.GITHUB_REPO, cfg.SOUL_PATH, cfg.GITHUB_BRANCH, env.GITHUB_TOKEN),
      ]);

      const payload = url.pathname === "/board" ? buildBoard(tasksMd) : buildDashboard(tasksMd, soulMd);
      const res = json(payload, 200, { "Cache-Control": "public, max-age=300" });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    } catch (err) {
      return json({ error: "upstream", detail: String(err && err.message || err) }, 502);
    }
  },
};

// --------------------------------------------------------------------------
// GitHub
// --------------------------------------------------------------------------
async function ghRaw(repo, path, ref, token) {
  const api = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`;
  const r = await fetch(api, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw",
      "User-Agent": "os-widget-worker",
    },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} for ${path}`);
  return await r.text();
}

// --------------------------------------------------------------------------
// Parsing
// --------------------------------------------------------------------------
function buildDashboard(tasksMd, soulMd) {
  const sections = parseSections(tasksMd);

  const domains = [];
  const flagged = [];
  let openTotal = 0;
  let doneTotal = 0;

  for (const s of sections) {
    if (EXCLUDE_SECTION.test(s.title)) continue;
    const open = s.tasks.filter((t) => !t.done);
    const done = s.tasks.filter((t) => t.done);
    if (open.length === 0 && done.length === 0) continue;

    openTotal += open.length;
    doneTotal += done.length;
    domains.push({ name: shortDomain(s.title), open: open.length, done: done.length });

    if (!NO_FIRE_SECTION.test(s.title)) {
      for (const t of open) {
        if (t.urgent) flagged.push({ title: t.title, domain: shortDomain(s.title) });
      }
    }
  }

  const top3RefreshedAt = parseTop3RefreshedAt(soulMd);

  return {
    generatedAt: new Date().toISOString(),
    openTotal,
    doneTotal,
    flaggedCount: flagged.length,
    flagged: flagged.slice(0, 8),
    domains,
    top3: parseTop3(soulMd),
    top3RefreshedAt,
    top3StaleDays: staleDays(top3RefreshedAt),
  };
}

// Days since the Top 3 block was last refreshed, so the widget can flag a
// stale "Last refreshed" date. The Top 3 carries absolute "today"-style
// deadlines that go dead between the weekly Monday refreshes; surfacing the
// age stops a week-old priority from reading as a live instruction.
// Returns null if no date is found.
function staleDays(isoDate) {
  if (!isoDate) return null;
  const then = Date.parse(isoDate + "T00:00:00Z");
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86400000);
  return days < 0 ? 0 : days;
}

// Pull the "Last refreshed: YYYY-MM-DD" date from the Top 3 Priorities block.
function parseTop3RefreshedAt(md) {
  const lines = md.split(/\r?\n/);
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+Top 3 Priorities/i.test(line)) { inSection = true; continue; }
    if (inSection && /^##\s+/.test(line)) break;
    if (!inSection) continue;
    const m = line.match(/Last refreshed:\s*(\d{4}-\d{2}-\d{2})/i);
    if (m) return m[1];
  }
  return null;
}

// Split markdown into H2 sections with their checkbox tasks.
function parseSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let cur = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      cur = { title: h2[1].trim(), tasks: [] };
      sections.push(cur);
      continue;
    }
    if (!cur) continue;

    const task = line.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/);
    if (task) {
      const done = task[1].toLowerCase() === "x";
      const body = task[2];
      // A fire requires the 🔴/🚨 to be a LEADING marker — in the task's
      // headline (its bold title, or the text before the first em-dash) — not
      // buried in mid-body status prose like "6/3: ❌ FAILED 🔴". Items whose
      // headline reads as a wait (⏳ / "waiting on/for") are never fires.
      const head = headline(body);
      const waiting = /(⏳|waiting on|waiting for)/i.test(head);
      cur.tasks.push({
        done,
        urgent: !done && /(🚨|🔴)/.test(head) && !waiting,
        title: taskTitle(body),
      });
    }
  }
  return sections;
}

// The task's headline, markers intact — its bold title if present, else the
// text before the first em-dash. Used to decide whether a 🔴/🚨 is a leading
// fire marker vs. an emoji buried in a mid-body status note.
function headline(body) {
  const bold = body.match(/\*\*(.+?)\*\*/);
  return bold ? bold[1] : body.split(" — ")[0];
}

// Pull a clean, short title from a task line.
function taskTitle(body) {
  let t = body;
  const bold = body.match(/\*\*(.+?)\*\*/);
  if (bold) t = bold[1];
  else t = body.split(" — ")[0].split(" - ")[0];
  // strip markdown, then any leading status emoji/markers, and tidy
  t = t.replace(/[~`*]/g, "").replace(/\s+/g, " ").trim();
  t = t.replace(/^(?:[🚨🔴🟢🔵🟡⚠️✅❗️▶️]️?\s*)+/u, "").trim();
  if (t.length > 90) t = t.slice(0, 89) + "…";
  return t;
}

// Shorten a section title into a widget-sized domain label.
// "Work — Pillar 1: Big Initiative …" -> "P1: Big Initiative"
function shortDomain(title) {
  const m = title.match(/Pillar\s+(\d+):\s*(.+)/i);
  if (m) return `P${m[1]}: ${trimWords(m[2], 3)}`;
  return trimWords(title, 4);
}

function trimWords(s, n) {
  const parts = s.split(/[\s/—-]+/).filter(Boolean);
  const kept = parts.length <= n ? parts : parts.slice(0, n);
  // drop dangling tokens so labels don't end on a connector ("&" / "+") or a
  // parenthetical that got cut off mid-word ("(Wheel")
  while (kept.length) {
    const last = kept[kept.length - 1];
    if (/^[&+(/-]+$/.test(last) || (last.includes("(") && !last.includes(")"))) {
      kept.pop();
    } else break;
  }
  return kept.join(" ");
}

// Pull the bold headline of each numbered item under "## Top 3 Priorities".
function parseTop3(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+Top 3 Priorities/i.test(line)) { inSection = true; continue; }
    if (inSection && /^##\s+/.test(line)) break;
    if (!inSection) continue;
    const num = line.match(/^\s*\d+\.\s+(.*)$/);
    if (num) {
      const bold = num[1].match(/\*\*(.+?)\*\*/);
      let t = (bold ? bold[1] : num[1]).replace(/[*`]/g, "").trim();
      if (t.length > 120) t = t.slice(0, 119) + "…";
      out.push(t);
    }
  }
  return out.slice(0, 3);
}

// --------------------------------------------------------------------------
// Scrum board — Backlog / This Sprint / Waiting / Done
// Mirrors the GTD×Scrum model in TASKS.md: the Sprint section's "### Committed"
// + the agent's own-sprint H3 are the sprint lane; "## Waiting On" is never
// pullable; the backlog is any OTHER open task carrying a Fibonacci effort
// score (unscored items aren't board-ready yet — the agent scores them
// opportunistically). A backlog item may also carry a value score (`[EvV]`) —
// when present, WSJF = value ÷ effort and the board ranks by that, highest
// first; effort-only items (no value yet) sort after, unranked.
// --------------------------------------------------------------------------
const SPRINT_SECTION = /^🏃\s*SPRINT/i;
const WAITING_SECTION = /^(⏳\s*)?Waiting [Oo]n/i;
const BACKLOG_LIMIT = 40;

function buildBoard(tasksMd) {
  const lines = tasksMd.split(/\r?\n/);
  let mode = "none"; // none | sprint-committed | sprint-agent | waiting | domain | excluded
  let domainTitle = null;
  let sprintLabel = null;

  const committed = [];
  const agent = [];
  const waiting = [];
  const backlog = [];

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      const title = h2[1].trim();
      if (SPRINT_SECTION.test(title)) {
        mode = "sprint-committed"; // default lane until an H3 says otherwise
        sprintLabel = title.replace(/^🏃\s*SPRINT\s*—?\s*/i, "");
      } else if (WAITING_SECTION.test(title)) {
        mode = "waiting";
      } else if (EXCLUDE_SECTION.test(title)) {
        mode = "excluded";
      } else {
        mode = "domain";
        domainTitle = title;
      }
      continue;
    }
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3 && (mode === "sprint-committed" || mode === "sprint-agent")) {
      // The agent's own lane: any H3 like "<Name>'s sprint" / "<Name>'s own tasks".
      mode = /'s\s+(sprint|own tasks)/i.test(h3[1]) ? "sprint-agent" : "sprint-committed";
      continue;
    }
    if (mode === "excluded" || mode === "none") continue;

    const task = line.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/);
    if (!task) continue;
    const done = task[1].toLowerCase() === "x";
    const body = task[2];
    const score = extractScore(body);
    const title = boardTaskTitle(body);

    if (mode === "sprint-committed") {
      committed.push({ done, score: score ? score.effort : null, title });
    } else if (mode === "sprint-agent") {
      agent.push({ done, score: score ? score.effort : null, title });
    } else if (mode === "waiting") {
      if (!done) waiting.push({ title });
    } else if (mode === "domain") {
      if (!done && score) backlog.push({ title, domain: shortDomain(domainTitle), ...score });
    }
  }

  // Rank by WSJF (value ÷ effort) descending; effort-only items (no value yet) sort
  // after every ranked item, in document order, so newly-touched scores surface fast.
  backlog.sort((a, b) => {
    const aw = a.value != null ? a.value / a.effort : -1;
    const bw = b.value != null ? b.value / b.effort : -1;
    return bw - aw;
  });

  const backlogShown = backlog.slice(0, BACKLOG_LIMIT);

  return {
    generatedAt: new Date().toISOString(),
    sprintLabel,
    committed,
    agent,
    waiting,
    backlog: backlogShown,
    backlogTotal: backlog.length,
    backlogTruncated: backlog.length > BACKLOG_LIMIT,
  };
}

// Leading score marker: "**[3]**" (effort only, sprint-committed items) or
// "**[1v8]**" (effort 1, value 8 — backlog WSJF), optionally struck through
// when done: "~~**[3] Title**~~". Returns null if no marker, else { effort, value }
// where value is null when not yet scored.
function extractScore(body) {
  const m = body.match(/^~*\**\[(\d{1,2})(?:v(\d{1,2}))?\]/);
  if (!m) return null;
  return { effort: Number(m[1]), value: m[2] != null ? Number(m[2]) : null };
}

// Board titles strip the leading "[N]"/"[NvM]" score marker that taskTitle() leaves in place.
function boardTaskTitle(body) {
  return taskTitle(body).replace(/^\[\d+(?:v\d+)?\]\s*/, "").trim();
}

function boardPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Board</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    background: linear-gradient(180deg, #0b1220, #131c2e);
    color: #e8edf6; min-height: 100vh;
  }
  header { position: sticky; top: 0; padding: 14px 16px 10px; backdrop-filter: blur(8px);
    background: rgba(11,18,32,0.85); border-bottom: 1px solid rgba(255,255,255,0.06); z-index: 5; }
  header h1 { margin: 0; font-size: 17px; color: #5b9cff; font-weight: 800; }
  header .sub { margin-top: 2px; font-size: 11px; color: #8b97ad; }
  .cols { display: flex; gap: 10px; overflow-x: auto; padding: 12px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .col { flex: 0 0 86vw; max-width: 360px; scroll-snap-align: start; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 12px; min-height: 60vh; }
  .col h2 { margin: 0 0 4px; font-size: 13px; letter-spacing: .02em; text-transform: uppercase; color: #8b97ad;
    display: flex; justify-content: space-between; align-items: center; }
  .col h2 .count { color: #5b9cff; font-weight: 700; }
  .bar { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08); margin: 6px 0 4px; overflow: hidden; }
  .bar > i { display: block; height: 100%; background: #54d182; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
    padding: 9px 10px; margin-bottom: 8px; font-size: 13px; line-height: 1.35; }
  .card.done { opacity: .55; text-decoration: line-through; }
  .meta { display: flex; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
  .tag { font-size: 10px; padding: 1px 6px; border-radius: 20px; background: rgba(91,156,255,0.15); color: #5b9cff; }
  .tag.agent { background: rgba(255,255,255,0.08); color: #8b97ad; }
  .tag.score { background: rgba(84,209,130,0.15); color: #54d182; }
  .empty { color: #8b97ad; font-size: 12px; padding: 20px 4px; }
  .err { color: #ff6b6b; padding: 20px 16px; font-size: 13px; }
  .note { font-size: 11px; color: #8b97ad; margin: 6px 0; }
</style>
</head>
<body>
<header>
  <h1>Board</h1>
  <div class="sub" id="sub">loading…</div>
</header>
<div class="cols" id="cols"></div>
<script>
(function () {
  var params = new URLSearchParams(location.search);
  var key = params.get("key") || "";
  var url = location.pathname.replace(/\\/view$/, "") + "?key=" + encodeURIComponent(key) + "&fresh=1";

  fetch(url).then(function (r) { return r.json(); }).then(render).catch(function (e) {
    document.getElementById("cols").innerHTML = '<div class="err">⚠︎ ' + esc(String(e)) + "</div>";
  });

  function render(d) {
    if (d.error) {
      document.getElementById("cols").innerHTML = '<div class="err">⚠︎ ' + esc(d.error) + "</div>";
      return;
    }
    document.getElementById("sub").textContent =
      "Sprint: " + (d.sprintLabel || "—") + " · ↻ " +
      new Date(d.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    var openCommitted = d.committed.filter(function (t) { return !t.done; });
    var doneCommitted = d.committed.filter(function (t) { return t.done; });
    var openAgent = d.agent.filter(function (t) { return !t.done; });
    var doneAgent = d.agent.filter(function (t) { return t.done; });

    var donePts = sumPts(doneCommitted);
    var totalPts = donePts + sumPts(openCommitted);
    var pct = totalPts ? Math.round((100 * donePts) / totalPts) : 0;

    var cols = document.getElementById("cols");
    cols.innerHTML = "";
    cols.appendChild(column("Backlog", d.backlogTotal, backlogCards(d)));
    cols.appendChild(column("This Sprint", openCommitted.length + openAgent.length,
      sprintCards(openCommitted, openAgent), progressNote(pct, donePts, totalPts)));
    cols.appendChild(column("Waiting", d.waiting.length, listCards(d.waiting)));
    cols.appendChild(column("Done", doneCommitted.length + doneAgent.length, doneCards(doneCommitted, doneAgent)));
  }

  function sumPts(arr) { return arr.reduce(function (a, t) { return a + (t.score || 0); }, 0); }

  function progressNote(pct, done, total) {
    if (!total) return "";
    return '<div class="bar"><i style="width:' + pct + '%"></i></div><div class="note">' + done + " / " + total + " pts done</div>";
  }

  function column(title, count, cardsHtml, extraHtml) {
    var el = document.createElement("div");
    el.className = "col";
    el.innerHTML = "<h2>" + esc(title) + '<span class="count">' + count + "</span></h2>" + (extraHtml || "") + cardsHtml;
    return el;
  }

  function card(title, tagsHtml, done) {
    return '<div class="card' + (done ? " done" : "") + '">' + esc(title) +
      (tagsHtml ? '<div class="meta">' + tagsHtml + "</div>" : "") + "</div>";
  }

  function sprintCards(committed, agent) {
    var html = committed.map(function (t) {
      return card(t.title, t.score ? '<span class="tag score">' + t.score + " pt</span>" : "");
    }).join("");
    if (agent.length) {
      html += '<div class="note">🤖 Agent\\'s sprint</div>';
      html += agent.map(function (t) {
        return card(t.title, '<span class="tag agent">agent</span>' + (t.score ? '<span class="tag score">' + t.score + " pt</span>" : ""));
      }).join("");
    }
    if (!committed.length && !agent.length) html = '<div class="empty">Sprint clear.</div>';
    return html;
  }

  function doneCards(committed, agent) {
    var all = committed.concat(agent);
    if (!all.length) return '<div class="empty">Nothing closed yet this sprint.</div>';
    return all.map(function (t) {
      return card(t.title, t.score ? '<span class="tag score">' + t.score + " pt</span>" : "", true);
    }).join("");
  }

  function listCards(arr) {
    if (!arr.length) return '<div class="empty">Nothing waiting.</div>';
    return arr.map(function (t) { return card(t.title); }).join("");
  }

  function backlogCards(d) {
    if (!d.backlog.length) {
      return '<div class="empty">No scored backlog yet — the agent scores items opportunistically as sections are touched.</div>';
    }
    var html = d.backlog.map(function (t) {
      var tags = '<span class="tag">' + esc(t.domain) + "</span>";
      if (t.value != null) {
        var wsjf = t.value / t.effort;
        tags += '<span class="tag score">wsjf ' + (Math.round(wsjf * 10) / 10) + '</span><span class="tag">e' + t.effort + " · v" + t.value + "</span>";
      } else {
        tags += '<span class="tag">e' + t.effort + '</span><span class="tag agent">not valued</span>';
      }
      return card(t.title, tags);
    }).join("");
    if (d.backlogTruncated) html += '<div class="note">+' + (d.backlogTotal - d.backlog.length) + " more scored items not shown</div>";
    return html;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
</script>
</body>
</html>`;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function pickVars(env) {
  const out = {};
  for (const k of ["GITHUB_REPO", "GITHUB_BRANCH", "TASKS_PATH", "SOUL_PATH"]) {
    if (env[k]) out[k] = env[k];
  }
  return out;
}

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
  });
}

// Constant-time-ish string compare to avoid leaking the key via timing.
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
