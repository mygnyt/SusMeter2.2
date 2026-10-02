import { CSStatsData } from './csstats';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskFactor {
  points: number;
  text: string;
  category?: 'age' | 'stats' | 'bans' | 'privacy' | 'friends';
}

export interface SteamProfileData {
  steamId: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  communityvisibilitystate: number; // 1 = private, 3 = public
  timecreated?: number;
  accountAgeDays?: number;
  accountAgeYears?: number;
  loccountrycode?: string;
  vacBanned: boolean;
  numberOfVACBans: number;
  daysSinceLastBan: number;
  numberOfGameBans: number;
  economyBan: string;
  cs2PlaytimeHours: number;
  cs2Playtime2WeeksHours: number;
  friendsCount?: number;
  friendsWithBansCount?: number;
  friendsChecked?: number;
}

export interface ManualStats {
  kd?: number;
  hs?: number;
  matches?: number;
  winrate?: number;
}

export interface AnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  riskTitle: string;
  statusHeading: string;
  summary: string;
  factors: RiskFactor[];
  profile: SteamProfileData;
  manualStats?: ManualStats;
  csstats?: CSStatsData;
  timestamp: number;
}
