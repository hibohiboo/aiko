// gamebook/island.html の文章（日本語を含む文字列）を、場所ごとに書き出す。
// 使い方: node tools/island-texts.cjs [出力先]   （既定: work/island-texts.txt）
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'gamebook/island.html'), 'utf8');
const out = process.argv[2] || path.join(root, 'work/island-texts.txt');

const start = src.indexOf('<script>');
const head = src.slice(0, start).split('\n').length;
const lines = src.slice(start).split('\n');
const JP = /[぀-ヿ一-鿿]/;

// 文字列リテラル（'...' と `...`）を取り出す
function strings(line) {
  const res = [];
  for (let i = 0; i < line.length; i++) {
    const q = line[i];
    if (q !== "'" && q !== '`') continue;
    if (q === "'" && i > 0 && line[i - 1] === '\\') continue;
    let j = i + 1, s = '';
    for (; j < line.length; j++) {
      if (line[j] === '\\') { s += line[j] + line[j + 1]; j++; continue; }
      if (line[j] === q) break;
      s += line[j];
    }
    if (j >= line.length) break;
    if (JP.test(s)) res.push(s);
    i = j;
  }
  return res;
}
const clean = s => s
  .replace(/\\n/g, '\n')
  .replace(/\\'/g, "'")
  .replace(/<[^>]+>/g, '')
  .replace(/\$\{[^}]*\}/g, '〈…〉');

// どこの文章か（直前の const 名、カード、レシピ、オブジェクトのキー）
let group = '', label = '';
const body = [];
lines.forEach((line, k) => {
  const no = head + k;
  let m;
  if ((m = line.match(/^(?:const|let)\s+([A-Z][A-Z_0-9]*)\s*=/))) { group = m[1]; label = ''; }
  else if ((m = line.match(/^function\s+(\w+)/))) { group = m[1] + '()'; label = ''; }
  if ((m = line.match(/^C\('(\w+)','(\w+)',\{i:'[^']*',t:'([^']*)'/))) { group = 'カード'; label = `${m[1]} / ${m[2]}（${m[3]}）`; }
  else if ((m = line.match(/^\s*\{id:'(\w+)',i:'[^']*',t:'([^']*)'/))) { group = 'レシピ'; label = `${m[1]}（${m[2]}）`; }
  else if ((m = line.match(/^\s+(\w+):\s*[\['s(]/)) && /^[A-Z]/.test(group)) label = m[1];
  else if ((m = line.match(/^\s+case '(\w+)':/))) label = m[1];
  const ss = strings(line).map(clean).filter(s => s.trim());
  if (!ss.length) return;
  body.push({ no, group, label, ss });
});

let txt = `# ゆるふわソロキャンアイランド 文章一覧\n# gamebook/island.html から自動で書き出したもの（行番号つき）。\n# 〈…〉は状態で変わる部分。\n`;
let lastG = null, lastL = null;
for (const b of body) {
  if (b.group !== lastG) { txt += `\n\n==================== ${b.group || '(冒頭)'} ====================\n`; lastG = b.group; lastL = null; }
  if (b.label !== lastL) { if (b.label) txt += `\n----- ${b.label} -----\n`; lastL = b.label; }
  for (const s of b.ss) txt += `[L${b.no}] ${s.replace(/\n/g, '\n        ')}\n`;
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, txt);
console.log(out, body.length + ' 行ぶん');
