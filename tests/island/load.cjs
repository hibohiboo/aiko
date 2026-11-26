// gamebook/island.html のゲーム本体を、ブラウザなしで node の vm に読み込む。
// ユニットテストから使う。データと関数を取り出し、画面の HTML も文字列として読める。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', '..', 'gamebook', 'island.html');

// 何を呼ばれても壊れない、ゆるい DOM 要素
function el() {
  const e = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, remove() {},
    setAttribute() {}, getAttribute: () => null, focus() {}, scrollIntoView() {},
    querySelector: () => el(), querySelectorAll: () => [],
  };
  return e;
}

// 取り出すトップレベルの名前（const は vm の外から見えないので、最後に this へ載せる）
const EXPOSE = ['S', 'UI', 'META', 'ITEMS', 'TOOLS', 'K', 'EP', 'PHOTO', 'CL', 'PLACES', 'ORDER', 'NAMES', 'ARRIVE',
  'CARDS', 'RECIPES', 'IDEA', 'FIRSTIDEA', 'LIFEIDEA', 'GOIDEA', 'TRACE', 'SLOTS', 'COOK', 'EDIBLE', 'CARRY',
  'MATS', 'POT', 'DRINKS', 'KEEPS', 'SNACKS', 'EDGES', 'SHELTER', 'GIVES', 'FIND', 'MILESTONES', 'DAYNAME'];
const FUNCS = ['newRun', 'save', 'act', 'craft', 'proceed', 'move', 'think', 'takeIdea', 'idle', 'doNight', 'morning',
  'morningLine', 'startDay', 'uses', 'useItem', 'render', 'slotOff', 'disOf', 'handOf', 'nameIt', 'arriveOf', 'sceneText',
  'cafeVisit', 'dryDone', 'apply', 'learn'];

function load({ seed = 1, html = fs.readFileSync(FILE, 'utf8') } = {}) {
  const i = html.lastIndexOf('<script>');
  const js = html.slice(i + 8, html.lastIndexOf('</script>'));
  const storage = {};
  const els = {}; // id ごとの要素。描いた HTML は els.main.innerHTML などで読める
  let rnd = seed;
  const math = Object.create(Math);
  math.random = () => { rnd = (rnd * 16807) % 2147483647; return (rnd - 1) / 2147483646; };
  const sb = {
    console, Math: math, JSON, Object, Array, String, Number, Set, Map, Date, RegExp, Error, Promise,
    setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0,
    confirm: () => false, alert() {},
    location: { hostname: 'localhost', search: '', reload() {} },
    localStorage: { getItem: k => storage[k] ?? null, setItem: (k, v) => { storage[k] = String(v); }, removeItem: k => { delete storage[k]; } },
    document: { getElementById: id => els[id] || (els[id] = el()), querySelector: () => el(), querySelectorAll: () => [], createElement: () => el(), head: el(), addEventListener() {} },
  };
  sb.window = sb; sb.globalThis = sb;
  sb.window.scrollTo = () => {};
  vm.createContext(sb);
  const getters = EXPOSE.map(n => `${JSON.stringify(n)}:()=>typeof ${n}==='undefined'?undefined:${n}`).join(',');
  const fns = FUNCS.map(n => `${JSON.stringify(n)}:(...a)=>${n}(...a)`).join(',');
  vm.runInContext(`${js}\n;this.__G={${getters}};this.__F={${fns}};this.__set=(k,v)=>{eval(k+'=v')};`, sb, { filename: 'island.js' });
  const G = new Proxy({}, { get: (_, k) => (sb.__G[k] ? sb.__G[k]() : undefined) });
  return { G, F: sb.__F, set: sb.__set, sb, js, html, els };
}

// 画面や文に出てはいけないもの（ユニットテストと大きいテストで共通）
const BAD = /undefined|NaN|\[object|null(?![a-z])/;

// テスト用の「いろいろ進んだ状態」（道具も場所もそろった12日目）を作る
function richState(G, F, over = {}) {
  F.newRun();
  const S = G.S;
  S.result = null;
  Object.assign(S, { day: 12, fire: 1, shelter: 2, hp: 90, food: 80, water: 80, names: {} });
  for (const p of G.ORDER) S.places[p] = 1;
  for (const k of G.CARRY) S.inv[k] = 1;
  for (const k of Object.keys(G.TOOLS)) if (!G.CARRY.includes(k)) S.tools[k] = 1;
  for (const k of Object.keys(G.ITEMS)) S.store[k] = 3;
  Object.assign(S.flags, { life50: 1, birdFriend: 1, tea: 1, village: 1 });
  S.traces = { melody: 1, terrace: 1 };
  Object.assign(S, over);
  return S;
}

module.exports = { load, richState, BAD, FILE };
