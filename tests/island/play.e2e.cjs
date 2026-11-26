// 島ゲームの大きいテスト：本物のブラウザ（Playwright の Chromium）で画面を開き、
// 押せるボタンを乱数で押しつづけて遊ぶ。そのあいだに次のことが起きたら失敗にする。
//   ・ページの例外（JavaScript のエラー）
//   ・画面に「undefined」「NaN」「[object」が出る
//   ・画面の横はみ出し（スマホ幅）
// 使い方: node tests/island/play.e2e.cjs [遊ぶ回数=4] [1回の手数=600]
const path = require('path');
const { chromium } = require('playwright');
const { load } = require('./load.cjs');
const { richState } = require('./state.cjs');

const FILE = 'file://' + path.join(__dirname, '..', '..', 'gamebook', 'island.html');
const RUNS = +process.argv[2] || 4;
const STEPS = +process.argv[3] || 600;
const BAD = /undefined|NaN|\[object/;
// 押さないボタン（データを消す・タイトルへ戻るだけ）
const SKIP = ['wipe', 'totitle'];

function rng(seed) { let r = seed; return () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; }; }

// 後半から始める回のためのセーブデータ（道具も場所もそろった12日目の朝）
function lateSave() {
  const { G, F } = load();
  const S = richState(G, F, { place: 'camp' });
  S.inv = { knife: 1, rope: 1, torch: 1, rod: 1, fish: 2, egg: 1, herb: 2 };
  return JSON.stringify(S);
}

async function play(browser, seed, viewport, late) {
  const ctx = await browser.newContext({ viewport });
  await ctx.route(/^https?:/, r => r.abort()); // アクセス解析などの外部通信はしない
  if (late) await ctx.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('aiko_drift_run1', v); sessionStorage.setItem('seeded', '1'); } }, late);
  await ctx.addInitScript(s => { let r = s; Math.random = () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; }; }, seed);
  const page = await ctx.newPage();
  const problems = [];
  const said = new Set();
  const report = (key, msg) => { if (!said.has(key)) { said.add(key); problems.push(msg); } }; // 同じ問題は1回だけ
  page.on('pageerror', e => problems.push(`例外: ${e.message}`));
  page.on('dialog', d => d.dismiss());
  await page.goto(FILE);
  const pick = rng(seed * 7919);
  const seen = new Set();
  let days = 0, ends = 0;
  for (let i = 0; i < STEPS && problems.length < 5; i++) {
    const st = await page.evaluate(({ SKIP, BAD }) => {
      const text = document.body.innerText;
      const bad = new RegExp(BAD).exec(text);
      const over = document.documentElement.scrollWidth > window.innerWidth + 1;
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const btns = [...document.querySelectorAll('button')].filter(b => !b.disabled && b.getAttribute('aria-disabled') !== 'true' && !SKIP.includes(b.id) && vis(b));
      return {
        bad: bad ? text.slice(Math.max(0, bad.index - 40), bad.index + 30).replace(/\s+/g, ' ') : null,
        over, n: btns.length,
        labels: btns.map(b => (b.id || b.dataset.id || b.className.split(' ')[0] || '?')),
      };
    }, { SKIP, BAD: BAD.source });
    if (st.bad) report(st.bad, `画面に「${st.bad}」（${i}手目）`);
    if (st.over) report('over', `横にはみ出している（${i}手目、幅 ${viewport.width}）`);
    if (!st.n) { problems.push(`押せるボタンがない（${i}手目）`); break; }
    // 先へ進むボタンは少し選ばれやすくする（同じ画面で足踏みしすぎないように）
    const w = st.labels.map(l => /^(next|goon|morn|closeday|start|cont|again|skip)$/.test(l) ? 3 : 1);
    let x = pick() * w.reduce((a, b) => a + b, 0), k = 0;
    while ((x -= w[k]) > 0) k++;
    seen.add(st.labels[k]);
    if (st.labels[k] === 'again') ends++;
    await page.evaluate(({ k, SKIP }) => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const btns = [...document.querySelectorAll('button')].filter(b => !b.disabled && b.getAttribute('aria-disabled') !== 'true' && !SKIP.includes(b.id) && vis(b));
      btns[k].click();
    }, { k, SKIP });
  }
  days = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('aiko_drift_run1') || 'null')?.day ?? 'おわり'; } catch (e) { return '?'; } });
  await ctx.close();
  return { problems, seen: seen.size, days, ends };
}

(async () => {
  const browser = await chromium.launch();
  let ng = 0;
  for (let r = 1; r <= RUNS; r++) {
    const viewport = r % 2 ? { width: 390, height: 844 } : { width: 1280, height: 800 };
    const late = r % 4 >= 2 ? lateSave() : null; // 4回のうち2回は、後半のセーブから「つづきから」
    const res = await play(browser, r, viewport, late);
    console.log(`${res.problems.length ? 'NG' : 'OK'} seed ${r}（幅 ${viewport.width}・${late ? '後半から' : 'はじめから'}）: ${STEPS}手、押したボタン ${res.seen}種類、最後は ${res.days} 日目、島の終わり ${res.ends}回`);
    for (const p of res.problems) console.log('  - ' + p);
    if (res.problems.length) ng++;
  }
  await browser.close();
  process.exit(ng ? 1 : 0);
})();
