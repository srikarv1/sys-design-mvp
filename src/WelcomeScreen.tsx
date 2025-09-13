import React from 'react';
import { theme } from './styles/theme';
import ModeSelection from './ModeSelection';

interface WelcomeScreenProps {
  onStart: (mode: 'single' | 'multiplayer', playerName?: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [showModeSelection, setShowModeSelection] = React.useState(false);

  if (showModeSelection) {
    return (
      <ModeSelection 
        onModeSelect={(mode, playerName) => onStart(mode, playerName)} 
      />
    );
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.gray[50],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily.sans.join(', ')
    }}>
      <div style={{
        maxWidth: '800px',
        width: '90%',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.xl,
        padding: theme.spacing['3xl'],
        textAlign: 'center'
      }}>
        {/* Logo and Title */}
        <div style={{
          marginBottom: theme.spacing.xl
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: theme.colors.primary[500],
            borderRadius: theme.borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto',
            marginBottom: theme.spacing.lg
          }}>
            🏗️
          </div>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.gray[900],
            marginBottom: theme.spacing.md
          }}>
            System Design Simulator
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.gray[600],
            lineHeight: 1.6
          }}>
            Master system architecture through interactive design, real-time simulation, and chaos engineering
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}>
          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.primary[50],
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.primary[200]}`
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: theme.spacing.sm
            }}>
              🎯
            </div>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.xs
            }}>
              Interactive Building
            </h3>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              lineHeight: 1.5
            }}>
              Drag and drop components to build realistic system architectures
            </p>
          </div>

          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.success[50],
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.success[200]}`
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: theme.spacing.sm
            }}>
              📊
            </div>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.xs
            }}>
              Real-Time Metrics
            </h3>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              lineHeight: 1.5
            }}>
              See latency, availability, cost, and throughput change instantly
            </p>
          </div>

          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.error[50],
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.error[200]}`
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: theme.spacing.sm
            }}>
              💥
            </div>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              marginBottom: theme.spacing.xs
            }}>
              Chaos Engineering
            </h3>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              lineHeight: 1.5
            }}>
              Test resilience with realistic failure scenarios
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          marginBottom: theme.spacing.xl,
          textAlign: 'left'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.gray[900],
            marginBottom: theme.spacing.lg,
            textAlign: 'center'
          }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: theme.spacing.lg
          }}>
            {[
              { step: '1', title: 'Choose Challenge', desc: 'Select a real-world scenario' },
              { step: '2', title: 'Build System', desc: 'Drag components to canvas' },
              { step: '3', title: 'Configure', desc: 'Adjust parameters and settings' },
              { step: '4', title: 'Simulate', desc: 'Run tests and analyze results' }
            ].map((item, index) => (
              <div key={index} style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.white,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  margin: '0 auto',
                  marginBottom: theme.spacing.sm
                }}>
                  {item.step}
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.gray[900],
                  marginBottom: theme.spacing.xs
                }}>
                  {item.title}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.gray[600],
                  lineHeight: 1.4
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => setShowModeSelection(true)}
          style={{
            padding: `${theme.spacing.lg} ${theme.spacing['2xl']}`,
            backgroundColor: theme.colors.primary[500],
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            cursor: 'pointer',
            boxShadow: theme.shadows.md,
            transition: theme.transitions.fast,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = theme.shadows.md;
          }}
        >
          <span>🚀</span>
          Start Building Systems
        </button>

        {/* Footer */}
        <p style={{
          margin: `${theme.spacing.lg} 0 0 0`,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.gray[500]
        }}>
          Perfect for system design interviews, learning, and architecture planning
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
