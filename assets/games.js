/* Group Games: filter on the home page, "pick one" on ready lists, Tambola caller and tickets, team maker. Needs site.js (window.SYG). */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return SYG.esc(s); };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var store = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };

  /* home: search box + category chips */
  var q = $('#gq');
  if (q) {
    var cat = '';
    var run = function () {
      var w = q.value.trim().toLowerCase(), n = 0;
      $$('.gcard').forEach(function (c) {
        var ok = (!cat || c.getAttribute('data-cat') === cat) && (!w || c.textContent.toLowerCase().indexOf(w) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      $('#gnone').hidden = n > 0;
      $('#gcount').textContent = n + (n === 1 ? ' game' : ' games');
    };
    q.addEventListener('input', run);
    $$('#gcats button').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.value; $$('#gcats button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); run();
      });
    });
    var sup = $('#gsurprise');
    if (sup) sup.addEventListener('click', function () { var v = $$('.gcard').filter(function (c) { return !c.hidden; }); if (v.length) location.href = $('a', v[rnd(v.length)]).href; });
  }

  /* ready lists: pick one at random */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]');
    if (!b) return;
    var box = b.closest('.rl'), items = $$('ol>li', box), li = items[rnd(items.length)], out = $('.result', box);
    var text = li.getAttribute('data-t'), ans = li.getAttribute('data-a');
    out.innerHTML = '<p class="pk">' + esc(text).replace(/\n/g, '<br>') + '</p>' + (ans ? '<details><summary>Show answer</summary><p>' + esc(ans) + '</p></details>' : '') +
      '<div class="acts"><button class="btn sm" type="button" data-copy="' + esc(text) + '">Copy</button><button class="btn sm ghost" type="button" data-wa="' + esc(text) + '">WhatsApp</button>' +
      '<button class="btn sm ghost" type="button" data-pick>Another one</button></div>';
    out.hidden = false; out.classList.remove('rise'); void out.offsetWidth; out.classList.add('rise');
  });

  /* Tambola: number caller */
  var board = $('#tb-board');
  if (board) {
    var KEY = 'syg-tambola', called = store(KEY) || [];
    var NICK = { 1: 'number one', 90: 'top of the house' };
    var say = function (n) {
      if (!$('#tb-voice').checked || !window.speechSynthesis) return;
      var t = n < 10 ? 'Single number ' + n : String(n).split('').join(' ') + ', ' + n;
      var u = new SpeechSynthesisUtterance(t); u.lang = 'en-IN'; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u);
    };
    var draw = function () {
      var h = '';
      for (var i = 1; i <= 90; i++) h += '<span' + (called.indexOf(i) > -1 ? ' class="on"' : '') + '>' + i + '</span>';
      board.innerHTML = h;
      var last = called[called.length - 1];
      $('#tb-last').textContent = last || '–';
      $('#tb-info').textContent = called.length ? called.length + ' of 90 called. Before this: ' + (called.slice(-6, -1).reverse().join(', ') || 'none') : 'Tap "Call next number" to begin.';
      $('#tb-next').disabled = called.length >= 90;
      $('#tb-list').setAttribute('data-copy', 'Tambola numbers called so far (' + called.length + '): ' + called.join(', '));
    };
    $('#tb-next').addEventListener('click', function () {
      var left = []; for (var i = 1; i <= 90; i++) if (called.indexOf(i) < 0) left.push(i);
      if (!left.length) return;
      var n = left[rnd(left.length)]; called.push(n); store(KEY, called); draw(); say(n);
      var b = $('#tb-last'); b.classList.remove('rise'); void b.offsetWidth; b.classList.add('rise');
    });
    $('#tb-undo').addEventListener('click', function () { if (called.length) { called.pop(); store(KEY, called); draw(); } });
    $('#tb-new').addEventListener('click', function () { if (!called.length || confirm('Start a new game? The called numbers will be cleared.')) { called = []; store(KEY, called); draw(); } });
    draw();

    /* tickets: 3 rows x 9 columns, 5 numbers in each row, every column used at least once */
    var ticket = function () {
      var rows, ok = false;
      while (!ok) {
        rows = [0, 1, 2].map(function () { return shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5); });
        ok = [0, 1, 2, 3, 4, 5, 6, 7, 8].every(function (c) { return rows.some(function (r) { return r.indexOf(c) > -1; }); });
      }
      var grid = [[], [], []];
      for (var c = 0; c < 9; c++) {
        var lo = c === 0 ? 1 : c * 10, hi = c === 8 ? 90 : c * 10 + 9, pool = [];
        for (var n = lo; n <= hi; n++) pool.push(n);
        var use = [0, 1, 2].filter(function (r) { return rows[r].indexOf(c) > -1; });
        var nums = shuffle(pool).slice(0, use.length).sort(function (a, b) { return a - b; });
        use.forEach(function (r, i) { grid[r][c] = nums[i]; });
      }
      return grid;
    };
    $('#tk-make').addEventListener('click', function () {
      var n = Math.max(1, Math.min(30, parseInt($('#tk-n').value, 10) || 6)), h = '';
      for (var t = 1; t <= n; t++) {
        var g = ticket();
        h += '<div class="tix"><b>Ticket ' + t + '</b><table>' + g.map(function (r) {
          var s = ''; for (var c = 0; c < 9; c++) s += '<td>' + (r[c] || '') + '</td>'; return '<tr>' + s + '</tr>'; }).join('') + '</table></div>';
      }
      $('#tk-out').innerHTML = h; $('#tk-print').hidden = false;
    });
    $('#tk-print').addEventListener('click', function () { window.print(); });
  }

  /* team maker */
  var tm = $('#tm-names');
  if (tm) {
    var names = function () { return tm.value.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean); };
    tm.value = store('syg-team-names') || '';
    var show = function (title, text) {
      var out = $('#tm-out');
      out.innerHTML = '<h2>' + esc(title) + '</h2><p class="pk">' + esc(text).replace(/\n/g, '<br>') + '</p><div class="acts"><button class="btn sm" type="button" data-copy="' + esc(text) + '">Copy</button>' +
        '<button class="btn sm ghost" type="button" data-wa="' + esc(text) + '">Send on WhatsApp</button></div>';
      out.hidden = false; out.classList.remove('rise'); void out.offsetWidth; out.classList.add('rise');
    };
    $('#tm-go').addEventListener('click', function () {
      var list = names(), k = Math.max(2, Math.min(12, parseInt($('#tm-k').value, 10) || 2));
      if (list.length < k) { SYG.toast('Add at least ' + k + ' names'); return; }
      store('syg-team-names', tm.value); shuffle(list);
      var teams = []; for (var i = 0; i < k; i++) teams.push([]);
      list.forEach(function (n, i) { teams[i % k].push(n); });
      show('Your teams', teams.map(function (t, i) { return 'Team ' + (i + 1) + ': ' + t.join(', '); }).join('\n'));
    });
    $('#tm-one').addEventListener('click', function () {
      var list = names(); if (!list.length) { SYG.toast('Type some names first'); return; }
      store('syg-team-names', tm.value); show('Chosen', list[rnd(list.length)]);
    });
    $('#tm-order').addEventListener('click', function () {
      var list = names(); if (list.length < 2) { SYG.toast('Add at least 2 names'); return; }
      store('syg-team-names', tm.value); show('Playing order', shuffle(list).map(function (n, i) { return (i + 1) + '. ' + n; }).join('\n'));
    });
  }
})();
