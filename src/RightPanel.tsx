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
  onTabChange
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
    { id: 'components' as TabType, label: '🧩 Components', icon: '🧩' },
    { id: 'config' as TabType, label: '⚙️ Config', icon: '⚙️' },
    { id: 'traffic' as TabType, label: '🎛️ Traffic', icon: '🎛️' },
    { id: 'chaos' as TabType, label: '💥 Chaos', icon: '💥' },
    { id: 'metrics' as TabType, label: '📊 Results', icon: '📊' }
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
      width: '480px', 
      backgroundColor: theme.colors.gray[50], 
      borderLeft: `1px solid ${theme.colors.gray[200]}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: theme.colors.white,
        borderBottom: `1px solid ${theme.colors.gray[200]}`,
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: `${theme.spacing.sm} ${theme.spacing.xs}`,
              backgroundColor: activeTab === tab.id ? theme.colors.primary[50] : 'transparent',
              color: activeTab === tab.id ? theme.colors.primary[700] : theme.colors.gray[600],
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.primary[500]}` : '2px solid transparent',
              fontSize: theme.typography.fontSize.xs,
              fontWeight: activeTab === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
              cursor: 'pointer',
              transition: theme.transitions.fast,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing.xs,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = theme.colors.gray[50];
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
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
        flexDirection: 'column'
      }}>
        {renderTabContent()}
      </div>

      {/* Quick Stats Footer */}
      <div style={{
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.white,
        borderTop: `1px solid ${theme.colors.gray[200]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.gray[600]
      }}>
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          <span>📊 {simulationResult?.score || 0}/100</span>
          <span>🎯 {selectedChallenge.title}</span>
        </div>
        <div style={{ 
          color: isSimulating ? theme.colors.primary[600] : theme.colors.gray[500],
          fontWeight: theme.typography.fontWeight.medium
        }}>
          {isSimulating ? '🔄 Simulating...' : '✅ Ready'}
        </div>
      </div>
    </div>
  );
}
