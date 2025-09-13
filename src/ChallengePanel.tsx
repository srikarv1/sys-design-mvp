import React from 'react';
import { Challenge } from './sampleChallenges';
import { theme } from './styles/theme';

interface ChallengePanelProps {
  challenges: Challenge[];
  selectedChallenge: Challenge;
  onChallengeSelect: (challenge: Challenge) => void;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({ 
  challenges, 
  selectedChallenge, 
  onChallengeSelect 
}) => {
  const getLevelColor = (level: number) => {
    const colors = {
      1: '#28a745',
      2: '#ffc107', 
      3: '#dc3545',
      4: '#6f42c1',
      5: '#fd7e14'
    };
    return colors[level as keyof typeof colors] || '#6c757d';
  };

  const getLevelLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Expert',
      5: 'Master'
    };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  return (
    <div style={{ 
      padding: theme.spacing.xl, 
      height: '100%', 
      overflowY: 'auto',
      background: 'transparent'
    }}>
      {/* Current Challenge */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ 
          padding: theme.spacing.xl, 
          background: 'rgba(30, 41, 59, 0.8)', 
          borderRadius: theme.borderRadius.xl,
          border: `1px solid #334155`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <h4 style={{ 
              margin: 0, 
              color: theme.colors.white, 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold
            }}>
              {selectedChallenge.title}
            </h4>
            <span style={{ 
              padding: `${theme.spacing.sm} ${theme.spacing.md}`, 
              background: `linear-gradient(135deg, ${getLevelColor(selectedChallenge.level)} 0%, ${getLevelColor(selectedChallenge.level)}dd 100%)`,
              color: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: `0 4px 12px ${getLevelColor(selectedChallenge.level)}40`
            }}>
              {getLevelLabel(selectedChallenge.level)}
            </span>
          </div>
          
          <p style={{ 
            margin: `0 0 ${theme.spacing.lg} 0`, 
            fontSize: theme.typography.fontSize.base, 
            color: '#cbd5e1',
            lineHeight: 1.6
          }}>
            {selectedChallenge.description}
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: theme.spacing.md,
            fontSize: theme.typography.fontSize.sm
          }}>
            <div style={{
              padding: theme.spacing.md,
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.bold, color: '#3b82f6', fontSize: theme.typography.fontSize.lg }}>
                {selectedChallenge.trafficProfile.rps.toLocaleString()}
              </div>
              <div style={{ color: '#94a3b8' }}>RPS</div>
            </div>
            <div style={{
              padding: theme.spacing.md,
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.bold, color: '#10b981', fontSize: theme.typography.fontSize.lg }}>
                ${selectedChallenge.budget}
              </div>
              <div style={{ color: '#94a3b8' }}>/month</div>
            </div>
            <div style={{
              padding: theme.spacing.md,
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.bold, color: '#f59e0b', fontSize: theme.typography.fontSize.lg }}>
                {selectedChallenge.sla.maxLatency}ms
              </div>
              <div style={{ color: '#94a3b8' }}>Latency</div>
            </div>
            <div style={{
              padding: theme.spacing.md,
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.bold, color: '#8b5cf6', fontSize: theme.typography.fontSize.lg }}>
                {(selectedChallenge.sla.minAvailability * 100).toFixed(1)}%
              </div>
              <div style={{ color: '#94a3b8' }}>Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Challenges */}
      <div>
        <h4 style={{ 
          margin: `0 0 ${theme.spacing.lg} 0`, 
          color: theme.colors.white, 
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold
        }}>
          Available Challenges
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              onClick={() => onChallengeSelect(challenge)}
              style={{
                padding: theme.spacing.lg,
                background: challenge.id === selectedChallenge.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                border: challenge.id === selectedChallenge.id 
                  ? `1px solid #3b82f6` 
                  : `1px solid #334155`,
                borderRadius: theme.borderRadius.xl,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: theme.typography.fontSize.base,
                boxShadow: challenge.id === selectedChallenge.id ? '0 8px 32px rgba(59, 130, 246, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: theme.spacing.sm 
              }}>
                <div style={{ 
                  fontWeight: theme.typography.fontWeight.semibold, 
                  color: theme.colors.white, 
                  fontSize: theme.typography.fontSize.base
                }}>
                  {challenge.title}
                </div>
                <span style={{ 
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`, 
                  background: `linear-gradient(135deg, ${getLevelColor(challenge.level)} 0%, ${getLevelColor(challenge.level)}dd 100%)`,
                  color: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.bold,
                  boxShadow: `0 4px 12px ${getLevelColor(challenge.level)}40`
                }}>
                  L{challenge.level}
                </span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: '#94a3b8', 
                marginBottom: theme.spacing.sm,
                display: 'flex',
                gap: theme.spacing.sm
              }}>
                <span>{challenge.trafficProfile.rps.toLocaleString()} RPS</span>
                <span>•</span>
                <span>${challenge.budget}/mo</span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: '#cbd5e1',
                lineHeight: 1.5
              }}>
                {challenge.mustHaves.slice(0, 2).join(', ')}
                {challenge.mustHaves.length > 2 && '...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hints Section */}
      <div style={{ 
        marginTop: theme.spacing.lg,
        padding: theme.spacing.lg,
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: theme.borderRadius.xl,
        border: `1px solid #334155`,
        backdropFilter: 'blur(10px)'
      }}>
        <h5 style={{ 
          margin: `0 0 ${theme.spacing.md} 0`, 
          color: theme.colors.white, 
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          Hints
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: theme.spacing.lg, 
          fontSize: theme.typography.fontSize.sm, 
          color: '#cbd5e1',
          lineHeight: 1.6
        }}>
          {selectedChallenge.hints.map((hint, index) => (
            <li key={index} style={{ marginBottom: theme.spacing.sm }}>
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChallengePanel;
