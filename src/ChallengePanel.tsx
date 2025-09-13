import React from 'react';
import { Challenge } from './sampleChallenges';

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
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>Challenges</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px' }}>Current Challenge</h4>
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '6px',
          border: '2px solid #2196f3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h5 style={{ margin: 0, color: '#333', fontSize: '13px' }}>{selectedChallenge.title}</h5>
            <span style={{ 
              padding: '2px 6px', 
              backgroundColor: getLevelColor(selectedChallenge.level),
              color: 'white',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {getLevelLabel(selectedChallenge.level)}
            </span>
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
            {selectedChallenge.description}
          </p>
          <div style={{ fontSize: '11px', color: '#666' }}>
            <div><strong>Traffic:</strong> {selectedChallenge.trafficProfile.rps.toLocaleString()} RPS</div>
            <div><strong>Budget:</strong> ${selectedChallenge.budget}/month</div>
            <div><strong>SLA:</strong> {selectedChallenge.sla.maxLatency}ms latency, {(selectedChallenge.sla.minAvailability * 100).toFixed(2)}% uptime</div>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Available Challenges</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              onClick={() => onChallengeSelect(challenge)}
              style={{
                padding: '8px',
                backgroundColor: challenge.id === selectedChallenge.id ? '#e3f2fd' : '#f8f9fa',
                border: challenge.id === selectedChallenge.id ? '2px solid #2196f3' : '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '12px'
              }}
              onMouseEnter={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (challenge.id !== selectedChallenge.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '11px' }}>{challenge.title}</div>
                <span style={{ 
                  padding: '1px 4px', 
                  backgroundColor: getLevelColor(challenge.level),
                  color: 'white',
                  borderRadius: '2px',
                  fontSize: '9px',
                  fontWeight: 'bold'
                }}>
                  L{challenge.level}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>
                {challenge.trafficProfile.rps.toLocaleString()} RPS • ${challenge.budget}/mo
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>
                {challenge.mustHaves.slice(0, 2).join(', ')}
                {challenge.mustHaves.length > 2 && '...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hints Section */}
      <div style={{ marginTop: '15px' }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '12px' }}>💡 Hints</h5>
        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#666' }}>
          {selectedChallenge.hints.map((hint, index) => (
            <li key={index} style={{ marginBottom: '3px' }}>
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChallengePanel;
