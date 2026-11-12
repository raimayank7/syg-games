/* Paheli: riddle of the day on the home page, and the round player. Needs site.js (window.SYG). */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return SYG.esc(s).replace(/\n/g, '<br>'); };
  var T = { hi: { show: 'उत्तर देखें', ask: 'बूझो तो जानें!' }, en: { show: 'Show answer', ask: 'Can you solve it?' } };
  var data = null;
  var load = function () { return data ? Promise.resolve(data) : SYG.json('/paheli/data/all.json').then(function (j) { data = j; return j; }); };
  var card = function (r) {
    var t = T[r[0]], msg = r[1] + '\n\n' + t.ask;
    return '<p class="rt" lang="' + r[0] + '">' + esc(r[1]) + '</p><details><summary>' + t.show + '</summary><p lang="' + r[0] + '"><b>' + esc(r[2]) + '</b></p></details>' +
      '<div class="acts"><button class="btn sm" type="button" data-wa="' + SYG.esc(msg) + '">WhatsApp</button><button class="btn sm ghost" type="button" data-copy="' + SYG.esc(msg) + '">Copy</button></div>';
  };

  /* riddle of the day: the same two riddles for everyone on one date */
  var day = $('#day');
  if (day) {
    load().then(function (all) {
      var n = Math.floor(Date.now() / 86400000 + 5.5 / 24), hi = all.filter(function (r) { return r[0] === 'hi'; }), en = all.filter(function (r) { return r[0] === 'en'; });
      day.innerHTML = '<div class="rd">' + card(hi[(n * 7) % hi.length]) + '</div><div class="rd">' + card(en[(n * 5) % en.length]) + '</div>';
      day.classList.add('rise');
    }).catch(function () { day.hidden = true; });
  }

  /* round: one riddle at a time, mark yourself */
  var play = $('#play');
  if (play) {
    var list = [], i = 0, got = 0, lang = 'both';
    var stage = $('#stage');
    var show = function () {
      if (i >= list.length) {
        var msg = 'I solved ' + got + ' of ' + list.length + ' riddles on Paheli. Can you beat me? https://games.shareyourgroup.com/paheli/play/';
        stage.innerHTML = '<div class="result rise"><h2>Round over</h2><p class="big">' + got + ' / ' + list.length + '</p><p>' + (got === list.length ? 'A perfect round. You are the paheli champion!' : got >= list.length * 0.6 ? 'Well done. Try another round to beat your score.' : 'These were tricky. Try again, new riddles are waiting.') +
          '</p><div class="acts"><button class="btn sm" type="button" data-wa="' + SYG.esc(msg) + '">Share my score</button><button class="btn sm ghost" type="button" id="again">New round</button></div></div>';
        return;
      }
      var r = list[i], t = T[r[0]];
      stage.innerHTML = '<div class="rd big-rd rise"><p class="hint">Riddle ' + (i + 1) + ' of ' + list.length + ' · Score ' + got + '</p><p class="rt" lang="' + r[0] + '">' + esc(r[1]) + '</p>' +
        '<div id="ans" hidden><p class="answer" lang="' + r[0] + '">' + esc(r[2]) + '</p><div class="acts"><button class="btn" type="button" data-mark="1">I got it</button><button class="btn ghost" type="button" data-mark="0">I missed it</button></div></div>' +
        '<div class="acts" id="pre"><button class="btn" type="button" id="reveal">' + t.show + '</button><button class="btn sm ghost" type="button" data-wa="' + SYG.esc(r[1] + '\n\n' + t.ask) + '">Ask my group</button></div></div>';
    };
    var start = function () {
      load().then(function (all) {
        var pool = all.filter(function (r) { return lang === 'both' || r[0] === lang; }).slice();
        for (var k = pool.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), x = pool[k]; pool[k] = pool[j]; pool[j] = x; }
        list = pool.slice(0, 10); i = 0; got = 0; show(); stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, function () { SYG.toast('Could not load the riddles. Check your connection.'); });
    };
    play.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.parentNode.id === 'langs') { lang = b.value; $$('#langs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }
      else if (b.id === 'go' || b.id === 'again') start();
      else if (b.id === 'reveal') { $('#ans').hidden = false; $('#pre').hidden = true; }
      else if (b.hasAttribute('data-mark')) { got += +b.getAttribute('data-mark'); i++; show(); }
    });
  }
})();
