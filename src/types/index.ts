// src/types/index.ts

export type UserRole = 'ADMIN' | 'MANAGER' | 'PLAYER';
export type LeagueStatus = 'DRAFT' | 'WAITING' | 'ACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface League {
  id: string;
  name: string;
  season: string;
  status: 'REGISTRATION' | 'ONGOING' | 'COMPLETED';
  currentTeams: number;
  maxTeams: number;
}

export interface Team {
  id: string;
  name: string;
  manager_id: string;
  league_id: string;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  date: string;
  score_home: number | null;
  score_away: number | null;
  league_id: string;
}