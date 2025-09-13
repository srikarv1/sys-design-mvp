import React from 'react';
import { ClaudeFeedback } from './services/claudeFeedbackService';
import { theme } from './styles/theme';

interface ClaudeFeedbackPanelProps {
  feedback?: ClaudeFeedback;
  isAvailable: boolean;
  isLoading: boolean;
}

export default function ClaudeFeedbackPanel({ feedback, isAvailable, isLoading }: ClaudeFeedbackPanelProps) {
  if (isLoading) {
    return (
      <div style={{
        padding: theme.spacing.lg,
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: theme.borderRadius.xl,
        border: '1px solid #334155',
        marginBottom: theme.spacing.lg,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: `2px solid #3b82f6`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <h4 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.white
          }}>
            🤖 Claude Analysis
          </h4>
        </div>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.base,
          color: '#cbd5e1'
        }}>
          Analyzing your system design...
        </p>
      </div>
    );
  }

  if (!isAvailable || !feedback) {
    const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY;
    const apiKeyConfigured = !!(apiKey && 
      apiKey.trim() && 
      !apiKey.includes('your_anthropic_api_key_here'));

    return (
      <div style={{
        padding: theme.spacing.lg,
        background: apiKeyConfigured ? 'rgba(30, 41, 59, 0.6)' : 'rgba(239, 68, 68, 0.1)',
        borderRadius: theme.borderRadius.xl,
        border: `1px solid ${apiKeyConfigured ? '#334155' : '#ef4444'}`,
        marginBottom: theme.spacing.lg,
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.white,
          marginBottom: theme.spacing.md
        }}>
          🤖 Claude Analysis
        </h4>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.base,
          color: '#cbd5e1'
        }}>
          {apiKeyConfigured 
            ? 'Claude analysis not available. Add more components (3+) to trigger analysis.'
            : 'Claude API key not configured. Add your API key to .env file to enable AI feedback.'
          }
        </p>
        {!apiKeyConfigured && (
          <div style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: theme.borderRadius.lg,
            border: '1px solid #334155'
          }}>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: '#cbd5e1',
              fontWeight: theme.typography.fontWeight.medium
            }}>
              Setup: Copy .env.example to .env and add your Anthropic API key
            </p>
          </div>
        )}
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return theme.colors.success[500];
      case 'B': return theme.colors.primary[500];
      case 'C': return theme.colors.warning[500];
      case 'D': return theme.colors.warning[600];
      case 'F': return theme.colors.error[500];
      default: return theme.colors.gray[500];
    }
  };

  return (
    <div style={{
      padding: theme.spacing.xl,
      background: 'rgba(30, 41, 59, 0.8)',
      borderRadius: theme.borderRadius.xl,
      border: '1px solid #334155',
      marginBottom: theme.spacing.lg,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        borderBottom: '1px solid #334155'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.white
        }}>
          🤖 Claude Analysis
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.base,
            color: '#cbd5e1',
            fontWeight: theme.typography.fontWeight.medium
          }}>
            Score: {feedback.score}/100
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getGradeColor(feedback.architectureGrade)} 0%, ${getGradeColor(feedback.architectureGrade)}dd 100%)`,
            color: theme.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.bold,
            boxShadow: `0 4px 12px ${getGradeColor(feedback.architectureGrade)}40`
          }}>
            {feedback.architectureGrade}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h5 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.white,
          marginBottom: theme.spacing.md
        }}>
          📋 Analysis
        </h5>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.base,
          color: '#cbd5e1',
          lineHeight: 1.6,
          marginBottom: theme.spacing.lg
        }}>
          {feedback.detailedAnalysis}
        </p>
        
        <h5 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: '#3b82f6',
          marginBottom: theme.spacing.md
        }}>
          🎯 Optimal Solution
        </h5>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.base,
          color: '#cbd5e1',
          lineHeight: 1.6,
          padding: theme.spacing.lg,
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: theme.borderRadius.lg,
          border: '1px solid #3b82f6'
        }}>
          {feedback.optimalSolution}
        </p>
      </div>

      {/* Pros and Cons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.xl,
        marginBottom: theme.spacing.lg
      }}>
        {/* Pros */}
        <div>
          <h5 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: '#10b981',
            marginBottom: theme.spacing.md
          }}>
            ✅ Pros
          </h5>
          <ul style={{
            margin: 0,
            paddingLeft: theme.spacing.lg,
            fontSize: theme.typography.fontSize.base,
            color: '#cbd5e1',
            lineHeight: 1.6
          }}>
            {feedback.pros.map((pro, index) => (
              <li key={index} style={{ marginBottom: theme.spacing.sm }}>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h5 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: '#ef4444',
            marginBottom: theme.spacing.md
          }}>
            ⚠️ Areas for Improvement
          </h5>
          <ul style={{
            margin: 0,
            paddingLeft: theme.spacing.lg,
            fontSize: theme.typography.fontSize.base,
            color: '#cbd5e1',
            lineHeight: 1.6
          }}>
            {feedback.cons.map((con, index) => (
              <li key={index} style={{ marginBottom: theme.spacing.sm }}>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Additional Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.sm,
        fontSize: theme.typography.fontSize.xs
      }}>
        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.primary[50],
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.primary[200]}`
        }}>
          <div style={{
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.primary[700],
            marginBottom: theme.spacing.xs
          }}>
            💰 Cost Optimization
          </div>
          <div style={{ color: theme.colors.gray[600] }}>
            {feedback.costOptimization}
          </div>
        </div>

        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.warning[50],
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.warning[200]}`
        }}>
          <div style={{
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.warning[700],
            marginBottom: theme.spacing.xs
          }}>
            📈 Scalability
          </div>
          <div style={{ color: theme.colors.gray[600] }}>
            {feedback.scalabilityNotes}
          </div>
        </div>

        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.error[50],
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.error[200]}`,
          gridColumn: '1 / -1'
        }}>
          <div style={{
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.error[700],
            marginBottom: theme.spacing.xs
          }}>
            🔒 Security Considerations
          </div>
          <div style={{ color: theme.colors.gray[600] }}>
            {feedback.securityConsiderations}
          </div>
        </div>
      </div>
    </div>
  );
}
