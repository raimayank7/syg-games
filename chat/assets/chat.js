/* Group Chat Ideas: pick one from a list, group name maker. Needs site.js (window.SYG). */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return SYG.esc(s); };
  var rnd = function (n) { return Math.floor(Math.random() * n); };

  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]');
    if (!b) return;
    var items = $$('.tap [data-copy]'), it = items[rnd(items.length)], out = $('#picked'), t = it.getAttribute('data-copy');
    out.innerHTML = '<p class="pk">' + esc(t).replace(/\n/g, '<br>') + '</p><div class="acts"><button class="btn sm" type="button" data-wa="' + esc(t) + '">Send on WhatsApp</button>' +
      '<button class="btn sm ghost" type="button" data-copy="' + esc(t) + '">Copy</button><button class="btn sm ghost" type="button" data-pick>Another one</button></div>';
    out.hidden = false; out.classList.remove('rise'); void out.offsetWidth; out.classList.add('rise');
  });

  /* group name maker */
  var go = $('#nm-go');
  if (go) {
    var T = {
      family: ['{w} Parivaar', 'The {w} Family', '{w} Ghar', 'House of {w}', '{w} Khandaan', '{w} Family Tree', 'Team {w}', '{w} Ki Baatein', '{w} Aangan', '{w} Clan', 'Proud {w}s', '{w} Sunday Club', '{w} Darbar', 'We Are {w}', '{w} Express', '{w} Under One Roof'],
      friends: ['{w} Gang', '{w} Ka Adda', 'Yaaran Di {w}', '{w} Squad', 'The {w} Bench', '{w} Junction', '{w} Forever', 'Dil Se {w}', '{w} Toli', '{w} Unlimited', 'Only {w}', '{w} After Dark', '{w} Chai Club', 'Legends of {w}', '{w} Circle', '{w} Dosti Group'],
      school: ['{w} Batch', '{w} Alumni', '{w} Last Benchers', '{w} Reunion', 'Class of {w}', '{w} Classmates', '{w} Old Students', '{w} Canteen Crew', '{w} Hostel Gang', '{w} Roll Call', 'Proud of {w}', '{w} Memories', '{w} Forever', '{w} Friends Circle', '{w} Section', 'Back to {w}'],
      office: ['Team {w}', '{w} Updates', '{w} Core Team', '{w} Daily', '{w} Squad', '{w} Desk', '{w} Works', '{w} Connect', '{w} Stand-Up', '{w} Crew', '{w} Hub', '{w} Project Group', '{w} Office', 'All Hands {w}', '{w} Pulse', '{w} Achievers'],
      society: ['{w} Residents', '{w} Society', '{w} Neighbours', '{w} Noticeboard', '{w} Families', '{w} Community', '{w} Updates', 'Our {w}', '{w} Connect', '{w} Welfare Group', '{w} Block', '{w} Parivaar', '{w} Alerts', '{w} Morning Walkers', '{w} Festival Committee', 'Apna {w}'],
      fun: ['{w} Express', '{w} Junction', '{w} Adda', '{w} Unlimited', '{w} Club', '{w} Wale', '{w} Premier League', '{w} Parliament', '{w} Committee', '{w} Bureau', '{w} Republic', '{w} Headquarters', '{w} Mandali', '{w} and Company', '{w} Gupshup', '{w} Darbar']
    };
    var make = function () {
      var w = $('#nm-word').value.trim().replace(/\s+/g, ' ').slice(0, 24), type = $('#nm-type').value;
      if (!w) { SYG.toast('Type a name or word first'); $('#nm-word').focus(); return; }
      w = w.charAt(0).toUpperCase() + w.slice(1);
      var list = T[type].slice();
      for (var i = list.length - 1; i > 0; i--) { var j = rnd(i + 1), x = list[i]; list[i] = list[j]; list[j] = x; }
      $('#nm-out').innerHTML = list.slice(0, 12).map(function (t) { var n = t.replace('{w}', w); return '<li><button type="button" data-copy="' + esc(n) + '" data-done="Name copied">' + esc(n) + '</button></li>'; }).join('');
      $('#nm-hint').hidden = false;
    };
    go.addEventListener('click', make);
    $('#nm-word').addEventListener('keydown', function (e) { if (e.key === 'Enter') make(); });
  }
})();
