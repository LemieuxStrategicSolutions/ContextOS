// ===========================================================================
//  OS dashboard — home-screen widget (Scriptable)
//  Glanceable view of TASKS.md + Top 3, served by the Cloudflare Worker.
//
//  ONE-TIME SETUP:
//   1. Install "Scriptable" (free, App Store).
//   2. Scriptable → + → paste this whole file → name it (e.g. "My OS").
//   3. Fill in WORKER_URL, WIDGET_KEY, and TITLE below (from the deployed worker).
//   4. Long-press home screen → + → Scriptable → add a Medium or Large widget →
//      long-press it → Edit Widget → Script: the one you just named.
//   Tapping the widget opens the full board and forces a fresh pull.
//
//  iOS controls refresh timing (~every 15–60 min) — it is not a live ticker.
//  Tapping always refreshes on the spot.
// ===========================================================================

// ---- EDIT THESE THREE LINES -----------------------------------------------
const WORKER_URL = "https://your-widget-worker.your-subdomain.workers.dev/dashboard";
const WIDGET_KEY = "paste-the-WIDGET_KEY-you-set-with-wrangler";
const TITLE = "MY OS";
// ---------------------------------------------------------------------------

// Palette
const BG_TOP = new Color("#0b1220");
const BG_BOT = new Color("#131c2e");
const FG = new Color("#e8edf6");
const MUTE = new Color("#8b97ad");
const ACCENT = new Color("#5b9cff");
const FLAG = new Color("#ff6b6b");
const OK = new Color("#54d182");

let data;
try {
  data = await fetchDashboard();
} catch (e) {
  data = { _error: String(e && e.message || e) };
}

const family = config.widgetFamily || "medium";
const widget = createWidget(data, family);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Manual run / tap: preview at the size you're testing.
  if (family === "small") await widget.presentSmall();
  else if (family === "large") await widget.presentLarge();
  else await widget.presentMedium();
}
Script.complete();

// ---------------------------------------------------------------------------
async function fetchDashboard() {
  const req = new Request(`${WORKER_URL}?key=${encodeURIComponent(WIDGET_KEY)}&fresh=1`);
  req.timeoutInterval = 12;
  const res = await req.loadJSON();
  if (res && res.error) throw new Error(res.error);
  return res;
}

function createWidget(d, family) {
  const w = new ListWidget();
  const g = new LinearGradient();
  g.colors = [BG_TOP, BG_BOT];
  g.locations = [0, 1];
  w.backgroundGradient = g;
  w.setPadding(14, 15, 14, 15);
  // Re-pull on a sane cadence even if iOS is lazy.
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  if (d._error) {
    header(w, TITLE, "");
    const e = w.addText("⚠︎ " + d._error);
    e.textColor = FLAG;
    e.font = Font.systemFont(11);
    const h = w.addText("Check WORKER_URL / WIDGET_KEY in the script.");
    h.textColor = MUTE;
    h.font = Font.systemFont(10);
    return w;
  }

  header(w, TITLE, updatedLabel(d.generatedAt));
  w.addSpacer(6);

  // Tapping the widget opens the full Scrum board (Backlog / Sprint / Waiting / Done)
  // instead of just re-running this script.
  const boardUrl = WORKER_URL.replace(/\/dashboard\/?$/, "/board/view");
  w.url = `${boardUrl}?key=${encodeURIComponent(WIDGET_KEY)}`;

  if (family === "small") {
    smallBody(w, d);
  } else if (family === "large") {
    flaggedBlock(w, d, 5);
    w.addSpacer(8);
    domainsBlock(w, d);
    w.addSpacer(8);
    top3Block(w, d, 3);
  } else {
    flaggedBlock(w, d, 3);
    w.addSpacer(6);
    domainsBlock(w, d);
  }
  return w;
}

function header(w, title, right) {
  const row = w.addStack();
  row.centerAlignContent();
  const t = row.addText(title);
  t.textColor = ACCENT;
  t.font = Font.heavySystemFont(15);
  row.addSpacer();
  if (right) {
    const r = row.addText(right);
    r.textColor = MUTE;
    r.font = Font.systemFont(10);
  }
}

function smallBody(w, d) {
  const big = w.addText(String(d.flaggedCount));
  big.textColor = d.flaggedCount > 0 ? FLAG : OK;
  big.font = Font.heavySystemFont(40);
  const lbl = w.addText("flagged 🚨");
  lbl.textColor = MUTE;
  lbl.font = Font.systemFont(11);
  w.addSpacer(6);
  const open = w.addText(`${d.openTotal} open · ${d.doneTotal} done`);
  open.textColor = FG;
  open.font = Font.systemFont(11);
}

function flaggedBlock(w, d, limit) {
  const row = w.addStack();
  row.centerAlignContent();
  const dot = row.addText("🚨 ");
  dot.font = Font.systemFont(11);
  const label = row.addText(`Fires (${d.flaggedCount})`);
  label.textColor = FLAG;
  label.font = Font.semiboldSystemFont(12);
  row.addSpacer();
  const open = row.addText(`${d.openTotal} open`);
  open.textColor = MUTE;
  open.font = Font.systemFont(10);

  const items = (d.flagged || []).slice(0, limit);
  if (items.length === 0) {
    const none = w.addText("No fires. Clean board.");
    none.textColor = OK;
    none.font = Font.systemFont(11);
    return;
  }
  for (const it of items) {
    const line = w.addText(`• ${it.title}`);
    line.textColor = FG;
    line.font = Font.systemFont(11);
    line.lineLimit = 1;
    const dom = w.addText(`   ${it.domain}`);
    dom.textColor = MUTE;
    dom.font = Font.systemFont(9);
    dom.lineLimit = 1;
  }
}

function domainsBlock(w, d) {
  const sorted = (d.domains || []).slice().sort((a, b) => b.open - a.open).slice(0, 6);
  const grid = w.addStack();
  grid.layoutHorizontally();
  grid.spacing = 10;
  const col1 = grid.addStack();
  col1.layoutVertically();
  const col2 = grid.addStack();
  col2.layoutVertically();
  sorted.forEach((dm, i) => {
    const target = i % 2 === 0 ? col1 : col2;
    const s = target.addStack();
    const c = s.addText(String(dm.open));
    c.textColor = dm.open > 0 ? ACCENT : MUTE;
    c.font = Font.semiboldSystemFont(11);
    const n = s.addText(`  ${dm.name}`);
    n.textColor = MUTE;
    n.font = Font.systemFont(10);
    n.lineLimit = 1;
  });
}

function top3Block(w, d, limit) {
  const row = w.addStack();
  row.centerAlignContent();
  const head = row.addText("TOP 3");
  head.textColor = ACCENT;
  head.font = Font.semiboldSystemFont(11);
  // Age caveat: the Top 3 refreshes weekly and carries dated language, so a
  // stale block can show a dead "today". >7d means a Monday refresh was missed.
  const age = d.top3StaleDays;
  if (typeof age === "number") {
    row.addSpacer();
    const label = age === 0 ? "today" : `${age}d old`;
    const a = row.addText(age > 7 ? `⚠︎ ${label}` : label);
    a.textColor = age > 7 ? FLAG : MUTE;
    a.font = Font.systemFont(9);
  }
  (d.top3 || []).slice(0, limit).forEach((t, i) => {
    const line = w.addText(`${i + 1}. ${t}`);
    line.textColor = FG;
    line.font = Font.systemFont(10);
    line.lineLimit = 2;
  });
}

function updatedLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const df = new DateFormatter();
  df.dateFormat = "h:mm a";
  return "↻ " + df.string(d);
}
