<div align="center">

# 🎯 SusMeter CS

### Интеллектуальный сервис оценки подозрительности Steam-профилей Counter-Strike 2 и Telegram Mini App

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sus-meter2-2.vercel.app)

**[🌐 Открыть веб-приложение](https://sus-meter2-2.vercel.app)** • **[📱 Telegram Mini App](https://sus-meter2-2.vercel.app)** • **[📦 GitHub Репозиторий](https://github.com/mygnyt/SusMeter2.2)**

</div>

---

## 📖 О проекте

**SusMeter CS** — это высокотехнологичный аналитический сервис и Telegram Mini App, созданный для моментального выявления читеров, смурфов, твинков и сомнительных аккаунтов в Counter-Strike 2. 

Сервис агрегирует данные напрямую из официального **Valve Steam Web API** и соревновательной базы матчей CS2, рассчитывая комплексный индекс риска **SusScore (0–100)** с подробным обоснованием каждого фактора.

Сервис работает **полностью автономно 24/7 на Vercel Serverless**, не требуя работающего локального компьютера.

---

## ✨ Ключевые возможности

### 1. 🧮 Алгоритм скоринга SusScore (0–100)
* **Анимированная 3-сегментная шкала риска**:
  * 🟢 **Низкий риск (0–25)** — проверенные честные игроки, старые аккаунты с реальным стажем и адекватной статистикой.
  * 🟡 **Средний риск (25–55)** — умеренная подозрительность (приватный профиль, свежий твинк, смурф с высоким винрейтом).
  * 🔴 **Высокий риск (55–100)** — критические маркеры: активные блокировки (VAC / Game Ban), аномальный K/D при малом наигрыше, подозрительное окружение.
* **Детализированный список факторов**: каждый пункт содержит понятную плашку с весом (`+15`, `+20`, `+50`, `[-10]`) и объяснением вклада в итоговый вердикт.

### 2. 🌐 Официальная интеграция с Valve Steam API
* **Универсальный парсер ссылок**: поддерживает ссылки `steamcommunity.com/id/...`, `steamcommunity.com/profiles/...`, числовой `SteamID64`, формат `[U:1:...]` и классический `STEAM_0:...`.
* **Проверка блокировок**: обнаружение VAC-банов, блокировок патруля (Game Bans) и дней с момента последнего бана.
* **Анализ стажа и активности**: точный возраст аккаунта (в днях и годах), наигранные часы в CS2 за всё время и за последние 2 недели.
* **Анализ списка друзей**: проверка выборки друзей игрока на наличие банов для выявления «ферм» и игры в пати с читерами.

### 3. 🔫 Модуль соревновательной статистики CS2 & CSStats
* **Прямое получение соревновательных метрик**:
  * **K/D Ratio** — соотношение убийств и смертей;
  * **Headshot % (HS%)** — процент убийств в голову;
  * **Win Rate %** — соревновательный винрейт;
  * **Сыграно матчей** — дистанция наигрыша;
  * **HLTV 2.0 Rating** — расчётный рейтинг эффективности (KPR, DPR, ADR).
* **Специальные триггеры риска**:
  * `+15` при аномально высоком проценте хедшотов (> 65%);
  * `+20` при K/D > 2.0 для аккаунтов с малым опытом/часами;
  * `+10` при винрейте > 70% на дистанции от 20+ матчей;
  * `[-5]` поощрение за нормальный среднестатистический K/D опытного игрока.
* **Корректный fallback при приватности**: если у профиля в Steam скрыты подробности об играх (*Game details: Private*), сервис выводит прямую кнопку для перехода на [csstats.gg](https://csstats.gg) и позволяет указать статистику вручную через аккуратный спойлер.

### 4. 📱 Готовность к Telegram Mini App (TMA)
* Автоматическая инициализация Telegram WebApp SDK (`Telegram.WebApp`).
* Поддержка **Haptic Feedback** (тактильная отдача при успехе, предупреждении и ошибке).
* Автоматическое раскрытие на всю высоту экрана (`expand()`).
* Синхронизация цветов шапки и фона со стилем Telegram.

### 5. 🎨 Премиальный киберспортивный дизайн
* Тёмная графитовая палитра (`#0e131b`, `#161c28`) в стиле топовых игровых платформ.
* Плавные физические анимации чисел и карточек на **Framer Motion**.
* Полная адаптивность: от экранов iPhone и Android до 4K-мониторов.

---

## 🛠 Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Фреймворк** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Язык** | [TypeScript 5.6](https://www.typescriptlang.org/) со строгой типизацией |
| **Стилизация** | [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS + Autoprefixer |
| **Анимации** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Иконки** | [Lucide React](https://lucide.dev/) |
| **Интеграция с Telegram** | Telegram WebApp Client Provider (`@telegram-apps/sdk` compatible) |
| **Источники данных** | Valve Steam Web API, CS2 UserStats API (`AppID 730`), CSStats.gg |
| **Деплой & Хостинг** | [Vercel](https://vercel.com/) (Edge Network & Serverless Node.js Runtime) |

---

## 🚀 Быстрый старт и локальная разработка

### Требования
* **Node.js** версии 18.17 или новее
* Менеджер пакетов **npm**, **pnpm** или **yarn**
* Ключ **Steam Web API Key** (можно получить бесплатно на [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey))

### 1. Клонирование репозитория
```bash
git clone https://github.com/mygnyt/SusMeter2.2.git
cd SusMeter2.2
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env.local` в корне проекта:
```env
STEAM_API_KEY=ваш_ключ_steam_api
```
*(Если ключ не задан, приложение использует встроенный резервный ключ для разработки)*.

### 4. Запуск локального сервера
```bash
npm run dev
```
Откройте браузер по адресу [http://localhost:3000](http://localhost:3000).

### 5. Сборка для продакшена
```bash
npm run build
npm start
```

---

## 📡 Архитектура API

Серверный роут `/api/analyze` работает как высокопроизводительная бессерверная функция (Serverless Function):

### `POST /api/analyze`
**Тело запроса (JSON):**
```json
{
  "input": "76561199483463596",
  "manualStats": {
    "kd": 1.45,
    "hs": 58,
    "winrate": 62,
    "matches": 150
  }
}
```

**Пример успешного ответа:**
```json
{
  "success": true,
  "data": {
    "score": 15,
    "riskLevel": "low",
    "riskTitle": "Низкий риск",
    "statusHeading": "Результат анализа: смекта",
    "summary": "Аккаунт производит впечатление надёжного...",
    "factors": [
      {
        "points": 10,
        "text": "Свежий аккаунт (меньше 3 месяцев)",
        "category": "age"
      },
      {
        "points": -5,
        "text": "Стандартный средний K/D: 0.93",
        "category": "stats"
      }
    ],
    "profile": {
      "steamId": "76561199483463596",
      "personaname": "смекта",
      "avatarfull": "https://avatars.steamstatic.com/...",
      "vacBanned": false,
      "cs2PlaytimeHours": 142
    },
    "csstats": {
      "available": true,
      "source": "steam_cs2",
      "kd": 0.93,
      "hs": 45,
      "winrate": 32,
      "matches": 59,
      "rating": 1.01,
      "url": "https://csstats.gg/player/76561199483463596"
    }
  }
}
```

---

## 📂 Структура проекта

```text
├── app/
│   ├── api/
│   │   ├── analyze/route.ts       # Главный API эндпоинт анализа профиля
│   │   └── ping/route.ts          # Легковесный health-check эндпоинт
│   ├── favicon.ico                # Иконка приложения
│   ├── globals.css                # Глобальные стили Tailwind CSS
│   ├── layout.tsx                 # Корневой лэйаут с TelegramProvider
│   └── page.tsx                   # Главная страница приложения
├── components/
│   ├── AnalyzeForm.tsx            # Поле ввода SteamID + спойлер ручной статистики
│   ├── CompetitiveStatsCard.tsx   # Карточка соревновательной статистики (K/D, HS%, Win%)
│   ├── ProfileSummary.tsx         # Сводка профиля (аватар, ник, часы, возраст, баны)
│   ├── RiskFactorsList.tsx        # Список обнаруженных факторов с баллами (+XX)
│   ├── ScoreMeter.tsx             # 3-сегментная шкала риска со стрелкой и счётчиком
│   ├── TelegramProvider.tsx       # Провайдер интеграции Telegram WebApp SDK
│   └── VerdictCard.tsx            # Итоговое текстовое заключение с цветовым акцентом
├── lib/
│   ├── csstats.ts                 # Движок соревновательной статистики CS2
│   ├── scoring.ts                 # Математическая модель расчёта SusScore
│   ├── steam.ts                   # Интеграция с официальным Steam Web API
│   ├── types.ts                   # Общие TypeScript интерфейсы
│   └── utils.ts                   # Вспомогательные утилиты объединения классов
├── public/                        # Статические ассеты
└── package.json                   # Зависимости и скрипты
```

---

## 🌐 Ссылки и статус проекта

* **Рабочий продакшен**: [https://sus-meter2-2.vercel.app](https://sus-meter2-2.vercel.app)
* **Репозиторий на GitHub**: [https://github.com/mygnyt/SusMeter2.2](https://github.com/mygnyt/SusMeter2.2)
* **Статус развёртывания**: 🟢 Активен, работает автономно 24/7

---

<div align="center">
Made with ❤️ for Counter-Strike 2 Community
</div>
