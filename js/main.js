/* 星降町的放学后 · 界面层 */
window.Main = (function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const D = () => window.DATA;
  const G = () => window.Game;

  const logEl = $('#log');
  const cmdEl = $('#cmd');
  const MAX_LINES = 900;

  let started = false;
  let history = [];
  let histIdx = -1;

  /* ══════════ 日志渲染 ══════════ */

  function scrollDown() {
    logEl.scrollTop = logEl.scrollHeight;
    requestAnimationFrame(() => { logEl.scrollTop = logEl.scrollHeight; });
  }

  const CLS = {
    place: 'place', desc: 'desc', say: 'desc', npc: 'npc', think: 'think',
    sys: 'sys', good: 'good', bad: 'bad', hint: 'hint', item: 'item',
    divider: 'divider', echo: 'echo', book: 'book', quote: 'quote', aff: 'aff',
  };

  function appendEvent(ev) {
    if (ev.t === 'kv') {
      const box = document.createElement('div');
      box.className = 'line kv';
      (ev.m || []).forEach((row) => {
        const r = document.createElement('div');
        r.className = 'kv-row';
        const k = document.createElement('span'); k.className = 'k'; k.textContent = row[0];
        const v = document.createElement('span'); v.className = 'v'; v.textContent = row[1];
        r.appendChild(k); r.appendChild(v);
        box.appendChild(r);
      });
      logEl.appendChild(box);
      return;
    }

    const d = document.createElement('div');
    d.className = 'line ' + (CLS[ev.t] || 'sys') + (ev.c ? ' ' + ev.c : '');
    if (ev.t === 'divider') {
      d.textContent = '';
    } else if (ev.t === 'echo') {
      d.innerHTML = '<span class="echo-glyph">›</span> ' + escapeHtml(ev.m);
    } else {
      d.textContent = ev.m;
    }
    logEl.appendChild(d);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function trimLog() {
    while (logEl.children.length > MAX_LINES) logEl.removeChild(logEl.firstElementChild);
  }

  function render(events) {
    (events || []).forEach(appendEvent);
    trimLog();
    scrollDown();
  }

  /* ══════════ 侧栏 ══════════ */

  function bondName(v) {
    const t = D().bonds || [];
    let n = t[0][1];
    t.forEach((b) => { if (v >= b[0]) n = b[1]; });
    return n;
  }

  function renderSide() {
    const S = G().get();
    if (!S) return;

    $('#chipDay').textContent = '第 ' + S.day + ' 天';
    $('#chipTime').textContent = G().timeOfDay();
    const r = D().rooms[S.room];
    $('#chipRoom').textContent = r ? r.name : '';
    $('#dayAside').textContent = '第 ' + S.day + ' / ' + D().lastDay;
    $('#timeNow').textContent = G().timeOfDay();

    /* 行动力小圆点 */
    const pips = $('#apPips');
    pips.innerHTML = '';
    for (let i = 0; i < D().apPerDay; i++) {
      const s = document.createElement('i');
      s.className = 'pip' + (i < S.ap ? ' on' : '');
      pips.appendChild(s);
    }

    $('#questLine').textContent = S.quest || '——';

    /* 羁绊列表 */
    const bl = $('#bondList');
    bl.innerHTML = '';
    let known = 0;
    (D().heroines || []).forEach((h) => {
      const v = S.aff[h.id] || 0;
      const met = !!(S.flags['met_' + h.id] || S.flags['saw_' + h.id]);
      if (met) known++;
      const li = document.createElement('li');
      li.className = 'bond' + (met ? '' : ' unknown');
      const nm = met ? h.name : '？？？';
      li.innerHTML =
        '<span class="bond-dot" style="--c:' + h.color + '"></span>' +
        '<span class="bond-name">' + nm + '</span>' +
        '<span class="bond-bar"><i style="width:' + v + '%;--c:' + h.color + '"></i></span>' +
        '<span class="bond-lv">' + (met ? bondName(v) : '未相遇') + '</span>';
      bl.appendChild(li);
    });
    $('#bondAside').textContent = known + ' / 4';

    /* 社员 */
    const ml = $('#memberList');
    ml.innerHTML = '';
    let n = 0;
    (D().heroines || []).forEach((h) => {
      const li = document.createElement('li');
      const inClub = !!S.flags['join_' + h.id];
      if (inClub) n++;
      li.className = 'member' + (inClub ? ' in' : '');
      li.textContent = (S.flags['met_' + h.id] || S.flags['saw_' + h.id] ? h.name : '？？？') + (inClub ? '　社員' : '　—');
      ml.appendChild(li);
    });
    $('#memberAside').textContent = n + ' 人';

    /* 社务 */
    const cl = $('#clubList');
    cl.innerHTML = '';
    const items = [
      ['社员满三人', n >= 3],
      ['投影仪', !!S.flags.have_projector],
      ['白布', !!S.flags.have_cloth],
      ['星图', !!S.flags.stars_drawn],
      ['穹顶修补', !!S.flags.dome_fixed],
      ['试投影', !!S.flags.tested],
      ['神社观测会', !!S.flags.shrine_plan],
      ['彩排', !!S.flags.rehearsed],
    ];
    items.forEach(([t, ok]) => {
      const li = document.createElement('li');
      li.className = 'club-item' + (ok ? ' ok' : '');
      li.innerHTML = '<span class="club-mark">' + (ok ? '●' : '○') + '</span><span>' + t + '</span>';
      cl.appendChild(li);
    });

    /* 出路 */
    const ex = $('#exits-bar');
    ex.innerHTML = '';
    const DIRN = { north: '北', south: '南', east: '东', west: '西', up: '上', down: '下' };
    Object.keys((r && r.exits) || {}).forEach((dir) => {
      const to = D().rooms[r.exits[dir]];
      const b = document.createElement('button');
      b.className = 'exit-pill';
      b.innerHTML = '<b>' + DIRN[dir] + '</b> ' + (to ? to.name : '');
      b.onclick = () => { submit(DIRN[dir]); };
      ex.appendChild(b);
    });
  }

  /* ══════════ 结局层 ══════════ */

  function showVeil(id) {
    const e = D().endings[id];
    if (!e) return;
    $('#veilTitle').textContent = e.title;
    $('#veilSub').textContent = e.sub ? e.sub + ' · 终' : '终';
    const body = $('#veilBody');
    body.innerHTML = '';
    (e.lines || []).forEach((l) => {
      const p = document.createElement('p');
      p.textContent = l;
      body.appendChild(p);
    });
    $('#veilQuote').textContent = e.epilogue || '';
    $('#veil').classList.add('show');
    $('#veil').scrollTop = 0;
  }

  $('#btnAgain').onclick = () => { location.reload(); };

  /* ══════════ 提交命令 ══════════ */

  function submit(text) {
    if (!started) return;
    const line = (text === undefined ? cmdEl.value : text).trim();
    if (!line) return;
    if (text === undefined) {
      history.push(line);
      if (history.length > 200) history.shift();
      histIdx = history.length;
      cmdEl.value = '';
    }
    const before = G().get();
    const events = G().exec(line);
    render(events);
    renderSide();
    if (before && before.ended && !G().get().ended) return;
    const S = G().get();
    if (S && S.ended) {
      setTimeout(() => showVeil(S.ended), 320);
    }
    cmdEl.focus();
  }

  /* ══════════ 事件绑定 ══════════ */

  $('#promptWrap').addEventListener('submit', (e) => { e.preventDefault(); submit(); });

  cmdEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      if (histIdx > 0) { histIdx--; cmdEl.value = history[histIdx] || ''; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histIdx < history.length - 1) { histIdx++; cmdEl.value = history[histIdx] || ''; }
      else { histIdx = history.length; cmdEl.value = ''; }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = cmdEl.value.trim();
      const words = ['看', '说话', '状态', '日程', '帮助', '睡', '存档', '读档', '填表',
        'n', 's', 'e', 'w', 'u', 'd'];
      const hit = words.find((w) => w.startsWith(v));
      if (hit) cmdEl.value = hit;
    }
  });

  $('#btnHelp').onclick = () => submit('帮助');
  $('#btnBond').onclick = () => submit('状态');
  $('#btnTheme').onclick = cycleTheme;
  $('#btnSave').onclick = () => submit('存档');
  $('#btnLoad').onclick = () => submit('读档');
  $('#btnRestart').onclick = () => {
    if (confirm('要从头开始吗？')) { localStorage.removeItem('hoshifuru.save.v1'); location.reload(); }
  };
  $('#btnSide').onclick = () => document.body.classList.toggle('side-open');
  $('#logWrap').addEventListener('click', (e) => {
    if (e.target.id !== 'log') return;
    cmdEl.focus();
  });

  /* ══════════ 配色 ══════════ */

  const THEMES = ['dusk', 'night', 'dawn'];
  const THEME_NAME = { dusk: '暮色', night: '深夜', dawn: '清晨' };

  function cycleTheme() {
    const cur = document.body.getAttribute('data-theme') || 'dusk';
    const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
    document.body.setAttribute('data-theme', next);
    $('#btnTheme').textContent = THEME_NAME[next];
    try { localStorage.setItem('hoshifuru.theme', next); } catch (e) {}
  }

  function loadTheme() {
    try {
      const t = localStorage.getItem('hoshifuru.theme');
      if (t && THEMES.indexOf(t) >= 0) {
        document.body.setAttribute('data-theme', t);
        $('#btnTheme').textContent = THEME_NAME[t];
      }
    } catch (e) {}
  }

  /* ══════════ 开场 ══════════ */

  function begin(resume) {
    $('#curtain').classList.add('hide');
    setTimeout(() => { $('#curtain').style.display = 'none'; }, 620);
    started = true;

    let events;
    if (resume) {
      events = G().exec('读档');
      // 存档损坏 / 被浏览器清掉了：不要让玩家停在空白状态，直接开新局
      if (!G().get()) {
        events = G().start(D().playerDefault);
        events.push({ t: 'sys', m: '（那份存档读不出来了。从头开始吧。）' });
      }
    } else {
      events = G().start(D().playerDefault);
    }
    render(events);
    renderSide();
    cmdEl.focus();
    const S = G().get();
    if (S && S.ended) showVeil(S.ended);
  }

  $('#btnStart').onclick = () => begin(false);
  $('#btnResume').onclick = () => begin(true);

  /* ══════════ 启动 ══════════ */

  function boot() {
    loadTheme();
    $('#btnTheme').textContent = THEME_NAME[document.body.getAttribute('data-theme') || 'dusk'];
    if (G().hasSave()) $('#btnResume').hidden = false;
    renderSide();
    document.addEventListener('click', () => { if (started) cmdEl.focus(); });
  }

  boot();
  return { showVeil: showVeil };
})();
