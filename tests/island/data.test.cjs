// 島ゲームのユニットテスト：データのそろい具合と、文章の約束ごと。
// 使い方: node --test tests/island/
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');
const { richState: rich } = require('./state.cjs');
const richState = (G, F, set, over) => rich(G, F, over);

const BAD = /undefined|NaN|\[object|null(?![a-z])/;
// 文はページの配列。ページは文字列か、思い出の回 {ep, t}
const textOf = t => [].concat(t || []).map(x => (x && typeof x === 'object') ? [x.ep, x.t].join('\n') : x).join('\n');

test('改行コードは LF', () => {
  const { html } = load();
  assert.ok(!html.includes('\r'), 'CRLF が含まれている');
});

test('どの場所にも、名前・考える文・地図の名前がある（着いたときの文は、あれば正しい）', () => {
  const { G, F, set } = load();
  richState(G, F, set);
  for (const p of G.ORDER) {
    assert.ok(G.PLACES[p] && G.PLACES[p].n, `${p}: PLACES に名前がない`);
    assert.ok(G.NAMES[p], `${p}: 地図の名前（NAMES）がない`);
    const [n, m] = F.nameIt(p);
    assert.ok(n && m && !BAD.test(n + m), `${p}: 地図の名前が変: ${n} / ${m}`);
    if (G.ARRIVE[p]) { // 着いたときの文は、ある場所だけ
      const a = textOf(F.arriveOf(p));
      assert.ok(a && !BAD.test(a), `${p}: 着いたときの文が変: ${a.slice(0, 40)}`);
    }
    G.S.place = p;
    const sc = F.sceneText(G.S);
    assert.ok(sc && !BAD.test(sc), `${p}: 場所の描写が変: ${sc}`);
    assert.ok(G.THINK[p], `${p}: 「考える」の文（THINK）がない（画面に undefined が出る）`);
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
  assert.ok(!BAD.test(t), `${where}: 文に undefined などが出る: ${(t.match(/.{0,30}(undefined|NaN|\[object|null).{0,20}/) || [t])[0]}`);
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
    const { G, F, set } = load({ seed });
    for (const [id, c] of Object.entries(G.CARDS)) {
      if (!c.run) continue;
      const S = richState(G, F, set, { place: c.p, slot: c.slot ?? 0 });
      S.flags.cafeN = seed % 4;
      let o;
      assert.doesNotThrow(() => { o = c.run(S) || {}; }, `${id}: run で例外`);
      checkResult(G, `カード ${id}（seed ${seed}）`, o);
    }
  }
});

test('どのレシピを作っても、文と結果が正しい', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const { G, F, set } = load({ seed });
    for (const r of G.RECIPES) {
      const S = richState(G, F, set, { place: 'camp' });
      for (const k of Object.keys(G.TOOLS)) { delete S.tools[k]; }
      let o;
      assert.doesNotThrow(() => { o = r.run(S) || {}; }, `${r.id}: run で例外`);
      checkResult(G, `レシピ ${r.id}（seed ${seed}）`, o);
    }
  }
});

test('どの持ちものを使っても、文が正しい', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const { G, F, set } = load({ seed });
    for (const k of Object.keys(G.ITEMS)) {
      for (const withKnife of [0, 1]) {
        const S = richState(G, F, set, { place: 'camp' });
        S.inv[k] = 2; S.inv.knife = withKnife;
        const opts = F.uses(k) || [];
        for (const u of opts) {
          assert.ok(u.l && !BAD.test(u.l + (u.e || '')), `持ちもの ${k}: 選択肢の文が変: ${u.l} ${u.e}`);
          if (u.dis || !u.fn) continue;
          let o;
          assert.doesNotThrow(() => { o = u.fn() || {}; }, `持ちもの ${k}「${u.l}」で例外`);
          const t = textOf(o.t);
          assert.ok(!BAD.test(t), `持ちもの ${k}「${u.l}」の文が変: ${t.slice(0, 60)}`);
        }
      }
    }
  }
});

test('時間帯の決まった行動は、考えているときも手札でも、同じ時間帯を案内する', () => {
  const { G, F } = load();
  for (const [id, c] of Object.entries(G.CARDS)) {
    if (c.slot == null) continue;
    const want = (c.slot === 2 ? '夕方' : G.SLOTS[c.slot]) + 'にできる';
    F.newRun(); G.S.slot = (c.slot + 1) % 3; // その時間帯ではないときの案内
    assert.equal(F.slotOff(c), want, `${id}: 手札の案内`);
  }
  // 考えているときの注記は、手札の案内と同じ書き方で作る（決め打ちの「夕方」を使わない）
  const { js } = load();
  assert.ok(!/note info">🕒 夕方にできる/.test(js), '考えているときの注記が「夕方」の決め打ちに戻っている');
});

test('昔の名前・言い回しが残っていない', () => {
  const { html } = load();
  for (const w of ['ほたる石', 'ひとつも、濡れない', '用事を何も持たずに']) assert.ok(!html.includes(w), `「${w}」が残っている`);
});
