export interface WikiPage {
  name: string;
  url: string;
  category: Category;
  subCategory?: string;
  order: number;
}

export type Category =
  | 'deresute_card'
  | 'mobamas_card'
  | 'event_story'
  | 'anime'
  | 'memorial'
  | 'other';

export const BASE_URL = 'https://seesaawiki.jp/aiko_takamori';

export const CATEGORY_DIRS: Record<Category, string> = {
  mobamas_card: '01_mobamas_card',
  deresute_card: '02_deresute_card',
  anime: '03_anime',
  event_story: '04_event_story',
  memorial: '05_memorial',
  other: '06_other',
};

// ─── デレステ カードボイス ───────────────────────────────────────────────────
const DERESUTE_CARDS: WikiPage[] = [
  { name: '高森藍子', url: '/d/%b9%e2%bf%b9%cd%f5%bb%d2', category: 'deresute_card', order: 1 },
  { name: 'ゆるふわ歌姫', url: '/d/%a4%e6%a4%eb%a4%d5%a4%ef%b2%b5%bd%f7%28%a5%c7%a5%ec%a5%b9%a5%c6%29', category: 'deresute_card', order: 2 },
  { name: 'てづくりのしあわせ', url: '/d/%a4%c6%a4%c5%a4%af%a4%ea%a4%ce%a4%b7%a4%a2%a4%ef%a4%bb', category: 'deresute_card', order: 3 },
  { name: '生存本能ヴァルキューリア', url: '/d/%c0%b8%c2%b8%cb%dc%c7%bd%a5%f4%a5%a1%a5%eb%a5%ad%a5%e5%a5%ea%a5%a2', category: 'deresute_card', order: 4 },
  { name: 'あたたかな場所', url: '/d/%a4%a2%a4%bf%a4%bf%a4%ab%a4%ca%b5%ef%be%ec%bd%ea', category: 'deresute_card', order: 5 },
  { name: '情熱ファンファンファーレ', url: '/d/%be%f0%c7%ae%a5%d5%a5%a1%a5%f3%a5%d5%a5%a1%a5%f3%a5%d5%a5%a1%a1%bc%a5%ec', category: 'deresute_card', order: 6 },
  { name: '深窓の魔女（デレステ）', url: '/d/%bf%bc%ce%d0%a4%ce%cb%e2%bd%f7%28%a5%c7%a5%ec%a5%b9%a5%c6%29', category: 'deresute_card', order: 7 },
  { name: '笑顔のレセプション', url: '/d/%be%d0%b4%e9%a4%ce%a5%ec%a5%bb%a5%d7%a5%b7%a5%e7%a5%f3', category: 'deresute_card', order: 8 },
  { name: 'スパイスパラダイス', url: '/d/%a5%b9%a5%d1%a5%a4%a5%b9%a5%d1%a5%e9%a5%c0%a5%a4%a5%b9', category: 'deresute_card', order: 9 },
  { name: 'ほほえみDiary', url: '/d/%a4%db%a4%db%a4%a8%a4%dfDiary', category: 'deresute_card', order: 10 },
  { name: 'やすらぎの温度', url: '/d/%a4%e4%a4%b9%a4%e9%a4%ae%a4%ce%b2%b9%c5%d9', category: 'deresute_card', order: 11 },
  { name: '黒き森の歌姫', url: '/d/%b9%f5%a4%ad%bf%b9%a4%ce%b2%b5%bd%f7', category: 'deresute_card', order: 12 },
  { name: 'あいの青い', url: '/d/%a4%a2%a4%a4%a4%ce%c0%c0%a4%a4', category: 'deresute_card', order: 13 },
  { name: '未覚開花前線', url: '/d/%cc%b4%bf%a7%b3%ab%b2%d6%c1%b0%c0%fe', category: 'deresute_card', order: 14 },
];

// ─── モバマス カードコミュ ──────────────────────────────────────────────────
const MOBAMAS_CARDS: WikiPage[] = [
  { name: '高森藍子N', url: '/d/%b9%e2%bf%b9%cd%f5%bb%d2N', category: 'mobamas_card', order: 1 },
  { name: 'バレンタイン', url: '/d/%a5%d0%a5%ec%a5%f3%a5%bf%a5%a4%a5%f3', category: 'mobamas_card', order: 2 },
  { name: 'ふんわりガール', url: '/d/%a4%d5%a4%f3%a4%ef%a4%ea%a5%ac%a1%bc%a5%eb', category: 'mobamas_card', order: 3 },
  { name: 'アニバーサリーイエロー', url: '/d/%a5%a2%a5%cb%a5%d0%a1%bc%a5%b5%a5%ea%a1%bc%a5%a4%a5%a8%a5%ed%a1%bc', category: 'mobamas_card', order: 4 },
  { name: 'ゆるふわ秘書', url: '/d/%a4%e6%a4%eb%a4%d5%a4%ef%b2%b5%bd%f7', category: 'mobamas_card', order: 5 },
  { name: '深窓の魔女', url: '/d/%bf%bc%ce%d0%a4%ce%cb%e2%bd%f7', category: 'mobamas_card', order: 6 },
  { name: 'CDデビュー', url: '/d/CD%a5%c7%a5%d3%a5%e5%a1%bc', category: 'mobamas_card', order: 7 },
  { name: 'シンデレラドリーム', url: '/d/%a5%b7%a5%f3%a5%c7%a5%ec%a5%e9%a5%c9%a5%ea%a1%bc%a5%e0', category: 'mobamas_card', order: 8 },
  { name: 'おさんぽ日和', url: '/d/%a4%aa%a4%b5%a4%f3%a4%dd%c6%fc%cf%c2', category: 'mobamas_card', order: 9 },
  { name: 'まごころプレゼント', url: '/d/%a4%de%a4%b4%a4%b3%a4%ed%a5%d7%a5%ec%a5%bc%a5%f3%a5%c8', category: 'mobamas_card', order: 10 },
  { name: '放課後サマー', url: '/d/%ca%fc%b2%dd%b8%e5%a5%b5%a5%de%a1%bc', category: 'mobamas_card', order: 11 },
  { name: '新秋ガール', url: '/d/%bf%b7%bd%d5%a5%ac%a1%bc%a5%eb', category: 'mobamas_card', order: 12 },
  { name: '双子のバンデット', url: '/d/%bd%d9%c9%f7%a4%ce%a5%d0%a5%f3%a5%c7%a5%c3%a5%c8', category: 'mobamas_card', order: 13 },
  { name: 'ちいさなともだち', url: '/d/%a4%c1%a4%a4%a4%b5%a4%ca%a4%c8%a4%e2%a4%c0%a4%c1', category: 'mobamas_card', order: 14 },
  { name: '琴棋の棋聲', url: '/d/%c7%f2%b6%e4%a4%ce%b2%ce%c0%bc', category: 'mobamas_card', order: 15 },
  { name: 'ほんわか花嫁', url: '/d/%a4%db%a4%f3%a4%ef%a4%ab%b2%d6%b2%c7', category: 'mobamas_card', order: 16 },
  { name: 'ぽかぽかエコロジー', url: '/d/%a4%dd%a4%ab%a4%dd%a4%ab%a5%a8%a5%b3%a5%ed%a5%b8%a1%bc', category: 'mobamas_card', order: 17 },
  { name: 'かさなる思い出', url: '/d/%a4%ab%a4%b5%a4%ca%a4%eb%bb%d7%a4%a4%bd%d0', category: 'mobamas_card', order: 18 },
  { name: 'てづくりのしあわせ（モバマス）', url: '/d/%a4%c6%a4%c5%a4%af%a4%ea%a4%ce%a4%b7%a4%a2%a4%ef%a4%bb%28%a5%e2%a5%d0%a5%de%a5%b9%29', category: 'mobamas_card', order: 19 },
  { name: 'ここに春を', url: '/d/%a4%b3%a4%b3%a4%ed%a4%cb%bd%d5%a4%f2', category: 'mobamas_card', order: 20 },
  { name: 'スパークルスター（2020）', url: '/d/%a5%b9%a5%d1%a1%bc%a5%af%a5%eb%a5%b9%a5%bf%a1%bc%282020%29', category: 'mobamas_card', order: 21 },
  { name: 'あたたかな場所（モバマス）', url: '/d/%a4%a2%a4%bf%a4%bf%a4%ab%a4%ca%b5%ef%be%ec%bd%ea%28%a5%e2%a5%d0%a5%de%a5%b9%29', category: 'mobamas_card', order: 22 },
  { name: '内緒の休息日', url: '/d/%c6%e2%bd%ef%a4%ce%b5%d9%c2%a9%c6%fc', category: 'mobamas_card', order: 23 },
  { name: 'のんびりタイム', url: '/d/%a4%ce%a4%f3%a4%d3%a4%ea%a5%bf%a5%a4%a5%e0', category: 'mobamas_card', order: 24 },
];

// ─── イベントストーリー ─────────────────────────────────────────────────────
const EVENT_STORIES: WikiPage[] = [
  // 絶対定義します！
  { name: '絶対定義_OP', url: '/d/OP%20%c0%e4%c2%d0%a1%f9%c6%c3%b8%a2', category: 'event_story', subCategory: '01_zettai_teigi', order: 1 },
  { name: '絶対定義_第1話', url: '/d/%c2%e81%cf%c3%20%b0%a6%cd%fc%a4%ce%a5%ea%a1%bc%a5%c0%a1%bc%c6%c3%b8%a2', category: 'event_story', subCategory: '01_zettai_teigi', order: 2 },
  { name: '絶対定義_第2話', url: '/d/%c2%e82%cf%c3%20%b0%ab%a4%ce%b0%ae%ce%cf%bc%e7%c4%a5', category: 'event_story', subCategory: '01_zettai_teigi', order: 3 },
  { name: '絶対定義_第3話', url: '/d/%c2%e83%cf%c3%20%b5%b1%bb%d2%a4%ce%a4%dc%a4%c3%a4%c1%bc%e7%c4%a5', category: 'event_story', subCategory: '01_zettai_teigi', order: 4 },
  { name: '絶対定義_第4話', url: '/d/%c2%e84%cf%c3%20%cd%b5%bb%d2%a4%ce%a5%b5%a5%a4%a5%ad%a5%c3%a5%af%bc%e7%c4%a5', category: 'event_story', subCategory: '01_zettai_teigi', order: 5 },
  { name: '絶対定義_第5話', url: '/d/%c2%e85%cf%c3%20%cd%f5%bb%d2%a4%ce%a4%e6%a4%eb%a4%d5%a4%ef%bc%e7%c4%a5', category: 'event_story', subCategory: '01_zettai_teigi', order: 6 },
  { name: '絶対定義_ED', url: '/d/ED%20%c2%c7%a4%c1%be%e5%a4%b2%a5%d1%a1%bc%a5%c6%a5%a3%a1%bc%a2%f6', category: 'event_story', subCategory: '01_zettai_teigi', order: 7 },
  // 生存本能ヴァルキューリア
  { name: 'ヴァルキューリア_OP', url: '/d/OP%20%c0%ef%b2%b5%bd%f7%a4%cb%a4%ca%a4%eb%c6%fc', category: 'event_story', subCategory: '02_valkyria', order: 1 },
  { name: 'ヴァルキューリア_第1話', url: '/d/%c2%e81%cf%c3%20%be%af%bd%f7%a4%cf%c0%ef%b2%b5%bd%f7%a4%ce%c0%bc%a4%f2%c5%bb%a4%a6', category: 'event_story', subCategory: '02_valkyria', order: 2 },
  { name: 'ヴァルキューリア_第2話', url: '/d/%c2%e82%cf%c3%20%be%af%bd%f7%a4%cf%bd%f7%bf%c0%a4%cb%c6%b4%a4%ec%a4%eb', category: 'event_story', subCategory: '02_valkyria', order: 3 },
  { name: 'ヴァルキューリア_第3話', url: '/d/%c2%e83%cf%c3%20%be%af%bd%f7%a4%cf%c9%f7%a4%cb%ca%f1%a4%de%a4%ec%a4%eb', category: 'event_story', subCategory: '02_valkyria', order: 4 },
  { name: 'ヴァルキューリア_第4話', url: '/d/%c2%e84%cf%c3%20%be%af%bd%f7%a4%cf%b9%ac%a4%bb%a4%f2%b6%b5%a4%a8%a4%eb', category: 'event_story', subCategory: '02_valkyria', order: 5 },
  { name: 'ヴァルキューリア_第5話', url: '/d/%c2%e85%cf%c3%20%be%af%bd%f7%a4%cf%b2%d6%a4%cb%ca%f1%a4%de%a4%ec%a4%eb', category: 'event_story', subCategory: '02_valkyria', order: 6 },
  { name: 'ヴァルキューリア_ED', url: '/d/ED%20%b2%b5%bd%f7%a4%bf%a4%c1%a4%ce%b1%e0', category: 'event_story', subCategory: '02_valkyria', order: 7 },
  // Flip Flop
  { name: 'FlipFlop_OP', url: '/d/OP%20Woh%20yeah%21%20Slapstick%21', category: 'event_story', subCategory: '03_flip_flop', order: 1 },
  { name: 'FlipFlop_第1話', url: '/d/%c2%e81%cf%c3%20%a5%ec%a5%c3%a5%c4%a1%a6%a5%e2%a5%df%a5%b8%a1%a6%a5%cf%a5%f3%a5%c6%a5%a3%a5%f3%a5%b0', category: 'event_story', subCategory: '03_flip_flop', order: 2 },
  { name: 'FlipFlop_第2話', url: '/d/%c2%e82%cf%c3%20%c7%f2%a4%a4%bd%a9%a4%ce%b7%c3%a4%df', category: 'event_story', subCategory: '03_flip_flop', order: 3 },
  { name: 'FlipFlop_第3話', url: '/d/%c2%e83%cf%c3%20%be%e5%a4%f2%b8%fe%a4%a4%a4%c6%c5%be%a4%dc%a4%a6', category: 'event_story', subCategory: '03_flip_flop', order: 4 },
  { name: 'FlipFlop_第4話', url: '/d/%c2%e84%cf%c3%20%a4%ab%a4%af%a4%e2%b8%b1%a4%b7%a4%ad%b8%e6%b0%f2%c6%bb', category: 'event_story', subCategory: '03_flip_flop', order: 5 },
  { name: 'FlipFlop_第5話', url: '/d/%c2%e85%cf%c3%20%a4%b7%a4%a2%a4%ef%a4%bb%a4%ce%a4%aa%a4%b9%a4%bd%a4%ef%a4%b1', category: 'event_story', subCategory: '03_flip_flop', order: 6 },
  { name: 'FlipFlop_ED', url: '/d/ED%20Laugh%20and%20grow%20happy%21', category: 'event_story', subCategory: '03_flip_flop', order: 7 },
  // 情熱ファンファンファーレ
  { name: 'ファンファーレ_OP', url: '/d/OP%20FUN%26FAN%21%21%21', category: 'event_story', subCategory: '04_fanfare', order: 1 },
  { name: 'ファンファーレ_第1話', url: '/d/%c2%e81%cf%c3%20%c5%d8%ce%cf%a1%f9%a5%ec%a5%c3%a5%b9%a5%f3%a5%c7%a5%a4', category: 'event_story', subCategory: '04_fanfare', order: 2 },
  { name: 'ファンファーレ_第2話', url: '/d/%c2%e82%cf%c3%20%cd%a7%be%f0%a1%f9%a5%aa%a5%d5%a5%bf%a5%a4%a5%e0', category: 'event_story', subCategory: '04_fanfare', order: 3 },
  { name: 'ファンファーレ_第3話', url: '/d/%c2%e83%cf%c3%20%cd%a6%b5%a4%a1%f9%a5%e6%a5%a2%a5%cf%a1%bc%a5%c8', category: 'event_story', subCategory: '04_fanfare', order: 4 },
  { name: 'ファンファーレ_第4話', url: '/d/%c2%e84%cf%c3%20%cc%a4%cd%e8%a1%f9%a5%a6%a5%a3%a5%ba%a5%e6%a1%bc', category: 'event_story', subCategory: '04_fanfare', order: 5 },
  { name: 'ファンファーレ_第5話', url: '/d/%c2%e85%cf%c3%20%c0%c4%bd%d5%a1%f9%a5%d5%a5%a9%a1%bc%a5%a8%a5%d0%a1%bc', category: 'event_story', subCategory: '04_fanfare', order: 6 },
  { name: 'ファンファーレ_ED', url: '/d/ED%20Positive%26Passion%21%21%21', category: 'event_story', subCategory: '04_fanfare', order: 7 },
  // スパイスパラダイス
  { name: 'スパイスパラダイス_OP', url: '/d/OP%20%c4%b6%cb%dc%b3%ca%a1%f9curry%20the%20MOVIE', category: 'event_story', subCategory: '05_spice', order: 1 },
  { name: 'スパイスパラダイス_第1話', url: '/d/%c2%e81%cf%c3%a1%a1%a4%aa%a4%ab%a4%ef%a4%ea%a4%b4%cd%d1%b0%d5%a1%f9cumin', category: 'event_story', subCategory: '05_spice', order: 2 },
  { name: 'スパイスパラダイス_第2話', url: '/d/%c2%e82%cf%c3%a1%a1%a4%ac%a4%c3%a4%c4%a4%ea%c6%c3%b7%b1%a1%f9turmeric', category: 'event_story', subCategory: '05_spice', order: 3 },
  { name: 'スパイスパラダイス_第3話', url: '/d/%c2%e83%cf%c3%a1%a1%a4%b8%a4%c3%a4%af%a4%ea%bd%cf%c0%ae%a1%f9red%20chili', category: 'event_story', subCategory: '05_spice', order: 4 },
  { name: 'スパイスパラダイス_第4話', url: '/d/%c2%e84%cf%c3%a1%a1%c6%c3%c0%b9%a1%f9curry%20TV%20special%28%c1%b0%29', category: 'event_story', subCategory: '05_spice', order: 5 },
  { name: 'スパイスパラダイス_第5話', url: '/d/%c2%e85%cf%c3%a1%a1%c6%c3%c0%b9%a1%f9curry%20TV%20special%28%b8%e5%29', category: 'event_story', subCategory: '05_spice', order: 6 },
  { name: 'スパイスパラダイス_ED', url: '/d/ED%20%cb%fe%ca%a2%cb%fe%c2%ad%a1%f9spice%20%26%20paradise', category: 'event_story', subCategory: '05_spice', order: 7 },
  // Stage Bye Stage
  { name: 'StageByeStage_OP', url: '/d/OP%20A%20New%20Stage%20Has%20Come%21', category: 'event_story', subCategory: '06_stage_bye_stage', order: 1 },
  { name: 'StageByeStage_第1話', url: '/d/1%cf%c3%20Which%20Do%20You%20Watch', category: 'event_story', subCategory: '06_stage_bye_stage', order: 2 },
  { name: 'StageByeStage_第2話', url: '/d/2%cf%c3%20Lesson%20Partner', category: 'event_story', subCategory: '06_stage_bye_stage', order: 3 },
  { name: 'StageByeStage_第3話', url: '/d/3%cf%c3%20Your%20Voice%20Will', category: 'event_story', subCategory: '06_stage_bye_stage', order: 4 },
  { name: 'StageByeStage_第4話', url: '/d/4%cf%c3%20Choose%20Their%20Stage', category: 'event_story', subCategory: '06_stage_bye_stage', order: 5 },
  { name: 'StageByeStage_第5話', url: '/d/5%cf%c3%20Everyone%20Will%20Fun%a1%aa', category: 'event_story', subCategory: '06_stage_bye_stage', order: 6 },
  { name: 'StageByeStage_ED', url: '/d/ED%20Step%20for%20Next%20Stage', category: 'event_story', subCategory: '06_stage_bye_stage', order: 7 },
  // TRUE COLORS
  { name: 'TrueColors_OP', url: '/d/OP%20Gemstones%20in%20the%20Room', category: 'event_story', subCategory: '07_true_colors', order: 1 },
  { name: 'TrueColors_第1話', url: '/d/1%cf%c3%20Lesson%20in%20Harmony', category: 'event_story', subCategory: '07_true_colors', order: 2 },
  { name: 'TrueColors_第2話', url: '/d/2%cf%c3%20Aim%20of%20the%20Meeting', category: 'event_story', subCategory: '07_true_colors', order: 3 },
  { name: 'TrueColors_第3話', url: '/d/3%cf%c3%20What%a1%c7s%20Your%20Color%a1%a9', category: 'event_story', subCategory: '07_true_colors', order: 4 },
  { name: 'TrueColors_第4話', url: '/d/4%cf%c3%20Gather%20for%20Stage', category: 'event_story', subCategory: '07_true_colors', order: 5 },
  { name: 'TrueColors_第5話', url: '/d/5%cf%c3%20True%20Colors', category: 'event_story', subCategory: '07_true_colors', order: 6 },
  { name: 'TrueColors_ED', url: '/d/ED%20Brightness%20for%20Everyone%a1%aa', category: 'event_story', subCategory: '07_true_colors', order: 7 },
  // ほほえみDiary
  { name: 'ほほえみDiary_OP', url: '/d/OP%20Often%20Day%2cSpecial%20Day', category: 'event_story', subCategory: '08_hohoemi_diary', order: 1 },
  { name: 'ほほえみDiary_第1話', url: '/d/%c2%e81%cf%c3%20Know%20Enough%2cKnow%20Euphoria', category: 'event_story', subCategory: '08_hohoemi_diary', order: 2 },
  { name: 'ほほえみDiary_第2話', url: '/d/%c2%e82%cf%c3%20Begin%20Blank%20Book', category: 'event_story', subCategory: '08_hohoemi_diary', order: 3 },
  { name: 'ほほえみDiary_第3話', url: '/d/%c2%e83%cf%c3%20Under%20the%20Indigo%20Sky', category: 'event_story', subCategory: '08_hohoemi_diary', order: 4 },
  { name: 'ほほえみDiary_第4話', url: '/d/%c2%e84%cf%c3%20For%20Us%20the%20Bell%20Tolls', category: 'event_story', subCategory: '08_hohoemi_diary', order: 5 },
  { name: 'ほほえみDiary_第5話', url: '/d/%c2%e85%cf%c3%20On%20Our%20Page%2cOn%20Passage', category: 'event_story', subCategory: '08_hohoemi_diary', order: 6 },
  { name: 'ほほえみDiary_ED', url: '/d/ED%20Smiling%20Daily%2cSmile%20Diary', category: 'event_story', subCategory: '08_hohoemi_diary', order: 7 },
  // Snow♡Love
  { name: 'SnowLove_OP', url: '/d/OP%20Love%20for%20your%20X%27mas', category: 'event_story', subCategory: '09_snow_love', order: 1 },
  { name: 'SnowLove_第1話', url: '/d/%c2%e81%cf%c3%20Each%20of%20the%20winter', category: 'event_story', subCategory: '09_snow_love', order: 2 },
  { name: 'SnowLove_第2話', url: '/d/%c2%e82%cf%c3%20Please%2csay%20indulgence', category: 'event_story', subCategory: '09_snow_love', order: 3 },
  { name: 'SnowLove_第3話', url: '/d/%c2%e83%cf%c3%20Growing%20pains', category: 'event_story', subCategory: '09_snow_love', order: 4 },
  { name: 'SnowLove_第4話', url: '/d/%c2%e84%cf%c3%20Lovely%20love%20carrier', category: 'event_story', subCategory: '09_snow_love', order: 5 },
  { name: 'SnowLove_第5話', url: '/d/%c2%e85%cf%c3%20Warming%20snow', category: 'event_story', subCategory: '09_snow_love', order: 6 },
  { name: 'SnowLove_ED', url: '/d/ED%20New%20year%2cLove%20year', category: 'event_story', subCategory: '09_snow_love', order: 7 },
  // キセキの扉
  { name: 'キセキの扉_OP', url: '/d/OP%20%a5%da%a1%bc%a5%b8%a4%ce%b3%ab%a4%af%b2%bb', category: 'event_story', subCategory: '10_kiseki', order: 1 },
  { name: 'キセキの扉_第1話', url: '/d/%c2%e81%cf%c3%20%a5%d5%a5%a1%a1%bc%a5%b9%a5%c8%a5%b7%a1%bc%a5%f3', category: 'event_story', subCategory: '10_kiseki', order: 2 },
  { name: 'キセキの扉_第2話', url: '/d/%c2%e82%cf%c3%20%a5%d7%a5%ed%a5%c3%a5%c8%a4%cf%cc%b5%bb%eb%a4%b9%a4%eb%a4%e2%a4%ce', category: 'event_story', subCategory: '10_kiseki', order: 3 },
  { name: 'キセキの扉_第3話', url: '/d/%c2%e83%cf%c3%20%cb%eb%b4%d6%c3%e6%a4%e2%ca%aa%b8%ec%a4%cf%c2%b3%a4%af', category: 'event_story', subCategory: '10_kiseki', order: 4 },
  { name: 'キセキの扉_第4話', url: '/d/%c2%e84%cf%c3%20%a5%bf%a1%bc%a5%cb%a5%f3%a5%b0%a5%dd%a5%a4%a5%f3%a5%c8', category: 'event_story', subCategory: '10_kiseki', order: 5 },
  { name: 'キセキの扉_第5話', url: '/d/%c2%e85%cf%c3%20%b7%eb%cb%f6%a4%cf%b8%f7%a4%ce%c3%e6%a4%cb', category: 'event_story', subCategory: '10_kiseki', order: 6 },
  { name: 'キセキの扉_ED', url: '/d/ED%20%a4%bd%a4%b7%a4%c6%bf%b7%a4%bf%a4%ca%a5%d7%a5%ed%a5%ed%a1%bc%a5%b0', category: 'event_story', subCategory: '10_kiseki', order: 7 },
  // メモリーブロッサム
  { name: 'メモリーブロッサム_OP', url: '/d/OP%20Festa%20for%20flowers', category: 'event_story', subCategory: '11_memory_blossom', order: 1 },
  { name: 'メモリーブロッサム_第1話', url: '/d/%c2%e81%cf%c3%20Flower%20dreams%20future', category: 'event_story', subCategory: '11_memory_blossom', order: 2 },
  { name: 'メモリーブロッサム_第2話', url: '/d/%c2%e82%cf%c3%20Cloudy%20mood', category: 'event_story', subCategory: '11_memory_blossom', order: 3 },
  { name: 'メモリーブロッサム_第3話', url: '/d/%c2%e83%cf%c3%20Water%2c%20dirt%2c%20and%20time', category: 'event_story', subCategory: '11_memory_blossom', order: 4 },
  { name: 'メモリーブロッサム_第4話', url: '/d/%c2%e84%cf%c3%20Flower%20just%20show', category: 'event_story', subCategory: '11_memory_blossom', order: 5 },
  { name: 'メモリーブロッサム_第5話', url: '/d/%c2%e85%cf%c3%20In%20the%20seeds%20of%20today', category: 'event_story', subCategory: '11_memory_blossom', order: 6 },
  { name: 'メモリーブロッサム_ED', url: '/d/ED%20Felice%20like%20a%20flower', category: 'event_story', subCategory: '11_memory_blossom', order: 7 },
];

// ─── アニメ出演話数 ─────────────────────────────────────────────────────────
const ANIME_EPISODES: WikiPage[] = [
  { name: '第5話_LuckyStar', url: '/d/%c2%e85%cf%c3%20Lucky%20Star%a1%f9', category: 'anime', order: 1 },
  { name: '第13話_SweetsParty', url: '/d/%c2%e813%cf%c3%20Sweets%20Party%21%21', category: 'anime', order: 2 },
  { name: '第20話_HappinessHappening', url: '/d/%c2%e820%cf%c3%20Happiness%20Happening%21', category: 'anime', order: 3 },
  { name: '第26話_PPPeace', url: '/d/%c2%e826%cf%c3%20P%2eP%2ePeace%21%21', category: 'anime', order: 4 },
  { name: '第48話_HeartOfGrowingFlowers', url: '/d/%c2%e848%cf%c3%20The%20heart%20of%20growing%20flowers', category: 'anime', order: 5 },
  { name: '第52話_ThanksFromNowOn', url: '/d/%c2%e852%cf%c3%20Thanks%20from%20now%20on', category: 'anime', order: 6 },
];

// ─── メモリアルコミック ─────────────────────────────────────────────────────
const MEMORIALS: WikiPage[] = [
  { name: 'メモリアル1', url: '/d/%a5%e1%a5%e2%a5%ea%a5%a2%a5%eb1', category: 'memorial', order: 1 },
  { name: 'メモリアル2', url: '/d/%a5%e1%a5%e2%a5%ea%a5%a2%a5%eb2', category: 'memorial', order: 2 },
  { name: 'メモリアル3', url: '/d/%a5%e1%a5%e2%a5%ea%a5%a2%a5%eb3', category: 'memorial', order: 3 },
  { name: 'メモリアル4', url: '/d/%a5%e1%a5%e2%a5%ea%a5%a2%a5%eb4', category: 'memorial', order: 4 },
  { name: 'メモリアル5', url: '/d/%a5%e1%a5%e2%a5%ea%a5%a2%a5%eb5', category: 'memorial', order: 5 },
];

// ─── その他 ────────────────────────────────────────────────────────────────
const OTHER: WikiPage[] = [
  { name: 'プチコメント', url: '/d/%a4%d7%a4%c1%a5%b3%a5%e1%a5%f3%a5%c8', category: 'other', order: 1 },
  { name: 'プチエピソード', url: '/d/%a4%d7%a4%c1%a5%a8%a5%d4%a5%bd%a1%bc%a5%c9', category: 'other', order: 2 },
  { name: 'リフレッシュルーム', url: '/d/%a5%ea%a5%d5%a5%ec%a5%c3%a5%b7%a5%e5%a5%eb%a1%bc%a5%e0', category: 'other', order: 3 },
  { name: 'アイドル紹介', url: '/d/%a5%a2%a5%a4%a5%c9%a5%eb%be%d2%b2%f0', category: 'other', order: 4 },
  { name: 'デレコネ', url: '/d/%a5%c7%a5%ec%a5%b3%a5%cd', category: 'other', order: 5 },
  { name: 'のんびりタイム', url: '/d/%a4%ce%a4%f3%a4%d3%a4%ea%a5%bf%a5%a4%a5%e0', category: 'other', order: 6 },
  { name: 'その他（モバマス）', url: '/d/%a4%bd%a4%ce%c2%be', category: 'other', order: 7 },
  { name: 'その他（デレステ）', url: '/d/%a4%bd%a4%ce%c2%be%28%a5%c7%a5%ec%a5%b9%a5%c6%29', category: 'other', order: 8 },
];

export const PAGES: WikiPage[] = [
  ...MOBAMAS_CARDS,
  ...DERESUTE_CARDS,
  ...ANIME_EPISODES,
  ...EVENT_STORIES,
  ...MEMORIALS,
  ...OTHER,
];
