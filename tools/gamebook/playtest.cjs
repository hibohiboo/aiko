// 陽だまりの章の自動プレイ。全画面を描画し、例外と「undefined/NaN/[object」の表示を検出する
// 使い方: node tools/gamebook/playtest.cjs '{"og":"w","sub":"s","seed":1}' [htmlのパス] [--lite]
//   og/sub=得意ともうひとつの縁（w e a s r h）、seed=乱数、greet:0=師匠に挨拶しない、late:N=藍子に会う依頼をN件目以降に、
//   part=別れの返事（0帰る 1残る 2任せる）、lean=返事の向き（0/1）
//   --lite を付けると GitHub Pages と同じ表示（説明を隠した状態）で流し、隠したはずの文言が出ていないかも調べる
const fs=require('fs'),vm=require('vm'),path=require('path');
const ARGS=process.argv.slice(2),LITE=ARGS.includes('--lite'),POS=ARGS.filter(a=>!a.startsWith('--'));
const html=fs.readFileSync(POS[1]||path.join(__dirname,'..','..','gamebook','hidamari.html'),'utf8');
const js=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
const strat=JSON.parse(POS[0]||'{}');
const HIDE=['経験値札','難度に届かない','返事の札','絆 +1','返事だった','ランクが上がると','この依頼に縁','おひねり','見習い帖の頁は','稽古をつけてくれる。','仲間と卓を囲む','一回かぎりの助っ人','新しい仲間','臨時メンバー募集'];
const bot=`
;(function(){
const P=${JSON.stringify(strat)};let rnd=P.seed||1;Math.random=()=>{rnd=(rnd*16807)%2147483647;return(rnd-1)/2147483646};
const app={innerHTML:'',classList:{toggle(){}},addEventListener(){}};
document.getElementById=()=>app;
start({});A.new();render();
const seen=new Set(),bad=[];let steps=0,fails=0,G=0;const FQ={};
const R=()=>{render();seen.add(S.scr);const h=app.innerHTML;if(/undefined|NaN|\\[object/.test(h))bad.push(S.scr+': '+h.match(/.{0,60}(undefined|NaN|\\[object).{0,30}/)[0]);
 if(${LITE}){const t=h.replace(/<[^>]+>/g,' ');for(const w of ${JSON.stringify(HIDE)})if(t.includes(w))bad.push(S.scr+': Pagesで見えてしまう「'+w+'」')}};
while(steps++<5000){
 const s=S.scr;
 if(s==='og')A.og({t:P.og||'h'});
 else if(s==='org')A.org({o:'village'});
 else if(s==='og2')A.og2({t:P.sub||P.og||'h'});
 else if(s==='grow'){G++;A.grown()}
 else if(s==='guild'){
  if(S.mem.includes('aiko')){for(const k of (P.pri||AKK)){if(!areq(k)&&acost(k)!=null&&S.ap>=acost(k)){A.ask({k});R();A.alearn();R();A.back();R()}}}
  if(P.greet!==0)for(const t of new Set([S.og,S.sub]))if(!S.gr[t]){A.school({t});R();A.back()}
  for(const id of ['aiko',...S.mem])if(S.mem.includes(id)&&!S.act.includes(id)&&S.act.length<3)S.act.push(id);
  if(S.gear.some(g=>!g.w)){A.equip();R();A.who({w:'aiko'});R();A.back()}
  if(S.gold>200&&S.items.length<4){A.shop();R();A.buy({id:'potion'});A.back()}
  R();const ri=rankI();
  const qs=Object.entries(QS).filter(([id,Q])=>(Q.rep||!S.done[id])&&(!Q.pre||Q.pre.every(k=>S.done[k]))&&Q.r<=ri&&sizeFor(Q)>=Q.min&&(id!=='q12'||d3())&&(id!=='q1'||S.done.q0)&&(!Q.need||S.act.includes(Q.need)));
  const ug=qs.find(([id,Q])=>Q.pre&&!S.uf[id]);if(S.q12at==null&&qs.some(([id])=>id==='q12'))S.q12at=Object.keys(S.done).filter(k=>QS[k].r===2).join('/');if(S.q10at==null&&qs.some(([id])=>id==='q10'))S.q10at=RK[ri];if(S.q0at==null&&S.done.q0)S.q0at=Object.keys(S.done).length;
  let pick=ug||qs.find(([id])=>id!=='q1'&&!(P.late&&id==='q0'&&Object.keys(S.done).length<P.late))||qs.find(([id])=>id!=='q1')||qs[0];
  if(!pick){if(S.temp==null&&S.gold>=40){A.recruit();R();A.hire({i:S.cands[0]});A.back();continue}console.log('STUCK',ri,S.fame,S.mem);break}
  A.quest({id:pick[0]});R();A.accept();
 }
 else if(s==='scene'){const q=S.q;
  if(q.camp){if(q.camp.done==null){A.campR({i:q.camp.kind==='eve'?0:(Math.random()*2|0)})}else A.campEnd()}
  else if(q.pages.length)A.page();
  else if(q.res)A.next();
  else{let bi=-1,bv=-1;q.hand.forEach((c,i)=>{const e=eff(c);if(e.k==='go'&&e.v>bv){bv=e.v;bi=i}});
   if(bi<0||bv<scene().d){const d=scene().d,bu=q.hand.findIndex(c=>eff(c).k==='buff');if(bu>=0){A.play({i:bu});R();continue}const need=dmgOf(d-Math.max(bv,q.buff));const hi=q.hand.findIndex(c=>eff(c).k==='heal');if(hi>=0&&(q.hp<=need||q.hp<q.max-3)){A.play({i:hi});R();continue}}
   if(bi>=0)A.play({i:bi});else A.body()}
 }
 else if(s==='reward'){if(S.rw.id==='q0')console.log('JOINED',S.mem,S.ak);A.home()}
 else if(s==='tavern'){const c=S.mem.filter(id=>S.tav!==2||id!=='aiko');if(S.tav&&c.length)A.talk({id:c[Math.random()*c.length|0]});else A.back()}
 else if(s==='talk'){if(S.talk.done==null)A.talkR({i:P.lean!=null?P.lean:(Math.random()*2|0)});else if(S.tav===2)A.tavern();else A.back()}
 else if(s==='fail'){fails++;FQ[S.ff]=(FQ[S.ff]||0)+1;if(!S.temp&&S.gold>=20+10*rankI()&&S.act.length<3){A.home();A.recruit();R();A.hire({i:S.cands[0]});A.back();R();continue}A.home()}
 else if(s==='parting')A.part({i:P.part!=null?P.part:2});
 else if(s==='ending')A.recap();
 else if(s==='recap'){R();break}
 else{console.log('unknown',s);break}
 R();
}
console.log('failQ',JSON.stringify(FQ));console.log('order',(S.GL||[]).join(''));console.log('sk',JSON.stringify(S.sk),'xp',S.xp,'growScenes',G,'gear',S.gear.map(g=>g.k).join(','),'aikoTalks',S.epi.aiko);console.log('steps',steps,'fails',fails,'scr',S.scr,'rank',RK[rankI()],'done',Object.keys(S.done).length);
console.log('ak',JSON.stringify(S.ak),'ap',S.ap,'bond',bondOf('aiko'),'lean',JSON.stringify(S.lean.aiko),'aend',JSON.stringify(S.aend));
console.log('q0 cleared as quest #',S.q0at,'qk',S.done.qk,'hood',JSON.stringify(S.gear.find(g=>g.k==='hood')));console.log('q10 first shown at rank',S.q10at,'q12 shown after',S.q12at);console.log('titles',TL.filter(t=>t.f()).map(t=>t.n).join('、'));
console.log('screens',[...seen].join(','));
if(bad.length)console.log('BAD',bad.slice(0,8));
if(P.dump){S.scr='ending';render();console.log(app.innerHTML.replace(/<[^>]+>/g,'\\n').replace(/\\n+/g,'\\n').slice(0,2500))}
})();`;
const store={};
const sb={console,document:{},window:{scrollTo(){}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},setTimeout,clearTimeout,module:{},__LITE:LITE};
sb.window.claude=undefined;
vm.createContext(sb);
vm.runInContext(js.replace("if(typeof module!=='undefined')","if(true)")+bot,sb);
