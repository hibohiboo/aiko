import iconv from 'iconv-lite';
import { load, type CheerioAPI, type Cheerio, type Element } from 'cheerio';
import { writeFileSync, mkdirSync, existsSync, writeFileSync as writeFile } from 'fs';
import { join, dirname } from 'path';
import { PAGES, BASE_URL, CATEGORY_DIRS, type WikiPage, type Category } from './pages';

const OUTPUT_DIR = join(import.meta.dir, '..', 'dialogues');
const DELAY_MS = 1500;

// ─── fetch ──────────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; aiko-scraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());

  // seesaa wiki は EUC-JP。Content-Type で UTF-8 と明示されていれば UTF-8 を使う
  const ct = res.headers.get('content-type') ?? '';
  if (/utf-8/i.test(ct)) return buffer.toString('utf-8');

  return iconv.decode(buffer, 'euc-jp');
}

// ─── HTML → Markdown ────────────────────────────────────────────────────────

function tableToMd($: CheerioAPI, $table: Cheerio<Element>): string {
  const rows: string[][] = [];
  $table.find('tr').each((_, tr) => {
    const cells: string[] = [];
    $(tr)
      .find('th, td')
      .each((_, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
    if (cells.length) rows.push(cells);
  });
  if (!rows.length) return '';

  const cols = Math.max(...rows.map(r => r.length));
  const pad = (row: string[]) => {
    while (row.length < cols) row.push('');
    return row;
  };

  const lines: string[] = [];
  lines.push('| ' + pad(rows[0]!).join(' | ') + ' |');
  lines.push('| ' + Array(cols).fill('---').join(' | ') + ' |');
  for (const row of rows.slice(1)) lines.push('| ' + pad(row).join(' | ') + ' |');
  return lines.join('\n') + '\n\n';
}

function extractArticle(html: string): string {
  const $ = load(html);

  // サイドバー・ヘッダー・フッターなどグローバルノイズを除去
  $('script, style, iframe').remove();
  $('#wiki-header, #wiki-menu, #sub').remove();
  $('#page-toplink, #page-footer').remove();
  // コメントフォーム・広告
  $('.comment-form-box, #pageroot-form-box').remove();
  $('.ads-box, [id^="adsense"], [id^="crt-"], #seesaa-bnr').remove();
  // 編集リンク等の操作UI
  $('#information-box').remove();
  // コメント数・カテゴリ表示
  $('#page-posted, #page-category').remove();
  // 画像を含むテーブルと画像は台詞管理には不要
  $('img').closest('table').remove();
  $('img').remove();

  // メインコンテンツは #page-body-inner 内の .user-area に入っている
  // (.user-area は記事コンテンツのラッパーであり削除してはいけない)
  const $root = $('#page-body-inner');
  const raw = $root.length
    ? nodeToMd($, $root as unknown as Cheerio<Element>)
    : nodeToMd($, $('body') as unknown as Cheerio<Element>);

  return cleanupMd(raw);
}

function cleanupMd(md: string): string {
  return md
    // 「次＞＞1話」「<<前 OP」のようなページ間ナビゲーション行を除去
    .replace(/^.*[＞＜《》]{2}.*$/gm, '')
    // ナビゲーションリンクのテキスト残骸（「1話」「OP」「ED」単独行）を除去
    .replace(/^\d+話\s*$/gm, '')
    .replace(/^(OP|ED)\s*$/gm, '')
    // 空行が3行以上続く場合は2行に圧縮
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function nodeToMd($: CheerioAPI, $el: Cheerio<Element>): string {
  let md = '';

  $el.contents().each((_, node) => {
    if (node.type === 'text') {
      const text = (node as any).data?.trim() ?? '';
      if (text) md += text + '\n';
      return;
    }
    if (node.type !== 'tag') return;

    const tag = (node as Element).tagName?.toLowerCase() ?? '';
    const $node = $(node);

    switch (tag) {
      case 'h1': md += `\n# ${$node.text().trim()}\n\n`; break;
      case 'h2': md += `\n## ${$node.text().trim()}\n\n`; break;
      case 'h3': md += `\n### ${$node.text().trim()}\n\n`; break;
      case 'h4':
      case 'h5':
      case 'h6': md += `\n#### ${$node.text().trim()}\n\n`; break;
      case 'p': {
        const text = $node.text().trim();
        if (text) md += text + '\n\n';
        break;
      }
      case 'br': md += '\n'; break;
      case 'hr': md += '\n---\n\n'; break;
      case 'table': md += tableToMd($, $node as unknown as Cheerio<Element>); break;
      case 'ul':
        $node.find('> li').each((_, li) => {
          md += `- ${$(li).text().trim()}\n`;
        });
        md += '\n';
        break;
      case 'ol':
        $node.find('> li').each((i, li) => {
          md += `${i + 1}. ${$(li).text().trim()}\n`;
        });
        md += '\n';
        break;
      case 'div':
      case 'section':
      case 'article':
      case 'main':
        md += nodeToMd($, $node as unknown as Cheerio<Element>);
        break;
      // span / strong / em / a などインライン要素はテキストのみ
      default:
        if ($node.find('table, ul, ol, h1, h2, h3').length === 0) {
          const text = $node.text().trim();
          if (text) md += text;
        } else {
          md += nodeToMd($, $node as unknown as Cheerio<Element>);
        }
    }
  });

  return md;
}

// ─── ファイル出力 ────────────────────────────────────────────────────────────

function outputPath(page: WikiPage): string {
  const dir = page.subCategory
    ? join(OUTPUT_DIR, CATEGORY_DIRS[page.category], page.subCategory)
    : join(OUTPUT_DIR, CATEGORY_DIRS[page.category]);
  const fileName = `${String(page.order).padStart(2, '0')}_${page.name.replace(/[/\\:*?"<>|]/g, '_')}.md`;
  return join(dir, fileName);
}

function savePage(page: WikiPage, content: string, url: string): void {
  const path = outputPath(page);
  mkdirSync(dirname(path), { recursive: true });

  const frontmatter = [
    '---',
    `name: "${page.name}"`,
    `category: "${page.category}"`,
    `url: "${url}"`,
    '---',
    '',
    '',
  ].join('\n');

  writeFileSync(path, frontmatter + content + '\n', 'utf-8');
}

// ─── ログ ────────────────────────────────────────────────────────────────────

const LOG_PATH = join(OUTPUT_DIR, '_log.json');
type LogEntry = { name: string; url: string; status: 'ok' | 'error'; message?: string; savedAt: string };

function loadLog(): LogEntry[] {
  if (!existsSync(LOG_PATH)) return [];
  try { return JSON.parse(require('fs').readFileSync(LOG_PATH, 'utf-8')); } catch { return []; }
}

function saveLog(log: LogEntry[]): void {
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  writeFile(LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
}

// ─── メイン ──────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function scrapePage(page: WikiPage, debug: boolean): Promise<'ok' | 'error'> {
  const url = BASE_URL + page.url;
  try {
    const html = await fetchPage(url);

    if (debug) {
      const debugPath = join(OUTPUT_DIR, '_debug', `${page.name}.html`);
      mkdirSync(dirname(debugPath), { recursive: true });
      writeFileSync(debugPath, html, 'utf-8');
      console.log(`  [debug] HTML saved → ${debugPath}`);
    }

    const content = extractArticle(html);
    savePage(page, content, url);
    console.log(`  ✓  ${outputPath(page).replace(OUTPUT_DIR, 'dialogues')}`);
    return 'ok';
  } catch (err) {
    console.error(`  ✗  ${page.name}: ${err}`);
    return 'error';
  }
}

async function main() {
  const args = process.argv.slice(2);
  const debug   = args.includes('--debug');
  const dryRun  = args.includes('--dry-run');
  const noSkip  = args.includes('--no-skip');

  // --category <name> でフィルタ
  const catIdx = args.indexOf('--category');
  const catFilter = catIdx !== -1 ? args[catIdx + 1] : null;

  // --page <name> で単ページ指定
  const pageIdx = args.indexOf('--page');
  const pageFilter = pageIdx !== -1 ? args[pageIdx + 1] : null;

  let targets = PAGES;
  if (catFilter)  targets = targets.filter(p => p.category === catFilter);
  if (pageFilter) targets = targets.filter(p => p.name.includes(pageFilter));

  const log = loadLog();
  const doneSet = new Set(log.filter(l => l.status === 'ok').map(l => l.name));

  // 既取得済みをスキップ（--no-skip で強制再取得）
  const toFetch = noSkip ? targets : targets.filter(p => !doneSet.has(p.name));

  console.log(`\n対象: ${toFetch.length} ページ（スキップ: ${targets.length - toFetch.length}）`);
  if (dryRun) { console.log('[dry-run] 実際の取得はしません'); return; }

  let ok = 0, err = 0;
  for (let i = 0; i < toFetch.length; i++) {
    const page = toFetch[i]!;
    console.log(`[${i + 1}/${toFetch.length}] ${page.name}`);

    const status = await scrapePage(page, debug);
    status === 'ok' ? ok++ : err++;

    log.push({ name: page.name, url: BASE_URL + page.url, status, savedAt: new Date().toISOString() });
    saveLog(log);

    if (i < toFetch.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n完了: ${ok} 成功 / ${err} 失敗`);
}

main().catch(console.error);
