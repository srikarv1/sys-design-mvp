import React from 'react';
import { theme } from './styles/theme';
import ModeSelection from './ModeSelection';

interface WelcomeScreenProps {
  onStart: (mode: 'single' | 'multiplayer', playerName?: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [showModeSelection, setShowModeSelection] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'build' | 'simulate' | 'resilience'>('build');

  const categoryLabels: Record<string, string> = {
    edge: 'Edge & Networking',
    app: 'Application Services',
    storage: 'Storage & Databases',
    integration: 'Integration & Messaging',
    search: 'Search & Recommendation',
    cdn: 'CDN & Edge',
    security: 'Security',
    monitoring: 'Observability',
    ai: 'AI & ML',
    gaming: 'Gaming'
  };

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
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      fontFamily: theme.typography.fontFamily.sans.join(', '),
      overflow: 'auto',
      backgroundColor: theme.colors.secondary[900],
      color: theme.colors.white
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: theme.colors.secondary[900],
        borderBottom: `1px solid ${theme.colors.secondary[700]}`,
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.colors.primary[600]
          }} />
          <div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.white
            }}>System Design Studio</div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.secondary[400]
            }}>Design, simulate, and learn system architecture</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <a href="#features" style={{
            textDecoration: 'none',
            color: theme.colors.secondary[200],
            fontSize: theme.typography.fontSize.sm
          }}>Features</a>
          <a href="#library" style={{
            textDecoration: 'none',
            color: theme.colors.secondary[200],
            fontSize: theme.typography.fontSize.sm
          }}>Library</a>
          <a href="#how-it-works" style={{
            textDecoration: 'none',
            color: theme.colors.secondary[200],
            fontSize: theme.typography.fontSize.sm
          }}>How it works</a>
          <button
            onClick={() => setShowModeSelection(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.primary[600],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: 'pointer'
            }}
          >
            Get started
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{
          padding: `${theme.spacing['3xl']} ${theme.spacing.xl}`,
          background: `radial-gradient(1200px 600px at 20% -20%, rgba(59, 130, 246, 0.15), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(16, 185, 129, 0.10), transparent)`,
          borderBottom: `1px solid ${theme.colors.secondary[700]}`
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              color: theme.colors.white,
              fontSize: '44px',
              fontWeight: theme.typography.fontWeight.bold,
              lineHeight: 1.2
            }}>Design systems. Simulate trade‑offs. Build intuition.</h1>
            <p style={{
              margin: `${theme.spacing.md} auto ${theme.spacing['2xl']} auto`,
              color: theme.colors.secondary[300],
              fontSize: theme.typography.fontSize.lg,
              maxWidth: '760px',
              lineHeight: 1.7
            }}>
              An interactive environment to practice modern system architecture. No fluff—hands‑on canvas, realistic scenarios, and clear feedback.
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'center' }}>
              <button
                onClick={() => setShowModeSelection(true)}
                style={{
                  padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
                  backgroundColor: theme.colors.primary[600],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.semibold,
                  cursor: 'pointer'
                }}
              >
                Start building
              </button>
              <a href="#features" style={{
                padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
                border: `1px solid ${theme.colors.secondary[700]}`,
                borderRadius: theme.borderRadius.lg,
                textDecoration: 'none',
                color: theme.colors.secondary[100],
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                backgroundColor: 'transparent'
              }}>
                View features
              </a>
            </div>
          </div>
        </section>

        {/* Tabbed Features with contextual preview */}
        <section id="features" style={{ padding: `${theme.spacing['2xl']} ${theme.spacing.xl}` }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <h2 style={{ margin: 0, color: theme.colors.white, fontSize: theme.typography.fontSize['3xl'] }}>What you can do</h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: theme.spacing.xl
            }}>
              {/* Tabs */}
              <div style={{
                backgroundColor: theme.colors.secondary[800],
                border: `1px solid ${theme.colors.secondary[700]}`,
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden'
              }}>
                {[
                  { id: 'build', title: 'Build', desc: 'Drag components, connect services, validate instantly.' },
                  { id: 'simulate', title: 'Simulate', desc: 'Run scenarios and see latency/availability/cost trade‑offs.' },
                  { id: 'resilience', title: 'Resilience', desc: 'Inject failures and observe degradation and recovery.' }
                ].map((t) => {
                  const isActive = activeTab === (t.id as 'build' | 'simulate' | 'resilience');
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as 'build' | 'simulate' | 'resilience')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: `${theme.spacing.lg}`,
                        backgroundColor: isActive ? theme.colors.secondary[700] : 'transparent',
                        color: theme.colors.secondary[100],
                        border: 'none',
                        borderBottom: `1px solid ${theme.colors.secondary[700]}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: theme.typography.fontWeight.semibold }}>{t.title}</div>
                      <div style={{ color: theme.colors.secondary[400], marginTop: theme.spacing.xs }}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Preview Panel */}
              <div style={{
                backgroundColor: theme.colors.secondary[800],
                border: `1px solid ${theme.colors.secondary[700]}`,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.xl
              }}>
                {activeTab === 'build' && (
                  <div>
                    <div style={{ color: theme.colors.secondary[300], marginBottom: theme.spacing.md }}>Canvas preview</div>
                    <div style={{
                      backgroundColor: theme.colors.secondary[900],
                      border: `1px dashed ${theme.colors.secondary[700]}`,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.lg,
                      color: theme.colors.secondary[300]
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing.md }}>
                        <div style={{ backgroundColor: theme.colors.components.edge, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                        <div style={{ backgroundColor: theme.colors.components.app, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                        <div style={{ backgroundColor: theme.colors.components.storage, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                        <div style={{ backgroundColor: theme.colors.components.integration, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                        <div style={{ backgroundColor: theme.colors.components.search, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                        <div style={{ backgroundColor: theme.colors.components.cdn, height: '48px', borderRadius: theme.borderRadius.md, opacity: 0.9 }} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'simulate' && (
                  <div>
                    <div style={{ color: theme.colors.secondary[300], marginBottom: theme.spacing.md }}>Config preview</div>
                    <pre style={{
                      margin: 0,
                      backgroundColor: theme.colors.secondary[900],
                      border: `1px solid ${theme.colors.secondary[700]}`,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.lg,
                      color: theme.colors.secondary[200],
                      fontFamily: theme.typography.fontFamily.mono.join(', '),
                      fontSize: theme.typography.fontSize.sm
                    }}>{`traffic: {
  rps: 1200,
  readRatio: 0.8,
  payloadSize: 8_192,
}

components: [api, web, cache, db]
connections: (web -> cache), (web -> db)`}</pre>
                  </div>
                )}

                {activeTab === 'resilience' && (
                  <div>
                    <div style={{ color: theme.colors.secondary[300], marginBottom: theme.spacing.md }}>Failure preview</div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: theme.spacing.md
                    }}>
                      {[ 'Zone outage', 'Cache miss storm', 'DB failover' ].map((item) => (
                        <div key={item} style={{
                          backgroundColor: theme.colors.secondary[900],
                          border: `1px solid ${theme.colors.secondary[700]}`,
                          borderRadius: theme.borderRadius.md,
                          padding: theme.spacing.md,
                          color: theme.colors.secondary[200]
                        }}>{item}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Component Library chips */}
        <section id="library" style={{
          padding: `${theme.spacing['2xl']} ${theme.spacing.xl}`,
          borderTop: `1px solid ${theme.colors.secondary[700]}`
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
              <h2 style={{ margin: 0, color: theme.colors.white, fontSize: theme.typography.fontSize['3xl'] }}>Component library</h2>
              <div style={{ color: theme.colors.secondary[400], marginTop: theme.spacing.xs }}>Curated building blocks for modern architectures</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'center' }}>
              {Object.keys(theme.colors.components).map((key) => (
                <div key={key} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.secondary[800],
                  border: `1px solid ${theme.colors.secondary[700]}`,
                  borderRadius: theme.borderRadius.full,
                  color: theme.colors.secondary[100]
                }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: theme.borderRadius.full, backgroundColor: (theme.colors.components as any)[key] }} />
                  <span>{categoryLabels[key] || key}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{
          padding: `${theme.spacing['2xl']} ${theme.spacing.xl}`,
          backgroundColor: theme.colors.secondary[900],
          borderTop: `1px solid ${theme.colors.secondary[700]}`,
          borderBottom: `1px solid ${theme.colors.secondary[700]}`
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{
              margin: 0,
              color: theme.colors.white,
              fontSize: theme.typography.fontSize['3xl'],
              textAlign: 'center'
            }}>How it works</h2>
            <div style={{
              marginTop: theme.spacing.xl,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: theme.spacing.lg
            }}>
              {[
                { step: '1', title: 'Pick a challenge', desc: 'Choose a realistic scenario to tackle.' },
                { step: '2', title: 'Design your system', desc: 'Add services, storage, queues, and more.' },
                { step: '3', title: 'Tune and simulate', desc: 'Adjust parameters and run simulations.' },
                { step: '4', title: 'Iterate with feedback', desc: 'Review metrics and recommendations.' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: theme.colors.secondary[800],
                  border: `1px solid ${theme.colors.secondary[700]}`,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.sm
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: theme.colors.primary[600],
                      color: theme.colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold
                    }}>{item.step}</div>
                    <div style={{
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.white
                    }}>{item.title}</div>
                  </div>
                  <div style={{ color: theme.colors.secondary[300] }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: `${theme.spacing['2xl']} ${theme.spacing.xl}`,
          backgroundColor: theme.colors.secondary[900]
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              color: theme.colors.white,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md
            }}>Ready to start designing?</div>
            <button
              onClick={() => setShowModeSelection(true)}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
                backgroundColor: theme.colors.primary[600],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                cursor: 'pointer'
              }}
            >
              Get started
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: theme.colors.secondary[900],
        borderTop: `1px solid ${theme.colors.secondary[700]}`,
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        textAlign: 'center'
      }}>
        <div style={{ color: theme.colors.secondary[400], fontSize: theme.typography.fontSize.sm }}>
          © 2024 System Design Studio
        </div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
