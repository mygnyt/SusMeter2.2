import fs from 'fs';
import { STEAM_API_KEY } from './steam';

export interface CSStatsData {
  available: boolean;
  source: 'csstats' | 'steam_cs2' | 'manual' | 'none';
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

// Быстрый кэш в оперативной памяти (TTL: 1 час)
const runtimeCache = new Map<string, { data: CSStatsData; expiry: number }>();

/**
 * Получает официальную статистику матчей CS2 напрямую из Valve Steam Web API
 * Работает автономно 24/7 на Vercel без риска блокировок Cloudflare
 */
async function fetchSteamCS2Stats(steamId: string): Promise<CSStatsData | null> {
  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const statsList = data?.playerstats?.stats;
    if (!Array.isArray(statsList) || statsList.length === 0) {
      return null;
    }

    const map: Record<string, number> = {};
    for (const item of statsList) {
      if (item && item.name) {
        map[item.name] = Number(item.value) || 0;
      }
    }

    const kills = map.total_kills || 0;
    const deaths = map.total_deaths || 1;
    const hsKills = map.total_kills_headshot || 0;
    const rounds =
      map.total_rounds_played ||
      (map.total_matches_played ? map.total_matches_played * 20 : 1);
    const matches =
      map.total_matches_played || Math.max(1, Math.round(rounds / 20));
    const won = map.total_matches_won || map.total_wins || 0;
    const damage = map.total_damage_done || 0;

    const kd = Number((kills / Math.max(1, deaths)).toFixed(2));
    const hs = kills > 0 ? Math.round((hsKills / kills) * 100) : 0;
    const winrate =
      matches > 0 ? Math.min(100, Math.round((won / matches) * 100)) : 0;

    // HLTV 2.0 приближённая формула на основе KPR, DPR и ADR
    const kpr = rounds > 0 ? kills / rounds : 0.7;
    const dpr = rounds > 0 ? deaths / rounds : 0.7;
    const adr = damage > 0 && rounds > 0 ? damage / rounds : 75;
    const approxRating = Number(
      (0.007387 * adr - 0.007328 * (dpr * 100) + 0.3591 * kpr + 0.35).toFixed(2)
    );
    const rating = Math.max(0.4, Math.min(2.5, approxRating));

    return {
      available: true,
      source: 'steam_cs2',
      kd,
      hs,
      winrate,
      matches,
      rating,
      banned: false,
      url: `https://csstats.gg/player/${steamId}`,
      message: 'Данные соревновательной статистики получены из официальной базы CS2',
    };
  } catch (err: any) {
    console.warn('Steam CS2 stats fetch warning:', err?.message || err);
    return null;
  }
}

/**
 * Локальный скрапер CSStats через Puppeteer (только при локальном запуске на Windows с Chrome)
 */
async function scrapeCSStatsLocal(steamId: string): Promise<CSStatsData | null> {
  const url = `https://csstats.gg/player/${steamId}`;
  let browser: any = null;

  try {
    const puppeteer = (await import('puppeteer-extra')).default;
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    puppeteer.use(StealthPlugin());

    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];

    let executablePath: string | null = null;
    for (const p of chromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    if (!executablePath) return null;

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });

    for (let i = 0; i < 8; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const hasContent = await page.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        return text.includes('K/D') && text.includes('PLAYED');
      });
      if (hasContent) break;
    }

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

        if (l === 'K/D' && kd === undefined && lines[i + 1]) {
          const val = parseFloat(lines[i + 1]);
          if (!isNaN(val) && val > 0 && val < 20) kd = val;
        }

        if (l === 'HLTV RATING' && rating === undefined && lines[i + 1]) {
          const r1 = parseFloat(lines[i + 1]);
          if (!isNaN(r1)) rating = r1;
        }

        if (l === 'WIN RATE' && winrate === undefined && lines[i + 1]) {
          const val = parseInt(lines[i + 1].replace('%', ''), 10);
          if (!isNaN(val) && val >= 0 && val <= 100) winrate = val;
        }

        if (l === 'PLAYED' && matches === undefined && lines[i + 1]) {
          const val = parseInt(lines[i + 1].replace(/,/g, ''), 10);
          if (!isNaN(val) && val > 0) matches = val;
        }

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

    return null;
  } catch (err: any) {
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}

/**
 * Основная функция получения соревновательной статистики игрока
 * 1. Проверяет оперативный кэш
 * 2. Получает актуальные данные из официального Steam CS2 API
 * 3. При локальном запуске дополняет данными из CSStats.gg
 * 4. Предоставляет надежный fallback и не крашится на Vercel
 */
export async function fetchCSStatsPlayer(steamId: string): Promise<CSStatsData> {
  const url = `https://csstats.gg/player/${steamId}`;

  // 1. Проверяем кэш в памяти
  const cached = runtimeCache.get(steamId);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  // 2. Запрашиваем официальную соревновательную статистику Valve CS2
  const steamStats = await fetchSteamCS2Stats(steamId);

  // 3. Если на локальном ПК доступен Chrome, проверяем CSStats.gg
  let csstatsData: CSStatsData | null = null;
  if (process.platform === 'win32') {
    try {
      csstatsData = await scrapeCSStatsLocal(steamId);
    } catch {}
  }

  // 4. Формируем итоговый результат без жестко захардкоженных аккаунтов
  let result: CSStatsData;

  if (csstatsData && csstatsData.available) {
    result = csstatsData;
  } else if (steamStats && steamStats.available) {
    result = steamStats;
  } else {
    result = {
      available: false,
      source: 'none',
      url,
      message:
        'Соревновательная статистика скрыта настройками приватности Steam (Game details: Private) либо матчи ещё не сыграны. Откройте профиль на csstats.gg или введите K/D и HS% вручную через спойлер выше.',
    };
  }

  // Кэшируем на 30 минут
  runtimeCache.set(steamId, { data: result, expiry: Date.now() + 1800000 });
  return result;
}
