/* =========================================================
   MANU HQ — hub personal
   Todo se guarda en localStorage (este navegador).
   Usá Exportar/Importar para pasar los datos entre dispositivos.
   ========================================================= */

const PLAYLIST = "spotify:playlist:1sBTc7WolPCShgS43THVEC";
const PLAN73 = "https://manu-alz.github.io/Plan-73/";
const STORE_KEY = "manuhq-v1";

/* ---------- Rutina — se sincroniza en vivo con Plan-73 ----------
   Índice = getDay(): 0 domingo. Esto es solo el respaldo si no hay conexión. */
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
let ROUTINE = [
  { letter: "—", title: "Descanso + estiramiento largo", tag: "estiramientos", items: [{ n: "Estiramiento largo", rx: "30–60 min" }] },
  { letter: "A", title: "Fuerza máxima, piernas", tag: "gym", items: [{ n: "Sentadilla trasera", key: true }, { n: "Peso muerto rumano" }, { n: "Sentadilla búlgara" }, { n: "Curl nórdico" }] },
  { letter: "B", title: "Fuerza máxima, tren superior", tag: "gym", items: [{ n: "Dominadas con lastre", key: true }, { n: "Press de banca" }, { n: "Remo con barra" }, { n: "Press militar de pie" }] },
  { letter: "S", title: "Sprints + movilidad", tag: "fisico", items: [{ n: "Sprints de 20 s" }, { n: "Movilidad" }] },
  { letter: "C", title: "Potencia de judo: cadera y piernas", tag: "judo", items: [{ n: "Peso muerto con barra hexagonal", key: true }, { n: "Uchikomi con banda elástica" }] },
  { letter: "D", title: "Tirón, agarre y volumen", tag: "gym", items: [{ n: "Dominadas agarrado del judogi", key: true }, { n: "Remo con pecho apoyado" }] },
  { letter: "S", title: "Sprints (o randori fuerte)", tag: "fisico", items: [{ n: "Sprints de 20 s" }, { n: "o randori fuerte" }] },
].map((d, i) => ({ ...d, name: DAY_NAMES[i] }));

let PLAN = null;          // { week:[{d,s,t}], blocks:[{id,name,weeks,title,s}] }
let planStatus = "offline";

/* Semana del plan según la fecha de inicio (si la cargaste en Rutina) */
function planWeek() {
  if (!S.planStart) return null;
  const days = Math.floor((new Date(today() + "T12:00:00") - new Date(S.planStart + "T12:00:00")) / 864e5);
  return days < 0 ? null : Math.floor(days / 7) + 1;
}
/* Bloque actual: por semana del plan → si no, el último que abriste en Plan-73 → si no, Bloque 1 */
function currentBlock() {
  if (!PLAN) return null;
  const find = (id) => PLAN.blocks.find((b) => b.id === id);
  const w = planWeek();
  if (w) {
    if (w <= 4) return { ...find("b1"), deload: w === 4 };
    if (w <= 10) return find("b2");
    if (w <= 16) return find("b3");
    const pos = (w - 17) % 13;            // después de la 16: descarga y se repite desde el bloque 2
    if (pos === 0) return { ...find("b3"), deload: true };
    return pos <= 6 ? find("b2") : find("b3");
  }
  let id = "b1";
  try { id = localStorage.getItem("bloque") || "b1"; } catch (e) { /* ignorar */ }
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
    const day = (i + 1) % 7;               // la semana de Plan-73 arranca el lunes
    const L = w.s;
    let items, tag;
    if (b.s[L]) {
      items = b.s[L].map((e) => ({ n: e[0], rx: e[1], note: e[2], key: !!e[3] }));
      tag = L === "C" ? "judo" : "gym";
    } else if (L === "S") {
      items = [{ n: "Sprints de 20 s" }, { n: "Movilidad" }]; tag = "fisico";
    } else {
      items = [{ n: "Estiramiento largo", rx: "30–60 min" }]; tag = "estiramientos";
    }
    return { day, letter: L, title: w.t, tag, items };
  }).sort((a, b2) => a.day - b2.day).map((d) => ({ ...d, name: DAY_NAMES[d.day] }));
}
async function loadPlan73() {
  try {
    const cached = JSON.parse(localStorage.getItem("manuhq-plan73") || "null");
    if (cached) { PLAN = cached; planStatus = "cache"; buildRoutine(); }
  } catch (e) { /* ignorar */ }
  try {
    const html = await fetch(PLAN73, { cache: "no-cache" }).then((r) => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const week = [...doc.querySelectorAll(".week .day")].map((el) => ({
      d: el.querySelector(".d")?.textContent.trim(),
      s: el.querySelector(".s")?.textContent.trim(),
      t: el.querySelector(".t")?.textContent.trim(),
    }));
    // Los bloques están como JS en mi propia página de Plan-73: tomo esa parte del script y la evalúo.
    const src = [...doc.scripts].map((s) => s.textContent).find((t) => t.includes("const blocks"));
    const code = src.slice(0, src.indexOf("const tabs"));
    const { blocks } = new Function(code + ";return {blocks};")();
    PLAN = { week, blocks: blocks.map(({ id, name, weeks, title, s }) => ({ id, name, weeks, title, s })) };
    planStatus = "live";
    try { localStorage.setItem("manuhq-plan73", JSON.stringify(PLAN)); } catch (e) { /* ignorar */ }
    buildRoutine();
  } catch (e) {
    console.warn("No pude leer Plan-73, uso la versión guardada.", e);
  }
  updateSplash();
  render();
}

const AREAS = {
  general: "General", gym: "Gym", judo: "Judo", fisico: "Físico", estiramientos: "Estiramientos",
  surf: "Surf", uruguay: "Uruguay", estudio: "Estudio", proyectos: "Proyectos",
};

const NAV = [
  { group: null, items: [["inicio", "🏠", "Inicio"]] },
  { group: "Cuerpo", items: [["rutina", "🏋️", "Rutina / Gym"], ["judo", "🥋", "Judo"], ["fisico", "📈", "Cambio físico"], ["estiramientos", "🧘", "Estiramientos"], ["surf", "🏄", "Surf"]] },
  { group: "Vida", items: [["uruguay", "🇺🇾", "Estilo de vida"], ["estudio", "📚", "Estudio"]] },
  { group: "Trabajo", items: [["proyectos", "🚀", "Proyectos"], ["contenido", "🎬", "Contenido"], ["ideas", "💡", "Ideas"]] },
];

const CONTENT_STAGES = ["Idea", "Grabar", "Editar", "Publicado"];
const CONTENT_CATS = ["judo", "fisico", "estiramientos", "surf", "uruguay"];

/* ---------- Estado ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => iso(new Date());

const DEFAULT_STATE = {
  tasks: [
    { id: uid(), text: "Subir este hub a GitHub Pages", area: "proyectos", done: false },
    { id: uid(), text: "Grabar primer video de judo", area: "judo", done: false },
    { id: uid(), text: "Foto de progreso inicial (frente/lado/espalda)", area: "fisico", done: false },
  ],
  logs: { gym: [], judo: [], surf: [], estiramientos: [] },
  weights: [],
  goals: { weight: 73, walking: 75.5 },
  projects: [
    {
      id: uid(), name: "eventospde.com", status: "Activo",
      desc: "Mi empresa de eventos. Web, clientes y crecimiento.",
      url: "https://eventospde.com", repo: "https://github.com/Manu-Alz/eventos-pde",
      tasks: [{ id: uid(), text: "Definir próximas mejoras de la web", done: false }],
    },
    {
      id: uid(), name: "Plan-73", status: "Activo",
      desc: "Mi rutina de fuerza y potencia para judo (−73 kg).",
      url: PLAN73, repo: "https://github.com/Manu-Alz/Plan-73", tasks: [],
    },
  ],
  content: [
    { id: uid(), title: "Mi rutina semanal explicada", cat: "fisico", stage: 0 },
    { id: uid(), title: "Rutina de estiramientos post-judo", cat: "estiramientos", stage: 0 },
  ],
  ideas: [],
  study: [],
  stretchRoutine: ["Isquios (2 min)", "Flexores de cadera (2 min)", "Aductores / mariposa", "Hombros y pecho", "Columna torácica", "Cuello"],
  stretchDays: [],
  techniques: [{ id: uid(), text: "Seoi nage", done: false }, { id: uid(), text: "Uchi mata", done: false }],
  spots: [{ id: uid(), text: "La Paloma", done: false }, { id: uid(), text: "Punta del Diablo", done: false }, { id: uid(), text: "Playa Brava", done: false }],
  places: [],
  uyNotes: "",
};

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch (e) { /* sin storage disponible */ }
  return structuredClone(DEFAULT_STATE);
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignorar */ }
}
function commit() { save(); render(); }

/* ---------- Helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("es-UY", { day: "numeric", month: "short" }) : "";
const thisMonth = (arr) => arr.filter((x) => x.date && x.date.slice(0, 7) === today().slice(0, 7));
const tag = (a) => `<span class="tag ${esc(a)}">${esc(AREAS[a] || a)}</span>`;
const $ = (sel) => document.querySelector(sel);

function stretchStreak() {
  const set = new Set(S.stretchDays);
  let n = 0; const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1); // la racha sigue si hoy todavía no estiraste
  while (set.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- Componentes reutilizables ---------- */
function tasksCard(area, title = "Pendientes") {
  const list = area ? S.tasks.filter((t) => t.area === area) : S.tasks;
  const sorted = [...list].sort((a, b) => a.done - b.done);
  return `
  <div class="card">
    <div class="card-head"><h2>${title}</h2><span class="muted small">${list.filter((t) => !t.done).length} abiertas</span></div>
    <form class="inline" data-form="task" data-area="${area || ""}">
      <input name="text" placeholder="Nueva tarea…" required />
      ${area ? "" : `<select name="area">${Object.entries(AREAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>`}
      <button class="btn btn-primary">+</button>
    </form>
    <ul class="list" style="margin-top:12px">
      ${sorted.map((t) => `
        <li class="${t.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-task" data-id="${t.id}" ${t.done ? "checked" : ""} />
          <span class="grow">${esc(t.text)}</span>
          ${area ? "" : tag(t.area)}
          <button class="del" data-act="del-task" data-id="${t.id}" title="Borrar">✕</button>
        </li>`).join("") || `<li class="empty" style="background:none">Nada pendiente 👌</li>`}
    </ul>
  </div>`;
}

/* Lista simple con check (técnicas, spots, lugares…) */
function checklist(key, title, placeholder) {
  return `
  <div class="card">
    <div class="card-head"><h2>${title}</h2></div>
    <form class="inline" data-form="check" data-key="${key}">
      <input name="text" placeholder="${placeholder}" required /><button class="btn btn-primary">+</button>
    </form>
    <ul class="list" style="margin-top:12px">
      ${S[key].map((t) => `
        <li class="${t.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-check" data-key="${key}" data-id="${t.id}" ${t.done ? "checked" : ""} />
          <span class="grow">${esc(t.text)}</span>
          <button class="del" data-act="del-check" data-key="${key}" data-id="${t.id}">✕</button>
        </li>`).join("") || `<li class="empty" style="background:none">Vacío</li>`}
    </ul>
  </div>`;
}

/* Registro genérico con formulario + tabla */
function logCard(key, title, fields) {
  const rows = [...S.logs[key]].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const input = (f) => {
    if (f.type === "select") return `<select name="${f.k}">${f.options.map((o) => `<option>${o}</option>`).join("")}</select>`;
    return `<input name="${f.k}" type="${f.type || "text"}" placeholder="${f.label}" ${f.type === "date" ? `value="${today()}"` : ""} ${f.step ? `step="${f.step}"` : ""} ${f.req ? "required" : ""} />`;
  };
  return `
  <div class="card">
    <div class="card-head"><h2>${title}</h2><span class="muted small">${rows.length} registros</span></div>
    <form class="inline" data-form="log" data-key="${key}">
      ${fields.map(input).join("")}
      <button class="btn btn-primary">Guardar</button>
    </form>
    <div class="table-wrap" style="margin-top:14px">
      <table>
        <thead><tr>${fields.map((f) => `<th>${f.label}</th>`).join("")}<th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr>${fields.map((f) => `<td>${f.type === "date" ? fmtDate(r[f.k]) : esc(r[f.k])}</td>`).join("")}
            <td><button class="del" data-act="del-log" data-key="${key}" data-id="${r.id}">✕</button></td></tr>`).join("")
            || `<tr><td colspan="${fields.length + 1}" class="empty">Todavía no hay registros.</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

function weightChart() {
  const pts = [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return `<p class="empty">Cargá al menos 2 pesajes para ver la gráfica.</p>`;
  const W = 600, H = 200, P = 28;
  const vals = pts.map((p) => +p.kg).concat([S.goals.weight]);
  const min = Math.floor(Math.min(...vals) - 1), max = Math.ceil(Math.max(...vals) + 1);
  const x = (i) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min);
  const line = pts.map((p, i) => `${x(i)},${y(+p.kg)}`).join(" ");
  const gy = y(S.goals.weight);
  return `
  <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Evolución del peso">
    <line x1="${P}" x2="${W - P}" y1="${gy}" y2="${gy}" stroke="var(--accent-2)" stroke-dasharray="6 6" />
    <text x="${W - P}" y="${gy - 6}" fill="var(--accent-2)" font-size="12" text-anchor="end">meta ${S.goals.weight} kg</text>
    <text x="4" y="${y(max) + 4}" fill="var(--muted)" font-size="11">${max}</text>
    <text x="4" y="${y(min) + 4}" fill="var(--muted)" font-size="11">${min}</text>
    <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" />
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(+p.kg)}" r="3.5" fill="var(--accent)"><title>${fmtDate(p.date)}: ${p.kg} kg</title></circle>`).join("")}
  </svg>`;
}

function weekGrid() {
  const now = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `<div class="week">${order.map((i) => {
    const d = ROUTINE[i];
    return `<div class="d ${i === now ? "now" : ""}"><b>${d.name}</b>${tag(d.tag)}<div style="margin-top:6px">${sessionName(d)}</div>
      <ul>${d.items.map((it) => `<li>${itemHTML(it)}</li>`).join("")}</ul></div>`;
  }).join("")}</div>`;
}
const sessionName = (d) => `${/^[A-D]$/.test(d.letter) ? `<span class="letter">${d.letter}</span> ` : ""}${esc(d.title)}`;
const itemHTML = (i) => `<span class="${i.key ? "key" : ""}">${esc(i.n)}</span>${i.rx ? ` <span class="rx">${esc(i.rx)}</span>` : ""}`;
const syncBadge = () => ({
  live: `<span class="sync ok">● Sincronizado con Plan-73</span>`,
  cache: `<span class="sync">● Plan-73 (guardado)</span>`,
  offline: `<span class="sync off">● Sin conexión a Plan-73</span>`,
}[planStatus]);

const head = (title, sub, extra = "") => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${extra}</div>`;

/* ---------- Vistas ---------- */
const VIEWS = {
  inicio() {
    const d = ROUTINE[new Date().getDay()];
    const doneToday = S.logs.gym.some((l) => l.date === today());
    const lastW = [...S.weights].sort((a, b) => b.date.localeCompare(a.date))[0];
    const hour = new Date().getHours();
    const hi = hour < 6 ? "Buenas noches" : hour < 12 ? "Buen día" : hour < 20 ? "Buenas tardes" : "Buenas noches";
    const active = S.projects.filter((p) => p.status === "Activo");
    const study = S.study.filter((s) => !s.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")).slice(0, 4);
    return `
    ${head(`${hi}, Manu 🤙`, new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }))}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card stat"><div class="num">${lastW ? lastW.kg : "—"}<span class="small muted"> kg</span></div><div class="lbl">Peso actual · meta ${S.goals.weight}</div></div>
      <div class="card stat"><div class="num">${thisMonth(S.logs.judo).length}</div><div class="lbl">Entrenos de judo este mes</div></div>
      <div class="card stat"><div class="num">${thisMonth(S.logs.surf).length}</div><div class="lbl">Sesiones de surf este mes</div></div>
      <div class="card stat"><div class="num">${stretchStreak()}🔥</div><div class="lbl">Racha de estiramientos</div></div>
    </div>
    <div class="grid g2">
      <div class="card today">
        <div class="card-head"><span class="eyebrow-sm">Hoy toca${blockLabel() ? ` · ${esc(blockLabel())}` : ""}</span>${tag(d.tag)}</div>
        <div class="day">${sessionName(d)}</div>
        <ol class="ex">${d.items.map((i) => `<li>${itemHTML(i)}</li>`).join("")}</ol>
        <div class="small" style="margin-bottom:12px">${syncBadge()}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn ${doneToday ? "" : "btn-primary"}" data-act="done-today" ${doneToday ? "disabled" : ""}>${doneToday ? "✓ Hecho hoy" : "Marcar como hecho"}</button>
          <a class="btn btn-ghost" href="${PLAN73}" target="_blank" rel="noopener">Abrir Plan-73 ↗</a>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>💡 Idea rápida</h2><a href="#ideas" class="small">ver todas</a></div>
        <form class="inline" data-form="idea"><input name="text" placeholder="Anotá lo que se te ocurra…" required />
          <select name="tag"><option value="general">General</option>${CONTENT_CATS.concat(["proyectos", "estudio"]).map((c) => `<option value="${c}">${AREAS[c]}</option>`).join("")}</select>
          <button class="btn btn-primary">+</button></form>
        <ul class="list" style="margin-top:12px">${S.ideas.slice(0, 4).map((i) => `<li><span class="grow">${esc(i.text)}</span>${tag(i.tag)}</li>`).join("") || `<li class="empty" style="background:none">Sin ideas todavía.</li>`}</ul>
      </div>
      ${tasksCard(null, "✅ Todas las tareas")}
      <div class="grid">
        <div class="card">
          <div class="card-head"><h2>🚀 Proyectos activos</h2><a href="#proyectos" class="small">ver</a></div>
          ${active.map((p) => {
            const pct = p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0;
            return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><b>${esc(p.name)}</b><span class="small muted">${pct}%</span></div><div class="progress"><div style="width:${pct}%"></div></div></div>`;
          }).join("") || `<p class="empty">Ninguno activo.</p>`}
        </div>
        <div class="card">
          <div class="card-head"><h2>📚 Estudio próximo</h2><a href="#estudio" class="small">ver</a></div>
          <ul class="list">${study.map((s) => `<li><span class="grow"><b>${esc(s.subject)}</b> · ${esc(s.text)}</span><span class="small muted">${fmtDate(s.due)}</span></li>`).join("") || `<li class="empty" style="background:none">Nada pendiente.</li>`}</ul>
        </div>
      </div>
    </div>`;
  },

  rutina() {
    return `
    ${head("Rutina / Gym", "Plan-73: fuerza y potencia para judo −73 kg.", `<a class="btn" href="${PLAN73}" target="_blank" rel="noopener">Ver plan completo ↗</a>`)}
    <div class="card" style="margin-bottom:16px">
      <div class="card-head" style="flex-wrap:wrap">
        <div><h2>${esc(currentBlock()?.title || "Semana tipo")}</h2><span class="small muted">${esc(blockLabel())}${currentBlock()?.weeks ? ` · ${esc(currentBlock().weeks)}` : ""}</span></div>
        <span class="small">${syncBadge()}</span>
      </div>
      <form class="inline" data-form="planstart" style="margin-bottom:16px;max-width:520px;align-items:center">
        <label class="small muted" style="flex:0 0 auto">Empecé el plan el</label>
        <input name="start" type="date" value="${esc(S.planStart || "")}" />
        <button class="btn btn-sm">Guardar</button>
      </form>
      ${S.planStart ? "" : `<p class="small muted" style="margin:-8px 0 16px">Cargá la fecha de inicio y el HQ calcula solo en qué semana y bloque estás. Sin fecha, usa el último bloque que abriste en Plan-73.</p>`}
      ${weekGrid()}
    </div>
    <div class="grid g2">
      ${logCard("gym", "Registro de sesiones", [
        { k: "date", label: "Fecha", type: "date", req: true },
        { k: "session", label: "Sesión", type: "select", options: ["A · Piernas", "B · Tren sup.", "C · Potencia", "D · Tirón/agarre", "Sprints", "Movilidad", "Otro"] },
        { k: "notes", label: "Notas / PRs" },
      ])}
      ${tasksCard("gym")}
    </div>`;
  },

  judo() {
    return `
    ${head("Judo 🥋", "Entrenos, randori, técnicas y competencias.")}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card stat"><div class="num">${thisMonth(S.logs.judo).length}</div><div class="lbl">Entrenos este mes</div></div>
      <div class="card stat"><div class="num">${S.logs.judo.reduce((a, l) => a + (+l.min || 0), 0)}</div><div class="lbl">Minutos totales</div></div>
      <div class="card stat"><div class="num">${S.logs.judo.filter((l) => l.type === "Randori").length}</div><div class="lbl">Randoris</div></div>
      <div class="card stat"><div class="num">${S.techniques.filter((t) => t.done).length}/${S.techniques.length}</div><div class="lbl">Técnicas dominadas</div></div>
    </div>
    <div class="grid g2">
      <div class="span2">${logCard("judo", "Diario de entrenos", [
        { k: "date", label: "Fecha", type: "date", req: true },
        { k: "type", label: "Tipo", type: "select", options: ["Técnica", "Randori", "Uchikomi", "Competencia", "Kata"] },
        { k: "min", label: "Minutos", type: "number" },
        { k: "tech", label: "Técnica trabajada" },
        { k: "notes", label: "Qué aprendí / mejorar" },
      ])}</div>
      ${checklist("techniques", "Técnicas a dominar", "Ej: O soto gari")}
      ${tasksCard("judo")}
    </div>`;
  },

  fisico() {
    const pts = [...S.weights].sort((a, b) => b.date.localeCompare(a.date));
    const first = pts[pts.length - 1], last = pts[0];
    const diff = first && last ? (last.kg - first.kg).toFixed(1) : "—";
    return `
    ${head("Cambio físico 📈", "Peso, medidas y progreso. Meta: 0,25–0,4 kg por semana.")}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card stat"><div class="num">${last ? last.kg : "—"}</div><div class="lbl">Peso actual (kg)</div></div>
      <div class="card stat"><div class="num">${diff > 0 ? "+" : ""}${diff}</div><div class="lbl">Cambio total (kg)</div></div>
      <div class="card stat"><div class="num">${S.goals.walking}</div><div class="lbl">Meta caminando (kg)</div></div>
      <div class="card stat"><div class="num">${S.goals.weight}</div><div class="lbl">Categoría (kg)</div></div>
    </div>
    <div class="grid g2">
      <div class="card span2">
        <div class="card-head"><h2>Evolución del peso</h2></div>
        ${weightChart()}
        <form class="inline" data-form="weight" style="margin-top:12px">
          <input name="date" type="date" value="${today()}" required />
          <input name="kg" type="number" step="0.1" placeholder="Peso (kg)" required />
          <input name="note" placeholder="Nota (ej: en ayunas)" />
          <button class="btn btn-primary">Agregar pesaje</button>
        </form>
        <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Fecha</th><th>Kg</th><th>Nota</th><th></th></tr></thead><tbody>
          ${pts.map((p) => `<tr><td>${fmtDate(p.date)}</td><td>${esc(p.kg)}</td><td>${esc(p.note)}</td><td><button class="del" data-act="del-weight" data-id="${p.id}">✕</button></td></tr>`).join("")}
        </tbody></table></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Metas</h2></div>
        <form class="inline" data-form="goals">
          <label class="small muted" style="flex-basis:100%">Peso de competencia / caminando</label>
          <input name="weight" type="number" step="0.1" value="${S.goals.weight}" />
          <input name="walking" type="number" step="0.1" value="${S.goals.walking}" />
          <button class="btn">Guardar</button>
        </form>
        <p class="small muted" style="margin-top:12px">Tip: sacate fotos de frente, lado y espalda cada 4 semanas, misma luz y hora. Guardalas en una carpeta de Drive/Fotos y pegá el link en una tarea.</p>
      </div>
      ${tasksCard("fisico")}
    </div>`;
  },

  estiramientos() {
    const doneToday = S.stretchDays.includes(today());
    const days = [...Array(28)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (27 - i)); return iso(d); });
    return `
    ${head("Estiramientos 🧘", "Constancia > intensidad. Un poco todos los días.")}
    <div class="grid g2">
      <div class="card today">
        <div class="card-head"><h2>Rutina diaria</h2><span class="small muted">racha: ${stretchStreak()} días 🔥</span></div>
        <ul class="list">${S.stretchRoutine.map((s, i) => `<li><span class="grow">${esc(s)}</span><button class="del" data-act="del-stretch" data-i="${i}">✕</button></li>`).join("")}</ul>
        <form class="inline" data-form="stretch" style="margin-top:10px"><input name="text" placeholder="Agregar estiramiento…" required /><button class="btn">+</button></form>
        <button class="btn ${doneToday ? "" : "btn-primary"}" data-act="stretch-today" style="margin-top:14px">${doneToday ? "✓ Hecho hoy (deshacer)" : "Hice la rutina hoy"}</button>
      </div>
      <div class="card">
        <div class="card-head"><h2>Últimos 28 días</h2></div>
        <div class="streak">${days.map((d) => `<span class="${S.stretchDays.includes(d) ? "on" : ""}" title="${fmtDate(d)}"></span>`).join("")}</div>
        <p class="small muted" style="margin-top:12px">${S.stretchDays.filter((d) => days.includes(d)).length} de 28 días.</p>
      </div>
      ${logCard("estiramientos", "Notas de flexibilidad", [
        { k: "date", label: "Fecha", type: "date", req: true },
        { k: "what", label: "Qué medí (ej: split, pancake)" },
        { k: "notes", label: "Resultado / nota" },
      ])}
      ${tasksCard("estiramientos")}
    </div>`;
  },

  surf() {
    const ses = S.logs.surf;
    const avg = ses.length ? (ses.reduce((a, s) => a + (+s.rating || 0), 0) / ses.length).toFixed(1) : "—";
    return `
    ${head("Surf 🏄", "Sesiones, spots y condiciones.")}
    <div class="grid g3" style="margin-bottom:16px">
      <div class="card stat"><div class="num">${ses.length}</div><div class="lbl">Sesiones totales</div></div>
      <div class="card stat"><div class="num">${ses.reduce((a, s) => a + (+s.min || 0), 0)}</div><div class="lbl">Minutos en el agua</div></div>
      <div class="card stat"><div class="num">${avg}</div><div class="lbl">Rating promedio (1–5)</div></div>
    </div>
    <div class="grid g2">
      <div class="span2">${logCard("surf", "Diario de sesiones", [
        { k: "date", label: "Fecha", type: "date", req: true },
        { k: "spot", label: "Spot" },
        { k: "waves", label: "Olas (m)" },
        { k: "min", label: "Minutos", type: "number" },
        { k: "rating", label: "Rating", type: "select", options: ["5", "4", "3", "2", "1"] },
        { k: "notes", label: "Notas" },
      ])}</div>
      ${checklist("spots", "Spots (✓ = ya surfeado)", "Ej: Los Dedos")}
      ${tasksCard("surf")}
    </div>`;
  },

  uruguay() {
    return `
    ${head("Estilo de vida 🇺🇾", "Lugares, planes, mate, playa y todo lo que hace a la vida en Uruguay.")}
    <div class="grid g2">
      ${checklist("places", "Lugares / planes por hacer", "Ej: Cabo Polonio en invierno")}
      ${tasksCard("uruguay")}
      <div class="card span2">
        <div class="card-head"><h2>Notas libres</h2><span class="small muted" id="uy-saved"></span></div>
        <textarea id="uy-notes" placeholder="Hábitos, rutina de mañana, comidas, lo que quieras…">${esc(S.uyNotes)}</textarea>
      </div>
    </div>`;
  },

  estudio() {
    const list = [...S.study].sort((a, b) => a.done - b.done || (a.due || "9").localeCompare(b.due || "9"));
    return `
    ${head("Estudio 📚", "Materias, entregas y exámenes.")}
    <div class="card">
      <form class="inline" data-form="study">
        <input name="subject" placeholder="Materia" required />
        <input name="text" placeholder="Qué hay que hacer" required />
        <input name="due" type="date" />
        <button class="btn btn-primary">Agregar</button>
      </form>
      <ul class="list" style="margin-top:14px">
        ${list.map((s) => `<li class="${s.done ? "done" : ""}">
          <input type="checkbox" data-act="toggle-study" data-id="${s.id}" ${s.done ? "checked" : ""} />
          <span class="grow"><b>${esc(s.subject)}</b> · ${esc(s.text)}</span>
          <span class="small muted">${fmtDate(s.due)}</span>
          <button class="del" data-act="del-study" data-id="${s.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin pendientes de estudio.</li>`}
      </ul>
    </div>`;
  },

  proyectos() {
    return `
    ${head("Proyectos 🚀", "Todo lo que estoy construyendo.")}
    <div class="grid g2">
      ${S.projects.map((p) => {
        const pct = p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0;
        return `<div class="card project">
          <div class="card-head" style="margin:0">
            <h2>${esc(p.name)}</h2>
            <select data-act="proj-status" data-id="${p.id}" style="width:auto">${["Idea", "Activo", "En pausa", "Terminado"].map((s) => `<option ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select>
          </div>
          <p class="muted" style="margin:0">${esc(p.desc)}</p>
          <div class="links">
            ${p.url ? `<a class="btn btn-sm" href="${esc(p.url)}" target="_blank" rel="noopener">🌐 Sitio</a>` : ""}
            ${p.repo ? `<a class="btn btn-sm" href="${esc(p.repo)}" target="_blank" rel="noopener">⌥ GitHub</a>` : ""}
            <button class="btn btn-sm btn-ghost" data-act="del-proj" data-id="${p.id}">Borrar</button>
          </div>
          <div><div style="display:flex;justify-content:space-between" class="small muted"><span>Progreso</span><span>${pct}%</span></div><div class="progress"><div style="width:${pct}%"></div></div></div>
          <ul class="list">${p.tasks.map((t) => `<li class="${t.done ? "done" : ""}">
            <input type="checkbox" data-act="toggle-ptask" data-pid="${p.id}" data-id="${t.id}" ${t.done ? "checked" : ""} />
            <span class="grow">${esc(t.text)}</span>
            <button class="del" data-act="del-ptask" data-pid="${p.id}" data-id="${t.id}">✕</button></li>`).join("")}</ul>
          <form class="inline" data-form="ptask" data-pid="${p.id}"><input name="text" placeholder="Nueva tarea del proyecto…" required /><button class="btn">+</button></form>
        </div>`;
      }).join("")}
      <div class="card">
        <div class="card-head"><h2>+ Nuevo proyecto</h2></div>
        <form class="grid" data-form="project" style="gap:8px">
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
    ${head("Contenido 🎬", "Pipeline de videos/posts: judo, cambio físico, estiramientos, surf y Uruguay.")}
    <div class="card" style="margin-bottom:16px">
      <form class="inline" data-form="content">
        <input name="title" placeholder="Idea de video / post" required />
        <select name="cat">${CONTENT_CATS.map((c) => `<option value="${c}">${AREAS[c]}</option>`).join("")}</select>
        <button class="btn btn-primary">Agregar</button>
      </form>
    </div>
    <div class="kanban">
      ${CONTENT_STAGES.map((st, si) => {
        const items = S.content.filter((c) => c.stage === si);
        return `<div class="col"><h3>${st}<span class="muted small">${items.length}</span></h3>
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
    ${head("Ideas 💡", "Todo lo que se me ocurre, sin filtro.")}
    <div class="card">
      <form class="inline" data-form="idea">
        <input name="text" placeholder="Nueva idea…" required />
        <select name="tag"><option value="general">General</option>${Object.keys(AREAS).filter((k) => k !== "general").map((c) => `<option value="${c}">${AREAS[c]}</option>`).join("")}</select>
        <button class="btn btn-primary">+</button>
      </form>
      <ul class="list" style="margin-top:14px">
        ${S.ideas.map((i) => `<li><span class="grow">${esc(i.text)}</span>${tag(i.tag)}<span class="small muted">${fmtDate(i.date)}</span>
          ${CONTENT_CATS.includes(i.tag) ? `<button class="btn btn-sm btn-ghost" data-act="idea-to-content" data-id="${i.id}" title="Pasar a Contenido">→ 🎬</button>` : ""}
          <button class="del" data-act="del-idea" data-id="${i.id}">✕</button></li>`).join("") || `<li class="empty" style="background:none">Sin ideas todavía.</li>`}
      </ul>
    </div>`;
  },
};

/* ---------- Router ---------- */
function route() { const r = location.hash.slice(1); return VIEWS[r] ? r : "inicio"; }
function renderNav() {
  const cur = route();
  $("#nav").innerHTML = NAV.map((g) => `${g.group ? `<div class="nav-group">${g.group}</div>` : ""}${g.items.map(([id, ic, label]) => `<a href="#${id}" class="${id === cur ? "active" : ""}"><span>${ic}</span>${label}</a>`).join("")}`).join("");
}
function render() {
  renderNav();
  $("#view").innerHTML = VIEWS[route()]();
}
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); $("#sidebar").classList.remove("open"); });

/* ---------- Formularios ---------- */
document.addEventListener("submit", (e) => {
  const f = e.target.closest("form[data-form]");
  if (!f) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  const kind = f.dataset.form;
  switch (kind) {
    case "task": S.tasks.unshift({ id: uid(), text: v.text, area: f.dataset.area || v.area, done: false }); break;
    case "check": S[f.dataset.key].push({ id: uid(), text: v.text, done: false }); break;
    case "log": S.logs[f.dataset.key].push({ id: uid(), ...v }); break;
    case "weight": S.weights.push({ id: uid(), date: v.date, kg: +v.kg, note: v.note }); break;
    case "planstart": S.planStart = v.start || null; buildRoutine(); updateSplash(); break;
    case "goals": S.goals = { weight: +v.weight, walking: +v.walking }; break;
    case "stretch": S.stretchRoutine.push(v.text); break;
    case "study": S.study.push({ id: uid(), ...v, done: false }); break;
    case "idea": S.ideas.unshift({ id: uid(), text: v.text, tag: v.tag, date: today() }); break;
    case "content": S.content.push({ id: uid(), title: v.title, cat: v.cat, stage: 0 }); break;
    case "project": S.projects.push({ id: uid(), status: "Activo", tasks: [], ...v }); break;
    case "ptask": S.projects.find((p) => p.id === f.dataset.pid).tasks.push({ id: uid(), text: v.text, done: false }); break;
  }
  commit();
  // devolver el foco al primer campo del mismo formulario
  const again = document.querySelector(`form[data-form="${kind}"]${f.dataset.key ? `[data-key="${f.dataset.key}"]` : ""}${f.dataset.pid ? `[data-pid="${f.dataset.pid}"]` : ""} input:not([type=date])`);
  if (again) again.focus();
});

/* ---------- Acciones (clics / cambios) ---------- */
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
    case "done-today": S.logs.gym.push({ id: uid(), date: today(), session: (() => { const d = ROUTINE[new Date().getDay()]; return /^[A-D]$/.test(d.letter) ? `${d.letter} · ${d.title}` : d.title; })(), notes: "" }); break;
    case "del-stretch": S.stretchRoutine.splice(+el.dataset.i, 1); break;
    case "stretch-today": S.stretchDays = S.stretchDays.includes(today()) ? S.stretchDays.filter((d) => d !== today()) : [...S.stretchDays, today()]; break;
    case "toggle-study": byId(S.study).done = el.checked; break;
    case "del-study": S.study = drop(S.study); break;
    case "del-idea": S.ideas = drop(S.ideas); break;
    case "idea-to-content": { const i = byId(S.ideas); S.content.push({ id: uid(), title: i.text, cat: i.tag, stage: 0 }); S.ideas = drop(S.ideas); break; }
    case "move-content": { const c = byId(S.content); c.stage = Math.max(0, Math.min(3, c.stage + +el.dataset.dir)); break; }
    case "del-content": S.content = drop(S.content); break;
    case "proj-status": byId(S.projects).status = el.value; break;
    case "del-proj": if (!confirm("¿Borrar este proyecto?")) return; S.projects = drop(S.projects); break;
    case "toggle-ptask": S.projects.find((p) => p.id === pid).tasks.find((t) => t.id === id).done = el.checked; break;
    case "del-ptask": { const p = S.projects.find((p) => p.id === pid); p.tasks = p.tasks.filter((t) => t.id !== id); break; }
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
});

/* Notas de Uruguay: autoguardado */
let uyTimer;
document.addEventListener("input", (e) => {
  if (e.target.id !== "uy-notes") return;
  S.uyNotes = e.target.value;
  clearTimeout(uyTimer);
  uyTimer = setTimeout(() => { save(); const s = $("#uy-saved"); if (s) s.textContent = "guardado ✓"; }, 400);
});

/* ---------- Exportar / importar ---------- */
$("#export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `manuhq-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!confirm("Esto reemplaza los datos actuales de este navegador. ¿Seguir?")) return;
    S = { ...structuredClone(DEFAULT_STATE), ...data };
    commit();
  } catch { alert("Ese archivo no es un backup válido."); }
  e.target.value = "";
});

/* ---------- Menú móvil ---------- */
$("#menu-btn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#sidebar").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove("open"); });

/* ---------- Spotify ---------- */
let spotify = null, wantPlay = false;
window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController($("#spotify-embed"), { uri: PLAYLIST, width: "100%", height: 152 }, (ctrl) => {
    spotify = ctrl;
    ctrl.addListener("ready", () => { if (wantPlay) ctrl.play(); });
  });
};
const togglePlayer = () => $("#player").classList.toggle("collapsed");
$("#music-toggle").addEventListener("click", togglePlayer);
$("#music-toggle-m").addEventListener("click", togglePlayer);

/* ---------- Pantalla de entrada ---------- */
let entered = false;
function enter() {
  if (entered) return;
  entered = true;
  $("#splash").classList.add("hidden");
  $("#player").classList.remove("collapsed");
  wantPlay = true;
  if (spotify) spotify.play();
  clearInterval(clockTimer);
}
$("#enter-btn").addEventListener("click", enter);
document.addEventListener("keydown", (e) => { if (!entered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); enter(); } });

$("#splash-date").textContent = new Date().toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" });
function updateSplash() {
  const d = ROUTINE[new Date().getDay()];
  $("#splash-session").innerHTML = sessionName(d);
  $("#splash-block").textContent = blockLabel();
}
updateSplash();
loadPlan73();
const tick = () => { $("#splash-clock").textContent = new Date().toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); };
tick();
const clockTimer = setInterval(tick, 1000 * 10);

render();
