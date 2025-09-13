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
        padding: theme.spacing.md,
        backgroundColor: theme.colors.primary[50],
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.primary[200]}`,
        marginBottom: theme.spacing.md
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${theme.colors.primary[500]}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <h4 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.gray[900]
          }}>
            🤖 Claude Analysis
          </h4>
        </div>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.gray[600]
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
        padding: theme.spacing.md,
        backgroundColor: apiKeyConfigured ? theme.colors.gray[50] : theme.colors.warning[50],
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${apiKeyConfigured ? theme.colors.gray[200] : theme.colors.warning[200]}`,
        marginBottom: theme.spacing.md
      }}>
        <h4 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: apiKeyConfigured ? theme.colors.gray[700] : theme.colors.warning[700],
          marginBottom: theme.spacing.sm
        }}>
          🤖 Claude Analysis
        </h4>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          color: apiKeyConfigured ? theme.colors.gray[500] : theme.colors.warning[600]
        }}>
          {apiKeyConfigured 
            ? 'Claude analysis not available. Add more components (3+) to trigger analysis.'
            : 'Claude API key not configured. Add your API key to .env file to enable AI feedback.'
          }
        </p>
        {!apiKeyConfigured && (
          <div style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.warning[300]}`
          }}>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.gray[600],
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
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.gray[200]}`,
      marginBottom: theme.spacing.md,
      boxShadow: theme.shadows.sm
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.gray[200]}`
      }}>
        <h4 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.gray[900]
        }}>
          🤖 Claude Analysis
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[600],
            fontWeight: theme.typography.fontWeight.medium
          }}>
            Score: {feedback.score}/100
          </span>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: getGradeColor(feedback.architectureGrade),
            color: theme.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.bold
          }}>
            {feedback.architectureGrade}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div style={{ marginBottom: theme.spacing.md }}>
        <h5 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.gray[900],
          marginBottom: theme.spacing.xs
        }}>
          📋 Analysis
        </h5>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.gray[700],
          lineHeight: 1.4,
          marginBottom: theme.spacing.sm
        }}>
          {feedback.detailedAnalysis}
        </p>
        
        <h5 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.primary[700],
          marginBottom: theme.spacing.xs
        }}>
          🎯 Optimal Solution
        </h5>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.gray[700],
          lineHeight: 1.4,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.primary[50],
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.primary[200]}`
        }}>
          {feedback.optimalSolution}
        </p>
      </div>

      {/* Pros and Cons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md
      }}>
        {/* Pros */}
        <div>
          <h5 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.success[700],
            marginBottom: theme.spacing.xs
          }}>
            ✅ Pros
          </h5>
          <ul style={{
            margin: 0,
            paddingLeft: theme.spacing.md,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[600],
            lineHeight: 1.4
          }}>
            {feedback.pros.map((pro, index) => (
              <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h5 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.error[700],
            marginBottom: theme.spacing.xs
          }}>
            ⚠️ Areas for Improvement
          </h5>
          <ul style={{
            margin: 0,
            paddingLeft: theme.spacing.md,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[600],
            lineHeight: 1.4
          }}>
            {feedback.cons.map((con, index) => (
              <li key={index} style={{ marginBottom: theme.spacing.xs }}>
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
