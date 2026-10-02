import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Инициализируем плагин скрытия признаков автоматизации
puppeteer.use(StealthPlugin());

export interface CSStatsData {
  available: boolean;
  source: 'csstats' | 'manual' | 'none';
  kd?: number;
  hs?: number;
  winrate?: number;
  matches?: number;
  rating?: number;
  rank?: string;
  banned?: boolean;
  url: string;
  message?: string;
}

const POSSIBLE_CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].filter(Boolean) as string[];

function getBrowserExecutablePath(): string | null {
  for (const p of POSSIBLE_CHROME_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Получает соревновательную статистику игрока с csstats.gg
 * с надежным обходом Cloudflare Turnstile через Stealth Puppeteer
 */
export async function fetchCSStatsPlayer(steamId: string): Promise<CSStatsData> {
  const url = `https://csstats.gg/player/${steamId}`;
  const executablePath = getBrowserExecutablePath();

  if (executablePath) {
    let browser: any = null;
    try {
      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--window-size=1280,800',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Переходим на страницу игрока
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Ожидаем прохождения проверки Cloudflare и появления данных
      let hasFoundContent = false;
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const contentCheck = await page.evaluate(() => {
            const text = document.body ? document.body.innerText : '';
            if (
              text.includes('No matches recorded') ||
              text.includes('No matches found') ||
              text.includes('player not found')
            ) {
              return 'not_found';
            }
            if (text.includes('K/D') && text.includes('PLAYED')) {
              return 'found';
            }
            return 'waiting';
          });

          if (contentCheck === 'not_found') {
            return {
              available: false,
              source: 'none',
              url,
              message: 'Матчи не зафиксированы в базе CSStats.gg',
            };
          }

          if (contentCheck === 'found') {
            hasFoundContent = true;
            break;
          }
        } catch {
          // Игнорируем редиректы страницы в процессе проверки Cloudflare
        }
      }

      if (hasFoundContent) {
        const stats = await page.evaluate(() => {
          const text = document.body ? document.body.innerText : '';
          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

          let kd: number | undefined;
          let hs: number | undefined;
          let winrate: number | undefined;
          let matches: number | undefined;
          let rating: number | undefined;

          for (let i = 0; i < lines.length; i++) {
            const l = lines[i];

            // K/D Ratio
            if (l === 'K/D' && kd === undefined && lines[i + 1]) {
              const val = parseFloat(lines[i + 1]);
              if (!isNaN(val) && val > 0 && val < 20) kd = val;
            }

            // HLTV Rating
            if (l === 'HLTV RATING' && rating === undefined && lines[i + 1]) {
              const r1 = parseFloat(lines[i + 1]);
              if (!isNaN(r1)) {
                if (lines[i + 2] && !isNaN(parseFloat(lines[i + 2])) && parseFloat(lines[i + 2]) < 1) {
                  rating = parseFloat((r1 + parseFloat(lines[i + 2])).toFixed(2));
                } else {
                  rating = r1;
                }
              }
            }

            // Win Rate
            if (l === 'WIN RATE' && winrate === undefined && lines[i + 1]) {
              const val = parseInt(lines[i + 1].replace('%', ''), 10);
              if (!isNaN(val) && val >= 0 && val <= 100) winrate = val;
            }

            // Matches Played
            if (l === 'PLAYED' && matches === undefined && lines[i + 1]) {
              const val = parseInt(lines[i + 1].replace(/,/g, ''), 10);
              if (!isNaN(val) && val > 0) matches = val;
            }

            // Headshots %
            if (l === 'HS%' && hs === undefined && lines[i + 1]) {
              const val = parseInt(lines[i + 1].replace('%', ''), 10);
              if (!isNaN(val) && val >= 0 && val <= 100) hs = val;
            }
          }

          const banned =
            text.includes('VAC Banned') ||
            text.includes('Game Banned') ||
            text.includes('player-banned');

          return { kd, hs, winrate, matches, rating, banned };
        });

        const hasAny =
          stats.kd !== undefined ||
          stats.hs !== undefined ||
          stats.winrate !== undefined ||
          stats.matches !== undefined;

        if (hasAny) {
          return {
            available: true,
            source: 'csstats',
            kd: stats.kd,
            hs: stats.hs,
            winrate: stats.winrate,
            matches: stats.matches,
            rating: stats.rating,
            banned: stats.banned,
            url,
            message: 'Данные успешно получены с CSStats.gg',
          };
        }
      }
    } catch (err: any) {
      console.warn('Stealth puppeteer scraper warning:', err?.message || err);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {}
      }
    }
  }

  // Fallback: если браузер не установлен или не смог получить данные
  return {
    available: false,
    source: 'none',
    url,
    message: 'Матчи не зафиксированы в базе CSStats.gg или профиль скрыт',
  };
}
