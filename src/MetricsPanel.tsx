import React from 'react';
import { SimulationResult } from './simulate';
import { Challenge } from './sampleChallenges';

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
      icon: meetsTarget ? '✅' : '❌'
    };
  };

  return (
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>📊 Metrics & Scoring</h3>
      
      {isSimulating ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Running simulation...</div>
        </div>
      ) : simulationResult ? (
        <div>
          {/* Overall Score */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #dee2e6'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>Overall Score</h4>
              <span style={{ 
                fontSize: '24px',
                fontWeight: 'bold',
                color: getScoreColor(simulationResult.score)
              }}>
                {simulationResult.score}/100
              </span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: getScoreColor(simulationResult.score),
              fontWeight: 'bold'
            }}>
              {getScoreLabel(simulationResult.score)}
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Key Metrics</h4>
            
            {/* Latency */}
            <div style={{ 
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>P95 Latency</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {simulationResult.metrics.latency.p95.toFixed(1)}ms
                </span>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: getMetricStatus(simulationResult.metrics.latency.p95, selectedChallenge.sla.maxLatency, true).color
              }}>
                {getMetricStatus(simulationResult.metrics.latency.p95, selectedChallenge.sla.maxLatency, true).icon} 
                Target: {selectedChallenge.sla.maxLatency}ms
              </div>
            </div>

            {/* Availability */}
            <div style={{ 
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Availability</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {(simulationResult.metrics.availability * 100).toFixed(2)}%
                </span>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: getMetricStatus(simulationResult.metrics.availability, selectedChallenge.sla.minAvailability).color
              }}>
                {getMetricStatus(simulationResult.metrics.availability, selectedChallenge.sla.minAvailability).icon} 
                Target: {(selectedChallenge.sla.minAvailability * 100).toFixed(2)}%
              </div>
            </div>

            {/* Cost */}
            <div style={{ 
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Monthly Cost</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  ${simulationResult.metrics.cost.toFixed(0)}
                </span>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: getMetricStatus(simulationResult.metrics.cost, selectedChallenge.budget, true).color
              }}>
                {getMetricStatus(simulationResult.metrics.cost, selectedChallenge.budget, true).icon} 
                Budget: ${selectedChallenge.budget}
              </div>
            </div>

            {/* Throughput */}
            <div style={{ 
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Throughput</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {simulationResult.metrics.throughput.toFixed(0)} RPS
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                Target: {selectedChallenge.trafficProfile.rps.toLocaleString()} RPS
              </div>
            </div>
          </div>

          {/* Feedback */}
          {simulationResult.feedback.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '12px' }}>✅ Positive Feedback</h5>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#27ae60' }}>
                {simulationResult.feedback.map((item, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Violations */}
          {simulationResult.violations.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '12px' }}>❌ Issues Found</h5>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#e74c3c' }}>
                {simulationResult.violations.map((item, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {simulationResult.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '12px' }}>💡 Recommendations</h5>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#3498db' }}>
                {simulationResult.recommendations.map((item, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>
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
          padding: '40px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '12px' }}>Build your system and click Simulate to see metrics</div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;