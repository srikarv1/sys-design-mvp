import React from 'react';
import { SimulationResult } from './simulate';
import { Challenge } from './sampleChallenges';
import ClaudeFeedbackPanel from './ClaudeFeedbackPanel';
import { theme } from './styles/theme';

interface MetricsPanelProps {
  simulationResult: SimulationResult | null;
  selectedChallenge: Challenge;
  isSimulating: boolean;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ 
  simulationResult, 
  selectedChallenge, 
  isSimulating 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getMetricStatus = (value: number, target: number, isLowerBetter: boolean = false) => {
    const meetsTarget = isLowerBetter ? value <= target : value >= target;
    return {
      meetsTarget,
      color: meetsTarget ? '#27ae60' : '#e74c3c',
      icon: meetsTarget ? '✓' : '✗'
    };
  };

  return (
    <div style={{ padding: theme.spacing.xl, height: '100%', overflowY: 'auto', background: 'transparent' }}>
      <h3 style={{ marginBottom: theme.spacing.lg, color: theme.colors.white, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold }}>Metrics & Scoring</h3>
      
      {isSimulating ? (
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing['3xl'],
          color: '#cbd5e1'
        }}>
          <div style={{ fontSize: '32px', marginBottom: theme.spacing.md }}>⏳</div>
          <div style={{ fontSize: theme.typography.fontSize.lg }}>Running simulation...</div>
        </div>
      ) : simulationResult ? (
        <div>
          {/* Claude Feedback Panel */}
          <ClaudeFeedbackPanel 
            feedback={simulationResult.claudeFeedback}
            isAvailable={simulationResult.isClaudeAnalysisAvailable}
            isLoading={isSimulating}
            localScore={simulationResult.score}
          />

          {/* Overall Score */}
          <div style={{ 
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.xl,
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: theme.borderRadius.xl,
            border: '1px solid #334155',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.sm
            }}>
              <h4 style={{ margin: 0, color: theme.colors.white, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>Overall Score</h4>
              <span style={{ 
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: getScoreColor(simulationResult.score)
              }}>
                {simulationResult.score}/100
              </span>
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize.base, 
              color: getScoreColor(simulationResult.score),
              fontWeight: theme.typography.fontWeight.semibold
            }}>
              {getScoreLabel(simulationResult.score)}
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ marginBottom: theme.spacing.xl }}>
            <h4 style={{ margin: `0 0 ${theme.spacing.lg} 0`, color: theme.colors.white, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>Key Metrics</h4>
            
            {/* Latency */}
            <div style={{ 
              marginBottom: theme.spacing.md,
              padding: theme.spacing.lg,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: theme.borderRadius.lg,
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <span style={{ fontSize: theme.typography.fontSize.base, color: '#cbd5e1', fontWeight: theme.typography.fontWeight.medium }}>P95 Latency</span>
                <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.white }}>
                  {simulationResult.metrics.latency.p95.toFixed(1)}ms
                </span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: getMetricStatus(simulationResult.metrics.latency.p95, selectedChallenge.sla.maxLatency, true).color,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm
              }}>
                <span>{getMetricStatus(simulationResult.metrics.latency.p95, selectedChallenge.sla.maxLatency, true).icon}</span>
                Target: {selectedChallenge.sla.maxLatency}ms
              </div>
            </div>

            {/* Availability */}
            <div style={{ 
              marginBottom: theme.spacing.md,
              padding: theme.spacing.lg,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: theme.borderRadius.lg,
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <span style={{ fontSize: theme.typography.fontSize.base, color: '#cbd5e1', fontWeight: theme.typography.fontWeight.medium }}>Availability</span>
                <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.white }}>
                  {(simulationResult.metrics.availability * 100).toFixed(2)}%
                </span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: getMetricStatus(simulationResult.metrics.availability, selectedChallenge.sla.minAvailability).color,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm
              }}>
                <span>{getMetricStatus(simulationResult.metrics.availability, selectedChallenge.sla.minAvailability).icon}</span>
                Target: {(selectedChallenge.sla.minAvailability * 100).toFixed(2)}%
              </div>
            </div>

            {/* Cost */}
            <div style={{ 
              marginBottom: theme.spacing.md,
              padding: theme.spacing.lg,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: theme.borderRadius.lg,
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <span style={{ fontSize: theme.typography.fontSize.base, color: '#cbd5e1', fontWeight: theme.typography.fontWeight.medium }}>Monthly Cost</span>
                <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.white }}>
                  ${simulationResult.metrics.cost.toFixed(0)}
                </span>
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: getMetricStatus(simulationResult.metrics.cost, selectedChallenge.budget, true).color,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm
              }}>
                <span>{getMetricStatus(simulationResult.metrics.cost, selectedChallenge.budget, true).icon}</span>
                Budget: ${selectedChallenge.budget}
              </div>
            </div>

            {/* Throughput */}
            <div style={{ 
              marginBottom: theme.spacing.md,
              padding: theme.spacing.lg,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: theme.borderRadius.lg,
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <span style={{ fontSize: theme.typography.fontSize.base, color: '#cbd5e1', fontWeight: theme.typography.fontWeight.medium }}>Throughput</span>
                <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.white }}>
                  {simulationResult.metrics.throughput.toFixed(0)} RPS
                </span>
              </div>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: '#94a3b8' }}>
                Target: {selectedChallenge.trafficProfile.rps.toLocaleString()} RPS
              </div>
            </div>
          </div>

          {/* Feedback */}
          {simulationResult.feedback.length > 0 && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h5 style={{ margin: `0 0 ${theme.spacing.md} 0`, color: theme.colors.white, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold }}>Positive Feedback</h5>
              <ul style={{ margin: 0, paddingLeft: theme.spacing.lg, fontSize: theme.typography.fontSize.sm, color: '#10b981' }}>
                {simulationResult.feedback.map((item, index) => (
                  <li key={index} style={{ marginBottom: theme.spacing.sm }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Violations */}
          {simulationResult.violations.length > 0 && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h5 style={{ margin: `0 0 ${theme.spacing.md} 0`, color: theme.colors.white, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold }}>Issues Found</h5>
              <ul style={{ margin: 0, paddingLeft: theme.spacing.lg, fontSize: theme.typography.fontSize.sm, color: '#ef4444' }}>
                {simulationResult.violations.map((item, index) => (
                  <li key={index} style={{ marginBottom: theme.spacing.sm }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {simulationResult.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: `0 0 ${theme.spacing.md} 0`, color: theme.colors.white, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold }}>Recommendations</h5>
              <ul style={{ margin: 0, paddingLeft: theme.spacing.lg, fontSize: theme.typography.fontSize.sm, color: '#3b82f6' }}>
                {simulationResult.recommendations.map((item, index) => (
                  <li key={index} style={{ marginBottom: theme.spacing.sm }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing['3xl'],
          color: '#cbd5e1'
        }}>
          <div style={{ fontSize: '32px', marginBottom: theme.spacing.md }}>📈</div>
          <div style={{ fontSize: theme.typography.fontSize.lg }}>Build your system and click Simulate to see metrics</div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;