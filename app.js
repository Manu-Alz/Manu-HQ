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
const thisMonth = (arr) => arr.filter((x) => x.date && x.date.slice(0, 7) === today().slice(0, 7));
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin storage */ } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) { /* sin storage */ } };
function weekDates() {             // lunes → domingo de esta semana
  const d = new Date(); const off = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - off);
  return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return iso(x); });
}
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Áreas ---------- */
const LABELS = {
  general: "General", gym: "Gym", judo: "Judo", fisico: "Físico", estiramientos: "Estiramientos",
  surf: "Surf", uruguay: "Uruguay", estudio: "Estudio", proyectos: "Proyectos",
};
const TASK_AREAS = ["general", "gym", "judo", "fisico", "surf", "uruguay", "estudio", "proyectos"];
const CONTENT_STAGES = ["Idea", "Grabar", "Editar", "Publicado"];
const CONTENT_CATS = ["judo", "fisico", "estiramientos", "surf", "uruguay"];
const tag = (a) => `<span class="tag ${esc(a)}">${esc(LABELS[a] || a)}</span>`;

const ICONS = {
  inicio: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  rutina: "M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12",
  judo: "M3 9h18v4H3zM10 13l-2.5 8M14 13l2.5 8M12 3v6",
  fisico: "M3 3v18h18M7 15l4-4 3 3 5-6",
  surf: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  uruguay: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  estudio: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  proyectos: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  contenido: "M3 6h13v12H3zM16 10l5-3v10l-5-3",
  ideas: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
};
const NAV = [
  { group: null, items: [["inicio", "Inicio"]] },
  { group: "Cuerpo", items: [["rutina", "Rutina / Gym"], ["judo", "Judo"], ["fisico", "Cambio físico"], ["surf", "Surf"]] },
  { group: "Vida", items: [["uruguay", "Estilo de vida"], ["estudio", "Estudio"]] },
  { group: "Trabajo", items: [["proyectos", "Proyectos"], ["contenido", "Contenido"], ["ideas", "Ideas"]] },
];

/* ---------- Estado ---------- */
const DEFAULT_STATE = {
  tasks: [
    { id: uid(), text: "Grabar primer video de judo", area: "judo", done: false },
    { id: uid(), text: "Foto de progreso inicial (frente/lado/espalda)", area: "fisico", done: false },
  ],
  logs: { gym: [], judo: [], surf: [] },
  weights: [],
  goals: { weight: 73, walking: 75.5 },
  planStart: null,
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
  places: [],
  uyNotes: "",
};

let S = load();
function load() {
  try {
    const raw = lsGet(STORE_KEY);
    if (raw) {
      const s = { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
      s.logs = { ...DEFAULT_STATE.logs, ...s.logs };
      s.waza = s.waza || {};
      return s;
    }
  } catch (e) { /* datos corruptos: arranco limpio */ }
  return structuredClone(DEFAULT_STATE);
}
function save() { lsSet(STORE_KEY, JSON.stringify(S)); }
function commit() { save(); render(); }

/* =========================================================
   Plan-73 (se lee en vivo de tu página)
   ========================================================= */
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
let ROUTINE = [
  { letter: "—", title: "Descanso + estiramiento largo", tag: "estiramientos", items: [{ n: "Estiramiento largo", rx: "30–60 min" }] },
  { letter: "A", title: "Fuerza máxima, piernas", tag: "gym", items: [{ n: "Sentadilla trasera", key: true }, { n: "Peso muerto rumano" }, { n: "Sentadilla búlgara" }, { n: "Curl nórdico" }] },
  { letter: "B", title: "Fuerza máxima, tren superior", tag: "gym", items: [{ n: "Dominadas con lastre", key: true }, { n: "Press de banca" }, { n: "Remo con barra" }, { n: "Press militar de pie" }] },
  { letter: "S", title: "Sprints + movilidad", tag: "fisico", items: [{ n: "Sprints de 20 s" }, { n: "Movilidad" }] },
  { letter: "C", title: "Potencia de judo: cadera y piernas", tag: "judo", items: [{ n: "Peso muerto con barra hexagonal", key: true }, { n: "Uchikomi con banda elástica" }] },
  { letter: "D", title: "Tirón, agarre y volumen", tag: "gym", items: [{ n: "Dominadas agarrado del judogi", key: true }, { n: "Remo con pecho apoyado" }] },
  { letter: "S", title: "Sprints (o randori fuerte)", tag: "fisico", items: [{ n: "Sprints de 20 s" }, { n: "o randori fuerte" }] },
].map((d, i) => ({ ...d, day: i, name: DAY_NAMES[i] }));
let PLAN = null;
let planStatus = "offline";

function planWeek() {
  if (!S.planStart) return null;
  const days = Math.floor((new Date(today() + "T12:00:00") - new Date(S.planStart + "T12:00:00")) / 864e5);
  return days < 0 ? null : Math.floor(days / 7) + 1;
}
function currentBlock() {
  if (!PLAN) return null;
  const find = (id) => PLAN.blocks.find((b) => b.id === id);
  const w = planWeek();
  if (w) {
    if (w <= 4) return { ...find("b1"), deload: w === 4 };
    if (w <= 10) return find("b2");
    if (w <= 16) return find("b3");
    const pos = (w - 17) % 13;
    if (pos === 0) return { ...find("b3"), deload: true };
    return pos <= 6 ? find("b2") : find("b3");
  }
  const id = lsGet("bloque") || "b1";       // el último bloque que abriste en Plan-73
  return find(id) || PLAN.blocks[0];
}
function blockLabel() {
  const b = currentBlock(); if (!b) return "";
  const w = planWeek();
  return `${b.name}${w ? ` · Semana ${w}` : ""}${b.deload ? " · Descarga" : ""}`;
}
function buildRoutine() {
  const b = currentBlock();
  if (!PLAN || !b || PLAN.week.length !== 7) return;
  ROUTINE = PLAN.week.map((w, i) => {
    const day = (i + 1) % 7;
    const L = w.s;
    let items, tg;
    if (b.s[L]) { items = b.s[L].map((e) => ({ n: e[0], rx: e[1], note: e[2], key: !!e[3] })); tg = L === "C" ? "judo" : "gym"; }
    else if (/^S/.test(L)) { items = [{ n: "Sprints de 20 s", note: "Ver tabla de sprints en Plan-73" }, { n: "Movilidad" }]; tg = "fisico"; }
    else { items = [{ n: "Estiramiento largo", rx: "30–60 min" }]; tg = "estiramientos"; }
    return { day, letter: L, title: w.t, sub: w.sub || "", tag: tg, items, warm: PLAN.W && b.s[L] ? PLAN.W : null, stretch: PLAN.SS ? PLAN.SS[L] : null };
  }).sort((a, c) => a.day - c.day).map((d) => ({ ...d, name: DAY_NAMES[d.day] }));
}
async function loadPlan73() {
  try {
    const cached = JSON.parse(lsGet("manuhq-plan73") || "null");
    if (cached) { PLAN = cached; planStatus = "cache"; buildRoutine(); }
  } catch (e) { /* ignorar */ }
  try {
    const html = await fetch(PLAN73, { cache: "no-cache" }).then((r) => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const week = [...doc.querySelectorAll(".week .day")].map((el) => ({
      d: el.querySelector(".d")?.textContent.trim(),
      s: el.querySelector(".s")?.textContent.trim(),
      t: (el.querySelector(".t b") || el.querySelector(".t"))?.textContent.trim(),
      sub: el.querySelector(".t b") ? [...el.querySelector(".t").childNodes].filter((n) => n.nodeName !== "B").map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim() : "",
    }));
    // Los bloques están como JS en mi propia página de Plan-73: tomo esa parte del script y la evalúo.
    const src = [...doc.scripts].map((s) => s.textContent).find((t) => t.includes("const blocks"));
    const code = src.slice(0, src.indexOf("const tabs"));
    const { blocks, W, SS } = new Function(code + ";return {blocks, W: typeof W!=='undefined'?W:null, SS: typeof SS!=='undefined'?SS:null};")();
    PLAN = { week, W, SS, blocks: blocks.map(({ id, name, weeks, title, s }) => ({ id, name, weeks, title, s })) };
    planStatus = "live";
    lsSet("manuhq-plan73", JSON.stringify(PLAN));
    buildRoutine();
  } catch (e) {
    console.warn("No pude leer Plan-73; uso la versión guardada.", e);
  }
  updateSplash();
  render();
}
const isLift = (d) => /^[A-D]$/.test(d.letter);
const isSprint = (d) => /^S/.test(d.letter);
const letterOf = (d) => isLift(d) ? d.letter : isSprint(d) ? "S" : "—";
const sessionName = (d) => `<span class="letter ${isLift(d) ? "" : "plain"}">${isLift(d) ? d.letter : isSprint(d) ? "S" : "·"}</span>${esc(d.title)}`;
const sessionText = (d) => `${isLift(d) ? `${d.letter} · ` : ""}${d.title}${d.sub ? ` (${d.sub})` : ""}`;
const syncBadge = () => ({
  live: `<span class="sync ok">● Sincronizado con Plan-73</span>`,
  cache: `<span class="sync">● Plan-73 (guardado)</span>`,
  offline: `<span class="sync off">● Sin conexión a Plan-73</span>`,
}[planStatus]);

/* =========================================================
   Componentes
   ========================================================= */
const head = (title, sub, actions = "", kicker = "") => `<div class="page-head"><div>${kicker ? `<div class="kicker">${kicker}</div>` : ""}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;

function tasksCard(area, title = "Pendientes", cls = "") {
  const list = area ? S.tasks.filter((t) => t.area === area) : S.tasks;
  const sorted = [...list].sort((a, b) => a.done - b.done);
  return `
  <div class="card ${cls}">
    <div class="card-head"><h2>${title}</h2><span class="sub">${list.filter((t) => !t.done).length} abiertas</span></div>
    <form class="inline" data-form="task" data-area="${area || ""}">
      <input name="text" placeholder="Nueva tarea…" required />
      ${area ? "" : `<select name="area" style="flex:0 1 140px">${TASK_AREAS.map((k) => `<option value="${k}">${LABELS[k]}</option>`).join("")}</select>`}
      <button class="btn btn-primary">Agregar</button>
    </form>
    <ul class="list" style="margin-top:12px">
      ${sorted.map((t) => `
        <li class="${t.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-task" data-id="${t.id}" ${t.done ? "checked" : ""} />
          <span class="grow">${esc(t.text)}</span>
          ${area ? "" : tag(t.area)}
          <button class="del" data-act="del-task" data-id="${t.id}" title="Borrar">✕</button>
        </li>`).join("") || `<li class="empty" style="background:none">Nada pendiente.</li>`}
    </ul>
  </div>`;
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
        </li>`).join("") || `<li class="empty" style="background:none">Vacío.</li>`}
    </ul>
  </div>`;
}

/* Registro genérico: formulario en grilla + tabla */
function fieldHTML(f, val) {
  const v = val ?? (f.type === "date" ? today() : "");
  if (f.type === "select") return `<label class="field ${f.wide ? "wide" : ""}"><span>${f.label}</span><select name="${f.k}">${f.options.map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${ov === v ? "selected" : ""}>${esc(ol)}</option>`; }).join("")}</select></label>`;
  if (f.type === "textarea") return `<label class="field wide"><span>${f.label}</span><textarea name="${f.k}" placeholder="${f.ph || ""}">${esc(v)}</textarea></label>`;
  return `<label class="field ${f.wide ? "wide" : ""}"><span>${f.label}</span><input name="${f.k}" type="${f.type || "text"}" value="${esc(v)}" placeholder="${f.ph || ""}" ${f.step ? `step="${f.step}"` : ""} ${f.req ? "required" : ""} /></label>`;
}
function logForm(key, fields, values = {}, btn = "Guardar") {
  return `<form class="form-grid" data-form="log" data-key="${key}">${fields.map((f) => fieldHTML(f, values[f.k])).join("")}
    <div class="wide"><button class="btn btn-primary">${btn}</button></div></form>`;
}
function logTable(key, fields, limit = 50) {
  const rows = [...S.logs[key]].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, limit);
  const cell = (f, r) => f.type === "date" ? fmtDate(r[f.k]) : f.render ? f.render(r) : esc(r[f.k]);
  return `<div class="table-wrap"><table>
    <thead><tr>${fields.map((f) => `<th class="${f.num ? "num" : ""}">${f.label}</th>`).join("")}<th></th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${fields.map((f) => `<td class="${f.num ? "num" : ""}">${cell(f, r)}</td>`).join("")}<td><button class="del" data-act="del-log" data-key="${key}" data-id="${r.id}">✕</button></td></tr>`).join("")
      || `<tr><td colspan="${fields.length + 1}" class="empty">Todavía no hay registros.</td></tr>`}</tbody>
  </table></div>`;
}

function weightChart() {
  const pts = [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return `<p class="empty">Cargá al menos 2 pesajes para ver la gráfica.</p>`;
  const W = 700, H = 220, P = 30;
  const vals = pts.map((p) => +p.kg).concat([S.goals.weight]);
  const min = Math.floor(Math.min(...vals) - 1), max = Math.ceil(Math.max(...vals) + 1);
  const x = (i) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min);
  const line = pts.map((p, i) => `${x(i)},${y(+p.kg)}`).join(" ");
  const area = `${P},${H - P} ${line} ${W - P},${H - P}`;
  const gy = y(S.goals.weight);
  return `
  <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Evolución del peso">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d7cff" stop-opacity=".35"/><stop offset="1" stop-color="#4d7cff" stop-opacity="0"/></linearGradient></defs>
    <line x1="${P}" x2="${W - P}" y1="${gy}" y2="${gy}" stroke="#7b5cff" stroke-dasharray="6 6" />
    <text x="${W - P}" y="${gy - 6}" fill="#a78bff" font-size="12" text-anchor="end" font-family="Geist Mono">meta ${S.goals.weight} kg</text>
    <text x="4" y="${y(max) + 4}" fill="#5d6580" font-size="11" font-family="Geist Mono">${max}</text>
    <text x="4" y="${y(min) + 4}" fill="#5d6580" font-size="11" font-family="Geist Mono">${min}</text>
    <polygon points="${area}" fill="url(#wg)" />
    <polyline points="${line}" fill="none" stroke="#4d7cff" stroke-width="2.5" stroke-linejoin="round" />
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(+p.kg)}" r="3.5" fill="#4d7cff"><title>${fmtDate(p.date)}: ${p.kg} kg</title></circle>`).join("")}
  </svg>`;
}

function exList(d) {
  return `<ol class="ex-grid">${d.items.map((i) => `<li class="${i.key ? "key" : ""}"><span class="n">${esc(i.n)}</span>${i.rx ? `<span class="rx">${esc(i.rx)}</span>` : ""}</li>`).join("")}</ol>`;
}
function weekStrip(selDay, clickable) {
  const dates = weekDates();
  return `<div class="weekstrip">${[1, 2, 3, 4, 5, 6, 0].map((dow, i) => {
    const d = ROUTINE[dow];
    const done = S.logs.gym.some((l) => l.date === dates[i]);
    const isToday = dow === new Date().getDay();
    return `<button class="wd ${isToday ? "today" : ""} ${selDay === dow ? "sel" : ""}" ${clickable ? `data-act="sel-day" data-day="${dow}"` : `data-act="goto-rutina" data-day="${dow}"`}>
      <span class="dn">${DAY_SHORT[dow]} ${done ? `<span class="ok">✓</span>` : isToday ? `<span class="now"></span>` : ""}</span>
      <span class="lt">${letterOf(d)}</span>
      <span class="dt">${esc(d.title)}${d.sub ? `<br><span class="muted">${esc(d.sub)}</span>` : ""}</span>
    </button>`;
  }).join("")}</div>`;
}

/* =========================================================
   Vistas
   ========================================================= */
let selDay = new Date().getDay();
let wazaF = { belt: "todos", group: "todos", status: "todos", q: "" };
let quoteIdx = Math.floor(Math.random() * JUDO_QUOTES.length);

const VIEWS = {
  inicio() {
    const d = ROUTINE[new Date().getDay()];
    const doneToday = S.logs.gym.some((l) => l.date === today());
    const ws = sortedWeights();
    const lastW = ws[ws.length - 1];
    const hour = new Date().getHours();
    const hi = hour < 6 ? "Buenas noches" : hour < 12 ? "Buen día" : hour < 20 ? "Buenas tardes" : "Buenas noches";
    const dates = weekDates();
    const gymWeek = new Set(S.logs.gym.filter((l) => dates.includes(l.date)).map((l) => l.date)).size;
    const active = S.projects.filter((p) => p.status === "Activo");
    const study = S.study.filter((s) => !s.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")).slice(0, 4);
    const startKg = ws[0]?.kg;
    const pct = lastW && startKg !== undefined && S.goals.walking !== startKg ? Math.max(0, Math.min(100, ((lastW.kg - startKg) / (S.goals.walking - startKg)) * 100)) : 0;
    return `
    ${head(`${hi}, Manu`, "Esto es lo que tenés hoy.", "", new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }))}
    <div class="bento">
      <div class="card hero c-8">
        <div class="card-head" style="margin-bottom:0"><span class="label-sm" style="color:var(--accent)">Hoy toca</span>${syncBadge()}</div>
        <h2>${sessionName(d)}</h2>
        <div class="meta">${d.sub ? `<span class="muted">${esc(d.sub)}</span>` : ""}${tag(d.tag)}<span class="sub mono small muted">${esc(blockLabel())}</span></div>
        ${exList(d)}
        <div class="hero-actions">
          <button class="btn ${doneToday ? "" : "btn-primary"}" data-act="done-today" ${doneToday ? "disabled" : ""}>${doneToday ? "✓ Hecho hoy" : "Marcar como hecho"}</button>
          <a class="btn" href="#rutina">Registrar con pesos</a>
          <a class="btn btn-ghost" href="${PLAN73}" target="_blank" rel="noopener">Plan-73 ↗</a>
        </div>
      </div>
      <div class="c-4 side stack">
        <div class="kpis">
          <div class="kpi"><span class="label-sm">Peso</span><div class="v">${lastW ? lastW.kg : "—"}<small>kg</small></div><div class="d">meta ${S.goals.walking} caminando</div><div class="bar"><i style="width:${pct}%"></i></div></div>
          <div class="kpi"><span class="label-sm">Gym semana</span><div class="v">${gymWeek}<small>/ 4</small></div><div class="d">sesiones A–D</div><div class="bar"><i style="width:${Math.min(100, gymWeek * 25)}%"></i></div></div>
          <div class="kpi"><span class="label-sm">Judo</span><div class="v">${thisMonth(S.logs.judo).length}</div><div class="d">entrenos este mes</div></div>
          <div class="kpi"><span class="label-sm">Surf</span><div class="v">${thisMonth(S.logs.surf).length}</div><div class="d">sesiones este mes</div></div>
        </div>
        <div class="card quote-card">
          <span class="label-sm">Judo · frase</span>
          <blockquote>${esc(JUDO_QUOTES[quoteIdx][0])}</blockquote>
          <span class="src">${esc(JUDO_QUOTES[quoteIdx][1])}</span>
        </div>
      </div>
    </div>
    <div class="bento"><div class="c-12">${weekStrip(null, false)}</div></div>
    <div class="bento">
      ${tasksCard(null, "Tareas", "c-5")}
      <div class="card c-4">
        <div class="card-head"><h2>Ideas</h2><a href="#ideas" class="sub">ver todas (${S.ideas.length})</a></div>
        <ul class="list">${S.ideas.slice(0, 6).map((i) => `<li><span class="grow">${esc(i.text)}</span>${i.tag !== "general" ? tag(i.tag) : ""}</li>`).join("") || `<li class="empty" style="background:none">Usá la barra de arriba para anotar una idea. Se guarda sola.</li>`}</ul>
      </div>
      <div class="c-3 stack">
        <div class="card">
          <div class="card-head"><h2>Proyectos</h2><a href="#proyectos" class="sub">ver</a></div>
          ${active.map((p) => {
            const pc = p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0;
            return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><b style="font-weight:500">${esc(p.name)}</b><span class="sub mono small muted">${pc}%</span></div><div class="progress"><div style="width:${pc}%"></div></div></div>`;
          }).join("") || `<p class="empty">Ninguno activo.</p>`}
        </div>
        <div class="card">
          <div class="card-head"><h2>Estudio</h2><a href="#estudio" class="sub">ver</a></div>
          <ul class="list">${study.map((s) => `<li><span class="grow"><b style="font-weight:500">${esc(s.subject)}</b> · ${esc(s.text)}</span><span class="small muted mono">${fmtDate(s.due)}</span></li>`).join("") || `<li class="empty" style="background:none">Nada pendiente.</li>`}</ul>
        </div>
      </div>
    </div>`;
  },

  rutina() {
    const d = ROUTINE[selDay];
    const b = currentBlock();
    const sessionOpts = [1, 2, 4, 5, 3, 6, 0].map((i) => sessionText(ROUTINE[i])).filter((v, i, a) => a.indexOf(v) === i).concat(["Randori", "Otro"]);
    const key = d.items.find((i) => i.key);
    const liftOpts = [...new Set(ROUTINE.flatMap((r) => r.items.filter((i) => i.key).map((i) => i.n)))].concat(["Press de banca", "Peso muerto rumano", "Otro"]).filter((v, i, a) => a.indexOf(v) === i);
    const gymFields = [
      { k: "date", label: "Fecha", type: "date", req: true },
      { k: "session", label: "Sesión", type: "select", options: sessionOpts },
      { k: "lift", label: "Ejercicio principal", type: "select", options: liftOpts, wide: true },
      { k: "kg", label: "Kg", type: "number", step: "0.5", ph: "0" },
      { k: "reps", label: "Series × reps", ph: "4×6" },
      { k: "rpe", label: "RPE", type: "select", options: ["", "6", "7", "8", "9", "10"] },
      { k: "notes", label: "Notas", type: "textarea", ph: "Cómo te sentiste, PRs, técnica…" },
    ];
    // Mejores marcas por ejercicio principal
    const prs = {};
    S.logs.gym.forEach((l) => { if (l.lift && +l.kg && (!prs[l.lift] || +l.kg > prs[l.lift].kg)) prs[l.lift] = { kg: +l.kg, date: l.date, reps: l.reps }; });
    return `
    ${head("Rutina / Gym", b ? `${esc(b.title)} · ${esc(b.weeks)}` : "Plan-73: fuerza y potencia para judo −73 kg.",
      `${syncBadge()}<a class="btn" href="${PLAN73}" target="_blank" rel="noopener">Plan completo ↗</a>`, esc(blockLabel() || "Plan-73"))}
    <div class="bento"><div class="c-12">${weekStrip(selDay, true)}</div></div>
    <div class="bento">
      <div class="card c-8">
        <div class="card-head">
          <div><span class="label-sm">${d.name}${d.day === new Date().getDay() ? " · hoy" : ""}</span><h2 style="font-size:22px;margin-top:6px">${sessionName(d)}</h2></div>
          ${tag(d.tag)}
        </div>
        ${d.warm ? `<div class="phase">${esc(d.warm)}</div>` : ""}
        <div class="table-wrap"><table class="ex-table">
          <thead><tr><th>#</th><th>Ejercicio</th><th class="num">Series × reps</th><th>Nota</th></tr></thead>
          <tbody>${d.items.map((i, n) => `<tr class="${i.key ? "key" : ""}"><td>${String(n + 1).padStart(2, "0")}</td><td class="n">${esc(i.n)}${i.key ? ` <span class="tag" style="margin-left:6px">principal</span>` : ""}</td><td class="num rx">${esc(i.rx || "")}</td><td class="note">${esc(i.note || "")}</td></tr>`).join("")}</tbody>
        </table></div>
        ${d.stretch ? `<div class="phase str">${esc(d.stretch)}</div>` : ""}
      </div>
      <div class="card c-4 side">
        <div class="card-head"><h2>Registrar sesión</h2></div>
        ${logForm("gym", gymFields, { session: sessionText(d), lift: key ? key.n : liftOpts[0] })}
      </div>
    </div>
    <div class="bento">
      <div class="card c-8">
        <div class="card-head"><h2>Historial</h2><span class="sub">${S.logs.gym.length} sesiones</span></div>
        ${logTable("gym", [
          { k: "date", label: "Fecha", type: "date" }, { k: "session", label: "Sesión" }, { k: "lift", label: "Principal" },
          { k: "kg", label: "Kg", num: true }, { k: "reps", label: "Reps", num: true }, { k: "rpe", label: "RPE", num: true }, { k: "notes", label: "Notas" },
        ], 30)}
      </div>
      <div class="c-4 side stack">
        <div class="card">
          <div class="card-head"><h2>Mejores marcas</h2></div>
          ${Object.keys(prs).length ? `<table><tbody>${Object.entries(prs).map(([n, p]) => `<tr><td>${esc(n)}</td><td class="num rx">${p.kg} kg</td><td class="num small muted">${fmtDate(p.date)}</td></tr>`).join("")}</tbody></table>` : `<p class="empty">Registrá sesiones con kg y aparecen tus récords acá.</p>`}
        </div>
        <div class="card">
          <div class="card-head"><h2>Inicio del plan</h2></div>
          <form class="inline" data-form="planstart">
            <input name="start" type="date" value="${esc(S.planStart || "")}" aria-label="Fecha de inicio del plan" />
            <button class="btn">Guardar</button>
          </form>
          <p class="small muted" style="margin:10px 0 0">${S.planStart ? `Vas por la semana ${planWeek() || "—"}. El bloque cambia solo.` : "Con la fecha de inicio el HQ calcula solo la semana y el bloque. Sin fecha, usa el último bloque que abriste en Plan-73."}</p>
        </div>
      </div>
    </div>`;
  },

  judo() {
    const q = JUDO_QUOTES[quoteIdx];
    const month = thisMonth(S.logs.judo);
    const all = WAZA_GROUPS.flatMap((g) => g.items);
    const dom = all.filter((n) => S.waza[n] === 2).length;
    const learn = all.filter((n) => S.waza[n] === 1).length;
    const judoFields = [
      { k: "date", label: "Fecha", type: "date", req: true },
      { k: "pillar", label: "Pilar", type: "select", options: PILLARS.map((p) => [p.id, p.name]) },
      { k: "type", label: "Tipo", type: "select", options: ["Clase", "Randori", "Uchikomi / Nagekomi", "Ne-waza", "Kata", "Competencia", "Enseñar", "Evento del dojo", "Otro"] },
      { k: "min", label: "Minutos", type: "number", ph: "90" },
      { k: "notes", label: "Qué trabajé / qué mejorar", type: "textarea" },
    ];
    return `
    ${head("Judo", "Judo completo, como lo pensaron Kano y el Kodokan: salud, deporte, comunidad y defensa personal.", "", "柔道 · el camino de la suavidad")}
    <div class="bento">
      ${PILLARS.map((p) => {
        const ent = month.filter((l) => (l.pillar || "deporte") === p.id);
        return `<div class="card pillar c-3"><span class="jp">${p.jp}</span><h3>${p.name}</h3><p>${p.desc}</p>
          <div class="cnt"><span><b>${ent.length}</b>este mes</span><span><b>${ent.reduce((a, l) => a + (+l.min || 0), 0)}</b>minutos</span></div></div>`;
      }).join("")}
    </div>
    <div class="bento">
      <div class="card quote-card c-8">
        <div class="card-head" style="margin:0"><span class="label-sm">Frase del día · ${quoteIdx + 1}/${JUDO_QUOTES.length}</span><button class="btn btn-sm btn-ghost" data-act="next-quote">Otra →</button></div>
        <blockquote>${esc(q[0])}</blockquote>
        <span class="src">${esc(q[1])}</span>
      </div>
      <div class="c-4 side kpis">
        <div class="kpi"><span class="label-sm">Dominadas</span><div class="v">${dom}<small>/ 100</small></div><div class="bar"><i style="width:${dom}%"></i></div></div>
        <div class="kpi"><span class="label-sm">Aprendiendo</span><div class="v">${learn}</div><div class="d">técnicas</div></div>
      </div>
    </div>
    <div class="bento">
      <div class="card c-4 side">
        <div class="card-head"><h2>Registrar entreno</h2></div>
        ${logForm("judo", judoFields)}
      </div>
      <div class="card c-8">
        <div class="card-head"><h2>Diario</h2><span class="sub">${S.logs.judo.length} registros</span></div>
        ${logTable("judo", [
          { k: "date", label: "Fecha", type: "date" },
          { k: "pillar", label: "Pilar", render: (r) => esc((PILLARS.find((p) => p.id === r.pillar) || { name: "—" }).name) },
          { k: "type", label: "Tipo" }, { k: "min", label: "Min", num: true },
          { k: "notes", label: "Notas", render: (r) => esc(r.notes || [r.tech, r.notes].filter(Boolean).join(" · ")) },
        ], 20)}
      </div>
    </div>
    <div class="bento">
      <div class="card c-12">
        <div class="card-head"><div><h2>Las 100 técnicas del Kodokan</h2><span class="small muted">68 nage-waza + 32 katame-waza. Tocá el estado para marcar tu progreso.</span></div></div>
        <div class="filters" id="waza-filters">${wazaFilters()}</div>
        <div id="waza-list">${wazaList()}</div>
        <p class="small muted" style="margin:18px 0 0">Cinturones según el Gokyo (un grupo por cinturón). El programa exacto puede cambiar según tu dojo o federación.</p>
      </div>
    </div>`;
  },

  fisico() {
    const pts = sortedWeights().reverse();
    const first = pts[pts.length - 1], last = pts[0];
    const diff = first && last ? (last.kg - first.kg).toFixed(1) : "—";
    return `
    ${head("Cambio físico", "Peso y progreso. Meta: 0,25–0,4 kg por semana.")}
    <div class="kpis row4" style="margin-bottom:16px">
      <div class="kpi"><span class="label-sm">Peso actual</span><div class="v">${last ? last.kg : "—"}<small>kg</small></div></div>
      <div class="kpi"><span class="label-sm">Cambio total</span><div class="v">${diff > 0 ? "+" : ""}${diff}<small>kg</small></div></div>
      <div class="kpi"><span class="label-sm">Meta caminando</span><div class="v">${S.goals.walking}<small>kg</small></div></div>
      <div class="kpi"><span class="label-sm">Categoría</span><div class="v">−${S.goals.weight}<small>kg</small></div></div>
    </div>
    <div class="bento">
      <div class="card c-8">
        <div class="card-head"><h2>Evolución del peso</h2></div>
        ${weightChart()}
        <form class="form-grid" data-form="weight" style="margin-top:14px">
          ${fieldHTML({ k: "date", label: "Fecha", type: "date" })}
          ${fieldHTML({ k: "kg", label: "Peso (kg)", type: "number", step: "0.1", req: true })}
          ${fieldHTML({ k: "note", label: "Nota", ph: "en ayunas" })}
          <div class="field" style="align-self:end"><button class="btn btn-primary">Agregar pesaje</button></div>
        </form>
      </div>
      <div class="c-4 side stack">
        <div class="card">
          <div class="card-head"><h2>Metas</h2></div>
          <form class="form-grid" data-form="goals">
            ${fieldHTML({ k: "weight", label: "Categoría (kg)", type: "number", step: "0.1" }, S.goals.weight)}
            ${fieldHTML({ k: "walking", label: "Caminando (kg)", type: "number", step: "0.1" }, S.goals.walking)}
            <div class="wide"><button class="btn">Guardar</button></div>
          </form>
        </div>
        ${tasksCard("fisico")}
      </div>
    </div>
    <div class="bento">
      <div class="card c-12">
        <div class="card-head"><h2>Pesajes</h2><span class="sub">${pts.length}</span></div>
        <div class="table-wrap"><table><thead><tr><th>Fecha</th><th class="num">Kg</th><th>Nota</th><th></th></tr></thead><tbody>
          ${pts.map((p) => `<tr><td>${fmtDate(p.date)}</td><td class="num">${esc(p.kg)}</td><td>${esc(p.note)}</td><td><button class="del" data-act="del-weight" data-id="${p.id}">✕</button></td></tr>`).join("") || `<tr><td colspan="4" class="empty">Sin pesajes.</td></tr>`}
        </tbody></table></div>
      </div>
    </div>`;
  },

  surf() {
    const ses = S.logs.surf;
    const avg = ses.length ? (ses.reduce((a, s) => a + (+s.rating || 0), 0) / ses.length).toFixed(1) : "—";
    const f = [
      { k: "date", label: "Fecha", type: "date", req: true },
      { k: "spot", label: "Spot", ph: "La Paloma" },
      { k: "waves", label: "Olas (m)", ph: "1.2" },
      { k: "min", label: "Minutos", type: "number", ph: "90" },
      { k: "rating", label: "Rating", type: "select", options: ["5", "4", "3", "2", "1"] },
      { k: "notes", label: "Notas", type: "textarea" },
    ];
    return `
    ${head("Surf", "Sesiones, spots y condiciones.")}
    <div class="kpis row4" style="margin-bottom:16px">
      <div class="kpi"><span class="label-sm">Sesiones</span><div class="v">${ses.length}</div></div>
      <div class="kpi"><span class="label-sm">Este mes</span><div class="v">${thisMonth(ses).length}</div></div>
      <div class="kpi"><span class="label-sm">En el agua</span><div class="v">${Math.round(ses.reduce((a, s) => a + (+s.min || 0), 0) / 6) / 10}<small>h</small></div></div>
      <div class="kpi"><span class="label-sm">Rating medio</span><div class="v">${avg}<small>/ 5</small></div></div>
    </div>
    <div class="bento">
      <div class="card c-4 side"><div class="card-head"><h2>Nueva sesión</h2></div>${logForm("surf", f)}</div>
      <div class="card c-8"><div class="card-head"><h2>Diario</h2></div>${logTable("surf", f.map((x) => x.k === "min" || x.k === "rating" ? { ...x, num: true } : x))}</div>
    </div>
    <div class="bento">
      ${checklist("spots", "Spots (✓ = ya surfeado)", "Ej: Los Dedos", "c-6")}
      ${tasksCard("surf", "Pendientes", "c-6")}
    </div>`;
  },

  uruguay() {
    return `
    ${head("Estilo de vida", "Lugares, planes, mate, playa y todo lo que hace a la vida en Uruguay.", "", "Uruguay")}
    <div class="bento">
      ${checklist("places", "Lugares y planes", "Ej: Cabo Polonio en invierno", "c-6")}
      ${tasksCard("uruguay", "Pendientes", "c-6")}
      <div class="card c-12">
        <div class="card-head"><h2>Notas libres</h2><span class="sub" id="uy-saved">se guarda solo</span></div>
        <textarea id="uy-notes" style="min-height:220px" placeholder="Hábitos, rutina de mañana, comidas, lo que quieras…">${esc(S.uyNotes)}</textarea>
      </div>
    </div>`;
  },

  estudio() {
    const list = [...S.study].sort((a, b) => a.done - b.done || (a.due || "9").localeCompare(b.due || "9"));
    const subjects = [...new Set(S.study.map((s) => s.subject))];
    return `
    ${head("Estudio", "Materias, entregas y exámenes.")}
    <div class="bento">
      <div class="card c-4 side">
        <div class="card-head"><h2>Agregar</h2></div>
        <form class="form-grid" data-form="study">
          ${fieldHTML({ k: "subject", label: "Materia", req: true, wide: true })}
          ${fieldHTML({ k: "text", label: "Qué hay que hacer", req: true, wide: true })}
          ${fieldHTML({ k: "due", label: "Fecha", type: "date" }, "")}
          <div class="field" style="align-self:end"><button class="btn btn-primary">Agregar</button></div>
        </form>
        ${subjects.length ? `<div style="margin-top:16px;display:flex;gap:6px;flex-wrap:wrap">${subjects.map((s) => `<span class="tag estudio">${esc(s)}</span>`).join("")}</div>` : ""}
      </div>
      <div class="card c-8">
        <div class="card-head"><h2>Pendientes</h2><span class="sub">${S.study.filter((s) => !s.done).length} abiertas</span></div>
        <ul class="list">
          ${list.map((s) => `<li class="${s.done ? "done" : ""}">
            <input type="checkbox" data-act="toggle-study" data-id="${s.id}" ${s.done ? "checked" : ""} />
            <span class="grow"><b style="font-weight:500">${esc(s.subject)}</b> · ${esc(s.text)}</span>
            <span class="small muted mono">${fmtDate(s.due)}</span>
            <button class="del" data-act="del-study" data-id="${s.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin pendientes de estudio.</li>`}
        </ul>
      </div>
    </div>`;
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
    </div>`;
  },

  contenido() {
    return `
    ${head("Contenido", "Videos y posts: judo, cambio físico, estiramientos, surf y Uruguay.")}
    <div class="card" style="margin-bottom:16px">
      <form class="inline" data-form="content">
        <input name="title" placeholder="Idea de video / post" required />
        <select name="cat" style="flex:0 1 180px">${CONTENT_CATS.map((c) => `<option value="${c}">${LABELS[c]}</option>`).join("")}</select>
        <button class="btn btn-primary">Agregar</button>
      </form>
    </div>
    <div class="kanban">
      ${CONTENT_STAGES.map((st, si) => {
        const items = S.content.filter((c) => c.stage === si);
        return `<div class="col"><h3>${st}<span class="muted mono">${items.length}</span></h3>
          ${items.map((c) => `<div class="kcard">${esc(c.title)}
            <div class="row">${tag(c.cat)}<span>
              ${si > 0 ? `<button class="del" data-act="move-content" data-id="${c.id}" data-dir="-1" title="Atrás">←</button>` : ""}
              ${si < 3 ? `<button class="del" data-act="move-content" data-id="${c.id}" data-dir="1" title="Avanzar">→</button>` : ""}
              <button class="del" data-act="del-content" data-id="${c.id}">✕</button></span></div></div>`).join("")}
        </div>`;
      }).join("")}
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
function route() { const r = location.hash.slice(1); return VIEWS[r] ? r : "inicio"; }
function renderNav() {
  const cur = route();
  $("#nav").innerHTML = NAV.map((g) => `${g.group ? `<div class="nav-group">${g.group}</div>` : ""}${g.items.map(([id, label]) =>
    `<a href="#${id}" class="${id === cur ? "active" : ""}"><span class="ni"><svg viewBox="0 0 24 24"><path d="${ICONS[id]}"/></svg></span>${label}</a>`).join("")}`).join("");
}
function render() {
  renderNav();
  $("#view").innerHTML = VIEWS[route()]();
  $("#top-sync").innerHTML = syncBadge();
}
window.addEventListener("hashchange", () => {
  if (route() === "rutina" && !render.keepDay) selDay = new Date().getDay();
  render.keepDay = false;
  render(); window.scrollTo(0, 0); $("#sidebar").classList.remove("open");
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
    case "task": S.tasks.unshift({ id: uid(), text: v.text, area: f.dataset.area || v.area, done: false }); break;
    case "check": S[f.dataset.key].push({ id: uid(), text: v.text, done: false }); break;
    case "log": S.logs[f.dataset.key].push({ id: uid(), ...v }); toast("Guardado ✓"); break;
    case "weight": S.weights.push({ id: uid(), date: v.date || today(), kg: +v.kg, note: v.note }); break;
    case "goals": S.goals = { weight: +v.weight, walking: +v.walking }; break;
    case "planstart": S.planStart = v.start || null; buildRoutine(); updateSplash(); break;
    case "study": S.study.push({ id: uid(), ...v, done: false }); break;
    case "idea": addIdea(v.text, v.tag); break;
    case "content": S.content.push({ id: uid(), title: v.title, cat: v.cat, stage: 0 }); break;
    case "project": S.projects.push({ id: uid(), status: "Activo", tasks: [], ...v }); break;
    case "ptask": S.projects.find((p) => p.id === f.dataset.pid).tasks.push({ id: uid(), text: v.text, done: false }); break;
  }
  commit();
  const sel = `form[data-form="${kind}"]${f.dataset.key ? `[data-key="${f.dataset.key}"]` : ""}${f.dataset.pid ? `[data-pid="${f.dataset.pid}"]` : ""} input:not([type=date])`;
  const again = document.querySelector(sel);
  if (again && kind !== "log") again.focus();
});

function act(el) {
  const { act: a, id, key, pid } = el.dataset;
  const byId = (arr) => arr.find((x) => x.id === id);
  const drop = (arr) => arr.filter((x) => x.id !== id);
  switch (a) {
    case "toggle-task": byId(S.tasks).done = el.checked; break;
    case "del-task": S.tasks = drop(S.tasks); break;
    case "toggle-check": byId(S[key]).done = el.checked; break;
    case "del-check": S[key] = drop(S[key]); break;
    case "del-log": S.logs[key] = drop(S.logs[key]); break;
    case "del-weight": S.weights = drop(S.weights); break;
    case "done-today": S.logs.gym.push({ id: uid(), date: today(), session: sessionText(ROUTINE[new Date().getDay()]), notes: "" }); toast("Sesión registrada ✓"); break;
    case "sel-day": selDay = +el.dataset.day; render(); return;
    case "goto-rutina": selDay = +el.dataset.day; render.keepDay = true; location.hash = "rutina"; return;
    case "toggle-study": byId(S.study).done = el.checked; break;
    case "del-study": S.study = drop(S.study); break;
    case "del-idea": S.ideas = drop(S.ideas); break;
    case "idea-to-content": { const i = byId(S.ideas); S.content.push({ id: uid(), title: i.text, cat: i.tag, stage: 0 }); S.ideas = drop(S.ideas); toast("Pasada a Contenido ✓"); break; }
    case "move-content": { const c = byId(S.content); c.stage = Math.max(0, Math.min(3, c.stage + +el.dataset.dir)); break; }
    case "del-content": S.content = drop(S.content); break;
    case "proj-status": byId(S.projects).status = el.value; break;
    case "del-proj": if (!confirm("¿Borrar este proyecto?")) return; S.projects = drop(S.projects); break;
    case "toggle-ptask": S.projects.find((p) => p.id === pid).tasks.find((t) => t.id === id).done = el.checked; break;
    case "del-ptask": { const p = S.projects.find((p) => p.id === pid); p.tasks = p.tasks.filter((t) => t.id !== id); break; }
    case "next-quote": quoteIdx = (quoteIdx + 1 + Math.floor(Math.random() * (JUDO_QUOTES.length - 1))) % JUDO_QUOTES.length; render(); return;
    case "waza-belt": wazaF.belt = el.dataset.belt; $("#waza-filters").innerHTML = wazaFilters(); refreshWaza(); return;
    case "waza-status": {
      const n = el.dataset.n; S.waza[n] = ((S.waza[n] || 0) + 1) % 3; save();
      const y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    default: return;
  }
  commit();
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (el && el.tagName !== "SELECT" && el.type !== "checkbox") act(el);
});
document.addEventListener("change", (e) => {
  const el = e.target.closest("[data-act]");
  if (el && (el.tagName === "SELECT" || el.type === "checkbox")) act(el);
  const wf = e.target.dataset?.wf;
  if (wf && wf !== "q") { wazaF[wf] = e.target.value; refreshWaza(); }
});
let uyTimer;
document.addEventListener("input", (e) => {
  if (e.target.dataset?.wf === "q") { wazaF.q = e.target.value; refreshWaza(); return; }
  if (e.target.id !== "uy-notes") return;
  S.uyNotes = e.target.value;
  clearTimeout(uyTimer);
  uyTimer = setTimeout(() => { save(); const s = $("#uy-saved"); if (s) s.textContent = "guardado ✓"; }, 400);
});

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
    S = { ...structuredClone(DEFAULT_STATE), ...data }; S.logs = { ...DEFAULT_STATE.logs, ...S.logs };
    commit();
  } catch { alert("Ese archivo no es un backup válido."); }
  e.target.value = "";
});
$("#menu-btn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
document.addEventListener("click", (e) => {
  const sb = $("#sidebar");
  if (sb.classList.contains("open") && !sb.contains(e.target) && !e.target.closest("#menu-btn")) sb.classList.remove("open");
});

/* =========================================================
   Música: reproductor de Spotify embebido, en modo oscuro,
   fijo abajo. Funciona con la cuenta gratis.
   ========================================================= */
let wantPlay = false, embedCtl = null, isPlaying = false;
/* Reintenta el play: si entrás mientras el reproductor todavía carga, la primera orden se puede perder */
function tryPlay(n = 25) {
  if (isPlaying || !wantPlay) return;
  if (embedCtl) embedCtl.play();
  if (n > 0) setTimeout(() => tryPlay(n - 1), 1200);
}
function setPlayerHidden(h) { document.body.classList.toggle("pl-hidden", h); lsSet("manuhq-pl-hidden", h ? "1" : ""); }
$("#pl-min").addEventListener("click", () => setPlayerHidden(true));
$("#pl-restore").addEventListener("click", () => setPlayerHidden(false));
if (lsGet("manuhq-pl-hidden")) setPlayerHidden(true);

function initMusic() {
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    IFrameAPI.createController($("#pl-embed"), { uri: PLAYLIST, width: "100%", height: 80, theme: "dark" }, (ctrl) => {
      embedCtl = ctrl;
      ctrl.addListener("ready", () => tryPlay());
      ctrl.addListener("playback_update", (e) => {
        const playing = !e.data.isPaused; isPlaying = playing;
        if (playing) wantPlay = false;   // ya arrancó: no volver a forzar el play si después pausás
        $("#pl-restore").classList.toggle("playing", playing);
        $("#player").classList.toggle("playing", playing);
      });
    });
  };
  const s = document.createElement("script"); s.src = "https://open.spotify.com/embed/iframe-api/v1"; s.async = true; document.head.appendChild(s);
}

/* Atajo: barra espaciadora = play/pausa (si no estás escribiendo) */
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || !entered || /INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) return;
  e.preventDefault();
  if (embedCtl) embedCtl.togglePlay();
});

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
