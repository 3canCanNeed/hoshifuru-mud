/* 星降町的放学后 · 引擎 */
window.Game = (function () {
  'use strict';

  const D = () => window.DATA;
  let S = null;
  let out = [];

  /* ══════════ 基础 ══════════ */

  function emit(t, m, c) {
    out.push({ t: t, m: (typeof m === 'object' ? m : String(m)), c: c || null });
  }
  const say = (m) => emit('desc', m);

  function newState(name) {
    return {
      name: name || D().playerDefault,
      day: 1,
      ap: D().apPerDay,
      room: D().start,
      aff: { haruka: 0, rin: 0, hina: 0, mio: 0 },
      flags: {},
      seen: {},
      visits: {},
      quest: '放学后去旧校舍三楼看看',
      ended: null,
      steps: 0,
      savedAt: null,
    };
  }

  const room = () => D().rooms[S.room];

  function timeOfDay() {
    const left = S.ap;
    if (left >= 5) return '上午';
    if (left >= 3) return '放学后';
    if (left >= 1) return '傍晚';
    return '夜';
  }

  /* ══════════ 字数与格式小工具 ══════════ */

  function chapterBanner(ch) {
    emit('divider', '');
    emit('book', ch.title);
    (ch.quote || []).forEach((q) => emit('quote', q));
    emit('divider', '');
  }

  /* ══════════ 事件执行环境 ══════════ */

  function runner() {
    return {
      say: (m) => emit('desc', m),
      npc: (m) => emit('npc', m),
      think: (m) => emit('think', m),
      sys: (m) => emit('sys', m),
      good: (m) => emit('good', m),
      aff: (id, n) => {
        if (!S.aff[id] && S.aff[id] !== 0) return;
        const before = S.aff[id];
        S.aff[id] = Math.min(100, before + n);
        if (S.aff[id] !== before) {
          const h = (D().heroines || []).find((x) => x.id === id);
          emit('aff', (h ? h.short : id) + ' 的好感 ' + (n > 0 ? '+' : '') + n, 'up');
        }
      },
      set: (k, v) => { S.flags[k] = v; },
      flag: (k) => !!S.flags[k],
      quest: (t) => { S.quest = t; emit('hint', '▸ ' + t); },
      chapter: (n) => {
        if (S.flags['ch_' + n]) return;
        S.flags['ch_' + n] = true;
      },
      joinNotice: (nm) => emit('good', nm + ' 加入了天象仪社。'),
    };
  }

  /* ══════════ 事件检查 ══════════ */

  function tryEvents() {
    const g = runner();
    let fired = false;

    /* 主线：需要地点匹配（或未指定地点） */
    for (const ev of (D().story || [])) {
      if (S.seen[ev.id]) continue;
      if (ev.place && ev.place !== S.room) continue;
      if (!ev.when(S)) continue;
      S.seen[ev.id] = true;
      ev.run(g);
      fired = true;
      break;
    }
    if (fired) return true;

    /* 羁绊：好感阈值 + 地点 */
    for (const ev of (D().bonds_events || [])) {
      if (S.seen[ev.id]) continue;
      if (ev.place && ev.place !== S.room) continue;
      if ((S.aff[ev.hero] || 0) < ev.at) continue;
      S.seen[ev.id] = true;
      emit('divider', '');
      const h = (D().heroines || []).find((x) => x.id === ev.hero);
      emit('sys', '— ' + (h ? h.name : ev.hero) + ' —');
      ev.run(g);
      emit('divider', '');
      return true;
    }

    /* 日常：小概率的小事 */
    if (Math.random() < 0.5) {
      for (const ev of (D().daily || [])) {
        if (S.seen[ev.id]) continue;
        if (ev.place && ev.place !== S.room) continue;
        if (ev.when && !ev.when(S)) continue;
        S.seen[ev.id] = true;
        emit('divider', '');
        ev.run(g);
        return true;
      }
    }
    return false;
  }

  /* ══════════ 行动与时间 ══════════ */

  function spend(n) {
    n = (n === undefined || n === null) ? 1 : n;
    S.ap -= n;
    if (S.ap > 0) return false;
    S.ap = 0;
    emit('divider', '');
    emit('sys', '天黑了。');
    if (S.day >= D().lastDay) {
      finale();
      return true;
    }
    /* 星见祭当晚的分界：办成了才继续往下过 */
    if (D().actBreak && S.day === D().actBreak) {
      const ok = !!(S.flags.shrine_plan && S.flags.tested && S.flags.festival_crisis);
      if (!ok) {
        emit('sys', '星见祭过去了，那间屋子里什么也没发生。');
        emit('sys', '第二天，你照常上学。第三天，你的座位还在。');
        emit('hint', '这一年，就这样过去了。');
        finale();
        return true;
      }
      S.flags.act_break_done = true;
    }
    /* 遥的毕业式：把她送走，但故事继续 */
    if (D().gradDay && S.day === D().gradDay && !S.flags.graduated) {
      S.flags.graduated = true;
      S.route = routeOf();
      graduationScene();
    }
    S.day += 1;
    S.ap = D().apPerDay;
    const today = S.day === D().actBreak ? '今天就是星见祭。'
      : (S.day === D().lastDay ? '今天是毕业式。' : '');
    emit('hint', '第 ' + S.day + ' 天。' + today);
    const ch = (D().chapters || []).slice().reverse().find((c) => S.day >= c.day && !S.flags['chap_' + c.id]);
    if (ch) { S.flags['chap_' + ch.id] = true; chapterBanner(ch); }
    return false;
  }

  /* ══════════ 结局 ══════════ */

  function judge() {
    const order = ['haruka', 'rin', 'hina', 'mio'];
    const ok = !!(S.flags.shrine_plan && S.flags.tested && S.flags.festival_crisis);

    /* ── 星见祭没能办成：故事当天收场 ── */
    if (!ok || S.day <= (D().actBreak || 24)) {
      if (!ok) return 'fail';
      const allHigh0 = order.every((id) => (S.aff[id] || 0) >= 40 && S.flags['join_' + id]);
      if (allHigh0) return 'true';
      let b = null, bv = -1;
      order.forEach((id) => { if ((S.aff[id] || 0) > bv) { bv = S.aff[id] || 0; b = id; } });
      if (bv >= 60) return b;
      return 'all';
    }

    /* ── 送走遥之后：高三这一年 ── */
    if (S.day > (D().gradDay || D().lastDay)) {
      const allHigh = order.every((id) => (S.aff[id] || 0) >= 60);
      if (allHigh && S.flags.after_walk) return 'after_true';
      let b = null, bv = -1;
      order.forEach((id) => { if ((S.aff[id] || 0) > bv) { bv = S.aff[id] || 0; b = id; } });
      if (bv >= 60) return 'after_' + b;
      return 'after_alone';
    }

    /* ── 走到这里说明只到毕业式 ── */
    return routeOf();
  }

  /* 毕业式那天，你们之间是什么样子 */
  function routeOf() {
    const order = ['haruka', 'rin', 'hina', 'mio'];
    const joined = order.every((id) => S.flags['join_' + id]);
    const allDeep = order.every((id) => (S.aff[id] || 0) >= 70);
    if (joined && allDeep && S.flags.graduation_plan) return 'grad_true';
    let best = null, bestV = -1;
    order.forEach((id) => { if ((S.aff[id] || 0) > bestV) { bestV = S.aff[id] || 0; best = id; } });
    if (bestV >= 55) return 'grad_' + best;
    return 'grad_alone';
  }

  /* 三月：遥的毕业式（不结束游戏） */
  function graduationScene() {
    const e = D().endings[S.route];
    emit('divider', '');
    emit('book', '三 月 · 毕 业 式');
    if (e && e.lines) e.lines.slice(0, 4).forEach((l) => l && emit('desc', l));
    emit('divider', '');
    emit('hint', '（故事没有在这里结束。）');
    emit('sys', '四月。教室重新排了座位，第三排靠窗那个位置换了人。');
    emit('sys', '你升上三年级。这间学校里，认识的人只剩三个。');
  }

  function finale() {
    const id = judge();
    const e = D().endings[id] || D().endings.fail || { title: '完', lines: [], epilogue: '' };
    S.ended = id;
    emit('divider', '');
    emit('book', e.title);
    if (e.sub) emit('sys', e.sub);
    emit('divider', '');
    (e.lines || []).forEach((l) => { if (l) emit('desc', l); });
    emit('divider', '');
    if (e.epilogue) emit('quote', e.epilogue);
    emit('divider', '');
    emit('sys', '—— 完 ——');
    emit('hint', '输入「重来」再玩一次，或「存档」留住这一刻。');
  }

  /* ══════════ 命令 ══════════ */

  const DIRS = {
    north: ['n', '北', '上北', '北边'], south: ['s', '南', '南边'], east: ['e', '东', '东边'],
    west: ['w', '西', '西边'], up: ['u', '上', '楼上'], down: ['d', '下', '楼下'],
  };

  function findDir(word) {
    for (const d in DIRS) {
      if (DIRS[d].indexOf(word) >= 0) return d;
    }
    return null;
  }

  function enterRoom(id, silent) {
    S.room = id;
    S.visits[id] = (S.visits[id] || 0) + 1;
    if (!silent) {
      const r = D().rooms[id];
      emit('place', r.name);
      (r.desc || []).forEach((l) => say(l));
      const who = (D().heroines || []).filter((h) => h.room === id && (S.flags['met_' + h.id] || S.flags['saw_' + h.id]));
      who.forEach((h) => emit('npc', h.name + ' 在这里。'));
    }
    tryEvents();
  }

  function cmdLook(arg) {
    const r = room();
    if (arg) {
      const sc = r.scenery || {};
      const k = Object.keys(sc).find((x) => x === arg || x.indexOf(arg) >= 0);
      if (k) { emit('desc', k + '：' + sc[k]); return; }
      emit('sys', '这里没有「' + arg + '」。');
      return;
    }
    emit('place', r.name);
    (r.desc || []).forEach((l) => say(l));
    const who = (D().heroines || []).filter((h) => h.room === S.room && (S.flags['met_' + h.id] || S.flags['saw_' + h.id]));
    who.forEach((h) => emit('npc', h.name + ' 在这里。'));
    if (S.room === 'dome' && S.flags.join_haruka) emit('npc', '天野 遥 在这里。');
    const npcs = Object.keys(D().npcs || {}).filter((k) => D().npcs[k].room === S.room && (S.flags['met_' + k] || S.flags['saw_' + k]));
    npcs.forEach((k) => {
      const n = D().npcs[k];
      if (!who.some((h) => h.id === k)) emit('npc', n.name + ' 在这里。');
    });
  }

  function cmdGo(word) {
    const d = findDir(word);
    if (!d) { emit('sys', '往哪儿走？'); return false; }
    const to = (room().exits || {})[d];
    if (!to) { emit('sys', '那边没有路。'); return false; }
    enterRoom(to, false);
    return true;
  }

  function cmdTalk(arg) {
    const npcs = D().npcs || {};
    let key = null;
    if (arg) {
      key = Object.keys(npcs).find((k) => {
        const n = npcs[k];
        return n.name.indexOf(arg) >= 0 || (n.hon && n.hon.indexOf(arg) >= 0) || k === arg;
      });
      if (!key) { emit('sys', '这里没有这个人。'); return false; }
      if (npcs[key].room !== S.room) { emit('sys', npcs[key].name + ' 不在这里。'); return false; }
    } else {
      key = Object.keys(npcs).find((k) => npcs[k].room === S.room);
      if (!key) { emit('sys', '这里没有人可以说话。'); return false; }
    }
    const n = npcs[key];
    if (!S.flags['saw_' + key]) {
      S.flags['saw_' + key] = true;
      emit('divider', '');
      emit('npc', n.look || (n.name + ' 看了你一眼。'));
      emit('divider', '');
    }

    /* 每天第一次找同一个人说话，加一点好感 */
    const isHero = S.aff[key] !== undefined;
    const dkey = 'd' + key + S.day;
    const firstToday = !S.flags[dkey];
    if (isHero && firstToday) {
      S.flags[dkey] = true;
      S.aff[key] = Math.min(100, S.aff[key] + 3);
      emit('aff', n.name.split(' ')[1] + ' 的好感 +3', 'up');
    }
    let picked = null;
    (n.talk || []).forEach((seg, i) => {
      if (picked) return;
      if (S.seen['talk_' + key + '_' + i]) return;
      if (seg.when && !seg.when(S)) return;
      picked = { seg: seg, i: i };
    });
    if (picked) {
      S.seen['talk_' + key + '_' + picked.i] = true;
      emit('divider', '');
      (picked.seg.lines || []).forEach((l) => {
        if (/^「/.test(l)) emit('npc', l);
        else emit('desc', l);
      });
      if (picked.seg.aff && n.id !== 'iwa' && n.id !== 'mizaki') {
        const hid = key;
        if (S.aff[hid] !== undefined) {
          S.aff[hid] = Math.min(100, S.aff[hid] + picked.seg.aff);
          emit('aff', (n.name.split(' ')[1] || n.hon || hid) + ' 的好感 +' + picked.seg.aff, 'up');
        }
      }
      emit('divider', '');
    } else {
      const rep = n.repeat || ['……'];
      emit('desc', rep[(S.visits[S.room] || 0) % rep.length]);
      /* 今天已经聊过了：仍是一段时间，但只换来一点点 */
      if (!firstToday) {
        const ckey = 'c' + key + S.day;
        if (isHero && !S.flags[ckey] && S.aff[key] < 100) {
          S.flags[ckey] = true;
          S.aff[key] = Math.min(100, S.aff[key] + 1);
          emit('aff', n.name.split(' ')[1] + ' 的好感 +1', 'up');
        }
        return true;
      }
    }
    return true;
  }

  function cmdStatus() {
    emit('divider', '');
    emit('kv', [
      ['姓名', S.name],
      ['日期', '第 ' + S.day + ' 天（' + timeOfDay() + '）'],
      ['行动力', S.ap + ' / ' + D().apPerDay],
      ['当前', room().name],
      ['任务', S.quest || '——'],
    ]);
    emit('divider', '');
    const rows = (D().heroines || []).map((h) => {
      const v = S.aff[h.id] || 0;
      return [h.name, v + (S.flags['join_' + h.id] ? '　社員' : '　')];
    });
    emit('kv', rows);
    emit('divider', '');
  }

  function cmdSchedule() {
    emit('divider', '');
    emit('sys', '第 ' + S.day + ' 天 / 共 ' + D().lastDay + ' 天');
    const ch = (D().chapters || []).slice().reverse().find((c) => S.day >= c.day);
    if (ch) emit('sys', ch.title.replace(/ /g, ''));
    emit('hint', '▸ ' + (S.quest || '——'));
    emit('divider', '');
  }

  function cmdSleep() {
    S.ap = 0;
    spend(0);
    return true;
  }

  function cmdHelp() {
    emit('divider', '');
    emit('kv', [
      ['看 / look', '看四周；「看 石碑」可细看'],
      ['n s e w u d', '走。也可用 北 南 东 西 上 下'],
      ['说话 / talk', '和在场的人说话。常常多说几次'],
      ['填表', '在社长面前填社团申请表'],
      ['状态 / status', '日期、行动力、四个人的好感'],
      ['日程 / schedule', '今天该做什么'],
      ['睡 / sleep', '结束这一天（也可等行动力用完）'],
      ['存档 / 读档', '存到浏览器里'],
      ['重来', '从头开始'],
    ]);
    emit('divider', '');
    emit('hint', '每次行动消耗一点行动力。一天六点。用完就天黑了。');
    emit('divider', '');
  }

  /* ══════════ 主入口 ══════════ */

  function exec(line) {
    out = [];
    if (!S) { emit('sys', '（还没有开始。输入「重来」或刷新页面。）'); return out; }
    if (S.ended) {
      const cmd = (line || '').trim();
      if (/^(重来|restart)$/.test(cmd)) {
        start(S.name);
        return out;
      }
      emit('sys', '故事已经结束了。输入「重来」再玩一次。');
      return out;
    }

    const raw = (line || '').trim();
    if (!raw) return out;
    emit('echo', raw);
    const parts = raw.split(/\s+/);
    const cmd = parts[0];
    const arg = parts.slice(1).join(' ');

    let acted = false;
    let cost = 1;

    if (cmd === '看' || cmd === 'look' || cmd === 'l') { cmdLook(arg); acted = true; cost = 0; }
    else if (findDir(cmd)) { acted = cmdGo(cmd); cost = 0; }
    else if (cmd === '说话' || cmd === 'talk' || cmd === '聊' || cmd === '说') {
      const r = cmdTalk(arg || parts[1]);
      acted = (r !== false);
      if (r === 'free') cost = 0;
    }
    else if (cmd === '填表') {
      if (S.room !== 'dome') emit('sys', '这里没有意向表可以填。');
      else if (S.flags.table_filled) emit('sys', '已经填过了。');
      else { S.flags.table_filled = true; emit('good', '你把名字写在了社团申请表上。'); acted = true; }
    }
    else if (cmd === '状态' || cmd === 'status') { cmdStatus(); }
    else if (cmd === '日程' || cmd === 'schedule') { cmdSchedule(); }
    else if (cmd === '帮助' || cmd === 'help' || cmd === '?') { cmdHelp(); }
    else if (cmd === '睡' || cmd === 'sleep') { cmdSleep(); return out; }
    else if (cmd === '存档' || cmd === 'save') { emit('sys', save() ? '已存档。' : '存档失败。'); }
    else if (cmd === '读档' || cmd === 'load') {
      if (load()) { emit('sys', '已读档。'); enterRoom(S.room, false); }
      else emit('sys', '没有找到存档。');
      return out;
    }
    else if (cmd === '任务' || cmd === 'quest') { emit('hint', '▸ ' + (S.quest || '——')); }
    else if (cmd === 'help' ) { cmdHelp(); }
    else { emit('sys', '听不懂「' + raw + '」。输入 help 看看能做什么。'); }

    if (acted) {
      S.steps += 1;
      tryEvents();
      spend(cost);
    }
    return out;
  }

  /* ══════════ 存档 ══════════ */

  const KEY = 'hoshifuru.save.v1';

  function serialize() { return JSON.stringify(S); }

  function save() {
    try { localStorage.setItem(KEY, serialize()); return true; } catch (e) { return false; }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const o = JSON.parse(raw);
      if (!o || typeof o !== 'object' || !o.room || !D().rooms[o.room]) return false;
      // 旧存档可能缺字段：以 newState 为底合并，再补齐
      const defaults = newState(o.name || undefined);
      S = Object.assign({}, defaults, o);
      ['flags', 'seen', 'visits'].forEach((k) => {
        if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
      });
      if (!S.aff || typeof S.aff !== 'object') S.aff = defaults.aff;
      else for (const k of Object.keys(defaults.aff)) if (typeof S.aff[k] !== 'number' || !isFinite(S.aff[k])) S.aff[k] = 0;
      if (!isFinite(S.day) || S.day < 1) S.day = 1;
      if (!isFinite(S.ap)) S.ap = D().apPerDay;
      S.ap = Math.max(0, Math.min(S.ap, D().apPerDay));
      if (!isFinite(S.steps) || S.steps < 0) S.steps = 0;
      if (typeof S.quest !== 'string') S.quest = defaults.quest;
      S.ended = S.ended || null;
      return true;
    } catch (e) { return false; }
  }

  function hasSave() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  }

  /* ══════════ 开始 ══════════ */

  function start(name) {
    out = [];
    S = newState(name);
    emit('divider', '');
    (D().intro || []).forEach((l) => { if (l) emit('desc', l); });
    emit('divider', '');
    const ch = (D().chapters || [])[0];
    if (ch) { S.flags['chap_' + ch.id] = true; chapterBanner(ch); }
    enterRoom(D().start, true);
    return out;
  }

  return {
    start: start,
    exec: exec,
    get: () => S,
    serialize: serialize,
    hasSave: hasSave,
    timeOfDay: timeOfDay,
    judge: judge,
  };
})();
