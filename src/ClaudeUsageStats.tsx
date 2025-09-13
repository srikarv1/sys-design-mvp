import React from 'react';
import { claudeFeedbackService } from './services/claudeFeedbackService';
import { theme } from './styles/theme';

interface ClaudeUsageStatsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ClaudeUsageStats({ isVisible, onClose }: ClaudeUsageStatsProps) {
  if (!isVisible) return null;

  const stats = claudeFeedbackService.getUsageStats();
  const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY;
  const apiKeyConfigured = !!(apiKey && 
    apiKey.trim() && 
    !apiKey.includes('your_anthropic_api_key_here'));
  const isTestMode = claudeFeedbackService.isTestMode();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        maxWidth: '500px',
        width: '90%',
        boxShadow: theme.shadows.xl,
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            right: theme.spacing.md,
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: theme.colors.gray[500],
            padding: theme.spacing.xs
          }}
        >
          ×
        </button>

        <h2 style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.gray[900]
        }}>
          🤖 Claude API Usage
        </h2>

        <div style={{
          display: 'grid',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg
        }}>
          {/* API Key Status */}
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: apiKeyConfigured ? theme.colors.success[50] : theme.colors.error[50],
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${apiKeyConfigured ? theme.colors.success[200] : theme.colors.error[200]}`
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: apiKeyConfigured ? theme.colors.success[700] : theme.colors.error[700]
            }}>
              {apiKeyConfigured ? '✅ API Key Configured' : '❌ API Key Missing'}
              {isTestMode && (
                <span style={{
                  marginLeft: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.xs,
                  backgroundColor: theme.colors.warning[500],
                  color: theme.colors.white,
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  borderRadius: theme.borderRadius.sm
                }}>
                  🧪 TEST MODE
                </span>
              )}
            </h3>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: apiKeyConfigured ? theme.colors.success[600] : theme.colors.error[600]
            }}>
              {apiKeyConfigured 
                ? (isTestMode 
                  ? 'Claude API ready - Test mode bypasses hard checks for easy testing'
                  : 'Claude API is ready to provide intelligent feedback')
                : 'Add your Anthropic API key to .env file to enable Claude analysis'
              }
            </div>
          </div>

          {/* Usage Stats */}
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.primary[50],
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.primary[200]}`
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.primary[700]
            }}>
              Current Session
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm
            }}>
              <div>
                <span style={{ color: theme.colors.gray[600] }}>Requests Used:</span>
                <span style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.primary[700],
                  marginLeft: theme.spacing.xs
                }}>
                  {stats.requestsUsed}
                </span>
              </div>
              <div>
                <span style={{ color: theme.colors.gray[600] }}>Remaining:</span>
                <span style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: stats.requestsRemaining > 0 ? theme.colors.success[600] : theme.colors.error[600],
                  marginLeft: theme.spacing.xs
                }}>
                  {stats.requestsRemaining}
                </span>
              </div>
              <div>
                <span style={{ color: theme.colors.gray[600] }}>Cache Size:</span>
                <span style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.gray[700],
                  marginLeft: theme.spacing.xs
                }}>
                  {stats.cacheSize}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.warning[50],
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.warning[200]}`
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.warning[700]
            }}>
              💰 Cost Information
            </h3>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[700],
              lineHeight: 1.5
            }}>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • Using Claude 3 Haiku (most cost-effective model)
              </p>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
              </p>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • Hard checks prevent unnecessary API calls
              </p>
              <p style={{ margin: 0 }}>
                • Results are cached for 5 minutes
              </p>
            </div>
          </div>

          {/* Optimization Tips */}
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.success[50],
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.success[200]}`
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.success[700]
            }}>
              🚀 Optimization Tips
            </h3>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[700],
              lineHeight: 1.5
            }}>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • Add at least 3 components for Claude analysis
              </p>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • Include database and load balancer components
              </p>
              <p style={{ margin: 0, marginBottom: theme.spacing.xs }}>
                • Build more complex systems for better feedback
              </p>
              <p style={{ margin: 0 }}>
                • API calls are limited to 10 per session
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={async () => {
              // Test API key
              const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY;
              console.log('🧪 Test API Key:', {
                hasKey: !!apiKey,
                keyLength: apiKey?.length || 0,
                keyStart: apiKey?.substring(0, 10) || 'none'
              });
              
              // Test Claude API
              const claudeWorking = await claudeFeedbackService.testClaudeAPI();
              alert(`API Key Status: ${apiKey ? 'Found' : 'Missing'}\nLength: ${apiKey?.length || 0}\nStart: ${apiKey?.substring(0, 10) || 'none'}\n\nClaude API Test: ${claudeWorking ? 'SUCCESS' : 'FAILED'}`);
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.warning[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
          >
            Test Claude API
          </button>
          <button
            onClick={() => {
              if (isTestMode) {
                claudeFeedbackService.disableTestMode();
              } else {
                claudeFeedbackService.enableTestMode();
              }
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: isTestMode ? theme.colors.error[500] : theme.colors.success[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
          >
            {isTestMode ? 'Disable Test Mode' : 'Enable Test Mode'}
          </button>
          <button
            onClick={() => {
              claudeFeedbackService.forceTestMode();
              alert('Test mode force enabled! This will bypass all hard checks.');
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.warning[600],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
          >
            Force Test Mode
          </button>
          <button
            onClick={() => {
              claudeFeedbackService.resetUsage();
              onClose();
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.gray[200],
              color: theme.colors.gray[700],
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.gray[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.gray[200];
            }}
          >
            Reset Usage
          </button>
          <button
            onClick={onClose}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
