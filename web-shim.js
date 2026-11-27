/* Camada de login e dados: faz o site falar com o Firebase (login Google + Firestore).
   O app foi escrito para um ambiente com `claude.use('user')` e `claude.use('db')`; aqui esses dois pontos viram Firebase. */
(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const PROF = String(window.PROF_EMAIL || '').toLowerCase();
  const $ = s => document.querySelector(s);
  let pronto = null;

  function telaLogin(msg) {
    const m = $('#main'); if (!m) return;
    const nav = $('#nav'); if (nav) nav.style.display = 'none';
    m.innerHTML = '<div class="card" style="max-width:440px;margin:40px auto;text-align:center;padding:28px 22px">' +
      '<h1 style="font-size:24px;margin:0 0 8px">Cursos do Prof. Wesley Mendes</h1>' +
      '<p style="color:var(--mute);margin:0 0 20px">Geografia, Sociologia e Filosofia. Entre com a sua conta Google para salvar o seu progresso.</p>' +
      '<button class="btn" id="gIn" style="min-height:48px;padding:0 22px">Entrar com Google</button>' +
      '<p id="gMsg" role="alert" style="color:var(--bad);margin:14px 0 0;font-size:14px">' + (msg || '') + '</p></div>';
    $('#gIn').onclick = entrar;
  }
  function telaPendente(email, erro) {
    const m = $('#main'); if (!m) return;
    const nav = $('#nav'); if (nav) nav.style.display = 'none';
    m.innerHTML = '<div class="card" style="max-width:440px;margin:40px auto;text-align:center;padding:28px 22px">' +
      '<h1 style="font-size:22px;margin:0 0 8px">Acesso ainda não liberado</h1>' +
      '<p style="color:var(--mute);margin:0 0 6px">Você entrou como <b></b>.</p>' +
      '<p style="color:var(--mute);margin:0 0 16px">Peça ao professor para liberar este e-mail e depois recarregue a página.' + (erro ? ' (código: ' + erro + ')' : '') + '</p>' +
      '<button class="btn" id="gRe" style="min-height:44px">Recarregar</button></div>';
    m.querySelector('b').textContent = email;
    $('#gRe').onclick = () => location.reload();
  }
  let auth;
  async function entrar() {
    const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt: 'select_account'});
    const say = t => { const e = $('#gMsg'); if (e) e.textContent = t; };
    try { await auth.signInWithPopup(prov); }
    catch (e) {
      if (/popup-blocked|operation-not-supported|cancelled-popup/.test(e.code || '')) { try { await auth.signInWithRedirect(prov); return; } catch (e2) { e = e2; } }
      if (e.code === 'auth/unauthorized-domain') say('Este endereço ainda não foi autorizado no Firebase (Authentication › Configurações › Domínios autorizados).');
      else if (e.code === 'auth/operation-not-allowed' || e.code === 'auth/configuration-not-found') say('O login com Google ainda não foi ativado no Firebase.');
      else if (e.code !== 'auth/popup-closed-by-user') say('Não foi possível entrar: ' + (e.message || e.code));
    }
  }
  function sair() { auth.signOut().then(() => location.reload()); }
  function botaoSair() {
    const h = $('header.top'); if (!h || $('#gOut')) return;
    const b = document.createElement('button'); b.id = 'gOut'; b.type = 'button'; b.textContent = 'Sair'; b.className = 'who'; b.style.cssText = 'border:0;color:inherit;font:inherit;cursor:pointer;min-height:36px;margin-left:6px';
    b.onclick = sair; h.appendChild(b);
  }
  function boot() {
    if (pronto) return pronto;
    pronto = new Promise(res => {
      if (!cfg.apiKey || !window.firebase) { res(null); return; }
      firebase.initializeApp(cfg); auth = firebase.auth();
      const db = firebase.firestore();
      auth.getRedirectResult().catch(() => {});
      auth.onAuthStateChanged(async u => {
        if (!u || !u.email) { telaLogin(''); return; }
        const email = u.email.toLowerCase();
        botaoSair();
        if (email !== PROF) {
          let ok = false, erro = '';
          try { const d = await db.doc('acessos/' + email).get(); ok = d.exists; if (ok) { const c = d.data().cursos; window.CURSOS_LIBERADOS = Array.isArray(c) ? c : null; } } catch (e) { erro = e.code || 'erro'; }
          if (!ok) { telaPendente(email, erro); return; }
        }
        res({u, db});
      });
    });
    return pronto;
  }
  function userApi(u) {
    const email = String(u.email || '').toLowerCase();
    return {
      canEdit: async () => !!PROF && email === PROF,
      id: async () => u.uid,
      me: async () => ({name: u.displayName || email.split('@')[0], email}),
      can: async () => true,
      profiles: async () => ({})
    };
  }
  window.claude = {use: async n => {
    const s = await boot();
    if (n === 'db') return s ? s.db : null;
    if (n === 'user') return s ? userApi(s.u) : null;
    return null;
  }};
})();
