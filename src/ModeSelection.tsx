import React, { useState } from 'react';
import { theme } from './styles/theme';

interface ModeSelectionProps {
  onModeSelect: (mode: 'single' | 'multiplayer', playerName?: string) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSinglePlayer = () => {
    onModeSelect('single');
  };

  const handleMultiplayer = () => {
    if (playerName.trim()) {
      onModeSelect('multiplayer', playerName.trim());
    } else {
      setShowNameInput(true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.gray[50],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily.sans.join(', ')
    }}>
      <div style={{
        maxWidth: '600px',
        width: '90%',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.xl,
        padding: theme.spacing['3xl'],
        textAlign: 'center'
      }}>
        {/* Logo and Title */}
        <div style={{
          marginBottom: theme.spacing.xl
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: theme.colors.primary[500],
            borderRadius: theme.borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto',
            marginBottom: theme.spacing.lg
          }}>
            🏗️
          </div>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.gray[900],
            marginBottom: theme.spacing.sm
          }}>
            Choose Your Mode
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.gray[600],
            lineHeight: 1.6
          }}>
            Practice solo or compete with others in real-time
          </p>
        </div>

        {/* Mode Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}>
          {/* Single Player Mode */}
          <div
            onClick={handleSinglePlayer}
            style={{
              padding: theme.spacing.xl,
              backgroundColor: theme.colors.primary[50],
              borderRadius: theme.borderRadius.lg,
              border: `2px solid ${theme.colors.primary[200]}`,
              cursor: 'pointer',
              transition: theme.transitions.fast,
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[100];
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[50];
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: theme.spacing.md
            }}>
              🎯
            </div>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.sm
            }}>
              Single Player
            </h3>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              lineHeight: 1.5
            }}>
              Practice system design at your own pace. Perfect for learning and interview preparation.
            </p>
            <div style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.gray[500]
            }}>
              ✓ No time pressure<br />
              ✓ Focus on learning<br />
              ✓ Track your progress
            </div>
          </div>

          {/* Multiplayer Mode */}
          <div
            onClick={handleMultiplayer}
            style={{
              padding: theme.spacing.xl,
              backgroundColor: theme.colors.success[50],
              borderRadius: theme.borderRadius.lg,
              border: `2px solid ${theme.colors.success[200]}`,
              cursor: 'pointer',
              transition: theme.transitions.fast,
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.success[100];
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.success[50];
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: theme.spacing.md
            }}>
              🏆
            </div>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.sm
            }}>
              Multiplayer
            </h3>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              lineHeight: 1.5
            }}>
              Compete with other players in real-time. Race against the clock and climb the leaderboard!
            </p>
            <div style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.gray[500]
            }}>
              ⏱️ Time pressure<br />
              🏆 Leaderboard<br />
              🎮 Competitive play
            </div>
          </div>
        </div>

        {/* Player Name Input */}
        {showNameInput && (
          <div style={{
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.warning[50],
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.warning[200]}`
          }}>
            <h4 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.sm
            }}>
              Enter Your Name
            </h4>
            <div style={{
              display: 'flex',
              gap: theme.spacing.sm,
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name..."
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) {
                    onModeSelect('multiplayer', playerName.trim());
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => onModeSelect('multiplayer', playerName.trim())}
                disabled={!playerName.trim()}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: playerName.trim() ? theme.colors.success[500] : theme.colors.gray[300],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => setShowNameInput(false)}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: 'transparent',
            color: theme.colors.gray[600],
            border: `1px solid ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer',
            transition: theme.transitions.fast
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.gray[50];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ← Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default ModeSelection;
