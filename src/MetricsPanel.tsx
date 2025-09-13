import React from 'react';
import { SimulationResult } from './simulate';
import { Challenge } from './sampleChallenges';

interface MetricsPanelProps {
  result: SimulationResult;
  challenge: Challenge;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ result, challenge }) => {
  const { metrics, score, feedback, violations, recommendations } = result;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getSLAStatus = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    const meetsSLA = isHigherBetter ? value >= threshold : value <= threshold;
    return {
      meets: meetsSLA,
      color: meetsSLA ? '#28a745' : '#dc3545',
      icon: meetsSLA ? '✓' : '✗'
    };
  };

  const latencyStatus = getSLAStatus(metrics.latency.p95, challenge.sla.maxLatency, false);
  const availabilityStatus = getSLAStatus(metrics.availability, challenge.sla.minAvailability, true);
  const budgetStatus = getSLAStatus(metrics.cost, challenge.budget, false);

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      {/* Metrics Overview */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Simulation Results</h3>
        
        {/* Score */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: `2px solid ${getScoreColor(score)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#333' }}>Overall Score</h4>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: getScoreColor(score) 
            }}>
              {score}/100
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Latency (P95)</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: latencyStatus.color, fontSize: '18px' }}>
                {latencyStatus.icon}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {metrics.latency.p95.toFixed(1)}ms
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                / {challenge.sla.maxLatency}ms
              </span>
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Availability</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: availabilityStatus.color, fontSize: '18px' }}>
                {availabilityStatus.icon}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {(metrics.availability * 100).toFixed(2)}%
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                / {(challenge.sla.minAvailability * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Monthly Cost</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: budgetStatus.color, fontSize: '18px' }}>
                {budgetStatus.icon}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                ${metrics.cost.toFixed(0)}
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                / ${challenge.budget}
              </span>
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Throughput</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#333', fontSize: '18px' }}>📊</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {metrics.throughput.toFixed(0)} RPS
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Latency Breakdown */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Latency Breakdown</h5>
          <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>P50</div>
              <div>{metrics.latency.p50.toFixed(1)}ms</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>P95</div>
              <div>{metrics.latency.p95.toFixed(1)}ms</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>P99</div>
              <div>{metrics.latency.p99.toFixed(1)}ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback and Recommendations */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Analysis</h3>
        
        {/* Positive Feedback */}
        {feedback.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#28a745' }}>✓ What's Working</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              {feedback.map((item, index) => (
                <li key={index} style={{ marginBottom: '5px', color: '#333' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Violations */}
        {violations.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>⚠️ Issues Found</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              {violations.map((item, index) => (
                <li key={index} style={{ marginBottom: '5px', color: '#333' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#007bff' }}>💡 Recommendations</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              {recommendations.map((item, index) => (
                <li key={index} style={{ marginBottom: '5px', color: '#333' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenge Requirements */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Challenge Requirements</h5>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Must Have:</strong> {challenge.mustHaves.join(', ')}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Avoid:</strong> {challenge.antiPatterns.join(', ')}
            </div>
            <div>
              <strong>Budget:</strong> ${challenge.budget}/month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;

