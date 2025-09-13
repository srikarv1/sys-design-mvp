import React from 'react';
import { User } from '../types/game';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const getLevelColor = (level: number) => {
    if (level >= 8) return '#FFD700';
    if (level >= 5) return '#C0C0C0';
    if (level >= 3) return '#CD7F32';
    return '#8B4513';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 8) return 'System Architect';
    if (level >= 5) return 'Senior Engineer';
    if (level >= 3) return 'Mid-level Engineer';
    return 'Junior Engineer';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          fontSize: '24px'
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{user.username}</h3>
        <div style={{
          fontSize: '12px',
          opacity: 0.8,
          marginBottom: '10px'
        }}>
          {getLevelTitle(user.level)}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '15px',
        fontSize: '12px'
      }}>
        <div>
          <div style={{ opacity: 0.8 }}>Level</div>
          <div style={{ 
            fontWeight: 'bold', 
            color: getLevelColor(user.level),
            fontSize: '16px'
          }}>
            {user.level}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.8 }}>Best Score</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {user.bestScore}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.8 }}>Games Played</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {user.gamesPlayed}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.8 }}>Total Score</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {user.totalScore}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;

