import { NextRequest, NextResponse } from 'next/server';
import { extractSteamIdentifier, fetchFullSteamProfile, resolveVanityUrl } from '@/lib/steam';
import { calculateSusScore } from '@/lib/scoring';
import { fetchCSStatsPlayer } from '@/lib/csstats';
import { ManualStats } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawInput = body?.input;
    const manualStats: ManualStats | undefined = body?.manualStats;

    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      return NextResponse.json(
        { success: false, error: 'Пожалуйста, введите ссылку на профиль или SteamID.' },
        { status: 400 }
      );
    }

    const { type, value } = extractSteamIdentifier(rawInput);
    let targetSteamId: string | null = null;

    if (type === 'steamid') {
      targetSteamId = value;
    } else {
      // Vanity URL / никнейм
      targetSteamId = await resolveVanityUrl(value);
      if (!targetSteamId) {
        // Проверим, вдруг это всё же числовой ID или опечатка
        if (/^\d{17}$/.test(value)) {
          targetSteamId = value;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Steam-профиль с адресом «${value}» не найден. Проверьте правильность ссылки или введите числовой SteamID64.`,
            },
            { status: 404 }
          );
        }
      }
    }

    // Запрашиваем параллельно данные из Steam и CSStats.gg
    const [profile, csstats] = await Promise.all([
      fetchFullSteamProfile(targetSteamId),
      fetchCSStatsPlayer(targetSteamId),
    ]);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Не удалось получить данные профиля. Возможно, Steam API временно недоступен или указанный профиль не существует.',
        },
        { status: 404 }
      );
    }

    // Рассчитываем SusScore с учетом объединенных данных Steam, CSStats и ручного ввода
    const result = calculateSusScore(profile, manualStats, undefined, csstats);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Внутренняя ошибка сервера при анализе профиля.',
      },
      { status: 500 }
    );
  }
}
