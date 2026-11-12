/* Jokes: save a joke (heart), joke of the day, "tell me a joke", saved page. Needs site.js (window.SYG). */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return SYG.esc(s); };
  var KEY = 'syg-jokes-saved';
  var saved = function () { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  var put = function (a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  var data = null;
  var load = function () { return data ? Promise.resolve(data) : SYG.json('/jokes/data/all.json').then(function (j) { data = j; return j; }); };
  var card = function (j) {   /* j = [id, lang, text] */
    var on = saved().indexOf(j[0]) > -1;
    return '<li class="jk" data-id="' + j[0] + '"><p lang="' + j[1] + '">' + esc(j[2]).replace(/\n/g, '<br>') + '</p><div class="acts"><button class="btn sm" type="button" data-wa="' + esc(j[2]) + '">WhatsApp</button>' +
      '<button class="btn sm ghost" type="button" data-copy="' + esc(j[2]) + '">Copy</button><button class="btn sm ghost sv" type="button" data-save aria-pressed="' + on + '" aria-label="Save this joke">' + (on ? '♥ Saved' : '♡ Save') + '</button></div></li>';
  };
  var paint = function () {
    var s = saved();
    $$('.jk').forEach(function (li) {
      var b = $('[data-save]', li), on = s.indexOf(li.getAttribute('data-id')) > -1;
      if (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? '♥ Saved' : '♡ Save'; }
    });
    $$('[data-saved-count]').forEach(function (x) { x.textContent = s.length ? ' (' + s.length + ')' : ''; });
  };
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-save]');
    if (!b) return;
    var id = b.closest('.jk').getAttribute('data-id'), s = saved(), i = s.indexOf(id);
    if (i > -1) s.splice(i, 1); else s.unshift(id);
    put(s.slice(0, 200)); paint(); SYG.toast(i > -1 ? 'Removed from saved' : 'Saved in this browser');
    if ($('#savedlist') && i > -1) { b.closest('.jk').remove(); $('#nosaved').hidden = $$('#savedlist .jk').length > 0; }
  });
  paint();

  var day = $('#day');
  if (day) {
    load().then(function (all) {
      var n = Math.floor(Date.now() / 86400000 + 5.5 / 24), hi = all.filter(function (j) { return j[1] === 'hi'; }), en = all.filter(function (j) { return j[1] === 'en'; });
      day.innerHTML = card(en[(n * 7) % en.length]) + card(hi[(n * 3) % hi.length]); day.classList.add('rise');
    }).catch(function () { day.hidden = true; });
  }
  var rnd = $('#random');
  if (rnd) {
    var lang = 'both', last = '';
    d.addEventListener('click', function (e) {
      var b = e.target.closest('#rlang button,#tell');
      if (!b) return;
      if (b.id !== 'tell') { lang = b.value; $$('#rlang button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }
      load().then(function (all) {
        var pool = all.filter(function (j) { return (lang === 'both' || j[1] === lang) && j[0] !== last; }), j = pool[Math.floor(Math.random() * pool.length)];
        last = j[0]; rnd.innerHTML = card(j); rnd.classList.remove('rise'); void rnd.offsetWidth; rnd.classList.add('rise');
      }, function () { SYG.toast('Could not load the jokes. Check your connection.'); });
    });
  }
  var sl = $('#savedlist');
  if (sl) {
    load().then(function (all) {
      var by = {}; all.forEach(function (j) { by[j[0]] = j; });
      var list = saved().map(function (id) { return by[id]; }).filter(Boolean);
      sl.innerHTML = list.map(card).join('');
      $('#nosaved').hidden = list.length > 0;
    });
  }
})();
