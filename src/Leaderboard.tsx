import React from 'react';
import { theme } from './styles/theme';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  challengeId: string;
  challengeName: string;
  completedAt: Date;
  timeSpent: number; // in seconds
  mode: 'single' | 'multiplayer';
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
  isVisible: boolean;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  entries, 
  currentPlayerName, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.success[500];
    if (score >= 70) return theme.colors.warning[500];
    if (score >= 50) return theme.colors.error[500];
    return theme.colors.gray[500];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily.sans.join(', ')
    }}>
      <div style={{
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80%',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.xl,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.primary[500],
          color: theme.colors.white,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold
            }}>
              🏆 Leaderboard
            </h2>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              opacity: 0.9
            }}>
              Top system designers competing for the crown
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: theme.spacing.sm,
              backgroundColor: 'transparent',
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.lg,
              cursor: 'pointer',
              opacity: 0.8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
          >
            ✕
          </button>
        </div>

        {/* Leaderboard Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: theme.spacing.lg
        }}>
          {sortedEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: theme.spacing['2xl'],
              color: theme.colors.gray[500]
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: theme.spacing.md
              }}>
                🏗️
              </div>
              <h3 style={{
                margin: 0,
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.gray[700]
              }}>
                No scores yet
              </h3>
              <p style={{
                margin: `${theme.spacing.sm} 0 0 0`,
                fontSize: theme.typography.fontSize.sm
              }}>
                Complete challenges to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 120px 100px',
                gap: theme.spacing.md,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.gray[100],
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.gray[700]
              }}>
                <div>Rank</div>
                <div>Player</div>
                <div>Score</div>
                <div>Challenge</div>
                <div>Time</div>
              </div>

              {/* Leaderboard Entries */}
              {sortedEntries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentPlayer = currentPlayerName && entry.playerName === currentPlayerName;
                
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 80px 120px 100px',
                      gap: theme.spacing.md,
                      padding: theme.spacing.md,
                      backgroundColor: isCurrentPlayer ? theme.colors.primary[50] : theme.colors.white,
                      borderRadius: theme.borderRadius.md,
                      border: isCurrentPlayer ? `2px solid ${theme.colors.primary[200]}` : `1px solid ${theme.colors.gray[200]}`,
                      fontSize: theme.typography.fontSize.sm,
                      transition: theme.transitions.fast,
                      ...(rank <= 3 && {
                        boxShadow: theme.shadows.md,
                        transform: 'scale(1.02)'
                      })
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: rank <= 3 ? theme.typography.fontSize.lg : theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: rank <= 3 ? theme.colors.warning[600] : theme.colors.gray[600]
                    }}>
                      {getRankIcon(rank)}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: isCurrentPlayer ? theme.colors.primary[500] : theme.colors.gray[400],
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.white,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.bold
                      }}>
                        {entry.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.gray[900]
                        }}>
                          {entry.playerName}
                          {isCurrentPlayer && (
                            <span style={{
                              marginLeft: theme.spacing.xs,
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.primary[600]
                            }}>
                              (You)
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.gray[500]
                        }}>
                          {entry.mode === 'multiplayer' ? '🏆 Competitive' : '🎯 Practice'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: getScoreColor(entry.score)
                    }}>
                      {entry.score}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.gray[600]
                    }}>
                      {entry.challengeName}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.gray[600]
                    }}>
                      {formatTime(entry.timeSpent)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.gray[50],
          borderTop: `1px solid ${theme.colors.gray[200]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.gray[600]
          }}>
            {sortedEntries.length} total entries
          </div>
          <button
            onClick={onClose}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
