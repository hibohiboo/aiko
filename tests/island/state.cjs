// テスト用の「いろいろ進んだ状態」（道具も場所もそろっている）を作る
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
module.exports = { richState };
