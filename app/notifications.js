globalThis.KNotify = (() => {
  const key = 'annuaire-k-notifications-v1';
  const read = () => { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const save = v => { try { localStorage.setItem(key, JSON.stringify(v.slice(0, 40))); } catch {} };
  const add = (title, text) => { const v = read(); v.unshift({ id: crypto.randomUUID(), title, text, at: new Date().toISOString(), seen: false }); save(v); render(); };
  const render = () => { const v = read(), unread = v.filter(x => !x.seen).length; document.querySelectorAll('[data-notification-count]').forEach(x => { x.textContent = unread > 9 ? '9+' : String(unread); x.hidden = !unread; }); };
  const open = () => { const v = read(); modal('Notifications', v.length ? v.map(x => `<article class="notification-item ${x.seen ? '' : 'unread'}"><b>${esc(x.title)}</b><p>${esc(x.text)}</p><small>${esc(new Date(x.at).toLocaleString('fr-FR'))}</small></article>`).join('') : '<p class="muted">Aucune notification pour le moment.</p><p class="form-hint">Les confirmations de fiche, annonces, contacts et modération apparaîtront ici.</p>', 'VOTRE ESPACE'); save(v.map(x => ({ ...x, seen: true }))); render(); };
  document.addEventListener('click', e => { if (e.target.closest('[data-notifications]')) open(); });
  document.addEventListener('DOMContentLoaded', render);
  return { add, render, open };
})();
