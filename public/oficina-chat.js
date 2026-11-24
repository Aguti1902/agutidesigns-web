/* Chat de la Oficina de IA para la web del cliente.
   Uso: <script src="https://agutidesigns.io/oficina-chat.js" data-oficina="ID" async></script>
   Opcional: data-color="#0047ff" data-titulo="Escríbenos" */
(function () {
  var s = document.currentScript || document.querySelector('script[data-oficina]');
  if (!s || window.__oficinaChat) return; window.__oficinaChat = 1;
  var OF = s.getAttribute('data-oficina'), API = (s.src.match(/^https?:\/\/[^/]+/) || [''])[0] + '/api/oficina/chat';
  var COLOR = s.getAttribute('data-color') || '#0047ff', TIT = s.getAttribute('data-titulo') || '';
  var K = 'oficina-chat-' + OF, sesion, desde = new Date().toISOString(), abierto = false, nombre = '', poll;
  try { sesion = localStorage.getItem(K); } catch (e) { }
  if (!sesion) { sesion = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)); try { localStorage.setItem(K, sesion); } catch (e) { } }

  var css = '.ofc{position:fixed;right:20px;bottom:20px;z-index:2147483000;font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;color:#0b0d17}'
    + '.ofc *{box-sizing:border-box}.ofc-b{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;background:' + COLOR + ';color:#fff;box-shadow:0 10px 30px -8px rgba(0,0,0,.35);display:grid;place-items:center;transition:transform .2s}'
    + '.ofc-b:hover{transform:scale(1.06)}.ofc-v{position:absolute;right:0;bottom:72px;width:min(370px,calc(100vw - 32px));height:min(560px,calc(100vh - 110px));background:#fff;border-radius:20px;box-shadow:0 24px 70px -20px rgba(10,15,40,.45);display:none;flex-direction:column;overflow:hidden;border:1px solid #ececf0}'
    + '.ofc.on .ofc-v{display:flex}.ofc-h{padding:16px 18px;background:' + COLOR + ';color:#fff}.ofc-h b{display:block;font-size:16px}.ofc-h span{font-size:12.5px;opacity:.85;display:flex;align-items:center;gap:6px}.ofc-h i{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}'
    + '.ofc-m{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#fafafb}.ofc-x{max-width:82%;padding:9px 13px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}'
    + '.ofc-x.c{align-self:flex-end;background:' + COLOR + ';color:#fff;border-bottom-right-radius:5px}.ofc-x.a{align-self:flex-start;background:#fff;border:1px solid #ececf0;border-bottom-left-radius:5px}'
    + '.ofc-t{align-self:flex-start;padding:12px 14px;background:#fff;border:1px solid #ececf0;border-radius:16px;display:flex;gap:4px}.ofc-t span{width:6px;height:6px;border-radius:50%;background:#a0a4b8;animation:ofcp 1s infinite}.ofc-t span:nth-child(2){animation-delay:.15s}.ofc-t span:nth-child(3){animation-delay:.3s}'
    + '@keyframes ofcp{0%,60%,100%{opacity:.3}30%{opacity:1}}.ofc-f{display:flex;gap:8px;padding:12px;border-top:1px solid #ececf0;background:#fff}.ofc-f input{flex:1;min-width:0;border:1px solid #e2e3ea;border-radius:12px;padding:11px 13px;font:inherit;outline:none}'
    + '.ofc-f input:focus{border-color:' + COLOR + '}.ofc-f button{border:0;border-radius:12px;background:' + COLOR + ';color:#fff;padding:0 15px;font:inherit;font-weight:600;cursor:pointer}.ofc-p{font-size:11px;color:#9a9db0;text-align:center;padding:0 0 8px;background:#fff}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var w = document.createElement('div'); w.className = 'ofc';
  w.innerHTML = '<div class="ofc-v" role="dialog" aria-label="Chat"><div class="ofc-h"><b></b><span><i></i>Te respondemos al momento</span></div><div class="ofc-m" aria-live="polite"></div>'
    + '<form class="ofc-f"><input placeholder="Escribe tu mensaje…" aria-label="Mensaje" maxlength="1500"><button>Enviar</button></form><div class="ofc-p">Asistente virtual del negocio</div></div>'
    + '<button class="ofc-b" aria-label="Abrir chat"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>';
  var m = w.querySelector('.ofc-m'), f = w.querySelector('form'), inp = f.querySelector('input'), titulo = w.querySelector('.ofc-h b');

  function burbuja(t, de) { var d = document.createElement('div'); d.className = 'ofc-x ' + de; d.textContent = t; m.appendChild(d); m.scrollTop = m.scrollHeight; }
  function escribiendo(on) { var t = m.querySelector('.ofc-t'); if (on && !t) { t = document.createElement('div'); t.className = 'ofc-t'; t.innerHTML = '<span></span><span></span><span></span>'; m.appendChild(t); m.scrollTop = m.scrollHeight; } if (!on && t) t.remove(); }
  function nuevos() {
    fetch(API + '?oficina=' + OF + '&sesion=' + sesion + '&desde=' + encodeURIComponent(desde)).then(function (r) { return r.json(); }).then(function (j) {
      (j.mensajes || []).forEach(function (x) { if (x.de === 'humano') burbuja(x.texto, 'a'); desde = x.creado; });
    }).catch(function () { });
  }
  w.querySelector('.ofc-b').onclick = function () {
    abierto = !abierto; w.classList.toggle('on', abierto);
    if (abierto) { inp.focus(); if (!m.children.length) burbuja('¡Hola! 👋 ¿En qué te podemos ayudar?', 'a'); poll = setInterval(nuevos, 6000); } else clearInterval(poll);
  };
  f.onsubmit = function (e) {
    e.preventDefault(); var t = inp.value.trim(); if (!t) return; inp.value = ''; burbuja(t, 'c'); escribiendo(true);
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oficina: OF, sesion: sesion, texto: t }) })
      .then(function (r) { return r.json(); }).then(function (j) { escribiendo(false); if (j.respuesta) burbuja(j.respuesta, 'a'); desde = new Date().toISOString(); })
      .catch(function () { escribiendo(false); burbuja('Ahora mismo no podemos responder. Inténtalo en un momento.', 'a'); });
  };
  fetch(API + '?oficina=' + OF).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j) return; nombre = j.nombre; titulo.textContent = TIT || nombre; document.body.appendChild(w);
  }).catch(function () { });
})();
