// 島ゲームのユニットテスト：データのそろい具合と、文章の約束ごと。
// 使い方: npm run test:island
// 方針（足す・消すときの決まり）は docs/gamebook-island-handoff.md の「テストと確認のしかた」。
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, richState, BAD } = require('./load.cjs');

const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const around = t => (t.match(new RegExp('.{0,30}(' + BAD.source + ').{0,20}')) || [t])[0];
// 文はページの配列。ページは文字列か、思い出の回 {ep, t}
const textOf = t => [].concat(t || []).map(x => (x && typeof x === 'object') ? [x.ep, x.t].join('\n') : x).join('\n');

test('改行コードは LF', () => {
  const { html } = load();
  assert.ok(!html.includes('\r'), 'CRLF が含まれている');
});

test('どの場所でも、着いた画面・いつもの画面・考える画面に変なものが出ない', () => {
  const { G, F, els } = load();
  richState(G, F);
  for (const p of G.ORDER) {
    const [n, m] = F.nameIt(p);
    assert.ok(n && m && !BAD.test(n + m), `${p}: 地図の名前が変: ${n} / ${m}`);
    for (const [what, set] of [
      ['着いた画面', S => { S.arrived = {}; S.think = null; }],
      ['いつもの画面', S => { S.arrived[p] = 'x'; S.think = null; }],
      ['考える画面', S => { S.think = { ids: [] }; }],
    ]) {
      Object.assign(G.S, { place: p, result: null });
      set(G.S);
      F.render();
      const t = strip(els.main.innerHTML);
      assert.ok(t.trim() && !BAD.test(t), `${p} の${what}: ${around(t)}`);
    }
  }
});

test('カードの場所・時間帯・コストの書き方が正しい', () => {
  const { G } = load();
  for (const [id, c] of Object.entries(G.CARDS)) {
    if (id === 'work') continue;
    assert.ok(G.PLACES[c.p], `${id}: 場所 ${c.p} がない`);
    if (c.slot != null) assert.ok([0, 1, 2].includes(c.slot), `${id}: slot が 0〜2 でない`);
    assert.ok(Array.isArray(c.c) && c.c.length === 2, `${id}: コスト c が [食, 水] でない`);
    assert.ok(typeof c.t === 'string' && c.t && !BAD.test(c.t + (c.s || '')), `${id}: 見出しが変`);
  }
});

// カードとレシピの run を、いくつもの乱数で実行して、返り値を調べる
function checkResult(G, where, o) {
  const t = textOf(o.t);
  assert.ok(!BAD.test(t), `${where}: 文に undefined などが出る: ${around(t)}`);
  for (const k of Object.keys(o.get || {})) assert.ok(G.ITEMS[k] || G.TOOLS[k], `${where}: get の ${k} が ITEMS にない`);
  for (const k of [].concat(o.know || [])) assert.ok(G.K[k], `${where}: know の ${k} が知識（K）にない`);
  if (o.clue) assert.ok(G.CL[o.clue], `${where}: clue の ${o.clue} が違和感（CL）にない`);
  for (const p of [].concat(o.discover || [])) assert.ok(G.PLACES[p], `${where}: discover の ${p} が場所にない`);
  if (o.goto) assert.ok(G.PLACES[o.goto], `${where}: goto の ${o.goto} が場所にない`);
  if (o.photo) assert.ok(G.PHOTO[o.photo], `${where}: photo の ${o.photo} が写真（PHOTO）にない`);
  if (o.tool) assert.ok(G.TOOLS[o.tool], `${where}: tool の ${o.tool} が道具にない`);
  // 「ひとつだけ」と言って、2つ以上手に入れない
  const many = Object.entries(o.get || {}).filter(([, n]) => n > 1);
  if (many.length) assert.ok(!/ひとつだけ|一つだけ|1つだけ/.test(t), `${where}: 「ひとつだけ」と言いながら ${many.map(([k, n]) => k + '×' + n).join(',')} 手に入る`);
}

test('どのカードを実行しても、文と結果が正しい（乱数を変えて20回ずつ）', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const { G, F } = load({ seed });
    for (const [id, c] of Object.entries(G.CARDS)) {
      if (!c.run) continue;
      const S = richState(G, F, { place: c.p, slot: c.slot ?? 0 });
      S.flags.cafeN = seed % 4;
      let o;
      assert.doesNotThrow(() => { o = c.run(S) || {}; }, `${id}: run で例外`);
      checkResult(G, `カード ${id}（seed ${seed}）`, o);
    }
  }
});

test('どのレシピを作っても、文と結果が正しい', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const { G, F } = load({ seed });
    for (const r of G.RECIPES) {
      const S = richState(G, F, { place: 'camp' });
      for (const k of Object.keys(G.TOOLS)) { delete S.tools[k]; }
      let o;
      assert.doesNotThrow(() => { o = r.run(S) || {}; }, `${r.id}: run で例外`);
      checkResult(G, `レシピ ${r.id}（seed ${seed}）`, o);
    }
  }
});

test('どの持ちものを使っても、文が正しい', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const { G, F } = load({ seed });
    for (const k of Object.keys(G.ITEMS)) {
      for (const withKnife of [0, 1]) {
        const S = richState(G, F, { place: 'camp' });
        S.inv[k] = 2; S.inv.knife = withKnife;
        const opts = F.uses(k) || [];
        for (const u of opts) {
          assert.ok(u.l && !BAD.test(u.l + (u.e || '')), `持ちもの ${k}: 選択肢の文が変: ${u.l} ${u.e}`);
          if (u.dis || !u.fn) continue;
          let o;
          assert.doesNotThrow(() => { o = u.fn() || {}; }, `持ちもの ${k}「${u.l}」で例外`);
          const t = textOf(o.t);
          assert.ok(!BAD.test(t), `持ちもの ${k}「${u.l}」の文が変: ${around(t)}`);
        }
      }
    }
  }
});

test('時間帯の決まった行動は、考えている画面でも手札でも、その時間帯を案内する', () => {
  const { G, F, els } = load();
  for (const [id, c] of Object.entries(G.CARDS)) {
    if (c.slot == null) continue;
    const want = (c.slot === 2 ? '夕方' : G.SLOTS[c.slot]) + 'にできる';
    richState(G, F, { place: c.p, slot: (c.slot + 1) % 3 }); // その時間帯ではないとき
    assert.equal(F.slotOff(c), want, `${id}: 手札の案内`);
    G.S.think = { ids: [id] };
    F.render();
    assert.ok(strip(els.main.innerHTML).includes('🕒 ' + want), `${id}: 考えている画面の案内が「${want}」でない`);
  }
});

test('手札のカードは、材料や道具を持っていないときや「1日1回」を使ったあとも、手札から消えない', () => {
  // 出る条件（req）が偽になると、カードは手札から消えて、考え直すまで戻らない。
  // 材料の数や1日1回のような一時的な条件は dis（押せない理由を出す）に書く。
  const { G, F } = load();
  const mk = c => {
    const S = richState(G, F, { place: c.p });
    for (const k of Object.keys(G.ITEMS)) S.inv[k] = S.inv[k] || 1;
    Object.assign(S.flags, { birdFriend: 0 }); S.clues.bird = 1;
    return S;
  };
  for (const [id, c] of Object.entries(G.CARDS)) {
    if (!c.req || c.once || c.fixed || !c.req(mk(c))) continue;
    const poor = mk(c); // 材料がなく、背負う道具は野営地に置いてきた
    poor.store = {};
    for (const k of Object.keys(poor.inv)) { if (G.CARRY.includes(k)) poor.store[k] = 1; delete poor.inv[k]; }
    assert.ok(c.req(poor), `${id}: 材料や道具を持っていないと手札から消える（その条件を dis に移す）`);
    const used = mk(c);
    c.run(used);
    for (const k of Object.keys(G.ITEMS)) { G.S.store[k] = 3; G.S.inv[k] = G.S.inv[k] || 1; }
    assert.ok(c.req(G.S), `${id}: 使ったあと、その日のうちは手札から消える（1日1回の条件を dis に移す）`);
  }
});

test('考えて浮かんだ案は、いまできなくても手札に加えられ、手札では押せない', () => {
  const { G, F, els } = load();
  for (const [id, c] of Object.entries(G.CARDS)) {
    if (!c.dis || c.fixed) continue;
    const S = richState(G, F, { place: c.p });
    for (const k of Object.keys(S.inv)) if (!G.CARRY.includes(k)) delete S.inv[k];
    S.store = {}; delete S.inv.rod; S.flags.smudge = S.day;
    const why = c.dis(S);
    if (!why || (c.req && !c.req(S))) continue; // この状態では「できない理由」が出ないカード
    S.hand[c.p] = []; S.think = { ids: [id] };
    F.render();
    assert.ok(!/class="card off/.test(els.main.innerHTML), `${id}: 考える画面で押せない`);
    F.takeIdea(id);
    assert.ok(G.S.hand[c.p].includes(id), `${id}: できない理由（${why}）があると手札に加えられない`);
    F.render();
    assert.ok(new RegExp(`class="card off[^"]*"[^>]*data-id="${id}"`).test(els.main.innerHTML), `${id}: 手札で押せてしまう`);
  }
});

test('昔の名前・言い回しが残っていない', () => {
  const { html } = load();
  for (const w of ['ほたる石', 'ひとつも、濡れない', '用事を何も持たずに']) assert.ok(!html.includes(w), `「${w}」が残っている`);
});
