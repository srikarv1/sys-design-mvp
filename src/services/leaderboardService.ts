import { LeaderboardEntry } from '../Leaderboard';

// Mock leaderboard service - in a real app, this would connect to a backend
class LeaderboardService {
  private entries: LeaderboardEntry[] = [];
  private currentPlayerName: string | null = null;

  // Initialize with some mock data
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockEntries: LeaderboardEntry[] = [
      {
        id: '1',
        playerName: 'Alex Chen',
        score: 95,
        challengeId: 'c1',
        challengeName: 'Image Sharing',
        completedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        timeSpent: 420, // 7 minutes
        mode: 'multiplayer'
      },
      {
        id: '2',
        playerName: 'Sarah Kim',
        score: 92,
        challengeId: 'c2',
        challengeName: 'Social Feed',
        completedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        timeSpent: 380, // 6 minutes 20 seconds
        mode: 'multiplayer'
      },
      {
        id: '3',
        playerName: 'Mike Johnson',
        score: 88,
        challengeId: 'c1',
        challengeName: 'Image Sharing',
        completedAt: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        timeSpent: 520, // 8 minutes 40 seconds
        mode: 'multiplayer'
      },
      {
        id: '4',
        playerName: 'Emma Wilson',
        score: 85,
        challengeId: 'c3',
        challengeName: 'E-commerce',
        completedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        timeSpent: 600, // 10 minutes
        mode: 'single'
      },
      {
        id: '5',
        playerName: 'David Lee',
        score: 82,
        challengeId: 'c2',
        challengeName: 'Social Feed',
        completedAt: new Date(Date.now() - 1000 * 60 * 150), // 2.5 hours ago
        timeSpent: 450, // 7 minutes 30 seconds
        mode: 'multiplayer'
      }
    ];

    this.entries = mockEntries;
  }

  setCurrentPlayer(name: string) {
    this.currentPlayerName = name;
  }

  getCurrentPlayer(): string | null {
    return this.currentPlayerName;
  }

  getLeaderboard(): LeaderboardEntry[] {
    return [...this.entries].sort((a, b) => b.score - a.score);
  }

  addScore(entry: Omit<LeaderboardEntry, 'id' | 'completedAt'>): LeaderboardEntry {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      completedAt: new Date()
    };

    this.entries.push(newEntry);
    return newEntry;
  }

  getPlayerRank(playerName: string): number {
    const sortedEntries = this.getLeaderboard();
    const playerIndex = sortedEntries.findIndex(entry => entry.playerName === playerName);
    return playerIndex >= 0 ? playerIndex + 1 : -1;
  }

  getTopPlayers(count: number = 10): LeaderboardEntry[] {
    return this.getLeaderboard().slice(0, count);
  }

  getPlayerStats(playerName: string) {
    const playerEntries = this.entries.filter(entry => entry.playerName === playerName);
    const totalScore = playerEntries.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = playerEntries.length > 0 ? totalScore / playerEntries.length : 0;
    const bestScore = Math.max(...playerEntries.map(entry => entry.score), 0);

    return {
      totalChallenges: playerEntries.length,
      averageScore: Math.round(averageScore),
      bestScore,
      totalPlayTime: playerEntries.reduce((sum, entry) => sum + entry.timeSpent, 0)
    };
  }

  // Simulate real-time updates (in a real app, this would be WebSocket updates)
  subscribeToUpdates(callback: (entries: LeaderboardEntry[]) => void) {
    // Mock periodic updates
    const interval = setInterval(() => {
      // Occasionally add a new random entry to simulate other players
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const mockPlayers = ['Jordan Smith', 'Taylor Brown', 'Casey Davis', 'Riley Miller'];
        const mockChallenges = [
          { id: 'c1', name: 'Image Sharing' },
          { id: 'c2', name: 'Social Feed' },
          { id: 'c3', name: 'E-commerce' }
        ];
        
        const randomPlayer = mockPlayers[Math.floor(Math.random() * mockPlayers.length)];
        const randomChallenge = mockChallenges[Math.floor(Math.random() * mockChallenges.length)];
        
        const newEntry = this.addScore({
          playerName: randomPlayer,
          score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
          challengeId: randomChallenge.id,
          challengeName: randomChallenge.name,
          timeSpent: Math.floor(Math.random() * 300) + 300, // 5-10 minutes
          mode: 'multiplayer'
        });

        callback(this.getLeaderboard());
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
