import { CSStatsData } from './csstats';
import { AnalysisResult, ManualStats, RiskFactor, RiskLevel, SteamProfileData } from './types';

export function calculateSusScore(
  profile: SteamProfileData,
  manualStats?: ManualStats,
  customHeading?: string,
  csstats?: CSStatsData
): AnalysisResult {
  const factors: RiskFactor[] = [];
  let rawScore = 0;

  // 1. Проверка банов владельца в Steam и CSStats
  const isSteamBanned = profile.vacBanned || profile.numberOfGameBans > 0;
  const isCsStatsBanned = !!csstats?.banned;

  if (isSteamBanned) {
    const totalBans = profile.numberOfVACBans + profile.numberOfGameBans;
    const banText = profile.vacBanned
      ? `На аккаунте зафиксирован VAC-бан (${profile.daysSinceLastBan} дн. назад)`
      : `На аккаунте есть блокировка игры/патруля (${totalBans})`;
    factors.push({ points: 50, text: banText, category: 'bans' });
    rawScore += 50;
  } else if (isCsStatsBanned) {
    factors.push({ points: 50, text: 'Зафиксирована блокировка на CSStats.gg', category: 'bans' });
    rawScore += 50;
  }

  // 2. Возраст аккаунта
  const ageDays = profile.accountAgeDays;
  if (ageDays !== undefined && ageDays !== null) {
    if (ageDays <= 30) {
      factors.push({ points: 15, text: `Аккаунту меньше месяца (${ageDays} дн.)`, category: 'age' });
      rawScore += 15;
    } else if (ageDays <= 90) {
      factors.push({ points: 10, text: `Свежий аккаунт (меньше 3 месяцев: ${ageDays} дн.)`, category: 'age' });
      rawScore += 10;
    } else if (ageDays <= 180) {
      factors.push({ points: 5, text: `Аккаунту меньше полугода (${ageDays} дн.)`, category: 'age' });
      rawScore += 5;
    } else if (ageDays > 1825 && (profile.cs2PlaytimeHours || 0) > 1000) {
      const years = (ageDays / 365).toFixed(1);
      factors.push({ points: -10, text: `Старый аккаунт с большим стажем (${years} лет)`, category: 'age' });
      rawScore -= 10;
    }
  }

  // Определение актуальных соревновательных показателей:
  // Приоритет: данные CSStats (если доступны), иначе ручной ввод
  const kd = csstats?.kd ?? manualStats?.kd;
  const hs = csstats?.hs ?? manualStats?.hs;
  const winrate = csstats?.winrate ?? manualStats?.winrate;
  const matches = csstats?.matches ?? manualStats?.matches;
  const hours = Math.round(profile.cs2PlaytimeHours || 0);

  // 3. Часы и K/D соотношение
  if (kd !== undefined && kd > 0) {
    const isLowExperience = hours < 120 || (matches !== undefined && matches < 50);

    if (kd >= 2.0 && isLowExperience) {
      factors.push({
        points: 20,
        text: `Слишком высокий K/D (${kd}) для текущего опыта`,
        category: 'stats',
      });
      rawScore += 20;
    } else if (hours < 100 && kd >= 1.8) {
      factors.push({ points: 20, text: `Мало часов (${hours}), но K/D ${kd}`, category: 'stats' });
      rawScore += 20;
    } else if (hours < 250 && kd >= 1.7) {
      factors.push({ points: 15, text: `Небольшой наигрыш (${hours} ч) при высоком K/D ${kd}`, category: 'stats' });
      rawScore += 15;
    } else if (kd >= 2.5) {
      factors.push({ points: 20, text: `Аномальный K/D (${kd}) на соревновательной дистанции`, category: 'stats' });
      rawScore += 20;
    } else if (kd <= 1.05 && hours > 400) {
      factors.push({ points: -5, text: `Стандартный средний K/D: ${kd}`, category: 'stats' });
      rawScore -= 5;
    }
  } else {
    // Статистика не указана и не спарсилась
    if (hours < 60) {
      factors.push({ points: 10, text: `Очень мало часов в CS2 (${hours} ч)`, category: 'stats' });
      rawScore += 10;
    }
  }

  // 4. HS% (Процент хедшотов)
  if (hs !== undefined && hs > 0) {
    if (hs > 65) {
      factors.push({
        points: 15,
        text: `Аномально высокий HS% (${hs}%)`,
        category: 'stats',
      });
      rawScore += 15;
    } else if (hs >= 60) {
      factors.push({ points: 8, text: `Повышенный процент хедшотов: ${hs}%`, category: 'stats' });
      rawScore += 8;
    }
  }

  // 5. Win Rate % (Винрейт на дистанции)
  if (winrate !== undefined && winrate > 70) {
    const hasSufficientMatches = matches === undefined || matches >= 20;
    if (hasSufficientMatches) {
      factors.push({
        points: 10,
        text: `Подозрительно высокий винрейт (${winrate}%)`,
        category: 'stats',
      });
      rawScore += 10;
    }
  }

  // 6. Баны у друзей в Steam
  if (
    profile.friendsWithBansCount !== undefined &&
    profile.friendsWithBansCount > 0 &&
    profile.friendsCount !== undefined
  ) {
    const banned = profile.friendsWithBansCount;
    const total = profile.friendsCount;
    factors.push({ points: 10, text: `У ${banned} из ${total} друзей есть баны`, category: 'friends' });
    rawScore += 10;
  }

  // 7. Приватность профиля
  if (profile.communityvisibilitystate === 1) {
    factors.push({ points: 5, text: 'Профиль закрыт, данных для оценки меньше', category: 'privacy' });
    rawScore += 5;
  }

  // Если вообще нет негативных факторов, добавим нейтральные/позитивные
  if (factors.length === 0) {
    factors.push({ points: 0, text: 'Явных подозрительных факторов не обнаружено', category: 'stats' });
  }

  // Итоговый балл (0 - 100)
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Уровень риска
  let riskLevel: RiskLevel = 'low';
  let riskTitle = 'Низкий риск';
  if (finalScore >= 55) {
    riskLevel = 'high';
    riskTitle = 'Высокий риск';
  } else if (finalScore >= 25) {
    riskLevel = 'medium';
    riskTitle = 'Средний риск';
  }

  // Формирование подробного объяснения вердикта
  let summary = '';
  if (isSteamBanned || isCsStatsBanned) {
    summary = `На аккаунте обнаружены официальные блокировки Valve или отметки банов в трекерах. Это прямое подтверждение нарушений правил соревновательного режима. Сопутствующие факторы лишь дополняют общую картину.`;
  } else if (finalScore >= 55) {
    summary = `Оценка высокая в основном из-за сочетания признаков: ${
      (ageDays ?? 999) < 60 ? 'аккаунт совсем свежий, ' : ''
    }${
      kd && kd >= 1.8 ? 'при этом статистика необычно сильная для такого количества часов, ' : ''
    }${
      (profile.friendsWithBansCount || 0) > 0 ? 'и у части друзей есть баны. ' : ''
    }Ни один признак сам по себе ничего не доказывает. Хорошо то, что на аккаунте самом нет VAC-банов. Это оценка по косвенным данным, а не доказательство читерства.`;
  } else if (finalScore >= 25) {
    summary = `Умеренный уровень подозрительности: зафиксированы некоторые косвенные сигналы (например, приватность или повышенный K/D), но они вполне могут принадлежать опытному игроку или смурфу. Рекомендуется оценивать действия непосредственно по демо-записи матча.`;
  } else {
    summary = `Аккаунт производит впечатление надёжного: профиль не имеет признаков одноразового твинка, часы наигрыша и статистика выглядят реалистично, а в истории отсутствуют блокировки.`;
  }

  const statusHeading = customHeading || `Результат анализа: ${profile.personaname || profile.steamId}`;

  return {
    score: finalScore,
    riskLevel,
    riskTitle,
    statusHeading,
    summary,
    factors,
    profile,
    manualStats,
    csstats,
    timestamp: Date.now(),
  };
}
