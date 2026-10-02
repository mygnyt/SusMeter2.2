import { SteamProfileData } from './types';

export const STEAM_API_KEY = process.env.STEAM_API_KEY || '3D00FB07E96C5E7654615D7E30506E86';

const BASE_STEAM_ID = BigInt('76561197960265728');

/**
 * Очищает и извлекает потенциальный SteamID или vanity URL из пользовательского ввода
 */
export function extractSteamIdentifier(input: string): { type: 'steamid' | 'vanity'; value: string } {
  let trimmed = input.trim();

  // Удаляем завершающие слэши
  trimmed = trimmed.replace(/\/+$/, '');

  // 1. Проверяем URL вида: steamcommunity.com/profiles/7656119...
  const profilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch) {
    return { type: 'steamid', value: profilesMatch[1] };
  }

  // 2. Проверяем URL вида: steamcommunity.com/id/username
  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([a-zA-Z0-9_\-]+)/i);
  if (idMatch) {
    return { type: 'vanity', value: idMatch[1] };
  }

  // 3. Проверяем чистый SteamID64 (17 цифр, начинающихся на 7656119)
  if (/^7656119\d{10}$/.test(trimmed)) {
    return { type: 'steamid', value: trimmed };
  }

  // 4. Проверяем Steam3 формат: [U:1:12345678]
  const steam3Match = trimmed.match(/\[?U:1:(\d+)\]?/i);
  if (steam3Match) {
    const accountId = BigInt(steam3Match[1]);
    const steam64 = (BASE_STEAM_ID + accountId).toString();
    return { type: 'steamid', value: steam64 };
  }

  // 5. Проверяем классический Steam format: STEAM_0:0:123456 / STEAM_0:1:123456
  const steam2Match = trimmed.match(/STEAM_[0-5]:([01]):(\d+)/i);
  if (steam2Match) {
    const y = BigInt(steam2Match[1]);
    const z = BigInt(steam2Match[2]);
    const steam64 = (BASE_STEAM_ID + z * BigInt(2) + y).toString();
    return { type: 'steamid', value: steam64 };
  }

  // По умолчанию считаем vanity url/ником (например, gabelogannewell)
  const cleaned = trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  return { type: 'vanity', value: cleaned };
}

/**
 * Резолвит кастомный ник в SteamID64
 */
export async function resolveVanityUrl(vanityUrl: string, apiKey: string = STEAM_API_KEY): Promise<string | null> {
  try {
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(
      vanityUrl
    )}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.response?.success === 1 && data?.response?.steamid) {
      return data.response.steamid;
    }
    return null;
  } catch (err) {
    console.error('ResolveVanityURL error:', err);
    return null;
  }
}

/**
 * Получает сводку профиля, баны, часы CS2 и статус друзей
 */
export async function fetchFullSteamProfile(
  steamId: string,
  apiKey: string = STEAM_API_KEY
): Promise<SteamProfileData | null> {
  try {
    // Параллельные запросы: Summaries, Bans, OwnedGames, Friends
    const [summariesRes, bansRes, gamesRes, friendsRes] = await Promise.allSettled([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`, {
        next: { revalidate: 30 },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamId}`, {
        next: { revalidate: 30 },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`,
        { next: { revalidate: 30 } }
      ).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamId}&relationship=friend`, {
        next: { revalidate: 60 },
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const summariesData = summariesRes.status === 'fulfilled' ? summariesRes.value : null;
    const player = summariesData?.response?.players?.[0];
    if (!player) {
      return null;
    }

    const bansData = bansRes.status === 'fulfilled' ? bansRes.value : null;
    const banInfo = bansData?.players?.[0] || {};

    const gamesData = gamesRes.status === 'fulfilled' ? gamesRes.value : null;
    const games = gamesData?.response?.games || [];
    // AppID 730: Counter-Strike 2 / CS:GO
    const cs2 = games.find((g: any) => g.appid === 730);
    const cs2Hours = cs2 ? Math.round((cs2.playtime_forever || 0) / 60) : 0;
    const cs22WeeksHours = cs2 ? Math.round(((cs2.playtime_2weeks || 0) / 60) * 10) / 10 : 0;

    // Расчёт возраста аккаунта
    let accountAgeDays: number | undefined;
    let accountAgeYears: number | undefined;
    if (player.timecreated) {
      const now = Math.floor(Date.now() / 1000);
      accountAgeDays = Math.floor((now - player.timecreated) / 86400);
      accountAgeYears = Math.round((accountAgeDays / 365) * 10) / 10;
    }

    // Проверка друзей на баны
    let friendsCount = 0;
    let friendsWithBansCount = 0;
    let friendsChecked = 0;

    const friendsData = friendsRes.status === 'fulfilled' ? friendsRes.value : null;
    const friendList = friendsData?.friendslist?.friends || [];
    if (Array.isArray(friendList) && friendList.length > 0) {
      friendsCount = friendList.length;
      // Берём выборку до 50 друзей, чтобы не перегружать API
      const sample = friendList.slice(0, 50).map((f: any) => f.steamid);
      friendsChecked = sample.length;

      try {
        const friendBansUrl = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${sample.join(
          ','
        )}`;
        const friendBansRes = await fetch(friendBansUrl, { next: { revalidate: 120 } });
        if (friendBansRes.ok) {
          const friendBansJson = await friendBansRes.json();
          const playersBans = friendBansJson?.players || [];
          friendsWithBansCount = playersBans.filter(
            (p: any) => p.VACBanned || (p.NumberOfGameBans && p.NumberOfGameBans > 0)
          ).length;
        }
      } catch (err) {
        console.warn('Friends ban check warning:', err);
      }
    }

    const profileData: SteamProfileData = {
      steamId,
      personaname: player.personaname || 'Неизвестный игрок',
      avatarfull:
        player.avatarfull ||
        'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
      profileurl: player.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
      communityvisibilitystate: player.communityvisibilitystate || 1,
      timecreated: player.timecreated,
      accountAgeDays,
      accountAgeYears,
      loccountrycode: player.loccountrycode,
      vacBanned: !!banInfo.VACBanned,
      numberOfVACBans: banInfo.NumberOfVACBans || 0,
      daysSinceLastBan: banInfo.DaysSinceLastBan || 0,
      numberOfGameBans: banInfo.NumberOfGameBans || 0,
      economyBan: banInfo.EconomyBan || 'none',
      cs2PlaytimeHours: cs2Hours,
      cs2Playtime2WeeksHours: cs22WeeksHours,
      friendsCount: friendsCount > 0 ? friendsCount : undefined,
      friendsWithBansCount: friendsChecked > 0 ? friendsWithBansCount : undefined,
      friendsChecked: friendsChecked > 0 ? friendsChecked : undefined,
    };

    return profileData;
  } catch (err) {
    console.error('fetchFullSteamProfile error:', err);
    return null;
  }
}
