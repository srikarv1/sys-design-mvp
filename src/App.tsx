import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState,
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
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(360);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(480);
  const isResizingRef = useRef<{ side: 'left' | 'right' | null }>({ side: null });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current.side) return;
      if (isResizingRef.current.side === 'left') {
        const newWidth = Math.max(260, Math.min(560, e.clientX - 24));
        setLeftPanelWidth(newWidth);
      } else if (isResizingRef.current.side === 'right') {
        const windowWidth = window.innerWidth;
        const newWidth = Math.max(360, Math.min(700, windowWidth - e.clientX - 24));
        setRightPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      isResizingRef.current.side = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'none'
      }
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
  }, [reactFlowInstance, setNodes]);

  const getCategoryColor = (category: string) => {
    return theme.colors.components[category as keyof typeof theme.colors.components] || theme.colors.gray[500];
  };

  const addComponentByTypeId = useCallback((typeId: string) => {
    const componentType = components.find(c => c.id === typeId);
    if (!componentType) return;

    const center = reactFlowInstance?.getViewport?.() ? reactFlowInstance.project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }) : { x: 200, y: 200 };

    const newNode: Node = {
      id: `${typeId}-${Date.now()}`,
      type: 'default',
      position: center,
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
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'none'
      }
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
    setActiveRightTab('config');
  }, [reactFlowInstance, setNodes]);

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
    // Auto-switch to config tab when a node is selected
    setActiveRightTab('config');
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

  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    const selected = params.nodes && params.nodes.length > 0 ? params.nodes[0] : null;
    setSelectedNode(selected);
    if (selected) {
      setActiveRightTab('config');
    }
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

  // Handle delete key functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();
          
          // Remove selected nodes
          if (selectedNodes.length > 0) {
            setNodes((nds) => nds.filter(node => !node.selected));
          }
          
          // Remove selected edges
          if (selectedEdges.length > 0) {
            setEdges((eds) => eds.filter(edge => !edge.selected));
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges]);

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
      backgroundColor: theme.colors.secondary[900],
      color: theme.colors.white
    }}>
      {/* Modern Header */}
      <div style={{ 
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`, 
        backgroundColor: theme.colors.secondary[900],
        color: theme.colors.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.colors.secondary[700]}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: theme.colors.primary[600],
            borderRadius: theme.borderRadius.full
          }} />
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              lineHeight: 1.2,
              color: theme.colors.white
            }}>
              System Design Studio
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.secondary[400],
              fontWeight: theme.typography.fontWeight.normal
            }}>
              {gameMode === 'multiplayer' ? `Competing as ${playerName}` : 'Professional System Architecture Training'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
          {/* Progress Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.xs,
            marginRight: theme.spacing.lg
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.secondary[400],
              fontWeight: theme.typography.fontWeight.medium
            }}>
              Progress
            </div>
            <div style={{
              width: '120px',
              height: '6px',
              backgroundColor: theme.colors.secondary[700],
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(100, (nodes.length / 10) * 100)}%`,
                height: '100%',
                backgroundColor: theme.colors.primary[600],
                borderRadius: theme.borderRadius.full,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.secondary[400]
            }}>
              {nodes.length}/10 components
            </div>
          </div>

          <button
            onClick={() => setShowClaudeUsage(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: 'transparent',
              color: theme.colors.secondary[200],
              border: `1px solid ${theme.colors.secondary[700]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer'
            }}
            title="View Claude API usage"
          >
            Claude Usage
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: 'transparent',
              color: theme.colors.secondary[200],
              border: `1px solid ${theme.colors.secondary[700]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer'
            }}
            title="View leaderboard"
          >
            Leaderboard
          </button>

          <button
            onClick={() => setShowWelcome(true)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: 'transparent',
              color: theme.colors.secondary[200],
              border: `1px solid ${theme.colors.secondary[700]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer'
            }}
            title="Start a new session (Ctrl+N)"
          >
            New Session
          </button>
          
          <div style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: 'transparent',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.secondary[400],
            border: `1px solid ${theme.colors.secondary[700]}`
          }}>
            {nodes.length} components • {edges.length} connections
          </div>
          
          <button
            onClick={runSimulation}
            disabled={isSimulating || nodes.length === 0}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              backgroundColor: isSimulating 
                ? theme.colors.secondary[700] 
                : nodes.length === 0 
                  ? theme.colors.secondary[700]
                  : theme.colors.primary[600],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              cursor: isSimulating || nodes.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              opacity: isSimulating || nodes.length === 0 ? 0.7 : 1
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
        backgroundColor: theme.colors.secondary[900],
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius['2xl'],
        boxShadow: 'none',
        overflow: 'hidden',
        border: `1px solid ${theme.colors.secondary[700]}`,
        position: 'relative'
      }}>
        {/* Left Panel - Challenges */}
        <div style={{ 
          width: `${leftPanelWidth}px`, 
          backgroundColor: theme.colors.secondary[900], 
          borderRight: `1px solid ${theme.colors.secondary[700]}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          
          <div style={{
            padding: theme.spacing.xl,
            borderBottom: `1px solid ${theme.colors.secondary[700]}`,
            backgroundColor: theme.colors.secondary[900],
            position: 'relative',
            zIndex: 1
          }}>
            <h2 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.white
            }}>
              Challenges
            </h2>
            <p style={{
              margin: `${theme.spacing.sm} 0 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.secondary[400]
            }}>
              Choose a scenario to design for
            </p>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            <ChallengePanel
              challenges={sampleChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={onChallengeSelect}
            />
          </div>
          {/* Left Resizer */}
          <div
            onMouseDown={(e) => {
              isResizingRef.current.side = 'left';
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
              e.preventDefault();
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: '-4px',
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              background: 'transparent',
              borderRight: `1px solid ${theme.colors.secondary[700]}`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.08)';
              (e.currentTarget as HTMLDivElement).style.borderRightColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              (e.currentTarget as HTMLDivElement).style.borderRightColor = theme.colors.secondary[700];
            }}
            title="Drag to resize"
          />
        </div>

        {/* Center - Canvas */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: theme.colors.secondary[900],
          overflow: 'hidden'
        }}>
          
          <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
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
                onSelectionChange={onSelectionChange}
                fitView
                style={{
                  background: 'transparent'
                }}
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                selectNodesOnDrag={true}
                panOnDrag={[1, 2]}
                zoomOnScroll={true}
                zoomOnPinch={true}
                panOnScroll={false}
                preventScrolling={false}
                deleteKeyCode={['Delete', 'Backspace']}
                multiSelectionKeyCode={['Meta', 'Ctrl']}
              >
                <Background 
                  color={theme.colors.secondary[700]}
                  gap={20}
                  size={1}
                  variant="dots"
                />
                <Controls 
                  style={{
                    background: theme.colors.secondary[800],
                    border: `1px solid ${theme.colors.secondary[700]}`,
                    borderRadius: theme.borderRadius.lg,
                    boxShadow: 'none'
                  }}
                />
              </ReactFlow>
          </div>
          
          {/* Canvas Overlay - Empty State */}
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: theme.colors.secondary[400],
              pointerEvents: 'none',
              zIndex: 2
            }}>
              <h3 style={{
                margin: 0,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.white,
                marginBottom: theme.spacing.sm
              }}>
                Start Building Your System
              </h3>
              <p style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.secondary[400],
                maxWidth: '400px',
                lineHeight: 1.6
              }}>
                Drag components from the palette to begin designing your architecture
              </p>
              <div style={{
                padding: theme.spacing.xl,
                backgroundColor: theme.colors.secondary[900],
                borderRadius: theme.borderRadius.xl,
                border: `1px solid ${theme.colors.secondary[700]}`,
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.white,
                  marginBottom: theme.spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: theme.spacing.sm
                }}>
                  Quick Tips
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.secondary[300],
                  lineHeight: 1.5
                }}>
                  <div>• Double-click to delete</div>
                  <div>• Click to configure</div>
                  <div>• Drag to connect</div>
                  <div>• Press Delete to remove</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabbed Interface */}
        <RightPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onAddComponentClick={addComponentByTypeId}
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
          width={rightPanelWidth}
        />
        {/* Right Resizer */}
        <div
          onMouseDown={(e) => {
            isResizingRef.current.side = 'right';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: `${rightPanelWidth - 4}px`,
            width: '8px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 10,
            borderLeft: `1px solid ${theme.colors.secondary[700]}`
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.08)';
            (e.currentTarget as HTMLDivElement).style.borderLeftColor = theme.colors.primary[600];
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            (e.currentTarget as HTMLDivElement).style.borderLeftColor = theme.colors.secondary[700];
          }}
          title="Drag to resize"
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
