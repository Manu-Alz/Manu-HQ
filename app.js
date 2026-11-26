/* =========================================================
   MANU HQ — hub personal
   Los datos se guardan en este navegador (localStorage), así
   que sobreviven a recargas. Exportar/Importar para pasarlos
   a otro dispositivo.
   ========================================================= */

const PLAYLIST = "spotify:playlist:1sBTc7WolPCShgS43THVEC";
const PLAN73 = "https://manu-alz.github.io/Plan-73/";
const STORE_KEY = "manuhq-v1";

/* ---------- Helpers base ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => iso(new Date());
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("es-UY", { day: "numeric", month: "short" }) : "";
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin storage */ } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) { /* sin storage */ } };
function weekDates(off = 0) {      // lunes → domingo; off = semanas hacia atrás (0 = esta semana, -1 = la pasada…)
  const d = new Date(); const dif = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dif + off * 7);
  return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return iso(x); });
}
function toast(msg, undo) {
  const t = $("#toast"), pop = $("#pop"), host = pop && pop.open ? pop : document.body;   // si hay un popup abierto, el aviso va adentro para que se vea
  if (t.parentNode !== host) host.appendChild(t);
  t.textContent = msg;
  if (undo) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "toast-act"; b.textContent = "Deshacer";
    b.addEventListener("click", () => { undo(); t.classList.remove("show", "has-act"); clearTimeout(toast.t); });
    t.append(b);
  }
  t.classList.toggle("has-act", !!undo); t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), undo ? 6500 : 2200);
}

/* ---------- Áreas ---------- */
const LABELS = {
  general: "General", gym: "Gym", judo: "Judo", fisico: "Físico", estiramientos: "Estiramientos",
  surf: "Surf", uruguay: "Uruguay", estudio: "Estudio", proyectos: "Proyectos",
};
const TASK_AREAS = ["general", "gym", "judo", "fisico", "surf", "uruguay", "estudio", "proyectos"];
const CONTENT_STAGES = ["Idea", "Grabar", "Editar", "Publicado"];
const CONTENT_CATS = ["judo", "fisico", "estiramientos", "surf", "uruguay"];
const CONTENT_SUGGEST = ["creativo", "storytelling", "humor", "tutorial", "vlog", "entrenamiento", "motivación", "edición", "técnica", "antes y después", "proyectos", "tecnología", "eventos", "viajes", "comida", "música"];
const TAG_HUES = [210, 265, 330, 150, 35, 185, 95, 10];
function tag(a) {
  if (LABELS[a]) return `<span class="tag ${esc(a)}">${esc(LABELS[a])}</span>`;
  let h = 0; for (const ch of String(a)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = TAG_HUES[h % TAG_HUES.length];
  return `<span class="tag" style="color:hsl(${hue} 85% 76%);background:hsl(${hue} 70% 60% / .13)">${esc(a)}</span>`;
}
let contF = "todas";
const cleanTag = (s) => { const t = (s || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 24); return Object.keys(LABELS).find((k) => k === t || LABELS[k].toLowerCase() === t) || t || "general"; };


const ICONS = {
  inicio: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  rutina: "M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12",
  judo: "M3 9h18v4H3zM10 13l-2.5 8M14 13l2.5 8M12 3v6",
  fisico: "M3 3v18h18M7 15l4-4 3 3 5-6",
  surf: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  solin: "M23 7l-7 5 7 5zM3 5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  repos: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.3 2.5 5.1 2.9 5.1 2.9a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.5 10.4c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-1 2.6V22",
  stats: "M4 20V11M10 20V4M16 20v-8M22 20H2",
  lectura: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
  media: "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  pinterest: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zM12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  diario: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  calendario: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  comida: "M7 2v7a2 2 0 0 0 4 0V2M9 9v13M17 22V2c-2.5 1.5-4 4-4 8v4h4",
  habitos: "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3",
  estudio: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  proyectos: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  contenido: "M3 6h13v12H3zM16 10l5-3v10l-5-3",
  idiomas: "M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6",
  compras: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  watch: "M2 4h20v13H2zM8 21h8M12 17v4M10 8l5 2.5-5 2.5z",
  ideas: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
};
const NAV = [
  { group: null, items: [["inicio", "Inicio"], ["stats", "Estadísticas"]] },
  { group: "Cuerpo", items: [["rutina", "Gym"], ["judo", "Judo"], ["surf", "Surf"], ["comida", "Comida"], ["fisico", "Cambio físico"]] },
  { group: "Día a día", items: [["calendario", "Calendario"], ["habitos", "Hábitos"], ["compras", "Compras"], ["diario", "Diario"]] },
  { group: "Aprender", items: [["estudio", "Estudio"], ["idiomas", "Idiomas"], ["lectura", "Lectura"]] },
  { group: "Crear", items: [["contenido", "Contenido"], ["proyectos", "Proyectos"], ["repos", "Repos"], ["ideas", "Ideas"]] },
  { group: "Guardados", items: [["pinterest", "Pinterest"], ["media", "Fotos"], ["watch", "Para ver"]] },
];

/* ---------- Estado ---------- */
const DEFAULT_STATE = {
  tasks: [
    { id: uid(), text: "Grabar primer video de judo", area: "judo", done: false },
    { id: uid(), text: "Foto de progreso inicial (frente/lado/espalda)", area: "fisico", done: false },
  ],
  logs: { gym: [] },          // días marcados como hechos en Inicio
  weights: [],
  goals: { weight: 73, walking: 75.5 },
  projects: [
    { id: uid(), name: "eventospde.com", status: "Activo", desc: "Mi empresa de eventos. Web, clientes y crecimiento.", url: "https://eventospde.com", repo: "https://github.com/Manu-Alz/eventos-pde", tasks: [{ id: uid(), text: "Definir próximas mejoras de la web", done: false }] },
    { id: uid(), name: "Plan-73", status: "Activo", desc: "Mi rutina de fuerza y potencia para judo (−73 kg).", url: PLAN73, repo: "https://github.com/Manu-Alz/Plan-73", tasks: [] },
    { id: uid(), name: "Manu HQ", status: "Activo", desc: "Este hub.", url: "https://manu-alz.github.io/Manu-HQ/", repo: "https://github.com/Manu-Alz/Manu-HQ", tasks: [] },
  ],
  content: [
    { id: uid(), title: "Mi rutina semanal explicada", cat: "fisico", stage: 0 },
    { id: uid(), title: "Rutina de estiramientos post-judo", cat: "estiramientos", stage: 0 },
  ],
  ideas: [],
  study: [],
  waza: {},
  spots: [{ id: uid(), text: "La Paloma", done: false }, { id: uid(), text: "Punta del Diablo", done: false }, { id: uid(), text: "Playa Brava", done: false }],
  habits: {},                // { "2026-11-17": ["agua", "sueno"] }: lo que cumplí cada día
  notes: {},
  langs: [],
  buy: [],
  watch: [],
  music: [{ id: "m-default", uri: PLAYLIST, kind: "playlist", name: "Lost Men", img: "", folder: "", date: "" }],
  sc: [],                      // lista de SoundCloud: { id, url, name, img, date }
  journal: [],                 // diario: { id, text, date, time? }
  pins: [],                    // Pinterest: { id, url, kind: "pin" | "board" | "user", tag, date }
  media: [],                   // fotos: solo la ficha { id, tag, date, w, h, kb }; la foto está en IndexedDB y en un gist aparte
  mediaGist: "",               // id del gist donde se guardan las fotos
  books: [],                   // lectura: { id, title, author, pages, page, status: "want" | "reading" | "done", rating, notes, cover, added, started, finished }
  readDays: [],                // días en que leí (para la racha)
  channels: [{ id: "solin", name: "Solinvitto" }],   // proyectos de video dentro de Contenido (cada video tiene ch = id del proyecto; sin ch = solin)
  solin: [],                   // Solinvitto: { id, title, plat, stage 0-4, hook, script, link, date, notes }
  repoHide: ["Pagina-de-Marcos"],   // repos de GitHub que no quiero ver (por nombre)
  readGoal: 12,                // meta de libros del año
};

/* ---------- Niveles de idiomas ---------- */
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Nativo"];   // escala europea (MCER)
const JLPT = ["N5", "N4", "N3", "N2", "N1", "Nativo"];                // japonés: del N5 (básico) al N1 (avanzado)
const TO_JLPT = { A1: "N5", A2: "N4", B1: "N3", B2: "N2", C1: "N1", C2: "N1" };
const levelsOf = (l) => /jap[oó]n|japan|nihon|日本/i.test(l.name) ? JLPT : LEVELS;
/* Deja el nivel y la meta dentro de la escala que usa ese idioma */
function fixLang(l) {
  const sc = levelsOf(l);
  if (!sc.includes(l.level)) l.level = TO_JLPT[l.level] && sc === JLPT ? TO_JLPT[l.level] : sc[0];
  if (!sc.includes(l.goal)) l.goal = TO_JLPT[l.goal] && sc === JLPT ? TO_JLPT[l.goal] : sc[sc.length - 3];
  return l;
}

/* Completa datos viejos o importados con lo que falte */
function normalize(data) {
  const s = { ...structuredClone(DEFAULT_STATE), ...data };
  s.logs = { ...DEFAULT_STATE.logs, ...s.logs };
  for (const k of ["waza", "notes", "habits"]) s[k] = s[k] || {};
  for (const k of ["tasks", "weights", "projects", "content", "ideas", "study", "spots", "langs", "buy", "watch", "music", "sc", "journal", "pins", "media", "books", "readDays", "solin", "repoHide", "channels"]) s[k] = Array.isArray(s[k]) ? s[k] : [];
  // Las notas libres viejas de Uruguay pasan a la lista de notas (una sola vez)
  if (s.uyNotes) { (s.notes.uruguay = s.notes.uruguay || []).unshift({ id: uid(), text: s.uyNotes, date: today() }); }
  // "Estilo de vida" se reemplazó por Hábitos: sus lugares y notas pasan a Ideas, una sola vez.
  // El id fijo evita duplicados si dos dispositivos lo migran por separado.
  const keep = (o) => { if (!s.ideas.some((i) => i.id === "mig-" + o.id)) s.ideas.push({ id: "mig-" + o.id, text: o.text, tag: "uruguay", date: o.date || today() }); };
  if (Array.isArray(s.places)) s.places.forEach(keep);
  if (Array.isArray(s.notes.uruguay)) s.notes.uruguay.forEach(keep);
  delete s.places; delete s.notes.uruguay;
  s.langs.forEach(fixLang);
  delete s.uyNotes; delete s.planStart;
  return s;
}
let S = load();
function load() {
  try {
    const raw = lsGet(STORE_KEY);
    if (raw) { const s = normalize(JSON.parse(raw)); lsSet(STORE_KEY, JSON.stringify(s)); return s; }
  } catch (e) { /* datos corruptos: arranco limpio */ }
  return structuredClone(DEFAULT_STATE);
}
lsDel("manuhq-plan73"); lsDel("manuhq-plan73v2");   // caché vieja del lector de Plan-73
function save() { S.updatedAt = Date.now(); lsSet(STORE_KEY, JSON.stringify(S)); schedulePush(); }
function commit() { save(); render(); }

/* =========================================================
   Plan-73 (se lee en vivo de tu página)
   ========================================================= */
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
/* Hasta que llega Plan-73 (primera vez, sin caché) no se inventa nada */
let ROUTINE = DAY_NAMES.map((name, day) => ({ day, name, letter: "·", title: "Cargando Plan-73…", sub: "", tag: "gym", items: [] }));
let PLAN = null;
let planStatus = "offline";
let planWarn = [];            // partes de Plan-73 que no se pudieron leer (si cambió su formato)
let viewBlock = null;      // bloque que estás mirando en Rutina (por defecto, el actual de Plan-73)

/* Bloque actual = el último que abriste en Plan-73 (misma web, mismo almacenamiento) */
function currentBlock() {
  if (!PLAN) return null;
  const id = lsGet("bloque") || "b1";
  return PLAN.blocks.find((b) => b.id === id) || PLAN.blocks[0];
}
function shownBlock() {
  if (!PLAN) return null;
  return PLAN.blocks.find((b) => b.id === viewBlock) || currentBlock();
}
function blockLabel(b = currentBlock()) { return b ? `${b.name} · ${b.title}` : ""; }

/* Copia segura de HTML de Plan-73: solo texto, negritas, listas y tablas */
const KEEP = { P: "p", B: "b", STRONG: "b", BR: "br", UL: "ul", OL: "ol", LI: "li", TABLE: "table", THEAD: "thead", TBODY: "tbody", TR: "tr", TH: "th", TD: "td", H3: "h4", H4: "h4", EM: "em", I: "em" };
function clean(node) {
  return [...node.childNodes].map((n) => {
    if (n.nodeType === 3) return esc(n.textContent);
    if (n.nodeType !== 1) return "";
    const t = KEEP[n.nodeName];
    if (t === "br") return "<br>";
    const inner = clean(n);
    if (!t) return inner;
    const cls = n.nodeName === "TD" && n.classList.contains("num") ? ' class="num"' : n.nodeName === "P" && n.classList.contains("lead") ? ' class="lead"' : "";
    return `<${t}${cls}>${inner}</${t}>`;
  }).join("");
}
const cellLines = (td) => clean(td).split(/<br>/).map((s) => s.replace(/<[^>]+>/g, "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim()).filter(Boolean);
const rowsOf = (table) => table ? [...table.querySelectorAll("tbody tr")].map((tr) => [...tr.children].map(cellLines)) : [];
/* Primera tabla que aparece después de un título h3 */
function tableAfter(root, re) {
  const h = [...root.querySelectorAll("h3")].find((x) => re.test(x.textContent));
  for (let n = h?.nextElementSibling; n && n.nodeName !== "H3"; n = n.nextElementSibling) {
    const t = n.nodeName === "TABLE" ? n : n.querySelector("table");
    if (t) return t;
  }
  return null;
}
/* Todo lo que hay debajo de un título h3, hasta el próximo título */
function sectionAfter(root, re) {
  const h = root && [...root.querySelectorAll("h3")].find((x) => re.test(x.textContent.trim()));
  if (!h) return null;
  let html = "", table = null;
  for (let n = h.nextElementSibling; n && n.nodeName !== "H3" && !n.querySelector("h3"); n = n.nextElementSibling) {
    table = table || (n.nodeName === "TABLE" ? n : n.querySelector("table"));
    html += clean({ childNodes: [n] });
  }
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
  return { title: h.textContent.trim(), html, rows: rowsOf(table) };
}
const DAY_RE = { Lun: "lunes", Mar: "martes", "Mié": "mi[ée]rcoles", Jue: "jueves", Vie: "viernes", "Sáb": "s[áa]bado", Dom: "domingo" };
/* Metas: salen de los números de arriba de Plan-73 (si no cargó, las últimas conocidas) */
function goals() {
  const st = PLAN?.stats || [];
  const f = (re) => st.find((s) => re.test(s.l));
  const nums = (t) => (t || "").replace(/,/g, ".").match(/\d+(\.\d+)?/g)?.map(Number) || [];
  const avg = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : null;
  const walk = f(/caminando/i), comp = f(/competencia|categor/i), now = f(/hoy/i), rate = f(/semana/i);
  return {
    walking: avg(nums(walk?.v)) ?? S.goals.walking, walkingTxt: walk?.v || `${S.goals.walking} kg`,
    weight: nums(comp?.v)[0] ?? S.goals.weight,
    now: nums(now?.v)[0] ?? null, nowTxt: now ? `${now.v} · ${now.l}` : "",
    rate: rate?.v || "0,25–0,4", rateTxt: rate ? `${rate.v} ${rate.l}` : "0,25–0,4 kg por semana",
  };
}
const KIND = { key: "principal", rfd: "RFD", plio: "pliometría", iso: "isometría", prev: "prevención" };
const kindTag = (i) => i.kind && KIND[i.kind] ? ` <span class="xk ${i.kind}">${KIND[i.kind]}</span>` : "";
/* Estiramientos que tocan después de una sesión (según "Cuándo hacer cada cosa") */
function stretchFor(letter) {
  const st = PLAN?.stretch;
  if (!st) return [];
  const row = st.when.find((r) => new RegExp(`\\b${letter}\\b`).test((r[0] || []).join(" ")));
  if (!row) return [];
  const want = (row[1] || []).join(" ").toLowerCase().split(/,|\sy\s/).map((s) => s.trim().split(" ")[0].slice(0, 6)).filter(Boolean);
  return st.zones.filter((z) => want.some((w) => (z[0] || []).join(" ").toLowerCase().includes(w)));
}

function buildRoutine() { const r = routineFor(currentBlock()); if (r) ROUTINE = r; }
function routineFor(b) {
  if (!PLAN || !b || PLAN.week.length !== 7) return null;
  return PLAN.week.map((w, i) => {
    const day = (i + 1) % 7;
    const L = w.s;
    let items, tg;
    if (b.s[L]) {
      items = b.s[L].map((e) => ({ n: e[0], rx: e[1], note: e[2], key: e[3] === 1, kind: e[3] === 1 ? "key" : typeof e[3] === "string" ? e[3] : "" }));
      tg = /judo/i.test(w.t) ? "judo" : "gym";
    } else if (!w.off) {
      // Día atlético: una fila por parte (qué, dosis, pausa)
      const rows = PLAN.sprints?.days?.[w.d]?.rows || [];
      items = rows.map((r) => ({ n: (r[0] || []).join(" ").replace(/^\d+\s*·\s*/, ""), rx: (r[2] || [])[0] || "", note: /\d/.test((r[3] || []).join("")) ? `pausa ${r[3].join(" ")}` : "" }));
      if (!items.length) items = [{ n: w.t }];
      tg = "fisico";
    } else {
      items = [{ n: w.t, rx: w.sub || "" }];
      tg = /flexib|movilidad|estir/i.test(w.t) ? "estiramientos" : "general";
    }
    return { day, letter: L, title: w.t, sub: w.sub || "", tag: tg, items, off: !!w.off, ath: !w.off && !b.s[L], dkey: w.d };
  }).sort((a, c) => a.day - c.day).map((d) => ({ ...d, name: DAY_NAMES[d.day] }));
}

async function loadPlan73() {
  try {
    const cached = JSON.parse(lsGet("manuhq-plan73v3") || "null");
    if (cached) { PLAN = cached; planStatus = "cache"; buildRoutine(); }
  } catch (e) { /* ignorar */ }
  let fetched = false;
  try {
    loadPlan73.at = Date.now();
    const html = await fetch(PLAN73, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error("Plan-73 " + r.status); return r.text(); });
    fetched = true;   // si llegó la página pero algo falla después, es que cambió su formato
    const doc = new DOMParser().parseFromString(html, "text/html");
    const weekEl = doc.querySelector(".week");
    const week = [...doc.querySelectorAll(".week .day")].map((el) => ({
      d: el.querySelector(".d")?.textContent.trim(),
      off: el.classList.contains("off"),
      s: el.querySelector(".s")?.textContent.trim(),
      t: (el.querySelector(".t b") || el.querySelector(".t"))?.textContent.trim(),
      sub: el.querySelector(".t b") ? [...el.querySelector(".t").childNodes].filter((n) => n.nodeName !== "B").map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim() : "",
    }));
    const rules = weekEl?.parentElement.querySelector("ul.rules");
    // Los bloques están como JS en mi propia página de Plan-73: tomo esa parte del script y la evalúo.
    const src = [...doc.scripts].map((s) => s.textContent).find((t) => t.includes("const blocks"));
    const code = src.slice(0, src.indexOf("const tabs"));
    const v = new Function(code + ";return {blocks, W: typeof W!=='undefined'?W:null, SS: typeof SS!=='undefined'?SS:null};")();
    // Sprints: un panel por día (S1, S2) + calentamiento + reglas
    const sp = doc.querySelector("#sprints");
    const sprints = {};
    if (sp) {
      sp.querySelectorAll(".panel").forEach((p) => {
        if (/^Reglas/i.test(p.querySelector("h3")?.textContent.trim() || "")) sprints.rules = clean(p);
      });
      sprints.prep = sectionAfter(sp, /^preparaci/i);
      const warmH = [...sp.querySelectorAll("h3")].find((h) => /calentamiento/i.test(h.textContent));
      if (warmH && warmH.nextElementSibling) sprints.warm = { title: warmH.textContent.trim(), html: clean(warmH.nextElementSibling) };
    }
    // Descanso: "Sesión larga" y "Mientras descansás" de la sección de estiramiento
    const est = doc.querySelector("#estiramiento");
    let rest = null;
    if (est) {
      const panels = [...est.querySelectorAll(".panel")];
      const long = sectionAfter(est, /sesi[oó]n (larga|base)/i);
      const passive = panels.find((p) => /descans/i.test(p.querySelector("h3")?.textContent || ""));
      rest = {
        title: long?.title || "",
        html: long?.html || "",
        rows: long?.rows || [],
        passive: passive ? { title: passive.querySelector("h3").textContent.trim(), html: clean(passive).replace(/^\s*<h4>.*?<\/h4>/, "") } : null,
      };
    }
    // Lo propio de cada día: un título que empieza con su nombre ("Miércoles · …", "Domingo · …")
    sprints.days = {};
    week.forEach((w) => {
      const re = DAY_RE[w.d] && new RegExp("^" + DAY_RE[w.d], "i");
      const sec = re && (sectionAfter(sp, re) || sectionAfter(est, re));
      if (sec) sprints.days[w.d] = sec;
    });
    const updated = doc.querySelector("footer")?.textContent.trim() || "";
    // Números de arriba (peso hoy, metas, kg por semana)
    const stats = [...doc.querySelectorAll(".stats .stat")].map((s) => ({ v: s.querySelector("b")?.textContent.trim() || "", l: s.querySelector("span")?.textContent.trim() || "" }));
    // Calentamiento, estiramientos por zona y cuándo hacer cada uno
    const stretch = est ? {
      warm: rowsOf(tableAfter(est, /calentamiento din/i)),
      zones: rowsOf(tableAfter(est, /los estiramientos/i)),
      when: rowsOf(tableAfter(est, /cu[aá]ndo hacer/i)),
    } : null;
    // Cómo se ejecuta: RPE, descansos y cómo subir los pesos
    const ex = doc.querySelector("#ejecucion");
    const exec = ex ? Object.fromEntries([["rpe", /escala rpe/i], ["rest", /descansos/i], ["prog", /subir los pesos/i]].map(([k, re]) => {
      const p = [...ex.querySelectorAll(".panel")].find((x) => re.test(x.querySelector("h3")?.textContent || ""));
      return [k, p ? { title: p.querySelector("h3").textContent.replace(/^\d+\s*·\s*/, "").trim(), html: clean(p).replace(/^\s*<h4>.*?<\/h4>/, "") } : null];
    })) : {};
    // Comida (números diarios y control de peso) y objetivos de fuerza
    const secBy = (re) => [...doc.querySelectorAll("section")].find((s) => re.test(s.querySelector("h2")?.textContent || ""));
    const food = secBy(/^comida/i);
    const panelBy = (root, re) => root && [...root.querySelectorAll(".panel")].find((x) => re.test(x.querySelector("h3")?.textContent || ""));
    const daily = panelBy(food, /n[uú]meros diarios/i);
    const control = panelBy(food, /control de peso/i);
    const objSec = secBy(/^objetivos/i);
    // Comida: días ya armados, opciones para elegir, cocina de la semana y cómo armar el día
    const after = (root, re) => {
      const h = root && [...root.querySelectorAll("h3")].find((x) => re.test(x.textContent)), out = [];
      for (let n = h?.nextElementSibling; n && n.nodeName !== "H3"; n = n.nextElementSibling) out.push(n);
      return out;
    };
    const dishes = (root, re) => after(root, re).flatMap((n) => (n.matches("details.dia") ? [n] : [...n.querySelectorAll("details.dia")])).map((d) => {
      const sm = d.querySelector("summary"), sp = sm.querySelector("span");
      return { title: [...sm.childNodes].filter((c) => c !== sp).map((c) => c.textContent).join("").trim(), sub: sp?.textContent.trim() || "", rows: rowsOf(d.querySelector("table")), note: d.querySelector(".in")?.textContent.trim() || "" };
    });
    const cookP = panelBy(food, /cocina de la semana/i);
    const nutrition = {
      daily: rowsOf(daily?.querySelector("table")),
      control: control ? clean(control.querySelector("ul") || control) : "",
      days: dishes(food, /d[ií]as ya armados/i),
      options: dishes(food, /opciones para elegir/i),
      cook: cookP ? [...cookP.querySelectorAll("li")].map((li) => ({ label: li.querySelector("b")?.textContent.replace(/:\s*$/, "").trim() || "", html: clean(li).replace(/^\s*<b>.*?<\/b>\s*/, "") })) : [],
      slots: food ? rowsOf(tableAfter(food, /c[oó]mo armar/i)) : [],
    };
    const strength = { title: objSec?.querySelector("h2").textContent.trim() || "", head: objSec ? [...objSec.querySelectorAll("thead th")].map((t) => t.textContent.trim()) : [], rows: rowsOf(objSec?.querySelector("table")) };
    PLAN = {
      week, rules: rules ? clean(rules) : "", W: v.W, SS: v.SS, sprints, rest, updated, stats, stretch, exec, nutrition, strength,
      blocks: v.blocks.map(({ id, name, weeks, title, intro, s }) => ({ id, name, weeks, title, intro, s })),
    };
    planStatus = "live";
    const before = planWarn.map((w) => w.name).join("|");
    planWarn = planProblems(PLAN);
    if (planWarn.length && planWarn.map((w) => w.name).join("|") !== before) toast(`Plan-73 cambió: no pude leer ${planWarn.length === 1 ? "una parte" : planWarn.length + " partes"}`);
    lsSet("manuhq-plan73v3", JSON.stringify(PLAN));
    buildRoutine();
  } catch (e) {
    console.warn("No pude leer Plan-73; uso la versión guardada.", e);
    if (fetched) { planWarn = [{ name: "Todo Plan-73", where: "Rutina, Comida, Calendario y todo lo que sale de ahí" }]; toast("Plan-73 cambió: no pude leerlo"); }
  }
  updateSplash();
  // Redibujo solo si la vista usa el plan y no estás escribiendo algo (para no borrarte el texto)
  const typing = document.activeElement?.matches("input, textarea, select");
  if (["inicio", "rutina", "fisico", "comida", "habitos", "calendario"].includes(route()) && !typing) render();
  else $("#top-sync").innerHTML = syncBadge();
}
const isLift = (d) => /^[A-D]$/.test(d.letter);
const isSprint = (d) => !!d.ath;
const isOff = (d) => d.off ?? !(isLift(d) || isSprint(d));
const letterOf = (d) => d.letter || "—";
const sessionName = (d) => `<span class="letter ${isLift(d) ? "" : "plain"}">${/^\w/.test(d.letter || "") ? esc(d.letter) : "·"}</span>${esc(d.title)}`;
const sessionText = (d) => `${isLift(d) ? `${d.letter} · ` : ""}${d.title}${d.sub ? ` (${d.sub})` : ""}`;
/* Revisa que se haya podido leer cada parte de Plan-73; si no, el aviso dice cuál */
function planProblems(P) {
  const out = [], bad = (name, where) => out.push({ name, where }), b = P.blocks[0];
  if (P.week.length !== 7) bad("La semana", "Rutina y Calendario");
  if (!P.blocks.length) bad("Los bloques de gimnasio", "Rutina");
  if (b && P.week.some((w) => !w.off && !b.s[w.s] && !P.sprints?.days?.[w.d]?.rows?.length)) bad("Los días atléticos", "Rutina");
  if (P.week.some((w) => w.off) && !P.rest?.html) bad("La sesión de flexibilidad", "Rutina");
  if (!P.stretch?.zones?.length) bad("Los estiramientos", "Rutina");
  if (!P.nutrition?.days?.length) bad("Los días de comida armados", "Comida");
  if (!P.nutrition?.options?.length) bad("Las recetas y opciones", "Comida");
  if (!P.nutrition?.cook?.length) bad("La cocina de la semana", "Comida");
  if (!P.nutrition?.daily?.length) bad("Los números diarios", "Hábitos y Comida");
  if (!P.stats?.length) bad("El peso y las metas de arriba", "Cambio físico");
  if (!P.strength?.rows?.length) bad("Los objetivos de fuerza", "Cambio físico");
  return out;
}
const planWarnHTML = () => `
  <p>El HQ lee Plan-73 cada vez que lo abrís, pero no pudo entender ${planWarn.length === 1 ? "esta parte" : "estas partes"}. Seguramente cambió cómo está escrita en la página:</p>
  <ul class="rc-ing">${planWarn.map((w) => `<li><b>${esc(w.name)}</b> <span class="muted">· se ve en: ${esc(w.where)}</span></li>`).join("")}</ul>
  <p class="muted">Mientras tanto, eso puede verse vacío o desactualizado. Lo demás sigue funcionando. Para arreglarlo hay que ajustar cómo el HQ lee esa parte.</p>
  <p><a class="btn" href="${PLAN73}" target="_blank" rel="noopener">Abrir Plan-73 ↗</a></p>`;
const syncBadge = () => planWarn.length ? `<button class="sync warn" type="button" data-act="plan-warn" title="Tocá para ver qué no se pudo leer">⚠ Plan-73: no pude leer ${planWarn.length === 1 ? "una parte" : planWarn.length + " partes"}</button>` : ({
  live: `<span class="sync ok">● Sincronizado con Plan-73</span>`,
  cache: `<span class="sync">● Plan-73 (guardado)</span>`,
  offline: `<span class="sync off">● Sin conexión a Plan-73</span>`,
}[planStatus]);

/* =========================================================
   Componentes
   ========================================================= */
const warnBadge = () => planWarn.length ? syncBadge() : "";
const head = (title, sub, actions = "", kicker = "") => `<div class="page-head"><div>${kicker ? `<div class="kicker">${kicker}</div>` : ""}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;

function tasksCard(area, title = "Pendientes", cls = "") {
  const list = area ? S.tasks.filter((t) => t.area === area) : S.tasks;
  const sorted = [...list].sort((a, b) => a.done - b.done);
  return `
  <div class="card ${cls}">
    <div class="card-head"><h2>${title}</h2><span class="sub">${list.filter((t) => !t.done).length} abiertas</span></div>
    <form class="inline" data-form="task" data-area="${area || ""}">
      <input name="text" placeholder="Nueva tarea…" required />
      ${area ? "" : `<select name="area" class="opt" style="flex:0 1 140px">${TASK_AREAS.map((k) => `<option value="${k}">${LABELS[k]}</option>`).join("")}</select>`}
      <input name="due" type="date" class="opt" title="Fecha (opcional)" aria-label="Fecha (opcional)" />
      <button class="btn btn-primary">Agregar</button>
    </form>
    <ul class="list" style="margin-top:12px">
      ${sorted.map((t) => `
        <li class="${t.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-task" data-id="${t.id}" ${t.done ? "checked" : ""} />
          <span class="grow">${esc(t.text)}</span>
          ${t.due ? `<span class="small mono due ${!t.done && t.due < today() ? "late" : ""}" title="Fecha">${fmtDate(t.due)}</span>` : ""}
          ${area ? "" : tag(t.area)}
          <button class="del" data-act="del-task" data-id="${t.id}" title="Borrar">✕</button>
        </li>`).join("") || `<li class="empty" style="background:none">Nada pendiente.</li>`}
    </ul>
  </div>`;
}

/* Notas propias de cada sección (se guardan solas) */
const notesOpen = {};
document.addEventListener("toggle", (e) => { const k = e.target?.dataset?.nk; if (k) notesOpen[k] = e.target.open; }, true);
function notesCard(key, title = "Notas", cls = "") {
  const list = S.notes[key] || [];
  const open = key in notesOpen ? notesOpen[key] : list.length > 0;
  return `
  <details class="card notes-card ${cls}" data-nk="${key}" ${open ? "open" : ""}>
    <summary><span>${title}</span><span class="sub">${list.length ? list.length : "vacío"}</span></summary>
    <div class="nc-body">
    <form class="inline" data-form="note" data-key="${key}">
      <input name="text" placeholder="Anotá algo…" required /><button class="btn btn-primary">Agregar</button>
    </form>
    <ul class="list notes" style="margin-top:12px">
      ${list.map((n) => `<li><span class="grow">${esc(n.text)}</span><span class="small muted mono">${fmtDate(n.date)}</span><button class="del" data-act="del-note" data-key="${key}" data-id="${n.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Todavía no hay notas. Anotá algo arriba.</li>`}
    </ul>
    </div>
  </details>`;
}

function checklist(key, title, placeholder, cls = "") {
  return `
  <div class="card ${cls}">
    <div class="card-head"><h2>${title}</h2><span class="sub">${S[key].filter((t) => t.done).length}/${S[key].length}</span></div>
    <form class="inline" data-form="check" data-key="${key}">
      <input name="text" placeholder="${placeholder}" required /><button class="btn btn-primary">Agregar</button>
    </form>
    <ul class="list" style="margin-top:12px">
      ${S[key].map((t) => `
        <li class="${t.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-check" data-key="${key}" data-id="${t.id}" ${t.done ? "checked" : ""} />
          <span class="grow">${esc(t.text)}</span>
          <button class="del" data-act="del-check" data-key="${key}" data-id="${t.id}">✕</button>
        </li>`).join("") || `<li class="empty" style="background:none">Todavía no hay nada. Escribí arriba y tocá Agregar.</li>`}
    </ul>
  </div>`;
}

/* Campo de formulario con etiqueta */
function fieldHTML(f, val) {
  const v = val ?? (f.type === "date" ? today() : "");
  if (f.type === "select") return `<label class="field ${f.wide ? "wide" : ""}"><span>${f.label}</span><select name="${f.k}">${f.options.map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${ov === v ? "selected" : ""}>${esc(ol)}</option>`; }).join("")}</select></label>`;
  if (f.type === "textarea") return `<label class="field wide"><span>${f.label}</span><textarea name="${f.k}" placeholder="${f.ph || ""}">${esc(v)}</textarea></label>`;
  return `<label class="field ${f.wide ? "wide" : ""}"><span>${f.label}</span><input name="${f.k}" type="${f.type || "text"}" value="${esc(v)}" placeholder="${f.ph || ""}" ${f.step ? `step="${f.step}"` : ""} ${f.req ? "required" : ""} /></label>`;
}

function weightChart() {
  const pts = [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return `<p class="empty">Cargá al menos 2 pesajes para ver la gráfica.</p>`;
  const W = 700, H = 220, P = 30;
  const goal = goals().walking;
  const vals = pts.map((p) => +p.kg).concat([goal]);
  const min = Math.floor(Math.min(...vals) - 1), max = Math.ceil(Math.max(...vals) + 1);
  const x = (i) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min);
  const line = pts.map((p, i) => `${x(i)},${y(+p.kg)}`).join(" ");
  const area = `${P},${H - P} ${line} ${W - P},${H - P}`;
  const gy = y(goal);
  return `
  <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Evolución del peso">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d7cff" stop-opacity=".35"/><stop offset="1" stop-color="#4d7cff" stop-opacity="0"/></linearGradient></defs>
    <line x1="${P}" x2="${W - P}" y1="${gy}" y2="${gy}" stroke="#7b5cff" stroke-dasharray="6 6" />
    <text x="${W - P}" y="${gy - 6}" fill="#a78bff" font-size="12" text-anchor="end" font-family="Geist Mono">meta caminando ${goal} kg</text>
    <text x="4" y="${y(max) + 4}" fill="#5d6580" font-size="11" font-family="Geist Mono">${max}</text>
    <text x="4" y="${y(min) + 4}" fill="#5d6580" font-size="11" font-family="Geist Mono">${min}</text>
    <polygon points="${area}" fill="url(#wg)" />
    <polyline points="${line}" fill="none" stroke="#4d7cff" stroke-width="2.5" stroke-linejoin="round" />
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(+p.kg)}" r="3.5" fill="#4d7cff"><title>${fmtDate(p.date)}: ${p.kg} kg</title></circle>`).join("")}
  </svg>`;
}

function exList(d) {
  return `<ol class="ex-grid">${d.items.map((i) => `<li class="${i.key ? "key" : ""}"><span class="n">${esc(i.n)}${i.kind && i.kind !== "key" ? kindTag(i) : ""}</span>${i.rx ? `<span class="rx">${esc(i.rx)}</span>` : ""}</li>`).join("")}</ol>`;
}
/* ---------- Ventana flotante (popup): una sola, reutilizable ---------- */
let popFn = null;
function openPop(title, fn, cls = "") {
  popFn = fn;
  const dlg = $("#pop");
  dlg.className = "dlg pop " + cls;
  $("#pop-title").textContent = title;
  $("#pop-body").innerHTML = fn(); hydrateMedia($("#pop-body"));
  if (!dlg.open) dlg.showModal();
  $("#pop-body").scrollTop = 0;
}
function refreshPop() {   // si hay un popup abierto lo redibuja (por ejemplo, después de marcar un día)
  if (!popFn || !$("#pop").open) return;
  const b = $("#pop-body"), y = b.scrollTop;
  b.innerHTML = popFn(); b.scrollTop = y; hydrateMedia(b);
}

/* ---------- Calendario de entreno: la semana en fila, de lunes a domingo ---------- */
let weekOff = 0;                     // semana que miro (0 = esta, -1 = la pasada…). No se puede ir hacia adelante.
let calMonth = null, calSel = null;  // Calendario general: mes (YYYY-MM) y día elegido (null = hoy)
const gymDone = (date) => S.logs.gym.some((l) => l.date === date);
const kindOfDay = (d) => (isOff(d) ? "flex" : isSprint(d) ? "ath" : "gym");   // gimnasio · atlético · flexibilidad: cada uno con su color
const dateLong = (d) => { const s = new Date(d + "T12:00:00").toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }); return s.charAt(0).toUpperCase() + s.slice(1); };
const rangeLabel = (dates) => {
  const a = new Date(dates[0] + "T12:00:00"), b = new Date(dates[6] + "T12:00:00"), m = (d) => d.toLocaleDateString("es-UY", { month: "long" }).toLowerCase();
  return a.getMonth() === b.getMonth() ? `${a.getDate()} al ${b.getDate()} de ${m(b)}` : `${a.getDate()} de ${m(a)} al ${b.getDate()} de ${m(b)}`;
};
function gymCal({ sel = null, R = ROUTINE, pop = false, mark = true, nav = true, go = false, head = true } = {}) {
  const dates = weekDates(nav ? weekOff : 0), t = today(), days = [1, 2, 3, 4, 5, 6, 0];
  const nDone = dates.filter(gymDone).length;
  const nTrain = days.length;   // los 7 días cuentan, también la flexibilidad
  const title = !nav || weekOff === 0 ? "Esta semana" : weekOff === -1 ? "Semana pasada" : "Semana del " + rangeLabel(dates);
  return `<div class="gcal">
    ${head ? `<div class="gcal-head">
      ${nav ? `<button class="hnav" type="button" data-act="week-nav" data-dir="-1" aria-label="Semana anterior" title="Semana anterior">‹</button>` : ""}
      <div class="gcal-t"><b>${title}</b><span class="muted">${rangeLabel(dates)} · ${nDone} de ${nTrain} días hechos</span></div>
      ${nav && weekOff < 0 ? `<button class="btn btn-sm btn-ghost" type="button" data-act="week-nav" data-dir="0">Ir a hoy</button>` : ""}
      ${nav ? `<button class="hnav" type="button" data-act="week-nav" data-dir="1" aria-label="Semana siguiente" title="Semana siguiente" ${weekOff >= 0 ? "disabled" : ""}>›</button>` : ""}
    </div>` : ""}
    <div class="weekstrip ${pop ? "in-pop" : ""}">${days.map((dow, i) => {
      const d = R[dow], date = dates[i], done = gymDone(date), future = date > t, isToday = date === t;
      const label = `${done ? "Quitar la marca de hecho" : "Marcar como hecho"}: ${d.title}, ${DAY_NAMES[dow]} ${+date.slice(8)}`;
      return `<div class="wd k-${kindOfDay(d)} ${isToday ? "today" : ""} ${sel === dow ? "sel" : ""} ${done ? "done" : ""} ${future ? "fut" : ""}">
        <button class="wd-main" type="button" ${go ? `data-act="goto-rutina" data-day="${dow}"` : `data-act="sel-day" data-day="${dow}"`}>
          <span class="dn">${DAY_SHORT[dow]} <b>${+date.slice(8)}</b>${isToday ? `<i class="hoy">hoy</i>` : ""}</span>
          <span class="lt">${letterOf(d)}</span>
          <span class="dt">${esc(d.title)}${d.sub ? `<br><span class="muted">${esc(d.sub)}</span>` : ""}</span>
        </button>
        ${mark && !future ? `<button class="wd-ck ${done ? "on" : ""}" type="button" data-act="gym-day" data-date="${date}" aria-pressed="${done}" title="${esc(label)}" aria-label="${esc(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></button>` : ""}
        ${!mark && done ? `<span class="ok">✓</span>` : ""}
      </div>`;
    }).join("")}</div>
    ${mark ? `<p class="gcal-help">Tocá el círculo de un día para marcarlo como hecho. Con ‹ volvés a las semanas anteriores si te olvidaste de marcar.</p>
    <div class="gcal-legend"><span><i class="k k-gym"></i>Gimnasio</span><span><i class="k k-ath"></i>Atlético</span><span><i class="k k-flex"></i>Flexibilidad</span></div>` : ""}
  </div>`;
}

/* ---------- Recetas: salen de "Opciones para elegir" de Plan-73 ---------- */
const plainTxt = (s) => String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const fmtNums = (s) => { const m = String(s).match(/(\d[\d.]*)\s*(?:kcal)?\s*·\s*(\d+)\s*g/i); return m ? `${m[1]} kcal · ${m[2]} g de proteína` : String(s); };
const splitItems = (t) => String(t).replace(/\([^)]*\)/g, (m) => m.replace(/,/g, "\u0001")).split(/,\s+/)
  .flatMap((c) => c.split(/\s+y\s+(?=(?:un|una|\d))/)).map((x) => x.replace(/\u0001/g, ",").trim()).filter(Boolean);
function recipes() {
  const out = [];
  (PLAN?.nutrition?.options || []).forEach((g, gi) => g.rows.forEach((r, ri) => {
    const name = (r[0] || []).join(" ").trim();
    out.push({ gi, ri, group: g.title, note: g.note, name, key: plainTxt(name), text: (r[1] || []).join(" ").trim(), nums: (r[2] || []).join(" ").trim() });
  }));
  return out;
}
/* Busca la receta de un plato del menú ("Desayuno clásico" → Desayunos / Clásico) */
function findRecipe(dish) {
  const d = plainTxt(dish), d2 = d.replace(/^(desayuno|batido)( de)? /, ""), list = recipes();
  return list.find((r) => r.key === d || r.key === d2)
    || list.filter((r) => r.key.length >= 5 && (d.startsWith(r.key) || d2.startsWith(r.key))).sort((a, b) => b.key.length - a.key.length)[0] || null;
}
/* Separa lo que dice Plan-73 en ingredientes, pasos y notas */
function recipeParts(rec) {
  let text = rec.text, base = [];
  const same = /^el mismo,?\s+m[aá]s\s+/i;
  if (same.test(text) && rec.ri > 0) {   // "El mismo, más …": parte de la receta anterior
    const prev = recipes().find((r) => r.gi === rec.gi && r.ri === rec.ri - 1);
    if (prev) { base = recipeParts(prev).items; text = "Más " + text.replace(same, ""); }
  }
  const sent = text.split(/(?<=[.!])\s+(?=[A-ZÁÉÍÓÚ¡])/), first = sent[0].replace(/\.$/, "");
  if (/^(licu|dej|hac|cocin|cort|mezcl|bat|fre|pas)/i.test(first) || first.includes(";")) return { items: [], steps: sent, notes: [] };
  return { items: /^más /i.test(first) ? [...base, first] : splitItems(first), steps: [], notes: sent.slice(1) };
}
const liList = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
function recipeHTML({ nums, slot, rec, text }) {
  const p = rec ? recipeParts(rec) : { items: splitItems(text), steps: [], notes: [] };
  if (rec && !p.steps.length && !rec.name.includes("(") && plainTxt(text).startsWith(rec.key + " ")) {   // el menú agrega algo a la receta ("… y un vaso de leche")
    const extra = text.slice(rec.name.length).trim().replace(/^y\s+/i, "");
    if (extra) p.items = [...p.items, extra.charAt(0).toUpperCase() + extra.slice(1)];
  }
  const notes = [...p.notes, ...(rec?.note ? [rec.note] : [])];
  return `
    <div class="rc-top">${nums ? `<span class="rc-n">${esc(fmtNums(nums))}</span>` : ""}${slot ? `<span class="muted">${esc(slot)}</span>` : ""}</div>
    ${p.steps.length ? `<h4>Cómo se hace</h4><ol class="rc-steps">${liList(p.steps)}</ol>` : `<h4>Qué lleva</h4><ul class="rc-ing">${liList(p.items)}</ul>`}
    ${notes.length ? `<h4>Para tener en cuenta</h4>${notes.map((n) => `<p class="rc-note">${esc(n)}</p>`).join("")}` : ""}
    <p class="rc-src">${rec ? `Receta de «${esc(rec.group)}» en Plan-73.` : "Esto es lo que dice Plan-73 para esta comida."}</p>`;
}
function groupHTML(gi) {
  const g = PLAN?.nutrition?.options?.[gi];
  if (!g) return "";
  return `${g.note ? `<p class="rc-note">${esc(g.note)}</p>` : ""}
    <div class="rc-list">${recipes().filter((r) => r.gi === gi).map((r) => {
      const p = recipeParts(r);
      return `<article class="rc-card"><div class="rc-h"><b>${esc(r.name)}</b><span class="mono">${esc(r.nums)}</span></div>
        ${p.steps.length ? `<ol class="rc-steps">${liList(p.steps)}</ol>` : `<ul class="rc-ing">${liList(p.items)}</ul>`}
        ${p.notes.map((n) => `<p class="rc-note small">${esc(n)}</p>`).join("")}</article>`;
    }).join("")}</div>`;
}

/* =========================================================
   Vistas
   ========================================================= */
let selDay = new Date().getDay();
let wazaF = { belt: "todos", group: "todos", status: "todos", q: "" };
let quoteIdx = Math.floor(Math.random() * JUDO_QUOTES.length);
/* ---------- Idiomas ---------- */
let selLang = null, vocabQ = "";
let foodSel = null, habitDay = null;   // día armado que miro en Comida / día que chequeo en Hábitos (null = hoy)
const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* Los hábitos salen de "Números diarios" de Plan-73: si cambian allá, cambian acá */
function habitList() {
  const rows = PLAN?.nutrition?.daily || [];
  const list = rows.map((r) => { const name = (r[0] || []).join(" ").trim(); return { key: slug(name), name, goal: (r[1] || []).join(" ").trim() }; }).filter((h) => h.key);
  const base = list.length ? list : ["Calorías", "Proteína", "Creatina", "Agua", "Sueño"].map((name) => ({ key: slug(name), name, goal: "" }));
  return [{ key: "entreno", name: "Entrené", goal: "", gym: true }, ...base];
}
function streakOf(days) {
  const set = new Set(days); let n = 0; const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1);   // la racha sigue si hoy todavía no practicaste
  while (set.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const linkify = (t) => esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
function vocabHTML(L, list) {
  return list.map((v) => `<div class="vw"><b>${esc(v.w)}</b><span>${esc(v.m)}</span><button class="del" data-act="del-vocab" data-id="${L.id}" data-vid="${v.id}">✕</button></div>`).join("")
    || `<p class="empty">${L.vocab.length ? "Nada coincide con la búsqueda." : "Todavía no agregaste palabras."}</p>`;
}
const langById = (id) => S.langs.find((l) => l.id === id);

/* ---------- Diario ---------- */
let jEdit = null, jQ = "";     // entrada que estoy editando y búsqueda
const J_DRAFT = "manuhq-jdraft";   // lo que escribiste y todavía no guardaste (de este dispositivo)
function journalList(q) {
  const terms = plain(q).split(/\s+/).filter(Boolean);
  const all = [...S.journal].sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")));
  const list = all.filter((e) => terms.every((t) => plain(e.text).includes(t)));
  if (!list.length) return `<p class="empty">${all.length ? "No hay entradas con eso." : "Todavía no escribiste nada. Lo primero que escribas aparece acá."}</p>`;
  let day = "", out = "";
  for (const e of list) {
    if (e.date !== day) { day = e.date; out += `<h3 class="jday">${esc(dateLong(day))}${day === today() ? " · hoy" : ""}</h3>`; }
    out += jEdit === e.id
      ? `<div class="jentry editing"><textarea id="j-edit-text" rows="6" aria-label="Editar entrada">${esc(e.text)}</textarea>
          <div class="jact"><button class="btn btn-primary btn-sm" type="button" data-act="j-save" data-id="${e.id}">Guardar</button><button class="btn btn-sm btn-ghost" type="button" data-act="j-cancel">Cancelar</button></div></div>`
      : `<article class="jentry"><div class="jtxt">${linkify(e.text)}</div>
          <div class="jmeta">${e.time ? `<span class="mono small muted">${esc(e.time)}</span>` : ""}<button class="jbtn" type="button" data-act="j-edit" data-id="${e.id}" title="Editar" aria-label="Editar">✎</button><button class="jbtn" type="button" data-act="del-journal" data-id="${e.id}" title="Borrar" aria-label="Borrar">✕</button></div></article>`;
  }
  return out;
}

/* ---------- Plato del día + batido (de "Opciones para elegir" de Plan-73) ---------- */
const numsOf = (s) => { const m = String(s).match(/(\d[\d.]*)\s*(?:kcal)?\s*·\s*(\d+)\s*g/i); return m ? { kcal: +m[1].replace(/\./g, ""), g: +m[2] } : null; };
function getPick() { let st = null; try { st = JSON.parse(lsGet("manuhq-plato")); } catch (e) { /* nada */ } return st && st.date === today() ? st : { date: today(), p: 0, b: 0 }; }
function platoCard() {
  const list = recipes();
  const plates = list.filter((r) => /almuerzos/i.test(r.group));
  const shakes = list.filter((r) => /batidos/i.test(r.group) && !/\(para la noche\)|\(antes de entrenar\)|bomba/i.test(r.name));   // batidos de todos los días
  if (!plates.length || !shakes.length) return "";
  const st = getPick(), n = Math.floor(new Date(today() + "T12:00:00").getTime() / 864e5);
  const plate = plates[(n + st.p) % plates.length], shake = shakes[(n + 5 + st.b) % shakes.length];
  const a = numsOf(plate.nums), b = numsOf(shake.nums), tot = a && b ? { kcal: a.kcal + b.kcal, g: a.g + b.g } : null;
  const daily = PLAN?.nutrition?.daily || [];
  const goal = (re) => { const r = daily.find((x) => re.test((x[0] || []).join(" "))); const m = r && (r[1] || []).join(" ").match(/(\d[\d.]*)/); return m ? +m[1].replace(/\./g, "") : null; };
  const gK = goal(/calor/i), gP = goal(/prote/i);
  const goalTxt = daily.length ? `${(daily.find((x) => /calor/i.test((x[0] || []).join(" "))) || [[], []])[1].join(" ")} · ${(daily.find((x) => /prote/i.test((x[0] || []).join(" "))) || [[], []])[1].join(" ")}` : "";
  const item = (label, r, which) => `<div class="plato-item"><span class="label-sm">${label}</span>
    <button class="plato-main" type="button" data-act="recipe-opt" data-gi="${r.gi}" data-ri="${r.ri}" title="Ver la receta">
      <b>${esc(r.name.replace(/\s*\(.*?\)\s*/g, " ").trim())}</b>
      <span class="mk">${esc(fmtNums(r.nums).replace(" de proteína", ""))}</span>
      <span class="small muted">${esc(recipeParts(r).items.slice(0, 3).join(" · ") || r.text)}</span>
    </button>
    <button class="btn btn-sm btn-ghost" type="button" data-act="plato-next" data-w="${which}">↻ Otro ${label.toLowerCase()}</button></div>`;
  return `<div class="bento"><div class="card c-12 plato">
    <div class="card-head"><div><span class="label-sm">Plato del día</span><h2 style="font-size:20px;margin-top:6px">Fácil de hacer, y suma macros</h2></div><a href="#comida" class="sub">Toda la comida →</a></div>
    <div class="plato-grid">
      ${item("Plato", plate, "p")}
      ${item("Batido", shake, "b")}
      ${tot ? `<div class="plato-total"><span class="label-sm">Entre los dos</span><b>${tot.kcal} kcal · ${tot.g} g de proteína</b>
        <span class="small muted">${gK && gP ? `Cubre ${Math.round((tot.kcal / gK) * 100)}% de las calorías y ${Math.round((tot.g / gP) * 100)}% de la proteína del día${goalTxt ? ` (meta: ${esc(goalTxt)})` : ""}.` : "Sumá lo que falte con el resto de las comidas."}</span></div>` : ""}
    </div>
    <p class="tip-line" style="margin:12px 0 0">Tocá el plato o el batido para ver qué lleva. Mañana cambian solos.</p>
  </div></div>`;
}

/* ---------- Pinterest: pins, tableros y perfiles con los widgets oficiales ---------- */
/* Pinterest no deja leer la imagen de un pin con solo el link (bloquea el pedido desde otras páginas),
   así que cada pin se muestra con su widget oficial. El script de Pinterest se carga recién en esta sección. */
let pinTag = "";    // etiqueta elegida para filtrar
const PIN_RE = /https?:\/\/(?:[\w-]+\.)?pinterest\.[a-z.]+\/[^\s"'<>]+/gi;
const PIN_RESERVED = new Set(["pin", "search", "ideas", "today", "business", "settings", "explore", "topics", "videos", "about", "help", "login", "logout", "news_hub", "shop", "create", "feed", "notifications", "_"]);
function pinParse(txt) {
  const items = [], seen = new Set();
  for (const m of String(txt).matchAll(PIN_RE)) {
    let u; try { u = new URL(m[0]); } catch (e) { continue; }
    const seg = u.pathname.split("/").filter(Boolean);
    if (!seg.length) continue;
    let it = null;
    if (seg[0] === "pin" && /^\d+$/.test(seg[1] || "")) it = { kind: "pin", url: `https://www.pinterest.com/pin/${seg[1]}/` };
    else if (PIN_RESERVED.has(seg[0].toLowerCase())) continue;
    else if (seg.length === 1) it = { kind: "user", url: `https://www.pinterest.com/${seg[0]}/` };
    else it = { kind: "board", url: `https://www.pinterest.com/${seg[0]}/${seg[1]}/` };
    if (!seen.has(it.url)) { seen.add(it.url); items.push(it); }
  }
  return { items, short: (String(txt).match(/pin\.it\/\S+/gi) || []).length };
}
let pinitP = null;
function pinit() {
  if (window.PinUtils?.build) return Promise.resolve(false);
  return pinitP || (pinitP = new Promise((res, rej) => {
    const s = document.createElement("script"); s.async = true; s.src = "https://assets.pinterest.com/js/pinit.js";
    s.onload = () => { let n = 0; const t = setInterval(() => { if (window.PinUtils?.build) { clearInterval(t); res(true); } else if (++n > 50) { clearInterval(t); pinitP = null; rej(new Error("pinit")); } }, 150); };
    s.onerror = () => { pinitP = null; rej(new Error("pinit")); };
    document.head.appendChild(s);
  }));
}
function buildPins() {   // arma los widgets de los links que hay en pantalla
  const box = $("#pins-wrap");
  if (!box || !box.querySelector("a[data-pin-do]")) return;
  // la primera vez, el script de Pinterest arma solo lo que hay en pantalla; las siguientes veces hay que pedírselo
  pinit().then((fresh) => { if (!fresh && $("#pins-wrap") === box && box.querySelector("a[data-pin-do]")) window.PinUtils.build(box); }).catch(() => toast("No pude cargar Pinterest (¿un bloqueador?). Los links igual abren."));
}

/* ---------- Media: fotos pegadas, guardadas en este dispositivo y sincronizadas ---------- */
/* Las fotos pesan mucho más que el resto de los datos, así que no van en el gist de datos:
   - en cada dispositivo viven en IndexedDB (mucho más espacio que localStorage);
   - en la lista de datos (que ya se sincroniza) queda solo una ficha de cada foto: id, etiqueta, fecha y medidas;
   - las fotos mismas se suben a un SEGUNDO gist secreto ("Manu HQ · fotos"), un archivo por foto, y los otros
     dispositivos las bajan de ahí. Cada foto se reduce a 1280 px, JPEG, para que pese poco. */
let mediaTag = "";                       // etiqueta elegida para filtrar
const mediaLocal = new Set();            // fotos que este dispositivo tiene guardadas
let mediaReady = false, mediaBusy = false, mediaFail = false, mediaT = null;
const lsJSON = (k, d) => { try { return JSON.parse(lsGet(k)) ?? d; } catch (e) { return d; } };
const mediaOk = new Set(lsJSON("manuhq-mediaok", []));        // fotos que ya están en la nube (en este dispositivo)
const mediaSaveOk = () => lsSet("manuhq-mediaok", JSON.stringify([...mediaOk]));
const mediaDelQ = () => lsJSON("manuhq-mediadel", []);        // fotos que borré acá y falta borrar de la nube

/* IndexedDB mínimo: clave = id de la foto, valor = la foto como texto (data URL) */
const idb = () => idb.p || (idb.p = new Promise((res, rej) => {
  if (!window.indexedDB) { rej(new Error("sin IndexedDB")); return; }
  const r = indexedDB.open("manuhq-media", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("img");
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
}));
const idbTx = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction("img", mode), q = fn(t.objectStore("img")); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
const idbPut = (k, v) => idbTx("readwrite", (s) => s.put(v, k));
const idbGet = (k) => idbTx("readonly", (s) => s.get(k));
const idbDel = (k) => idbTx("readwrite", (s) => s.delete(k));
const idbKeys = () => idbTx("readonly", (s) => s.getAllKeys());

/* Reduce la foto: lado largo 1280 px, JPEG */
async function mediaProcess(file) {
  let src;
  try { src = await createImageBitmap(file); }
  catch (e) { src = await new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => rej(new Error("no se pudo leer")); im.src = u; }); }
  const sw = src.width || src.naturalWidth, sh = src.height || src.naturalHeight, k = Math.min(1, 1280 / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(src, 0, 0, w, h);
  return { data: c.toDataURL("image/jpeg", 0.8), w, h };
}
async function mediaAdd(files) {
  files = [...files].filter((f) => f.type.startsWith("image/")).slice(0, 30);
  if (!files.length) return;
  const tag = ($("#media-tag")?.value || "").trim().slice(0, 30), batch = [];
  toast(`Guardando ${files.length} foto${files.length === 1 ? "" : "s"}…`);
  let unreadable = 0, nosave = false;
  for (const f of files) {
    let p; try { p = await mediaProcess(f); } catch (e) { unreadable++; console.warn("foto:", e); continue; }
    const id = uid();
    try { await idbPut(id, p.data); } catch (e) { nosave = true; console.warn("foto:", e); continue; }
    mediaLocal.add(id);
    batch.push({ id, tag, date: today(), w: p.w, h: p.h, kb: Math.round((p.data.length * 0.75) / 1024) });
  }
  if (batch.length) { S.media.unshift(...batch); save(); render(); mediaTick(); toast(`${batch.length} foto${batch.length === 1 ? "" : "s"} guardada${batch.length === 1 ? "" : "s"} ✓`); }
  if (nosave) toast("Este navegador no deja guardar fotos (¿ventana privada?)");
  else if (unreadable) toast(batch.length ? "Alguna imagen no se pudo leer" : "No pude leer esa imagen");
}
function mediaDropLocal(id) {
  idbDel(id).catch(() => {}); mediaLocal.delete(id); mediaOk.delete(id); mediaSaveOk();
  if (mediaUrls.has(id)) { URL.revokeObjectURL(mediaUrls.get(id)); mediaUrls.delete(id); }
}
function mediaRemove(id) {   // borrar una foto: de acá y, si ya estaba en la nube, también de ahí
  S.media = S.media.filter((m) => m.id !== id);
  if (mediaOk.has(id)) lsSet("manuhq-mediadel", JSON.stringify([...mediaDelQ(), id]));
  mediaDropLocal(id);
  setTimeout(mediaTick, 300);
}
/* Si otro dispositivo borró fotos, acá también se van */
function mediaAfterRemote(before) {
  const now = new Set(S.media.map((m) => m.id));
  before.filter((id) => !now.has(id)).forEach(mediaDropLocal);
  mediaTick();
}

/* Mostrar: de IndexedDB a una URL temporal (blob) */
const mediaUrls = new Map();
async function mediaUrl(id) {
  if (mediaUrls.has(id)) return mediaUrls.get(id);
  const data = await idbGet(id).catch(() => null);
  if (!data) return null;
  const u = URL.createObjectURL(await (await fetch(data)).blob());
  mediaUrls.set(id, u); return u;
}
async function hydrateMedia(root = document) {
  const els = [...root.querySelectorAll("[data-mid]")];
  const put = (el, u) => { if (el.tagName === "IMG") el.src = u; else el.href = u; };
  els.forEach((el) => { const u = mediaUrls.get(el.dataset.mid); if (u) put(el, u); });   // las que ya están listas, enseguida
  for (const el of els) { if (!el.isConnected || (el.tagName === "IMG" ? el.getAttribute("src") : el.getAttribute("href"))) continue; const u = await mediaUrl(el.dataset.mid); if (u && el.isConnected) put(el, u); }
}

/* Sincronización de las fotos con el segundo gist */
async function mediaGistId() {
  if (S.mediaGist) return S.mediaGist;
  const g = await gh("/gists", { method: "POST", body: JSON.stringify({ description: "Manu HQ · fotos", public: false, files: { "LEEME.txt": { content: "Fotos de Manu HQ (sección Media). No borres este gist: acá se guardan las fotos para verlas en todos tus dispositivos." } } }) });
  S.mediaGist = g.id; save();   // el id viaja a los demás dispositivos con la sincronización normal
  return g.id;
}
async function mediaTick() {
  if (mediaBusy || !mediaReady || !SYNC.token || !SYNC.gist) return;
  mediaBusy = true;
  try {
    const up = S.media.filter((m) => mediaLocal.has(m.id) && !mediaOk.has(m.id)), del = mediaDelQ();
    if (up.length || del.length) {
      const gid = await mediaGistId();
      for (const m of up) {
        const data = await idbGet(m.id); if (!data) continue;
        await gh("/gists/" + gid, { method: "PATCH", body: JSON.stringify({ files: { [`m-${m.id}.txt`]: { content: data } } }) });
        mediaOk.add(m.id); mediaSaveOk(); mediaRefresh();
      }
      if (del.length) {
        try { await gh("/gists/" + gid, { method: "PATCH", body: JSON.stringify({ files: Object.fromEntries(del.map((id) => [`m-${id}.txt`, null])) }) }); }
        catch (e) { if (e.status !== 422) throw e; }   // 422: alguna ya no estaba; no hay nada más que borrar
        lsSet("manuhq-mediadel", "[]");
      }
    }
    if (S.mediaGist && SYNC.owner) {
      for (const m of S.media.filter((x) => !mediaLocal.has(x.id))) {
        const r = await fetch(`https://gist.githubusercontent.com/${SYNC.owner}/${S.mediaGist}/raw/m-${m.id}.txt`, { cache: "no-store" });
        if (!r.ok) continue;   // todavía no la subió el otro dispositivo
        const t = await r.text();
        if (!/^data:image\//.test(t)) continue;
        await idbPut(m.id, t); mediaLocal.add(m.id); mediaOk.add(m.id); mediaSaveOk(); mediaRefresh();
      }
    }
    mediaFail = false;
  } catch (e) { mediaFail = true; console.warn("fotos:", e); }
  mediaBusy = false; mediaRefresh();
}
function mediaRefresh() {   // actualiza lo que se ve (sin pisar lo que estás escribiendo)
  clearTimeout(mediaT);
  mediaT = setTimeout(() => {
    const st = $("#media-status"); if (st) st.innerHTML = mediaStatus();
    if (route() === "media" && !document.activeElement?.matches("input, textarea")) render();
  }, 350);
}
function mediaStatus() {
  if (!SYNC.token) return `Las fotos se guardan en este dispositivo. Para verlas en los demás, <button class="linkbtn" type="button" data-act="open-sync">conectá la sincronización</button>.`;
  const up = S.media.filter((m) => mediaLocal.has(m.id) && !mediaOk.has(m.id)).length, down = mediaReady ? S.media.filter((m) => !mediaLocal.has(m.id)).length : 0, n = (k) => `${k} foto${k === 1 ? "" : "s"}`;
  if (mediaFail && (up || down)) return `Sin conexión con GitHub: ${up ? `faltan subir ${n(up)}` : `faltan bajar ${n(down)}`}. Se reintenta solo.`;
  return up ? `☁ Subiendo ${n(up)}…` : down ? `☁ Bajando ${n(down)}…` : `☁ Todo sincronizado · ${n(S.media.length)}`;
}
function mediaInit() {
  idbKeys().then((ks) => { ks.forEach((k) => mediaLocal.add(k)); mediaReady = true; if (route() === "media") render(); mediaTick(); }).catch(() => { mediaReady = true; });
}
function photoHTML(id) {
  const m = S.media.find((x) => x.id === id);
  if (!m) return `<p class="empty">Esa foto ya no está.</p>`;
  return `<div class="mfull-wrap"><img class="mfull" data-mid="${id}" alt="Foto" /></div>
    <div class="mfoot">
      <span class="small muted">${esc(fmtDate(m.date))} · ${m.w}×${m.h} · ${m.kb} KB</span>
      <div class="inline">
        <input id="mtag-edit" list="media-tags" value="${esc(m.tag || "")}" placeholder="Etiqueta" maxlength="30" aria-label="Etiqueta" />
        <button class="btn btn-sm" type="button" data-act="media-tag-save" data-id="${id}">Guardar etiqueta</button>
        <a class="btn btn-sm" data-mid="${id}" download="foto-${esc(m.date)}.jpg">Descargar</a>
        <button class="btn btn-sm btn-ghost" type="button" data-act="media-del" data-id="${id}">Borrar</button>
      </div>
    </div>`;
}

/* ---------- Lectura: libros, progreso, racha y notas ---------- */
/* Los libros se buscan en Open Library (gratis, sin cuenta) para completar autor, páginas y portada solos. */
let bookQ = "", bookSug = [], bookBusy = false, bookErr = false, bookSearchT = null, bookSearchN = 0;
const bookPct = (b) => (b.pages > 0 ? Math.min(100, Math.round(((b.page || 0) / b.pages) * 100)) : 0);
const bookCover = (src, title, cls = "") => `<span class="bcover ${cls}">${src ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}<i>${esc((title || "?").slice(0, 1).toUpperCase())}</i></span>`;
async function bookSearch(q) {
  const n = ++bookSearchN;
  bookBusy = true; bookErr = false;
  try {
    const r = await fetch("https://openlibrary.org/search.json?limit=6&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median&q=" + encodeURIComponent(q));
    const j = await r.json();
    if (n !== bookSearchN) return;
    bookSug = (j.docs || []).map((d) => ({ title: d.title, author: (d.author_name || []).slice(0, 2).join(", "), year: d.first_publish_year || "", pages: d.number_of_pages_median || 0, cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "" }));
  } catch (e) { if (n !== bookSearchN) return; bookSug = []; bookErr = true; }
  bookBusy = false; renderBookSug();
}
const bookBtns = (i) => [["want", "Quiero leer"], ["reading", "Leyendo"], ["done", "Leído"]].map(([k, l]) => `<button class="btn btn-sm ${k === "reading" ? "btn-primary" : ""}" type="button" data-act="book-add" data-i="${i}" data-st="${k}">${l}</button>`).join("");
function bookSugHTML() {
  const q = bookQ.trim();
  if (q.length < 3) return "";
  const rows = bookSug.map((s, i) => `<li class="bsug">${bookCover(s.cover, s.title, "sm")}
    <span class="bsug-t"><b>${esc(s.title)}</b><span class="muted small">${esc([s.author, s.year, s.pages ? s.pages + " págs" : ""].filter(Boolean).join(" · "))}</span></span>
    <span class="bsug-b">${bookBtns(i)}</span></li>`).join("");
  return `<ul class="bsug-list">
    ${bookBusy ? `<li class="bsug-note">Buscando…</li>` : bookErr ? `<li class="bsug-note">No pude buscar (¿sin conexión?). Igual lo podés agregar a mano.</li>` : ""}
    ${rows}
    <li class="bsug manual"><span class="bsug-t"><b>Agregar «${esc(q)}» tal cual</b><span class="muted small">Si no lo ves en la lista</span></span><span class="bsug-b">${bookBtns("m")}</span></li></ul>`;
}
function renderBookSug() { const el = $("#book-sug"); if (el) el.innerHTML = bookSugHTML(); }
function setBookStatus(b, st) {
  b.status = st;
  if (st === "reading") { b.started = b.started || today(); b.finished = ""; }
  if (st === "done") { b.started = b.started || today(); b.finished = b.finished || today(); if (b.pages) b.page = b.pages; }
  if (st === "want") { b.started = ""; b.finished = ""; }
}
function bookReadFields(b) {   // pasa lo que escribiste en el popup al libro (antes de cambiar estado o estrellas)
  const g = (id) => $("#pop " + id);
  if (!g("#bk-title")) return;
  b.title = g("#bk-title").value.trim() || b.title;
  b.author = g("#bk-author").value.trim();
  b.pages = Math.max(0, +g("#bk-pages").value || 0);
  b.page = Math.max(0, Math.min(b.pages || Infinity, +g("#bk-page").value || 0));
  b.notes = g("#bk-notes").value;
}
function bookPopHTML(id) {
  const b = S.books.find((x) => x.id === id);
  if (!b) return `<p class="empty">Ese libro ya no está.</p>`;
  const st = (k, label) => `<button class="chip ${b.status === k ? "on" : ""}" type="button" data-act="book-status" data-id="${id}" data-st="${k}">${label}</button>`;
  return `<div class="bk-top">${bookCover(b.cover, b.title, "big")}
      <div class="bk-id"><input id="bk-title" value="${esc(b.title)}" aria-label="Título" /><input id="bk-author" value="${esc(b.author || "")}" placeholder="Autor" aria-label="Autor" /></div></div>
    <h4>Estado</h4>
    <div class="filters" style="margin:0">${st("want", "Quiero leer")}${st("reading", "Leyendo")}${st("done", "Leído")}</div>
    <h4>Progreso</h4>
    <div class="bk-prog">
      <label><span class="small muted">Página en la que estás</span><input id="bk-page" type="number" min="0" inputmode="numeric" value="${b.page || 0}" /></label>
      <label><span class="small muted">Total de páginas</span><input id="bk-pages" type="number" min="0" inputmode="numeric" value="${b.pages || 0}" /></label>
    </div>
    ${b.pages ? `<div class="progress" style="margin-top:10px"><div style="width:${bookPct(b)}%"></div></div><p class="small muted" style="margin:6px 0 0">${bookPct(b)}% · te faltan ${Math.max(0, b.pages - (b.page || 0))} páginas</p>` : ""}
    <h4>Mi opinión</h4>
    <div class="bk-stars" role="group" aria-label="Puntaje">${[1, 2, 3, 4, 5].map((n) => `<button class="star ${n <= (b.rating || 0) ? "on" : ""}" type="button" data-act="book-rate" data-id="${id}" data-n="${n}" aria-label="${n} de 5" aria-pressed="${n <= (b.rating || 0)}">★</button>`).join("")}</div>
    <h4>Notas y citas</h4>
    <textarea id="bk-notes" rows="6" placeholder="Lo que te quedó, frases que te gustaron, ideas para aplicar…" aria-label="Notas y citas">${esc(b.notes || "")}</textarea>
    <div class="bk-actions"><button class="btn btn-primary" type="button" data-act="book-save" data-id="${id}">Guardar</button><button class="btn btn-ghost" type="button" data-act="book-del" data-id="${id}">Borrar libro</button></div>`;
}

/* ---------- Solinvitto: ideas y videos para las redes ---------- */
const SOL_STAGES = ["Idea", "Guion", "Grabado", "Editado", "Publicado"];
const SOL_PLATS = ["TikTok", "Instagram", "YouTube", "Otra"];
const solF = { st: "todos", plat: "todos" };
function solReadFields(v) {   // pasa lo que escribiste en el popup al video
  const g = (id) => $("#pop " + id);
  if (!g("#sv-title")) return;
  v.title = g("#sv-title").value.trim() || v.title;
  v.plat = g("#sv-plat").value;
  v.hook = g("#sv-hook").value.trim();
  v.script = g("#sv-script").value;
  v.link = g("#sv-link").value.trim();
  v.date = g("#sv-date").value;
  v.notes = g("#sv-notes").value;
}
function solPopHTML(id) {
  const v = S.solin.find((x) => x.id === id);
  if (!v) return `<p class="empty">Ese video ya no está.</p>`;
  return `<input id="sv-title" value="${esc(v.title)}" aria-label="Título" style="font-size:18px;font-weight:600" />
    <h4>Etapa</h4>
    <div class="filters" style="margin:0">${SOL_STAGES.map((s, i) => `<button class="chip ${v.stage === i ? "on" : ""}" type="button" data-act="solin-stage" data-id="${id}" data-n="${i}">${s}</button>`).join("")}</div>
    <div class="bk-prog" style="margin-top:14px">
      <label><span class="small muted">Dónde se sube</span><select id="sv-plat">${SOL_PLATS.map((p) => `<option ${p === v.plat ? "selected" : ""}>${p}</option>`).join("")}</select></label>
      <label><span class="small muted">Fecha (para grabar o publicar)</span><input id="sv-date" type="date" value="${esc(v.date || "")}" /></label>
    </div>
    <h4>Gancho (la primera frase)</h4>
    <input id="sv-hook" value="${esc(v.hook || "")}" placeholder="Lo que dice o muestra en los primeros 3 segundos" aria-label="Gancho" />
    <h4>Guion</h4>
    <textarea id="sv-script" rows="7" placeholder="Qué pasa en el video, escena por escena…" aria-label="Guion">${esc(v.script || "")}</textarea>
    <h4>Link del video publicado</h4>
    <input id="sv-link" type="url" value="${esc(v.link || "")}" placeholder="https://…" aria-label="Link" />
    ${v.link ? `<p class="small" style="margin:6px 0 0"><a href="${esc(v.link)}" target="_blank" rel="noopener">Abrir el video ↗</a></p>` : ""}
    <h4>Notas</h4>
    <textarea id="sv-notes" rows="3" placeholder="Música, referencias, ideas para el próximo…" aria-label="Notas">${esc(v.notes || "")}</textarea>
    <div class="bk-actions"><button class="btn btn-primary" type="button" data-act="solin-save" data-id="${id}">Guardar</button><button class="btn btn-ghost" type="button" data-act="solin-del" data-id="${id}">Borrar video</button></div>`;
}
/* ---------- Repos de GitHub (públicos, se leen de la API sin token) ---------- */
const GH_USER = "Manu-Alz", GH_CACHE = "manuhq-repos";
const repos = { list: null, busy: false, err: false, tried: false, showHidden: false };
const LANG_COLOR = { JavaScript: "#f1e05a", HTML: "#e34c26", CSS: "#9575cd", TypeScript: "#3178c6", Python: "#3572a5", Shell: "#89e051" };
function ago(iso) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 6e4));
  if (m < 2) return "recién"; if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24); if (d === 1) return "ayer"; if (d < 30) return `hace ${d} días`;
  const mo = Math.round(d / 30); return mo < 12 ? `hace ${mo} ${mo === 1 ? "mes" : "meses"}` : `hace más de un año`;
}
async function loadRepos(force) {
  repos.tried = true;
  try { const c = JSON.parse(localStorage.getItem(GH_CACHE) || "null"); if (c && Array.isArray(c.list)) { repos.list = c.list; if (!force && Date.now() - c.t < 10 * 6e4) return; } } catch (e) {}
  repos.busy = true; repos.err = false;
  try {
    const r = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed`);
    if (!r.ok) throw new Error(r.status);
    repos.list = (await r.json()).map((x) => ({ name: x.name, desc: x.description || "", lang: x.language || "", stars: x.stargazers_count, pushed: x.pushed_at, url: x.html_url, pages: !!x.has_pages, home: x.homepage || "", fork: x.fork, archived: x.archived }));
    try { localStorage.setItem(GH_CACHE, JSON.stringify({ t: Date.now(), list: repos.list })); } catch (e) {}
  } catch (e) { repos.err = true; }
  repos.busy = false;
  if (route() === "repos") render();
}
/* ---------- Proyectos de video (dentro de Contenido): cada uno con su tablero ---------- */
const selCh = { id: null, adding: false };
const chOf = (v) => v.ch || "solin";
function channelsHTML() {
  const chs = S.channels;
  if (!chs.some((c) => c.id === selCh.id)) selCh.id = chs[0]?.id || null;
  const cur = chs.find((c) => c.id === selCh.id), adding = selCh.adding || !cur;
  const count = (c) => S.solin.filter((v) => chOf(v) === c.id).length;
  const tabs = `<div class="filters ch-tabs">${chs.map((c) => `<button class="chip ${c.id === selCh.id && !selCh.adding ? "on" : ""}" type="button" data-act="ch-sel" data-id="${c.id}">${esc(c.name)} <span class="muted">${count(c)}</span></button>`).join("")}<button class="chip ch-plus ${adding ? "on" : ""}" type="button" data-act="ch-new">＋ Nuevo proyecto</button></div>`;
  const newForm = adding ? `<form class="inline ch-new" data-form="channel"><input name="name" placeholder="Nombre del proyecto (ej: Solinvitto, otra cuenta, un canal…)" required maxlength="40" /><button class="btn btn-primary">Crear</button></form>` : "";
  let body = "", notes = "";
  if (cur && !selCh.adding) {
    const all = S.solin.filter((v) => chOf(v) === cur.id);
    const list = all.filter((v) => (solF.st === "todos" || v.stage === +solF.st) && (solF.plat === "todos" || v.plat === solF.plat));
    const sorted = [...list].sort((a, b) => a.stage - b.stage || (a.date || "9").localeCompare(b.date || "9"));
    const n = (i) => all.filter((v) => v.stage === i).length;
    const chip = (k, label, c) => `<button class="chip ${String(solF.st) === String(k) ? "on" : ""}" type="button" data-act="solin-f" data-st="${k}">${label}${c != null ? ` <span class="muted">${c}</span>` : ""}</button>`;
    const next = all.filter((v) => v.stage < 4 && v.date).sort((a, b) => a.date.localeCompare(b.date))[0];
    body = `
      <div class="ch-head">
        <label class="ch-name"><input class="ch-title" data-ch-rename="${cur.id}" value="${esc(cur.name)}" maxlength="40" size="${Math.max(6, cur.name.length)}" aria-label="Nombre del proyecto" title="Tocá el nombre para cambiarlo" /><span class="ch-edit" aria-hidden="true">✎</span></label>
        <button class="btn btn-sm btn-ghost" type="button" data-act="ch-del" data-id="${cur.id}">Borrar proyecto</button>
      </div>
      <form class="inline" data-form="solin">
        <input name="title" placeholder="Idea de video…" required />
        <select name="plat" class="opt" style="flex:0 1 150px" aria-label="Plataforma">${SOL_PLATS.map((p) => `<option>${p}</option>`).join("")}</select>
        <button class="btn btn-primary">Agregar</button>
      </form>
      <p class="small muted" style="margin:10px 0 14px">${all.length ? `${n(4)} publicados · ${all.length - n(4)} en camino${next ? ` · próximo: ${fmtDate(next.date)}` : ""}` : "Escribí la idea y listo. Después la abrís para sumarle gancho, guion y link."}</p>
      <div class="filters" style="margin-bottom:14px">
        ${chip("todos", "Todos", all.length)}${SOL_STAGES.map((s, i) => chip(i, s, n(i))).join("")}
        <select data-act="solin-plat" aria-label="Plataforma"><option value="todos">Todas las plataformas</option>${SOL_PLATS.map((p) => `<option ${solF.plat === p ? "selected" : ""}>${p}</option>`).join("")}</select>
      </div>
      ${sorted.length ? `<div class="bgrid">${sorted.map((v) => `<button class="book vcard" type="button" data-act="solin-open" data-id="${v.id}">
        <span class="binfo"><span class="vmeta"><span class="vst s${v.stage}">${SOL_STAGES[v.stage]}</span><span class="small muted">${esc(v.plat)}${v.date ? " · " + fmtDate(v.date) : ""}</span></span>
        <b>${esc(v.title)}</b>${v.hook ? `<span class="muted small">“${esc(v.hook)}”</span>` : ""}</span></button>`).join("")}</div>`
        : `<p class="empty" style="margin:0">${all.length ? "No hay videos con ese filtro." : "Todavía no hay videos en este proyecto."}</p>`}`;
    notes = `<div class="bento" style="margin-top:16px">${notesCard(cur.id === "solin" ? "solin" : "ch-" + cur.id, "Notas de " + esc(cur.name), "c-12")}</div>`;
  }
  return `<section class="ch-sec">
    <div class="sec-title"><h2>Proyectos de video</h2><p>Un tablero por proyecto, de la idea a publicado. Tocá un video para ver y editar los detalles.</p></div>
    <div class="card ch-card">${tabs}${newForm}${body}</div>${notes}
  </section>`;
}
/* ---------- Estadísticas: todo sale de lo que ya marcás, no hay que cargar nada ---------- */
const weeksBack = (n) => Array.from({ length: n }, (_, i) => weekDates(-(n - 1 - i)));   // n semanas (lunes a domingo); la última es esta
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const stRing = (pct, big, small) => {
  const r = 40, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 100 100" role="img" aria-label="${esc(big)} ${esc(small)}"><circle cx="50" cy="50" r="${r}" class="rg-bg"/><circle cx="50" cy="50" r="${r}" class="rg-fg" stroke-dasharray="${(c * p / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="53" text-anchor="middle" class="rg-n">${big}</text><text x="50" y="68" text-anchor="middle" class="rg-s">${small}</text></svg>`;
};
const stBars = (items, max) => `<div class="sbars">${items.map((it) => `<div class="sbar ${it.now ? "now" : ""} ${it.v ? "" : "zero"}" title="${esc(it.title || "")}"><span class="sv">${it.v || ""}</span><div class="sb-track"><i style="height:${max ? Math.round((it.v / max) * 100) : 0}%"></i></div><span class="sl">${esc(it.label)}</span></div>`).join("")}</div>`;
const stHeat = (weeks, level) => { const t = today(); return `<div class="heat">${weeks.flat().map((d) => `<i class="${d > t ? "fut" : "l" + level(d)}" title="${esc(fmtDate(d))}"></i>`).join("")}</div>
  <div class="heat-leg"><span>menos</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>más</span></div>`; };
const stHbar = (label, pct, right = "") => `<div class="hbar"><span class="hl">${label}</span><span class="ht"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></span><span class="hv">${right || pct + "%"}</span></div>`;
const VIEWS = {
  inicio() {
    const d = ROUTINE[new Date().getDay()];
    const doneToday = S.logs.gym.some((l) => l.date === today());
    const ws = sortedWeights();
    const lastW = ws[ws.length - 1];
    const hour = new Date().getHours();
    const hi = hour < 6 ? "Buenas noches" : hour < 12 ? "Buen día" : hour < 20 ? "Buenas tardes" : "Buenas noches";
    const dates = weekDates();
    const gymWeek = dates.filter(gymDone).length;
    const trainDays = 7;   // los 7 días cuentan, también el de flexibilidad
    const dom = Object.values(S.waza).filter((v) => v === 2).length;
    const bestLang = S.langs.map((l) => ({ l, n: streakOf(l.days) })).sort((a, b) => b.n - a.n)[0];
    const active = S.projects.filter((p) => p.status === "Activo");
    const study = S.study.filter((s) => !s.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")).slice(0, 4);
    const G = goals();
    const nowKg = lastW ? +lastW.kg : G.now;
    const startKg = ws.length > 1 ? +ws[0].kg : G.now;
    const pct = nowKg != null && startKg != null && G.walking !== startKg ? Math.max(0, Math.min(100, ((nowKg - startKg) / (G.walking - startKg)) * 100)) : 0;
    return `
    ${head(`${hi}, Manu`, "Esto es lo que tenés hoy.", "", new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }))}
    <div class="bento">
      <div class="card hero c-8">
        <div class="card-head" style="margin-bottom:0"><span class="label-sm" style="color:var(--accent)">Hoy toca</span>${tag(d.tag)}</div>
        <h2>${sessionName(d)}</h2>
        <div class="meta">${d.sub ? `<span class="muted">${esc(d.sub)}</span>` : ""}<span class="sub mono small muted">${esc(blockLabel())}</span></div>
        ${exList(d)}
        <div class="hero-actions">
          ${d.items.length ? `<button class="btn k-${kindOfDay(d)} ${doneToday ? "btn-done" : "btn-primary"}" data-act="done-today" title="${doneToday ? "Tocá para deshacer" : ""}">${doneToday ? "✓ Hecho hoy" : "Marcar como hecho"}</button>` : ""}
          <a class="btn" href="#rutina">Ver detalle</a>
          <a class="btn btn-ghost" href="${PLAN73}" target="_blank" rel="noopener">Plan-73 ↗</a>
        </div>
      </div>
      <div class="c-4 side stack">
        <div class="card summary">
          <a class="srow" href="#fisico"><span class="sl">Peso</span><span class="sv">${nowKg ?? "—"}<small>kg</small></span><span class="sd">meta ${esc(G.walkingTxt)} caminando</span><span class="bar"><i style="width:${pct}%"></i></span></a>
          <button class="srow" type="button" data-act="open-cal" title="Abrir el calendario para ver y marcar días"><span class="sl">Esta semana</span><span class="sv">${gymWeek}<small>/ ${trainDays}</small></span><span class="sd">días de entreno · tocá para marcar</span><span class="bar"><i style="width:${Math.min(100, (gymWeek / trainDays) * 100)}%"></i></span></button>
          <a class="srow" href="#judo"><span class="sl">Técnicas de judo</span><span class="sv">${dom}<small>/ 100</small></span><span class="sd">dominadas</span><span class="bar"><i style="width:${dom}%"></i></span></a>
          <a class="srow" href="#idiomas"><span class="sl">Idiomas</span><span class="sv">${bestLang ? bestLang.n : "—"}${bestLang ? "<small>días</small>" : ""}</span><span class="sd">${bestLang ? `racha en ${esc(bestLang.l.name)}` : "agregá un idioma"}</span></a>
        </div>
        <p class="quote-line">“${esc(JUDO_QUOTES[quoteIdx][0])}”<b>${esc(JUDO_QUOTES[quoteIdx][1])}</b></p>
      </div>
    </div>
    <div class="bento"><div class="c-12">${gymCal({ mark: false, nav: false, go: true, head: false })}</div></div>
    ${platoCard()}
    <div class="bento">
      ${tasksCard(null, "Tareas", "c-6")}
      <div class="card c-6">
        <div class="card-head"><h2>Ideas</h2><a href="#ideas" class="sub">ver todas (${S.ideas.length})</a></div>
        <ul class="list">${S.ideas.slice(0, 6).map((i) => `<li><span class="grow">${esc(i.text)}</span>${i.tag !== "general" ? tag(i.tag) : ""}</li>`).join("") || `<li class="empty">Usá la barra de arriba para anotar una idea. Se guarda sola.</li>`}</ul>
      </div>
    </div>
    <div class="bento">
      <div class="card c-6">
        <div class="card-head"><h2>Proyectos activos</h2><a href="#proyectos" class="sub">ver</a></div>
        ${active.map((p) => {
          const pc = p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0;
          return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><b style="font-weight:500">${esc(p.name)}</b><span class="sub small muted">${pc}%</span></div><div class="progress"><div style="width:${pc}%"></div></div></div>`;
        }).join("") || `<p class="empty">Ninguno activo.</p>`}
      </div>
      <div class="card c-6">
        <div class="card-head"><h2>Estudio</h2><a href="#estudio" class="sub">ver</a></div>
        <ul class="list">${study.map((s) => `<li><span class="grow"><b style="font-weight:500">${esc(s.subject)}</b> · ${esc(s.text)}</span><span class="small muted">${fmtDate(s.due)}</span></li>`).join("") || `<li class="empty">Nada pendiente.</li>`}</ul>
      </div>
    </div>
    <p class="getout"><b>Get out there.</b><span>El propósito del conocimiento es la acción, no el conocimiento.</span><em>«¿Quieres ser un joseador? Corre, sal ahí fuera y josea, sal ahí afuera y josea.»</em></p>`;
  },

  rutina() {
    const cur = currentBlock();
    const b = shownBlock();
    // Si estás mirando otro bloque, armo la semana con ese bloque
    const R = (b && cur && b.id !== cur.id && routineFor(b)) || ROUTINE;
    const d = R[selDay];
    const selDate = weekDates(weekOff)[[1, 2, 3, 4, 5, 6, 0].indexOf(selDay)], selDone = gymDone(selDate), selFuture = selDate > today();
    let detail = "";
    if (isLift(d)) {
      const warm = PLAN?.stretch?.warm || [];
      const str = stretchFor(d.letter);
      const rowList = (rows, cols) => `<ul class="mini-rows">${rows.map((r) => `<li><b>${esc(r[0].join(" "))}</b><span class="mono">${esc((r[cols[0]] || []).join(" "))}</span>${cols[1] && r[cols[1]]?.length ? `<span class="muted">${esc(r[cols[1]].join(" "))}</span>` : ""}</li>`).join("")}</ul>`;
      const phase = (txt, cls, body) => body ? `<details class="phase-d ${cls}"><summary class="phase ${cls}">${esc(txt)}</summary>${body}</details>` : `<div class="phase ${cls}">${esc(txt)}</div>`;
      detail = `
        ${PLAN?.W ? phase(PLAN.W, "", warm.length ? rowList(warm, [1, 2]) : "") : ""}
        <div class="table-wrap"><table class="ex-table">
          <thead><tr><th>#</th><th>Ejercicio</th><th class="num">Series × reps</th><th>Nota</th></tr></thead>
          <tbody>${d.items.map((i, n) => `<tr class="${i.key ? "key" : ""}"><td>${String(n + 1).padStart(2, "0")}</td><td class="n">${esc(i.n)}${kindTag(i)}</td><td class="num rx">${esc(i.rx || "")}</td><td class="note">${esc(i.note || "")}</td></tr>`).join("")}</tbody>
        </table></div>
        ${PLAN?.SS?.[d.letter] ? phase(PLAN.SS[d.letter], "str", str.length ? rowList(str.map((z) => [[z[1].join(" ")], z[2], z[0]]), [1, 2]) : "") : ""}`;
    } else if (isSprint(d) && PLAN?.sprints?.days?.[d.dkey]) {
      const sp = PLAN.sprints, day = sp.days[d.dkey];
      const fold = (title, body) => body ? `<details class="more"><summary>${esc(title)}</summary><div class="plan-html">${body}</div></details>` : "";
      const usesLong = PLAN.rest?.html && /flexib|sesi[oó]n (larga|base)/i.test(day.html + d.sub);
      detail = `
        ${fold(sp.warm?.title || "Calentamiento", sp.warm?.html)}
        ${fold(sp.prep?.title || "Preparación", sp.prep?.html)}
        <div class="plan-html"><h4>${esc(day.title)}</h4>${day.html}</div>
        ${usesLong ? fold(PLAN.rest.title, PLAN.rest.html) : ""}
        ${fold("Reglas de los días atléticos", sp.rules?.replace(/^\s*<h4>.*?<\/h4>/, ""))}`;
    } else if (isOff(d)) {
      // Día sin gimnasio: si Plan-73 le pone flexibilidad, muestro la sesión base y lo propio del día
      const flex = /flexib|movilidad|estir/i.test(d.title + d.sub) && PLAN?.rest?.html;
      const own = PLAN?.sprints?.days?.[d.dkey];
      detail = `
        ${flex || own ? "" : `<p class="muted" style="margin:14px 0 0">Hoy no se entrena.</p>`}
        ${flex ? `<div class="plan-html"><h4>${esc(PLAN.rest.title)}</h4>${PLAN.rest.html}</div>` : ""}
        ${own ? `<div class="plan-html"><h4>${esc(own.title)}</h4>${own.html}</div>` : ""}
        ${PLAN?.rest?.passive ? `<div class="plan-html"><h4>${esc(PLAN.rest.passive.title)}</h4>${PLAN.rest.passive.html}</div>` : ""}`;
    } else {
      detail = exList(d);
    }
    const html = `
    ${head("Gym", PLAN?.updated ? esc(PLAN.updated) : "Plan-73: fuerza y potencia para judo −73 kg.",
      `${warnBadge()}<a class="btn" href="${PLAN73}" target="_blank" rel="noopener">Abrir Plan-73 ↗</a>`, "Plan-73")}
    ${PLAN ? `<div class="filters">${PLAN.blocks.map((x) => `<button class="chip ${x.id === b.id ? "on" : ""}" data-act="sel-block" data-block="${x.id}">${esc(x.name)}<span class="muted small mono">${esc(x.weeks)}</span>${x.id === cur.id ? `<span class="dot" style="background:var(--accent)" title="Bloque actual en Plan-73"></span>` : ""}</button>`).join("")}</div>` : ""}
    <div class="bento"><div class="c-12">${gymCal({ sel: selDay, R })}</div></div>
    <div class="bento">
      <div class="card c-8">
        <div class="card-head">
          <div><span class="label-sm">${dateLong(selDate)}${selDate === today() ? " · hoy" : ""}</span><h2 style="font-size:22px;margin-top:6px">${sessionName(d)}</h2>${d.sub ? `<div class="muted" style="margin-top:4px">${esc(d.sub)}</div>` : ""}</div>
          <div class="card-head-r">${tag(d.tag)}${!selFuture ? `<button class="btn btn-sm k-${kindOfDay(d)} ${selDone ? "btn-done" : "btn-primary"}" type="button" data-act="gym-day" data-date="${selDate}" title="${selDone ? "Tocá para deshacer" : "Marcar este día como hecho"}">${selDone ? "✓ Hecho" : "Marcar como hecho"}</button>` : ""}</div>
        </div>
        ${detail}
      </div>
      <div class="c-4 side stack">
        ${b ? `<div class="card"><span class="label-sm">${esc(b.name)} · ${esc(b.weeks)}</span><h2 style="margin:6px 0 8px">${esc(b.title)}</h2><p class="muted" style="margin:0">${esc(b.intro || "")}</p></div>` : ""}
        ${PLAN?.rules ? `<div class="card"><div class="card-head"><h2>La semana</h2></div><div class="plan-html">${PLAN.rules}</div></div>` : ""}
        ${PLAN?.exec && Object.values(PLAN.exec).some(Boolean) ? `<div class="card"><div class="card-head"><h2>Cómo se ejecuta</h2></div>${["rpe", "rest", "prog"].map((k) => PLAN.exec[k] ? `<details class="more"><summary>${esc(PLAN.exec[k].title)}</summary><div class="plan-html">${PLAN.exec[k].html}</div></details>` : "").join("")}</div>` : ""}
        ${notesCard("rutina")}
      </div>
    </div>`;
    return html;
  },

  judo() {
    const q = JUDO_QUOTES[quoteIdx];
    const all = WAZA_GROUPS.flatMap((g) => g.items);
    const dom = all.filter((n) => S.waza[n] === 2).length;
    const learn = all.filter((n) => S.waza[n] === 1).length;
    return `
    <div class="judo-hero">
      <div class="jh-kanji" aria-hidden="true">柔道</div>
      <div>
        <div class="kicker">Jūdō · el camino de la suavidad</div>
        <blockquote class="jh-quote">${esc(q[0])}</blockquote>
        <div class="jh-src"><span>${esc(q[1])}</span><button class="btn btn-sm btn-ghost" data-act="next-quote">Otra frase →</button></div>
      </div>
    </div>
    <div class="pillars-line">
      ${PILLARS.map((p) => `<div class="pl-item"><span class="kj" lang="ja">${p.kanji}</span><span class="rm">${p.romaji}</span><b>${p.name}</b><span class="gl">${p.glyphs}</span><span class="ex">${p.short}</span></div>`).join("")}
    </div>
    <div class="card" style="margin-top:28px">
      <div class="card-head">
        <div><h2>Las 100 técnicas del Kodokan</h2><span class="small muted">68 nage-waza + 32 katame-waza. Tocá el estado para marcar tu progreso.</span></div>
        <div class="waza-total"><span><b>${dom}</b> dominadas</span><span><b>${learn}</b> aprendiendo</span><div class="progress" style="width:140px"><div style="width:${dom}%"></div></div></div>
      </div>
      <div class="filters" id="waza-filters">${wazaFilters()}</div>
      <div id="waza-list">${wazaList()}</div>
      <p class="small muted" style="margin:18px 0 0">Cinturones según el Gokyo (un grupo por cinturón); las técnicas fuera del Gokyo van donde se suelen enseñar. El programa exacto puede cambiar según tu dojo o federación.</p>
    </div>
    <div class="bento" style="margin-top:16px">${notesCard("judo", "Notas de judo", "c-12")}</div>`;
  },

  fisico() {
    const pts = sortedWeights().reverse();
    const first = pts[pts.length - 1], last = pts[0];
    const diff = first && last ? (last.kg - first.kg).toFixed(1) : "—";
    const G = goals();
    // Ritmo real: kg por semana entre el primer y el último pesaje
    const weeks = first && last ? (new Date(last.date) - new Date(first.date)) / 6048e5 : 0;
    const perWeek = weeks >= 1 ? ((last.kg - first.kg) / weeks).toFixed(2).replace(".", ",") : null;
    const N = PLAN?.nutrition, ST = PLAN?.strength;
    return `
    ${head("Cambio físico", `Metas de Plan-73 · ${esc(G.rateTxt)}.`, warnBadge())}
    <div class="kpis row4" style="margin-bottom:16px">
      <div class="kpi"><span class="label-sm">Peso actual</span><div class="v">${last ? last.kg : G.now ?? "—"}<small>kg</small></div><div class="d">${last ? fmtDate(last.date) : G.nowTxt ? "según Plan-73" : ""}</div></div>
      <div class="kpi"><span class="label-sm">Cambio total</span><div class="v">${diff > 0 ? "+" : ""}${diff}<small>kg</small></div><div class="d">${perWeek ? `${perWeek} kg/semana · meta ${esc(G.rate)}` : `meta ${esc(G.rate)} kg/semana`}</div></div>
      <div class="kpi"><span class="label-sm">Meta caminando</span><div class="v">${esc(G.walkingTxt.replace(/\s*kg$/, ""))}<small>kg</small></div></div>
      <div class="kpi"><span class="label-sm">Categoría</span><div class="v">−${G.weight}<small>kg</small></div><div class="d">peso de competencia</div></div>
    </div>
    <div class="bento">
      <div class="c-8 stack">
      <div class="card">
        <div class="card-head"><h2>Evolución del peso</h2></div>
        ${weightChart()}
        <form class="form-grid" data-form="weight" style="margin-top:14px">
          ${fieldHTML({ k: "date", label: "Fecha", type: "date" })}
          ${fieldHTML({ k: "kg", label: "Peso (kg)", type: "number", step: "0.1", req: true })}
          ${fieldHTML({ k: "note", label: "Nota", ph: "en ayunas" })}
          <div class="field" style="align-self:end"><button class="btn btn-primary">Agregar pesaje</button></div>
        </form>
      </div>
      <div class="card">
        <div class="card-head"><h2>Pesajes</h2><span class="sub">${pts.length}</span></div>
        <p class="small muted" style="margin:-6px 0 10px">Tus pesajes se anotan acá. Las metas salen solas de Plan-73: si las cambiás allá, cambian acá.</p>
        <div class="table-wrap"><table><thead><tr><th>Fecha</th><th class="num">Kg</th><th>Nota</th><th></th></tr></thead><tbody>
          ${pts.map((p) => `<tr><td>${fmtDate(p.date)}</td><td class="num">${esc(p.kg)}</td><td>${esc(p.note)}</td><td><button class="del" data-act="del-weight" data-id="${p.id}">✕</button></td></tr>`).join("") || `<tr><td colspan="4" class="empty">Sin pesajes.</td></tr>`}
        </tbody></table></div>
      </div>
      </div>      <div class="c-4 side stack">
        ${N?.daily?.length ? `<div class="card"><div class="card-head"><h2>Números diarios</h2><span class="sub">Plan-73</span></div>
          <ul class="mini-rows">${N.daily.map((r) => `<li><span class="lbl">${esc(r[0].join(" "))}</span><span class="val">${esc((r[1] || []).join(" "))}</span></li>`).join("")}</ul></div>` : ""}
        ${N?.control ? `<div class="card"><div class="card-head"><h2>Control de peso</h2></div><div class="plan-html" style="margin:0">${N.control}</div></div>` : ""}
        ${tasksCard("fisico")}
        ${notesCard("fisico")}
      </div>
    </div>
    ${ST?.rows?.length ? `<div class="bento"><div class="card c-12">
      <div class="card-head"><h2>${esc(ST.title || "Objetivos de fuerza")}</h2><span class="sub">Plan-73</span></div>
      <div class="table-wrap"><table><thead><tr>${ST.head.map((h, i) => `<th${i === 2 ? ' class="num"' : ""}>${esc(h)}</th>`).join("")}</tr></thead><tbody>
        ${ST.rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 2 ? ' class="num"' : ""}>${esc(c.join(" "))}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
    </div></div>` : ""}`;
  },

  surf() {
    return `
    ${head("Surf", "Spots y notas.")}
    <div class="bento">
      ${checklist("spots", "Spots (✓ = ya surfeado)", "Ej: Los Dedos", "c-6")}
      ${notesCard("surf", "Notas de surf", "c-6")}
    </div>`;
  },

  comida() {
    const N = PLAN?.nutrition, days = N?.days || [], dow = new Date().getDay();
    const WD = ["domingo", "lunes", "martes", "mi[ée]rcoles", "jueves", "viernes", "s[áa]bado"];
    const has = (txt, d) => new RegExp("\\b" + WD[d] + "\\b", "i").test(txt);
    const ti = days.findIndex((x) => has(`${x.title} ${x.sub}`, dow));       // el día armado que corresponde a hoy
    const sel = Math.min(foodSel ?? Math.max(ti, 0), Math.max(days.length - 1, 0)), D = days[sel], isToday = sel === ti;
    const cook = N?.cook || [], cookToday = cook.find((c) => has(c.label, dow));
    const cell = (c) => (c || []).join(" ");
    const isTotal = (r) => /^total$/i.test(cell(r[0]).trim());
    const meta = (re) => (N?.daily || []).find((r) => re.test(cell(r[0])));
    const mK = meta(/calor/i), mP = meta(/prote/i), planned = ROUTINE[dow];
    const totalRow = D?.rows.find(isTotal);
    return `
    ${head("Comida", "Qué comer hoy, con la receta de cada cosa. Todo sale de Plan-73.", warnBadge())}
    ${!D ? `<div class="card"><p class="empty">${PLAN ? "Plan-73 no tiene días de comida armados." : "Cargando Plan-73…"}</p></div>` : `
    ${cookToday ? `<div class="card cook-today" style="margin-bottom:16px"><div class="card-head"><span class="label-sm">Hoy se cocina · ${DAY_NAMES[dow]}</span></div><div class="plan-html" style="margin:0">${cookToday.html}</div></div>` : ""}
    <div class="bento">
      <div class="c-8 stack">
      <div class="card">
        <div class="card-head"><div>
          <span class="label-sm">${isToday ? `Hoy · ${DAY_NAMES[dow]}${planned && !isOff(planned) ? ` · entrenás ${esc(planned.title)}` : ""}` : "Otro día"}</span>
          <h2 style="font-size:22px;margin-top:6px">${esc(D.title)}</h2>
          ${D.sub ? `<div class="muted" style="margin-top:4px">${esc(D.sub)}</div>` : ""}
        </div></div>
        <p class="tip-line" style="margin:-4px 0 0">Tocá una comida para ver qué lleva y cómo se hace.</p>
        <div class="meals">
          ${D.rows.map((r, i) => (isTotal(r) ? "" : `<button class="meal" type="button" data-act="recipe" data-d="${sel}" data-r="${i}"><span class="ms">${esc(cell(r[0]))}</span><span class="mn">${esc(cell(r[1]))}</span><span class="mk">${esc(cell(r[2]))}</span><span class="mgo" aria-hidden="true">›</span></button>`)).join("")}
        </div>
        ${totalRow ? `<div class="meal-total"><span>Total del día</span><span class="mono">${esc(fmtNums(cell(totalRow[2])))}</span></div>` : ""}
        <div class="filters" style="margin:12px 0 0"><span class="small muted">Ver otro día:</span>
          ${days.map((x, i) => `<button class="chip ${i === sel ? "on" : ""}" type="button" data-act="food-day" data-i="${i}">${esc(x.title)}${i === ti ? `<span class="dot" style="background:var(--accent)" title="Es el de hoy"></span>` : ""}</button>`).join("")}
        </div>
      </div>
      ${N?.options?.length ? `<div class="card">
        <div class="card-head"><h2>Recetas y opciones para elegir</h2><span class="sub">Tocá una para ver todas</span></div>
        <div class="rcats">${N.options.map((o, gi) => `<button class="rcat" type="button" data-act="recipes" data-g="${gi}"><b>${esc(o.title)}</b><span class="muted small">${o.rows.length} opciones</span><span class="rcat-ex">${esc(o.rows.slice(0, 3).map((r) => cell(r[0])).join(" · "))}…</span></button>`).join("")}</div>
      </div>` : ""}
      </div>
      <div class="c-4 side stack">
        <div class="card"><div class="card-head"><h2>Meta del día</h2><span class="sub">Plan-73</span></div>
          <div class="goal">
            ${mK ? `<div><span class="label-sm">Calorías</span><b>${esc(cell(mK[1]))}</b></div>` : ""}
            ${mP ? `<div><span class="label-sm">Proteína</span><b>${esc(cell(mP[1]))}</b></div>` : ""}
          </div>
          ${N?.slots?.length ? `<span class="label-sm" style="display:block;margin:14px 0 6px">Cómo se arma el día</span>
          <ul class="mini-rows">${N.slots.map((r) => `<li><span class="lbl">${esc(cell(r[0]))}</span><span class="val">${esc(cell(r[1]))}</span><span class="mono">${esc(cell(r[2]))}</span></li>`).join("")}</ul>` : ""}
          <a class="small" href="#habitos">Chequear los números de hoy en Hábitos →</a>
        </div>
        ${cook.length ? `<div class="card"><div class="card-head"><h2>Cocina de la semana</h2><span class="sub">Plan-73</span></div>
          <ul class="cook">${cook.map((c) => `<li class="${c === cookToday ? "today" : ""}"><b>${esc(c.label)}:</b> ${c.html}</li>`).join("")}</ul></div>` : ""}
        ${notesCard("comida", "Notas de comida")}
      </div>
    </div>`}`;
  },

  calendario() {
    const t = today(), ym = calMonth || t.slice(0, 7), sel = calSel || t;
    const [Y, M] = ym.split("-").map(Number);
    const first = new Date(Y, M - 1, 1), nDays = new Date(Y, M, 0).getDate(), lead = (first.getDay() + 6) % 7;
    const total = Math.ceil((lead + nDays) / 7) * 7;
    const dowOf = (d) => new Date(d + "T12:00:00").getDay();
    const on = (date) => ({ tasks: S.tasks.filter((x) => x.due === date), study: S.study.filter((x) => x.due === date), kg: S.weights.filter((w) => w.date === date) });
    const pillsOf = (o) => [
      ...o.tasks.map((x) => ({ c: "t", t: x.text, done: x.done })),
      ...o.study.map((x) => ({ c: "s", t: `${x.subject}: ${x.text}`, done: x.done })),
      ...o.kg.map((w) => ({ c: "w", t: `${String(w.kg).replace(".", ",")} kg`, done: false })),
    ];
    const monthName = first.toLocaleDateString("es-UY", { month: "long", year: "numeric" }).toLowerCase().replace(/^./, (c) => c.toUpperCase());
    const cells = [...Array(total)].map((_, i) => {
      const date = iso(new Date(Y, M - 1, 1 - lead + i)), d = ROUTINE[dowOf(date)], ps = pillsOf(on(date)), done = gymDone(date);
      return `<button class="mc ${date.slice(0, 7) !== ym ? "out" : ""} ${date === t ? "today" : ""} ${date === sel ? "sel" : ""}" type="button" data-act="cal-day" data-date="${date}" aria-label="${esc(dateLong(date))}">
        <span class="mc-top"><b>${+date.slice(8)}</b><span class="mc-g k-${kindOfDay(d)} ${done ? "on" : ""} ${isOff(d) ? "rest" : ""}" title="${esc(d.title)}">${done ? "✓" : esc(letterOf(d))}</span></span>
        <span class="mc-items">${ps.slice(0, 2).map((p) => `<span class="mc-p ${p.c} ${p.done ? "done" : ""}">${esc(p.t)}</span>`).join("")}${ps.length > 2 ? `<span class="mc-more">+${ps.length - 2} más</span>` : ""}</span>
        <span class="mc-dots">${ps.slice(0, 4).map((p) => `<i class="${p.c}"></i>`).join("")}</span>
      </button>`;
    }).join("");
    // Panel del día elegido
    const o = on(sel), dR = ROUTINE[dowOf(sel)], future = sel > t;
    const hs = habitList();
    const hn = hs.filter((h) => (h.gym ? gymDone(sel) : (S.habits[sel] || []).includes(h.key))).length;
    const undated = S.tasks.filter((x) => !x.due && !x.done);
    return `
    ${head("Calendario", "Todo junto: entrenos, tareas, entregas de estudio y pesajes. Tocá un día para ver o agregar.", warnBadge())}
    <div class="bento">
      <div class="card c-8">
        <div class="cal-head">
          <button class="hnav" type="button" data-act="cal-nav" data-dir="-1" aria-label="Mes anterior">‹</button>
          <b>${esc(monthName)}</b>
          ${calMonth && calMonth !== t.slice(0, 7) ? `<button class="btn btn-sm btn-ghost" type="button" data-act="cal-nav" data-dir="0">Ir a hoy</button>` : ""}
          <button class="hnav" type="button" data-act="cal-nav" data-dir="1" aria-label="Mes siguiente">›</button>
        </div>
        <div class="cal-dow">${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((x) => `<span>${x}</span>`).join("")}</div>
        <div class="cal-grid">${cells}</div>
        <div class="cal-legend">
          <span><i class="gl">A</i>Entreno del día (✓ si lo hiciste)</span><span><i class="k k-gym"></i>Gimnasio</span><span><i class="k k-ath"></i>Atlético</span><span><i class="k k-flex"></i>Flexibilidad</span><span><i class="t"></i>Tareas</span><span><i class="s"></i>Estudio</span><span><i class="w"></i>Pesaje</span>
        </div>
      </div>
      <div class="c-4 side stack">
        <div class="card">
          <div class="card-head"><div><span class="label-sm">${sel === t ? "Hoy" : future ? "Más adelante" : "Día pasado"}</span><h2 style="font-size:20px;margin-top:6px">${esc(dateLong(sel))}</h2></div></div>
          <div class="cd-sec"><span class="label-sm">Entreno</span>
            <div class="cd-row"><span class="lt-s">${esc(letterOf(dR))}</span><span class="grow">${esc(dR.title)}${dR.sub ? `<span class="muted small" style="display:block">${esc(dR.sub)}</span>` : ""}</span>
              ${!future ? `<button class="btn btn-sm k-${kindOfDay(dR)} ${gymDone(sel) ? "btn-done" : "btn-primary"}" type="button" data-act="gym-day" data-date="${sel}">${gymDone(sel) ? "✓ Hecho" : "Marcar hecho"}</button>` : `<span class="small muted">planificado</span>`}
            </div>
          </div>
          <div class="cd-sec"><span class="label-sm">Para hacer este día</span>
            <ul class="list">
              ${o.tasks.map((x) => `<li class="${x.done ? "done" : ""}"><input type="checkbox" data-act="toggle-task" data-id="${x.id}" ${x.done ? "checked" : ""} aria-label="Hecho" /><span class="grow">${esc(x.text)}</span><button class="del" data-act="del-task" data-id="${x.id}" title="Borrar">✕</button></li>`).join("")}
              ${o.study.map((x) => `<li class="${x.done ? "done" : ""}"><input type="checkbox" data-act="toggle-study" data-id="${x.id}" ${x.done ? "checked" : ""} aria-label="Hecho" /><span class="grow"><b style="font-weight:500">${esc(x.subject)}</b> · ${esc(x.text)}</span><span class="tag estudio">Estudio</span></li>`).join("")}
              ${o.tasks.length + o.study.length ? "" : `<li class="empty" style="background:none">Nada para este día.</li>`}
            </ul>
          </div>
          ${o.kg.length ? `<div class="cd-sec"><span class="label-sm">Pesaje</span><span>${o.kg.map((w) => `${String(w.kg).replace(".", ",")} kg${w.note ? ` · ${esc(w.note)}` : ""}`).join(" · ")}</span></div>` : ""}
          ${!future ? `<div class="cd-sec"><span class="label-sm">Hábitos</span><a href="#habitos">${hn} de ${hs.length} cumplidos →</a></div>` : ""}
          <form class="inline" data-form="cal-task" data-date="${sel}" style="margin-top:16px">
            <input name="text" placeholder="Agregar algo para este día…" required /><button class="btn btn-primary">Agregar</button>
          </form>
        </div>
        ${undated.length ? `<div class="card"><div class="card-head"><h2>Sin fecha</h2><span class="sub">${undated.length}</span></div>
          <p class="small muted" style="margin:-6px 0 10px">Elegí una fecha y la tarea aparece en el calendario.</p>
          <ul class="list">${undated.slice(0, 8).map((x) => `<li><span class="grow">${esc(x.text)}</span><input type="date" data-act="task-due" data-id="${x.id}" aria-label="Ponerle fecha a: ${esc(x.text)}" style="flex:0 0 140px" /></li>`).join("")}</ul></div>` : ""}
      </div>
    </div>`;
  },

  diario() {
    const all = S.journal, nDays = new Set(all.map((e) => e.date)).size;
    return `
    ${head("Diario", "Todo lo que pensás, en un solo lugar. Escribí lo que quieras: se guarda solo.")}
    <div class="bento">
      <div class="card c-12 jnew">
        <form data-form="journal">
          <textarea name="text" rows="5" placeholder="¿Qué tenés en la cabeza hoy? Escribí lo que quieras…" aria-label="Nueva entrada" required>${esc(lsGet(J_DRAFT) || "")}</textarea>
          <div class="jnew-row">
            <label class="small muted">Fecha <input type="date" name="date" value="${today()}" max="${today()}" /></label>
            <span class="grow"></span>
            <span class="small muted jhint">Ctrl + Enter para guardar</span>
            <button class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
    <div class="bento">
      <div class="card c-12">
        <div class="card-head"><h2>Mis entradas</h2><span class="sub">${all.length} ${all.length === 1 ? "entrada" : "entradas"} · ${nDays} ${nDays === 1 ? "día" : "días"}</span></div>
        ${all.length ? `<input id="j-q" type="search" placeholder="Buscar en mi diario…" value="${esc(jQ)}" aria-label="Buscar en mi diario" autocomplete="off" style="margin-bottom:6px" />` : ""}
        <div id="j-list">${journalList(jQ)}</div>
      </div>
    </div>`;
  },

  pinterest() {
    const tags = [...new Set(S.pins.map((p) => p.tag).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
    if (pinTag && !tags.includes(pinTag)) pinTag = "";
    const shown = S.pins.filter((p) => !pinTag || p.tag === pinTag);
    const wide = shown.filter((p) => p.kind !== "pin"), pins = shown.filter((p) => p.kind === "pin");
    const view = $("#view"), cs = getComputedStyle(view), inner = view.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const bw = Math.max(200, Math.min(440, Math.floor(inner) - 4));   // el tablero ocupa el ancho disponible (sin pasarse en el celular)
    const card = (p) => {
      const a = p.kind === "pin"
        ? `<a data-pin-do="embedPin" data-pin-width="small" href="${esc(p.url)}">Ver este pin en Pinterest ↗</a>`
        : `<a data-pin-do="${p.kind === "user" ? "embedUser" : "embedBoard"}" data-pin-board-width="${bw}" data-pin-scale-height="260" data-pin-scale-width="80" href="${esc(p.url)}">${p.kind === "user" ? "Ver el perfil" : "Ver el tablero"} en Pinterest ↗</a>`;
      return `<div class="pinw">${a}<button class="pin-x" type="button" data-act="del-pin" data-id="${p.id}" title="Quitar de acá" aria-label="Quitar">✕</button>${p.tag ? `<span class="pin-tag">${esc(p.tag)}</span>` : ""}</div>`;
    };
    const chip = (id, label, n) => `<button class="chip ${pinTag === id ? "on" : ""}" type="button" data-act="pin-tag" data-t="${esc(id)}">${esc(label)}<span class="muted small mono">${n}</span></button>`;
    return `
    ${head("Pinterest", "Tus pins, tableros y perfil, todos juntos. Pegá el link y se ven acá.")}
    <div class="bento"><div class="card c-12">
      <form class="pin-form" data-form="pin" autocomplete="off">
        <textarea name="links" rows="2" placeholder="Pegá uno o varios links de Pinterest: un pin, un tablero o tu perfil…" required></textarea>
        <div class="row">
          <input name="tag" list="pin-tags" placeholder="Etiqueta (opcional): Fitness, Eventos…" maxlength="30" />
          <datalist id="pin-tags">${tags.map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>
          <button class="btn btn-primary">Agregar</button>
        </div>
        <p class="small muted" style="margin:0">En Pinterest: abrí el pin, tocá ⋯ y elegí “Copiar enlace”. Si el link empieza con <b>pin.it</b> no lo puedo leer: abrí el pin en la computadora y copiá la dirección de la barra. Para ver todo lo tuyo de una, pegá el link de tu perfil.</p>
      </form>
    </div></div>
    ${S.pins.length ? `<div class="filters" style="margin:4px 0 16px">${chip("", "Todo", S.pins.length)}${tags.map((t) => chip(t, t, S.pins.filter((p) => p.tag === t).length)).join("")}</div>` : ""}
    <div id="pins-wrap">
      ${wide.length ? `<h2 class="pin-h">Tableros y perfil</h2><div class="pin-boards">${wide.map(card).join("")}</div>` : ""}
      ${pins.length ? `<h2 class="pin-h">Pins <span class="sub">${pins.length}</span></h2><div class="pin-grid">${pins.map(card).join("")}</div>` : ""}
      ${S.pins.length ? "" : `<div class="card"><p class="empty">Todavía no agregaste nada. Pegá arriba el link de un pin, de un tablero o de tu perfil de Pinterest.</p></div>`}
    </div>`;
  },

  media() {
    const tags = [...new Set(S.media.map((m) => m.tag).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
    if (mediaTag && !tags.includes(mediaTag)) mediaTag = "";
    const shown = S.media.filter((m) => !mediaTag || m.tag === mediaTag);
    const chip = (id, label, n) => `<button class="chip ${mediaTag === id ? "on" : ""}" type="button" data-act="media-tag" data-t="${esc(id)}">${esc(label)}<span class="muted small mono">${n}</span></button>`;
    const tile = (m) => {
      const miss = mediaReady && !mediaLocal.has(m.id);
      return `<button class="mimg ${miss ? "miss" : ""}" type="button" data-act="media-open" data-id="${m.id}" style="aspect-ratio:${m.w} / ${m.h}" aria-label="Abrir foto${m.tag ? ` (${esc(m.tag)})` : ""}"><img data-mid="${m.id}" alt="" />${miss ? `<span class="mwait">Bajando…</span>` : ""}${m.tag ? `<span class="mtag">${esc(m.tag)}</span>` : ""}</button>`;
    };
    return `
    ${head("Fotos", "Tus fotos, todas juntas. Pegalas con Ctrl + V, arrastralas o elegilas: se guardan y se sincronizan.")}
    <div class="bento"><div class="card c-12">
      <div class="mdrop" id="mdrop">
        <b>Pegá tus fotos acá</b>
        <span class="muted">Copiá una imagen y apretá <kbd>Ctrl</kbd> + <kbd>V</kbd> · o arrastrala hasta acá · o</span>
        <button class="btn btn-primary" type="button" data-act="media-pick">Elegir fotos</button>
        <input id="media-file" type="file" accept="image/*" multiple hidden />
      </div>
      <div class="mrow">
        <input id="media-tag" list="media-tags" value="${esc(mediaTag)}" placeholder="Etiqueta para las que agregues (opcional): Inspiración, Eventos…" maxlength="30" aria-label="Etiqueta para las fotos nuevas" />
        <datalist id="media-tags">${tags.map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>
      </div>
      <p class="small muted" id="media-status" style="margin:10px 0 0">${mediaStatus()}</p>
    </div></div>
    ${S.media.length ? `<div class="filters" style="margin:4px 0 16px">${chip("", "Todas", S.media.length)}${tags.map((t) => chip(t, t, S.media.filter((m) => m.tag === t).length)).join("")}</div>` : ""}
    ${shown.length ? `<div class="mgrid">${shown.map(tile).join("")}</div>` : `<div class="card"><p class="empty">${S.media.length ? "No hay fotos con esa etiqueta." : "Todavía no hay fotos. Copiá una imagen (una captura, una foto del celular) y pegala acá con Ctrl + V."}</p></div>`}`;
  },

  lectura() {
    const yr = String(new Date().getFullYear()), B = S.books;
    const reading = B.filter((b) => b.status === "reading"), want = B.filter((b) => b.status === "want"), done = B.filter((b) => b.status === "done");
    const doneYear = done.filter((b) => (b.finished || "").startsWith(yr)), pagesYear = doneYear.reduce((s, b) => s + (b.pages || 0), 0);
    const goal = S.readGoal || 12, goals = [...new Set([6, 10, 12, 15, 20, 24, 30, 40, 52, goal])].sort((a, b) => a - b);
    const streak = streakOf(S.readDays), readToday = S.readDays.includes(today());
    const tile = (b) => `<button class="book" type="button" data-act="book-open" data-id="${b.id}">${bookCover(b.cover, b.title)}
      <span class="binfo"><b>${esc(b.title)}</b>${b.author ? `<span class="muted small">${esc(b.author)}</span>` : ""}
      ${b.status === "reading" ? `<span class="bprog"><span class="progress"><div style="width:${bookPct(b)}%"></div></span><span class="small mono muted">${b.pages ? `pág. ${b.page || 0} de ${b.pages} · ${bookPct(b)}%` : "tocá para poner las páginas"}</span></span>` : ""}
      ${b.status === "done" ? `<span class="bstars" aria-label="${b.rating || 0} de 5">${"★".repeat(b.rating || 0)}<span class="off">${"★".repeat(5 - (b.rating || 0))}</span></span><span class="small muted">${esc(fmtDate(b.finished))}</span>` : ""}
      ${b.status === "want" && b.pages ? `<span class="small muted">${b.pages} páginas</span>` : ""}</span></button>`;
    const shelf = (title, list, empty) => `<div class="bento"><div class="card c-12"><div class="card-head"><h2>${title}</h2><span class="sub">${list.length}</span></div>
      ${list.length ? `<div class="bgrid">${list.map(tile).join("")}</div>` : `<p class="empty">${empty}</p>`}</div></div>`;
    return `
    ${head("Lectura", "Lo que estás leyendo, lo que querés leer y lo que ya leíste.", "", "")}
    <div class="kpis row4" style="margin-bottom:16px">
      <div class="kpi"><span class="label-sm">Meta ${yr}</span><div class="v">${doneYear.length}<small>de <select class="goal-sel" data-act="read-goal" aria-label="Meta de libros del año">${goals.map((g) => `<option value="${g}" ${g === goal ? "selected" : ""}>${g}</option>`).join("")}</select> libros</small></div><div class="bar"><i style="width:${Math.min(100, (doneYear.length / goal) * 100)}%"></i></div></div>
      <div class="kpi"><span class="label-sm">Leyendo ahora</span><div class="v">${reading.length}<small>${reading.length === 1 ? "libro" : "libros"}</small></div><div class="d">${want.length} esperando en tu lista</div></div>
      <div class="kpi"><span class="label-sm">Racha de lectura</span><div class="v">${streak}<small>${streak === 1 ? "día" : "días"}</small></div><div class="d">${readToday ? "hoy ya leíste ✓" : "hoy todavía no"}</div></div>
      <div class="kpi"><span class="label-sm">Páginas ${yr}</span><div class="v">${pagesYear}<small>págs</small></div><div class="d">de los libros que terminaste</div></div>
    </div>
    <div class="bento"><div class="card c-12">
      <div class="card-head"><h2>Agregar un libro</h2><button class="btn btn-sm ${readToday ? "btn-done" : ""}" type="button" data-act="read-today" title="Marca que hoy leíste, para la racha">${readToday ? "✓ Leí hoy" : "Marcar: leí hoy"}</button></div>
      <input id="book-q" type="search" value="${esc(bookQ)}" placeholder="Escribí el título o el autor: “El principito”, “Atomic Habits”…" autocomplete="off" aria-label="Buscar un libro" />
      <div id="book-sug">${bookSugHTML()}</div>
    </div></div>
    ${shelf("Leyendo", reading, "No estás leyendo nada ahora. Elegí uno de “Quiero leer” o buscá uno arriba.")}
    ${shelf("Quiero leer", want, "Tu lista de pendientes está vacía. Buscá un libro arriba y tocá “Quiero leer”.")}
    ${shelf("Leídos", done, "Todavía no marcaste ninguno como leído.")}`;
  },

  habitos() {
    const hd = habitDay || today(), isNow = hd === today(), todayD = today(), hs = habitList();
    const dowOf = (d) => new Date(d + "T12:00:00").getDay();
    const done = (h, d) => (h.gym ? S.logs.gym.some((l) => l.date === d) : (S.habits[d] || []).includes(h.key));
    const offGym = (h, d) => h.gym && isOff(ROUTINE[dowOf(d)]) && !done(h, d);   // día de flexibilidad que no marqué: no corta la racha
    const list = hs, n = list.filter((h) => done(h, hd)).length;
    const goalOf = (h) => (h.gym ? ROUTINE[dowOf(hd)]?.title || "" : h.goal);
    const streak = (h) => {   // días seguidos hasta hoy (si hoy todavía no lo hiciste, cuenta desde ayer)
      const d = new Date(); let c = 0;
      if (!done(h, iso(d)) && !offGym(h, iso(d))) d.setDate(d.getDate() - 1);
      for (let i = 0; i < 400; i++, d.setDate(d.getDate() - 1)) {
        const k = iso(d);
        if (offGym(h, k)) continue;
        if (!done(h, k)) break;
        c++;
      }
      return c;
    };
    const long0 = new Date(hd + "T12:00:00").toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }), long = long0.charAt(0).toUpperCase() + long0.slice(1);
    const dates = weekDates();
    return `
    ${head("Hábitos", "Check-in de cada día: lo que pide Plan-73 todos los días.", warnBadge())}
    <div class="bento">
      <div class="card c-7">
        <div class="hdate">
          <button class="hnav" data-act="habit-day" data-dir="-1" aria-label="Día anterior">‹</button>
          <b>${isNow ? "Hoy · " : ""}${esc(long)}</b>
          <button class="hnav" data-act="habit-day" data-dir="1" aria-label="Día siguiente" ${isNow ? "disabled" : ""}>›</button>
        </div>
        <div class="hprog"><i style="width:${list.length ? (n / list.length) * 100 : 0}%"></i></div>
        <div class="card-head" style="margin-bottom:12px"><span class="label-sm">${n} de ${list.length} cumplidos</span>${isNow ? "" : `<button class="btn btn-sm btn-ghost" data-act="habit-day" data-dir="0">Volver a hoy</button>`}</div>
        <div class="hlist">
          ${list.map((h) => `<button class="hb ${done(h, hd) ? "on" : ""}" data-act="habit" data-k="${esc(h.key)}" aria-pressed="${done(h, hd)}"><span class="ck"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span><span class="hn">${esc(h.name)}</span>${goalOf(h) ? `<span class="hg">${esc(goalOf(h))}</span>` : ""}</button>`).join("")}
        </div>
        ${PLAN?.nutrition?.daily?.length ? "" : `<p class="small muted" style="margin:14px 0 0">No pude leer los números de Plan-73: uso los básicos.</p>`}
      </div>
      <div class="c-5 side stack">
        <div class="card">
          <div class="card-head"><h2>Esta semana</h2></div>
          <table class="hgrid"><thead><tr><th></th>${dates.map((d, i) => `<th class="${d === todayD ? "today" : ""}">${"LMMJVSD"[i]}</th>`).join("")}<th title="Días seguidos">Racha</th></tr></thead>
          <tbody>${hs.map((h) => `<tr><td class="hnm">${esc(h.name)}</td>${dates.map((d) => (offGym(h, d) ? `<td><span class="hoff">–</span></td>` : `<td><span class="hdot ${done(h, d) ? "on" : ""} ${d > todayD ? "fut" : ""}"></span></td>`)).join("")}<td class="hs">${streak(h)}</td></tr>`).join("")}</tbody></table>
        </div>
        ${notesCard("habitos", "Notas")}
      </div>
    </div>`;
  },

  estudio() {
    const list = [...S.study].sort((a, b) => a.done - b.done || (a.due || "9").localeCompare(b.due || "9"));
    const subjects = [...new Set(S.study.map((s) => s.subject))];
    return `
    ${head("Estudio", "Materias, entregas y exámenes.")}
    <div class="card" style="margin-bottom:16px">
      <form class="inline" data-form="study">
        <input name="subject" list="subj-list" placeholder="Materia" required autocomplete="off" style="flex:0 1 190px" aria-label="Materia" />
        <datalist id="subj-list">${subjects.map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
        <input name="text" placeholder="Qué hay que hacer" required aria-label="Qué hay que hacer" />
        <input name="due" type="date" class="opt" aria-label="Fecha" style="flex:0 1 160px" />
        <button class="btn btn-primary">Agregar</button>
      </form>
      ${subjects.length ? `<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">${subjects.map((s) => `<span class="tag estudio">${esc(s)}</span>`).join("")}</div>` : ""}
    </div>
    <div class="card">
      <div class="card-head"><h2>Pendientes</h2><span class="sub">${S.study.filter((s) => !s.done).length} abiertas</span></div>
      <ul class="list">
        ${list.map((s) => `<li class="${s.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-study" data-id="${s.id}" ${s.done ? "checked" : ""} />
          <span class="grow"><b style="font-weight:500">${esc(s.subject)}</b> · ${esc(s.text)}</span>
          <span class="small muted mono">${fmtDate(s.due)}</span>
          <button class="del" data-act="del-study" data-id="${s.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin pendientes de estudio.</li>`}
      </ul>
    </div>
    <div class="bento" style="margin-top:16px">${notesCard("estudio", "Notas", "c-12")}</div>`;
  },

  proyectos() {
    return `
    ${head("Proyectos", "Todo lo que estoy construyendo.")}
    <div class="bento">
      ${S.projects.map((p) => {
        const pc = p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0;
        return `<div class="card project c-4">
          <div class="card-head" style="margin:0">
            <h2>${esc(p.name)}</h2>
            <select data-act="proj-status" data-id="${p.id}" style="width:auto;padding:5px 8px;font-size:12.5px">${["Idea", "Activo", "En pausa", "Terminado"].map((s) => `<option ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select>
          </div>
          <p class="muted" style="margin:0">${esc(p.desc)}</p>
          <div class="links">
            ${p.url ? `<a class="btn btn-sm" href="${esc(p.url)}" target="_blank" rel="noopener">Sitio ↗</a>` : ""}
            ${p.repo ? `<a class="btn btn-sm" href="${esc(p.repo)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
            <button class="btn btn-sm btn-ghost" data-act="del-proj" data-id="${p.id}">Borrar</button>
          </div>
          <div><div style="display:flex;justify-content:space-between;margin-bottom:6px" class="small muted"><span>Progreso</span><span class="mono">${pc}%</span></div><div class="progress"><div style="width:${pc}%"></div></div></div>
          <ul class="list">${p.tasks.map((t) => `<li class="${t.done ? "done" : ""}">
            <input type="checkbox" data-act="toggle-ptask" data-pid="${p.id}" data-id="${t.id}" ${t.done ? "checked" : ""} />
            <span class="grow">${esc(t.text)}</span>
            <button class="del" data-act="del-ptask" data-pid="${p.id}" data-id="${t.id}">✕</button></li>`).join("")}</ul>
          <form class="inline" data-form="ptask" data-pid="${p.id}"><input name="text" placeholder="Nueva tarea…" required /><button class="btn">Agregar</button></form>
        </div>`;
      }).join("")}
      <div class="card c-4">
        <div class="card-head"><h2>Nuevo proyecto</h2></div>
        <form class="form-col" data-form="project">
          <input name="name" placeholder="Nombre" required />
          <input name="desc" placeholder="Descripción corta" />
          <input name="url" type="url" placeholder="URL del sitio (opcional)" />
          <input name="repo" type="url" placeholder="URL de GitHub (opcional)" />
          <button class="btn btn-primary">Crear</button>
        </form>
      </div>
      ${notesCard("proyectos", "Notas", "c-4")}
    </div>`;
  },

  stats() {
    const t = today(), gset = new Set(S.logs.gym.map((l) => l.date));
    const W12 = weeksBack(12), W18 = weeksBack(18);
    const nIn = (set, ds) => ds.filter((d) => set.has(d)).length;
    const g12 = W12.map((ds) => nIn(gset, ds)), gLast4 = g12.slice(-4).reduce((a, b) => a + b, 0), gTotal = nIn(gset, W18.flat()), gBest = Math.max(0, ...g12);
    const wkLabel = (ds, i, n) => (i === n - 1 ? "hoy" : String(+ds[0].slice(8)));
    // Hábitos (últimos 30 días)
    const hs = habitList(), d30 = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return iso(d); });
    const hdone = (h, d) => (h.gym ? gset.has(d) : (S.habits[d] || []).includes(h.key));
    const hrows = hs.map((h) => {
      const n = d30.filter((d) => hdone(h, d)).length;
      let s = 0; const d = new Date(); if (!hdone(h, iso(d))) d.setDate(d.getDate() - 1);
      while (s < 400 && hdone(h, iso(d))) { s++; d.setDate(d.getDate() - 1); }
      return { h, n, pct: Math.round((n / 30) * 100), s };
    });
    const hAll = hrows.length ? Math.round((hrows.reduce((a, r) => a + r.n, 0) / (hrows.length * 30)) * 100) : 0;
    const hlevel = (d) => { const k = hs.filter((h) => hdone(h, d)).length, p = hs.length ? k / hs.length : 0; return p === 0 ? 0 : p < 0.34 ? 1 : p < 0.67 ? 2 : p < 1 ? 3 : 4; };
    // Judo
    const allW = WAZA_GROUPS.flatMap((g) => g.items), dom = allW.filter((n) => S.waza[n] === 2).length, learn = allW.filter((n) => S.waza[n] === 1).length;
    // Lectura
    const yr = t.slice(0, 4), doneB = S.books.filter((b) => b.status === "done" && (b.finished || "").startsWith(yr)), goal = S.readGoal || 12;
    const pagesYr = doneB.reduce((s, b) => s + (b.pages || 0), 0), rStreak = streakOf(S.readDays), rSet = new Set(S.readDays);
    const perMonth = MES.map((m, i) => { const v = doneB.filter((b) => +b.finished.slice(5, 7) === i + 1).length; return { v, label: m, now: i === new Date().getMonth(), title: `${m}: ${v} libro${v === 1 ? "" : "s"}` }; });
    // Estudio y videos
    const sDone = S.study.filter((s) => s.done).length, sPct = S.study.length ? Math.round((sDone / S.study.length) * 100) : 0;
    const sNext = S.study.filter((s) => !s.done && s.due).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
    const vid = SOL_STAGES.map((s, i) => ({ s, n: S.solin.filter((v) => v.stage === i).length })), vMax = Math.max(1, ...vid.map((x) => x.n));
    const cont = CONTENT_STAGES.map((s, i) => ({ s, n: S.content.filter((c) => c.stage === i).length })), cMax = Math.max(1, ...cont.map((x) => x.n));
    const card = (cls, title, sub, body) => `<div class="card ${cls}"><div class="card-head"><h2>${title}</h2>${sub ? `<span class="sub">${sub}</span>` : ""}</div>${body}</div>`;
    return `
    ${head("Estadísticas", "Tu progreso en gráficos. Sale solo de lo que ya marcás en cada sección.", warnBadge())}
    <div class="kpis row4" style="margin-bottom:16px">
      <div class="kpi"><span class="label-sm">Entrenos, últimas 4 semanas</span><div class="v">${gLast4}<small>días</small></div><div class="d">mejor semana: ${gBest} de 7</div></div>
      <div class="kpi"><span class="label-sm">Hábitos cumplidos</span><div class="v">${hAll}<small>%</small></div><div class="d">promedio de los últimos 30 días</div><div class="bar"><i style="width:${hAll}%"></i></div></div>
      <div class="kpi"><span class="label-sm">Racha de lectura</span><div class="v">${rStreak}<small>días</small></div><div class="d">${doneB.length} de ${goal} libros este año</div></div>
      <div class="kpi"><span class="label-sm">Técnicas de judo</span><div class="v">${dom}<small>/ 100</small></div><div class="d">${learn} aprendiendo</div><div class="bar"><i style="width:${dom}%"></i></div></div>
    </div>
    <div class="bento">
      ${card("c-8", "Entrenos por semana", "últimas 12 semanas", stBars(g12.map((v, i) => ({ v, label: wkLabel(W12[i], i, 12), now: i === 11, title: `Semana del ${fmtDate(W12[i][0])}: ${v} de 7 días` })), 7))}
      ${card("c-4", "Judo", "técnicas del Kodokan", `<div class="ring-row">${stRing(dom, String(dom), "de 100")}<ul class="legend"><li><i class="lg a"></i><b>${dom}</b> dominadas</li><li><i class="lg b"></i><b>${learn}</b> aprendiendo</li><li><i class="lg c"></i><b>${100 - dom - learn}</b> sin empezar</li></ul></div><a class="small" href="#judo">Ver las 100 técnicas →</a>`)}
      ${card("c-6", "Constancia en el gimnasio", `${gTotal} entrenos en 18 semanas`, stHeat(W18, (d) => (gset.has(d) ? 4 : 0)))}
      ${card("c-6", "Constancia en hábitos", "cuántos cumplís cada día", stHeat(W18, hlevel))}
      ${card("c-6", "Hábitos, últimos 30 días", "", hrows.length ? hrows.map((r) => stHbar(esc(r.h.name), r.pct, `${r.pct}%${r.s > 1 ? ` · racha ${r.s}` : ""}`)).join("") : `<p class="empty">Todavía no hay hábitos.</p>`)}
      ${card("c-6", "Evolución del peso", `<a href="#fisico">Ver detalle</a>`, weightChart())}
      ${card("c-6", "Idiomas", "días practicados por semana", S.langs.length ? S.langs.map((L) => { const set = new Set(L.days || []); return `<div class="lang-st"><div class="ls-h"><b>${esc(L.name)}</b><span class="muted small">${esc(L.level)} → ${esc(L.goal)} · racha ${streakOf(L.days || [])}</span></div>${stBars(W12.map((ds, i) => ({ v: nIn(set, ds), label: i === 11 ? "hoy" : "", now: i === 11, title: `Semana del ${fmtDate(ds[0])}: ${nIn(set, ds)} de 7 días` })), 7)}</div>`; }).join("") : `<p class="empty">Agregá un idioma para ver su progreso.</p>`)}
      ${card("c-6", "Lectura", `${yr}`, `<div class="ring-row">${stRing(Math.round((doneB.length / goal) * 100), `${doneB.length}/${goal}`, "libros")}<ul class="legend"><li><b>${pagesYr}</b> páginas leídas</li><li><b>${S.books.filter((b) => b.status === "reading").length}</b> leyendo ahora</li><li><b>${[...rSet].filter((d) => d.startsWith(yr)).length}</b> días de lectura</li></ul></div>${stBars(perMonth, Math.max(1, ...perMonth.map((m) => m.v)))}`)}
      ${card("c-6", "Estudio", "", S.study.length ? `<div class="ring-row">${stRing(sPct, sPct + "%", "hecho")}<ul class="legend"><li><b>${sDone}</b> terminadas</li><li><b>${S.study.length - sDone}</b> pendientes</li></ul></div>${sNext.length ? `<p class="label-sm" style="margin:14px 0 6px">Lo próximo</p><ul class="list">${sNext.map((s) => `<li><span class="grow"><b style="font-weight:500">${esc(s.subject)}</b> · ${esc(s.text)}</span><span class="small muted mono">${fmtDate(s.due)}</span></li>`).join("")}</ul>` : ""}` : `<p class="empty">Todavía no cargaste pendientes de estudio.</p>`)}
      ${card("c-6", "Videos y contenido", "de la idea a publicado", `<p class="label-sm" style="margin:0 0 8px">Proyectos de video</p>${vid.map((x) => stHbar(x.s, Math.round((x.n / vMax) * 100), String(x.n))).join("")}<p class="label-sm" style="margin:16px 0 8px">Ideas de contenido</p>${cont.map((x) => stHbar(x.s, Math.round((x.n / cMax) * 100), String(x.n))).join("")}`)}
    </div>`;
  },

  repos() {
    if (!repos.tried) loadRepos();
    const hide = new Set(S.repoHide), all = (repos.list || []).sort((a, b) => b.pushed.localeCompare(a.pushed));
    const shown = all.filter((r) => !hide.has(r.name)), hidden = all.filter((r) => hide.has(r.name));
    const site = (r) => r.home || (r.pages ? `https://${GH_USER.toLowerCase()}.github.io/${r.name}/` : "");
    const card = (r, isHidden) => `<div class="card repo">
      <div class="repo-top"><a class="repo-name" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>${r.archived ? `<span class="tag">Archivado</span>` : ""}${r.fork ? `<span class="tag">Fork</span>` : ""}</div>
      ${r.desc ? `<p class="muted" style="margin:0">${esc(r.desc)}</p>` : ""}
      <div class="repo-meta small muted">${r.lang ? `<span><i class="ldot" style="background:${LANG_COLOR[r.lang] || "var(--muted)"}"></i>${esc(r.lang)}</span>` : ""}${r.stars ? `<span>★ ${r.stars}</span>` : ""}<span>${ago(r.pushed)}</span></div>
      <div class="repo-act">
        <a class="btn btn-sm" href="${esc(r.url)}" target="_blank" rel="noopener">Código ↗</a>
        ${site(r) ? `<a class="btn btn-sm" href="${esc(site(r))}" target="_blank" rel="noopener">Sitio ↗</a>` : ""}
        <button class="btn btn-sm btn-ghost" type="button" data-act="${isHidden ? "repo-show" : "repo-hide"}" data-name="${esc(r.name)}">${isHidden ? "Mostrar" : "Ocultar"}</button>
      </div></div>`;
    return `
    ${head("Repos", "Mis repositorios de GitHub, del más reciente al más viejo.", `<button class="btn btn-sm" type="button" data-act="repo-reload" ${repos.busy ? "disabled" : ""}>${repos.busy ? "Actualizando…" : "Actualizar"}</button><a class="btn btn-sm" href="https://github.com/${GH_USER}?tab=repositories" target="_blank" rel="noopener">Ver en GitHub ↗</a>`)}
    ${repos.err ? `<div class="card" style="margin-bottom:16px"><p style="margin:0">No pude leer GitHub ${repos.list ? "(te muestro lo último que guardé)" : "(¿sin conexión?)"}. Probá de nuevo en un rato.</p></div>` : ""}
    ${!repos.list && repos.busy ? `<div class="card"><p class="empty" style="margin:0">Buscando tus repos…</p></div>` : ""}
    ${repos.list ? `<div class="bgrid repos-grid">${shown.map((r) => card(r, false)).join("") || `<div class="card"><p class="empty" style="margin:0">No hay repos para mostrar.</p></div>`}</div>` : ""}
    ${hidden.length ? `<details class="more" style="margin-top:18px" ${repos.showHidden ? "open" : ""} data-rh><summary>Ocultos (${hidden.length})</summary><div class="bgrid repos-grid" style="margin-top:12px">${hidden.map((r) => card(r, true)).join("")}</div></details>` : ""}
    <p class="small muted" style="margin-top:16px">Se ven los repos públicos. Los ocultos no se borran, solo dejan de aparecer acá.</p>`;
  },

  contenido() {
    return `
    ${head("Contenido", "Mis ideas de videos y posts, y un tablero para cada proyecto.")}
    <div class="sec-title"><h2>Ideas de contenido</h2><p>Judo, cambio físico, estiramientos, surf y Uruguay.</p></div>
    <div class="card" style="margin-bottom:16px">
      <form class="inline" data-form="content">
        <input name="title" placeholder="Idea de video / post" required />
        <input name="cat" list="cat-list" placeholder="Etiqueta (ej: creativo)" autocomplete="off" style="flex:0 1 220px" aria-label="Etiqueta" />\n        <datalist id="cat-list">${[...new Set([...CONTENT_CATS, ...CONTENT_SUGGEST, ...S.content.map((c) => c.cat)])].map((c) => `<option value="${esc(LABELS[c] ? c : c)}">`).join("")}</datalist>
        <button class="btn btn-primary">Agregar</button>
      </form>
    </div>
    ${(() => { const used = [...new Set(S.content.map((c) => c.cat))]; return used.length > 1 ? `<div class="filters" style="margin-bottom:14px"><button class="chip ${contF === "todas" ? "on" : ""}" data-act="content-f" data-cat="todas">Todas</button>${used.map((u) => `<button class="chip ${contF === u ? "on" : ""}" data-act="content-f" data-cat="${esc(u)}">${esc(LABELS[u] || u)} <span class="muted">${S.content.filter((c) => c.cat === u).length}</span></button>`).join("")}</div>` : ""; })()}
    <div class="kanban">
      ${CONTENT_STAGES.map((st, si) => {
        const items = S.content.filter((c) => c.stage === si && (contF === "todas" || c.cat === contF));
        return `<div class="col"><h3>${st}<span class="muted mono">${items.length}</span></h3>
          ${items.map((c) => `<div class="kcard">${esc(c.title)}
            <div class="row"><button class="tagbtn" type="button" data-act="content-tag" data-id="${c.id}" title="Cambiar etiqueta">${tag(c.cat)}</button><span>
              ${si > 0 ? `<button class="del" data-act="move-content" data-id="${c.id}" data-dir="-1" title="Atrás">←</button>` : ""}
              ${si < 3 ? `<button class="del" data-act="move-content" data-id="${c.id}" data-dir="1" title="Avanzar">→</button>` : ""}
              <button class="del" data-act="del-content" data-id="${c.id}">✕</button></span></div></div>`).join("")}
        </div>`;
      }).join("")}
    </div>
    ${channelsHTML()}
    <div class="bento" style="margin-top:16px">${notesCard("contenido", "Notas", "c-12")}</div>`;
  },

  idiomas() {
    const L = S.langs.find((l) => l.id === selLang) || S.langs[0];
    const SC = L ? levelsOf(L) : LEVELS;
    const add = `
      <form class="inline" data-form="lang">
        <input name="name" placeholder="Agregar idioma (ej: Inglés, Japonés, Portugués)" required />
        <button class="btn btn-primary">Agregar</button>
      </form>`;
    if (!L) {
      return `${head("Idiomas", "Los idiomas que estoy aprendiendo.")}
      <div class="card" style="max-width:640px"><p class="muted" style="margin-top:0">Todavía no agregaste ningún idioma.</p>${add}</div>`;
    }
    const streak = streakOf(L.days);
    const days28 = [...Array(28)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (27 - i)); return iso(d); });
    const doneToday = L.days.includes(today());
    const q = vocabQ.trim().toLowerCase();
    const vocab = L.vocab.filter((v) => !q || (v.w + " " + v.m).toLowerCase().includes(q));
    return `
    ${head("Idiomas", "Los idiomas que estoy aprendiendo.")}
    <div class="filters">
      ${S.langs.map((l) => `<button class="chip ${l.id === L.id ? "on" : ""}" data-act="sel-lang" data-id="${l.id}">${esc(l.name)}<span class="muted small mono">${esc(l.level)}</span></button>`).join("")}
      <form class="inline" data-form="lang" style="flex:0 1 280px"><input name="name" placeholder="+ Idioma" required style="padding:6px 10px" /></form>
    </div>
    <div class="bento">
      <div class="card hero c-8">
        <div class="card-head" style="margin-bottom:6px">
          <span class="label-sm" style="color:var(--accent)">${esc(L.name)}</span>
          <button class="btn btn-sm btn-ghost" data-act="del-lang" data-id="${L.id}">Quitar idioma</button>
        </div>
        <div class="lang-level">
          <div><span class="label-sm">Nivel${SC === JLPT ? " · JLPT" : ""}</span>
            <select data-act="lang-level" data-id="${L.id}">${SC.map((x) => `<option ${x === L.level ? "selected" : ""}>${x}</option>`).join("")}</select></div>
          <div class="lang-bar" style="grid-template-columns:repeat(${SC.length - 1},minmax(0,1fr))">${SC.slice(0, -1).map((x, i) => `<i class="${SC.indexOf(L.level) >= i ? "on" : ""} ${L.goal === x ? "goal" : ""}" title="${x}">${x}</i>`).join("")}</div>
          <div><span class="label-sm">Meta</span>
            <select data-act="lang-goal" data-id="${L.id}">${SC.map((x) => `<option ${x === L.goal ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        </div>
        <div class="lang-streak">
          <button class="btn ${doneToday ? "" : "btn-primary"}" data-act="lang-today" data-id="${L.id}">${doneToday ? "✓ Practiqué hoy (deshacer)" : "Practiqué hoy"}</button>
          <span class="mono small muted"><b class="big">${streak}</b> días seguidos · ${L.days.filter((d) => days28.includes(d)).length}/28 días</span>
          <div class="streak">${days28.map((d) => `<span class="${L.days.includes(d) ? "on" : ""}" title="${fmtDate(d)}"></span>`).join("")}</div>
        </div>
      </div>
      <div class="card c-4 side">
        <div class="card-head"><h2>Recursos</h2><span class="sub">${L.res.length}</span></div>
        <form class="inline" data-form="lang-res" data-id="${L.id}"><input name="text" placeholder="App, libro, canal, link…" required /><button class="btn">Agregar</button></form>
        <ul class="list" style="margin-top:12px">${L.res.map((r) => `<li><span class="grow">${linkify(r.text)}</span><button class="del" data-act="del-lang-res" data-id="${L.id}" data-rid="${r.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin recursos.</li>`}</ul>
      </div>
    </div>
    <div class="bento">
      <div class="card c-8">
        <div class="card-head"><h2>Vocabulario</h2><span class="sub">${L.vocab.length} palabras</span></div>
        <form class="inline" data-form="vocab" data-id="${L.id}">
          <input name="w" placeholder="Palabra / frase" required />
          <input name="m" placeholder="Significado" />
          <button class="btn btn-primary">Agregar</button>
        </form>
        <input id="vocab-q" placeholder="Buscar…" value="${esc(vocabQ)}" style="margin-top:10px" aria-label="Buscar en el vocabulario" />
        <div class="vocab-grid" id="vocab-list">${vocabHTML(L, vocab)}</div>
      </div>
      ${notesCard("idiomas-" + L.id, "Notas de " + esc(L.name), "c-4 side")}
    </div>`;
  },

  compras() {
    const money = (n) => "$ " + Number(n).toLocaleString("es-UY");
    const pend = S.buy.filter((x) => !x.done), bought = S.buy.filter((x) => x.done);
    const total = pend.reduce((s, x) => s + (x.price || 0), 0);
    const row = (x) => `<li class="${x.done ? "done" : ""}">
      <input type="checkbox" data-act="toggle-check" data-key="buy" data-id="${x.id}" ${x.done ? "checked" : ""} aria-label="Comprado" />
      <span class="grow">${esc(x.text)}${x.note ? `<span class="buy-note">${linkify(x.note)}</span>` : ""}</span>
      ${x.price ? `<span class="small mono buy-price">${money(x.price)}</span>` : ""}
      <button class="del" data-act="del-check" data-key="buy" data-id="${x.id}" title="Borrar">✕</button></li>`;
    return `
    ${head("Compras", "Lo que necesito comprar. Se guarda solo.")}
    <div class="bento">
      <div class="card c-8">
        <div class="card-head"><h2>Por comprar</h2><span class="sub">${pend.length}${total ? ` · aprox. ${money(total)}` : ""}</span></div>
        <form class="inline buy-form" data-form="buy">
          <input name="text" placeholder="Qué necesito comprar…" required />
          <input name="note" placeholder="Nota o link (opcional)" />
          <input name="price" type="number" min="0" step="any" placeholder="Precio" style="flex:0 1 110px" />
          <button class="btn btn-primary">Agregar</button>
        </form>
        <ul class="list" style="margin-top:14px">${pend.map(row).join("") || `<li class="empty" style="background:none">Nada por comprar.</li>`}</ul>
      </div>
      <div class="c-4 side stack">
        <div class="card">
          <div class="card-head"><h2>Comprado</h2>${bought.length ? `<button class="btn btn-sm btn-ghost" data-act="clear-bought">Vaciar</button>` : `<span class="sub">0</span>`}</div>
          <ul class="list">${bought.map(row).join("") || `<li class="empty" style="background:none">Tildá algo cuando lo compres.</li>`}</ul>
        </div>
        ${notesCard("compras", "Notas de compras")}
      </div>
    </div>`;
  },

  watch() {
    const KINDS = ["Película", "Serie", "Anime", "Documental", "Video", "Otro"];
    const pend = S.watch.filter((x) => !x.done), seen = S.watch.filter((x) => x.done);
    const row = (x) => `<li class="${x.done ? "done" : ""}">
      <input type="checkbox" data-act="toggle-check" data-key="watch" data-id="${x.id}" ${x.done ? "checked" : ""} aria-label="Visto" />
      <span class="grow">${esc(x.text)}${x.note ? `<span class="buy-note">${linkify(x.note)}</span>` : ""}</span>
      ${x.kind ? `<span class="small mono buy-price">${esc(x.kind)}</span>` : ""}
      <button class="del" data-act="del-check" data-key="watch" data-id="${x.id}" title="Borrar">✕</button></li>`;
    return `
    ${head("Para ver", "Películas, series y videos para ver. Se guarda solo.")}
    <div class="bento">
      <div class="card c-8">
        <div class="card-head"><h2>Para ver</h2><span class="sub">${pend.length}</span></div>
        <form class="inline buy-form" data-form="watch">
          <input name="text" placeholder="Qué quiero ver…" required />
          <input name="note" placeholder="Dónde verlo, link o nota (opcional)" />
          <select name="kind" style="flex:0 1 130px">${KINDS.map((k) => `<option>${k}</option>`).join("")}</select>
          <button class="btn btn-primary">Agregar</button>
        </form>
        <ul class="list" style="margin-top:14px">${pend.map(row).join("") || `<li class="empty" style="background:none">Nada pendiente para ver.</li>`}</ul>
      </div>
      <div class="c-4 side stack">
        <div class="card">
          <div class="card-head"><h2>Visto</h2>${seen.length ? `<button class="btn btn-sm btn-ghost" data-act="clear-watched">Vaciar</button>` : `<span class="sub">0</span>`}</div>
          <ul class="list">${seen.map(row).join("") || `<li class="empty" style="background:none">Tildá algo cuando lo veas.</li>`}</ul>
        </div>
        ${notesCard("watch", "Notas de la watch list")}
      </div>
    </div>`;
  },

  ideas() {
    return `
    ${head("Ideas", "Todo lo que se me ocurre. Se guarda solo, aunque recargues la página.")}
    <div class="card">
      <form class="inline" data-form="idea">
        <input name="text" placeholder="Nueva idea…" required />
        <select name="tag" style="flex:0 1 160px"><option value="general">General</option>${TASK_AREAS.filter((k) => k !== "general").concat(["estiramientos"]).map((c) => `<option value="${c}">${LABELS[c]}</option>`).join("")}</select>
        <button class="btn btn-primary">Agregar</button>
      </form>
      <ul class="list" style="margin-top:14px">
        ${S.ideas.map((i) => `<li><span class="grow">${esc(i.text)}</span>${i.tag !== "general" ? tag(i.tag) : ""}<span class="small muted mono">${fmtDate(i.date)}</span>
          ${CONTENT_CATS.includes(i.tag) ? `<button class="btn btn-sm btn-ghost" data-act="idea-to-content" data-id="${i.id}" title="Pasar a Contenido">→ Contenido</button>` : ""}
          <button class="del" data-act="del-idea" data-id="${i.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin ideas todavía.</li>`}
      </ul>
    </div>`;
  },
};

function sortedWeights() { return [...S.weights].sort((a, b) => a.date.localeCompare(b.date)); }

/* ---------- Catálogo de técnicas ---------- */
const STATUS = ["No la sé", "Aprendiendo", "Dominada"];
function wazaFilters() {
  const chip = (id, label, color) => `<button class="chip ${wazaF.belt === id ? "on" : ""}" data-act="waza-belt" data-belt="${id}">${color ? `<span class="dot" style="background:${color}"></span>` : ""}${label}</button>`;
  return `${chip("todos", "Todos")}${BELTS.map((b) => chip(b.id, b.name, b.color)).join("")}
    <select data-wf="group" aria-label="Grupo"><option value="todos">Todos los grupos</option>${WAZA_GROUPS.map((g) => `<option value="${g.id}" ${wazaF.group === g.id ? "selected" : ""}>${g.name}</option>`).join("")}</select>
    <select data-wf="status" aria-label="Estado"><option value="todos">Cualquier estado</option>${STATUS.map((s, i) => `<option value="${i}" ${wazaF.status === String(i) ? "selected" : ""}>${s}</option>`).join("")}</select>
    <input data-wf="q" placeholder="Buscar técnica…" value="${esc(wazaF.q)}" aria-label="Buscar técnica" />`;
}
function wazaList() {
  const q = wazaF.q.trim().toLowerCase().replace(/[-\s]/g, "");
  let html = "", lastFam = "", total = 0;
  for (const g of WAZA_GROUPS) {
    if (wazaF.group !== "todos" && wazaF.group !== g.id) continue;
    const items = g.items.filter((n) =>
      (wazaF.belt === "todos" || wazaBelt(n) === wazaF.belt) &&
      (wazaF.status === "todos" || String(S.waza[n] || 0) === wazaF.status) &&
      (!q || n.toLowerCase().replace(/[-\s]/g, "").includes(q)));
    if (!items.length) continue;
    total += items.length;
    if (g.family !== lastFam) { html += `<div class="family">${g.family === "Nage-waza" ? "Nage-waza · proyecciones" : "Katame-waza · controles"}</div>`; lastFam = g.family; }
    const domG = g.items.filter((n) => S.waza[n] === 2).length;
    html += `<div class="waza-group"><div class="wg-head"><h3>${g.name}<span>${g.es}</span></h3>
      <div class="p"><span>${domG}/${g.items.length}</span><div class="progress"><div style="width:${(domG / g.items.length) * 100}%"></div></div></div></div>
      <div class="waza-grid">${items.map((n) => {
        const s = S.waza[n] || 0; const belt = BELTS.find((b) => b.id === wazaBelt(n));
        const origin = wazaOrigin(n);
        return `<div class="waza s${s}"><span class="belt" style="background:${belt.color}" title="Cinturón ${belt.name}"></span>
          <span class="wn"><b>${esc(n)}</b><small>${belt.name}${origin ? ` · ${origin}` : ""}</small>${FORBIDDEN.includes(n) ? `<span class="ban"> · prohibida en shiai</span>` : ""}</span>
          <button class="st s${s}" data-act="waza-status" data-n="${esc(n)}" title="Cambiar estado">${STATUS[s]}</button></div>`;
      }).join("")}</div></div>`;
  }
  return html || `<p class="empty">Ninguna técnica coincide con el filtro (${total}).</p>`;
}
function refreshWaza() {
  const l = $("#waza-list"); if (l) l.innerHTML = wazaList();
}

/* =========================================================
   Router
   ========================================================= */
function route() { let r = location.hash.slice(1); if (r === "solin") r = "contenido"; return VIEWS[r] ? r : "inicio"; }
function renderNav() {
  const cur = route();
  $("#nav").innerHTML = NAV.map((g) => `${g.group ? `<div class="nav-group">${g.group}</div>` : ""}${g.items.map(([id, label]) =>
    `<a href="#${id}" class="${id === cur ? "active" : ""}" ${id === cur ? 'aria-current="page"' : ""}><span class="ni"><svg viewBox="0 0 24 24"><path d="${ICONS[id]}"/></svg></span>${label}</a>`).join("")}`).join("");
  renderTabbar();
}
const routeLabel = (r) => NAV.flatMap((g) => g.items).find(([id]) => id === r)?.[1] || "Inicio";
function render() {
  renderNav();
  $("#view").innerHTML = VIEWS[route()]();
  enhanceView();
  $("#top-sync").innerHTML = syncBadge();
  document.title = route() === "inicio" ? "Manu HQ" : `${routeLabel(route())} · Manu HQ`;
  refreshPop();
  if (route() === "pinterest") buildPins();
  if (route() === "media") hydrateMedia($("#view"));
}
/* =========================================================
   Estructura de la app: barra inferior (celular), buscador rápido
   y retoques de accesibilidad que se aplican a todas las secciones
   ========================================================= */
const TABS = [["inicio", "Inicio"], ["rutina", "Gym"], ["comida", "Comida"], ["calendario", "Calendario"]];
function renderTabbar() {
  const cur = route(), more = !TABS.some(([id]) => id === cur);
  $("#tabbar").innerHTML = TABS.map(([id, label]) => `<a href="#${id}" class="${id === cur ? "active" : ""}" ${id === cur ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[id]}"/></svg><span>${label}</span></a>`).join("")
    + `<button type="button" class="${more ? "active" : ""}" data-act="open-menu" aria-label="Más secciones"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>${more ? esc(routeLabel(cur)) : "Más"}</span></button>`;
}
/* Cada sección arranca con su grupo (Cuerpo, Día a día, Aprender, Crear, Guardados) para que siempre sepas dónde estás, y todos los campos tienen nombre para lectores de pantalla */
function enhanceView() {
  const v = $("#view"), head = v.querySelector(".page-head > div");
  if (head && !head.querySelector(".kicker")) {
    const g = NAV.find((x) => x.group && x.items.some(([id]) => id === route()))?.group;
    if (g) head.insertAdjacentHTML("afterbegin", `<div class="kicker">${esc(g)}</div>`);
  }
  v.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([aria-label]), textarea:not([aria-label]), select:not([aria-label])").forEach((el) => {
    if (el.closest("label") || (el.id && v.querySelector(`label[for="${el.id}"]`))) return;
    const t = el.getAttribute("placeholder") || el.closest(".field")?.querySelector("span")?.textContent || el.name;
    if (t) el.setAttribute("aria-label", t);
  });
  v.querySelectorAll("input[type=checkbox]:not([aria-label])").forEach((el) => {
    const t = el.closest("li")?.querySelector(".grow")?.textContent?.trim();
    el.setAttribute("aria-label", t ? "Marcar: " + t.slice(0, 60) : "Marcar");
  });
  v.querySelectorAll("button.del:not([aria-label])").forEach((b) => b.setAttribute("aria-label", "Borrar"));
}

/* ---------- Buscador rápido: Ctrl + K (o "/") ---------- */
let cmdkSel = 0, cmdkRows = [];
function cmdkItems(q) {
  const t = plain(q.trim()), terms = t.split(/\s+/).filter(Boolean), hit = (s) => terms.every((w) => plain(s).includes(w));
  const acts = [
    { k: "Acción", label: "Marcar el entreno de hoy", hint: "Gym", run: () => act({ dataset: { act: "done-today" } }) },
    { k: "Acción", label: "Ver el calendario de entreno y marcar días", hint: "Gym", run: () => act({ dataset: { act: "open-cal" } }) },
    { k: "Acción", label: "Escribir en el diario", hint: "Diario", go: "diario", focus: "form[data-form=journal] textarea" },
    { k: "Acción", label: "Anotar una idea", hint: "Ideas", run: () => $("#quick-idea input").focus() },
    { k: "Acción", label: "Anotar una idea de video", hint: "Contenido", go: "contenido", focus: "form[data-form=solin] input" },
    { k: "Acción", label: "Agregar un libro", hint: "Lectura", go: "lectura", focus: "#book-q" },
    { k: "Acción", label: "Pegar una foto", hint: "Fotos", go: "media" },
    { k: "Acción", label: "Abrir Spotify", hint: "Música", run: () => $("#mini-open").click() },
    { k: "Acción", label: "Abrir SoundCloud", hint: "Música", run: () => $("#scmini-open").click() },
  ];
  const secs = NAV.flatMap((g) => g.items.map(([id, label]) => ({ k: "Ir a", label, hint: g.group || "", go: id, icon: id })));
  const items = terms.length ? [...secs, ...acts].filter((x) => hit(`${x.label} ${x.hint}`)) : [...acts.slice(0, 4), ...secs];
  if (t.length >= 2) {   // también busca en lo que escribiste
    [["Tarea", S.tasks, (x) => x.text, "inicio"], ["Idea", S.ideas, (x) => x.text, "ideas"], ["Diario", S.journal, (x) => x.text, "diario"],
      ["Compra", S.buy, (x) => x.text, "compras"], ["Para ver", S.watch, (x) => x.text, "watch"], ["Estudio", S.study, (x) => `${x.subject} ${x.text}`, "estudio"],
      ["Proyecto", S.projects, (x) => x.name, "proyectos"], ["Libro", S.books || [], (x) => `${x.title} ${x.author || ""}`, "lectura"], ["Video", S.solin || [], (x) => `${x.title} ${x.hook || ""}`, "contenido"]]
      .forEach(([k, arr, f, go]) => arr.filter((x) => hit(f(x))).slice(0, 4).forEach((x) => items.push({ k, label: String(f(x)).replace(/\s+/g, " ").trim().slice(0, 80), hint: "", go })));
  }
  return items.slice(0, 40);
}
function renderCmdk() {
  cmdkRows = cmdkItems($("#cmdk-q").value);
  cmdkSel = Math.min(cmdkSel, Math.max(cmdkRows.length - 1, 0));
  $("#cmdk-list").innerHTML = cmdkRows.length ? cmdkRows.map((r, i) => `<li role="option" id="cmdk-${i}" aria-selected="${i === cmdkSel}" class="cmdk-it ${i === cmdkSel ? "on" : ""}" data-i="${i}">
    ${r.icon && ICONS[r.icon] ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[r.icon]}"/></svg>` : `<span class="cmdk-dot"></span>`}
    <span class="cmdk-l">${esc(r.label)}</span><span class="cmdk-k">${esc(r.k)}${r.hint ? ` · ${esc(r.hint)}` : ""}</span></li>`).join("") : `<li class="cmdk-empty">No encontré nada con eso.</li>`;
  $("#cmdk-q").setAttribute("aria-activedescendant", cmdkRows.length ? `cmdk-${cmdkSel}` : "");
  $("#cmdk-list .on")?.scrollIntoView({ block: "nearest" });
}
function cmdkGo(i) {
  const r = cmdkRows[i]; if (!r) return;
  $("#cmdk").close();
  if (r.run) setTimeout(r.run, 40);
  else { location.hash = "#" + r.go; if (r.focus) setTimeout(() => $(r.focus)?.focus(), 400); }
}
function openCmdk() {
  const d = $("#cmdk"); if (d.open) return;
  $("#sidebar").classList.remove("open");
  $("#cmdk-q").value = ""; cmdkSel = 0; renderCmdk();
  d.showModal(); $("#cmdk-q").focus();
}
$("#cmdk-open").addEventListener("click", openCmdk);
$("#cmdk-q").addEventListener("input", () => { cmdkSel = 0; renderCmdk(); });
$("#cmdk-q").addEventListener("keydown", (e) => {
  const n = Math.max(cmdkRows.length, 1);
  if (e.key === "ArrowDown") { e.preventDefault(); cmdkSel = (cmdkSel + 1) % n; renderCmdk(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); cmdkSel = (cmdkSel - 1 + n) % n; renderCmdk(); }
  else if (e.key === "Enter") { e.preventDefault(); cmdkGo(cmdkSel); }
});
$("#cmdk-list").addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) cmdkGo(+li.dataset.i); });
$("#cmdk-list").addEventListener("mouseover", (e) => {
  const li = e.target.closest("[data-i]"); if (!li || +li.dataset.i === cmdkSel) return;
  cmdkSel = +li.dataset.i; $("#cmdk-list .on")?.classList.remove("on"); li.classList.add("on");
});
$("#cmdk").addEventListener("click", (e) => { if (e.target === $("#cmdk")) $("#cmdk").close(); });
document.addEventListener("keydown", (e) => {
  const typing = e.target.matches?.("input, textarea, select, [contenteditable]");
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCmdk(); }
  else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && entered) { e.preventDefault(); openCmdk(); }
});

const UNDOABLE = /^(del-task|del-check|del-weight|del-study|del-idea|del-content|del-note|del-ptask|del-vocab|del-lang-res|del-pin|repo-hide|ch-del|clear-bought|clear-watched)$/;
window.addEventListener("hashchange", () => {
  if (route() === "rutina" && !render.keepDay) { selDay = new Date().getDay(); weekOff = 0; }
  if (route() === "calendario") { calMonth = null; calSel = null; }
  if (route() === "diario") { jEdit = null; jQ = ""; }
  render.keepDay = false;
  render(); window.scrollTo(0, 0); $("#sidebar").classList.remove("open");
  const v = $("#view"); v.style.animation = "none"; void v.offsetWidth; v.style.animation = "";   // transición suave entre secciones
});

/* =========================================================
   Formularios y acciones
   ========================================================= */
function addIdea(text, tg = "general") {
  text = text.trim(); if (!text) return;
  S.ideas.unshift({ id: uid(), text, tag: tg, date: today() });
  save(); toast("Idea guardada ✓");
}
$("#quick-idea").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = e.target.text; addIdea(inp.value); inp.value = "";
  render();
});

document.addEventListener("submit", (e) => {
  const f = e.target.closest("form[data-form]");
  if (!f) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  const kind = f.dataset.form;
  switch (kind) {
    case "task": S.tasks.unshift({ id: uid(), text: v.text, area: f.dataset.area || v.area, done: false, ...(v.due ? { due: v.due } : {}) }); break;
    case "pin": {
      const { items, short } = pinParse(v.links), have = new Set(S.pins.map((p) => p.url)), fresh = items.filter((i) => !have.has(i.url));
      if (!items.length) { toast(short ? "Los links pin.it no se pueden leer: abrí el pin en la compu y copiá la dirección" : "No encontré links de Pinterest"); return; }
      const tag = (v.tag || "").trim().slice(0, 30);
      S.pins.unshift(...fresh.map((i) => ({ id: uid(), url: i.url, kind: i.kind, tag, date: today() })));
      toast(fresh.length ? `${fresh.length} agregado${fresh.length === 1 ? "" : "s"}${items.length > fresh.length ? ` · ${items.length - fresh.length} ya estaba${items.length - fresh.length === 1 ? "" : "n"}` : ""}` : "Ya estaban todos");
      break;
    }
    case "journal": {
      const text = (v.text || "").trim(); if (!text) return;
      S.journal.unshift({ id: uid(), text, date: v.date || today(), ...((v.date || today()) === today() ? { time: new Date().toTimeString().slice(0, 5) } : {}) });
      lsDel(J_DRAFT); toast("Entrada guardada ✓"); break;
    }
    case "cal-task": S.tasks.unshift({ id: uid(), text: v.text.trim(), area: "general", done: false, due: f.dataset.date }); break;
    case "check": S[f.dataset.key].push({ id: uid(), text: v.text, done: false }); break;
    case "weight": S.weights.push({ id: uid(), date: v.date || today(), kg: +v.kg, note: v.note }); break;
    case "study": S.study.push({ id: uid(), ...v, done: false }); break;
    case "buy": S.buy.unshift({ id: uid(), text: v.text.trim(), price: v.price ? +v.price : null, note: (v.note || "").trim(), done: false, date: today() }); break;
    case "watch": S.watch.unshift({ id: uid(), text: v.text.trim(), kind: v.kind, note: (v.note || "").trim(), done: false, date: today() }); break;
    case "idea": addIdea(v.text, v.tag); break;
    case "lang": { const l = fixLang({ id: uid(), name: v.name.trim(), level: "A1", goal: "B2", days: [], vocab: [], res: [] }); S.langs.push(l); selLang = l.id; break; }
    case "lang-res": langById(f.dataset.id).res.push({ id: uid(), text: v.text }); break;
    case "vocab": langById(f.dataset.id).vocab.unshift({ id: uid(), w: v.w, m: v.m }); break;
    case "note": (S.notes[f.dataset.key] = S.notes[f.dataset.key] || []).unshift({ id: uid(), text: v.text, date: today() }); break;
    case "channel": { const c = { id: uid(), name: v.name.trim().slice(0, 40) }; S.channels.push(c); selCh.id = c.id; selCh.adding = false; solF.st = "todos"; solF.plat = "todos"; break; }
    case "solin": S.solin.unshift({ id: uid(), ch: selCh.id, title: v.title.trim(), plat: v.plat || "TikTok", stage: 0, hook: "", script: "", link: "", date: "", notes: "" }); break;
    case "content": S.content.push({ id: uid(), title: v.title, cat: cleanTag(v.cat), stage: 0 }); break;
    case "project": S.projects.push({ id: uid(), status: "Activo", tasks: [], ...v }); break;
    case "ptask": S.projects.find((p) => p.id === f.dataset.pid).tasks.push({ id: uid(), text: v.text, done: false }); break;
  }
  commit();
  const sel = `form[data-form="${kind}"]${f.dataset.key ? `[data-key="${f.dataset.key}"]` : ""}${f.dataset.pid ? `[data-pid="${f.dataset.pid}"]` : ""} input:not([type=date])`;
  const again = document.querySelector(sel);
  if (again) again.focus();
});

function act(el) {
  const { act: a, id, key, pid } = el.dataset;
  const byId = (arr) => arr.find((x) => x.id === id);
  const drop = (arr) => arr.filter((x) => x.id !== id);
  const snap = UNDOABLE.test(a) ? structuredClone(S) : null;   // para poder deshacer
  switch (a) {
    case "toggle-task": byId(S.tasks).done = el.checked; break;
    case "del-task": S.tasks = drop(S.tasks); break;
    case "toggle-check": byId(S[key]).done = el.checked; break;
    case "del-check": S[key] = drop(S[key]); break;
    case "del-weight": S.weights = drop(S.weights); break;
    case "clear-bought": S.buy = S.buy.filter((x) => !x.done); break;
    case "clear-watched": S.watch = S.watch.filter((x) => !x.done); break;
    case "done-today":
      if (S.logs.gym.some((l) => l.date === today())) S.logs.gym = S.logs.gym.filter((l) => l.date !== today());
      else { S.logs.gym.push({ id: uid(), date: today(), session: sessionText(ROUTINE[new Date().getDay()]) }); toast("Día marcado ✓"); }
      break;
    case "sel-day": selDay = +el.dataset.day; render(); return;
    case "recipe-opt": {   // receta de una opción (plato o batido del día)
      const r = recipes().find((x) => x.gi === +el.dataset.gi && x.ri === +el.dataset.ri);
      if (r) openPop(r.name, () => recipeHTML({ nums: r.nums, slot: r.group, rec: r, text: r.text }));
      return;
    }
    case "plato-next": { const st = getPick(); st[el.dataset.w] += 1; lsSet("manuhq-plato", JSON.stringify(st)); render(); return; }
    case "j-edit": jEdit = id; render(); setTimeout(() => $("#j-edit-text")?.focus(), 0); return;
    case "j-cancel": jEdit = null; render(); return;
    case "j-save": { const t = ($("#j-edit-text")?.value || "").trim(); if (!t) return; const e = byId(S.journal); if (e) { e.text = t; e.edited = today(); } jEdit = null; break; }
    case "del-journal": if (!confirm("¿Borrar esta entrada del diario?")) return; S.journal = drop(S.journal); break;
    case "media-pick": $("#media-file")?.click(); return;
    case "media-tag": mediaTag = el.dataset.t; render(); return;
    case "media-open": if (el.dataset.id) openPop("Foto", () => photoHTML(el.dataset.id), "wide"); return;
    case "media-tag-save": { const m = byId(S.media); if (m) { m.tag = ($("#mtag-edit")?.value || "").trim().slice(0, 30); toast("Etiqueta guardada ✓"); } break; }
    case "media-del": if (!confirm("¿Borrar esta foto? También se borra de la nube y de tus otros dispositivos.")) return; mediaRemove(id); $("#pop").close(); break;
    case "open-sync": $("#sync-btn").click(); return;
    case "del-pin": S.pins = drop(S.pins); break;
    case "pin-tag": pinTag = el.dataset.t; render(); return;
    case "read-today": S.readDays = S.readDays.includes(today()) ? S.readDays.filter((d) => d !== today()) : [...S.readDays, today()]; break;
    case "read-goal": S.readGoal = +el.value || 12; break;
    case "book-open": if (el.dataset.id) openPop("Libro", () => bookPopHTML(el.dataset.id), "wide"); return;
    case "book-add": {
      const s = el.dataset.i === "m" ? { title: bookQ.trim(), author: "", pages: 0, cover: "" } : bookSug[+el.dataset.i], st = el.dataset.st;
      if (!s || !s.title) return;
      const b = { id: uid(), title: s.title, author: s.author || "", pages: s.pages || 0, page: 0, status: "want", rating: 0, notes: "", cover: s.cover || "", added: today() };
      setBookStatus(b, st);
      S.books.unshift(b); bookQ = ""; bookSug = []; bookBusy = false;
      toast(st === "reading" ? "Listo, ya lo estás leyendo ✓" : st === "done" ? "Agregado a tus leídos ✓" : "Agregado a tu lista ✓");
      break;
    }
    case "book-status": { const b = byId(S.books); if (!b) return; bookReadFields(b); setBookStatus(b, el.dataset.st); break; }
    case "book-rate": { const b = byId(S.books); if (!b) return; bookReadFields(b); b.rating = b.rating === +el.dataset.n ? 0 : +el.dataset.n; break; }
    case "book-save": {
      const b = byId(S.books); if (!b) return;
      const before = b.page || 0; bookReadFields(b);
      if (b.page > before && !S.readDays.includes(today())) S.readDays.push(today());   // avanzar de página cuenta como "leí hoy"
      const finished = b.status === "reading" && b.pages > 0 && b.page >= b.pages;
      if (finished) setBookStatus(b, "done");
      toast(finished ? "¡Terminaste el libro! Pasó a tus leídos ✓" : "Guardado ✓"); $("#pop").close(); break;
    }
    case "book-del": if (!confirm("¿Borrar este libro de tu lista?")) return; S.books = drop(S.books); $("#pop").close(); break;
    case "solin-f": solF.st = el.dataset.st; break;
    case "solin-plat": solF.plat = el.value; break;
    case "solin-open": if (el.dataset.id) openPop("Video", () => solPopHTML(el.dataset.id), "wide"); return;
    case "solin-stage": { const v = byId(S.solin); if (!v) return; solReadFields(v); v.stage = +el.dataset.n; break; }
    case "solin-save": { const v = byId(S.solin); if (!v) return; solReadFields(v); toast("Guardado ✓"); $("#pop").close(); break; }
    case "solin-del": if (!confirm("¿Borrar este video?")) return; S.solin = drop(S.solin); $("#pop").close(); break;
    case "repo-hide": if (!S.repoHide.includes(el.dataset.name)) S.repoHide.push(el.dataset.name); break;
    case "repo-show": S.repoHide = S.repoHide.filter((n) => n !== el.dataset.name); repos.showHidden = true; break;
    case "repo-reload": loadRepos(true); render(); return;
    case "ch-sel": selCh.id = el.dataset.id; selCh.adding = false; solF.st = "todos"; solF.plat = "todos"; break;
    case "ch-new": selCh.adding = !selCh.adding; break;
    case "ch-del": { const c = S.channels.find((x) => x.id === el.dataset.id); if (!c) return; const n = S.solin.filter((v) => chOf(v) === c.id).length; if (!confirm(`¿Borrar el proyecto «${c.name}»${n ? ` y sus ${n} video${n === 1 ? "" : "s"}` : ""}?`)) return; S.channels = S.channels.filter((x) => x.id !== c.id); S.solin = S.solin.filter((v) => chOf(v) !== c.id); selCh.id = null; break; }
    case "open-menu": $("#sidebar").classList.toggle("open"); return;
    case "plan-warn": openPop("Plan-73 cambió", planWarnHTML); return;
    case "week-nav": { const dir = +el.dataset.dir; weekOff = dir === 0 ? 0 : Math.min(0, weekOff + dir); render(); return; }
    case "gym-day": {     // marcar o desmarcar un entreno de hoy o de un día que ya pasó
      const date = el.dataset.date;
      if (!date || date > today()) return;
      if (gymDone(date)) S.logs.gym = S.logs.gym.filter((l) => l.date !== date);
      else { S.logs.gym.push({ id: uid(), date, session: sessionText(ROUTINE[new Date(date + "T12:00:00").getDay()]) }); toast("Día marcado ✓"); }
      break;
    }
    case "open-cal": openPop("Calendario de entreno", () => gymCal({ pop: true, go: true }), "wide"); return;
    case "recipe": {
      const r = PLAN?.nutrition?.days?.[+el.dataset.d]?.rows?.[+el.dataset.r];
      if (!r) return;
      const dish = (r[1] || []).join(" ").trim(), rec = findRecipe(dish);
      openPop(dish, () => recipeHTML({ nums: (r[2] || []).join(" "), slot: (r[0] || []).join(" "), rec, text: dish }));
      return;
    }
    case "recipes": { const g = PLAN?.nutrition?.options?.[+el.dataset.g]; if (g) openPop(g.title, () => groupHTML(+el.dataset.g), "wide"); return; }
    case "cal-nav": {
      const dir = +el.dataset.dir, [Y, M] = (calMonth || today().slice(0, 7)).split("-").map(Number);
      calMonth = dir ? iso(new Date(Y, M - 1 + dir, 1)).slice(0, 7) : null;
      calSel = !calMonth || calMonth === today().slice(0, 7) ? null : calMonth + "-01";
      render(); return;
    }
    case "cal-day": calSel = el.dataset.date; render(); return;
    case "task-due": { const t = byId(S.tasks); if (t) { if (el.value) t.due = el.value; else delete t.due; } break; }
    case "food-day": foodSel = +el.dataset.i; render(); return;
    case "habit-day": {
      const dir = +el.dataset.dir;
      if (!dir) habitDay = null;
      else { const d = new Date((habitDay || today()) + "T12:00:00"); d.setDate(d.getDate() + dir); habitDay = iso(d) >= today() ? null : iso(d); }
      render(); return;
    }
    case "habit": {
      const k = el.dataset.k, d = habitDay || today();
      if (k === "entreno") {
        if (S.logs.gym.some((l) => l.date === d)) S.logs.gym = S.logs.gym.filter((l) => l.date !== d);
        else S.logs.gym.push({ id: uid(), date: d, session: sessionText(ROUTINE[new Date(d + "T12:00:00").getDay()]) });
      } else {
        const a = S.habits[d] || [];
        S.habits[d] = a.includes(k) ? a.filter((x) => x !== k) : [...a, k];
        if (!S.habits[d].length) delete S.habits[d];
      }
      break;
    }
    case "goto-rutina": selDay = +el.dataset.day; render.keepDay = true; $("#pop").close(); location.hash = "rutina"; return;
    case "toggle-study": byId(S.study).done = el.checked; break;
    case "del-study": S.study = drop(S.study); break;
    case "del-idea": S.ideas = drop(S.ideas); break;
    case "idea-to-content": { const i = byId(S.ideas); S.content.push({ id: uid(), title: i.text, cat: i.tag, stage: 0 }); S.ideas = drop(S.ideas); toast("Pasada a Contenido ✓"); break; }
    case "content-f": contF = el.dataset.cat; break;
    case "content-tag": { const c = byId(S.content); if (!c) return; const t = prompt("Etiqueta de esta idea (escribí la que quieras):", LABELS[c.cat] || c.cat); if (t === null) return; c.cat = cleanTag(t); break; }
    case "move-content": { const c = byId(S.content); c.stage = Math.max(0, Math.min(3, c.stage + +el.dataset.dir)); break; }
    case "del-content": S.content = drop(S.content); break;
    case "proj-status": byId(S.projects).status = el.value; break;
    case "del-proj": if (!confirm("¿Borrar este proyecto?")) return; S.projects = drop(S.projects); break;
    case "toggle-ptask": S.projects.find((p) => p.id === pid).tasks.find((t) => t.id === id).done = el.checked; break;
    case "del-ptask": { const p = S.projects.find((p) => p.id === pid); p.tasks = p.tasks.filter((t) => t.id !== id); break; }
    case "sel-block": viewBlock = el.dataset.block; render(); return;
    case "sel-lang": selLang = id; vocabQ = ""; render(); return;
    case "del-lang": if (!confirm("¿Quitar este idioma y su vocabulario?")) return; S.langs = drop(S.langs); selLang = null; break;
    case "lang-level": langById(id).level = el.value; break;
    case "lang-goal": langById(id).goal = el.value; break;
    case "lang-today": { const l = langById(id); l.days = l.days.includes(today()) ? l.days.filter((d) => d !== today()) : [...l.days, today()]; break; }
    case "del-lang-res": { const l = langById(id); l.res = l.res.filter((r) => r.id !== el.dataset.rid); break; }
    case "del-vocab": { const l = langById(id); l.vocab = l.vocab.filter((x) => x.id !== el.dataset.vid); break; }
    case "del-note": S.notes[key] = (S.notes[key] || []).filter((x) => x.id !== id); break;
    case "next-quote": quoteIdx = (quoteIdx + 1 + Math.floor(Math.random() * (JUDO_QUOTES.length - 1))) % JUDO_QUOTES.length; render(); return;
    case "waza-belt": wazaF.belt = el.dataset.belt; $("#waza-filters").innerHTML = wazaFilters(); refreshWaza(); return;
    case "waza-status": {
      const n = el.dataset.n; S.waza[n] = ((S.waza[n] || 0) + 1) % 3; save();
      const y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    default: return;
  }
  commit();
  if (snap) toast(a.startsWith("clear") ? "Lista vaciada" : "Borrado", () => { S = snap; commit(); });
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (el && el.tagName !== "SELECT" && el.type !== "checkbox" && el.type !== "date") act(el);
});
document.addEventListener("change", (e) => {
  const el = e.target.closest("[data-act]");
  if (el && (el.tagName === "SELECT" || el.type === "checkbox" || el.type === "date")) act(el);
  const cr = e.target.dataset?.chRename;
  if (cr) { const c = S.channels.find((x) => x.id === cr), nv = e.target.value.trim().slice(0, 40); if (c && nv && nv !== c.name) { c.name = nv; commit(); } else if (c) e.target.value = c.name; }
  const wf = e.target.dataset?.wf;
  if (wf && wf !== "q") { wazaF[wf] = e.target.value; refreshWaza(); }
});
document.addEventListener("input", (e) => {
  if (e.target.dataset?.chRename) { e.target.size = Math.max(6, e.target.value.length); return; }
  if (e.target.id === "book-q") {   // buscar libros mientras escribís
    bookQ = e.target.value; clearTimeout(bookSearchT);
    if (bookQ.trim().length < 3) { bookSug = []; bookBusy = false; bookErr = false; bookSearchN++; renderBookSug(); return; }
    bookBusy = true; renderBookSug(); bookSearchT = setTimeout(() => bookSearch(bookQ.trim()), 400); return;
  }
  if (e.target.id === "j-q") { jQ = e.target.value; $("#j-list").innerHTML = journalList(jQ); return; }
  if (e.target.name === "text" && e.target.closest("form[data-form=journal]")) { if (e.target.value) lsSet(J_DRAFT, e.target.value); else lsDel(J_DRAFT); return; }   // borrador
  if (e.target.dataset?.wf === "q") { wazaF.q = e.target.value; refreshWaza(); return; }
  if (e.target.id === "vocab-q") {
    vocabQ = e.target.value;
    const L = langById(selLang) || S.langs[0]; const q = vocabQ.trim().toLowerCase();
    $("#vocab-list").innerHTML = vocabHTML(L, L.vocab.filter((v) => !q || (v.w + " " + v.m).toLowerCase().includes(q)));
  }
});

/* Media: pegar (Ctrl + V), arrastrar y elegir fotos */
document.addEventListener("paste", (e) => {
  if (route() !== "media") return;
  const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
  if (!files.length) return;   // si lo que pegás es texto, se pega normal
  e.preventDefault(); mediaAdd(files);
});
const dragHasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
document.addEventListener("dragover", (e) => { if (route() === "media" && dragHasFiles(e)) { e.preventDefault(); $("#mdrop")?.classList.add("over"); } });
document.addEventListener("dragleave", (e) => { if (!e.relatedTarget || e.target === $("#mdrop")) $("#mdrop")?.classList.remove("over"); });
document.addEventListener("drop", (e) => { if (route() === "media" && dragHasFiles(e)) { e.preventDefault(); $("#mdrop")?.classList.remove("over"); mediaAdd(e.dataTransfer.files); } });
document.addEventListener("change", (e) => { if (e.target.id === "media-file") { mediaAdd(e.target.files); e.target.value = ""; } });

/* Diario: Ctrl + Enter guarda */
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && e.target.matches?.("form[data-form=journal] textarea")) { e.preventDefault(); e.target.form.requestSubmit(); }
});

/* Ventana flotante: ✕, clic en lo opaco y Esc la cierran */
$("#pop-x").addEventListener("click", () => $("#pop").close());
$("#pop").addEventListener("click", (e) => { if (e.target === $("#pop")) $("#pop").close(); });
$("#pop").addEventListener("close", () => { popFn = null; });

/* Si dejás la página abierta de un día para el otro, se actualiza sola cuando cambia la fecha */
let lastDay = today();
function dayCheck() {
  if (lastDay === today()) return;
  lastDay = today(); selDay = new Date().getDay(); weekOff = 0; habitDay = null; calMonth = null; calSel = null;
  updateSplash();
  if (!document.activeElement?.matches("input, textarea, select")) render();
}
setInterval(dayCheck, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) dayCheck(); });

/* Export / import */
$("#export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `manuhq-${today()}.json`; a.click();
  URL.revokeObjectURL(a.href);
});
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!confirm("Esto reemplaza los datos actuales de este navegador. ¿Seguir?")) return;
    S = normalize(data);
    commit(); toast("Datos importados ✓");
  } catch { alert("Ese archivo no es un backup válido."); }
  e.target.value = "";
});
/* =========================================================
   Sincronización entre dispositivos.
   Los datos van a un gist secreto de tu GitHub; cada dispositivo
   se conecta una vez con un token que solo tiene permiso de gists.
   Si dos dispositivos cambiaron cosas distintas, se juntan: se
   compara cada uno contra la última versión sincronizada (BASE).
   ========================================================= */
const SYNC_KEY = "manuhq-sync", SYNC_FILE = "manu-hq-data.json", GH_API = "https://api.github.com";
let SYNC = (() => { try { return JSON.parse(lsGet(SYNC_KEY)) || {}; } catch (e) { return {}; } })();
let pushT = null, syncBusy = false;
const SYNC_TXT = { off: "Datos y sincronización", busy: "Sincronizando…", ok: "Sincronizado", err: "Sin conexión · reintenta", auth: "Token inválido" };
function setSync(st) {
  setSync.st = st;
  const b = $("#sync-btn"); if (b) { const l = $("#sync-label"); if (l) l.textContent = SYNC_TXT[st]; b.dataset.st = st; }
  const s = $("#sync-status"); if (s) s.textContent = SYNC.token ? SYNC_TXT[st] : "Sin conectar";
}
const saveSync = () => lsSet(SYNC_KEY, JSON.stringify(SYNC));
async function gh(path, opt = {}) {
  const r = await fetch(GH_API + path, { ...opt, cache: "no-store", headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + SYNC.token } });
  if (!r.ok) throw Object.assign(new Error("GitHub " + r.status), { status: r.status });
  return r.json();
}
const syncFail = (e) => setSync([401, 403, 404].includes(e.status) ? "auth" : "err");
async function remoteRead() {
  const g = await gh("/gists/" + SYNC.gist);
  if (g.owner?.login && SYNC.owner !== g.owner.login) { SYNC.owner = g.owner.login; saveSync(); }   // hace falta para bajar las fotos
  const f = g.files[SYNC_FILE];
  if (!f) return null;
  const data = JSON.parse(f.truncated ? await (await fetch(f.raw_url, { cache: "no-store" })).text() : f.content);
  return data && typeof data === "object" ? data : null;
}
/* Última versión que este dispositivo y la nube tuvieron igual */
const BASE_KEY = "manuhq-base";
const getBase = () => { try { return JSON.parse(lsGet(BASE_KEY)); } catch (e) { return null; } };
const setBase = () => lsSet(BASE_KEY, JSON.stringify(S));
const sameJ = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
const keyOf = (x) => isObj(x) ? x.id ?? x.date ?? JSON.stringify(x) : x;
/* Listas: se junta ítem por ítem (b = base, l = este dispositivo, r = nube) */
function mergeList(b, l, r) {
  const B = new Map(b.map((x) => [keyOf(x), x])), R = new Map(r.map((x) => [keyOf(x), x])), L = new Set(l.map(keyOf));
  const mine = l.filter((x) => R.has(keyOf(x)) || !B.has(keyOf(x)))                    // lo que la nube borró, se va
    .map((x) => { const k = keyOf(x); return B.has(k) && sameJ(x, B.get(k)) ? R.get(k) : x; });   // si acá no lo toqué, vale el de la nube
  return [...r.filter((x) => !L.has(keyOf(x)) && !B.has(keyOf(x))), ...mine];          // + lo nuevo de la nube
}
function mergeAny(b, l, r) {
  if (Array.isArray(l) && Array.isArray(r)) return mergeList(Array.isArray(b) ? b : [], l, r);
  if (isObj(l) && isObj(r)) {
    const o = {}, hasB = (k) => isObj(b) && k in b;
    for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) {
      if (k in l && k in r) o[k] = mergeAny(isObj(b) ? b[k] : undefined, l[k], r[k]);
      else if (k in l) { if (!hasB(k) || !sameJ(l[k], b[k])) o[k] = l[k]; }   // si estaba y no lo toqué, la nube lo borró
      else if (!hasB(k)) o[k] = r[k];                                          // si estaba, lo borré acá
    }
    return o;
  }
  return sameJ(l, b) ? r : l;
}
function applyRemote(data, keepBase) {
  const mediaBefore = S.media.map((m) => m.id);
  S = normalize(data);
  lsSet(STORE_KEY, JSON.stringify(S)); if (!keepBase) setBase();
  const a = document.activeElement;   // si estás escribiendo, no te borro el campo: se redibuja con tu próximo cambio
  if (!(a && a.closest("#view") && /INPUT|TEXTAREA/.test(a.tagName) && a.value)) render();
  renderMusic(); renderSc();
  mediaAfterRemote(mediaBefore);
}
async function syncPush() {
  clearTimeout(pushT); pushT = null;
  if (!SYNC.token || !SYNC.gist) return;
  setSync("busy");
  const sent = JSON.stringify(S);
  try {
    await gh("/gists/" + SYNC.gist, { method: "PATCH", body: JSON.stringify({ files: { [SYNC_FILE]: { content: sent } } }) });
    lsSet(BASE_KEY, sent); setSync("ok");
  } catch (e) { syncFail(e); }
}
function schedulePush() {
  if (!SYNC.token || !SYNC.gist) return;
  clearTimeout(pushT); pushT = setTimeout(syncNow, 1500);
}
/* Siempre lee la nube antes de escribir. Si cambiaron los dos lados, junta los cambios. */
async function syncNow() {
  if (!SYNC.token || !SYNC.gist) return;
  if (syncBusy) { syncNow.again = true; return; }
  clearTimeout(pushT); pushT = null;
  syncBusy = true; setSync("busy");
  try {
    const r = await remoteRead(), base = getBase();
    const rt = (r && r.updatedAt) || 0, lt = S.updatedAt || 0, bt = base ? base.updatedAt || 0 : null;
    if (!r) await syncPush();
    else if (rt === lt) { if (!base) setBase(); setSync("ok"); }
    else if (bt === rt) await syncPush();                        // solo cambió este dispositivo
    else if (bt === lt) { applyRemote(r); setSync("ok"); }       // solo cambió la nube
    else if (base) {                                             // cambiaron los dos: junto
      const merged = mergeAny(base, S, r);
      merged.updatedAt = Date.now();
      applyRemote(merged, true);                                 // la base se actualiza recién cuando la subida sale bien
      await syncPush();
    }
    else if (rt > lt) { applyRemote(r); setSync("ok"); }         // primera vez sin base: gana el más nuevo
    else await syncPush();
  } catch (e) { syncFail(e); }
  syncBusy = false;
  mediaTick();   // después de sincronizar los datos: subir y bajar fotos
  if (syncNow.again) { syncNow.again = false; schedulePush(); }
}
const hasLocalData = () => {   // los nombres y portadas de música se completan solos: no cuentan como datos tuyos
  const bare = (s) => JSON.stringify({ ...s, updatedAt: undefined, music: (s.music || []).map(({ name, img, ...r }) => r) });
  return bare(S) !== bare(DEFAULT_STATE);
};
async function syncConnect(token) {
  SYNC = { token };
  setSync("busy");
  try {
    const found = (await gh("/gists?per_page=100")).find((g) => g.files && g.files[SYNC_FILE]);
    if (found) {
      SYNC.gist = found.id;
      const r = await remoteRead();
      const useCloud = r && (!hasLocalData() || confirm("Ya hay datos guardados en la nube.\n\nAceptar: traer los de la nube a este dispositivo (reemplaza lo que hay acá).\nCancelar: subir lo de este dispositivo y reemplazar la nube."));
      if (useCloud) { applyRemote(r); setSync("ok"); }
      else { S.updatedAt = Date.now(); lsSet(STORE_KEY, JSON.stringify(S)); await syncPush(); }
    } else {
      S.updatedAt = S.updatedAt || Date.now(); lsSet(STORE_KEY, JSON.stringify(S));
      const g = await gh("/gists", { method: "POST", body: JSON.stringify({ description: "Manu HQ · datos sincronizados", public: false, files: { [SYNC_FILE]: { content: JSON.stringify(S) } } }) });
      SYNC.gist = g.id; setBase(); setSync("ok");
    }
    saveSync(); toast("Dispositivo conectado ✓"); mediaTick();
    return true;
  } catch (e) {
    SYNC = {}; setSync("off");
    alert(e.status === 401 ? "GitHub no aceptó ese token. Revisá que esté bien copiado." : e.status === 403 || e.status === 404 ? "El token no tiene permiso de Gists (lectura y escritura)." : "No pude conectar con GitHub. Probá de nuevo.");
    return false;
  }
}
$("#sync-btn").addEventListener("click", () => {
  const on = !!SYNC.token;
  $("#sync-off").hidden = on; $("#sync-on").hidden = !on;
  setSync(setSync.st);
  $("#sync-dialog").showModal();
});
$("#sync-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const inp = e.target.token, token = inp.value.trim(); if (!token) return;
  inp.value = "";
  if (await syncConnect(token)) $("#sync-dialog").close();
});
$("#sync-now").addEventListener("click", syncNow);
$("#sync-disconnect").addEventListener("click", () => {
  if (!confirm("Este dispositivo deja de sincronizar. Los datos quedan acá y en la nube. ¿Seguir?")) return;
  SYNC = {}; lsDel(SYNC_KEY); lsDel(BASE_KEY); setSync("off"); $("#sync-dialog").close();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { if (pushT) syncNow(); return; }
  syncNow();
  if (Date.now() - (loadPlan73.at || 0) > 5 * 60000) loadPlan73();   // Plan-73 se vuelve a leer al volver a la pestaña
});
window.addEventListener("online", syncNow);
setInterval(() => { if (!document.hidden && !pushT) syncNow(); }, 120000);
setSync(SYNC.token ? "ok" : "off");
syncNow();

$("#menu-btn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
document.addEventListener("click", (e) => {
  const sb = $("#sidebar");
  if (sb.classList.contains("open") && !sb.contains(e.target) && !e.target.closest("#menu-btn, [data-act=open-menu]")) sb.classList.remove("open");
});

/* =========================================================
   Música: botón en la barra de arriba + menú flotante.
   Hay un solo reproductor de Spotify (embed: anda con la cuenta
   gratis) que vive siempre dentro del menú. Al cerrarlo solo se
   oculta, no se recarga, así que sigue sonando.
   La biblioteca es mía: pego links y los ordeno en carpetas
   (Spotify no deja leer las carpetas de nadie).
   ========================================================= */
var musicReady = false;
const MUSIC_LAST = "manuhq-lastmusic";   // qué sonaba en este dispositivo (no se sincroniza)
const KIND_ES = { playlist: "Playlist", album: "Álbum", artist: "Artista", track: "Canción", show: "Podcast", episode: "Episodio" };
const SPOTIFY_RE = /(?:open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?|spotify:)(playlist|album|artist|track|show|episode)[\/:]([A-Za-z0-9]{22})/g;
const spotifyLinks = (txt) => [...String(txt).matchAll(SPOTIFY_RE)].map((m) => ({ kind: m[1], uri: `spotify:${m[1]}:${m[2]}` }));
const plain = (s) => String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const musicFolders = () => [...new Set(S.music.map((x) => x.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

let wantPlay = false, embedCtl = null, isPlaying = false;
let nowM = (() => { try { return JSON.parse(lsGet(MUSIC_LAST)); } catch (e) { return null; } })();
if (!nowM || !/^spotify:\w+:[A-Za-z0-9]{22}$/.test(nowM.uri || "")) nowM = { uri: PLAYLIST };
const mq = { q: "", folder: "" };         // búsqueda y carpeta elegida ("" = todas, "@sin" = sin carpeta)
const nowName = () => S.music.find((x) => x.uri === nowM.uri)?.name || "";

/* Reintenta el play: si entrás mientras el reproductor todavía carga, la primera orden se puede perder */
function tryPlay(n = 25) {
  if (isPlaying || !wantPlay) return;
  if (embedCtl) embedCtl.play();
  if (n > 0) setTimeout(() => tryPlay(n - 1), 1200);
}
function updateMini() {
  $("#mini").classList.toggle("on", isPlaying);
  $("#mini-title").textContent = nowName() || "Música";
  $("#mini-open").title = nowName();
  $("#mini-play").setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
}
function playUri(uri) {
  if (uri === nowM.uri && embedCtl) { wantPlay = false; embedCtl.togglePlay(); return; }   // el mismo: pausa o sigue
  nowM = { uri }; lsSet(MUSIC_LAST, JSON.stringify(nowM));
  isPlaying = false; wantPlay = true;
  updateMini(); renderMusic();
  if (embedCtl) { embedCtl.loadUri(uri); tryPlay(); }
}

/* Nombre y portada de cada link, desde el oEmbed público de Spotify (no pide cuenta ni token) */
const enriched = new Set();
async function enrich(it) {
  if (enriched.has(it.id) || (it.name && it.img)) return;
  enriched.add(it.id);
  try {
    const r = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(`https://open.spotify.com/${it.kind}/${it.uri.split(":")[2]}`));
    const x = S.music.find((m) => m.id === it.id); if (!x) return;
    if (r.status === 404) { x.name = x.name || "Link no encontrado"; }
    else { const j = await r.json(); x.name = x.name || j.title || ""; x.img = j.thumbnail_url || ""; }
    save(); renderMusic(); updateMini();
  } catch (e) { /* sin conexión: queda para la próxima vez que abras el menú */ }
}

function renderMusic() {
  if (!musicReady) return;
  const folders = musicFolders();
  if (mq.folder && mq.folder !== "@sin" && !folders.includes(mq.folder)) mq.folder = "";
  const nSin = S.music.filter((x) => !x.folder).length;
  const chip = (id, label, n) => `<button class="chip ${mq.folder === id ? "on" : ""}" type="button" data-m="folder" data-f="${esc(id)}">${esc(label)}<span class="muted small mono">${n}</span></button>`;
  $("#mm-chips").hidden = !folders.length;
  $("#mm-chips").innerHTML = folders.length ? chip("", "Todas", S.music.length) + folders.map((f) => chip(f, f, S.music.filter((x) => x.folder === f).length)).join("") + (nSin ? chip("@sin", "Sin carpeta", nSin) : "") : "";
  $("#mm-folders").innerHTML = folders.map((f) => `<option value="${esc(f)}"></option>`).join("");
  const terms = plain(mq.q).split(/\s+/).filter(Boolean);
  const list = S.music.filter((x) => (!mq.folder || (mq.folder === "@sin" ? !x.folder : x.folder === mq.folder)) && terms.every((t) => plain(`${x.name} ${x.folder} ${KIND_ES[x.kind]}`).includes(t)));
  const row = (x) => `<li class="mm-row ${x.uri === nowM.uri ? "on" : ""}">
    <button class="mm-main" type="button" data-m="play" data-id="${x.id}">
      <span class="mm-cov" ${x.img ? `style="background-image:url('${esc(x.img)}')"` : ""}></span>
      <span class="mm-t"><b>${esc(x.name || "Cargando…")}</b><small>${KIND_ES[x.kind]}${x.folder ? ` · ${esc(x.folder)}` : ""}</small></span>
      ${x.uri === nowM.uri && isPlaying ? `<span class="eq on" aria-hidden="true"><i></i><i></i><i></i></span>` : ""}
    </button>
    <button class="mm-act" type="button" data-m="move" data-id="${x.id}" title="Cambiar de carpeta" aria-label="Cambiar de carpeta">✎</button>
    <button class="mm-act" type="button" data-m="del" data-id="${x.id}" title="Quitar de la lista" aria-label="Quitar">✕</button></li>`;
  const q = mq.q.trim();
  $("#mm-list").innerHTML = (list.map(row).join("") || `<li class="mm-empty">${S.music.length ? "No hay nada con ese filtro." : "Todavía no agregaste nada. Tocá ＋ Agregar y pegá links de Spotify."}</li>`)
    + (q ? `<li class="mm-ext"><a href="https://open.spotify.com/search/${encodeURIComponent(q)}" target="_blank" rel="noopener">Buscar «${esc(q)}» en Spotify ↗</a></li>` : "");
}

const musicEl = $("#music");
const musicOpen = () => musicEl.classList.contains("open");
let musicFocus = null;
function openMusic() {
  if (scOpen()) closeSc();   // un menú a la vez
  musicFocus = document.activeElement;
  musicEl.classList.add("open"); musicEl.setAttribute("aria-hidden", "false");
  $("#mini-open").setAttribute("aria-expanded", "true");
  renderMusic();
  S.music.forEach(enrich);
  $(".music-panel").focus({ preventScroll: true });
}
function closeMusic() {
  musicEl.classList.remove("open"); musicEl.setAttribute("aria-hidden", "true");
  $("#mini-open").setAttribute("aria-expanded", "false");
  (musicFocus && musicFocus.isConnected ? musicFocus : $("#mini-open")).focus({ preventScroll: true });
}
$("#mini-open").addEventListener("click", () => (musicOpen() ? closeMusic() : openMusic()));
$("#mini-play").addEventListener("click", () => {
  if (!embedCtl) { toast("Cargando el reproductor…"); return; }
  wantPlay = false; embedCtl.togglePlay();
});
$("#mm-close").addEventListener("click", closeMusic);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && musicOpen()) closeMusic(); });
$("#mm-tall").addEventListener("click", () => {
  const t = $("#mm-player").classList.toggle("tall");
  $("#mm-tall").textContent = t ? "Ocultar canciones ▴" : "Ver canciones ▾";
});
$("#mm-q").addEventListener("input", (e) => { mq.q = e.target.value; renderMusic(); });
$("#mm-add-btn").addEventListener("click", () => {
  const f = $("#mm-add"); f.hidden = !f.hidden;
  if (!f.hidden) f.links.focus();
});
$("#mm-add").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, found = spotifyLinks(f.links.value);
  if (!found.length) { toast("No encontré links de Spotify"); return; }
  const folder = f.folder.value.trim().slice(0, 40), have = new Set(S.music.map((x) => x.uri)), added = [];
  let dup = 0;
  for (const l of found) {
    if (have.has(l.uri)) { dup++; continue; }
    have.add(l.uri);
    added.push({ id: uid(), uri: l.uri, kind: l.kind, name: "", img: "", folder, date: today() });
  }
  S.music.unshift(...added); save();
  f.reset(); f.hidden = true;
  toast(`${added.length} agregado${added.length === 1 ? "" : "s"}${dup ? ` · ${dup} ya estaba${dup === 1 ? "" : "n"}` : ""}`);
  renderMusic(); added.forEach(enrich);
});
musicEl.addEventListener("click", (e) => {
  if (e.target === musicEl) { closeMusic(); return; }   // clic en lo opaco de atrás
  const b = e.target.closest("[data-m]"); if (!b) return;
  const x = S.music.find((m) => m.id === b.dataset.id);
  switch (b.dataset.m) {
    case "folder": mq.folder = b.dataset.f; renderMusic(); break;
    case "play": if (x) playUri(x.uri); break;
    case "move": {
      if (!x) break;
      const ex = musicFolders(), v = prompt(`Carpeta para «${x.name || "este link"}»${ex.length ? `\nExistentes: ${ex.join(", ")}` : ""}\n(vacío = sin carpeta)`, x.folder || "");
      if (v === null) break;
      x.folder = v.trim().slice(0, 40); save(); renderMusic(); break;
    }
    case "del": if (x) { S.music = S.music.filter((m) => m.id !== x.id); save(); renderMusic(); updateMini(); toast("Quitado de la lista"); } break;
  }
});

function initMusic() {
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const first = nowM.uri;
    IFrameAPI.createController($("#pl-embed"), { uri: first, width: "100%", height: 152, theme: "dark" }, (ctrl) => {
      embedCtl = ctrl;
      if (nowM.uri !== first) ctrl.loadUri(nowM.uri);   // elegiste otra cosa mientras cargaba
      ctrl.addListener("ready", () => tryPlay());
      ctrl.addListener("playback_update", (e) => {
        const d = e.data, was = isPlaying;
        isPlaying = !d.isPaused;
        if (isPlaying) wantPlay = false;   // ya arrancó: no volver a forzar el play si después pausás
        if (isPlaying && !was) scPause();   // que no suenen Spotify y SoundCloud a la vez
        $("#mini-prog").style.width = d.duration ? Math.min(100, (d.position / d.duration) * 100) + "%" : "0%";
        if (was !== isPlaying) { updateMini(); if (musicOpen()) renderMusic(); }
      });
    });
  };
  const s = document.createElement("script"); s.src = "https://open.spotify.com/embed/iframe-api/v1"; s.async = true; document.head.appendChild(s);
  musicReady = true; updateMini(); renderMusic();
}

/* =========================================================
   SoundCloud: segundo reproductor, al lado del de Spotify.
   El widget de SoundCloud solo reproduce links: no trae buscador y
   su búsqueda por API pide credenciales. Entonces: busco en SoundCloud
   (link "Buscar en SoundCloud"), pego el link acá, lo escucho o lo guardo
   en mi lista. Y a diferencia de Spotify, este sí deja subir y bajar el volumen.
   ========================================================= */
var scReady = false;
const SC_LAST = "manuhq-lastsc", SC_VOL = "manuhq-scvol";   // lo último que sonó y el volumen: de este dispositivo
const SC_RE = /https?:\/\/(?:www\.|m\.)?soundcloud\.com\/[^\s"'<>]+/gi;
const scClean = (u) => { try { return "https://soundcloud.com" + new URL(u).pathname.replace(/\/+$/, ""); } catch (e) { return null; } };
const scLinks = (txt) => [...new Set([...String(txt).matchAll(SC_RE)].map((m) => scClean(m[0])).filter((u) => u && u.split("/").length >= 4))];
const scShort = (u) => u.replace("https://soundcloud.com/", "");
let scw = null, scApiP = null, scPlaying = false;
let scNow = (() => { try { return JSON.parse(lsGet(SC_LAST)); } catch (e) { return null; } })();   // { url, title }
if (!scNow || !scLinks(scNow.url || "").length) scNow = null;
const scq = { q: "" };
const scEl = $("#sc");
const scOpen = () => scEl.classList.contains("open");
const scVol = () => { const raw = lsGet(SC_VOL), v = raw === null ? 100 : +raw; return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 100; };
const scName = () => scNow?.title || S.sc.find((x) => x.url === scNow?.url)?.name || "";
const spPause = () => { if (embedCtl && isPlaying) { wantPlay = false; embedCtl.pause(); } };   // que no suenen los dos a la vez
const scPause = () => { if (scw && scPlaying) scw.pause(); };

function updateSc() {
  $("#scmini").classList.toggle("on", scPlaying);
  $("#scmini-title").textContent = scName() || "SoundCloud";
  $("#scmini-open").title = scName();
  $("#scmini-play").setAttribute("aria-label", scPlaying ? "Pausar SoundCloud" : "Reproducir SoundCloud");
}
function scApi() {   // la API de SoundCloud se carga recién cuando la usás
  if (window.SC?.Widget) return Promise.resolve();
  return scApiP || (scApiP = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = "https://w.soundcloud.com/player/api.js"; s.onload = res;
    s.onerror = () => { scApiP = null; rej(new Error("SoundCloud no cargó")); };
    document.head.appendChild(s);
  }));
}
const scSrc = (url) => "https://w.soundcloud.com/player/?" + new URLSearchParams({ url, auto_play: "true", show_comments: "false", hide_related: "true", visual: "false", show_teaser: "false" });
function scBind() {
  const E = SC.Widget.Events, refresh = () => { updateSc(); if (scOpen()) renderSc(); };
  scw.bind(E.READY, () => { scw.setVolume(scVol()); scInfo(); });
  scw.bind(E.PLAY, () => { scPlaying = true; spPause(); refresh(); scInfo(); });
  scw.bind(E.PAUSE, () => { scPlaying = false; refresh(); });
  scw.bind(E.FINISH, () => { scPlaying = false; refresh(); });
  scw.bind(E.PLAY_PROGRESS, (e) => { $("#scmini-prog").style.width = Math.min(100, (e.relativePosition || 0) * 100) + "%"; });
  scw.bind(E.ERROR, () => toast("SoundCloud no pudo reproducir ese link"));
}
function scInfo() {   // el título de lo que suena (en una playlist, la canción de ahora)
  if (!scw) return;
  scw.getCurrentSound((s) => {
    if (!s || !scNow) return;
    scNow.title = s.title + (s.user?.username ? " · " + s.user.username : "");
    lsSet(SC_LAST, JSON.stringify(scNow)); updateSc();
  });
}
async function scPlayUrl(url) {
  if (url === scNow?.url && scw) { scw.toggle(); return; }   // el mismo: pausa o sigue
  scNow = { url, title: "" }; lsSet(SC_LAST, JSON.stringify(scNow)); scPlaying = false; updateSc(); renderSc();
  try { await scApi(); } catch (e) { toast("No pude cargar SoundCloud. Probá de nuevo."); return; }
  const box = $("#sc-player");
  if (!scw) {
    box.innerHTML = "";
    const f = document.createElement("iframe");
    f.title = "SoundCloud"; f.allow = "autoplay"; f.src = scSrc(url); box.appendChild(f);
    scw = SC.Widget(f); scBind();
  } else scw.load(url, { auto_play: true, show_comments: false, hide_related: true, visual: false });
}

/* Nombre y portada de cada link, desde el oEmbed público de SoundCloud */
const scEnriched = new Set();
async function enrichSc(it) {
  if (scEnriched.has(it.id) || (it.name && it.img)) return;
  scEnriched.add(it.id);
  try {
    const r = await fetch("https://soundcloud.com/oembed?format=json&url=" + encodeURIComponent(it.url));
    const x = S.sc.find((m) => m.id === it.id); if (!x) return;
    if (r.status === 404) x.name = x.name || "Link no encontrado";
    else { const j = await r.json(); x.name = x.name || j.title || ""; x.img = j.thumbnail_url || ""; }
    save(); renderSc(); updateSc();
  } catch (e) { /* sin conexión: queda para la próxima vez que abras el menú */ }
}
function renderSc() {
  if (!scReady) return;
  const q = scq.q.trim(), urls = scLinks(q), isUrl = urls.length > 0;
  const terms = plain(q).split(/\s+/).filter(Boolean);
  const list = isUrl ? [] : S.sc.filter((x) => terms.every((t) => plain(`${x.name} ${scShort(x.url)}`).includes(t)));
  const row = (x) => `<li class="mm-row ${x.url === scNow?.url ? "on" : ""}">
    <button class="mm-main" type="button" data-s="play" data-id="${x.id}">
      <span class="mm-cov" ${x.img ? `style="background-image:url('${esc(x.img)}')"` : ""}></span>
      <span class="mm-t"><b>${esc(x.name || "Cargando…")}</b><small>${esc(scShort(x.url))}</small></span>
      ${x.url === scNow?.url && scPlaying ? `<span class="eq on" aria-hidden="true"><i></i><i></i><i></i></span>` : ""}
    </button>
    <button class="mm-act" type="button" data-s="del" data-id="${x.id}" title="Quitar de la lista" aria-label="Quitar">✕</button></li>`;
  let html = list.map(row).join("");
  if (isUrl) {
    const u = urls[0], saved = S.sc.some((x) => x.url === u);
    html = `<li class="sc-url"><span class="small muted">Link de SoundCloud</span><b>${esc(scShort(u))}</b>
      <div class="inline"><button class="btn btn-primary btn-sm" type="button" data-s="play-url" data-url="${esc(u)}">▶ Reproducir</button>
      ${saved ? `<span class="small muted">Ya está en tu lista</span>` : `<button class="btn btn-sm" type="button" data-s="save-url" data-url="${esc(u)}">Guardar en mi lista</button>`}</div></li>`;
  } else if (!html) html = `<li class="mm-empty">${S.sc.length ? "No hay nada con ese filtro." : "Tu lista está vacía. Buscá música en SoundCloud, copiá el link y pegalo acá."}</li>`;
  if (!isUrl) html += `<li class="mm-ext"><a href="https://soundcloud.com/search${q ? "?q=" + encodeURIComponent(q) : ""}" target="_blank" rel="noopener">${q ? `Buscar «${esc(q)}» en SoundCloud ↗` : "Buscar música en SoundCloud ↗"}</a></li>`;
  $("#sc-list").innerHTML = html;
}
let scFocus = null;
function openSc() {
  if (musicOpen()) closeMusic();
  scFocus = document.activeElement;
  scEl.classList.add("open"); scEl.setAttribute("aria-hidden", "false");
  $("#scmini-open").setAttribute("aria-expanded", "true");
  renderSc(); S.sc.forEach(enrichSc);
  $("#sc .music-panel").focus({ preventScroll: true });
}
function closeSc() {
  scEl.classList.remove("open"); scEl.setAttribute("aria-hidden", "true");
  $("#scmini-open").setAttribute("aria-expanded", "false");
  (scFocus && scFocus.isConnected ? scFocus : $("#scmini-open")).focus({ preventScroll: true });
}
$("#scmini-open").addEventListener("click", () => (scOpen() ? closeSc() : openSc()));
$("#scmini-play").addEventListener("click", () => {
  if (scw) scw.toggle();
  else if (scNow?.url) scPlayUrl(scNow.url);   // retoma lo último que escuchaste
  else openSc();
});
$("#sc-close").addEventListener("click", closeSc);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && scOpen()) closeSc(); });
$("#sc-q").addEventListener("input", (e) => { scq.q = e.target.value; renderSc(); });
$("#sc-vol").value = scVol(); $("#sc-vol-n").textContent = scVol();
$("#sc-vol").addEventListener("input", (e) => { const v = +e.target.value; $("#sc-vol-n").textContent = v; lsSet(SC_VOL, String(v)); if (scw) scw.setVolume(v); });
$("#sc-add-btn").addEventListener("click", () => { const f = $("#sc-add"); f.hidden = !f.hidden; if (!f.hidden) f.links.focus(); });
function scSave(urls) {
  const have = new Set(S.sc.map((x) => x.url)), added = [];
  for (const url of urls) { if (have.has(url)) continue; have.add(url); added.push({ id: uid(), url, name: "", img: "", date: today() }); }
  if (added.length) { S.sc.unshift(...added); save(); renderSc(); added.forEach(enrichSc); }
  return { added: added.length, dup: urls.length - added.length };
}
$("#sc-add").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, urls = scLinks(f.links.value);
  if (!urls.length) { toast("No encontré links de SoundCloud"); return; }
  const r = scSave(urls);
  f.reset(); f.hidden = true;
  toast(`${r.added} agregado${r.added === 1 ? "" : "s"}${r.dup ? ` · ${r.dup} ya estaba${r.dup === 1 ? "" : "n"}` : ""}`);
});
scEl.addEventListener("click", (e) => {
  if (e.target === scEl) { closeSc(); return; }   // clic en lo opaco de atrás
  const b = e.target.closest("[data-s]"); if (!b) return;
  const x = S.sc.find((m) => m.id === b.dataset.id);
  switch (b.dataset.s) {
    case "play": if (x) scPlayUrl(x.url); break;
    case "play-url": scPlayUrl(b.dataset.url); break;
    case "save-url": scSave([b.dataset.url]); toast("Guardado en tu lista"); break;
    case "del": if (x) { S.sc = S.sc.filter((m) => m.id !== x.id); save(); renderSc(); updateSc(); toast("Quitado de la lista"); } break;
  }
});
scReady = true; updateSc(); renderSc();


/* =========================================================
   Pantalla de entrada
   ========================================================= */
let entered = false;
function enter() {
  if (entered) return;
  entered = true;
  $("#splash").classList.add("hidden");
  wantPlay = true;
  tryPlay();
  clearInterval(clockTimer);
}
$("#enter-btn").addEventListener("click", enter);
document.addEventListener("keydown", (e) => { if (!entered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); enter(); } });
function updateSplash() {
  const d = ROUTINE[new Date().getDay()];
  $("#splash-session").innerHTML = sessionName(d);
  $("#splash-block").textContent = blockLabel();
}
const q0 = JUDO_QUOTES[quoteIdx];
$("#splash-quote").innerHTML = `<blockquote>“${esc(q0[0])}”</blockquote><figcaption>${esc(q0[1])}</figcaption>`;
const dateStr = new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" });
$("#splash-date").textContent = dateStr;
$("#top-date").textContent = dateStr;
const tick = () => { $("#splash-clock").textContent = new Date().toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); };
tick();
const clockTimer = setInterval(tick, 10000);

updateSplash();
render();
loadPlan73();
initMusic();
mediaInit();

/* ---------- Temas de color (se guardan en este dispositivo, no se sincronizan) ---------- */
const THEMES = [["noche", "Noche", "#05060a", "#4d7cff"], ["grafito", "Grafito", "#0d0d10", "#a3b0ff"], ["bosque", "Bosque", "#050b08", "#3fcf8e"], ["atardecer", "Atardecer", "#0c0708", "#ff7a59"], ["claro", "Claro", "#f3f4f8", "#3b66e8"]];
const THEME_KEY = "manuhq-theme";
const themeNow = () => document.documentElement.dataset.theme || "noche";
function renderThemePop() {
  const cur = themeNow();
  $("#theme-pop").innerHTML = `<p class="tp-t">Tema de color</p>` + THEMES.map(([k, n, bg, ac]) => `<button type="button" role="menuitemradio" aria-checked="${k === cur}" class="tp-opt ${k === cur ? "on" : ""}" data-theme-set="${k}"><span class="tp-sw" style="background:${bg}"><i style="background:${ac}"></i></span><span>${n}</span><b aria-hidden="true">✓</b></button>`).join("");
}
function applyTheme(t) {
  const th = THEMES.find((x) => x[0] === t) || THEMES[0];
  if (th[0] === "noche") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th[0];
  $("meta[name=theme-color]")?.setAttribute("content", th[2]);
  try { localStorage.setItem(THEME_KEY, th[0]); } catch (e) {}
  renderThemePop();
}
function toggleThemePop(open) {
  const p = $("#theme-pop"), on = open ?? p.hidden;
  p.hidden = !on; $("#theme-btn").setAttribute("aria-expanded", String(on));
}
$("#theme-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleThemePop(); });
$("#theme-pop").addEventListener("click", (e) => { const b = e.target.closest("[data-theme-set]"); if (b) applyTheme(b.dataset.themeSet); });
document.addEventListener("click", (e) => { if (!$("#theme-pop").hidden && !e.target.closest(".theme-wrap")) toggleThemePop(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#theme-pop").hidden) { toggleThemePop(false); $("#theme-btn").focus(); } });
applyTheme((() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })() || "noche");
