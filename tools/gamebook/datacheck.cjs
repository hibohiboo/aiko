// 陽だまりの章のデータと文面の点検。問題があれば一覧を出し、終了コード1で終わる
// 使い方: node tools/gamebook/datacheck.cjs [htmlのパス]
const fs=require('fs'),vm=require('vm'),path=require('path');
const file=process.argv[2]||path.join(__dirname,'..','..','gamebook','hidamari.html');
const html=fs.readFileSync(file,'utf8');
const js=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
const NG=[];const ng=(k,m)=>NG.push(`[${k}] ${m}`);
if(html.includes('\r'))ng('改行','CRLF が含まれている（LF にする）');

// ---- データを読み込む ----
const sb={console,document:{getElementById:()=>({})},window:{},localStorage:{getItem:()=>null,setItem(){}},module:{}};
vm.createContext(sb);
vm.runInContext(js.replace(/if\(typeof module[\s\S]*$/,'')+';this.D={QS,QT,SP,REST,AQL,AK,AKN,NV,AGEN,MB,TL,GR}',sb);
const {QS,QT,SP,REST,AQL,AK,AKN,NV,AGEN,MB,TL}=sb.D;
const ids=Object.keys(QS);

// ---- 依頼ごとのそろい具合 ----
for(const id of ids){const Q=QS[id],n=Q.sc.length;
 if(!Q.in||!Q.in.length)ng('依頼',`${id} に依頼の前置き（in）がない`);
 Q.sc.forEach((s,i)=>{if(!s.p)ng('依頼',`${id} 場面${i} に場面の前の文（p）がない`);if(!s.a||!Object.keys(s.a).length)ng('依頼',`${id} 場面${i} に適性（a）がない`);if(!s.f)ng('依頼',`${id} 場面${i} に負傷の文（f）がない`)});
 if(Q.max>1&&id!=='q0'){ // 藍子が同行できる依頼
  const al=AQL[id];if(!al){ng('藍子',`${id} に藍子の場面ごとの台詞（AQL）がない`);continue}
  if(!al.s||al.s.length!==n)ng('藍子',`${id} の AQL.s の数（${al.s&&al.s.length}）が場面の数（${n}）と合わない`);
  for(const k in al.w||{})if(+k<1||+k>n-2)ng('藍子',`${id} の AQL.w[${k}] は使われない（道すがらは場面1〜${n-2}の前だけ）`);
  if(!al.af)ng('藍子',`${id} に依頼のあとの藍子の一言（AQL.af）がない`);
  if(!QT[id]||!QT[id].m||!QT[id].m.aiko)ng('藍子',`${id} の子豚亭（QT.m.aiko）に藍子の一言がない`)}
 if(!QT[id])ng('子豚亭',`${id} に依頼のあとの子豚亭（QT）がない`);
 if(Q.max>1&&!Q.eve&&!REST[id])ng('小休止',`${id} に小休止（REST）がない`)}
for(const id in AQL)if(!QS[id])ng('藍子',`AQL.${id} に対応する依頼がない`);
for(const id in NV)if(!QS[id])ng('描写',`NV.${id} に対応する依頼がない`);
for(const id in SP)for(const [m,i] of SP[id]){if(!MB[m])ng('場面',`SP.${id} の仲間 ${m} がいない`);if(!QS[id]||i>=QS[id].sc.length)ng('場面',`SP.${id} の場面番号 ${i} が範囲外`)}
// 称号「辺境の守り人」の依頼数
{const t=TL.find(t=>t.k==='full');if(t&&!t.x.startsWith(ids.length+'の依頼'))ng('称号',`「${t.n}」の説明「${t.x}」が依頼の数（${ids.length}）と合わない`)}
// 藍子の札には、札ごとの描写がある
for(const k in AK)for(const c of AK[k].card)if(!AKN[c])ng('藍子',`藍子の札「${c}」に描写（AKN）がない`);
if(!AKN[MB.aiko.bc])ng('藍子',`絆の札「${MB.aiko.bc}」に描写（AKN）がない`);

// ---- 文面の約束ごと ----
// 画面に出る文字列を全部集める
const out=new Set(),seen=new Set();
const walk=v=>{if(v==null)return;if(typeof v==='string'){out.add(v);return}if(typeof v!=='object'||seen.has(v))return;seen.add(v);for(const k in v)walk(v[k])};
walk(sb.D);
const say=[...out].join('\n');
// 会話・地の文で「札」と言わない（UIの見出しやカードの説明は対象外）
for(const m of say.matchAll(/「[^」\n]*札[^」\n]*」/g))if(!/隠し札|印を付けた札|札に細工/.test(m[0]))ng('札',m[0].slice(0,50));
// 読みにくい漢字（ルビを付けるか、ひらがな・別の言葉に）
for(const k of ['嘶','竦','翳','扮','咎','哨','蒐','抉','褪','逗','熾','顛','膏薬','癪','舐','炙','楔','掻','萎','軋','擲','樋','牝','訊','梱','夜営'])
 if(say.includes(k))ng('難読',`「${k}」が残っている`);
for(const m of say.matchAll(/(.{0,6})洞(?![窟穴察<])/g))ng('難読',`「${m[0]}」：岩なら洞窟、木のうろなら <ruby>洞<rt>うろ</rt></ruby>`);
// 元のカード名に寄せすぎた名前（この世界の言葉にした）
for(const k of ['ヒーリングヴォイス','ハッピー・フィールド','ちょいワル','生存本能','深窓の魔女','ぽかぽかエコロジー','シンデレラドリーム','ファンファンファーレ','やすらぎの温度','ゆるふわ乙女','ほほえみDiary','マイネ・リーベ','闇のゆるふわ'])
 if(html.includes(k))ng('名前',`「${k}」が残っている`);
// トーストは textContent なので、ルビは出せない
for(const k in sb.D.GR)if(/</.test(sb.D.GR[k].n))ng('装備名',`装備名にタグがある：${sb.D.GR[k].n}`);
// 実行時の上書きコードを残さない（データに直接書く）
for(const re of [/\.replace\('[^']*','[^']*'\)/,/\bTL\.push\(/,/\bAGEN\.(push|splice)\(/,/Object\.assign\(V,/])
 if(re.test(js))ng('上書き',`実行時の上書きコードが残っている：${re}`);

console.log(`依頼 ${ids.length}件（${ids.join(',')}）／藍子の語らいの話題 ${MB.aiko.ep.length}+${AGEN.length}個／藍子の小休止 焚き火${MB.aiko.camp.length}・ひと息${MB.aiko.rest.length}`);
if(NG.length){console.log(NG.join('\n'));process.exit(1)}else console.log('OK');
