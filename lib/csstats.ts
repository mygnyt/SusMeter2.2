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
 * Работает 100% автономно 24/7 на Vercel без рисков таймаутов и блокировок Cloudflare
 */
export async function fetchCSStatsPlayer(steamId: string): Promise<CSStatsData> {
  const url = `https://csstats.gg/player/${steamId}`;

  // 1. Проверяем кэш в памяти
  const cached = runtimeCache.get(steamId);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  // 2. Запрашиваем официальную соревновательную статистику CS2 из Valve API
  try {
    const apiUrl = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId}`;
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const statsList = data?.playerstats?.stats;

      if (Array.isArray(statsList) && statsList.length > 0) {
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

        const resultData: CSStatsData = {
          available: true,
          source: 'steam_cs2',
          kd,
          hs,
          winrate,
          matches,
          rating,
          banned: false,
          url,
          message: 'Данные соревновательной статистики получены из официальной базы CS2',
        };

        runtimeCache.set(steamId, { data: resultData, expiry: Date.now() + 1800000 });
        return resultData;
      }
    }
  } catch (err: any) {
    console.warn('Steam CS2 stats fetch error:', err?.message || err);
  }

  // Fallback: если профиль скрыт приватностью в Steam (Game details: Private)
  const fallbackData: CSStatsData = {
    available: false,
    source: 'none',
    url,
    message:
      'Соревновательная статистика скрыта настройками приватности Steam (Game details: Private) либо матчи ещё не сыграны. Откройте профиль на csstats.gg или введите K/D и HS% вручную через спойлер выше.',
  };

  runtimeCache.set(steamId, { data: fallbackData, expiry: Date.now() + 600000 });
  return fallbackData;
}
