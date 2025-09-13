export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  createdAt: Date;
  lastPlayed: Date;
}

export interface GameSession {
  id: string;
  userId: string;
  challengeId: string;
  mode: 'single' | 'multiplayer';
  score: number;
  completedAt: Date;
  design: {
    components: any[];
    connections: any[];
  };
  metrics: {
    latency: number;
    availability: number;
    cost: number;
    throughput: number;
  };
}

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  bestScore: number;
  isOnline: boolean;
  lastPlayed: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  challengeId: string;
  completedAt: Date;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

