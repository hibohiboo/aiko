import iconv from 'iconv-lite';
import { load, type CheerioAPI, type Cheerio, type Element } from 'cheerio';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIALOGUE_DIR = join(import.meta.dir, '..', 'dialogues', '02_deresute_card');
const DELAY_MS = 1500;

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; aiko-scraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') ?? '';
  if (/utf-8/i.test(ct)) return buffer.toString('utf-8');
  return iconv.decode(buffer, 'euc-jp');
}

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

function cleanupMd(md: string): string {
  return md
    .replace(/^.*[＞＜《》]{2}.*$/gm, '')
    .replace(/^\d+話\s*$/gm, '')
    .replace(/^(OP|ED)\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractArticle(html: string): string {
  const $ = load(html);

  $('script, style, iframe').remove();
  $('#wiki-header, #wiki-menu, #sub').remove();
  $('#page-toplink, #page-footer').remove();
  $('.comment-form-box, #pageroot-form-box').remove();
  $('.ads-box, [id^="adsense"], [id^="crt-"], #seesaa-bnr').remove();
  $('#information-box').remove();
  $('#page-posted, #page-category').remove();
  $('img').closest('table').remove();
  $('img').remove();

  const $root = $('#page-body-inner');
  const raw = $root.length
    ? nodeToMd($, $root as unknown as Cheerio<Element>)
    : nodeToMd($, $('body') as unknown as Cheerio<Element>);

  return cleanupMd(raw);
}

function extractSecondUrl(content: string): string | null {
  const lines = content.split('\n');
  const urlStart = lines.findIndex(l => l.trim() === 'url:');
  if (urlStart === -1) return null;

  const urlLines: string[] = [];
  for (let i = urlStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined || !line.match(/^\s+-/)) break;
    const url = line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim();
    urlLines.push(url);
  }

  return urlLines[1] ?? null;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const files = readdirSync(DIALOGUE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  let ok = 0, err = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const filePath = join(DIALOGUE_DIR, file);
    const content = readFileSync(filePath, 'utf-8');

    const secondUrl = extractSecondUrl(content);
    if (!secondUrl) {
      console.log(`  スキップ（2nd URL なし）: ${file}`);
      continue;
    }

    if (content.includes('#### 特訓エピソード')) {
      console.log(`  スキップ（既取得済み）: ${file}`);
      continue;
    }

    console.log(`[${i + 1}/${files.length}] ${file}`);
    console.log(`  URL: ${secondUrl}`);

    try {
      const html = await fetchPage(secondUrl);
      const episodeContent = extractArticle(html);

      const updated = content.trimEnd() + '\n\n#### 特訓エピソード\n\n' + episodeContent + '\n';
      writeFileSync(filePath, updated, 'utf-8');
      console.log(`  ✓ 書き込み完了`);
      ok++;
    } catch (e) {
      console.error(`  ✗ エラー: ${e}`);
      err++;
    }

    if (i < files.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n完了: ${ok} 成功 / ${err} 失敗`);
}

main().catch(console.error);
