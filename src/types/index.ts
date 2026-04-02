export type UserRole = 'ADMIN' | 'MANAGER' | 'PLAYER' | 'VIEWER';
export type LeagueStatus = 'REGISTRATION' | 'ONGOING' | 'COMPLETED';
export type TeamStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface League {
  id: string;
  name: string;
  season: string;
  description?: string;
  status: LeagueStatus | string;
  maxTeams: number;
  currentTeams: number; 
  totalApplicants?: number;
  approvedTeamsCount?: number;
  totalMatches?: number;
  completedMatches?: number;
  startDate: string;
  endDate: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  matchDuration?: number;
  matchFormat?: string;
  fixturesGenerated?: boolean;
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  leagueId: string;
  logoUrl?: string;
  status: TeamStatus;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  homeScore: number;
  awayScore: number;
  leagueId: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Player {
  id: string;
  name: string;
  number?: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  teamId: string;
}

export interface LeagueStanding {
  id: string;
  leagueId: string;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  team?: { name: string; logoUrl?: string };
}