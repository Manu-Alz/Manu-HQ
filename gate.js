/* Contraseña de entrada. Hasta que no se desbloquea, ni siquiera se carga el código de la app.
   Ojo: es una puerta del lado del navegador (la página es estática), frena a curiosos, no es seguridad fuerte. */
(() => {
  const HASH = "fd58e1bd47f422f6eed7e2a0012f4088a31c70e5daf44eaa451df10b4567abdf", KEY = "manuhq-auth";
  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("manuhq:" + s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const load = (src) => new Promise((ok, err) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = err; document.body.appendChild(s); });
  const start = async () => { await load("judo-data.js?v=79"); await load("app.js?v=79"); };
  let saved = ""; try { saved = localStorage.getItem(KEY) || ""; } catch (e) {}
  if (saved === HASH) return void start();

  document.getElementById("splash")?.classList.add("hidden");
  const g = document.createElement("div");
  g.id = "gate";
  g.innerHTML = `<form autocomplete="off"><div class="gate-mark">HQ</div><h1>Manu HQ</h1><p>Esta página es privada.</p>
    <input type="password" name="pw" placeholder="Contraseña" autocomplete="current-password" autofocus aria-label="Contraseña" />
    <button type="submit">Entrar</button><span class="gate-err" role="alert"></span></form>`;
  document.body.appendChild(g);
  const f = g.querySelector("form"), inp = f.pw, err = g.querySelector(".gate-err");
  inp.focus();
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if ((await sha(inp.value.trim())) === HASH) {
      try { localStorage.setItem(KEY, HASH); } catch (x) {}
      g.remove();
      document.getElementById("splash")?.classList.remove("hidden");
      start();
    } else {
      err.textContent = "Contraseña incorrecta."; inp.value = ""; f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); inp.focus();
    }
  });
})();
