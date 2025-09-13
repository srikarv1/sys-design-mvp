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
      inset: 0,
      backgroundColor: theme.colors.secondary[900],
      color: theme.colors.white,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      fontFamily: theme.typography.fontFamily.sans.join(', ')
    }}>
      <div style={{ width: '100%', maxWidth: '980px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing['2xl']
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ width: '24px', height: '24px', borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary[600] }} />
            <div style={{ fontWeight: theme.typography.fontWeight.bold }}>System Design Studio</div>
          </div>
          <div style={{ color: theme.colors.secondary[400], fontSize: theme.typography.fontSize.sm }}>Mode selection</div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing['2xl'] }}>
          <div style={{ fontSize: '32px', fontWeight: theme.typography.fontWeight.bold }}>Choose how you want to practice</div>
          <div style={{ color: theme.colors.secondary[300], marginTop: theme.spacing.sm }}>Pick solo for focused learning or multiplayer to compete with others.</div>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: theme.spacing.xl
        }}>
          {/* Single Player */}
          <div style={{
            backgroundColor: theme.colors.secondary[800],
            border: `1px solid ${theme.colors.secondary[700]}`,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl
          }}>
            <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold }}>Single player</div>
            <div style={{ color: theme.colors.secondary[300], marginTop: theme.spacing.sm }}>Learn at your own pace with clear feedback and no time pressure.</div>
            <ul style={{ color: theme.colors.secondary[300], lineHeight: 1.8, marginTop: theme.spacing.lg, paddingLeft: '20px' }}>
              <li>Guided scenarios</li>
              <li>Auto-simulate on changes</li>
              <li>Private progress</li>
            </ul>
            <button
              onClick={handleSinglePlayer}
              style={{
                marginTop: theme.spacing.lg,
                padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                backgroundColor: theme.colors.primary[600],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontWeight: theme.typography.fontWeight.semibold,
                cursor: 'pointer'
              }}
            >
              Continue solo
            </button>
          </div>

          {/* Multiplayer */}
          <div style={{
            backgroundColor: theme.colors.secondary[800],
            border: `1px solid ${theme.colors.secondary[700]}`,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl
          }}>
            <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold }}>Multiplayer</div>
            <div style={{ color: theme.colors.secondary[300], marginTop: theme.spacing.sm }}>Compete in timed challenges and see how you rank.</div>
            <ul style={{ color: theme.colors.secondary[300], lineHeight: 1.8, marginTop: theme.spacing.lg, paddingLeft: '20px' }}>
              <li>Timed sessions</li>
              <li>Shared leaderboard</li>
              <li>Same scenarios</li>
            </ul>
            <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.secondary[900],
                  border: `1px solid ${theme.colors.secondary[700]}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.white,
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) handleMultiplayer();
                }}
              />
              <button
                onClick={handleMultiplayer}
                disabled={!playerName.trim()}
                style={{
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  backgroundColor: playerName.trim() ? theme.colors.primary[600] : theme.colors.secondary[700],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Join
              </button>
            </div>
            <div style={{ color: theme.colors.secondary[400], fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.sm }}>
              Name required to compete.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ textAlign: 'center', marginTop: theme.spacing['2xl'] }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: 'transparent',
              color: theme.colors.secondary[300],
              border: `1px solid ${theme.colors.secondary[700]}`,
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer'
            }}
          >
            Back to welcome
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
