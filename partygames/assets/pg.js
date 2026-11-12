/* partygames.shareyourgroup.com: game finder, party timer, chit maker (draw, teams, print), scoreboard. Everything stays in the browser. */
(function () {
  'use strict';
  var d = document, LS = window.localStorage;
  function $(s) { return d.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load(k, def) { try { var v = JSON.parse(LS.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { try { LS.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function rnd(n) { var c = window.crypto; if (!c || !c.getRandomValues) return Math.floor(Math.random() * n); var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { c.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function finder() {
    var box = $('#pfind'); if (!box) return;
    var pick = { size: '', group: '', energy: '' }, items = [].slice.call(d.querySelectorAll('#glist li'));
    function apply() {
      var n = 0;
      items.forEach(function (li) { var tags = ' ' + li.getAttribute('data-tags') + ' ', on = (!pick.size || tags.indexOf(' ' + pick.size + ' ') >= 0) && (!pick.group || tags.indexOf(' ' + pick.group + ' ') >= 0) && (!pick.energy || li.getAttribute('data-energy') === pick.energy); li.hidden = !on; if (on) n++; });
      $('#f-count').textContent = n + (n === 1 ? ' game' : ' games'); $('#f-none').hidden = n > 0;
      [].forEach.call(box.querySelectorAll('.chips button'), function (b) { var k = b.hasAttribute('data-size') ? 'size' : b.hasAttribute('data-group') ? 'group' : 'energy'; b.setAttribute('aria-pressed', pick[k] === b.getAttribute('data-' + k) ? 'true' : 'false'); });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'f-clear') pick = { size: '', group: '', energy: '' };
      else ['size', 'group', 'energy'].forEach(function (k) { if (b.hasAttribute('data-' + k)) pick[k] = pick[k] === b.getAttribute('data-' + k) ? '' : b.getAttribute('data-' + k); });
      apply();
    });
  }

  function timer() {
    var box = $('#timer'); if (!box) return;
    var big = $('#tm-big'), go = $('#tm-go'), msg = $('#tm-msg'), total = 60, left = 60, end = 0, t = null, ctx = null;
    function show() { var s = Math.max(0, Math.ceil(left)); big.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); big.classList.toggle('last', s <= 10 && s > 0 && !!t); big.classList.toggle('done', s === 0); }
    function beep(freq, dur) { try { if (!ctx) return; var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = freq; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur); o.start(); o.stop(ctx.currentTime + dur); } catch (e) { } }
    function stop() { clearInterval(t); t = null; go.textContent = left > 0 && left < total ? 'Resume' : 'Start'; }
    function set(s) { stop(); total = left = s; go.textContent = 'Start'; msg.textContent = ''; show(); }
    $('#tm-set').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); $('#tm-own').value = ''; set(+b.value); });
    $('#tm-own').addEventListener('change', function () { var v = Math.round(+this.value); if (v >= 5 && v <= 3600) { [].forEach.call($('#tm-set').children, function (x) { x.setAttribute('aria-pressed', 'false'); }); set(v); } });
    $('#tm-reset').addEventListener('click', function () { set(total); });
    go.addEventListener('click', function () {
      if (t) { stop(); return; }
      if (left <= 0) left = total;
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { }
      end = Date.now() + left * 1000; go.textContent = 'Pause'; msg.textContent = '';
      var lastWhole = Math.ceil(left);
      t = setInterval(function () {
        left = (end - Date.now()) / 1000;
        var w = Math.ceil(left); if (w !== lastWhole && w <= 3 && w > 0) beep(660, 0.12); lastWhole = w;
        if (left <= 0) { left = 0; clearInterval(t); t = null; go.textContent = 'Start'; beep(880, 0.9); msg.textContent = 'Time is up!'; }
        show();
      }, 100);
      show();
    });
    show();
  }

  function chits() {
    var box = $('#chit'); if (!box) return;
    var ta = $('#ch-list'), out = $('#ch-out'), info = $('#ch-info'), bowl = [];
    ta.value = load('pg-chits', '');
    function list() { var l = ta.value.split(/\n|,/).map(function (x) { return x.trim(); }).filter(Boolean); save('pg-chits', ta.value); return l; }
    function need(n) { var l = list(); if (l.length < n) { out.hidden = false; out.innerHTML = '<p>Type at least ' + n + ' items first, one on each line.</p>'; return null; } return l; }
    ta.addEventListener('input', function () { bowl = []; info.textContent = list().length + ' items'; });
    info.textContent = list().length + ' items';
    $('#ch-draw').addEventListener('click', function () {
      var l = need(2); if (!l) return;
      if (!bowl.length) bowl = shuffle(l.slice());
      var x = bowl.pop(); out.hidden = false; out.innerHTML = '<p class="hint">Drawn from the bowl:</p><p class="big">' + esc(x) + '</p><p class="hint">' + (bowl.length ? bowl.length + ' left in the bowl.' : 'That was the last chit. The next draw refills the bowl.') + '</p>';
    });
    $('#ch-teams').addEventListener('click', function () {
      var l = need(2); if (!l) return; var k = Math.max(2, Math.min(12, Math.round(+$('#ch-k').value) || 2)); if (k > l.length) k = l.length;
      var s = shuffle(l.slice()), teams = []; for (var i = 0; i < k; i++) teams.push([]); s.forEach(function (x, i) { teams[i % k].push(x); });
      var txt = teams.map(function (t, i) { return 'Team ' + (i + 1) + ': ' + t.join(', '); }).join('\n');
      out.hidden = false; out.innerHTML = teams.map(function (t, i) { return '<p><b>Team ' + (i + 1) + '</b> (' + t.length + '): ' + t.map(esc).join(', ') + '</p>'; }).join('') + '<div class="acts" style="display:flex"><button class="btn sm" type="button" data-wa="' + esc(txt) + '">Send on WhatsApp</button><button class="btn sm ghost" type="button" data-copy="' + esc(txt) + '">Copy</button></div>';
    });
    $('#ch-print').addEventListener('click', function () {
      var l = need(1); if (!l) return;
      $('#ch-sheet').innerHTML = '<p class="hint noprint">' + l.length + ' chits ready. <button class="btn sm" type="button" id="ch-doprint">Print</button> Then cut along the lines and fold each chit twice.</p><div class="chit-grid">' + l.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>';
      $('#ch-doprint').onclick = function () { d.body.classList.add('print-chits'); window.print(); setTimeout(function () { d.body.classList.remove('print-chits'); }, 500); };
      $('#ch-sheet').scrollIntoView({ block: 'nearest' });
    });
  }

  function score() {
    var box = $('#score'); if (!box) return;
    var ul = $('#sc-list'), teams = load('pg-score', []);
    function draw() {
      var top = Math.max.apply(null, teams.map(function (t) { return t.s; }).concat([0]));
      ul.innerHTML = teams.length ? teams.map(function (t, i) { return '<li><span class="nm">' + (t.s === top && top > 0 ? '<span aria-label="leader">👑</span> ' : '') + esc(t.n) + '</span><b>' + t.s + '</b><span class="bt"><button type="button" data-i="' + i + '" data-v="-1" aria-label="Minus one">−1</button><button type="button" data-i="' + i + '" data-v="1">+1</button><button type="button" data-i="' + i + '" data-v="5">+5</button><button type="button" class="x" data-i="' + i + '" data-v="x" aria-label="Remove ' + esc(t.n) + '">×</button></span></li>'; }).join('') : '<li class="empty">No teams yet. Add one above.</li>';
      save('pg-score', teams);
    }
    function add() { var n = $('#sc-name').value.trim(); if (!n) n = 'Team ' + (teams.length + 1); if (teams.length >= 12) return; teams.push({ n: n.slice(0, 24), s: 0 }); $('#sc-name').value = ''; draw(); }
    $('#sc-add').addEventListener('click', add);
    $('#sc-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
    ul.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var i = +b.getAttribute('data-i'), v = b.getAttribute('data-v'); if (v === 'x') { if (window.confirm('Remove ' + teams[i].n + '?')) teams.splice(i, 1); } else teams[i].s += +v; draw(); });
    $('#sc-reset').addEventListener('click', function () { if (teams.length && window.confirm('Set every score back to zero?')) { teams.forEach(function (t) { t.s = 0; }); draw(); } });
    $('#sc-clear').addEventListener('click', function () { if (teams.length && window.confirm('Remove all teams?')) { teams = []; draw(); } });
    draw();
  }
  function init() { finder(); timer(); chits(); score(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
