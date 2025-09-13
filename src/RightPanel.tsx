import React, { useState } from 'react';
import { Node } from 'reactflow';
import { Challenge } from './sampleChallenges';
import { SimulationResult } from './simulate';
import { ChaosEvent } from './ChaosEvents';
import { TrafficProfile } from './componentsSchema';
import ComponentPalette from './ComponentPalette';
import { components } from './componentsSchema';
import ComponentConfigPanel from './ComponentConfigPanel';
import TrafficSliders from './TrafficSliders';
import ChaosEvents from './ChaosEvents';
import MetricsPanel from './MetricsPanel';
import { theme } from './styles/theme';

interface RightPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, params: any) => void;
  onDeleteNode: (nodeId: string) => void;
  currentTraffic: TrafficProfile;
  onTrafficChange: (traffic: TrafficProfile) => void;
  onChaosEventTrigger: (event: ChaosEvent) => void;
  onChaosEventStop: (eventId: string) => void;
  activeChaosEvents: ChaosEvent[];
  simulationResult: SimulationResult | null;
  selectedChallenge: Challenge;
  isSimulating: boolean;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  width?: number;
}

type TabType = 'components' | 'config' | 'traffic' | 'chaos' | 'metrics';

export default function RightPanel({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  currentTraffic,
  onTrafficChange,
  onChaosEventTrigger,
  onChaosEventStop,
  activeChaosEvents,
  simulationResult,
  selectedChallenge,
  isSimulating,
  activeTab: externalActiveTab,
  onTabChange,
  width
}: RightPanelProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('components');
  
  // Use external tab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;
  
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const tabs = [
    { id: 'components' as TabType, label: 'Components', icon: '⚙' },
    { id: 'config' as TabType, label: 'Config', icon: '⚙' },
    { id: 'traffic' as TabType, label: 'Traffic', icon: '📊' },
    { id: 'chaos' as TabType, label: 'Chaos', icon: '⚠' },
    { id: 'metrics' as TabType, label: 'Results', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components':
        return <ComponentPalette components={components} />;
      case 'config':
        return (
          <ComponentConfigPanel 
            selectedNode={selectedNode}
            onUpdateNode={onUpdateNode}
            onDeleteNode={onDeleteNode}
          />
        );
      case 'traffic':
        return (
          <TrafficSliders 
            trafficProfile={currentTraffic}
            onTrafficChange={onTrafficChange}
          />
        );
      case 'chaos':
        return (
          <ChaosEvents 
            onEventTrigger={onChaosEventTrigger}
            activeEvents={activeChaosEvents}
            onEventStop={onChaosEventStop}
          />
        );
      case 'metrics':
        return (
          <MetricsPanel 
            simulationResult={simulationResult}
            selectedChallenge={selectedChallenge}
            isSimulating={isSimulating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      width: `${width || 480}px`, 
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', 
      borderLeft: `1px solid #334155`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 70% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: `1px solid #334155`,
        overflowX: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: `${theme.spacing.md} ${theme.spacing.sm}`,
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid #3b82f6` : '2px solid transparent',
              fontSize: theme.typography.fontSize.xs,
              fontWeight: activeTab === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing.xs,
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px' }}>{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {renderTabContent()}
      </div>

      {/* Quick Stats Footer */}
      <div style={{
        padding: theme.spacing.lg,
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: `1px solid #334155`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: theme.typography.fontSize.sm,
        color: '#94a3b8',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', gap: theme.spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: simulationResult?.score >= 80 ? '#10b981' : simulationResult?.score >= 60 ? '#f59e0b' : '#ef4444'
            }} />
            <span>Score: {simulationResult?.score || 0}/100</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3b82f6'
            }} />
            <span>{selectedChallenge.title}</span>
          </div>
        </div>
        <div style={{ 
          color: isSimulating ? '#3b82f6' : '#10b981',
          fontWeight: theme.typography.fontWeight.medium,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isSimulating ? '#3b82f6' : '#10b981',
            animation: isSimulating ? 'pulse 1s infinite' : 'none'
          }} />
          {isSimulating ? 'Simulating...' : 'Ready'}
        </div>
      </div>
    </div>
  );
}
