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
      padding: theme.spacing.lg, 
      height: '100%', 
      overflowY: 'auto',
      backgroundColor: theme.colors.gray[50]
    }}>
      {/* Current Challenge */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ 
          padding: theme.spacing.lg, 
          backgroundColor: theme.colors.white, 
          borderRadius: theme.borderRadius.lg,
          border: `2px solid ${theme.colors.primary[200]}`,
          boxShadow: theme.shadows.sm,
          transition: theme.transitions.fast
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <h4 style={{ 
              margin: 0, 
              color: theme.colors.gray[900], 
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold
            }}>
              {selectedChallenge.title}
            </h4>
            <span style={{ 
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`, 
              backgroundColor: getLevelColor(selectedChallenge.level),
              color: theme.colors.white,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {getLevelLabel(selectedChallenge.level)}
            </span>
          </div>
          
          <p style={{ 
            margin: `0 0 ${theme.spacing.md} 0`, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.gray[600],
            lineHeight: 1.5
          }}>
            {selectedChallenge.description}
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: theme.spacing.sm,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[600]
          }}>
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.sm,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.gray[900] }}>
                {selectedChallenge.trafficProfile.rps.toLocaleString()}
              </div>
              <div>RPS</div>
            </div>
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.sm,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.gray[900] }}>
                ${selectedChallenge.budget}
              </div>
              <div>/month</div>
            </div>
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.sm,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.gray[900] }}>
                {selectedChallenge.sla.maxLatency}ms
              </div>
              <div>Latency</div>
            </div>
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.sm,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.gray[900] }}>
                {(selectedChallenge.sla.minAvailability * 100).toFixed(1)}%
              </div>
              <div>Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Challenges */}
      <div>
        <h4 style={{ 
          margin: `0 0 ${theme.spacing.md} 0`, 
          color: theme.colors.gray[900], 
          fontSize: theme.typography.fontSize.sm,
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
                padding: theme.spacing.md,
                backgroundColor: challenge.id === selectedChallenge.id ? theme.colors.primary[50] : theme.colors.white,
                border: challenge.id === selectedChallenge.id 
                  ? `2px solid ${theme.colors.primary[300]}` 
                  : `1px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.lg,
                cursor: 'pointer',
                transition: theme.transitions.fast,
                fontSize: theme.typography.fontSize.sm,
                boxShadow: challenge.id === selectedChallenge.id ? theme.shadows.md : theme.shadows.sm
              }}
              onMouseEnter={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                }
              }}
              onMouseLeave={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.white;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadows.sm;
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: theme.spacing.xs 
              }}>
                <div style={{ 
                  fontWeight: theme.typography.fontWeight.semibold, 
                  color: theme.colors.gray[900], 
                  fontSize: theme.typography.fontSize.sm
                }}>
                  {challenge.title}
                </div>
                <span style={{ 
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`, 
                  backgroundColor: getLevelColor(challenge.level),
                  color: theme.colors.white,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.bold
                }}>
                  L{challenge.level}
                </span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.xs, 
                color: theme.colors.gray[600], 
                marginBottom: theme.spacing.xs,
                display: 'flex',
                gap: theme.spacing.sm
              }}>
                <span>{challenge.trafficProfile.rps.toLocaleString()} RPS</span>
                <span>•</span>
                <span>${challenge.budget}/mo</span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.xs, 
                color: theme.colors.gray[500],
                lineHeight: 1.4
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
        padding: theme.spacing.md,
        backgroundColor: theme.colors.warning[50],
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.warning[200]}`
      }}>
        <h5 style={{ 
          margin: `0 0 ${theme.spacing.sm} 0`, 
          color: theme.colors.gray[900], 
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          💡 Hints
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: theme.spacing.lg, 
          fontSize: theme.typography.fontSize.xs, 
          color: theme.colors.gray[700],
          lineHeight: 1.5
        }}>
          {selectedChallenge.hints.map((hint, index) => (
            <li key={index} style={{ marginBottom: theme.spacing.xs }}>
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChallengePanel;
