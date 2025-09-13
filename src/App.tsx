import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/global.css';
import { sampleChallenges } from './sampleChallenges';
import { simulate, SimulationResult } from './simulate';
import { components, PlacedComponent, Connection as SystemConnection, TrafficProfile } from './componentsSchema';
import ChallengePanel from './ChallengePanel';
import RightPanel from './RightPanel';
import ChaosEvents, { ChaosEvent } from './ChaosEvents';
import WelcomeScreen from './WelcomeScreen';
import Leaderboard, { LeaderboardEntry } from './Leaderboard';
import { leaderboardService } from './services/leaderboardService';
import ClaudeUsageStats from './ClaudeUsageStats';
import { theme } from './styles/theme';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedChallenge, setSelectedChallenge] = useState(sampleChallenges[0]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentTraffic, setCurrentTraffic] = useState<TrafficProfile>(selectedChallenge.trafficProfile);
  const [activeChaosEvents, setActiveChaosEvents] = useState<ChaosEvent[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer'>('single');
  const [playerName, setPlayerName] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showClaudeUsage, setShowClaudeUsage] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'components' | 'config' | 'traffic' | 'chaos' | 'metrics'>('components');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback((params: Connection) => {
    // Validate connection
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceComponent = sourceNode.data.componentType;
    const targetComponent = targetNode.data.componentType;
    
    if (!sourceComponent || !targetComponent) return;
    
    // Check if connection is allowed
    const isAllowed = sourceComponent.allowedConnections?.includes(targetComponent.id) || false;
    
    const newEdge = {
      ...params,
      id: `${params.source}-${params.target}`,
      style: {
        stroke: isAllowed ? '#27ae60' : '#e74c3c',
        strokeWidth: 2
      },
      animated: isAllowed,
      label: isAllowed ? '' : '❌ Invalid'
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges, nodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type || !reactFlowBounds) {
      return;
    }

    const position = reactFlowInstance?.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    if (!position) return;

    const componentType = components.find(c => c.id === type);
    if (!componentType) return;

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position,
      data: { 
        label: componentType.name,
        componentType: componentType,
        params: { ...componentType.defaultParams }
      },
      style: {
        background: getCategoryColor(componentType.category),
        color: theme.colors.white,
        border: `2px solid ${getCategoryColor(componentType.category)}`,
        borderRadius: theme.borderRadius.lg,
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        minWidth: '120px',
        textAlign: 'center'
      }
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const getCategoryColor = (category: string) => {
    return theme.colors.components[category as keyof typeof theme.colors.components] || theme.colors.gray[500];
  };

  // Submit score to leaderboard
  const submitScore = useCallback((score: number) => {
    if (gameMode === 'multiplayer' && playerName && sessionStartTime) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      
      leaderboardService.addScore({
        playerName,
        score,
        challengeId: selectedChallenge.id,
        challengeName: selectedChallenge.title,
        timeSpent,
        mode: gameMode
      });

      // Update leaderboard
      setLeaderboardEntries(leaderboardService.getLeaderboard());
    }
  }, [gameMode, playerName, sessionStartTime, selectedChallenge]);

  const runSimulation = useCallback(async (traffic?: TrafficProfile) => {
    if (nodes.length === 0) return;
    
    setIsSimulating(true);
    // Auto-navigate to results tab when simulation starts
    setActiveRightTab('metrics');
    
    // Convert React Flow nodes/edges to our system format
    const placedComponents: PlacedComponent[] = nodes.map(node => ({
      id: node.id,
      typeId: node.data.componentType?.id || '',
      params: node.data.params || {},
      position: node.position
    }));

    const systemConnections: SystemConnection[] = edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      fromId: edge.source,
      toId: edge.target,
      protocol: 'http',
      capacity: 1000
    }));

    // Create a modified challenge with the current traffic profile
    const challengeWithTraffic = {
      ...selectedChallenge,
      trafficProfile: traffic || currentTraffic
    };

    try {
      // Run simulation (now async)
      const result = await simulate(challengeWithTraffic, {
        components: placedComponents,
        connections: systemConnections,
        activeChaosEvents
      });

      setSimulationResult(result);
      
      // Submit score to leaderboard if in multiplayer mode
      if (gameMode === 'multiplayer') {
        submitScore(result.score);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      // Set a basic result on error
      setSimulationResult({
        metrics: {
          latency: { p50: 0, p95: 0, p99: 0 },
          throughput: 0,
          availability: 0,
          cost: 0
        },
        score: 0,
        feedback: ['Simulation failed'],
        violations: ['System error occurred'],
        recommendations: ['Please try again'],
        isClaudeAnalysisAvailable: false
      });
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges, selectedChallenge, currentTraffic, activeChaosEvents, gameMode, submitScore]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Delete node on double click
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    // Delete edge on double click
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, []);

  const onUpdateNode = useCallback((nodeId: string, params: any) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, params } }
          : node
      )
    );
  }, [setNodes]);

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const onTrafficChange = useCallback((traffic: TrafficProfile) => {
    setCurrentTraffic(traffic);
    // Auto-run simulation when traffic changes
    if (nodes.length > 0) {
      // Auto-navigate to results tab when traffic simulation starts
      setActiveRightTab('metrics');
      runSimulation(traffic);
    }
  }, [nodes.length, runSimulation]);

  const onChallengeSelect = useCallback((challenge: any) => {
    setSelectedChallenge(challenge);
    setCurrentTraffic(challenge.trafficProfile);
    setSimulationResult(null); // Clear previous results
    setActiveChaosEvents([]); // Clear chaos events
    setSessionStartTime(new Date()); // Reset session timer
  }, []);

  const onChaosEventTrigger = useCallback((event: ChaosEvent) => {
    setActiveChaosEvents(prev => [...prev, event]);
    // Auto-run simulation when chaos event is triggered
    if (nodes.length > 0) {
      // Auto-navigate to results tab when chaos simulation starts
      setActiveRightTab('metrics');
      setTimeout(() => runSimulation(), 100);
    }
  }, [nodes.length, runSimulation]);

  const onChaosEventStop = useCallback((eventId: string) => {
    setActiveChaosEvents(prev => prev.filter(e => e.id !== eventId));
    // Auto-run simulation when chaos event is stopped
    if (nodes.length > 0) {
      // Auto-navigate to results tab when chaos simulation starts
      setActiveRightTab('metrics');
      setTimeout(() => runSimulation(), 100);
    }
  }, [nodes.length, runSimulation]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            if (nodes.length > 0) {
              runSimulation();
            }
            break;
          case 'n':
            event.preventDefault();
            setShowWelcome(true);
            break;
          case 's':
            event.preventDefault();
            // Save current design (placeholder)
            console.log('Save design');
            break;
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected node
        if (selectedNode) {
          setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
          setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
          setSelectedNode(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes.length, runSimulation, selectedNode]);

  // Handle game mode selection
  const handleGameStart = useCallback((mode: 'single' | 'multiplayer', name?: string) => {
    setGameMode(mode);
    if (name) {
      setPlayerName(name);
      leaderboardService.setCurrentPlayer(name);
    }
    setShowWelcome(false);
    setSessionStartTime(new Date());
  }, []);

  // Load leaderboard entries
  React.useEffect(() => {
    setLeaderboardEntries(leaderboardService.getLeaderboard());
    
    // Subscribe to real-time updates
    const unsubscribe = leaderboardService.subscribeToUpdates((entries) => {
      setLeaderboardEntries(entries);
    });

    return unsubscribe;
  }, []);

  if (showWelcome) {
    return <WelcomeScreen onStart={handleGameStart} />;
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: theme.typography.fontFamily.sans.join(', '),
      backgroundColor: theme.colors.gray[50]
    }}>
      {/* Header */}
      <div style={{ 
        padding: `${theme.spacing.md} ${theme.spacing.xl}`, 
        background: `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%)`,
        color: theme.colors.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme.shadows.md,
        borderBottom: `1px solid ${theme.colors.primary[200]}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🏗️
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              lineHeight: 1.2
            }}>
              System Design Simulator
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize.sm,
              opacity: 0.9,
              fontWeight: theme.typography.fontWeight.normal
            }}>
              {gameMode === 'multiplayer' ? `🏆 Competing as ${playerName}` : '🎯 Practice mode - Build, test, and master system architecture'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
          <button
            onClick={() => setShowClaudeUsage(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.white + '20',
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '20';
            }}
            title="View Claude API usage"
          >
            🤖 Claude Usage
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.white + '20',
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '20';
            }}
            title="View leaderboard"
          >
            🏆 Leaderboard
          </button>

          <button
            onClick={() => setShowWelcome(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.white + '20',
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.white + '20';
            }}
            title="Start a new session (Ctrl+N)"
          >
            🆕 New Session
          </button>
          
          <div style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: theme.colors.white + '20',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            {nodes.length} components • {edges.length} connections
          </div>
          
          <button
            onClick={runSimulation}
            disabled={isSimulating || nodes.length === 0}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              backgroundColor: isSimulating 
                ? theme.colors.gray[400] 
                : nodes.length === 0 
                  ? theme.colors.gray[300]
                  : theme.colors.success[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              cursor: isSimulating || nodes.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: theme.shadows.sm,
              transition: theme.transitions.fast,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              opacity: isSimulating || nodes.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSimulating && nodes.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = theme.shadows.md;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSimulating && nodes.length > 0) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.sm;
              }
            }}
            title="Run simulation (Ctrl+R)"
          >
            {isSimulating ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${theme.colors.white}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Simulating...
              </>
            ) : (
              <>
                <span>▶️</span>
                Simulate System
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        backgroundColor: theme.colors.white,
        margin: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.lg,
        overflow: 'hidden'
      }}>
        {/* Left Panel - Challenges */}
        <div style={{ 
          width: '320px', 
          backgroundColor: theme.colors.gray[50], 
          borderRight: `1px solid ${theme.colors.gray[200]}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.gray[200]}`,
            backgroundColor: theme.colors.white
          }}>
            <h2 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900]
            }}>
              🎯 Challenges
            </h2>
            <p style={{
              margin: `${theme.spacing.sm} 0 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600]
            }}>
              Choose a scenario to design for
            </p>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChallengePanel
              challenges={sampleChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={onChallengeSelect}
            />
          </div>
        </div>

        {/* Center - Canvas */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: theme.colors.gray[50]
        }}>
          <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onEdgeDoubleClick={onEdgeDoubleClick}
                fitView
                style={{
                  backgroundColor: theme.colors.gray[50]
                }}
              >
                <Background 
                  color={theme.colors.gray[300]}
                  gap={20}
                  size={1}
                />
                <Controls 
                  style={{
                    backgroundColor: theme.colors.white,
                    border: `1px solid ${theme.colors.gray[200]}`,
                    borderRadius: theme.borderRadius.md,
                    boxShadow: theme.shadows.sm
                  }}
                />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
          
          {/* Canvas Overlay - Empty State */}
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: theme.colors.gray[500],
              pointerEvents: 'none'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: theme.spacing.md
              }}>
                🏗️
              </div>
              <h3 style={{
                margin: 0,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.gray[700]
              }}>
                Start Building Your System
              </h3>
              <p style={{
                margin: `${theme.spacing.sm} 0 0 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.gray[500]
              }}>
                Drag components from the palette to begin designing
              </p>
              <div style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.primary[50],
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary[200]}`
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.gray[900],
                  marginBottom: theme.spacing.xs
                }}>
                  💡 Quick Tips
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: theme.spacing.lg,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.gray[600],
                  lineHeight: 1.5
                }}>
                  <li>Double-click components to delete them</li>
                  <li>Double-click connections to remove them</li>
                  <li>Press Delete key to remove selected component</li>
                  <li>Click components to configure their settings</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabbed Interface */}
        <RightPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          currentTraffic={currentTraffic}
          onTrafficChange={onTrafficChange}
          onChaosEventTrigger={onChaosEventTrigger}
          onChaosEventStop={onChaosEventStop}
          activeChaosEvents={activeChaosEvents}
          simulationResult={simulationResult}
          selectedChallenge={selectedChallenge}
          isSimulating={isSimulating}
          activeTab={activeRightTab}
          onTabChange={setActiveRightTab}
        />
      </div>

      {/* Leaderboard Modal */}
      <Leaderboard
        entries={leaderboardEntries}
        currentPlayerName={playerName}
        isVisible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* Claude Usage Stats Modal */}
      <ClaudeUsageStats
        isVisible={showClaudeUsage}
        onClose={() => setShowClaudeUsage(false)}
      />
    </div>
  );
}
